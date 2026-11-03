import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '@/design/tokens';

const ESTADOS: Record<string, { texto: string; color: string; fondo: string }> = {
  pendiente: { texto: 'Pendiente', color: colors.pending, fondo: colors.pendingSoft },
  completada: { texto: 'Completada', color: colors.completed, fondo: colors.completedSoft },
  cancelada: { texto: 'Cancelada', color: colors.cancelled, fondo: colors.cancelledSoft },
};

export function EstadoPill({ estado }: { estado: string }) {
  const config = ESTADOS[estado] ?? ESTADOS.pendiente;

  return (
    <View style={[styles.pill, { backgroundColor: config.fondo }]}>
      <View style={[styles.punto, { backgroundColor: config.color }]} />
      <Text style={[styles.texto, { color: config.color }]}>{config.texto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.pill,
    alignSelf: 'flex-start',
  },
  punto: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  texto: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
  },
});
