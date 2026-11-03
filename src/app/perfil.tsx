import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { getUser, logout } from '@/services/auth.service';
import { obtenerToken } from '@/services/tokenStorage';
import { colors, radii, spacing } from '@/design/tokens';
import { textStyles } from '@/design/textStyles';
import { Pantalla } from '@/design/Pantalla';
import { Boton, BotonTexto } from '@/design/Botones';
import { BotonVolver } from '@/design/BotonVolver';
import { Aviso } from '@/design/Aviso';

export default function PerfilScreen() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let montado = true;
    (async () => {
      const usuario = await getUser();
      if (!usuario) {
        router.replace('/login');
        return;
      }
      if (!montado) return;
      setNombre(usuario.nombre ?? '');
      setEmail(usuario.email ?? '');
    })();
    return () => { montado = false; };
  }, []);

  const handleGuardar = async () => {
    setError('');
    if (!nombre.trim()) {
      setError('El nombre es obligatorio.');
      return;
    }

    setGuardando(true);
    try {
      const token = await obtenerToken();
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/usuarios/perfil`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ nombre: nombre.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Error desconocido');
      Alert.alert('Perfil actualizado', `Tu nombre cambió a ${json.nombre}`);
      setNombre(json.nombre);
    } catch (fallo) {
      setError('No pudimos actualizar el perfil. Probá de nuevo.');
    } finally {
      setGuardando(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
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
        contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.xxxl }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ width: '100%', maxWidth: 420, alignSelf: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg }}>
            <BotonVolver onPress={() => router.replace('/')} />
            <Text style={textStyles.h1}>Mi perfil</Text>
          </View>

          <View style={{ alignItems: 'center', marginBottom: spacing.xl }}>
            <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: colors.brandSoft, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: colors.brand, fontWeight: '700', fontSize: 32 }}>{nombre.charAt(0).toUpperCase() ?? '?'}</Text>
            </View>
            <Text style={[textStyles.serviceName, { marginTop: spacing.md, textAlign: 'center' }]}>{nombre || 'Usuario'}</Text>
            <Text style={[textStyles.bodySmall, { color: colors.muted, textAlign: 'center', marginTop: spacing.xs }]}>{email}</Text>
          </View>

          <View style={{ marginBottom: spacing.xl }}>
            <Text style={[textStyles.label, { marginBottom: spacing.sm }]}>Nombre</Text>
            <TextInput
              style={{
                height: 48,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: radii.md,
                paddingHorizontal: spacing.sm,
                backgroundColor: colors.surface,
                color: colors.ink,
              }}
              value={nombre}
              onChangeText={setNombre}
              autoCapitalize="words"
            />
          </View>

          {error ? <Aviso>{error}</Aviso> : null}

          <View style={{ marginTop: spacing.lg }}>
            <Boton onPress={handleGuardar} cargando={guardando}>
              Guardar nombre
            </Boton>
          </View>

          <View style={{ marginTop: spacing.xl, alignItems: 'center' }}>
            <BotonTexto tono="peligro" onPress={handleLogout}>
              Cerrar sesión
            </BotonTexto>
          </View>
        </View>
      </ScrollView>
    </Pantalla>
  );
}
