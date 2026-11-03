import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { getUser } from '@/services/auth.service';
import { obtenerReservasCliente, cancelarReserva, completarReserva } from '@/services/reservas.service';
import { colors, maxWidth, spacing } from '@/design/tokens';
import { textStyles } from '@/design/textStyles';
import { Pantalla } from '@/design/Pantalla';
import { Boton, BotonPeligro, BotonSecundario, BotonTexto } from '@/design/Botones';
import { BotonVolver } from '@/design/BotonVolver';
import { Aviso } from '@/design/Aviso';
import { EstadoVacio } from '@/design/EstadoVacio';
import { TarjetaReserva } from '@/design/TarjetaReserva';
import { mensajeDeError, ordenarReservas } from '@/utils/formato';

export default function MisReservasScreen() {
  const [reservas, setReservas] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [esAdmin, setEsAdmin] = useState(false);
  const [usuario, setUsuario] = useState<any>(null);

  const cargarReservas = async () => {
    setCargando(true);
    try {
      const lista = await obtenerReservasCliente();
      setReservas(lista);
      setError(null);
    } catch (fallo) {
      setError(mensajeDeError(fallo, 'No pudimos cargar tus reservas.'));
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
      if (!montado) return;
      setEsAdmin(usuario.rol === 'admin');
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

  const handleCancelar = (id: number) => {
    Alert.alert('Cancelar reserva', '¿Querés cancelar esta reserva?', [
      { text: 'Volver', style: 'cancel' },
      {
        text: 'Cancelar reserva',
        style: 'destructive',
        onPress: async () => {
          try {
            await cancelarReserva(id);
            await cargarReservas();
            Alert.alert('Reserva cancelada');
          } catch (fallo) {
            Alert.alert('No pudimos cancelar la reserva', mensajeDeError(fallo, 'Probá de nuevo en un momento.'));
          }
        },
      },
    ]);
  };

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

  const reservasOrdenadas = ordenarReservas(reservas);

  return (
    <Pantalla>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.lg + 4, paddingTop: spacing.md, paddingBottom: spacing.xxxl }}
        refreshControl={<RefreshControl refreshing={refrescando} onRefresh={refrescar} tintColor={colors.brand} colors={[colors.brand]} />}
      >
        <View style={{ width: '100%', maxWidth, alignSelf: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <BotonVolver onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
            <Text style={textStyles.h1}>Mis reservas</Text>
          </View>
          {esAdmin ? (
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: spacing.sm }}>
              <BotonSecundario tono="muted" compacto onPress={() => router.push('/reservas-admin')}>
                Todas las reservas
              </BotonSecundario>
            </View>
          ) : null}
          <Text style={[textStyles.bodySmall, { marginTop: spacing.sm, marginLeft: 42 + spacing.md }]}>
            Tus reservas y el estado de cada una.
          </Text>
          {!esAdmin && usuario && (
            <Text style={{ color: '#dc2626', fontSize: 11, marginTop: 4 }}>
              Rol detectado: {usuario.rol}
            </Text>
          )}

          {error ? (
            <View style={{ marginTop: spacing.xl }}>
              <Aviso>{error}</Aviso>
              <Boton compacto variante="secundario" onPress={reintentar} style={{ alignSelf: 'flex-start' }}>
                Reintentar
              </Boton>
            </View>
          ) : null}

          <View style={{ marginTop: spacing.xl }}>
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
                    reserva.estado === 'pendiente' ? (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                        <BotonPeligro tono="peligro" onPress={() => handleCancelar(reserva.id)}>
                          Cancelar
                        </BotonPeligro>
                      </View>
                    ) : null
                  }
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </Pantalla>
  );
}
