import { Alert } from 'react-native';
import * as Notifications from 'expo-notifications';

export async function solicitarPermisosNotificaciones() {
  const { status: statusExistente } = await Notifications.getPermissionsAsync();
  let estatusFinal = statusExistente;
  if (estatusFinal !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    estatusFinal = status;
  }
  if (estatusFinal !== 'granted') {
    Alert.alert('Permiso denegado', 'No se pudieron enviar notificaciones de reserva.');
  }
  return estatusFinal === 'granted';
}

export async function programarRecordatorioReserva({ reservaId, servicioNombre, fechaStr, horaStr }) {
  // Calcular 24 horas antes de la reserva
  const fechaReserva = new Date(`${fechaStr}T${horaStr}`);
  const ahora = new Date();
  const diferenciaHoras = (fechaReserva.getTime() - ahora.getTime()) / (1000 * 60 * 60);

  // Si la reserva es para menos de 24 horas, no programar notificación
  if (diferenciaHoras < 24) {
    return null;
  }

  const fechaNotificacion = new Date(fechaReserva.getTime() - 24 * 60 * 60 * 1000);

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Recordatorio de reserva',
      body: `Tu reserva de ${servicioNombre} es mañana. ¡No te olvides!`,
      data: { reservaId },
    },
    trigger: {
      date: fechaNotificacion,
    },
  });

  return id;
}

export async function cancelarRecordatorioReserva(reservaId) {
  const notificaciones = await Notifications.getAllScheduledNotificationsAsync();
  const idsParaCancelar = notificaciones
    .filter((n) => n.content.data?.reservaId === reservaId)
    .map((n) => n.identifier);

  for (const id of idsParaCancelar) {
    await Notifications.cancelScheduledNotificationAsync(id);
  }
}
