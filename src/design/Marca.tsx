import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii } from '@/design/tokens';
import { textStyles } from '@/design/textStyles';

export function Marca() {
  return (
    <View style={styles.marca}>
      <View style={styles.simbolo}>
        <Text style={styles.letra}>S</Text>
      </View>
      <Text style={textStyles.wordmark}>ServiciosApp</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  marca: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  simbolo: {
    width: 30,
    height: 30,
    borderRadius: radii.md,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letra: {
    fontFamily: fonts.display,
    fontSize: 17,
    lineHeight: 20,
    fontWeight: '700',
    color: colors.white,
  },
});
