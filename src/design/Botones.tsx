import type { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radii, spacing } from '@/design/tokens';
import { textStyles } from '@/design/textStyles';

type Variante = 'primario' | 'secundario' | 'peligro';
type Tono = 'marca' | 'peligro' | 'muted';

export function Boton({
  children,
  onPress,
  variante = 'primario',
  compacto = false,
  disabled = false,
  cargando = false,
  style,
  colorTexto,
}: {
  children: ReactNode;
  onPress: () => void;
  variante?: Variante;
  compacto?: boolean;
  disabled?: boolean;
  cargando?: boolean;
  style?: StyleProp<ViewStyle>;
  colorTexto?: string;
}) {
  const fondo = variante === 'primario' ? colors.brand : colors.surface;
  const borde = variante === 'primario' ? colors.brand : variante === 'peligro' ? colors.cancelled : colors.border;
  const texto = colorTexto ?? (variante === 'primario' ? colors.white : variante === 'peligro' ? colors.cancelled : colors.ink);

  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.75}
      disabled={disabled || cargando}
      onPress={onPress}
      style={[
        styles.base,
        compacto ? styles.compacto : styles.normal,
        { backgroundColor: fondo, borderColor: borde, opacity: disabled ? 0.5 : 1 },
        style,
      ]}
    >
      {cargando ? (
        <ActivityIndicator color={texto} size="small" />
      ) : (
        <Text style={[textStyles.button, compacto && textStyles.buttonSmall, { color: texto }]}>{children}</Text>
      )}
    </TouchableOpacity>
  );
}

export function BotonSecundario({
  children,
  onPress,
  tono = 'muted',
  compacto = false,
  disabled = false,
  style,
}: {
  children: ReactNode;
  onPress: () => void;
  tono?: Tono;
  compacto?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const fondo = tono === 'peligro' ? colors.cancelled : tono === 'muted' ? colors.muted : colors.brand;
  const texto = colors.white;

  return (
    <Boton
      variante="secundario"
      onPress={onPress}
      compacto={compacto}
      colorTexto={texto}
      style={[{ backgroundColor: fondo, borderColor: colors.border, opacity: disabled ? 0.5 : 1 }, style]}
    >
      {children}
    </Boton>
  );
}

export function BotonPrimario({
  children,
  onPress,
  compacto = false,
  disabled = false,
  style,
}: {
  children: ReactNode;
  onPress: () => void;
  compacto?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Boton
      variante="primario"
      onPress={onPress}
      compacto={compacto}
      colorTexto={colors.white}
      style={[{ backgroundColor: colors.brand }, style]}
    >
      {children}
    </Boton>
  );
}

export function BotonPeligro({
  children,
  onPress,
  tono = 'peligro',
  compacto = false,
  disabled = false,
  style,
}: {
  children: ReactNode;
  onPress: () => void;
  tono?: Tono;
  compacto?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const fondo = tono === 'peligro' ? colors.cancelled : colors.brand;
  const texto = colors.white;

  return (
    <Boton
      variante="peligro"
      onPress={onPress}
      compacto={compacto}
      colorTexto={texto}
      style={[{ backgroundColor: fondo, borderColor: colors.cancelled, opacity: disabled ? 0.5 : 1 }, style]}
    >
      {children}
    </Boton>
  );
}

export function BotonTexto({
  children,
  onPress,
  tono = 'marca',
  disabled = false,
}: {
  children: ReactNode;
  onPress: () => void;
  tono?: Tono;
  disabled?: boolean;
}) {
  const color = tono === 'peligro' ? colors.cancelled : tono === 'muted' ? colors.muted : colors.brand;

  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.6}
      disabled={disabled}
      hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
      onPress={onPress}
      style={[styles.texto, disabled && { opacity: 0.5 }]}
    >
      <Text style={[textStyles.buttonSmall, { color }]}>{children}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: radii.md,
  },
  normal: {
    minHeight: 50,
    paddingHorizontal: spacing.xl,
  },
  compacto: {
    minHeight: 38,
    paddingHorizontal: spacing.lg,
  },
  texto: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
    alignSelf: 'flex-start',
  },
});
