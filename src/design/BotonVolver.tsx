import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colors, fonts, radii } from '@/design/tokens';

export function BotonVolver({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel="Volver"
      activeOpacity={0.7}
      hitSlop={10}
      onPress={onPress}
      style={styles.boton}
    >
      <Text style={styles.flecha}>←</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  boton: {
    width: 42,
    height: 42,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flecha: {
    fontFamily: fonts.display,
    fontSize: 30,
    lineHeight: 32,
    color: colors.ink,
    marginTop: -3,
  },
});
