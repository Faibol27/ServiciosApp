import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '@/design/tokens';
import { textStyles } from '@/design/textStyles';
import { EstadoPill } from '@/design/EstadoPill';
import { DIAS, MESES, formatearHoraReserva, partesDeFecha } from '@/utils/formato';

export function TarjetaReserva({
  reserva,
  mostrarCliente = false,
  acciones,
}: {
  reserva: any;
  mostrarCliente?: boolean;
  acciones?: ReactNode;
}) {
  const fecha = partesDeFecha(reserva?.fecha);
  const hora = formatearHoraReserva(reserva?.hora);
  const cliente = reserva?.usuario?.nombre;
  const servicio = reserva?.servicio?.nombre ?? 'Servicio';

  return (
    <View style={styles.tarjeta}>
      <View style={styles.fecha}>
        <Text style={textStyles.dateSmall}>{fecha ? DIAS[fecha.getDay()] : '—'}</Text>
        <Text style={textStyles.dateDay}>{fecha ? fecha.getDate() : '—'}</Text>
        <Text style={textStyles.dateSmall}>{fecha ? MESES[fecha.getMonth()] : '—'}</Text>
      </View>

      <View style={styles.contenido}>
        <View style={styles.filaSuperior}>
          <Text style={[textStyles.serviceName, styles.nombre]} numberOfLines={2}>
            {servicio}
          </Text>
          <EstadoPill estado={reserva?.estado ?? 'pendiente'} />
        </View>

        <Text style={[textStyles.bodySmall, styles.hora]}>{hora} hs</Text>

        {mostrarCliente && cliente ? (
          <Text style={[textStyles.bodySmall, styles.hora]}>Cliente: {cliente}</Text>
        ) : null}

        {acciones ? <View style={styles.acciones}>{acciones}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.card,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  fecha: {
    width: 56,
    borderRadius: radii.md,
    backgroundColor: colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 1,
  },
  contenido: {
    flex: 1,
    marginLeft: 14,
  },
  filaSuperior: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  nombre: {
    flex: 1,
  },
  hora: {
    marginTop: 4,
  },
  acciones: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 2,
    marginTop: spacing.sm,
    marginBottom: -6,
    marginRight: -8,
  },
});
