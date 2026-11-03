import { useEffect, useState, type ReactNode } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, maxWidth, radii, spacing } from '@/design/tokens';

export function HojaInferior({
  visible,
  onCerrar,
  children,
}: {
  visible: boolean;
  onCerrar: () => void;
  children: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [alturaTeclado, setAlturaTeclado] = useState(0);

  useEffect(() => {
    const mostrar = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (evento) => setAlturaTeclado(evento.endCoordinates.height),
    );
    const ocultar = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setAlturaTeclado(0),
    );

    return () => {
      mostrar.remove();
      ocultar.remove();
    };
  }, []);

  const alturaMaxima = alturaTeclado > 0 ? height - alturaTeclado - 24 : height * 0.9;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCerrar} statusBarTranslucent>
      <View style={styles.contenedor}>
        <Pressable accessibilityLabel="Cerrar" onPress={onCerrar} style={styles.fondo} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.teclado}>
          <View
            style={[
              styles.hoja,
              { maxHeight: Math.max(280, alturaMaxima), paddingBottom: Math.max(insets.bottom, spacing.lg) },
            ]}
          >
            <View style={styles.agarre} />
            <ScrollView
              style={styles.scroll}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.contenido}
            >
              {children}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  fondo: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: colors.overlay,
  },
  teclado: {
    width: '100%',
  },
  hoja: {
    width: '100%',
    maxWidth,
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.sheet,
    borderTopRightRadius: radii.sheet,
    paddingTop: 10,
  },
  scroll: {
    flexGrow: 0,
    flexShrink: 1,
  },
  agarre: {
    width: 38,
    height: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  contenido: {
    paddingHorizontal: spacing.lg + 4,
    paddingBottom: spacing.sm,
  },
});
