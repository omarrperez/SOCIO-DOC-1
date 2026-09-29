/**
 * TABLA OFICIAL DE TASAS DE CAMBIO BCV (BANCO CENTRAL DE VENEZUELA) 2026
 * Extraída de los registros y resoluciones cambiarias oficiales publicadas
 * para las operaciones de la Línea de Crédito Rotativa de Agrícola Oni, C.A.
 * y Manuel Alejandro Becerra Luis.
 */

export interface RegistroTasaBCV {
  fecha: string; // YYYY-MM-DD
  fecha_formato_ve: string; // DD/MM/YYYY
  tasa_bcv: number; // Bs./USD
  fuente: string;
  vigencia_descripcion: string;
}

export const HISTORICO_TASAS_BCV_2026: RegistroTasaBCV[] = [
  { fecha: "2026-05-06", fecha_formato_ve: "06/05/2026", tasa_bcv: 493.38, fuente: "BCV Oficial", vigencia_descripcion: "Cierre jornada 06/05/2026" },
  { fecha: "2026-05-15", fecha_formato_ve: "15/05/2026", tasa_bcv: 515.18, fuente: "BCV Oficial", vigencia_descripcion: "Cierre jornada 15/05/2026" },
  { fecha: "2026-05-25", fecha_formato_ve: "25/05/2026", tasa_bcv: 530.50, fuente: "BCV Oficial", vigencia_descripcion: "Cierre jornada 25/05/2026" },
  { fecha: "2026-05-27", fecha_formato_ve: "27/05/2026", tasa_bcv: 540.04, fuente: "BCV Oficial", vigencia_descripcion: "Cierre jornada 27/05/2026" },
  { fecha: "2026-06-02", fecha_formato_ve: "02/06/2026", tasa_bcv: 557.97, fuente: "BCV Oficial", vigencia_descripcion: "Cierre jornada 02/06/2026" },
  { fecha: "2026-06-05", fecha_formato_ve: "05/06/2026", tasa_bcv: 567.68, fuente: "BCV Oficial", vigencia_descripcion: "Cierre jornada 05/06/2026" },
  { fecha: "2026-06-09", fecha_formato_ve: "09/06/2026", tasa_bcv: 567.68, fuente: "BCV Oficial", vigencia_descripcion: "Cierre jornada 09/06/2026" },
  { fecha: "2026-06-15", fecha_formato_ve: "15/06/2026", tasa_bcv: 587.41, fuente: "BCV Oficial", vigencia_descripcion: "Cierre jornada 15/06/2026" },
  { fecha: "2026-06-16", fecha_formato_ve: "16/06/2026", tasa_bcv: 592.52, fuente: "BCV Oficial", vigencia_descripcion: "Cierre jornada 16/06/2026" },
  { fecha: "2026-06-18", fecha_formato_ve: "18/06/2026", tasa_bcv: 602.33, fuente: "BCV Oficial", vigencia_descripcion: "Cierre jornada 18/06/2026" },
  { fecha: "2026-06-19", fecha_formato_ve: "19/06/2026", tasa_bcv: 607.39, fuente: "BCV Oficial", vigencia_descripcion: "Cierre jornada 19/06/2026" },
  { fecha: "2026-07-01", fecha_formato_ve: "01/07/2026", tasa_bcv: 633.36, fuente: "BCV Oficial", vigencia_descripcion: "Cierre jornada 01/07/2026" },
  { fecha: "2026-07-07", fecha_formato_ve: "07/07/2026", tasa_bcv: 674.93, fuente: "BCV Oficial", vigencia_descripcion: "Cierre jornada 07/07/2026" },
  { fecha: "2026-07-08", fecha_formato_ve: "08/07/2026", tasa_bcv: 685.94, fuente: "BCV Oficial", vigencia_descripcion: "Cierre jornada 08/07/2026" },
  { fecha: "2026-07-10", fecha_formato_ve: "10/07/2026", tasa_bcv: 709.69, fuente: "BCV Oficial", vigencia_descripcion: "Cierre jornada 10/07/2026" },
  { fecha: "2026-07-13", fecha_formato_ve: "13/07/2026", tasa_bcv: 724.00, fuente: "BCV Oficial", vigencia_descripcion: "Cierre jornada 13/07/2026" },
  { fecha: "2026-07-14", fecha_formato_ve: "14/07/2026", tasa_bcv: 724.00, fuente: "BCV Oficial", vigencia_descripcion: "Cierre jornada 14/07/2026" },
  { fecha: "2026-07-15", fecha_formato_ve: "15/07/2026", tasa_bcv: 725.75, fuente: "BCV Oficial", vigencia_descripcion: "Cierre jornada 15/07/2026" },
  { fecha: "2026-07-20", fecha_formato_ve: "20/07/2026", tasa_bcv: 737.23, fuente: "BCV Oficial", vigencia_descripcion: "Cierre jornada 20/07/2026" },
  { fecha: "2026-07-21", fecha_formato_ve: "21/07/2026", tasa_bcv: 737.23, fuente: "BCV Oficial", vigencia_descripcion: "Cierre jornada 21/07/2026" },
  { fecha: "2026-07-27", fecha_formato_ve: "27/07/2026", tasa_bcv: 742.23, fuente: "BCV Oficial", vigencia_descripcion: "Cierre jornada 27/07/2026" },
  { fecha: "2026-07-29", fecha_formato_ve: "29/07/2026", tasa_bcv: 744.23, fuente: "BCV Oficial", vigencia_descripcion: "Cierre jornada 29/07/2026" },
  { fecha: "2026-08-03", fecha_formato_ve: "03/08/2026", tasa_bcv: 748.79, fuente: "BCV Oficial", vigencia_descripcion: "Cierre jornada 03/08/2026" },
  { fecha: "2026-08-05", fecha_formato_ve: "05/08/2026", tasa_bcv: 755.16, fuente: "BCV Oficial", vigencia_descripcion: "Cierre jornada 05/08/2026" },
  { fecha: "2026-08-12", fecha_formato_ve: "12/08/2026", tasa_bcv: 766.86, fuente: "BCV Oficial", vigencia_descripcion: "Cierre jornada 12/08/2026" },
  { fecha: "2026-08-28", fecha_formato_ve: "28/08/2026", tasa_bcv: 791.67, fuente: "BCV Oficial", vigencia_descripcion: "Cierre jornada 28/08/2026" }
];

export const MAPA_TASAS_BCV: Record<string, number> = Object.fromEntries(
  HISTORICO_TASAS_BCV_2026.map(r => [r.fecha, r.tasa_bcv])
);

/**
 * Obtiene la tasa oficial BCV aplicable a una fecha contable determinada.
 * Si la fecha exacta no tuvo publicación bancaria (fin de semana o feriado),
 * se aplica la última tasa oficial BCV publicada y vigente para esa fecha valor,
 * conforme al marco cambiario venezolano y las resoluciones del BCV.
 */
export function obtenerTasaBcvPorFecha(fechaStr: string): number {
  if (MAPA_TASAS_BCV[fechaStr]) {
    return MAPA_TASAS_BCV[fechaStr];
  }
  
  // Buscar la tasa anterior más reciente publicada
  const fechasOrdenadas = HISTORICO_TASAS_BCV_2026.map(r => r.fecha).sort();
  const precedentes = fechasOrdenadas.filter(f => f <= fechaStr);
  if (precedentes.length > 0) {
    const ultimaFecha = precedentes[precedentes.length - 1];
    return MAPA_TASAS_BCV[ultimaFecha];
  }

  // Fallback si es anterior al primer registro
  return HISTORICO_TASAS_BCV_2026[0].tasa_bcv;
}

export function obtenerDetalleTasaBcv(fechaStr: string): { tasa: number; tipo: "exacta" | "vigente_precedente"; fechaVigente: string } {
  if (MAPA_TASAS_BCV[fechaStr]) {
    return { tasa: MAPA_TASAS_BCV[fechaStr], tipo: "exacta", fechaVigente: fechaStr };
  }
  const fechasOrdenadas = HISTORICO_TASAS_BCV_2026.map(r => r.fecha).sort();
  const precedentes = fechasOrdenadas.filter(f => f <= fechaStr);
  if (precedentes.length > 0) {
    const ultimaFecha = precedentes[precedentes.length - 1];
    return { tasa: MAPA_TASAS_BCV[ultimaFecha], tipo: "vigente_precedente", fechaVigente: ultimaFecha };
  }
  return { tasa: HISTORICO_TASAS_BCV_2026[0].tasa_bcv, tipo: "vigente_precedente", fechaVigente: HISTORICO_TASAS_BCV_2026[0].fecha };
}
