import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Modal, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { obtenerServicios, crearServicio, actualizarServicio, eliminarServicio } from '@/services/servicios.service';
import { login, getUser } from '@/services/auth.service';

export default function IndexScreen() {
  const [servicios, setServicios] = useState<Array<{id: number; nombre: string; descripcion: string; duracion: number; precio: number}>>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [esAdmin, setEsAdmin] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [editando, setEditando] = useState<{id: number; nombre: string; descripcion: string; duracion: number; precio: number} | null>(null);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [duracion, setDuracion] = useState('');
  const [precio, setPrecio] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const user = await getUser();
      if (!user) {
        router.replace('/login');
        return;
      }
      setCargando(true);
      try {
        const lista = await obtenerServicios();
        if (mounted) {
          setServicios(lista);
          setEsAdmin(user.rol === 'admin');
        }
      } catch (e: unknown) {
        if (mounted) {
          const err = e as { name?: string; message?: string };
          setError(err.name === 'ApiError' ? (err.message ?? 'Error al cargar') : 'Error al cargar');
        }
      } finally {
        if (mounted) setCargando(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleLoginAdmin = async () => {
    try {
      await login({ email: 'admin@test.com', password: '123456' });
      const user = await getUser();
      setEsAdmin(user?.rol === 'admin');
      Alert.alert('Admin logueado');
    } catch (e: unknown) {
      const err = e as { message?: string };
      Alert.alert('Error', err.message ?? 'Error inesperado');
    }
  };

  const abrirFormCrear = () => {
    setEditando(null);
    setNombre(''); setDescripcion(''); setDuracion(''); setPrecio('');
    setModalVisible(true);
  };

  const abrirFormEditar = (s: {id: number; nombre: string; descripcion: string; duracion: number; precio: number}) => {
    setEditando(s);
    setNombre(s.nombre); setDescripcion(s.descripcion);
    setDuracion(String(s.duracion)); setPrecio(String(s.precio));
    setModalVisible(true);
  };

  const cerrarForm = () => {
    setModalVisible(false);
    setEditando(null);
  };

  const handleGuardar = async () => {
    if (!nombre.trim() || !descripcion.trim() || !duracion || !precio) {
      Alert.alert('Error', 'Completar todos los campos');
      return;
    }
    const d = Number(duracion);
    const p = Number(precio);
    if (isNaN(d) || isNaN(p) || d <= 0 || p <= 0) {
      Alert.alert('Error', 'Duracion y precio deben ser numeros positivos');
      return;
    }
    setGuardando(true);
    try {
      if (editando) {
        const act = await actualizarServicio(editando.id, { nombre, descripcion, duracion: d, precio: p });
        setServicios((prev) => prev.map((s) => (s.id === editando.id ? act : s)));
      } else {
        const nuevo = await crearServicio({ nombre, descripcion, duracion: d, precio: p });
        setServicios((prev) => [...prev, nuevo]);
      }
      cerrarForm();
    } catch (e: unknown) {
      const err = e as { name?: string; message?: string };
      Alert.alert('Error', err.name === 'ApiError' ? err.message : 'Error inesperado');
    } finally {
      setGuardando(false);
    }
  };

  const handleBorrar = (id: number) => {
    Alert.alert('Confirmar', 'Borrar este servicio?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Borrar', style: 'destructive',
        onPress: async () => {
          try {
            await eliminarServicio(id);
            setServicios((prev) => prev.filter((s) => s.id !== id));
          } catch (e: unknown) {
            const err = e as { name?: string; message?: string };
            Alert.alert('Error', err.name === 'ApiError' ? err.message : 'Error inesperado');
          }
        },
      },
    ]);
  };

  if (cargando) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 12 }}>Cargando</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#fff' }}
      keyboardVerticalOffset={90}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, padding: 16, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text style={{ fontSize: 24, fontWeight: '700', color: '#111827' }}>Servicios</Text>
          {!esAdmin && (
            <TouchableOpacity onPress={handleLoginAdmin} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: '#2563eb' }}>
              <Text style={{ color: '#2563eb', fontWeight: '600', fontSize: 14 }}>Login Admin</Text>
            </TouchableOpacity>
          )}
        </View>

        {esAdmin && (
          <TouchableOpacity onPress={abrirFormCrear} style={{ backgroundColor: '#2563eb', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>Crear servicio</Text>
          </TouchableOpacity>
        )}

        {error && (
          <Text style={{ backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca', color: '#dc2626', padding: 12, borderRadius: 8, marginBottom: 16, textAlign: 'center' }}>
            {error}
          </Text>
        )}

        {servicios.length === 0 && (
          <View style={{ padding: 32, alignItems: 'center' }}>
            <Text style={{ fontSize: 16, color: '#6b7280', marginBottom: 4 }}>No hay servicios todavia</Text>
            {esAdmin && <Text style={{ fontSize: 13, color: '#9ca3af' }}>Presiona Crear servicio para agregar uno</Text>}
          </View>
        )}

        {servicios.map((s) => (
          <View
            key={String(s.id)}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 12,
              backgroundColor: '#fafafa',
              borderRadius: 8,
              borderWidth: 1,
              borderColor: '#eee',
              marginBottom: 10,
            }}
          >
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 2, color: '#111827' }}>{s.nombre}</Text>
              <Text style={{ fontSize: 13, color: '#6b7280' }}>{'$' + s.precio + ' ' + s.duracion + ' min'}</Text>
              <Text style={{ fontSize: 13, color: '#6b7280' }}>{s.descripcion}</Text>
            </View>
            {esAdmin && (
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <TouchableOpacity onPress={() => abrirFormEditar(s)} style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 4, backgroundColor: '#e0e0e0' }}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: '#333' }}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleBorrar(s.id)} style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 4, backgroundColor: '#fee2e2' }}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: '#333' }}>Borrar</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={cerrarForm}
      >
        <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 16 }} onPress={cerrarForm} activeOpacity={1}>
          <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 20, maxHeight: '85%', width: '100%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827' }}>{editando ? 'Editar servicio' : 'Nuevo servicio'}</Text>
              <TouchableOpacity onPress={cerrarForm}>
                <Text style={{ fontSize: 22, color: '#9ca3af', padding: 4 }}>x</Text>
              </TouchableOpacity>
            </View>

            <View style={{ marginBottom: 14 }}>
              <Text style={{ fontSize: 13, fontWeight: '500', marginBottom: 4, color: '#374151' }}>Nombre</Text>
              <TextInput
                style={{ height: 44, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 6, paddingHorizontal: 12, fontSize: 15, backgroundColor: '#fff', color: '#111827' }}
                value={nombre}
                onChangeText={setNombre}
                placeholder="Nombre del servicio"
                autoCapitalize="words"
              />
            </View>

            <View style={{ marginBottom: 14 }}>
              <Text style={{ fontSize: 13, fontWeight: '500', marginBottom: 4, color: '#374151' }}>Descripcion</Text>
              <TextInput
                style={{ height: 44, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 6, paddingHorizontal: 12, fontSize: 15, backgroundColor: '#fff', color: '#111827' }}
                value={descripcion}
                onChangeText={setDescripcion}
                placeholder="Descripcion"
                multiline
                textAlignVertical="top"
              />
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: '500', marginBottom: 4, color: '#374151' }}>Duracion (min)</Text>
                <TextInput
                  style={{ height: 44, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 6, paddingHorizontal: 12, fontSize: 15, backgroundColor: '#fff', color: '#111827' }}
                  value={duracion}
                  onChangeText={setDuracion}
                  placeholder="30"
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: '500', marginBottom: 4, color: '#374151' }}>Precio</Text>
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
              <TouchableOpacity onPress={cerrarForm} style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 6, backgroundColor: '#e5e7eb' }}>
                <Text style={{ color: '#374151', fontWeight: '600', fontSize: 14 }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleGuardar} style={{ backgroundColor: '#2563eb', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 6, opacity: guardando ? 0.6 : 1 }} disabled={guardando}>
                {guardando ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>{editando ? 'Guardar' : 'Crear'}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}