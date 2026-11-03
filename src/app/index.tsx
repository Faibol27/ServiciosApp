import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { getUser, logout } from '@/services/auth.service';
import { obtenerServicios, crearServicio, actualizarServicio, eliminarServicio } from '@/services/servicios.service';
import { obtenerReservasCliente, crearReserva, cancelarReserva, completarReserva } from '@/services/reservas.service';
import { programarRecordatorioReserva, cancelarRecordatorioReserva } from '@/services/notificaciones.service';
import { colors, maxWidth, radii, spacing } from '@/design/tokens';
import { textStyles } from '@/design/textStyles';
import { Pantalla } from '@/design/Pantalla';
import { BotonPrimario, BotonSecundario, BotonPeligro } from '@/design/Botones';
import { Aviso } from '@/design/Aviso';
import { EstadoVacio } from '@/design/EstadoVacio';
import { TarjetaServicio } from '@/design/TarjetaServicio';
import { TarjetaReserva } from '@/design/TarjetaReserva';
import { EstadoPill } from '@/design/EstadoPill';
import { HojaInferior } from '@/design/HojaInferior';
import { formatearHora } from '@/utils/formato';

type Pestana = 'servicios' | 'reservas' | 'perfil';

const PESTANAS: Pestana[] = ['servicios', 'reservas', 'perfil'];

export default function IndexScreen() {
  const [servicios, setServicios] = useState<any[]>([]);
  const [reservas, setReservas] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [esAdmin, setEsAdmin] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pestana, setPestana] = useState<Pestana>('servicios');

  const [modalReservaVisible, setModalReservaVisible] = useState(false);
  const [servicioSeleccionado, setServicioSeleccionado] = useState<any>(null);
  const [fecha, setFecha] = useState<Date | null>(null);
  const [hora, setHora] = useState<Date | null>(null);
  const [mostrarDatePicker, setMostrarDatePicker] = useState(false);
  const [mostrarTimePicker, setMostrarTimePicker] = useState(false);
  const [guardandoReserva, setGuardandoReserva] = useState(false);

  const [modalServicioVisible, setModalServicioVisible] = useState(false);
  const [editandoServicio, setEditandoServicio] = useState<any>(null);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [duracion, setDuracion] = useState('');
  const [precio, setPrecio] = useState('');
  const [guardandoServicio, setGuardandoServicio] = useState(false);

  const cargarDatos = useCallback(async () => {
    const [listaServicios, listaReservas] = await Promise.all([
      obtenerServicios(),
      obtenerReservasCliente(),
    ]);
    setServicios(listaServicios);
    setReservas(listaReservas);
  }, []);

  useEffect(() => {
    let montado = true;
    (async () => {
      const usuario = await getUser();
      if (!usuario) {
        router.replace('/login');
        return;
      }
      if (!montado) return;
      setUser(usuario);
      setEsAdmin(usuario.rol === 'admin');
      try {
        await cargarDatos();
        setError(null);
      } catch (fallo) {
        setError('No pudimos cargar los datos.');
      } finally {
        if (montado) setCargando(false);
      }
    })();
    return () => { montado = false; };
  }, [cargarDatos]);

  const refrescar = async () => {
    setRefrescando(true);
    try {
      await cargarDatos();
      setError(null);
    } catch (fallo) {
      setError('No pudimos actualizar los datos.');
    } finally {
      setRefrescando(false);
    }
  };

  const reintentar = async () => {
    setCargando(true);
    try {
      await cargarDatos();
      setError(null);
    } catch (fallo) {
      setError('No pudimos cargar los datos.');
    } finally {
      setCargando(false);
    }
  };

  const confirmarSalida = () => {
    Alert.alert('Cerrar sesión', '¿Querés salir de tu cuenta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Salir',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/login');
        },
      },
    ]);
  };

  const abrirCrearServicio = () => {
    setEditandoServicio(null);
    setNombre(''); setDescripcion(''); setDuracion(''); setPrecio('');
    setModalServicioVisible(true);
  };

  const abrirEditarServicio = (servicio: any) => {
    setEditandoServicio(servicio);
    setNombre(servicio.nombre ?? '');
    setDescripcion(servicio.descripcion ?? '');
    setDuracion(String(servicio.duracion ?? ''));
    setPrecio(String(servicio.precio ?? ''));
    setModalServicioVisible(true);
  };

  const cerrarServicio = () => {
    setModalServicioVisible(false);
    setEditandoServicio(null);
    setNombre(''); setDescripcion(''); setDuracion(''); setPrecio('');
  };

  const handleGuardarServicio = async () => {
    const duracionNumero = Number(duracion);
    const precioNumero = Number(precio);

    if (!nombre.trim() || !descripcion.trim() || !duracion.trim() || !precio.trim()) {
      Alert.alert('Faltan datos', 'Completá todos los campos para guardar el servicio.');
      return;
    }
    if (!Number.isFinite(duracionNumero) || duracionNumero <= 0 || !Number.isFinite(precioNumero) || precioNumero <= 0) {
      Alert.alert('Revisá los números', 'La duración y el precio tienen que ser mayores a cero.');
      return;
    }

    setGuardandoServicio(true);
    try {
      const datos = {
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        duracion: duracionNumero,
        precio: precioNumero,
      };

      if (editandoServicio) {
        await actualizarServicio(editandoServicio.id, datos);
      } else {
        await crearServicio(datos);
      }

      cerrarServicio();
      await cargarServicios();
      Alert.alert(editandoServicio ? 'Servicio actualizado' : 'Servicio creado');
    } catch (fallo) {
      Alert.alert('No pudimos guardar el servicio', 'Probá de nuevo en un momento.');
    } finally {
      setGuardandoServicio(false);
    }
  };

  const cargarServicios = async () => {
    setServicios(await obtenerServicios());
  };

  const handleEliminarServicio = (id: number) => {
    Alert.alert('Eliminar servicio', 'Esta acción no se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await eliminarServicio(id);
            await cargarServicios();
            Alert.alert('Servicio eliminado');
          } catch (fallo) {
            Alert.alert('No pudimos eliminar el servicio', 'Puede que tenga reservas asociadas.');
          }
        },
      },
    ]);
  };

  const recargarReservas = async () => {
    setReservas(await obtenerReservasCliente());
  };

  const handleCancelarReserva = (id: number) => {
    Alert.alert('Cancelar reserva', '¿Querés cancelar esta reserva?', [
      { text: 'Volver', style: 'cancel' },
      {
        text: 'Cancelar reserva',
        style: 'destructive',
        onPress: async () => {
          try {
            await cancelarReserva(id);
            await cancelarRecordatorioReserva(id);
            await recargarReservas();
            Alert.alert('Reserva cancelada');
          } catch (fallo) {
            Alert.alert('No pudimos cancelar la reserva', 'Probá de nuevo en un momento.');
          }
        },
      },
    ]);
  };

  const handleCompletarReserva = (id: number) => {
    Alert.alert('Completar reserva', '¿Marcar esta reserva como completada?', [
      { text: 'Volver', style: 'cancel' },
      {
        text: 'Completar',
        onPress: async () => {
          try {
            await completarReserva(id);
            await recargarReservas();
            Alert.alert('Reserva completada');
          } catch (fallo) {
            Alert.alert('No pudimos completar la reserva', 'Probá de nuevo en un momento.');
          }
        },
      },
    ]);
  };

  const abrirReserva = (servicio: any) => {
    const ahora = new Date();
    setServicioSeleccionado(servicio);
    setFecha(new Date());
    setHora(ahora);
    setMostrarDatePicker(false);
    setMostrarTimePicker(false);
    setModalReservaVisible(true);
  };

  const cerrarReserva = () => {
    setModalReservaVisible(false);
    setServicioSeleccionado(null);
    setFecha(null);
    setHora(null);
    setMostrarDatePicker(false);
    setMostrarTimePicker(false);
  };

  const handleDateChange = (_evento: any, seleccionada?: Date | null) => {
    if (Platform.OS === 'android') setMostrarDatePicker(false);
    if (seleccionada) setFecha(seleccionada);
  };

  const handleTimeChange = (_evento: any, seleccionada?: Date | null) => {
    if (Platform.OS === 'android') setMostrarTimePicker(false);
    if (seleccionada) setHora(seleccionada);
  };

  const handleReservar = async () => {
    if (!servicioSeleccionado || !fecha || !hora) {
      Alert.alert('Faltan datos', 'Elegí una fecha y una hora para la reserva.');
      return;
    }

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    if (fecha <= hoy) {
      Alert.alert('Fecha inválida', 'Elegí una fecha futura.');
      return;
    }

    setGuardandoReserva(true);
    try {
      const fechaStr = fecha.toISOString().split('T')[0];
      const horaStr = formatearHora(hora);
      const reservaCreada = await crearReserva(servicioSeleccionado.id, fechaStr, horaStr);
      await programarRecordatorioReserva({
        reservaId: reservaCreada.id,
        servicioNombre: servicioSeleccionado.nombre,
        fechaStr,
        horaStr,
      });
      cerrarReserva();
      setPestana('reservas');
      await recargarReservas();
      Alert.alert('Reserva creada', 'Quedó pendiente de confirmación.');
    } catch (fallo: any) {
      Alert.alert('No pudimos crear la reserva', fallo.message ?? 'Probá de nuevo en un momento.');
    } finally {
      setGuardandoReserva(false);
    }
  };

  if (cargando) {
    return (
      <Pantalla>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md }}>
          <ActivityIndicator color={colors.brand} size="large" />
          <Text style={textStyles.bodySmall}>Cargando…</Text>
        </View>
      </Pantalla>
    );
  }

  const nombreUsuario = typeof user?.nombre === 'string' ? user.nombre.split(' ')[0] : '';
  const titulo = pestana === 'servicios' ? 'Servicios' : pestana === 'reservas' ? 'Mis reservas' : 'Perfil';
  const mensajePestana =
    pestana === 'servicios'
      ? 'Elegí un servicio y reservá el horario que te quede bien.'
      : pestana === 'reservas'
        ? 'Tus reservas y el estado de cada una.'
        : 'Bienvenido a tu perfil';

  const reservasOrdenadas = [...reservas].sort((a, b) => a.fecha.localeCompare(b.fecha));

  const fechaMostrar = fecha ? fecha.toLocaleDateString() : 'Seleccionar fecha';
  const horaMostrar = hora ? formatearHora(hora) : 'Seleccionar hora';

  return (
    <Pantalla>
      {/* Navbar */}
      <View style={{ backgroundColor: colors.brand, paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <View style={{ width: 26, height: 26, borderRadius: radii.md, backgroundColor: colors.brandSoft, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: colors.brand, fontWeight: '700', fontSize: 14 }}>{user?.nombre?.charAt(0) ?? 'S'}</Text>
          </View>
          <View style={{ marginLeft: spacing.sm }}>
            <Text style={[textStyles.tab, { color: colors.ink, fontWeight: '700' }]}>Hola, {nombreUsuario || 'de nuevo'}</Text>
            {esAdmin ? (
              <View style={{ marginTop: 2, alignSelf: 'flex-start' }}>
                <Text style={{ fontSize: 10, lineHeight: 14, fontWeight: '700', color: colors.brand, backgroundColor: colors.brandSoft, paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 }}>Administrador</Text>
              </View>
            ) : null}
          </View>
        </View>
        <View style={{ marginTop: spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={[textStyles.h1, { marginTop: 2 }]}>{titulo}</Text>
          <BotonSecundario tono="muted" onPress={confirmarSalida}>Salir</BotonSecundario>
        </View>
        <Text style={[textStyles.bodySmall, { marginTop: spacing.sm, maxWidth: 330 }]}>{mensajePestana}</Text>
      </View>

      {/* Pestañas */}
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: colors.track,
          borderRadius: 14,
          padding: 4,
          marginHorizontal: spacing.lg,
          marginTop: spacing.md,
        }}
      >
        {PESTANAS.map((valor) => {
          const activa = pestana === valor;
          return (
            <TouchableOpacity
              key={valor}
              accessibilityRole="tab"
              accessibilityState={{ selected: activa }}
              activeOpacity={0.8}
              onPress={() => setPestana(valor)}
              style={{
                flex: 1,
                height: 38,
                borderRadius: 10,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: activa ? colors.surface : 'transparent',
              }}
            >
              <Text style={[textStyles.tab, { color: activa ? colors.ink : colors.muted }]}>
                {valor === 'servicios' ? 'Servicios' : valor === 'reservas' ? 'Mis reservas' : 'Perfil'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.lg + 4, paddingTop: spacing.lg, paddingBottom: spacing.xxxl }}
        refreshControl={<RefreshControl refreshing={refrescando} onRefresh={refrescar} tintColor={colors.brand} colors={[colors.brand]} />}
      >
        <View style={{ width: '100%', maxWidth, alignSelf: 'center' }}>
          {esAdmin ? (
            <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
              {pestana === 'servicios' ? (
                <View style={{ flex: 1 }}>
                  <BotonPrimario compacto onPress={abrirCrearServicio}>Nuevo servicio</BotonPrimario>
                </View>
              ) : null}
              <View style={{ flex: 1 }}>
                <BotonSecundario tono="muted" compacto onPress={() => router.push('/reservas-admin')}>Todas las reservas</BotonSecundario>
              </View>
            </View>
          ) : null}

          {error ? (
            <View style={{ marginTop: spacing.lg }}>
              <Aviso>{error}</Aviso>
              <BotonSecundario tono="muted" onPress={reintentar} style={{ alignSelf: 'flex-start' }}>Reintentar</BotonSecundario>
            </View>
          ) : null}

          {pestana === 'servicios' ? (
            <View style={{ marginTop: spacing.lg }}>
              {servicios.length === 0 ? (
                <EstadoVacio
                  titulo="Todavía no hay servicios"
                  descripcion={esAdmin ? 'Creá el primero con el botón Nuevo servicio.' : 'Cuando el negocio agregue servicios, van a aparecer acá.'}
                />
              ) : (
                servicios.map((servicio) => (
                  <TarjetaServicio
                    key={String(servicio.id)}
                    servicio={servicio}
                    acciones={
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                        {esAdmin ? (
                          <>
                            <BotonSecundario tono="muted" compacto onPress={() => abrirEditarServicio(servicio)}>Editar</BotonSecundario>
                            <BotonPeligro tono="peligro" compacto onPress={() => handleEliminarServicio(servicio.id)}>Eliminar</BotonPeligro>
                          </>
                        ) : null}
                        <BotonPrimario compacto onPress={() => abrirReserva(servicio)} style={{ marginLeft: 2 }}>Reservar</BotonPrimario>
                      </View>
                    }
                  />
                ))
              )}
            </View>
          ) : pestana === 'reservas' ? (
            <View style={{ marginTop: spacing.lg }}>
              {reservasOrdenadas.length === 0 ? (
                <EstadoVacio
                  titulo="Todavía no tenés reservas"
                  descripcion="Elegí un servicio y reservá tu primer turno."
                />
              ) : (
                reservasOrdenadas.map((reserva) => (
                  <TarjetaReserva
                    key={String(reserva.id)}
                    reserva={reserva}
                    acciones={
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                        {reserva.estado === 'pendiente' ? (
                          <>
                            {esAdmin ? (
                              <BotonSecundario tono="marca" compacto onPress={() => handleCompletarReserva(reserva.id)}>Completar</BotonSecundario>
                            ) : null}
                            <BotonPeligro tono="peligro" compacto onPress={() => handleCancelarReserva(reserva.id)}>Cancelar</BotonPeligro>
                          </>
                        ) : null}
                      </View>
                    }
                  />
                ))
              )}
            </View>
          ) : (
            <View style={{ marginTop: spacing.lg, alignItems: 'center' }}>
              <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: colors.brandSoft, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg }}>
                <Text style={{ color: colors.brand, fontWeight: '700', fontSize: 32 }}>{user?.nombre?.charAt(0) ?? '?'}</Text>
              </View>
              <Text style={[textStyles.serviceName, { textAlign: 'center' }]}>{user?.nombre ?? 'Usuario'}</Text>
              <Text style={[textStyles.bodySmall, { color: colors.muted, textAlign: 'center', marginTop: spacing.xs }]}>{user?.email ?? ''}</Text>
              <View style={{ marginTop: spacing.lg }}>
                <BotonPrimario onPress={confirmarSalida}>Cerrar sesión</BotonPrimario>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Hoja inferior: servicio (crear/editar) */}
      <HojaInferior
        visible={modalServicioVisible}
        onCerrar={cerrarServicio}
      >
        <View style={{ marginBottom: spacing.lg }}>
          <Text style={[textStyles.label, { marginBottom: spacing.sm }]}>{editandoServicio ? 'Editar servicio' : 'Nuevo servicio'}</Text>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <View style={{ flex: 1 }}>
              <Text style={[textStyles.label, { marginBottom: spacing.xs }]}>Nombre</Text>
              <TextInput
                style={{ height: 48, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, paddingHorizontal: spacing.sm, backgroundColor: colors.surface, color: colors.ink }}
                value={nombre}
                onChangeText={setNombre}
                placeholder="Nombre del servicio"
                autoCapitalize="words"
              />
            </View>
          </View>
          <View style={{ marginTop: spacing.lg }}>
            <Text style={[textStyles.label, { marginBottom: spacing.xs }]}>Descripción</Text>
            <TextInput
              style={{ height: 88, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, paddingHorizontal: spacing.sm, paddingTop: spacing.sm, backgroundColor: colors.surface, color: colors.ink }}
              value={descripcion}
              onChangeText={setDescripcion}
              placeholder="Descripción"
              multiline
            />
          </View>
          <View style={{ marginTop: spacing.lg, flexDirection: 'row', gap: spacing.sm }}>
            <View style={{ flex: 1 }}>
              <Text style={[textStyles.label, { marginBottom: spacing.xs }]}>Duración (min)</Text>
              <TextInput
                style={{ height: 48, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, paddingHorizontal: spacing.sm, backgroundColor: colors.surface, color: colors.ink }}
                value={duracion}
                onChangeText={setDuracion}
                placeholder="30"
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[textStyles.label, { marginBottom: spacing.xs }]}>Precio</Text>
              <TextInput
                style={{ height: 48, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, paddingHorizontal: spacing.sm, backgroundColor: colors.surface, color: colors.ink }}
                value={precio}
                onChangeText={setPrecio}
                placeholder="50000"
                keyboardType="numeric"
              />
            </View>
          </View>
          <View style={{ marginTop: spacing.xl, flexDirection: 'row', gap: spacing.sm }}>
            <TouchableOpacity
              onPress={cerrarServicio}
              style={{ flex: 1, height: 50, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={[textStyles.button, { color: colors.muted }]}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleGuardarServicio}
              disabled={guardandoServicio}
              style={{ flex: 1, height: 50, backgroundColor: colors.brand, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center', opacity: guardandoServicio ? 0.6 : 1 }}
            >
              <Text style={[textStyles.button, { color: colors.white }]}>{guardandoServicio ? 'Guardando…' : editandoServicio ? 'Guardar' : 'Crear'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </HojaInferior>

      {/* Hoja inferior: reserva */}
      <HojaInferior
        visible={modalReservaVisible}
        onCerrar={cerrarReserva}
      >
        <View style={{ marginBottom: spacing.lg }}>
          <Text style={[textStyles.label, { marginBottom: spacing.sm }]}>Reservar servicio</Text>
          <View style={{ marginBottom: spacing.lg }}>
            <Text style={[textStyles.label, { marginBottom: spacing.xs }]}>Servicio</Text>
            <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, paddingHorizontal: spacing.sm, height: 48, justifyContent: 'center', backgroundColor: colors.surface }}>
              <Text style={{ color: colors.ink, fontSize: 15 }}>{servicioSeleccionado?.nombre ?? ''}</Text>
            </View>
          </View>
          <View style={{ marginBottom: spacing.lg }}>
            <Text style={[textStyles.label, { marginBottom: spacing.xs }]}>Fecha</Text>
            <TouchableOpacity
              onPress={() => setMostrarDatePicker(true)}
              style={{ borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, paddingHorizontal: spacing.sm, height: 48, justifyContent: 'center', backgroundColor: colors.surface }}
            >
              <Text style={{ color: colors.ink, fontSize: 15 }}>{fechaMostrar}</Text>
            </TouchableOpacity>
            {mostrarDatePicker && (
              <DateTimePicker
                value={fecha || new Date()}
                mode="date"
                display="default"
                onChange={handleDateChange}
                style={{ width: '100%', marginTop: spacing.sm }}
              />
            )}
          </View>
          <View>
            <Text style={[textStyles.label, { marginBottom: spacing.xs }]}>Hora</Text>
            <TouchableOpacity
              onPress={() => setMostrarTimePicker(true)}
              style={{ borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, paddingHorizontal: spacing.sm, height: 48, justifyContent: 'center', backgroundColor: colors.surface }}
            >
              <Text style={{ color: colors.ink, fontSize: 15 }}>{horaMostrar}</Text>
            </TouchableOpacity>
            {mostrarTimePicker && (
              <DateTimePicker
                value={hora || new Date()}
                mode="time"
                display="default"
                onChange={handleTimeChange}
                style={{ width: '100%', marginTop: spacing.sm }}
              />
            )}
          </View>
          <View style={{ marginTop: spacing.xl, flexDirection: 'row', gap: spacing.sm }}>
            <TouchableOpacity
              onPress={cerrarReserva}
              style={{ flex: 1, height: 50, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={[textStyles.button, { color: colors.muted }]}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleReservar}
              disabled={guardandoReserva || !fecha || !hora}
              style={{ flex: 1, height: 50, backgroundColor: colors.brand, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center', opacity: guardandoReserva || !fecha || !hora ? 0.6 : 1 }}
            >
              <Text style={[textStyles.button, { color: colors.white }]}>{guardandoReserva ? 'Reservando…' : 'Reservar'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </HojaInferior>
    </Pantalla>
  );
}
