import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '@/design/tokens';
import { textStyles } from '@/design/textStyles';

export function EstadoVacio({ titulo, descripcion }: { titulo: string; descripcion: string }) {
  return (
    <View style={styles.contenedor}>
      <View style={styles.icono}>
        <View style={styles.barra} />
        <View style={styles.fila}>
          <View style={styles.punto} />
          <View style={styles.punto} />
          <View style={styles.punto} />
        </View>
      </View>
      <Text style={[textStyles.serviceName, styles.titulo]}>{titulo}</Text>
      <Text style={[textStyles.bodySmall, styles.descripcion]}>{descripcion}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
  },
  icono: {
    width: 52,
    height: 52,
    borderRadius: radii.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 16,
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  barra: {
    height: 1.5,
    borderRadius: 1,
    backgroundColor: colors.border,
  },
  fila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  punto: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.brand,
    opacity: 0.7,
  },
  titulo: {
    textAlign: 'center',
  },
  descripcion: {
    textAlign: 'center',
    maxWidth: 270,
    marginTop: spacing.sm,
  },
});
