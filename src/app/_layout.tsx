import { Stack } from 'expo-router';
import { usePathname, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { colors } from '@/design/tokens';
import { obtenerToken } from '@/services/tokenStorage';
import { solicitarPermisosNotificaciones } from '@/services/notificaciones.service';

export default function RootLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    let montado = true;
    (async () => {
      await solicitarPermisosNotificaciones();
      const token = await obtenerToken();
      if (!montado) return;
      setVerificando(false);
      if (!token && pathname !== '/login') {
        router.replace('/login');
      }
    })();
    return () => { montado = false; };
  }, [pathname]);

  if (verificando) return null;

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.paper },
        }}
      >
        <Stack.Screen name="login" />
        <Stack.Screen name="index" />
        <Stack.Screen name="registro" />
        <Stack.Screen name="mis-reservas" />
        <Stack.Screen name="reservas-admin" />
        <Stack.Screen name="perfil" />
      </Stack>
    </SafeAreaProvider>
  );
}
