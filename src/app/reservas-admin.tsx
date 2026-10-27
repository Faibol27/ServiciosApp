import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { obtenerReservasAdmin, completarReserva } from '@/services/reservas.service';
import { getUser } from '@/services/auth.service';

export default function ReservasAdminScreen() {
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
      if (u.rol !== 'admin') {
        router.replace('/');
        return;
      }
      setUser(u);
      if (mounted) {
        setCargando(true);
        try {
          const lista = await obtenerReservasAdmin();
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

  const handleCompletar = async (id: number) => {
    Alert.alert('Confirmar', '¿Marcar esta reserva como completada?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Sí, completar', style: 'destructive',
        onPress: async () => {
          try {
            await completarReserva(id);
            setReservas((prev) => prev.map((r) => r.id === id ? { ...r, estado: 'completada' } : r));
            Alert.alert('Éxito', 'Reserva marcada como completada');
          } catch (e: unknown) {
            const err = e as { name?: string; message?: string };
            Alert.alert('Error', err.name === 'ApiError' ? (err.message ?? 'No se pudo completar') : 'Error al completar');
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
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: '700', color: '#111827' }}>Gestión de Reservas</Text>
        <TouchableOpacity onPress={() => router.push('/')} style={{ padding: 8 }}>
          <Text style={{ color: '#2563eb', fontWeight: '600', fontSize: 14 }}>Volver a Servicios</Text>
        </TouchableOpacity>
      </View>

      {error && (
        <View style={{ backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca', padding: 12, borderRadius: 8, marginHorizontal: 16, marginBottom: 16, alignItems: 'center' }}>
          <Text style={{ color: '#dc2626' }}>{error}</Text>
        </View>
      )}

      {reservas.length === 0 ? (
        <View style={{ padding: 32, alignItems: 'center' }}>
          <Text style={{ fontSize: 16, color: '#6b7280' }}>No hay reservas registradas</Text>
        </View>
      ) : (
        <FlatList
          data={reservas}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View style={{ backgroundColor: '#fafafa', borderWidth: 1, borderColor: '#eee', borderRadius: 8, padding: 14, marginHorizontal: 16, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827' }}>{item.servicio?.nombre ?? 'Servicio'}</Text>
                <Text style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{fechaStr(item.fecha)} - {item.hora}</Text>
                <Text style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>Usuario ID: {item.usuarioId}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: colorEstado(item.estado), textTransform: 'uppercase' }}>{item.estado}</Text>
                {item.estado === 'pendiente' && (
                  <TouchableOpacity onPress={() => handleCompletar(item.id)} style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 4, backgroundColor: '#16a34a' }}>
                    <Text style={{ color: '#fff', fontWeight: '600', fontSize: 12 }}>Completar</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}
