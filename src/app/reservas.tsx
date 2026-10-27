import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { obtenerReservasCliente, crearReserva, cancelarReserva } from '@/services/reservas.service';
import { obtenerServicios } from '@/services/servicios.service';
import { getUser } from '@/services/auth.service';

export default function ReservasScreen() {
  const [reservas, setReservas] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [esAdmin, setEsAdmin] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [modalCrearVisible, setModalCrearVisible] = useState(false);
  const [servicios, setServicios] = useState<{ id: number; nombre: string; duracion: number; precio: number }[]>([]);
  const [servicioSeleccionado, setServicioSeleccionado] = useState<number | null>(null);
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [guardando, setGuardando] = useState(false);

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
          if (u.rol === 'admin') {
            router.replace('/reservas-admin' as any);
            return;
          }
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

  const handleCancelar = async (id: number) => {
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

  const cargarServiciosParaCrear = async () => {
    try {
      const lista = await obtenerServicios();
      setServicios(lista);
    } catch {
      setServicios([]);
    }
  };

  const abrirCrear = async () => {
    await cargarServiciosParaCrear();
    setServicioSeleccionado(null);
    setFecha('');
    setHora('');
    setModalCrearVisible(true);
  };

  const cerrarCrear = () => setModalCrearVisible(false);

  const handleGuardarCrear = async () => {
    if (!servicioSeleccionado || !fecha || !hora) {
      Alert.alert('Error', 'Seleccioná servicio, fecha y hora');
      return;
    }
    setGuardando(true);
    try {
      await crearReserva(servicioSeleccionado, fecha, hora);
      cerrarCrear();
      await refresh();
      Alert.alert('Éxito', 'Reserva creada (estado: pendiente)');
    } catch (e: unknown) {
      const err = e as { name?: string; message?: string };
      Alert.alert('Error', err.name === 'ApiError' ? (err.message ?? 'No se pudo crear la reserva') : 'Error al crear');
    } finally {
      setGuardando(false);
    }
  };

  if (cargando && !user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 12 }}>Cargando...</Text>
      </View>
    );
  }

  if (esAdmin) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827', textAlign: 'center', marginBottom: 12 }}>
          Bienvenido, administrador {user?.nombre}
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/reservas-admin' as any)}
          style={{ backgroundColor: '#2563eb', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 8 }}
        >
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>Ir a Gestión de Reservas</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#fff' }}
      keyboardVerticalOffset={90}
    >
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text style={{ fontSize: 22, fontWeight: '700', color: '#111827' }}>Mis Reservas</Text>
          <TouchableOpacity
            onPress={abrirCrear}
            style={{ backgroundColor: '#2563eb', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 6 }}
          >
            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>Nueva Reserva</Text>
          </TouchableOpacity>
        </View>

        {error && (
          <Text style={{ backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca', color: '#dc2626', padding: 12, borderRadius: 8, marginBottom: 16, textAlign: 'center' }}>
            {error}
          </Text>
        )}

        {reservas.length === 0 ? (
          <View style={{ padding: 32, alignItems: 'center' }}>
            <Text style={{ fontSize: 16, color: '#6b7280' }}>No tenés reservas todavía</Text>
          </View>
        ) : (
          <FlatList
            data={reservas}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => {
              const fechaStr = item.fecha ? new Date(item.fecha).toLocaleDateString() : '-';
              const colorEstado = item.estado === 'pendiente' ? '#2563eb' : item.estado === 'completada' ? '#16a34a' : '#dc2626';
              return (
                <View style={{ backgroundColor: '#fafafa', borderWidth: 1, borderColor: '#eee', borderRadius: 8, padding: 14, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827' }}>{item.servicio?.nombre ?? 'Servicio'}</Text>
                    <Text style={{ fontSize: 13, color: '#6b7280' }}>{fechaStr} - {item.hora}</Text>
                    <Text style={{ fontSize: 13, color: '#6b7280' }}>Estado: </Text>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: colorEstado }}>{item.estado}</Text>
                  </View>
                  {item.estado === 'pendiente' && (
                    <TouchableOpacity onPress={() => handleCancelar(item.id)} style={{ padding: 8, backgroundColor: '#fee2e2', borderRadius: 6 }}>
                      <Text style={{ color: '#dc2626', fontWeight: '600', fontSize: 12 }}>Cancelar</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            }}
          />
        )}
      </ScrollView>

      <Modal
        visible={modalCrearVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={cerrarCrear}
      >
        <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 16 }} onPress={cerrarCrear} activeOpacity={1}>
          <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 20, maxHeight: '85%', width: '90%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827' }}>Nueva Reserva</Text>
              <TouchableOpacity onPress={cerrarCrear}>
                <Text style={{ fontSize: 22, color: '#9ca3af', padding: 4 }}>x</Text>
              </TouchableOpacity>
            </View>

            <View style={{ marginBottom: 14 }}>
              <Text style={{ fontSize: 13, fontWeight: '500', marginBottom: 6, color: '#374151' }}>Servicio</Text>
              <View style={{ borderWidth: 1, borderColor: '#d1d5db', borderRadius: 6, paddingHorizontal: 12, height: 44, justifyContent: 'center', backgroundColor: '#fff' }}>
                <Text style={{ color: servicioSeleccionado ? '#111827' : '#9ca3af', fontSize: 15 }}>
                  {servicios.find((s) => s.id === servicioSeleccionado)?.nombre ?? 'Seleccionar servicio'}
                </Text>
              </View>
              {servicios.length > 0 && (
                <View style={{ marginTop: 6 }}>
                  {servicios.map((s) => (
                    <TouchableOpacity
                      key={s.id}
                      onPress={() => setServicioSeleccionado(s.id)}
                      style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, backgroundColor: servicioSeleccionado === s.id ? '#dbeafe' : 'transparent', marginRight: 6 }}
                    >
                      <Text style={{ color: servicioSeleccionado === s.id ? '#1d4ed8' : '#6b7280', fontWeight: '600', fontSize: 12 }}>{s.nombre}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={{ marginBottom: 14 }}>
              <Text style={{ fontSize: 13, fontWeight: '500', marginBottom: 6, color: '#374151' }}>Fecha</Text>
              <TextInput
                style={{ height: 44, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 6, paddingHorizontal: 12, fontSize: 15, backgroundColor: '#fff', color: '#111827' }}
                value={fecha}
                onChangeText={setFecha}
                placeholder="YYYY-MM-DD"
                keyboardType="default"
              />
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
              <TouchableOpacity onPress={cerrarCrear} style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 6, backgroundColor: '#e5e7eb' }}>
                <Text style={{ color: '#374151', fontWeight: '600', fontSize: 14 }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleGuardarCrear} style={{ backgroundColor: '#2563eb', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 6, opacity: guardando ? 0.6 : 1 }} disabled={guardando}>
                {guardando ? <ActivityIndicator color="#fff" size="small" /> : <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>Reservar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}
