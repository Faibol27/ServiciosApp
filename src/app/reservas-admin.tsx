import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { getUser } from '@/services/auth.service';
import { obtenerReservasAdmin, completarReserva } from '@/services/reservas.service';
import { colors, maxWidth, spacing } from '@/design/tokens';
import { textStyles } from '@/design/textStyles';
import { Pantalla } from '@/design/Pantalla';
import { Boton, BotonTexto } from '@/design/Botones';
import { BotonVolver } from '@/design/BotonVolver';
import { Aviso } from '@/design/Aviso';
import { EstadoVacio } from '@/design/EstadoVacio';
import { TarjetaReserva } from '@/design/TarjetaReserva';
import { mensajeDeError } from '@/utils/formato';

export default function ReservasAdminScreen() {
  const [reservas, setReservas] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarReservas = async () => {
    setCargando(true);
    try {
      const lista = await obtenerReservasAdmin();
      setReservas(lista);
      setError(null);
    } catch (fallo) {
      setError(mensajeDeError(fallo, 'No pudimos cargar las reservas.'));
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    let montado = true;
    (async () => {
      const usuario = await getUser();
      if (!usuario) {
        router.replace('/login');
        return;
      }
      if (usuario.rol !== 'admin') {
        router.replace('/');
        return;
      }
      if (!montado) return;
      await cargarReservas();
    })();
    return () => { montado = false; };
  }, []);

  const refrescar = async () => {
    setRefrescando(true);
    try {
      await cargarReservas();
    } finally {
      setRefrescando(false);
    }
  };

  const reintentar = async () => {
    setCargando(true);
    try {
      await cargarReservas();
    } finally {
      setCargando(false);
    }
  };

  const porFecha = (a: any, b: any) =>
    `${a?.fecha ?? ''}T${a?.hora ?? ''}`.localeCompare(`${b?.fecha ?? ''}T${b?.hora ?? ''}`);

  const pendientes = reservas.filter((reserva) => reserva.estado === 'pendiente').sort(porFecha);
  const completadas = reservas.filter((reserva) => reserva.estado === 'completada').sort((a, b) => porFecha(b, a));
  const canceladas = reservas.filter((reserva) => reserva.estado === 'cancelada').sort((a, b) => porFecha(b, a));

  const grupos = [
    { titulo: 'Pendientes', items: pendientes },
    { titulo: 'Completadas', items: completadas },
    { titulo: 'Canceladas', items: canceladas },
  ].filter((grupo) => grupo.items.length > 0);

  const handleCompletar = (id: number) => {
    Alert.alert('Completar reserva', '¿Marcar esta reserva como completada?', [
      { text: 'Volver', style: 'cancel' },
      {
        text: 'Completar',
        onPress: async () => {
          try {
            await completarReserva(id);
            await cargarReservas();
            Alert.alert('Reserva completada');
          } catch (fallo) {
            Alert.alert('No pudimos completar la reserva', mensajeDeError(fallo, 'Probá de nuevo en un momento.'));
          }
        },
      },
    ]);
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

  return (
    <Pantalla>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.lg + 4,
          paddingTop: spacing.md,
          paddingBottom: spacing.xxxl,
        }}
        refreshControl={
          <RefreshControl refreshing={refrescando} onRefresh={refrescar} tintColor={colors.brand} colors={[colors.brand]} />
        }
      >
        <View style={{ width: '100%', maxWidth, alignSelf: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <BotonVolver onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
            <Text style={textStyles.h1}>Reservas</Text>
          </View>
          <Text style={[textStyles.bodySmall, { marginTop: spacing.sm, marginLeft: 42 + spacing.md }]}>
            Todos los turnos del negocio.
          </Text>

          {error ? (
            <View style={{ marginTop: spacing.xl }}>
              <Aviso>{error}</Aviso>
              <Boton compacto variante="secundario" onPress={reintentar} style={{ alignSelf: 'flex-start' }}>
                Reintentar
              </Boton>
            </View>
          ) : null}

          {grupos.length === 0 ? (
            <View style={{ marginTop: spacing.xl }}>
              <EstadoVacio
                titulo="No hay reservas registradas"
                descripcion="Los turnos de tus clientes van a aparecer acá."
              />
            </View>
          ) : (
            grupos.map((grupo, indice) => (
              <View
                key={grupo.titulo}
                style={{ marginTop: indice === 0 ? spacing.xl : spacing.xxl }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: spacing.md,
                  }}
                >
                  <Text style={textStyles.label}>{grupo.titulo}</Text>
                  <Text style={textStyles.caption}>{grupo.items.length}</Text>
                </View>

                {grupo.items.map((reserva) => (
                  <TarjetaReserva
                    key={String(reserva.id)}
                    reserva={reserva}
                    mostrarCliente
                    acciones={
                      reserva.estado === 'pendiente' ? (
                        <BotonTexto tono="marca" onPress={() => handleCompletar(reserva.id)}>
                          Completar
                        </BotonTexto>
                      ) : null
                    }
                  />
                ))}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </Pantalla>
  );
}
