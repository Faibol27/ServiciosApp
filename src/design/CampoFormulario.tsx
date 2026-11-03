import { useState } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { colors, radii, spacing } from '@/design/tokens';
import { textStyles } from '@/design/textStyles';

type Props = {
  label: string;
  valor: string;
  enCambioValor: (texto: string) => void;
  placeholder?: string;
  tipoTeclado?: TextInputProps['keyboardType'];
  multilinea?: boolean;
  filasTexto?: number;
} & Omit<TextInputProps, 'value' | 'onChangeText' | 'style' | 'placeholder' | 'keyboardType' | 'multiline' | 'numberOfLines'>;

export function CampoFormulario({
  label,
  valor,
  enCambioValor,
  placeholder,
  tipoTeclado,
  multilinea = false,
  filasTexto = 1,
  ...resto
}: Props) {
  const [enfocado, setEnfocado] = useState(false);

  return (
    <View style={styles.campo}>
      <Text style={[textStyles.label, styles.etiqueta]}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        style={[styles.input, multilinea && { height: 22 * filasTexto + 28, paddingTop: 12 }, enfocado && styles.inputEnfocado]}
        value={valor}
        onChangeText={enCambioValor}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        keyboardType={tipoTeclado}
        multiline={multilinea}
        numberOfLines={filasTexto}
        onFocus={() => setEnfocado(true)}
        onBlur={() => setEnfocado(false)}
        {...resto}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  campo: {
    marginBottom: spacing.xl,
  },
  etiqueta: {
    marginBottom: spacing.sm,
  },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    backgroundColor: colors.surface,
    color: colors.ink,
    fontSize: 15,
    lineHeight: 20,
  },
  inputEnfocado: {
    borderColor: colors.brand,
  },
});
