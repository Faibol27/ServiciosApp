import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Modal, TextInput, ScrollView, FlatList } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { obtenerServicios, crearServicio, actualizarServicio, eliminarServicio } from '@/services/servicios.service';
import { login, getUser, logout } from '@/services/auth.service';
import { obtenerReservasCliente, crearReserva, cancelarReserva, completarReserva } from '@/services/reservas.service';

export default function IndexScreen() {
  const [servicios, setServicios] = useState<any[]>([]);
  const [reservas, setReservas] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [esAdmin, setEsAdmin] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [pestaña, setPestaña] = useState<'servicios' | 'reservas'>('servicios');

  const [modalReservaVisible, setModalReservaVisible] = useState(false);
  const [servicioSeleccionado, setServicioSeleccionado] = useState<any>(null);
  const [fecha, setFecha] = useState<Date | null>(null);
  const [hora, setHora] = useState('');
  const [mostrarDatePicker, setMostrarDatePicker] = useState(false);
  const [guardandoReserva, setGuardandoReserva] = useState(false);

  const [modalServicioVisible, setModalServicioVisible] = useState(false);
  const [editandoServicio, setEditandoServicio] = useState<any>(null);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [duracion, setDuracion] = useState('');
  const [precio, setPrecio] = useState('');
  const [guardandoServicio, setGuardandoServicio] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const u = await getUser();
      if (!u) {
        router.replace('/login');
        return;
      }
      setUser(u);
      setEsAdmin(u.rol === 'admin');
      if (mounted) {
        setCargando(true);
        try {
          const lista = await obtenerServicios();
          if (mounted) setServicios(lista);

          const listaReservas = await obtenerReservasCliente();
          if (mounted) setReservas(listaReservas);
        } catch (e: unknown) {
          if (mounted) {
            const err = e as { name?: string; message?: string };
            setError(err.name === 'ApiError' ? (err.message ?? 'Error al cargar') : 'Error al cargar');
          }
        } finally {
          if (mounted) setCargando(false);
        }
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleLoginAdmin = async () => {
    try {
      await login({ email: 'admin@test.com', password: '123456' });
      const u = await getUser();
      setUser(u);
      setEsAdmin(u?.rol === 'admin');
      setPestaña('servicios');
      Alert.alert('Éxito', 'Sesión de administrador iniciada');
    } catch (e: unknown) {
      const err = e as { message?: string };
      Alert.alert('Error', err.message ?? 'Error inesperado');
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const cargarServicios = async () => {
    const lista = await obtenerServicios();
    setServicios(lista);
  };

  const abrirCrearServicio = () => {
    setEditandoServicio(null);
    setNombre(''); setDescripcion(''); setDuracion(''); setPrecio('');
    setModalServicioVisible(true);
  };

  const abrirEditarServicio = (s: any) => {
    setEditandoServicio(s);
    setNombre(s.nombre); setDescripcion(s.descripcion);
    setDuracion(String(s.duracion)); setPrecio(String(s.precio));
    setModalServicioVisible(true);
  };

  const cerrarServicio = () => {
    setModalServicioVisible(false);
    setEditandoServicio(null);
    setNombre(''); setDescripcion(''); setDuracion(''); setPrecio('');
  };

  const handleGuardarServicio = async () => {
    if (!nombre.trim() || !descripcion.trim() || !duracion || !precio) {
      Alert.alert('Error', 'Completar todos los campos');
      return;
    }
    const d = Number(duracion);
    const p = Number(precio);
    if (isNaN(d) || isNaN(p) || d <= 0 || p <= 0) {
      Alert.alert('Error', 'Duración y precio deben ser números positivos');
      return;
    }
    setGuardandoServicio(true);
    try {
      if (editandoServicio) {
        await actualizarServicio(editandoServicio.id, { nombre, descripcion, duracion: d, precio: p });
        Alert.alert('Éxito', 'Servicio actualizado');
      } else {
        await crearServicio({ nombre, descripcion, duracion: d, precio: p });
        Alert.alert('Éxito', 'Servicio creado');
      }
      cerrarServicio();
      await cargarServicios();
    } catch (e: unknown) {
      const err = e as { name?: string; message?: string };
      Alert.alert('Error', err.name === 'ApiError' ? (err.message ?? 'No se pudo guardar') : 'Error al guardar');
    } finally {
      setGuardandoServicio(false);
    }
  };

  const handleEliminarServicio = async (id: number) => {
    Alert.alert('Confirmar', '¿Eliminar este servicio?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Sí, eliminar', style: 'destructive',
        onPress: async () => {
          try {
            await eliminarServicio(id);
            await cargarServicios();
            Alert.alert('Éxito', 'Servicio eliminado');
          } catch (e: unknown) {
            const err = e as { name?: string; message?: string };
            Alert.alert('Error', err.name === 'ApiError' ? (err.message ?? 'No se pudo eliminar') : 'Error al eliminar');
          }
        },
      },
    ]);
  };

  const recargarReservas = async () => {
    try {
      const lista = await obtenerReservasCliente();
      setReservas(lista);
    } catch {
    }
  };

  const handleCancelarReserva = async (id: number) => {
    Alert.alert('Confirmar', '¿Cancelar esta reserva?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Sí, cancelar', style: 'destructive',
        onPress: async () => {
          try {
            await cancelarReserva(id);
            await recargarReservas();
            Alert.alert('Éxito', 'Reserva cancelada');
          } catch (e: unknown) {
            const err = e as { name?: string; message?: string };
            Alert.alert('Error', err.name === 'ApiError' ? (err.message ?? 'No se pudo cancelar') : 'Error al cancelar');
          }
        },
      },
    ]);
  };

  const handleCompletarReserva = async (id: number) => {
    Alert.alert('Confirmar', '¿Marcar esta reserva como completada?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Sí, completar', style: 'destructive',
        onPress: async () => {
          try {
            await completarReserva(id);
            await recargarReservas();
            Alert.alert('Éxito', 'Reserva completada');
          } catch (e: unknown) {
            const err = e as { name?: string; message?: string };
            Alert.alert('Error', err.name === 'ApiError' ? (err.message ?? 'No se pudo completar') : 'Error al completar');
          }
        },
      },
    ]);
  };

  const abrirReserva = (servicio: any) => {
    setServicioSeleccionado(servicio);
    setFecha(null);
    setHora('');
    setMostrarDatePicker(false);
    setModalReservaVisible(true);
  };

  const cerrarReserva = () => {
    setModalReservaVisible(false);
    setServicioSeleccionado(null);
    setFecha(null);
    setHora('');
    setMostrarDatePicker(false);
  };

  const handleDateChange = (event: any, selectedDate?: Date | null) => {
    const currentDate = selectedDate || fecha;
    setFecha(currentDate);
    setMostrarDatePicker(false);
  };

  const handleReservar = async () => {
    if (!servicioSeleccionado || !fecha || !hora) {
      Alert.alert('Error', 'Seleccioná fecha y hora');
      return;
    }
    const fechaStr = fecha.toISOString().split('T')[0];
    setGuardandoReserva(true);
    try {
      await crearReserva(servicioSeleccionado.id, fechaStr, hora);
      cerrarReserva();
      Alert.alert('Éxito', 'Reserva creada (estado: pendiente)');
      await recargarReservas();
    } catch (e: unknown) {
      const err = e as { name?: string; message?: string };
      Alert.alert('Error', err.name === 'ApiError' ? (err.message ?? 'No se pudo crear la reserva') : 'Error al crear');
    } finally {
      setGuardandoReserva(false);
    }
  };

  const fechaMostrar = fecha ? fecha.toLocaleDateString() : 'Seleccionar fecha';

  const colorEstado = (estado: string) => {
    if (estado === 'pendiente') return '#2563eb';
    if (estado === 'completada') return '#16a34a';
    if (estado === 'cancelada') return '#dc2626';
    return '#6b7280';
  };

  if (cargando && !user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 12 }}>Cargando...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#fff' }}
      keyboardVerticalOffset={90}
    >
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40, alignItems: 'center' }} keyboardShouldPersistTaps="handled">
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, width: '100%' }}>
          <Text style={{ fontSize: 24, fontWeight: '700', color: '#111827' }}>Servicios</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {esAdmin && (
              <TouchableOpacity onPress={() => router.push('/reservas-admin' as any)} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: '#2563eb' }}>
                <Text style={{ color: '#2563eb', fontWeight: '600', fontSize: 14 }}>Todas las Reservas</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleLogout} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: '#dc2626' }}>
              <Text style={{ color: '#dc2626', fontWeight: '600', fontSize: 14 }}>Cerrar sesión</Text>
            </TouchableOpacity>
          </View>
        </View>

        {error && (
          <View style={{ backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca', padding: 12, borderRadius: 8, marginBottom: 24, alignItems: 'center', width: '100%' }}>
            <Text style={{ color: '#dc2626', textAlign: 'center' }}>{error}</Text>
          </View>
        )}

        <View style={{ flexDirection: 'row', marginBottom: 24, borderBottomWidth: 1, borderBottomColor: '#eee', width: '100%' }}>
          <TouchableOpacity
            onPress={() => setPestaña('servicios')}
            style={{ flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: pestaña === 'servicios' ? '#2563eb' : 'transparent' }}
          >
            <Text style={{ fontWeight: '600', color: pestaña === 'servicios' ? '#2563eb' : '#6b7280', fontSize: 16 }}>Servicios</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setPestaña('reservas')}
            style={{ flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: pestaña === 'reservas' ? '#2563eb' : 'transparent' }}
          >
            <Text style={{ fontWeight: '600', color: pestaña === 'reservas' ? '#2563eb' : '#6b7280', fontSize: 16 }}>Mis Reservas</Text>
          </TouchableOpacity>
        </View>

        {pestaña === 'servicios' && (
          <>
            {esAdmin && (
              <View style={{ width: '100%', maxWidth: 420, alignSelf: 'center', marginBottom: 24 }}>
                <TouchableOpacity onPress={abrirCrearServicio} style={{ backgroundColor: '#2563eb', paddingVertical: 14, borderRadius: 8, alignItems: 'center' }}>
                  <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>Crear Servicio</Text>
                </TouchableOpacity>
              </View>
            )}

            {servicios.length === 0 ? (
              <View style={{ padding: 48, alignItems: 'center' }}>
                <Text style={{ fontSize: 16, color: '#6b7280', marginBottom: 4 }}>No hay servicios todavía</Text>
                {esAdmin && <Text style={{ fontSize: 13, color: '#9ca3af' }}>Presiona Crear Servicio para agregar uno</Text>}
              </View>
            ) : (
              servicios.map((s) => (
                <View
                  key={String(s.id)}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 14,
                    backgroundColor: '#fafafa',
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: '#eee',
                    marginBottom: 14,
                    width: '100%',
                    maxWidth: 420,
                    alignSelf: 'center',
                  }}
                >
                  <View style={{ flex: 1, marginRight: 12 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 2, color: '#111827' }}>{s.nombre}</Text>
                    <Text style={{ fontSize: 13, color: '#6b7280' }}>{'$' + s.precio + ' ' + s.duracion + ' min'}</Text>
                    <Text style={{ fontSize: 13, color: '#6b7280' }}>{s.descripcion}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    <TouchableOpacity onPress={() => abrirReserva(s)} style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 6, backgroundColor: '#2563eb' }}>
                      <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>Reservar</Text>
                    </TouchableOpacity>
                    {esAdmin && (
                      <>
                        <TouchableOpacity onPress={() => abrirEditarServicio(s)} style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 4, backgroundColor: '#e0e0e0' }}>
                          <Text style={{ fontSize: 12, fontWeight: '600', color: '#333' }}>Editar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleEliminarServicio(s.id)} style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 4, backgroundColor: '#fee2e2' }}>
                          <Text style={{ fontSize: 12, fontWeight: '600', color: '#333' }}>Borrar</Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </View>
              ))
            )}
          </>
        )}

        {pestaña === 'reservas' && (
          <>
            {reservas.length === 0 ? (
              <View style={{ padding: 48, alignItems: 'center' }}>
                <Text style={{ fontSize: 16, color: '#6b7280' }}>No tenés reservas todavía</Text>
              </View>
            ) : (
              reservas.map((item) => (
                <View
                  key={String(item.id)}
                  style={{ backgroundColor: '#fafafa', borderWidth: 1, borderColor: '#eee', borderRadius: 8, padding: 14, marginBottom: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: 420, alignSelf: 'center' }}
                >
                  <View>
                    <Text style={{ fontSize: 15, fontWeight: '600', color: '#111827' }}>{item.servicio?.nombre ?? 'Servicio'}</Text>
                    <Text style={{ fontSize: 13, color: '#6b7280' }}>{item.fecha ? new Date(item.fecha).toLocaleDateString() : '-'} - {item.hora}</Text>
                    <Text style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>Usuario ID: {item.usuarioId}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: colorEstado(item.estado), textTransform: 'uppercase', marginBottom: 6 }}>{item.estado}</Text>
                    {item.estado === 'pendiente' && (
                      <>
                        {esAdmin ? (
                          <TouchableOpacity onPress={() => handleCompletarReserva(item.id)} style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 4, backgroundColor: '#16a34a' }}>
                            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 12 }}>Completar</Text>
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity onPress={() => handleCancelarReserva(item.id)} style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, backgroundColor: '#fee2e2' }}>
                            <Text style={{ color: '#dc2626', fontWeight: '600', fontSize: 12 }}>Cancelar</Text>
                          </TouchableOpacity>
                        )}
                      </>
                    )}
                  </View>
                </View>
              ))
            )}
          </>
        )}

      </ScrollView>

      {esAdmin && (
        <Modal
          visible={modalServicioVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={cerrarServicio}
        >
          <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 16 }} onPress={cerrarServicio} activeOpacity={1}>
            <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 20, maxHeight: '85%', width: '90%' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827' }}>{editandoServicio ? 'Editar Servicio' : 'Nuevo Servicio'}</Text>
                <TouchableOpacity onPress={cerrarServicio}>
                  <Text style={{ fontSize: 22, color: '#9ca3af', padding: 4 }}>x</Text>
                </TouchableOpacity>
              </View>

              <View style={{ marginBottom: 14 }}>
                <Text style={{ fontSize: 13, fontWeight: '500', marginBottom: 6, color: '#374151' }}>Nombre</Text>
                <TextInput
                  style={{ height: 44, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 6, paddingHorizontal: 12, fontSize: 15, backgroundColor: '#fff', color: '#111827' }}
                  value={nombre}
                  onChangeText={setNombre}
                  placeholder="Nombre del servicio"
                  autoCapitalize="words"
                />
              </View>

              <View style={{ marginBottom: 14 }}>
                <Text style={{ fontSize: 13, fontWeight: '500', marginBottom: 6, color: '#374151' }}>Descripción</Text>
                <TextInput
                  style={{ height: 44, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 6, paddingHorizontal: 12, fontSize: 15, backgroundColor: '#fff', color: '#111827' }}
                  value={descripcion}
                  onChangeText={setDescripcion}
                  placeholder="Descripción"
                  multiline
                  textAlignVertical="top"
                />
              </View>

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '500', marginBottom: 6, color: '#374151' }}>Duración (min)</Text>
                  <TextInput
                    style={{ height: 44, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 6, paddingHorizontal: 12, fontSize: 15, backgroundColor: '#fff', color: '#111827' }}
                    value={duracion}
                    onChangeText={setDuracion}
                    placeholder="30"
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '500', marginBottom: 6, color: '#374151' }}>Precio</Text>
                  <TextInput
                    style={{ height: 44, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 6, paddingHorizontal: 12, fontSize: 15, backgroundColor: '#fff', color: '#111827' }}
                    value={precio}
                    onChangeText={setPrecio}
                    placeholder="50000"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <TouchableOpacity onPress={cerrarServicio} style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 6, backgroundColor: '#e5e7eb' }}>
                  <Text style={{ color: '#374151', fontWeight: '600', fontSize: 14 }}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleGuardarServicio} style={{ backgroundColor: '#2563eb', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 6, opacity: guardandoServicio ? 0.6 : 1 }} disabled={guardandoServicio}>
                  {guardandoServicio ? <ActivityIndicator color="#fff" size="small" /> : <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>{editandoServicio ? 'Guardar' : 'Crear'}</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      <Modal
        visible={modalReservaVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={cerrarReserva}
      >
        <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 16 }} onPress={cerrarReserva} activeOpacity={1}>
          <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 20, maxHeight: '85%', width: '90%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827' }}>Reservar Servicio</Text>
              <TouchableOpacity onPress={cerrarReserva}>
                <Text style={{ fontSize: 22, color: '#9ca3af', padding: 4 }}>x</Text>
              </TouchableOpacity>
            </View>

            <View style={{ marginBottom: 14 }}>
              <Text style={{ fontSize: 13, fontWeight: '500', marginBottom: 6, color: '#374151' }}>Servicio</Text>
              <View style={{ borderWidth: 1, borderColor: '#d1d5db', borderRadius: 6, paddingHorizontal: 12, height: 44, justifyContent: 'center', backgroundColor: '#fff' }}>
                <Text style={{ color: '#111827', fontSize: 15 }}>{servicioSeleccionado?.nombre ?? ''}</Text>
              </View>
            </View>

            <View style={{ marginBottom: 14 }}>
              <Text style={{ fontSize: 13, fontWeight: '500', marginBottom: 6, color: '#374151' }}>Fecha</Text>
              <TouchableOpacity
                onPress={() => setMostrarDatePicker(true)}
                style={{ borderWidth: 1, borderColor: '#d1d5db', borderRadius: 6, paddingHorizontal: 12, height: 44, justifyContent: 'center', backgroundColor: '#fff' }}
              >
                <Text style={{ color: '#111827', fontSize: 15 }}>{fechaMostrar}</Text>
              </TouchableOpacity>
              {mostrarDatePicker && (
                <DateTimePicker
                  value={fecha || new Date()}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  style={{ width: '100%', marginTop: 8 }}
                />
              )}
            </View>

            <View style={{ marginBottom: 14 }}>
              <Text style={{ fontSize: 13, fontWeight: '500', marginBottom: 6, color: '#374151' }}>Hora (HH:MM)</Text>
              <TextInput
                style={{ height: 44, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 6, paddingHorizontal: 12, fontSize: 15, backgroundColor: '#fff', color: '#111827' }}
                value={hora}
                onChangeText={setHora}
                placeholder="10:00"
                keyboardType="default"
              />
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
              <TouchableOpacity onPress={cerrarReserva} style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 6, backgroundColor: '#e5e7eb' }}>
                <Text style={{ color: '#374151', fontWeight: '600', fontSize: 14 }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleReservar} style={{ backgroundColor: '#2563eb', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 6, opacity: guardandoReserva ? 0.6 : 1 }} disabled={guardandoReserva}>
                {guardandoReserva ? <ActivityIndicator color="#fff" size="small" /> : <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>Reservar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}
