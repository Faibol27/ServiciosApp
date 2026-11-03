import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '@/design/tokens';
import { textStyles } from '@/design/textStyles';
import { formatearPrecio } from '@/utils/formato';

export function TarjetaServicio({
  servicio,
  acciones,
  onPress,
}: {
  servicio: any;
  acciones: ReactNode;
  onPress?: () => void;
}) {
  const descripcion = typeof servicio?.descripcion === 'string' ? servicio.descripcion.trim() : '';

  const contenido = (
    <>
      <View style={styles.filaSuperior}>
        <Text style={[textStyles.serviceName, styles.nombre]}>{servicio?.nombre ?? 'Servicio'}</Text>
        <View style={styles.duracion}>
          <Text style={styles.duracionTexto}>{servicio?.duracion ?? 0} min</Text>
        </View>
      </View>

      {descripcion ? (
        <Text style={[textStyles.bodySmall, styles.descripcion]} numberOfLines={3}>
          {descripcion}
        </Text>
      ) : null}

      <View style={styles.divisor} />
    </>
  );

  return (
    <View style={styles.tarjeta}>
      {onPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Ver información de ${servicio?.nombre ?? 'el servicio'}`}
          onPress={onPress}
          style={({ pressed }) => [styles.zona, pressed && styles.presionada]}
        >
          {contenido}
        </Pressable>
      ) : (
        <View style={styles.zona}>{contenido}</View>
      )}

      <View style={styles.pie}>
        <Text style={textStyles.price}>$ {formatearPrecio(servicio?.precio ?? 0)}</Text>
        <View style={styles.acciones}>{acciones}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.card,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  zona: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  presionada: {
    backgroundColor: colors.paper,
  },
  filaSuperior: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  nombre: {
    flex: 1,
  },
  duracion: {
    backgroundColor: colors.brandSoft,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    marginTop: 2,
  },
  duracionTexto: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    color: colors.brand,
  },
  descripcion: {
    marginTop: spacing.sm,
  },
  divisor: {
    height: 1,
    backgroundColor: colors.border,
    marginTop: 14,
  },
  pie: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: 14,
    paddingBottom: spacing.lg,
  },
  acciones: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    gap: 2,
    flexShrink: 1,
    marginRight: -8,
  },
});
