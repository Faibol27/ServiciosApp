import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '@/design/tokens';

export function Aviso({ children }: { children: ReactNode }) {
  return (
    <View style={styles.aviso}>
      <View style={styles.punto} />
      <Text style={styles.texto}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  aviso: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.cancelledSoft,
    borderWidth: 1,
    borderColor: colors.cancelledBorder,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  punto: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.cancelled,
    marginTop: 6,
  },
  texto: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: colors.cancelled,
  },
});
