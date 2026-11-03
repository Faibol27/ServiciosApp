import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { registrar } from '@/services/auth.service';
import { colors, spacing } from '@/design/tokens';
import { textStyles } from '@/design/textStyles';
import { Pantalla } from '@/design/Pantalla';
import { Marca } from '@/design/Marca';
import { CampoFormulario } from '@/design/CampoFormulario';
import { Boton, BotonTexto } from '@/design/Botones';
import { Aviso } from '@/design/Aviso';

export default function RegistroScreen() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const handleRegistro = async () => {
    setError('');

    if (!nombre.trim() || !email.trim() || !password) {
      setError('Completá todos los campos.');
      return;
    }

    setCargando(true);
    try {
      await registrar({
        nombre: nombre.trim(),
        email: email.trim(),
        password,
        rol: 'usuario',
      });
      Alert.alert('Cuenta creada', 'Ya podés iniciar sesión.', [
        {
          text: 'Ir a iniciar sesión',
          onPress: () => router.replace('/login'),
        },
      ]);
    } catch (fallo) {
      setError('No pudimos crear tu cuenta. Probá de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <Pantalla>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
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

            <Text style={[textStyles.h1, { marginTop: spacing.xxl }]}>Creá tu cuenta</Text>
            <Text
              style={[
                textStyles.body,
                { color: colors.muted, marginTop: spacing.md, maxWidth: 310 },
              ]}
            >
              Solo necesitás un nombre, un correo y una contraseña.
            </Text>

            <View style={{ marginTop: spacing.xxl }}>
              {error ? <Aviso>{error}</Aviso> : null}

              <CampoFormulario
                label="Nombre"
                valor={nombre}
                enCambioValor={setNombre}
                placeholder="Tu nombre"
                autoCapitalize="words"
                autoComplete="name"
              />

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
                placeholder="Elegí una contraseña"
                secureTextEntry
                autoComplete="new-password"
                returnKeyType="go"
                onSubmitEditing={handleRegistro}
              />

              <Boton onPress={handleRegistro} cargando={cargando}>
                Crear cuenta
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
                <Text style={textStyles.bodySmall}>¿Ya tenés cuenta?</Text>
                <BotonTexto onPress={() => router.replace('/login')}>
                  Iniciá sesión
                </BotonTexto>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Pantalla>
  );
}
