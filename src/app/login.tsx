import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { login } from '@/services/auth.service';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    setCargando(true);
    try {
      await login({ email, password });
      router.replace('/');
    } catch (e: unknown) {
      const err = e as { name?: string; message?: string };
      setError(err.name === 'ApiError' ? (err.message ?? 'Error inesperado') : 'Error inesperado');
    } finally {
      setCargando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#fff', padding: 24, justifyContent: 'center' }}
      keyboardVerticalOffset={90}
    >
      <View style={{ width: '100%', maxWidth: 400, alignSelf: 'center' }}>
        <Text style={{ fontSize: 28, fontWeight: '700', color: '#111827', marginBottom: 24, textAlign: 'center' }}>Iniciar sesión</Text>

        {error && (
          <Text style={{ backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca', color: '#dc2626', padding: 12, borderRadius: 8, marginBottom: 16, textAlign: 'center' }}>
            {error}
          </Text>
        )}

        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 6, color: '#374151' }}>Email</Text>
          <TextInput
            style={{ height: 48, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 14, fontSize: 16, backgroundColor: '#fff', color: '#111827' }}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
        </View>

        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 6, color: '#374151' }}>Contraseña</Text>
          <TextInput
            style={{ height: 48, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 14, fontSize: 16, backgroundColor: '#fff', color: '#111827' }}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
          />
        </View>

        <TouchableOpacity style={{ backgroundColor: '#2563eb', paddingVertical: 14, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: 8, opacity: cargando ? 0.6 : 1 }} onPress={handleLogin} disabled={cargando}>
          {cargando ? <ActivityIndicator color="#fff" size="small" /> : <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>Entrar</Text>}
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 24, gap: 4 }}>
          <Text style={{ color: '#6b7280' }}>¿No tenés cuenta? </Text>
          <TouchableOpacity onPress={() => router.push('/registro')}>
            <Text style={{ color: '#2563eb', fontWeight: '600' }}>Registrarse</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}