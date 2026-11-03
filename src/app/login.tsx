import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { login } from '@/services/auth.service';
import { colors, spacing } from '@/design/tokens';
import { textStyles } from '@/design/textStyles';
import { Pantalla } from '@/design/Pantalla';
import { Marca } from '@/design/Marca';
import { CampoFormulario } from '@/design/CampoFormulario';
import { Boton, BotonTexto } from '@/design/Botones';
import { Aviso } from '@/design/Aviso';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    if (!email.trim() || !password) {
      setError('Completá tu correo y tu contraseña.');
      return;
    }

    setCargando(true);
    try {
      await login({ email: email.trim(), password });
      router.replace('/');
    } catch (fallo) {
      setError('El correo o la contraseña son incorrectos.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <Pantalla>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            paddingHorizontal: spacing.xl,
            paddingVertical: spacing.xxl,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ width: '100%', maxWidth: 420, alignSelf: 'center' }}>
            <Marca />

            <Text style={[textStyles.display, { marginTop: spacing.xxl }]}>Tu tiempo,</Text>
            <Text style={[textStyles.display, { marginTop: spacing.sm }]}>bien reservado.</Text>
            <Text style={[textStyles.body, { color: colors.muted, marginTop: spacing.md, maxWidth: 310 }]}>
              Entrá para reservar servicios y revisar tus próximos turnos.
            </Text>

            <View style={{ marginTop: spacing.xxl }}>
              {error ? <Aviso>{error}</Aviso> : null}

              <CampoFormulario
                label="Correo electrónico"
                valor={email}
                enCambioValor={setEmail}
                placeholder="tu@email.com"
                tipoTeclado="email-address"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect={false}
              />

              <CampoFormulario
                label="Contraseña"
                valor={password}
                enCambioValor={setPassword}
                placeholder="Tu contraseña"
                secureTextEntry
                autoComplete="password"
                returnKeyType="go"
                onSubmitEditing={handleLogin}
              />

              <Boton onPress={handleLogin} cargando={cargando}>
                Entrar
              </Boton>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                  marginTop: spacing.xl,
                }}
              >
                <Text style={textStyles.bodySmall}>¿No tenés cuenta?</Text>
                <BotonTexto onPress={() => router.push('/registro')}>Creá una cuenta</BotonTexto>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Pantalla>
  );
}
