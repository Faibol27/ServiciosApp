import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, FlatList } from 'react-native';
import { router } from 'expo-router';
import { obtenerReservasCliente, cancelarReserva } from '@/services/reservas.service';
import { getUser } from '@/services/auth.service';

export default function MisReservasScreen() {
  const [reservas, setReservas] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const u = await getUser();
      if (!u) {
        router.replace('/login');
        return;
      }
      setUser(u);
      if (mounted) {
        setCargando(true);
        try {
          const lista = await obtenerReservasCliente();
          if (mounted) setReservas(lista);
        } catch (e: unknown) {
          if (mounted) {
            const err = e as { name?: string; message?: string };
            setError(err.name === 'ApiError' ? (err.message ?? 'Error al cargar reservas') : 'Error al cargar reservas');
          }
        } finally {
          if (mounted) setCargando(false);
        }
      }
    })();
    return () => { mounted = false; };
  }, []);

  const refresh = async () => {
    try {
      const lista = await obtenerReservasCliente();
      setReservas(lista);
    } catch (e: unknown) {
      const err = e as { name?: string; message?: string };
      setError(err.name === 'ApiError' ? (err.message ?? 'Error al actualizar') : 'Error al actualizar');
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
            setReservas((prev) => prev.map((r) => r.id === id ? { ...r, estado: 'cancelada' } : r));
            Alert.alert('Éxito', 'Reserva cancelada');
          } catch (e: unknown) {
            const err = e as { name?: string; message?: string };
            Alert.alert('Error', err.name === 'ApiError' ? (err.message ?? 'No se pudo cancelar') : 'Error al cancelar');
          }
        },
      },
    ]);
  };

  if (cargando && !user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 12 }}>Cargando...</Text>
      </View>
    );
  }

  const fechaStr = (fecha: string | undefined) => (fecha ? new Date(fecha).toLocaleDateString() : '-');

  const colorEstado = (estado: string) => {
    if (estado === 'pendiente') return '#2563eb';
    if (estado === 'completada') return '#16a34a';
    if (estado === 'cancelada') return '#dc2626';
    return '#6b7280';
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#fff' }}
      keyboardVerticalOffset={90}
    >
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text style={{ fontSize: 24, fontWeight: '700', color: '#111827' }}>Mis Reservas</Text>
          <TouchableOpacity onPress={() => router.push('/' as any)} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: '#2563eb' }}>
            <Text style={{ color: '#2563eb', fontWeight: '600', fontSize: 14 }}>Volver a Servicios</Text>
          </TouchableOpacity>
        </View>

        {error && (
          <View style={{ backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca', padding: 12, borderRadius: 8, marginBottom: 16, alignItems: 'center' }}>
            <Text style={{ color: '#dc2626' }}>{error}</Text>
          </View>
        )}

        {reservas.length === 0 ? (
          <View style={{ padding: 32, alignItems: 'center' }}>
            <Text style={{ fontSize: 16, color: '#6b7280', marginBottom: 4 }}>No tenés reservas todavía</Text>
          </View>
        ) : (
          <FlatList
            data={reservas}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => {
              const colorEstado = colorEstadoFunc(item.estado);
              return (
                <View style={{ backgroundColor: '#fafafa', borderWidth: 1, borderColor: '#eee', borderRadius: 8, padding: 12, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View>
                    <Text style={{ fontSize: 15, fontWeight: '600', color: '#111827' }}>{item.servicio?.nombre ?? 'Servicio'}</Text>
                    <Text style={{ fontSize: 13, color: '#6b7280' }}>{fechaStr(item.fecha)} - {item.hora}</Text>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: colorEstado, marginTop: 4 }}>{item.estado}</Text>
                  </View>
                  {item.estado === 'pendiente' && (
                    <TouchableOpacity onPress={() => handleCancelarReserva(item.id)} style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, backgroundColor: '#fee2e2' }}>
                      <Text style={{ color: '#dc2626', fontWeight: '600', fontSize: 12 }}>Cancelar</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            }}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const colorEstadoFunc = (estado: string) => {
  if (estado === 'pendiente') return '#2563eb';
  if (estado === 'completada') return '#16a34a';
  if (estado === 'cancelada') return '#dc2626';
  return '#6b7280';
};
