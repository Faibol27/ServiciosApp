export const DIAS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
export const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic'];

export function dosDigitos(valor: number) {
  return String(valor).padStart(2, '0');
}

export function formatearFechaCorta(fecha: Date) {
  return `${DIAS[fecha.getDay()]} ${fecha.getDate()} ${MESES[fecha.getMonth()]}`;
}

export function formatearHora(fecha: Date) {
  return `${dosDigitos(fecha.getHours())}:${dosDigitos(fecha.getMinutes())}`;
}

export function formatearHoraReserva(hora?: string | null) {
  if (!hora) return 'Sin horario';

  const texto = String(hora).trim().toLowerCase();
  const doce =
    texto.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)/) ?? texto.match(/^(\d{1,2})(\d{2})\s*(am|pm)/);

  if (doce) {
    const horas = Number(doce[1]);
    if (horas >= 1 && horas <= 12) {
      const minutos = Number(doce[2] ?? '00');
      const en24 = (horas % 12) + (doce[3] === 'pm' ? 12 : 0);
      return `${dosDigitos(en24)}:${dosDigitos(minutos)}`;
    }
  }

  const veinticuatro = texto.match(/^(\d{1,2}):(\d{2})/);
  if (veinticuatro) {
    const horas = Number(veinticuatro[1]);
    const minutos = Number(veinticuatro[2]);
    if (horas <= 23 && minutos <= 59) return `${dosDigitos(horas)}:${dosDigitos(minutos)}`;
  }

  return String(hora);
}

export function fechaParaApi(fecha: Date) {
  return `${fecha.getFullYear()}-${dosDigitos(fecha.getMonth() + 1)}-${dosDigitos(fecha.getDate())}`;
}

export function formatearPrecio(valor: number | string) {
  const numero = Number(valor);
  if (!Number.isFinite(numero)) return String(valor);

  return numero.toLocaleString('es-AR', {
    minimumFractionDigits: Number.isInteger(numero) ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

export function partesDeFecha(fecha?: string | Date | null) {
  if (!fecha) return null;

  if (typeof fecha === 'string') {
    const [anio, mes, dia] = fecha.slice(0, 10).split('-').map(Number);
    if (anio && mes && dia) return new Date(anio, mes - 1, dia);
  }

  const valor = new Date(fecha);
  return Number.isNaN(valor.getTime()) ? null : valor;
}

export function mensajeDeError(error: unknown, porDefecto: string) {
  const fallo = error as { name?: string; message?: string };
  return fallo?.name === 'ApiError' && fallo.message ? fallo.message : porDefecto;
}

export function ordenarReservas(lista: any[]) {
  const peso = (estado?: string) => (estado === 'pendiente' ? 0 : estado === 'completada' ? 1 : 2);

  return [...lista].sort((a, b) => {
    const diferencia = peso(a?.estado) - peso(b?.estado);
    if (diferencia !== 0) return diferencia;

    const fechaA = `${a?.fecha ?? ''}T${a?.hora ?? ''}`;
    const fechaB = `${b?.fecha ?? ''}T${b?.hora ?? ''}`;
    return fechaA.localeCompare(fechaB);
  });
}
