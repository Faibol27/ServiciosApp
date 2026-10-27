import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#fff' },
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="index" />
      <Stack.Screen name="registro" />
      <Stack.Screen name="reservas" />
      <Stack.Screen name="reservas-admin" />
      <Stack.Screen name="mis-reservas" />
    </Stack>
  );
}