export function formatVES(amount: number): string {
  if (isNaN(amount)) return 'Bs. 0,00';
  return 'Bs. ' + new Intl.NumberFormat('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatUSD(amount: number): string {
  if (isNaN(amount)) return '$ 0.00';
  return '$ ' + new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatUSDT(amount: number): string {
  if (isNaN(amount)) return '0.00 USDT';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount) + ' USDT';
}

export function formatFechaLarga(fechaStr: string): string {
  if (!fechaStr) return '';
  const meses = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  // Format YYYY-MM-DD
  const parts = fechaStr.split('-');
  if (parts.length === 3) {
    const dia = parseInt(parts[2], 10);
    const mesIndex = parseInt(parts[1], 10) - 1;
    const anio = parts[0];
    return `${dia} de ${meses[mesIndex] || ''} de ${anio}`;
  }
  return fechaStr;
}

const UNIDADES = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
const DIEZ_A_DIECINUEVE = ['DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISÉIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
const DECENAS = ['', '', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
const CENTENAS = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];

function convertirGrupo(n: number): string {
  let salida = '';
  if (n === 100) return 'CIEN';
  if (n > 99) {
    salida += CENTENAS[Math.floor(n / 100)] + ' ';
    n = n % 100;
  }
  if (n >= 10 && n <= 19) {
    salida += DIEZ_A_DIECINUEVE[n - 10] + ' ';
  } else if (n >= 20 && n <= 29) {
    if (n === 20) salida += 'VEINTE ';
    else salida += 'VEINTI' + UNIDADES[n - 20] + ' ';
  } else if (n > 29) {
    salida += DECENAS[Math.floor(n / 10)] + ' ';
    if (n % 10 !== 0) salida += 'Y ' + UNIDADES[n % 10] + ' ';
  } else if (n > 0) {
    salida += UNIDADES[n] + ' ';
  }
  return salida.trim();
}

export function numeroALetras(monto: number): string {
  if (isNaN(monto) || monto === 0) return 'CERO';
  
  const entero = Math.floor(Math.abs(monto));
  const decimal = Math.round((Math.abs(monto) - entero) * 100);
  const centavosStr = decimal.toString().padStart(2, '0');

  if (entero === 0) {
    return `CERO CON ${centavosStr}/100`;
  }

  let palabras = '';
  const millones = Math.floor(entero / 1000000);
  const miles = Math.floor((entero % 1000000) / 1000);
  const unidades = entero % 1000;

  if (millones > 0) {
    if (millones === 1) palabras += 'UN MILLÓN ';
    else palabras += convertirGrupo(millones) + ' MILLONES ';
  }

  if (miles > 0) {
    if (miles === 1) palabras += 'MIL ';
    else palabras += convertirGrupo(miles) + ' MIL ';
  }

  if (unidades > 0) {
    palabras += convertirGrupo(unidades) + ' ';
  }

  return `${palabras.trim()} CON ${centavosStr}/100`;
}

export function generarHashSimulado(texto: string): string {
  let hash = 0;
  for (let i = 0; i < texto.length; i++) {
    const char = texto.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  // Return standard 64-char sha256 lookalike
  return (hex + '8f7a9c1e3b5d204a91e47b6c501f2e8d3a7c6b90124578ef90ab1234cdef5678').substring(0, 64);
}
