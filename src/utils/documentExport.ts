import { jsPDF } from 'jspdf';
import { ContratoMutuo, Empresa, Accionista, ActaAsamblea, CapitalizacionAcreencia } from '../types';
import { formatVES, formatUSD, formatUSDT, formatFechaLarga, numeroALetras } from './formatters';

/**
 * Generates the clean legal text for a Mutuo contract
 */
export function generateContractText(
  contrato: ContratoMutuo,
  empresa: Empresa,
  accionista: Accionista
): { title: string; body: string; clauses: { title: string; text: string }[] } {
  const isCrypto = contrato.tipo_activo === 'USDT';
  const isEfectivo = contrato.tipo_activo === 'USD_EFECTIVO';
  const isVES = contrato.tipo_activo === 'VES';
  const isSocioAEmpresa = contrato.tipo_flujo === 'socio_a_empresa';

  const title = isCrypto
    ? 'CONTRATO DE MUTUO DE BIENES MUEBLES DIGITALES (CRIPTOPRÉSTAMO)'
    : 'CONTRATO DE MUTUO (PRÉSTAMO DE DINERO)';

  const isDirectivoOGerente =
    accionista.es_accionista === false ||
    accionista.porcentaje_acciones === 0 ||
    accionista.tipo_vinculo === 'director' ||
    accionista.tipo_vinculo === 'gerente' ||
    accionista.tipo_vinculo === 'personal_confianza';

  const condicionFirmanteTexto = isDirectivoOGerente
    ? `en su condición de ${accionista.cargo_o_condicion || 'Director / Gerente'} y personal de confianza de la sociedad mercantil`
    : `en su cualidad de accionista titular del ${accionista.porcentaje_acciones}% del capital social de la compañía`;

  const condicionFirmanteHTML = isDirectivoOGerente
    ? `en su carácter de <strong>${accionista.cargo_o_condicion || 'Director / Gerente'}</strong> y personal de confianza de la sociedad mercantil`
    : `en su carácter de accionista titular del <strong>${accionista.porcentaje_acciones}%</strong> del capital social`;

  const cargoFirmaHTML = isDirectivoOGerente
    ? `${accionista.cargo_o_condicion || 'Director / Gerente de Confianza'}${accionista.departamento ? ` (${accionista.departamento})` : ''}`
    : `Accionista (${accionista.porcentaje_acciones}% Acciones)`;

  const preamble = `Nosotros, ${empresa.razon_social}, sociedad mercantil domiciliada en ${empresa.ciudad}, Estado ${empresa.estado}, constituida e inscrita por ante el ${empresa.registro_mercantil}, inscrita en el Registro Único de Información Fiscal (R.I.F.) Nro. ${empresa.rif_empresa}, debidamente representada en este acto por su ${empresa.cargo_representante}, ciudadano(a) ${empresa.representante_legal}, titular de la Cédula de Identidad Nro. ${empresa.cedula_representante}, en lo sucesivo denominada "${isSocioAEmpresa ? 'LA MUTUARIA' : 'LA MUTUANTE'}", por una parte; y por la otra, el ciudadano(a) ${accionista.nombre_accionista}, de nacionalidad venezolana, mayor de edad, titular de la Cédula de Identidad Nro. ${accionista.cedula_accionista} y del R.I.F. Nro. ${accionista.rif_accionista}, ${condicionFirmanteTexto}, quien en lo sucesivo se denominará "${isSocioAEmpresa ? 'EL MUTUANTE' : 'EL MUTUARIO'}", hemos convenido en celebrar como en efecto celebramos el presente ${title}, el cual se regirá por las disposiciones del Código Civil de Venezuela, el Código de Comercio y por las siguientes cláusulas:`;

  const clauses: { title: string; text: string }[] = [];

  if (isCrypto) {
    clauses.push({
      title: 'PRIMERA (OBJETO Y NATURALEZA DEL ACTIVO)',
      text: `${isSocioAEmpresa ? 'EL MUTUANTE' : 'LA MUTUANTE'} entrega a título de mutuo a ${isSocioAEmpresa ? 'LA MUTUARIA' : 'EL MUTUARIO'}, un bien mueble intangible y digital, específicamente la cantidad de ${numeroALetras(contrato.monto_original)} TOKENS DE LA CRIPTOMONEDA ESTABLE DENOMINADA UNITED STATES DOLLAR TETHER (${formatUSDT(contrato.monto_original)}). Las partes reconocen que el token USDT es un criptoactivo fungible respaldado en valor paritario con el Dólar de los Estados Unidos de América, ampliamente aceptado en transacciones comerciales lícitas en la República Bolivariana de Venezuela.`,
    });

    clauses.push({
      title: 'SEGUNDA (ENTREGA, RED Y VERIFICACIÓN BLOCKCHAIN - PRUEBA MATERIAL)',
      text: `La entrega efectiva e irreversible del activo se efectuó mediante transferencia electrónica en la red de bloques ${contrato.soporte.red_blockchain || 'TRON (TRC-20)'}, originada desde la Billetera Digital (Wallet) propiedad de ${isSocioAEmpresa ? 'EL MUTUANTE' : 'LA MUTUANTE'}, dirección: [${contrato.soporte.wallet_origen || 'Wallet_Origen'}], con destino a la Billetera Digital corporativa propiedad de ${isSocioAEmpresa ? 'LA MUTUARIA' : 'EL MUTUARIO'}, dirección: [${contrato.soporte.wallet_destino || 'Wallet_Destino'}]. Identificador Hash (TXID): [${contrato.soporte.txid_blockchain || 'TXID_PENDIENTE'}], ejecutada en fecha ${formatFechaLarga(contrato.soporte.fecha_transaccion)}. La consulta pública del referido Hash en el explorador de bloques constituye prueba plena ante cualquier ente de fiscalización.`,
    });

    clauses.push({
      title: 'TERCERA (VALORACIÓN CONTABLE Y FISCAL VEN-NIF)',
      text: `A los efectos de su asentamiento contable en los libros de la empresa conforme a VEN-NIF y exigencias del SENIAT, se registra la operación en moneda de curso legal por la cantidad de ${formatVES(contrato.monto_indexado_ves)} (${numeroALetras(contrato.monto_indexado_ves)} BOLÍVARES), calculados a la tasa de cambio oficial de referencia del Banco Central de Venezuela (BCV) de Bs. ${contrato.tasa_bcv_fecha.toFixed(2)} por unidad para la fecha de la transferencia.`,
    });

    clauses.push({
      title: 'CUARTA (INTERESES Y CONDICIÓN FISCAL)',
      text: isSocioAEmpresa
        ? 'El presente préstamo se efectúa a título estrictamente gratuito, motivado directamente en la condición de socio del MUTUANTE y su interés en el financiamiento de la empresa, no devengando intereses de ninguna naturaleza para enervar la presunción de intereses prevista en las leyes tributarias.'
        : `Por tratarse de un préstamo otorgado por la sociedad a su accionista y para mitigar la presunción de dividendo del Artículo 72 de la Ley de Impuesto Sobre la Renta (LISLR), la operación devengará una tasa de interés comercial pactada del ${contrato.tasa_interes || 1.5}% mensual, debiendo facturarse y declararse como ingresos gravables.`,
    });

    clauses.push({
      title: 'QUINTA (DESTINO DE LOS FONDOS Y PLAZO)',
      text: `Los fondos son destinados expresamente a: "${contrato.destino_fondos}". La restitución de los tokens USDT entregados se efectuará en un plazo no mayor a ${contrato.plazo_meses} meses, con fecha límite improrrogable el ${formatFechaLarga(contrato.fecha_vencimiento)}.`,
    });

    clauses.push({
      title: 'SEXTA (DOMICILIO Y JURISDICCIÓN)',
      text: `Para todos los efectos derivados de este contrato, las partes eligen como domicilio especial, único y excluyente la ciudad de ${empresa.ciudad}, Estado ${empresa.estado}, a la jurisdicción de cuyos tribunales declaran someterse. Se otorgan dos (02) ejemplares de un mismo tenor y efecto el ${formatFechaLarga(contrato.fecha_inicio)}.`,
    });
  } else if (contrato.tipo_flujo === 'empresa_a_socio') {
    // BLINDAJE ART. 72 & 73 LISLR: Cuentas por Cobrar Socios o Directores
    const montoUSD = contrato.monto_indexado_usd || (contrato.tipo_activo === 'VES' ? contrato.monto_original / contrato.tasa_bcv_fecha : contrato.monto_original);
    const montoVES = contrato.monto_indexado_ves || (contrato.tipo_activo === 'VES' ? contrato.monto_original : contrato.monto_original * contrato.tasa_bcv_fecha);
    const montoLetrasUSD = numeroALetras(montoUSD).toUpperCase();
    const montoLetrasVES = numeroALetras(montoVES).toUpperCase();

    // 1. OBJETO Y EXPRESIÓN DINERARIA
    clauses.push({
      title: 'CLÁUSULA PRIMERA (OBJETO Y EXPRESIÓN DINERARIA)',
      text: `LA MUTUANTE concede a EL MUTUARIO a título de mutuo mercantil la cantidad de ${montoLetrasUSD} DÓLARES DE LOS ESTADOS UNIDOS DE AMÉRICA ($${formatUSD(montoUSD)} USD), equivalentes a la fecha de este otorgamiento a la suma de ${montoLetrasVES} BOLÍVARES (${formatVES(montoVES)} Bs.), calculados al tipo de cambio oficial de referencia publicado por el Banco Central de Venezuela (BCV) de Bs. ${contrato.tasa_bcv_fecha.toFixed(2)} por dólar. Las partes convienen que la moneda de cuenta podrá ser el Dólar de los Estados Unidos de América (USD) o la Unidad de Valor de Crédito (UVC), y la moneda de pago de curso legal en Bolívares (Bs.) de conformidad con la normativa del BCV y la legislación monetaria patria vigente.`,
    });

    // 2. BANCARIZACIÓN OBLIGATORIA
    const bancoOrigen = contrato.soporte?.banco_origen || 'Banco Mercantil';
    const bancoDestino = contrato.soporte?.banco_destino || 'Banesco Banco Universal';
    const cuentaOrigen = contrato.soporte?.numero_cuenta_origen || '0105-0114-88-9876543210';
    const cuentaDestino = contrato.soporte?.numero_cuenta_destino || '0134-0012-34-1234567890';
    const refBancaria = contrato.soporte?.referencia_bancaria || 'REF-TRANSF-BCV-7741';

    clauses.push({
      title: 'CLÁUSULA SEGUNDA (BANCARIZACIÓN OBLIGATORIA Y COMPROBACIÓN ANTE EL SENIAT)',
      text: `En estricto cumplimiento de los principios de trazabilidad bancaria y materialidad tributaria exigidos por el Servicio Nacional Integrado de Administración Aduanera y Tributaria (SENIAT), la totalidad del desembolso objeto de este contrato se ejecuta única y exclusivamente mediante transferencia bancaria electrónica y verificable, desde la cuenta bancaria de LA MUTUANTE Nro. ${cuentaOrigen} en ${bancoOrigen}, hacia la cuenta personal bancaria de EL MUTUARIO Nro. ${cuentaDestino} en ${bancoDestino}, bajo la referencia bancaria electrónica Nro. ${refBancaria}, en fecha ${formatFechaLarga(contrato.soporte?.fecha_transaccion || contrato.fecha_inicio)}. Las partes prohíben de forma absoluta las entregas informales de dinero o cruces de cuentas que carezcan de soporte bancario fehaciente.`,
    });

    // 3. NO SUJECIÓN AL IVA
    clauses.push({
      title: 'CLÁUSULA TERCERA (NO SUJECIÓN AL IMPUESTO AL VALOR AGREGADO - IVA)',
      text: `De conformidad con el Artículo 16, Numeral 3 de la Ley que Establece el Impuesto al Valor Agregado (LIVA), las partes reconocen expresamente que las operaciones financieras de mutuo de dinero y los intereses devengados se encuentran NO SUJETOS al IVA. En virtud de ello, LA MUTUANTE no trasladará alícuota tributaria alguna de dicho impuesto, debiendo emitir la correspondiente Nota de Débito Fiscal bajo la condición de no sujeta/exenta de IVA al cierre de cada periodo de causación, para su inclusión en la contabilidad y declaración de rentas correspondientes.`,
    });

    // 4. RETENCIÓN DE ISLR
    if (contrato.aplica_interes) {
      clauses.push({
        title: 'CLÁUSULA CUARTA (RÉGIMEN DE RETENCIÓN DE ISLR - DECRETO 1.808)',
        text: `En estricto cumplimiento de los Artículos 1 y 9 (Numeral 8) del Decreto Nro. 1.808 (Reglamento Parcial de la Ley de Impuesto Sobre la Renta en Materia de Retenciones), se deja expresa constancia de que al momento del pago o abono en cuenta de los intereses devengados —lo que ocurra primero—, se practicará la respectiva retención de ISLR, aplicando la alícuota del CINCO POR CIENTO (5%) sobre el cien por ciento (100%) del monto bruto de los intereses devengados por ser el beneficiario Persona Natural Residente (o 3% si fuese Persona Jurídica Domiciliada, o 34% para No Residentes). Dicha retención será enterada en las cuentas del Tesoro Nacional conforme al calendario oficial de Sujetos Pasivos Especiales del SENIAT.`,
      });
    }

    // 5. REGIMEN DE INTERESES COMPENSATORIOS Y BLINDAJE ART. 73 LISLR
    if (contrato.aplica_interes) {
      if (contrato.modalidad_tasa === 'indexada_uvc_16') {
        const idVigente = contrato.idi_bcv_fecha || 250.0;
        const montoUVC = contrato.monto_uvc || (montoVES / idVigente);
        clauses.push({
          title: 'CLÁUSULA QUINTA (DE LA INDEXACIÓN Y LOS INTERESES COMPENSATORIOS EN UVC)',
          text: `Las partes acuerdan expresamente que, con el objeto de mantener el valor real del capital objeto de este mutuo, la obligación dineraria se expresa bajo la metodología de Unidades de Valor de Crédito (UVC), de conformidad con las resoluciones dictadas por el Banco Central de Venezuela (BCV) (incluyendo la Resolución Nro. 26-08-01, Gaceta Oficial Extraordinaria Nro. 7.073). A tales efectos, el capital entregado en Bolívares se divide entre el Índice de Inversión (IDI) publicado por el BCV a la fecha del desembolso, determinando el número de UVC adeudadas (${montoUVC.toFixed(2)} UVC).\nPARÁGRAFO PRIMERO: Sobre el saldo deudor expresado en UVC, EL MUTUARIO pagará a LA MUTUANTE un interés compensatorio fijo del DIECISÉIS POR CIENTO (16%) anual, el cual representa la tasa mínima legal bancaria comercial vigente fijada por el Ente Emisor.\nPARÁGRAFO SEGUNDO: Al momento de cada pago mensual (sea de capital o de intereses), las UVC a amortizar se multiplicarán por el Índice de Inversión (IDI) vigente para el día respectivo, debiendo realizarse el pago en Bolívares resultantes de dicha conversión. Las partes dejan constancia de que esta estructura cumple con la equivalencia financiera del mercado y el marco fiscal del artículo 73 de la LISLR.`,
        });
      } else if (contrato.modalidad_tasa === 'divisas_usd' || contrato.modalidad_tasa === 'indexada_12_usd' || contrato.modalidad_tasa === 'indexada_usd_12') {
        const tasaMensual = contrato.tasa_interes || (contrato.tasa_interes_anual ? contrato.tasa_interes_anual / 12 : 1.0);
        const tasaAnual = contrato.tasa_interes_anual || (tasaMensual * 12);
        clauses.push({
          title: 'CLÁUSULA QUINTA (DE LOS INTERESES EN MONEDA EXTRANJERA - TASA FIJA DE MERCADO)',
          text: `El capital objeto de este contrato devengará a favor de LA MUTUANTE un interés compensatorio fijo del ${tasaAnual.toFixed(1)}% anual (${tasaMensual.toFixed(1)}% mensual), calculado sobre el saldo deudor del capital expresado en Dólares de los Estados Unidos de América (USD). Las partes dejan constancia de que la tasa aquí pactada refleja fielmente el valor del mercado financiero nacional para operaciones de financiamiento en divisas, cumpliendo las directrices del Banco Central de Venezuela y los criterios jurisprudenciales de la Sala Constitucional y Sala de Casación Civil del Tribunal Supremo de Justicia sobre obligaciones pactadas en moneda extranjera. Los intereses se liquidarán mensualmente en la moneda pactada o en su equivalente en Bolívares al tipo de cambio oficial del BCV vigente a la fecha del efectivo pago, satisfaciendo a cabalidad las exigencias del artículo 73 de la Ley de Impuesto sobre la Renta.`,
        });
      } else {
        // Nominal Variable BCV (~59.12% anual) - Criterio exacto venezolano Art. 73 LISLR
        const tasaVigente = contrato.tasa_interes_anual || 59.12;
        clauses.push({
          title: 'CLÁUSULA QUINTA (DE LOS INTERESES COMPENSATORIOS NOMINALES - TASA ACTIVA BCV ART. 73 LISLR)',
          text: `El presente contrato de mutuo es a título oneroso. Por tanto, EL MUTUARIO se obliga a pagar a LA MUTUANTE por concepto de intereses compensatorios, una tasa de interés nominal anual variable, calculada mes a mes sobre los saldos deudores del capital pendiente por restituir. Dicha tasa será la equivalente exacta a la Tasa Activa Promedio Ponderada de los seis (6) principales bancos comerciales y universales del país con mayor volumen de depósitos, fijada y publicada mensualmente por el Banco Central de Venezuela (BCV) (la cual a la presente fecha se ubica en el ${tasaVigente.toFixed(2)}% anual), ajustándose de pleno derecho al inicio de cada mes calendario de conformidad con las variaciones que sufra la referida tasa oficial. Los intereses se causarán de manera vencida y serán pagaderos dentro de los primeros cinco (5) días de cada mes subsiguiente a su causación. Esta tasa se estipula a los fines de dar estricto cumplimiento a lo previsto en el artículo 73 de la Ley de Impuesto sobre la Renta.`,
        });
      }
    } else {
      // Gratuito sin intereses corrientes
      clauses.push({
        title: 'CLÁUSULA QUINTA (CARÁCTER GRATUITO DEL MUTUO Y SALVAGUARDA OPERATIVA)',
        text: `Las partes declaran de forma expresa, voluntaria e irrevocable, de conformidad con el artículo 1.745 del Código Civil de Venezuela, que el presente contrato de mutuo se pacta a TÍTULO ESTRICTAMENTE GRATUITO, por lo que NO devengará intereses corrientes ordinarios. Esta gratuidad se establece en virtud de la vinculación de confianza con la empresa y para el cumplimiento de fines operativos estrictamente lícitos (tales como anticipos para gastos por comprobar o compras urgentes por cuenta de la sociedad). EL MUTUARIO se obliga formalmente a presentar la debida rendición de cuentas, comprobantes contables y/o restituir la totalidad de los fondos antes del cierre del ejercicio económico en curso de la sociedad para dar cumplimiento a las previsiones de los Artículos 72 y 73 de la LISLR, conociendo las partes los efectos fiscales aplicables en caso de fondos no reintegrados.`,
      });
    }

    // 6. CLÁUSULA DE INTERESES MORATORIOS
    const isUVC = contrato.modalidad_tasa === 'indexada_uvc_16';
    const isDivisas = contrato.modalidad_tasa === 'divisas_usd' || contrato.modalidad_tasa === 'indexada_12_usd' || contrato.modalidad_tasa === 'indexada_usd_12';
    const textoMora = isUVC
      ? `cero coma ochenta por ciento (0,80%) anual adicional sobre el saldo deudor expresado en UVC, conforme al límite fijado por el Banco Central de Venezuela para obligaciones indexadas`
      : isDivisas
      ? `dos por ciento (2,0%) anual adicional sobre el capital insoluto expresado en divisas`
      : `tres por ciento (3,0%) anual adicional, calculada sobre la porción de capital vencido y no pagado`;

    clauses.push({
      title: 'CLÁUSULA SEXTA (DE LOS INTERESES MORATORIOS)',
      text: `En caso de que EL MUTUARIO incumpla con el pago oportuno de cualquiera de las cuotas de capital o intereses pactadas, entrará en mora de pleno derecho sin necesidad de requerimiento previo. Durante el tiempo que persista el retraso, además de los intereses compensatorios aquí pactados, se causará un interés moratorio computado a una tasa de ${textoMora}, hasta la total y definitiva resolución del saldo adeudado, conforme a las directrices y límites máximos establecidos por el Banco Central de Venezuela.`,
    });

    // 7. CLÁUSULA DE APROBACIÓN CORPORATIVA (LIBRO DE ACTAS DE ASAMBLEA - BLINDAJE SENIAT)
    const fechaAsamblea = contrato.acta_asamblea_fecha || '15 de enero de 2026';
    const numActa = contrato.acta_asamblea_numero || 'ASAM-EXT-2026-01';
    const paginasLibro = contrato.libro_actas_paginas || '45 a la 48';
    clauses.push({
      title: 'CLÁUSULA SÉPTIMA (DE LA APROBACIÓN CORPORATIVA Y SOPORTE LEGAL - BLINDAJE SENIAT)',
      text: `Las partes dejan expresa constancia de que la celebración del presente contrato de mutuo, así como sus condiciones de plazo, montos e intereses, fueron previamente discutidas y aprobadas por unanimidad en la Asamblea General de Accionistas de la sociedad mercantil LA MUTUANTE, celebrada en fecha ${fechaAsamblea} (bajo el Acta identificada como Nro. ${numActa}). Dicha aprobación consta debidamente asentada en las páginas número ${paginasLibro} del Libro de Actas de Asambleas de Accionistas de la compañía, el cual se encuentra legalmente foliado, sellado y registrado ante el ${empresa.registro_mercantil}. En consecuencia, este negocio jurídico constituye una obligación líquida, exigible y plenamente válida de carácter corporativo, de conformidad con lo establecido en el artículo 280 del Código de Comercio y la legislación tributaria nacional, descartando de plano cualquier naturaleza distinta a la de un préstamo mercantil oneroso o presunción de dividendo encubierto ante el SENIAT.`,
    });

    // 8. DESTINO DE LOS FONDOS Y PLAZO
    clauses.push({
      title: 'CLÁUSULA OCTAVA (DESTINO DE LOS FONDOS, PLAZO Y RESTITUCIÓN)',
      text: `Los fondos concedidos son destinados exclusivamente para: "${contrato.destino_fondos}". ${contrato.motivo_comercial ? `Justificación comercial documentada: ${contrato.motivo_comercial}.` : ''} El plazo acordado es de ${contrato.plazo_meses} meses, fijándose el vencimiento final improrrogable el ${formatFechaLarga(contrato.fecha_vencimiento)}, fecha en la cual el saldo total deberá encontrarse íntegramente restituido y cancelado en las cuentas bancarias de la empresa.`,
    });

    // 9. DOMICILIO Y JURISDICCIÓN
    clauses.push({
      title: 'CLÁUSULA NOVENA (DOMICILIO Y JURISDICCIÓN)',
      text: `Para todos los efectos y controversias derivados del presente contrato, las partes eligen como domicilio especial, único y excluyente la ciudad de ${empresa.ciudad}, Estado ${empresa.estado}, a la jurisdicción de cuyos tribunales declaran someterse. Se firman dos (02) ejemplares de un mismo tenor y efecto en ${empresa.ciudad}, el ${formatFechaLarga(contrato.fecha_inicio)}.`,
    });
  } else {
    // Socio a Empresa: Préstamo de Socio para Capital de Trabajo
    const montoUSD = contrato.monto_indexado_usd || (contrato.tipo_activo === 'VES' ? contrato.monto_original / contrato.tasa_bcv_fecha : contrato.monto_original);
    const montoLetrasUSD = numeroALetras(montoUSD).toUpperCase();

    clauses.push({
      title: 'CLÁUSULA PRIMERA (OBJETO Y EXPRESIÓN EN DIVISAS - DOBLE MONEDA)',
      text: `EL MUTUANTE entrega en calidad de mutuo a LA MUTUARIA la cantidad de ${montoLetrasUSD} DÓLARES DE LOS ESTADOS UNIDOS DE AMÉRICA ($${formatUSD(montoUSD)} USD), acordándose como moneda de cuenta el Dólar (USD) y moneda de pago Bolívares (Bs.) o divisas. Si la entrega se realiza en Bolívares (${formatVES(contrato.monto_original)} Bs.), el monto se indexa a la tasa oficial del Banco Central de Venezuela (BCV) de Bs. ${contrato.tasa_bcv_fecha.toFixed(2)} por dólar vigente a la fecha de la transacción.`,
    });

    clauses.push({
      title: 'CLÁUSULA SEGUNDA (ENTREGA Y COMPROBACIÓN ANTE EL SENIAT)',
      text: isEfectivo
        ? `La entrega de los fondos se realizó físicamente en billetes de curso legal en las oficinas de la empresa, expidiéndose simultáneamente el RECIBO DE INGRESO A CAJA PRINCIPAL Nro. ${contrato.soporte.recibo_caja_correlativo || 'REC-001'} en fecha ${formatFechaLarga(contrato.soporte.fecha_transaccion)}, el cual forma parte indivisible de la contabilidad mercantil de la compañía.`
        : `La entrega se ejecutó mediante transferencia bancaria desde la cuenta Nro. ${contrato.soporte.numero_cuenta_origen || '0134...'} en ${contrato.soporte.banco_origen || 'Banco Origen'}, hacia la cuenta Nro. ${contrato.soporte.numero_cuenta_destino || '0105...'} en ${contrato.soporte.banco_destino || 'Banco Destino'}, bajo la Referencia Bancaria ${contrato.soporte.referencia_bancaria || 'REF-BANCARIA'} en fecha ${formatFechaLarga(contrato.soporte.fecha_transaccion)}.`,
    });

    if (contrato.aplica_interes) {
      const tasaMensual = contrato.tasa_interes || (contrato.tasa_interes_anual ? contrato.tasa_interes_anual / 12 : 1.0);
      const tasaAnual = contrato.tasa_interes_anual || (tasaMensual * 12);
      clauses.push({
        title: 'CLÁUSULA TERCERA (DE LOS INTERESES CORRIENTES Y REMUNERACIÓN DEL PRÉSTAMO)',
        text: `Las partes acuerdan expresamente que la operación devengará un interés corriente del ${tasaMensual.toFixed(1)}% mensual (equivalente al ${tasaAnual.toFixed(1)}% anual), el cual será liquidado mensualmente conforme al tipo de cambio oficial de referencia del BCV, mediante la emisión de Nota de Débito Fiscal No Sujeta al IVA (Art. 16 Num. 3 LIVA), practicándose la correspondiente retención de Impuesto Sobre la Renta (ISLR) del 5% para Personas Naturales Residentes de conformidad con el Decreto 1.808.`,
      });
    } else {
      clauses.push({
        title: 'CLÁUSULA TERCERA (GRATUIDAD EXPRESA Y AUSENCIA DE INTERESES OCULTOS)',
        text: `Las partes declaran de forma expresa e irrevocable que el presente mutuo se concede a TÍTULO ESTRICTAMENTE GRATUITO (Art. 1.745 Código Civil), no devengando intereses corrientes de ninguna naturaleza en consideración a la cualidad de accionista o directivo de EL MUTUANTE y su legítimo interés societario en el apalancamiento operativo de la empresa, enervando cualquier presunción de intereses ocultos o enriquecimientos netos no declarados ante el SENIAT.`,
      });
    }

    clauses.push({
      title: 'CLÁUSULA CUARTA (NO SUJECIÓN AL IMPUESTO AL VALOR AGREGADO - IVA)',
      text: `De conformidad con el Artículo 16, Numeral 3 de la Ley que Establece el Impuesto al Valor Agregado (LIVA), la presente operación de préstamo de dinero se encuentra expresamente NO SUJETA al IVA, no generando débito fiscal alguno.`,
    });

    clauses.push({
      title: 'CLÁUSULA QUINTA (DESTINO Y APLICACIÓN DE FONDOS)',
      text: `Los fondos recibidos serán aplicados de manera estricta y comprobable para: "${contrato.destino_fondos}".`,
    });

    const fechaAsam = contrato.acta_asamblea_fecha || '15 de enero de 2026';
    const numAsam = contrato.acta_asamblea_numero || 'ASAM-EXT-2026-01';
    const pagLibro = contrato.libro_actas_paginas || '45 a la 48';
    clauses.push({
      title: 'CLÁUSULA SEXTA (APROBACIÓN EN ASAMBLEA Y ASENTAMIENTO EN LIBRO DE ACTAS)',
      text: `La recepción de los fondos en calidad de mutuo y sus condiciones de restitución fueron expresamente conocidas y autorizadas por la Asamblea General de Accionistas de LA MUTUARIA celebrada el ${fechaAsam} (${numAsam}), según consta asentado en las páginas Nro. ${pagLibro} del Libro de Actas de Asambleas de Accionistas sellado por el ${empresa.registro_mercantil}, sirviendo de soporte fehaciente de la acreencia ante el SENIAT y a los fines de su eventual capitalización o pago.`,
    });

    clauses.push({
      title: 'CLÁUSULA SÉPTIMA (PLAZO, RESTITUCIÓN Y JURISDICCIÓN)',
      text: `El plazo acordado para la restitución del capital es de ${contrato.plazo_meses} meses, con vencimiento el ${formatFechaLarga(contrato.fecha_vencimiento)}. Las partes eligen como domicilio especial la ciudad de ${empresa.ciudad}, Estado ${empresa.estado}. Se firman dos (02) ejemplares en ${empresa.ciudad}, el ${formatFechaLarga(contrato.fecha_inicio)}.`,
    });
  }

  const fullBody = preamble + '\n\n' + clauses.map(c => `${c.title}:\n${c.text}`).join('\n\n');

  return { title, body: fullBody, clauses };
}

/**
 * Downloads the contract as a natively formatted Microsoft Word document (.doc)
 */
export function downloadContractWord(
  contrato: ContratoMutuo,
  empresa: Empresa,
  accionista: Accionista
): void {
  const { title, clauses } = generateContractText(contrato, empresa, accionista);
  const isSocioAEmpresa = contrato.tipo_flujo === 'socio_a_empresa';

  const isDirectivoOGerente =
    accionista.es_accionista === false ||
    accionista.porcentaje_acciones === 0 ||
    accionista.tipo_vinculo === 'director' ||
    accionista.tipo_vinculo === 'gerente' ||
    accionista.tipo_vinculo === 'personal_confianza';

  const condicionFirmanteHTML = isDirectivoOGerente
    ? `en su carácter de <strong>${accionista.cargo_o_condicion || 'Director / Gerente'}</strong> y personal de confianza de la sociedad mercantil`
    : `en su carácter de accionista titular del <strong>${accionista.porcentaje_acciones}%</strong> del capital social`;

  const cargoFirmaHTML = isDirectivoOGerente
    ? `${accionista.cargo_o_condicion || 'Director / Gerente de Confianza'}${accionista.departamento ? ` (${accionista.departamento})` : ''}`
    : `Accionista (${accionista.porcentaje_acciones}% Acciones)`;

  const htmlContent = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" 
          xmlns:w="urn:schemas-microsoft-com:office:word" 
          xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <title>${title} - ${contrato.correlativo}</title>
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>100</w:Zoom>
          <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
        @page {
          size: letter;
          margin: 2.5cm 2.5cm 2.5cm 2.5cm;
          mso-header-margin: 35.4pt;
          mso-footer-margin: 35.4pt;
        }
        body {
          font-family: 'Times New Roman', Times, serif;
          font-size: 11.5pt;
          line-height: 1.4;
          color: #000000;
          text-align: justify;
        }
        .header-table {
          width: 100%;
          border-bottom: 2pt solid #1e3a8a;
          margin-bottom: 18pt;
          padding-bottom: 6pt;
          table-layout: fixed;
        }
        .company-name {
          font-size: 13pt;
          font-weight: bold;
          color: #1e3a8a;
          text-transform: uppercase;
          word-break: break-word;
        }
        .company-details {
          font-size: 9.5pt;
          color: #334155;
        }
        .doc-title {
          font-size: 14pt;
          font-weight: bold;
          text-align: center;
          margin-top: 14pt;
          margin-bottom: 8pt;
          color: #0f172a;
        }
        .correlativo-badge {
          text-align: center;
          font-size: 10pt;
          font-family: 'Courier New', monospace;
          font-weight: bold;
          color: #1e3a8a;
          margin-bottom: 16pt;
        }
        p.clause-title {
          font-weight: bold;
          margin-top: 12pt;
          margin-bottom: 3pt;
          text-align: justify;
        }
        p.clause-text {
          margin-top: 0;
          margin-bottom: 10pt;
          text-indent: 24pt;
          text-align: justify;
        }
        .signatures-table {
          width: 100%;
          margin-top: 36pt;
          border-collapse: collapse;
          table-layout: fixed;
          page-break-inside: avoid;
        }
        .signature-cell {
          width: 50%;
          text-align: center;
          vertical-align: top;
          padding: 10pt;
        }
      </style>
    </head>
    <body>
      <table class="header-table" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="width: 70%; vertical-align: top;">
            <div class="company-name">${empresa.razon_social}</div>
            <div class="company-details">R.I.F. ${empresa.rif_empresa} • ${empresa.registro_mercantil}</div>
            <div class="company-details">Domicilio Fiscal: ${empresa.direccion_fiscal}, ${empresa.ciudad}, Estado ${empresa.estado}</div>
          </td>
          <td style="width: 30%; text-align: right; vertical-align: top;">
            <div style="font-size: 9pt; font-weight: bold; color: #1e3a8a;">EXPEDIENTE TRIBUTARIO</div>
            <div style="font-size: 8pt; color: #64748b;">Art. 72 LISLR / VEN-NIF</div>
          </td>
        </tr>
      </table>

      <div class="doc-title">${title}</div>
      <div class="correlativo-badge">INSTRUMENTO LEGAL NRO: ${contrato.correlativo}</div>

      <p class="clause-text">
        Nosotros, <strong>${empresa.razon_social}</strong>, sociedad mercantil debidamente domiciliada en ${empresa.ciudad}, Estado ${empresa.estado}, inscrita en el Registro Mercantil bajo el R.I.F. Nro. <strong>${empresa.rif_empresa}</strong>, representada en este acto por su ${empresa.cargo_representante}, ciudadano(a) <strong>${empresa.representante_legal}</strong>, titular de la Cédula de Identidad Nro. <strong>${empresa.cedula_representante}</strong>, en lo sucesivo denominada "${isSocioAEmpresa ? 'LA MUTUARIA' : 'LA MUTUANTE'}", por una parte; y por la otra, el ciudadano(a) <strong>${accionista.nombre_accionista}</strong>, titular de la Cédula de Identidad Nro. <strong>${accionista.cedula_accionista}</strong> y R.I.F. Nro. <strong>${accionista.rif_accionista}</strong>, ${condicionFirmanteHTML}, quien se denominará "${isSocioAEmpresa ? 'EL MUTUANTE' : 'EL MUTUARIO'}", convenimos en suscribir el presente instrumento bajo las siguientes cláusulas:
      </p>

      ${clauses.map(c => `
        <p class="clause-title">${c.title}</p>
        <p class="clause-text">${c.text}</p>
      `).join('')}

      <table class="signatures-table" width="100%" cellpadding="0" cellspacing="0">
        <colgroup>
          <col width="50%" />
          <col width="50%" />
        </colgroup>
        <tr>
          <td class="signature-cell">
            <table width="85%" align="center" style="margin: 0 auto 6pt auto; border-top: 1.5pt solid #000000; border-collapse: collapse;">
              <tr><td style="font-size: 1pt; height: 1px; line-height: 1px;">&nbsp;</td></tr>
            </table>
            <strong>${empresa.representante_legal}</strong><br/>
            C.I. V-${empresa.cedula_representante}<br/>
            ${empresa.cargo_representante}<br/>
            <span style="font-size: 9pt; text-transform: uppercase;">${empresa.razon_social}</span>
          </td>
          <td class="signature-cell">
            <table width="85%" align="center" style="margin: 0 auto 6pt auto; border-top: 1.5pt solid #000000; border-collapse: collapse;">
              <tr><td style="font-size: 1pt; height: 1px; line-height: 1px;">&nbsp;</td></tr>
            </table>
            <strong>${accionista.nombre_accionista}</strong><br/>
            C.I. V-${accionista.cedula_accionista}<br/>
            R.I.F. ${accionista.rif_accionista}<br/>
            <span style="font-size: 9pt;">${cargoFirmaHTML}</span>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff' + htmlContent], {
    type: 'application/msword;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Contrato_Mutuo_${contrato.correlativo}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads the contract as a crisp, professional legal PDF using jsPDF
 */
export function downloadContractPDF(
  contrato: ContratoMutuo,
  empresa: Empresa,
  accionista: Accionista
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  let y = margin;

  // Header Banner
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 58, 138); // Blue
  doc.text(empresa.razon_social.toUpperCase(), margin, y);
  y += 5;

  doc.setFont('times', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`R.I.F. ${empresa.rif_empresa} • ${empresa.registro_mercantil}`, margin, y);
  y += 4;
  doc.text(`Domicilio Fiscal: ${empresa.ciudad}, Estado ${empresa.estado}, Venezuela`, margin, y);
  y += 4;

  doc.setDrawColor(30, 58, 138);
  doc.setLineWidth(0.6);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // Document Title
  const isCrypto = contrato.tipo_activo === 'USDT';
  const docTitle = isCrypto
    ? 'CONTRATO DE MUTUO DE BIENES MUEBLES DIGITALES'
    : 'CONTRATO DE MUTUO (PRÉSTAMO DE DINERO)';

  doc.setFont('times', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(docTitle, pageWidth / 2, y, { align: 'center' });
  y += 5;

  doc.setFont('courier', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 58, 138);
  doc.text(`CORRELATIVO OFICIAL: ${contrato.correlativo}`, pageWidth / 2, y, { align: 'center' });
  y += 8;

  // Document Content
  const { clauses } = generateContractText(contrato, empresa, accionista);
  const isSocioAEmpresa = contrato.tipo_flujo === 'socio_a_empresa';

  const isDirectivoOGerente =
    accionista.es_accionista === false ||
    accionista.porcentaje_acciones === 0 ||
    accionista.tipo_vinculo === 'director' ||
    accionista.tipo_vinculo === 'gerente' ||
    accionista.tipo_vinculo === 'personal_confianza';

  const condicionFirmantePDF = isDirectivoOGerente
    ? `en su condición de ${accionista.cargo_o_condicion || 'Director / Gerente'} y personal de confianza de la sociedad`
    : `accionista titular del ${accionista.porcentaje_acciones}% del capital social`;

  const cargoFirmaPDF = isDirectivoOGerente
    ? `${accionista.cargo_o_condicion || 'Director / Gerente de Confianza'}`
    : `Accionista (${accionista.porcentaje_acciones}%)`;

  const preamble = `Nosotros, ${empresa.razon_social}, R.I.F. Nro. ${empresa.rif_empresa}, debidamente representada por su ${empresa.cargo_representante}, ciudadano(a) ${empresa.representante_legal}, C.I. V-${empresa.cedula_representante}, ("${isSocioAEmpresa ? 'LA MUTUARIA' : 'LA MUTUANTE'}"), por una parte; y el ciudadano(a) ${accionista.nombre_accionista}, C.I. V-${accionista.cedula_accionista}, R.I.F. ${accionista.rif_accionista}, ${condicionFirmantePDF} ("${isSocioAEmpresa ? 'EL MUTUANTE' : 'EL MUTUARIO'}"), convenimos en suscribir el presente CONTRATO DE MUTUO bajo las siguientes cláusulas:`;

  doc.setFont('times', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);

  const splitPreamble = doc.splitTextToSize(preamble, contentWidth);
  doc.text(splitPreamble, margin, y);
  y += splitPreamble.length * 4.5 + 4;

  // Loop through clauses with pagination check
  for (const clause of clauses) {
    // Check if we need a new page for clause title + some lines
    if (y > pageHeight - 35) {
      doc.addPage();
      y = margin;
    }

    doc.setFont('times', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text(clause.title, margin, y);
    y += 4.5;

    doc.setFont('times', 'normal');
    const splitClause = doc.splitTextToSize(clause.text, contentWidth);

    // If clause text spills across page boundary
    for (let i = 0; i < splitClause.length; i++) {
      if (y > pageHeight - 25) {
        doc.addPage();
        y = margin;
      }
      doc.text(splitClause[i], margin, y);
      y += 4.2;
    }
    y += 3;
  }

  // Signatures
  if (y > pageHeight - 35) {
    doc.addPage();
    y = margin + 10;
  }

  const col1X = margin + 20;
  const col2X = margin + contentWidth - 45;

  doc.setDrawColor(100, 116, 139);
  doc.setLineWidth(0.4);
  doc.line(col1X - 15, y, col1X + 35, y);
  doc.line(col2X - 25, y, col2X + 25, y);
  y += 4;

  doc.setFont('times', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(empresa.representante_legal, col1X + 10, y, { align: 'center' });
  doc.text(accionista.nombre_accionista, col2X, y, { align: 'center' });
  y += 4;

  doc.setFont('times', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`C.I. V-${empresa.cedula_representante} (${empresa.cargo_representante})`, col1X + 10, y, { align: 'center' });
  doc.text(`C.I. V-${accionista.cedula_accionista} (${cargoFirmaPDF})`, col2X, y, { align: 'center' });

  // Add Page Numbers
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont('times', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Página ${p} de ${totalPages} • Expediente Tributario ${contrato.correlativo}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
  }

  doc.save(`Contrato_Mutuo_${contrato.correlativo}.pdf`);
}

/**
 * Generates clean legal text for Acta de Asamblea matching the corporate Venezuelan model
 */
export function generateActaAsambleaText(
  acta: ActaAsamblea | undefined,
  empresa: Empresa,
  accionistas: Accionista[],
  contrato?: ContratoMutuo,
  socioBeneficiario?: Accionista
): string {
  const beneficiario = socioBeneficiario ||
    (contrato ? accionistas.find(a => a.id === contrato.accionista_id) : undefined) ||
    accionistas[0] || {
      nombre_accionista: 'Carlos Eduardo Mendoza Silva',
      cedula_accionista: '14.285.920',
      rif_accionista: 'V-14285920-1',
      porcentaje_acciones: 50,
      cargo_o_condicion: 'Accionista y Director',
    };

  const folios = acta?.libro_paginas || '45 a la 48';
  const fechaAsamblea = acta ? formatFechaLarga(acta.fecha_asamblea) : '15 de enero de 2026';
  const horaAsamblea = acta?.hora_inicio || '10:00 a.m.';

  // Shareholders presence in Universal Assembly (Art. 280 Código de Comercio)
  let sociosPresenciaTexto = '';
  const sociosValidos = accionistas.filter(a => a.empresa_id === empresa.id);

  if (sociosValidos.length >= 2) {
    sociosPresenciaTexto = sociosValidos.map((s, idx) => {
      const isLast = idx === sociosValidos.length - 1;
      const prefix = idx === 0 ? '' : (isLast ? ' y ' : '; ');
      const suffix = isLast ? ' restante del capital social' : ' del capital social';
      return `${prefix}${s.nombre_accionista}, titular de la Cédula de Identidad Nro. V-${s.cedula_accionista}, propietario de ${s.porcentaje_acciones}%${suffix}`;
    }).join('');
  } else if (sociosValidos.length === 1) {
    const s1 = sociosValidos[0];
    const s2Nombre = empresa.representante_legal !== s1.nombre_accionista ? empresa.representante_legal : 'María Alejandra Gómez Rivas';
    const s2CI = empresa.cedula_representante !== s1.cedula_accionista ? empresa.cedula_representante : '16.890.123';
    const p1 = s1.porcentaje_acciones > 0 && s1.porcentaje_acciones < 100 ? s1.porcentaje_acciones : 50;
    const p2 = 100 - p1;
    sociosPresenciaTexto = `${s1.nombre_accionista}, titular de la Cédula de Identidad Nro. V-${s1.cedula_accionista}, propietario de ${p1}% del capital social; y ${s2Nombre}, titular de la Cédula de Identidad Nro. V-${s2CI}, propietario del ${p2}% restante del capital social`;
  } else {
    sociosPresenciaTexto = `${empresa.representante_legal}, titular de la Cédula de Identidad Nro. V-${empresa.cedula_representante}, propietario de 50% del capital social; y Carlos Eduardo Mendoza Silva, titular de la Cédula de Identidad Nro. V-14.285.920, propietario del 50% restante del capital social`;
  }

  // Beneficiary condition: Accionista / Director
  const condicionBeneficiario = beneficiario.cargo_o_condicion
    ? beneficiario.cargo_o_condicion
    : (beneficiario.es_accionista !== false ? 'Accionista' : 'Director');

  // Loan amount
  let montoTexto = '';
  if (contrato) {
    if (contrato.tipo_activo === 'VES') {
      montoTexto = `${numeroALetras(contrato.monto_original)} BOLÍVARES (Bs. ${contrato.monto_original.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`;
    } else if (contrato.tipo_activo === 'USDT') {
      montoTexto = `${numeroALetras(contrato.monto_original)} CRIPTOACTIVOS USDT (${formatUSDT(contrato.monto_original)})`;
    } else {
      montoTexto = `${numeroALetras(contrato.monto_original)} DÓLARES DE LOS ESTADOS UNIDOS DE AMÉRICA ($${contrato.monto_original.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}) [equivalentes a ${formatVES(contrato.monto_indexado_ves)} a la tasa oficial del Banco Central de Venezuela]`;
    }
  } else if (acta?.monto_prestamo) {
    montoTexto = `${numeroALetras(acta.monto_prestamo)} BOLÍVARES (Bs. ${acta.monto_prestamo.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`;
  } else {
    montoTexto = `CIEN MIL BOLÍVARES (Bs. 100.000,00)`;
  }

  // Restitution term
  const plazoTexto = contrato
    ? `${contrato.plazo_meses} meses (con fecha límite de restitución al ${formatFechaLarga(contrato.fecha_vencimiento)})`
    : `${acta?.plazo_meses || 12} meses`;

  // Intereses & Modalidad
  let clausulaInteresesSegundo = '';
  const modalidad = contrato?.modalidad_tasa || acta?.regimen_interes_autorizado || 'nominal_bcv_59';

  if (modalidad === 'indexado_uvc_16') {
    clausulaInteresesSegundo = `SEGUNDO: Aprobar que dicho crédito se instrumente a través de un Contrato de Mutuo Mercantil Oneroso indexado en Unidades de Valor de Crédito (UVC) conforme a la Resolución N° 26-08-01 del Banco Central de Venezuela (BCV), devengando una tasa de interés compensatoria del dieciséis por ciento (16%) anual sobre el saldo deudor expresado en UVC, garantizando así que la empresa reciba el rendimiento legal mínimo exigido para evitar reparos tributarios.`;
  } else if (modalidad === 'divisas_usd') {
    clausulaInteresesSegundo = `SEGUNDO: Aprobar que dicho crédito en divisas se instrumente a través de un Contrato de Mutuo Mercantil Oneroso al amparo del Convenio Cambiario N° 1 del BCV, y que devengue una tasa de interés del doce por ciento (12%) anual sobre el saldo deudor, garantizando así que la empresa reciba el rendimiento legal mínimo exigido para evitar reparos tributarios.`;
  } else {
    clausulaInteresesSegundo = `SEGUNDO: Aprobar que dicho crédito en Bolívares se instrumente a través de un Contrato de Mutuo Mercantil Oneroso y que devengue intereses compensatorios mensuales calculados bajo la modalidad de Tasa Nominal Anual Variable, tomando como referencia exacta la Tasa Activa Promedio Ponderada de los seis (6) principales bancos comerciales y universales del país publicada mensualmente por el Banco Central de Venezuela (BCV), garantizando así que la empresa reciba el rendimiento legal mínimo exigido para evitar reparos tributarios.`;
  }

  return `ACTA DE ASAMBLEA EXTRAORDINARIA DE ACCIONISTAS DE LA SOCIEDAD MERCANTIL ${empresa.razon_social.toUpperCase()}
(ASENTADA EN EL LIBRO DE ASAMBLEAS DE ACCIONISTAS - FOLIOS / PÁGINAS: ${folios})

En el día de hoy, ${fechaAsamblea}, siendo las ${horaAsamblea}, se reunieron en la sede social de la compañía, ubicada en ${empresa.direccion_fiscal}, la totalidad de los accionistas que representan el cien por ciento (100%) del capital social de la firma mercantil ${empresa.razon_social}, sociedad inscrita por ante el ${empresa.registro_mercantil}, bajo el Nro. ${empresa.registro_mercantil}, con el R.I.F. Nro. ${empresa.rif_empresa}. Se constata la presencia de los siguientes ciudadanos: ${sociosPresenciaTexto}.

Estando presente la totalidad del capital social y tratándose de una Asamblea Universal, de conformidad con el artículo 280 del Código de Comercio venezolano, los accionistas acuerdan prescindir de la convocatoria por prensa y declarar válidamente constituida la Asamblea para deliberar sobre el siguiente ORDEN DEL DÍA:

ÚNICO: Discusión y aprobación del otorgamiento de un préstamo mercantil oneroso (Contrato de Mutuo) a favor del [${condicionBeneficiario}] ciudadano ${beneficiario.nombre_accionista}, con cargo a los fondos excedentes de la compañía y bajo las condiciones financieras de mercado que exigen las leyes de la República.

DESARROLLO DEL ÚNICO PUNTO DEL ORDEN DEL DÍA: Tomó la palabra el Presidente de la Asamblea, quien expuso a la consideración de los presentes la solicitud formal realizada por el ciudadano ${beneficiario.nombre_accionista}, en su carácter de [${condicionBeneficiario}], relativa a la obtención de un financiamiento temporal por parte de la empresa por la cantidad de ${montoTexto}. El Presidente consignó los informes financieros actualizados que demuestran la existencia de suficiente liquidez en las cuentas bancarias de la sociedad, validando que dicho desembolso no afecta el normal desarrollo operativo del negocio. Asimismo, recalcó que, para dar estricto cumplimiento al artículo 73 de la Ley de Impuesto sobre la Renta y evitar contingencias fiscales ante el SENIAT, la operación se estructurará bajo la modalidad de Mutuo Oneroso en moneda nacional, devengando intereses nominales a favor de la empresa de acuerdo con las tasas de referencia emitidas por el Banco Central de Venezuela (BCV).

Luego de una breve deliberación, los accionistas aprobaron por unanimidad de votos los siguientes acuerdos:

PRIMERO: Autorizar formalmente a la sociedad mercantil para otorgar el préstamo al ciudadano ${beneficiario.nombre_accionista} por el monto antes señalado, con un plazo de restitución de ${plazoTexto}.

${clausulaInteresesSegundo}

TERCERO: Facultar ampliamente al ${empresa.cargo_representante}, ciudadano ${empresa.representante_legal}, para que en nombre y representación de la compañía suscriba, firme y formalice el respectivo Contrato de Mutuo Mercantil Oneroso con el beneficiario bajo los términos aprobados.

No habiendo otro punto que tratar, se dio por terminada la reunión, procediéndose a la redacción, lectura y firma de la presente acta por todos los asistentes en señal de conformidad.`;
}

/**
 * Downloads Acta de Asamblea as a formatted Microsoft Word (.doc)
 * with strict Word MSO formatting, boxed header that never overflows,
 * structured legal paragraphs, and perfectly ordered signature block.
 */
export function downloadActaWord(
  acta: ActaAsamblea | undefined,
  empresa: Empresa,
  accionistas: Accionista[],
  contrato?: ContratoMutuo,
  socioBeneficiario?: Accionista
): void {
  const text = generateActaAsambleaText(acta, empresa, accionistas, contrato, socioBeneficiario);
  const numActa = acta?.numero_acta || 'ASAM-EXT-2026';

  const sociosValidos = accionistas.filter(a => a.empresa_id === empresa.id);
  const sociosAFirmar = sociosValidos.length > 0 ? sociosValidos : [
    { nombre_accionista: empresa.representante_legal, cedula_accionista: empresa.cedula_representante, porcentaje_acciones: 50, cargo_o_condicion: empresa.cargo_representante },
    { nombre_accionista: 'Carlos Eduardo Mendoza Silva', cedula_accionista: '14.285.920', porcentaje_acciones: 50, cargo_o_condicion: 'Accionista y Secretario' },
  ];

  const presidente = sociosAFirmar[0];
  const secretario = sociosAFirmar.length > 1 ? sociosAFirmar[1] : {
    nombre_accionista: 'Secretario Ad-Hoc de la Asamblea',
    cedula_accionista: '15.432.876',
    porcentaje_acciones: 0,
    cargo_o_condicion: 'Secretario Ad-Hoc'
  };

  const paragraphs = text.split('\n\n').filter(p => p.trim().length > 0);

  const formattedParagraphsHtml = paragraphs.map((p) => {
    let content = p.trim().replace(/\n/g, '<br/>');

    if (content.startsWith('ACTA DE ASAMBLEA')) {
      const parts = content.split('<br/>');
      const titleLine = parts[0] || content;
      const subLine = parts.slice(1).join('<br/>');
      return `
        <div style="font-family: 'Times New Roman', Times, serif; font-size: 12.5pt; font-weight: bold; text-align: center; text-transform: uppercase; color: #0f172a; margin-top: 14pt; margin-bottom: 4pt; letter-spacing: 0.5pt;">
          ${titleLine}
        </div>
        ${subLine ? `
          <div style="font-family: 'Courier New', monospace; font-size: 9.5pt; font-weight: bold; text-align: center; color: #1e3a8a; margin-bottom: 16pt;">
            ${subLine}
          </div>
        ` : ''}
      `;
    }

    content = content
      .replace(/(ORDEN DEL DÍA:)/g, '<strong style="color: #0f172a;">$1</strong>')
      .replace(/(DESARROLLO DEL ÚNICO PUNTO DEL ORDEN DEL DÍA:)/g, '<strong style="color: #0f172a;">$1</strong>')
      .replace(/(PRIMERO:)/g, '<strong style="color: #0f172a;">$1</strong>')
      .replace(/(SEGUNDO:)/g, '<strong style="color: #0f172a;">$1</strong>')
      .replace(/(TERCERO:)/g, '<strong style="color: #0f172a;">$1</strong>')
      .replace(/(ÚNICO:)/g, '<strong style="color: #0f172a;">$1</strong>');

    return `<p style="font-family: 'Times New Roman', Times, serif; font-size: 11pt; line-height: 1.45; text-align: justify; text-justify: inter-ideograph; margin-top: 0pt; margin-bottom: 10pt; color: #000000;">${content}</p>`;
  }).join('\n');

  const htmlContent = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" 
          xmlns:w="urn:schemas-microsoft-com:office:word" 
          xmlns:m="http://schemas.microsoft.com/office/2004/12/omml"
          xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <title>Acta de Asamblea - ${empresa.razon_social}</title>
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>100</w:Zoom>
          <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
        @page Section1 {
          size: 8.5in 11.0in;
          margin: 1.0in 1.0in 1.0in 1.0in;
          mso-header-margin: 0.5in;
          mso-footer-margin: 0.5in;
          mso-paper-source: 0;
        }
        div.Section1 {
          page: Section1;
        }
        body {
          font-family: 'Times New Roman', Times, serif;
          font-size: 11pt;
          line-height: 1.45;
          color: #000000;
          margin: 0;
          padding: 0;
        }
        table.mso-table {
          border-collapse: collapse;
          mso-table-lspace: 0pt;
          mso-table-rspace: 0pt;
          width: 100%;
          table-layout: fixed;
        }
      </style>
    </head>
    <body>
      <div class="Section1">
        <!-- Encabezado enmarcado de ancho fijo que nunca se desborda -->
        <table class="mso-table" width="100%" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse; table-layout: fixed; margin-bottom: 16pt; border: 1.5pt solid #1e3a8a; background-color: #f8fafc;">
          <tr>
            <td style="padding: 10pt 14pt; text-align: center; word-wrap: break-word; overflow-wrap: break-word;">
              <div style="font-family: 'Arial', sans-serif; font-size: 12.5pt; font-weight: bold; color: #1e3a8a; text-transform: uppercase; margin-bottom: 3pt; line-height: 1.25; word-break: break-word;">
                ${empresa.razon_social}
              </div>
              <div style="font-family: 'Times New Roman', serif; font-size: 9.5pt; color: #334155; margin-bottom: 2pt;">
                <strong>R.I.F.:</strong> ${empresa.rif_empresa} &nbsp;|&nbsp; <strong>REGISTRO MERCANTIL:</strong> ${empresa.registro_mercantil}
              </div>
              <div style="font-family: 'Times New Roman', serif; font-size: 9pt; color: #475569;">
                <strong>Domicilio Fiscal:</strong> ${empresa.direccion_fiscal}, ${empresa.ciudad}, Estado ${empresa.estado} &nbsp;|&nbsp; <strong>Libro de Asambleas:</strong> Folios ${acta?.libro_paginas || '45 a la 48'}
              </div>
            </td>
          </tr>
        </table>

        <!-- Cuerpo del Acta formateado párrafo a párrafo -->
        ${formattedParagraphsHtml}

        <!-- Bloque de Firmas en estricto orden y alineación -->
        <table class="mso-table" width="100%" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse; table-layout: fixed; margin-top: 36pt; page-break-inside: avoid;">
          <colgroup>
            <col width="50%" />
            <col width="50%" />
          </colgroup>
          <tr>
            <td style="width: 50%; vertical-align: top; text-align: center; padding: 12pt 18pt;">
              <table width="85%" align="center" style="margin: 0 auto 6pt auto; border-top: 1.5pt solid #000000; border-collapse: collapse;">
                <tr><td style="font-size: 1pt; height: 1px; line-height: 1px;">&nbsp;</td></tr>
              </table>
              <div style="font-family: 'Times New Roman', serif; font-size: 11pt; font-weight: bold; color: #000000; text-transform: uppercase;">
                ${presidente.nombre_accionista}
              </div>
              <div style="font-family: 'Times New Roman', serif; font-size: 9.5pt; color: #1e293b;">
                C.I. V-${presidente.cedula_accionista}
              </div>
              <div style="font-family: 'Times New Roman', serif; font-size: 9.5pt; font-weight: bold; color: #1e3a8a; margin-top: 2pt;">
                Presidente de la Asamblea
              </div>
              <div style="font-family: 'Times New Roman', serif; font-size: 8.5pt; color: #475569;">
                Accionista (${presidente.porcentaje_acciones}% Acciones)
              </div>
            </td>
            <td style="width: 50%; vertical-align: top; text-align: center; padding: 12pt 18pt;">
              <table width="85%" align="center" style="margin: 0 auto 6pt auto; border-top: 1.5pt solid #000000; border-collapse: collapse;">
                <tr><td style="font-size: 1pt; height: 1px; line-height: 1px;">&nbsp;</td></tr>
              </table>
              <div style="font-family: 'Times New Roman', serif; font-size: 11pt; font-weight: bold; color: #000000; text-transform: uppercase;">
                ${secretario.nombre_accionista}
              </div>
              <div style="font-family: 'Times New Roman', serif; font-size: 9.5pt; color: #1e293b;">
                C.I. V-${secretario.cedula_accionista}
              </div>
              <div style="font-family: 'Times New Roman', serif; font-size: 9.5pt; font-weight: bold; color: #1e3a8a; margin-top: 2pt;">
                Secretario de la Asamblea
              </div>
              <div style="font-family: 'Times New Roman', serif; font-size: 8.5pt; color: #475569;">
                Accionista (${secretario.porcentaje_acciones}% Acciones)
              </div>
            </td>
          </tr>
          ${sociosAFirmar.length > 2 ? `
            <tr>
              ${sociosAFirmar.slice(2, 4).map(s => `
                <td style="width: 50%; vertical-align: top; text-align: center; padding: 24pt 18pt 12pt 18pt;">
                  <table width="85%" align="center" style="margin: 0 auto 6pt auto; border-top: 1.5pt solid #000000; border-collapse: collapse;">
                    <tr><td style="font-size: 1pt; height: 1px; line-height: 1px;">&nbsp;</td></tr>
                  </table>
                  <div style="font-family: 'Times New Roman', serif; font-size: 11pt; font-weight: bold; color: #000000; text-transform: uppercase;">
                    ${s.nombre_accionista}
                  </div>
                  <div style="font-family: 'Times New Roman', serif; font-size: 9.5pt; color: #1e293b;">
                    C.I. V-${s.cedula_accionista}
                  </div>
                  <div style="font-family: 'Times New Roman', serif; font-size: 9.5pt; font-weight: bold; color: #1e3a8a; margin-top: 2pt;">
                    Accionista (${s.porcentaje_acciones}%)
                  </div>
                </td>
              `).join('')}
            </tr>
          ` : ''}
        </table>
      </div>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff' + htmlContent], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Acta_Asamblea_${numActa}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads Acta de Asamblea as a fully structured, styled Microsoft Excel spreadsheet (.xls)
 * formatted for SENIAT fiscal audits, shareholder ledger records, and corporate compliance.
 */
export function downloadActaExcel(
  acta: ActaAsamblea | undefined,
  empresa: Empresa,
  accionistas: Accionista[],
  contrato?: ContratoMutuo,
  socioBeneficiario?: Accionista
): void {
  const numActa = acta?.numero_acta || 'ASAM-EXT-2026-01';
  const folios = acta?.libro_paginas || '45 a la 48';
  const fechaAsamblea = acta ? formatFechaLarga(acta.fecha_asamblea) : '15 de enero de 2026';
  const horaAsamblea = acta?.hora_inicio || '10:00 a.m.';

  const sociosValidos = accionistas.filter(a => a.empresa_id === empresa.id);
  const sociosListado = sociosValidos.length > 0 ? sociosValidos : [
    { nombre_accionista: empresa.representante_legal, cedula_accionista: empresa.cedula_representante, rif_accionista: `V-${empresa.cedula_representante}-0`, porcentaje_acciones: 50, cargo_o_condicion: empresa.cargo_representante },
    { nombre_accionista: 'Carlos Eduardo Mendoza Silva', cedula_accionista: '14.285.920', rif_accionista: 'V-14285920-1', porcentaje_acciones: 50, cargo_o_condicion: 'Accionista y Secretario' },
  ];

  const presidente = sociosListado[0];
  const secretario = sociosListado.length > 1 ? sociosListado[1] : {
    nombre_accionista: 'Secretario de la Asamblea',
    cedula_accionista: '15.432.876',
    rif_accionista: 'V-15432876-0',
    porcentaje_acciones: 0,
    cargo_o_condicion: 'Secretario Ad-Hoc'
  };

  const beneficiario = socioBeneficiario || (contrato ? accionistas.find(a => a.id === contrato.accionista_id) : sociosListado[1]) || sociosListado[0];

  const fullText = generateActaAsambleaText(acta, empresa, accionistas, contrato, socioBeneficiario);
  const textParagraphs = fullText.split('\n\n').filter(p => p.trim().length > 0);

  const regimenInteres = acta?.regimen_interes_autorizado === 'indexado_uvc_16'
    ? 'Indexado UVC 16% (Resolución BCV N° 26-08-01)'
    : (acta?.regimen_interes_autorizado === 'divisas_usd'
      ? 'Divisas USD 12% (Convenio Cambiario N° 1 BCV)'
      : 'Tasa Activa Promedio Ponderada BCV ~59% (Art. 73 LISLR)');

  const montoPagarUSD = acta?.monto_maximo_autorizado_pagar || 150000;
  const montoCobrarUSD = acta?.monto_maximo_autorizado_cobrar || 25000;

  const htmlContent = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" 
          xmlns:x="urn:schemas-microsoft-com:office:excel" 
          xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>Acta_Asamblea_${numActa}</x:Name>
              <x:WorksheetOptions>
                <x:DisplayGridlines/>
                <x:Print>
                  <x:ValidPrinterInfo/>
                  <x:PaperSizeIndex>9</x:PaperSizeIndex>
                  <x:HorizontalResolution>600</x:HorizontalResolution>
                  <x:VerticalResolution>600</x:VerticalResolution>
                </x:Print>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <style>
        body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 11pt; color: #111827; }
        table { border-collapse: collapse; }
        .hdr-main { background-color: #1e3a8a; color: #ffffff; font-size: 13pt; font-weight: bold; text-align: center; vertical-align: middle; height: 32pt; }
        .hdr-sub { background-color: #1e40af; color: #f8fafc; font-size: 10.5pt; font-weight: bold; text-align: center; vertical-align: middle; height: 22pt; }
        .meta-lbl { background-color: #f1f5f9; color: #334155; font-weight: bold; font-size: 9.5pt; border: 0.5pt solid #cbd5e1; padding: 4pt 6pt; }
        .meta-val { background-color: #ffffff; color: #0f172a; font-size: 9.5pt; border: 0.5pt solid #cbd5e1; padding: 4pt 6pt; }
        .sec-title { background-color: #0f766e; color: #ffffff; font-weight: bold; font-size: 11pt; padding: 6pt; height: 24pt; vertical-align: middle; }
        .th-tbl { background-color: #334155; color: #ffffff; font-weight: bold; font-size: 9.5pt; text-align: center; border: 0.5pt solid #64748b; padding: 5pt; }
        .td-tbl { border: 0.5pt solid #cbd5e1; font-size: 9.5pt; padding: 4pt 6pt; vertical-align: middle; }
        .td-tbl-center { border: 0.5pt solid #cbd5e1; font-size: 9.5pt; text-align: center; padding: 4pt 6pt; vertical-align: middle; }
        .td-tbl-num { border: 0.5pt solid #cbd5e1; font-size: 9.5pt; text-align: right; padding: 4pt 6pt; vertical-align: middle; }
        .tot-row { background-color: #e2e8f0; font-weight: bold; border-top: 1.5pt solid #1e293b; border-bottom: 1.5pt solid #1e293b; }
        .text-cell { font-family: 'Times New Roman', serif; font-size: 10.5pt; line-height: 1.35; text-align: justify; padding: 8pt 10pt; vertical-align: top; border: 0.5pt solid #e2e8f0; }
        .sig-box { border-top: 1.5pt solid #000000; text-align: center; font-weight: bold; font-size: 10pt; padding-top: 4pt; }
      </style>
    </head>
    <body>
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <colgroup>
          <col width="60" />
          <col width="220" />
          <col width="130" />
          <col width="130" />
          <col width="160" />
          <col width="110" />
          <col width="180" />
        </colgroup>

        <!-- ENCABEZADO CORPORATIVO -->
        <tr>
          <td colspan="7" class="hdr-main">
            ${empresa.razon_social.toUpperCase()}
          </td>
        </tr>
        <tr>
          <td colspan="7" class="hdr-sub">
            ACTA DE ASAMBLEA EXTRAORDINARIA DE ACCIONISTAS - EXPEDIENTE TRIBUTARIO SENIAT
          </td>
        </tr>
        <tr>
          <td colspan="7" style="background-color: #f8fafc; text-align: center; font-size: 9pt; color: #475569; padding: 3pt; border-bottom: 1.5pt solid #1e3a8a;">
            R.I.F.: ${empresa.rif_empresa} &nbsp;|&nbsp; ${empresa.registro_mercantil} &nbsp;|&nbsp; Domicilio: ${empresa.direccion_fiscal}, ${empresa.ciudad}, Edo. ${empresa.estado}
          </td>
        </tr>
        <tr><td colspan="7" style="height: 10pt;"></td></tr>

        <!-- FICHA TÉCNICA DEL ACTA -->
        <tr>
          <td colspan="7" class="sec-title">
            1. FICHA TÉCNICA Y CONTROL DE ASENTAMIENTO EN LIBRO MERCANTIL
          </td>
        </tr>
        <tr>
          <td class="meta-lbl" colspan="2">NÚMERO DE CONTROL DEL ACTA:</td>
          <td class="meta-val" colspan="2" style="font-weight: bold; color: #1e3a8a;">${numActa}</td>
          <td class="meta-lbl">TIPO DE ASAMBLEA:</td>
          <td class="meta-val" colspan="2">Asamblea Extraordinaria (Universal)</td>
        </tr>
        <tr>
          <td class="meta-lbl" colspan="2">FECHA DE CELEBRACIÓN:</td>
          <td class="meta-val" colspan="2">${fechaAsamblea} (${horaAsamblea})</td>
          <td class="meta-lbl">QUÓRUM DE ASISTENCIA:</td>
          <td class="meta-val" colspan="2" style="font-weight: bold; color: #047857;">100,00% del Capital Social</td>
        </tr>
        <tr>
          <td class="meta-lbl" colspan="2">FOLIOS DEL LIBRO FÍSICO:</td>
          <td class="meta-val" colspan="2" style="font-weight: bold;">Páginas / Folios ${folios}</td>
          <td class="meta-lbl">ESTATUS LIBRO MERCANTIL:</td>
          <td class="meta-val" colspan="2">${acta?.estatus_libro_fisico ? '✓ Asentado y Foliado en Libro Oficial' : 'Pendiente Transcripción en Libro'}</td>
        </tr>
        <tr>
          <td class="meta-lbl" colspan="2">RÉGIMEN DE INTERESES (ART. 73 LISLR):</td>
          <td class="meta-val" colspan="5">${regimenInteres}</td>
        </tr>
        <tr>
          <td class="meta-lbl" colspan="2">LÍMITE AUTORIZADO A PAGAR (MUTUANTE):</td>
          <td class="meta-val" colspan="2" style="font-weight: bold; color: #047857;">$${montoPagarUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
          <td class="meta-lbl">LÍMITE AUTORIZADO A COBRAR (MUTUARIO):</td>
          <td class="meta-val" colspan="2" style="font-weight: bold; color: #1e3a8a;">$${montoCobrarUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
        </tr>
        <tr><td colspan="7" style="height: 12pt;"></td></tr>

        <!-- TABLA DE QUÓRUM Y ACCIONISTAS -->
        <tr>
          <td colspan="7" class="sec-title">
            2. NÓMINA DE ACCIONISTAS ASISTENTES (QUÓRUM UNIVERSAL ART. 280 C.COM)
          </td>
        </tr>
        <tr>
          <td class="th-tbl">ITEM</td>
          <td class="th-tbl">NOMBRE Y APELLIDOS DEL ACCIONISTA</td>
          <td class="th-tbl">CÉDULA DE IDENTIDAD</td>
          <td class="th-tbl">R.I.F. FISCAL</td>
          <td class="th-tbl">CARGO / CONDICIÓN</td>
          <td class="th-tbl">% ACCIONES</td>
          <td class="th-tbl">ROL EN LA ASAMBLEA</td>
        </tr>
        ${sociosListado.map((s, idx) => `
          <tr>
            <td class="td-tbl-center">${idx + 1}</td>
            <td class="td-tbl" style="font-weight: bold;">${s.nombre_accionista.toUpperCase()}</td>
            <td class="td-tbl-center">V-${s.cedula_accionista}</td>
            <td class="td-tbl-center">${s.rif_accionista || `V-${s.cedula_accionista}-0`}</td>
            <td class="td-tbl">${s.cargo_o_condicion || 'Accionista Titular'}</td>
            <td class="td-tbl-num" style="font-weight: bold;">${s.porcentaje_acciones.toFixed(2)}%</td>
            <td class="td-tbl">${idx === 0 ? 'Presidente de la Asamblea' : (idx === 1 ? 'Secretario de la Asamblea' : 'Accionista Asistente')}</td>
          </tr>
        `).join('')}
        <tr class="tot-row">
          <td colspan="5" class="td-tbl" style="text-align: right; font-weight: bold;">TOTAL CAPITAL SOCIAL ASISTENTE Y REPRESENTADO:</td>
          <td class="td-tbl-num" style="font-weight: bold; color: #047857;">100,00%</td>
          <td class="td-tbl-center" style="font-weight: bold; color: #047857;">QUÓRUM VÁLIDO</td>
        </tr>
        <tr><td colspan="7" style="height: 12pt;"></td></tr>

        <!-- TRANSCRIPCIÓN DEL TEXTO LEGAL DEL ACTA -->
        <tr>
          <td colspan="7" class="sec-title">
            3. TRANSCRIPCIÓN OFICIAL DEL ACTA (TEXTO ÍNTEGRO PARA EL LIBRO MERCANTIL)
          </td>
        </tr>
        ${textParagraphs.map((para) => `
          <tr>
            <td colspan="7" class="text-cell">
              ${para.replace(/\n/g, '<br/>')}
            </td>
          </tr>
        `).join('')}
        <tr><td colspan="7" style="height: 16pt;"></td></tr>

        <!-- BLOQUE DE FIRMAS FORMALES -->
        <tr>
          <td colspan="7" class="sec-title">
            4. CERTIFICACIÓN DE FIRMAS DEL PRESIDENTE Y SECRETARIO
          </td>
        </tr>
        <tr><td colspan="7" style="height: 25pt;"></td></tr>
        <tr>
          <td></td>
          <td colspan="2" class="sig-box">
            ________________________________________<br/>
            ${presidente.nombre_accionista.toUpperCase()}<br/>
            C.I. V-${presidente.cedula_accionista}<br/>
            <span style="font-size: 8.5pt; font-weight: normal; color: #1e3a8a;">Presidente de la Asamblea • Accionista (${presidente.porcentaje_acciones}%)</span>
          </td>
          <td></td>
          <td colspan="2" class="sig-box">
            ________________________________________<br/>
            ${secretario.nombre_accionista.toUpperCase()}<br/>
            C.I. V-${secretario.cedula_accionista}<br/>
            <span style="font-size: 8.5pt; font-weight: normal; color: #1e3a8a;">Secretario de la Asamblea • Accionista (${secretario.porcentaje_acciones}%)</span>
          </td>
          <td></td>
        </tr>
        <tr><td colspan="7" style="height: 20pt;"></td></tr>
        <tr>
          <td colspan="7" style="text-align: center; font-size: 8pt; color: #94a3b8; border-top: 0.5pt solid #cbd5e1; padding-top: 6pt;">
            Documento emitido electrónicamente por el Sistema SOCIO-DOC • Cumplimiento Art. 280 Código de Comercio, Art. 73 LISLR y VEN-NIF.
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff' + htmlContent], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Acta_Asamblea_${numActa}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads Acta de Asamblea as a professional legal PDF
 */
export function downloadActaPDF(
  acta: ActaAsamblea | undefined,
  empresa: Empresa,
  accionistas: Accionista[],
  contrato?: ContratoMutuo,
  socioBeneficiario?: Accionista
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Header Box
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 58, 138);
  doc.text(empresa.razon_social.toUpperCase(), margin, y);
  y += 5;

  doc.setFont('times', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`R.I.F. ${empresa.rif_empresa} • ${empresa.registro_mercantil}`, margin, y);
  y += 4;
  doc.text(`Asentada en el Libro de Actas de Asambleas - Folios: ${acta?.libro_paginas || '45 a la 48'}`, margin, y);
  y += 4;

  doc.setDrawColor(30, 58, 138);
  doc.setLineWidth(0.6);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // Title
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('ACTA DE ASAMBLEA GENERAL EXTRAORDINARIA DE ACCIONISTAS', pageWidth / 2, y, { align: 'center' });
  y += 5;

  doc.setFont('courier', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 58, 138);
  doc.text(`IDENTIFICADOR: ${acta?.numero_acta || 'ASAM-EXT-2026-01'}`, pageWidth / 2, y, { align: 'center' });
  y += 7;

  const text = generateActaAsambleaText(acta, empresa, accionistas, contrato, socioBeneficiario);
  const paragraphs = text.split('\n\n');

  doc.setFont('times', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);

  for (const para of paragraphs) {
    if (y > pageHeight - 30) {
      doc.addPage();
      y = margin;
    }

    const isBoldHeader = para.startsWith('ACTA DE ASAMBLEA') || para.startsWith('ÚNICO:') || para.startsWith('DESARROLLO') || para.startsWith('PRIMERO:') || para.startsWith('SEGUNDO:') || para.startsWith('TERCERO:');

    if (isBoldHeader) {
      doc.setFont('times', 'bold');
    } else {
      doc.setFont('times', 'normal');
    }

    const lines = doc.splitTextToSize(para.trim(), contentWidth);
    for (let i = 0; i < lines.length; i++) {
      if (y > pageHeight - 25) {
        doc.addPage();
        y = margin;
      }
      doc.text(lines[i], margin, y);
      y += 4.5;
    }
    y += 2.5;
  }

  // Signatures
  if (y > pageHeight - 42) {
    doc.addPage();
    y = margin + 12;
  }

  const sociosValidos = accionistas.filter(a => a.empresa_id === empresa.id);
  const sociosAFirmar = sociosValidos.length > 0 ? sociosValidos.slice(0, 2) : [
    { nombre_accionista: empresa.representante_legal, cedula_accionista: empresa.cedula_representante, porcentaje_acciones: 50 },
    { nombre_accionista: 'Carlos Eduardo Mendoza Silva', cedula_accionista: '14.285.920', porcentaje_acciones: 50 },
  ];

  const centerCol1 = margin + (contentWidth * 0.25);
  const centerCol2 = margin + (contentWidth * 0.75);

  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.5);
  doc.line(centerCol1 - 32, y + 10, centerCol1 + 32, y + 10);
  doc.line(centerCol2 - 32, y + 10, centerCol2 + 32, y + 10);
  y += 15;

  doc.setFont('times', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(sociosAFirmar[0].nombre_accionista.toUpperCase(), centerCol1, y, { align: 'center' });
  if (sociosAFirmar[1]) {
    doc.text(sociosAFirmar[1].nombre_accionista.toUpperCase(), centerCol2, y, { align: 'center' });
  }
  y += 4;

  doc.setFont('times', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`C.I. V-${sociosAFirmar[0].cedula_accionista} (Presidente - ${sociosAFirmar[0].porcentaje_acciones}%)`, centerCol1, y, { align: 'center' });
  if (sociosAFirmar[1]) {
    doc.text(`C.I. V-${sociosAFirmar[1].cedula_accionista} (Secretario - ${sociosAFirmar[1].porcentaje_acciones}%)`, centerCol2, y, { align: 'center' });
  }

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont('times', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Página ${p} de ${totalPages} • Expediente Corporativo SENIAT`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
  }

  doc.save(`Acta_Asamblea_${acta?.numero_acta || 'ASAM-EXT-2026'}.pdf`);
}

/**
 * Generates text for Recibo Mensual de Cobro de Intereses al Socio (SENIAT Art. 73 LISLR)
 */
export function generateReciboInteresesText(
  contrato: ContratoMutuo | undefined,
  empresa: Empresa,
  accionista?: Accionista | null,
  mesLiquidado: string = 'Febrero 2026',
  tasaBCV: number = 412.50
): string {
  const socio = accionista || {
    nombre_accionista: 'Carlos Eduardo Mendoza Silva',
    cedula_accionista: '14.285.920',
    rif_accionista: 'V-14285920-1',
    cargo_o_condicion: 'Accionista Titular',
    porcentaje_acciones: 50,
  };

  const capitalUSD = contrato?.monto_original || 10000;
  const capitalVES = contrato ? contrato.monto_indexado_ves : (capitalUSD * tasaBCV);
  
  // Nominal BCV ~59.12% anual -> 4.926% mensual
  const tasaAnual = contrato?.tasa_interes_anual || (contrato?.modalidad_tasa === 'nominal_bcv_59' ? 59.12 : 12.0);
  const tasaMensual = tasaAnual / 12;

  const interesBrutoVES = (capitalVES * (tasaMensual / 100));
  const interesBrutoUSD = (capitalUSD * (tasaMensual / 100));

  // Retención 5% ISLR (Decreto 1.808 Art. 9 num. 8)
  const retencionISLR_VES = interesBrutoVES * 0.05;
  const retencionISLR_USD = interesBrutoUSD * 0.05;

  const netoCobrarVES = interesBrutoVES - retencionISLR_VES;
  const netoCobrarUSD = interesBrutoUSD - retencionISLR_USD;

  return `================================================================================
RECIBO MENSUAL DE LIQUIDACIÓN Y COBRO DE INTERESES MERCANTILES
(COMPROBANTE DE INGRESO FINANCIERO - BLINDAJE ART. 73 LISLR ANTE EL SENIAT)
Control Correlativo Nro: REC-INT-2026-02-${contrato?.correlativo || 'MUT-2026-0001'}
================================================================================

DATOS DE LA EMPRESA (MUTUANTE / ACREEDORA):
Razón Social: ${empresa.razon_social}
R.I.F.: ${empresa.rif_empresa}
Condición Fiscal: Contribuyente ${empresa.tipo_contribuyente} (Sujeto Pasivo Especial)
Domicilio Fiscal: ${empresa.direccion_fiscal}, ${empresa.ciudad}, Estado ${empresa.estado}

DATOS DEL BENEFICIARIO (MUTUARIO / DEUDOR):
Ciudadano(a): ${socio.nombre_accionista}
Cédula de Identidad: V-${socio.cedula_accionista} | R.I.F.: ${socio.rif_accionista}
Carácter: ${socio.cargo_o_condicion || 'Accionista / Director'} titular del ${socio.porcentaje_acciones}% del capital social

FUNDAMENTACIÓN Y REFERENCIA LEGAL:
• Contrato de Mutuo Mercantil Oneroso Nro.: ${contrato?.correlativo || 'MUT-2026-0001'}
• Aprobación en Asamblea Extraordinaria: Acta asentada en los Folios ${contrato?.soporte?.recibo_caja_correlativo ? '45 a la 48' : '45 a la 48'} del Libro de Actas de Asambleas de Accionistas.
• Fundamento Tributario: Artículo 73 de la Ley de Impuesto sobre la Renta (LISLR) - Rendimiento financiero para desvirtuar Dividendo Ficto o Presunto.
• Calificación IVA: NO SUJETO AL IMPUESTO AL VALOR AGREGADO conforme al Artículo 16, Numeral 3 de la Ley de IVA (Decreto Constituyente / Gaceta Oficial Nro. 6.507 Extraordinario).
• Retención de ISLR: Decreto 1.808 (Reglamento de Retenciones de ISLR), Artículo 9, Numeral 8 (5% para personas naturales residentes / 3% para personas jurídicas).

LIQUIDACIÓN FINANCIERA DEL PERÍODO:
Período Liquidado: ${mesLiquidado} (30 días de causación efectiva)
Saldo de Capital Adeudado: ${formatVES(capitalVES)} (${formatUSD(capitalUSD)})
Régimen Aplicado: Tasa Activa Promedio Ponderada BCV (Art. 73 LISLR)
Tasa Nominal Anual BCV Aplicada: ${tasaAnual.toFixed(2)}% Anual (Tasa Mensual: ${tasaMensual.toFixed(4)}%)

DESGLOSE DE LA OPERACIÓN:
(+) Intereses Compensatorios Devengados (Bruto):   ${formatVES(interesBrutoVES)} (${formatUSD(interesBrutoUSD)})
(-) Retención de ISLR 5% (Decreto 1.808):         -${formatVES(retencionISLR_VES)} (-${formatUSD(retencionISLR_USD)})
--------------------------------------------------------------------------------
(=) NETO A COBRAR / ENTERAR POR LA EMPRESA:         ${formatVES(netoCobrarVES)} (${formatUSD(netoCobrarUSD)})

ASIENTO DE DIARIO CONTABLE (VEN-NIF / PRINCIPIOS CONTABLES VENEZOLANOS):
--------------------------------------------------------------------------------
CÓDIGO          CUENTA CONTABLE                               DÉBITO        CRÉDITO
1.01.02.01.001  Banco Nacional Moneda de Curso Legal          ${formatVES(netoCobrarVES)}
1.01.03.02.001  Anticipo de Impuesto / Retención ISLR 5%      ${formatVES(retencionISLR_VES)}
4.02.01.01.001  Ingresos Financieros por Intereses de Mutuo                 ${formatVES(interesBrutoVES)}
(Para registrar causación y cobro de intereses sobre mutuo a socio según Art. 73 LISLR)
--------------------------------------------------------------------------------

DECLARACIÓN DE CONFORMIDAD:
La empresa ${empresa.razon_social} declara haber liquidado la presente mensualidad y el mutuario declara su plena aceptación del cálculo financiero efectuado conforme a las regulaciones del Banco Central de Venezuela (BCV) y las disposiciones del SENIAT.

POR LA EMPRESA (MUTUANTE):                    EL MUTUARIO (BENEFICIARIO):
________________________________              ________________________________
${empresa.representante_legal}                ${socio.nombre_accionista}
C.I. V-${empresa.cedula_representante}        C.I. V-${socio.cedula_accionista}
${empresa.cargo_representante}                ${socio.cargo_o_condicion || 'Accionista'}
(Sello Húmedo de la Empresa)`;
}

/**
 * Downloads Recibo Mensual de Intereses as formatted Microsoft Word (.doc)
 */
export function downloadReciboInteresesWord(
  contrato: ContratoMutuo | undefined,
  empresa: Empresa,
  accionista?: Accionista | null,
  mesLiquidado: string = 'Mes en Curso 2026',
  tasaBCVCierre?: number
): void {
  const text = generateReciboInteresesText(contrato, empresa, accionista, mesLiquidado, tasaBCVCierre);
  const correlativo = contrato?.correlativo || 'REC-INT-2026';
  const socio = accionista || {
    nombre_accionista: 'Accionista / Beneficiario',
    cedula_accionista: '12.345.678',
    rif_accionista: 'V-12345678-0',
    cargo_o_condicion: 'Accionista Titular',
    porcentaje_acciones: 50,
  };

  const htmlContent = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" 
          xmlns:w="urn:schemas-microsoft-com:office:word" 
          xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <title>Recibo de Intereses - ${correlativo}</title>
      <style>
        body { font-family: 'Times New Roman', serif; font-size: 10.5pt; line-height: 1.4; color: #111; margin: 20mm 20mm; }
        .header-box { text-align: center; font-weight: bold; border-bottom: 2pt solid #0f766e; padding-bottom: 6pt; margin-bottom: 12pt; }
        .receipt-title { font-size: 13pt; text-transform: uppercase; color: #0f766e; margin-bottom: 3pt; font-family: 'Arial', sans-serif; }
        .receipt-sub { font-size: 9pt; font-family: 'Courier New', monospace; color: #475569; }
        .receipt-body { font-family: 'Courier New', monospace; font-size: 9.5pt; white-space: pre-wrap; margin-bottom: 15pt; background: #f8fafc; padding: 12pt; border: 1pt solid #cbd5e1; }
        .signatures-table { width: 100%; margin-top: 30pt; border-collapse: collapse; }
        .sig-cell { width: 50%; text-align: center; vertical-align: top; padding: 10pt; }
        .sig-line { border-top: 1pt solid #333; width: 80%; margin: 0 auto 6pt auto; }
      </style>
    </head>
    <body>
      <div class="header-box">
        <div class="receipt-title">${empresa.razon_social}</div>
        <div class="receipt-sub">R.I.F. ${empresa.rif_empresa} • ${empresa.registro_mercantil}</div>
        <div class="receipt-sub">Comprobante Oficial de Intereses (Art. 73 LISLR • No Sujeto a IVA Art. 16 LIVA)</div>
      </div>
      <div class="receipt-body">${text}</div>
      <table class="signatures-table">
        <tr>
          <td class="sig-cell">
            <div class="sig-line"></div>
            <strong>${empresa.representante_legal}</strong><br/>
            C.I. V-${empresa.cedula_representante}<br/>
            ${empresa.cargo_representante}<br/>
            <strong>${empresa.razon_social}</strong>
          </td>
          <td class="sig-cell">
            <div class="sig-line"></div>
            <strong>${socio.nombre_accionista}</strong><br/>
            C.I. V-${socio.cedula_accionista}<br/>
            ${socio.cargo_o_condicion || 'Accionista / Mutuario'}<br/>
            R.I.F. ${socio.rif_accionista}
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff' + htmlContent], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Recibo_Intereses_${correlativo}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads Recibo Mensual de Intereses as a professional legal PDF
 */
export function downloadReciboInteresesPDF(
  contrato: ContratoMutuo | undefined,
  empresa: Empresa,
  accionista?: Accionista | null,
  mesLiquidado: string = 'Mes en Curso 2026',
  tasaBCVCierre?: number
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Header
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 118, 110); // Teal 700
  doc.text(empresa.razon_social.toUpperCase(), margin, y);
  y += 5;

  doc.setFont('times', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`R.I.F. ${empresa.rif_empresa} • Domicilio: ${empresa.ciudad}, Estado ${empresa.estado}`, margin, y);
  y += 4;
  doc.text(`Contribuyente Especial • ${empresa.registro_mercantil}`, margin, y);
  y += 4;

  doc.setDrawColor(15, 118, 110);
  doc.setLineWidth(0.6);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  // Title
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('RECIBO MENSUAL DE LIQUIDACIÓN DE INTERESES DE PRÉSTAMO A SOCIO', pageWidth / 2, y, { align: 'center' });
  y += 5;

  doc.setFont('courier', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 118, 110);
  const correlativo = contrato?.correlativo || 'REC-INT-2026-001';
  doc.text(`NÚMERO DE CONTROL FISCAL: ${correlativo} | PERÍODO: ${mesLiquidado.toUpperCase()}`, pageWidth / 2, y, { align: 'center' });
  y += 6;

  const text = generateReciboInteresesText(contrato, empresa, accionista, mesLiquidado, tasaBCVCierre);
  const lines = text.split('\n');

  doc.setFont('courier', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);

  for (const line of lines) {
    if (y > pageHeight - 20) {
      doc.addPage();
      y = margin;
      doc.setFont('courier', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(30, 41, 59);
    }

    if (line.includes('===') || line.includes('---')) {
      doc.setFont('courier', 'bold');
      doc.setTextColor(100, 116, 139);
      doc.text(line.substring(0, 85), margin, y);
      doc.setFont('courier', 'normal');
      doc.setTextColor(30, 41, 59);
    } else if (line.startsWith('DATOS') || line.startsWith('FUNDAMENTACIÓN') || line.startsWith('LIQUIDACIÓN') || line.startsWith('DESGLOSE') || line.startsWith('ASIENTO')) {
      doc.setFont('courier', 'bold');
      doc.setTextColor(15, 118, 110);
      doc.text(line, margin, y);
      doc.setFont('courier', 'normal');
      doc.setTextColor(30, 41, 59);
    } else {
      doc.text(line.substring(0, 95), margin, y);
    }
    y += 3.8;
  }

  // Footer & Page count
  const pageCount = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('times', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Página ${i} de ${pageCount} • Respaldo Tributario Art. 73 LISLR / Art. 16 LIVA - ${empresa.razon_social}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
  }

  doc.save(`Recibo_Intereses_${correlativo}.pdf`);
}

/**
 * Generates the comprehensive legal text for the Contrato Marco de Apertura de Línea de Crédito Rotativa
 * (Mutuo Rotativo mediante Cuenta Corriente Mercantil - 1 solo documento notariado al año para agrupar múltiples transferencias)
 */
export function generateLineaCreditoRotativaText(
  contrato: ContratoMutuo | null | undefined,
  empresa: Empresa,
  accionista: Accionista,
  techoPersonalizadoUSD?: number,
  tasaAnualPersonalizada?: number
): { title: string; body: string; clauses: { title: string; text: string }[] } {
  const techoUSD = techoPersonalizadoUSD || contrato?.limite_linea_credito_usd || 20000;
  const tasaAnual = tasaAnualPersonalizada || contrato?.tasa_interes_anual || 12.0;
  const tasaMensual = (tasaAnual / 12).toFixed(2);
  const techoLetras = numeroALetras(techoUSD);

  const isDirectivoOGerente =
    accionista.es_accionista === false ||
    accionista.porcentaje_acciones === 0 ||
    accionista.tipo_vinculo === 'director' ||
    accionista.tipo_vinculo === 'gerente' ||
    accionista.tipo_vinculo === 'personal_confianza';

  const condicionFirmante = isDirectivoOGerente
    ? `en su carácter de ${accionista.cargo_o_condicion || 'Director / Gerente'} y personal de confianza de la sociedad mercantil`
    : `en su condición de accionista y titular propietario del ${accionista.porcentaje_acciones}% del capital social de la compañía`;

  const fechaAsam = contrato?.acta_asamblea_fecha || '15 de enero de 2026';
  const pagLibro = contrato?.libro_actas_paginas || '45 a la 48';

  const title = 'CONTRATO MARCO DE APERTURA DE LÍNEA DE CRÉDITO ROTATIVA MEDIANTE CUENTA CORRIENTE MERCANTIL (MUTUO ROTATIVO)';

  const preamble = `Nosotros, ${empresa.razon_social}, sociedad mercantil legalmente constituida y domiciliada en ${empresa.ciudad}, Estado ${empresa.estado}, inscrita por ante el ${empresa.registro_mercantil}, con el Registro de Información Fiscal (R.I.F.) Nro. ${empresa.rif_empresa}, en este acto válidamente representada por su ${empresa.cargo_representante}, ciudadano(a) ${empresa.representante_legal}, titular de la Cédula de Identidad Nro. V-${empresa.cedula_representante}, facultado(a) según los Estatutos Sociales, en lo sucesivo y para todos los efectos denominada "LA MUTUANTE" (o LA ACREDITANTE), por una parte; y por la otra, el ciudadano(a) ${accionista.nombre_accionista}, mayor de edad, titular de la Cédula de Identidad Nro. V-${accionista.cedula_accionista} y con R.I.F. Nro. ${accionista.rif_accionista}, ${condicionFirmante}, en lo sucesivo denominado "EL MUTUARIO" (o EL ACREDITADO), convenimos en celebrar el presente CONTRATO MARCO DE APERTURA DE LÍNEA DE CRÉDITO ROTATIVA MEDIANTE CUENTA CORRIENTE MERCANTIL (MUTUO ROTATIVO), el cual se regirá por las disposiciones del Código de Comercio venezolano, el Código Civil, la Ley de Impuesto Sobre la Renta y las siguientes cláusulas:`;

  const clauses: { title: string; text: string }[] = [
    {
      title: 'CLÁUSULA PRIMERA (OBJETO Y TECHO MÁXIMO DE LA LÍNEA DE CRÉDITO ROTATIVA)',
      text: `LA MUTUANTE conviene en abrir y mantener disponible a favor de EL MUTUARIO una Línea de Crédito Rotativa no garantizada hasta por un monto máximo consolidado (Techo Máximo de Crédito) de ${formatUSD(techoUSD)} (${techoLetras} DÓLARES DE LOS ESTADOS UNIDOS DE AMÉRICA), o su contravalor en Bolívares liquidado al tipo de cambio oficial de referencia publicado por el Banco Central de Venezuela (BCV) a la fecha de cada disposición. Por tratarse de una línea de crédito de carácter rotativo, los pagos, amortizaciones o restituciones de capital que realice EL MUTUARIO durante la vigencia del contrato reconstituirán automáticamente la disponibilidad crediticia en igual cuantía, permitiéndole efectuar nuevas solicitudes y retiros sin necesidad de otorgar nuevos instrumentos contractuales, siempre y cuando el saldo deudor no exceda en ningún momento del límite máximo establecido.`,
    },
    {
      title: 'CLÁUSULA SEGUNDA (DE LAS DISPOSICIONES MÚLTIPLES Y SUCESIVAS MEDIANTE TRANSFERENCIAS BANCARIAS DIRECTAS - EXENCIÓN DE CONTRATOS INDIVIDUALES)',
      text: `Queda expresamente convenido que EL MUTUARIO (el socio) podrá hacer uso de la presente línea de crédito mediante múltiples y sucesivas solicitudes de fondos o transferencias bancarias directas realizadas desde las cuentas de LA MUTUANTE (la empresa) hacia sus cuentas personales. Cada transferencia bancaria individual constituirá una utilización efectiva del crédito, quedando las partes eximidas de suscribir contratos particulares o adicionales por cada transacción, bastando como plena prueba de la deuda y de su aceptación el respectivo comprobante de transferencia bancaria y el estado de cuenta contable de la empresa.`,
    },
    {
      title: 'CLÁUSULA TERCERA (REGISTRO Y CONTROL EN CUENTA CORRIENTE MERCANTIL AUXILIAR - ART. 503 CÓDIGO DE COMERCIO)',
      text: `Las operaciones dinerarias de desembolso, disposición de fondos y amortizaciones derivadas de la presente línea de crédito rotativa se canalizarán y registrarán bajo el régimen de Cuenta Corriente Mercantil, de conformidad con lo preceptuado en los Artículos 503 y siguientes del Código de Comercio de la República Bolivariana de Venezuela y los principios de contabilidad generalmente aceptados (VEN-NIF). A tal efecto, LA MUTUANTE mantendrá un libro auxiliar analítico denominado "Cuentas por Cobrar Accionistas y Directores" donde se asentarán cronológicamente cada una de las transferencias efectuadas, los saldos diarios deudores y los abonos de capital, constituyendo la contabilidad mercantil de la sociedad plena prueba fehaciente de las obligaciones entre las partes y soporte auditable ante el Servicio Nacional Integrado de Administración Aduanera y Tributaria (SENIAT).`,
    },
    {
      title: 'CLÁUSULA CUARTA (RÉGIMEN DE INTERESES, SALDO PROMEDIO DEUDOR Y ARTÍCULO 73 LISLR)',
      text: `En estricto cumplimiento del Artículo 73 de la Ley de Impuesto Sobre la Renta (LISLR) y para enervar cualquier presunción legal de dividendo ficto o enriquecimiento neto no declarado ante la Administración Tributaria, los saldos efectivamente dispuestos de la línea de crédito devengarán un interés corriente fijado a la tasa del ${tasaAnual.toFixed(2)}% anual (equivalente al ${tasaMensual}% mensual). Dichos intereses se computarán y liquidarán mensualmente sobre el saldo promedio deudor que arroje la cuenta corriente mercantil al cierre de cada mes calendario, calculados en base exacta de días transcurridos entre la fecha de cada transferencia y el último día del mes respectivo (año bancario comercial de 360 días).`,
    },
    {
      title: 'CLÁUSULA QUINTA (MEMORIA DE CÁLCULO MENSUAL Y EMISIÓN DE NOTA DE DÉBITO FISCAL NO SUJETA AL IVA)',
      text: `Al cierre de cada mes calendario, el Departamento Contable de LA MUTUANTE elaborará una Memoria de Cálculo Auxiliar (Papel de Trabajo de Auditoría) firmada por el Contador Público y las partes, en la cual se detallarán de forma cronológica las transferencias bancarias realizadas durante el período, los saldos diarios ponderados y la liquidación matemática de los intereses causados. Con fundamento en dicha Memoria de Cálculo mensual, LA MUTUANTE emitirá una única Nota de Débito Fiscal mensual (bajo formato libre o computarizado autorizado por el SENIAT según Providencia SNAT/2011/00071) a cargo de EL MUTUARIO por el monto total de los intereses devengados en el mes. De conformidad con el Artículo 16, Numeral 3 de la Ley que Establece el Impuesto al Valor Agregado (LIVA), la presente operación de financiamiento dinerario y sus intereses se encuentra expresamente NO SUJETA AL IMPUESTO AL VALOR AGREGADO (IVA), asentándose en el Libro de Ventas en la columna de operaciones no gravadas. En caso de liquidación o compensación de intereses se aplicará la retención del Impuesto Sobre la Renta (ISLR) del cinco por ciento (5%) para personas naturales residentes de conformidad con el Decreto 1.808.`,
    },
    {
      title: 'CLÁUSULA SEXTA (AUTORIZACIÓN EN ASAMBLEA GENERAL Y ASENTAMIENTO EN LIBRO DE ACTAS)',
      text: `El otorgamiento de la presente línea de crédito rotativa, la fijación del techo crediticio y las condiciones financieras pactadas cuentan con la autorización previa, expresa y unánime de los accionistas que representan el cien por ciento (100%) del capital social de LA MUTUANTE en Asamblea General Extraordinaria de Accionistas de fecha ${fechaAsam}, debidamente asentada en las páginas Nro. ${pagLibro} del Libro de Actas de Asambleas de Accionistas sellado por el ${empresa.registro_mercantil}, sirviendo de soporte corporativo inimpugnable ante el SENIAT.`,
    },
    {
      title: 'CLÁUSULA SÉPTIMA (PLAZO, REPOSICIÓN Y RENOVACIÓN ANUAL)',
      text: `El plazo de duración de la presente línea de crédito rotativa es de doce (12) meses contados a partir de su suscripción o autenticación notarial. A su vencimiento, el contrato podrá ser renovado anualmente de mutuo acuerdo mediante la suscripción de un nuevo contrato notariado o ratificación en Asamblea General Ordinaria. EL MUTUARIO podrá amortizar total o parcialmente el capital adeudado en cualquier momento mediante transferencias bancarias, cheques o compensación con dividendos legítimamente decretados, sin penalidad alguna.`,
    },
    {
      title: 'CLÁUSULA OCTAVA (DOMICILIO, NOTIFICACIONES Y AUTENTICACIÓN NOTARIAL)',
      text: `Para todos los efectos derivados y consecuencias del presente contrato, las partes eligen como domicilio especial y excluyente a la ciudad de ${empresa.ciudad}, Estado ${empresa.estado}, a la jurisdicción de cuyos tribunales declaran someterse. Se suscriben dos (02) ejemplares de un mismo tenor y a un solo efecto en ${empresa.ciudad}, a los fines de su autenticación ante la Notaría Pública correspondiente, confiriéndole fecha cierta y plena oponibilidad ante el SENIAT y terceros mediante un único acto notarial anual.`,
    },
  ];

  const fullBody = preamble + '\n\n' + clauses.map(c => `${c.title}:\n${c.text}`).join('\n\n');

  return { title, body: fullBody, clauses };
}

/**
 * Downloads the Contrato Marco de Línea de Crédito Rotativa as Microsoft Word (.doc)
 */
export function downloadLineaCreditoWord(
  contrato: ContratoMutuo | null | undefined,
  empresa: Empresa,
  accionista: Accionista,
  techoUSD?: number,
  tasaAnual?: number
): void {
  const { title, clauses } = generateLineaCreditoRotativaText(contrato, empresa, accionista, techoUSD, tasaAnual);
  const limite = techoUSD || contrato?.limite_linea_credito_usd || 20000;
  const tasa = tasaAnual || contrato?.tasa_interes_anual || 12.0;

  const isDirectivoOGerente =
    accionista.es_accionista === false ||
    accionista.porcentaje_acciones === 0 ||
    accionista.tipo_vinculo === 'director' ||
    accionista.tipo_vinculo === 'gerente' ||
    accionista.tipo_vinculo === 'personal_confianza';

  const condicionFirmanteHTML = isDirectivoOGerente
    ? `en su carácter de <strong>${accionista.cargo_o_condicion || 'Director / Gerente'}</strong> y personal de confianza de la sociedad mercantil`
    : `en su condición de accionista y titular propietario del <strong>${accionista.porcentaje_acciones}%</strong> del capital social`;

  const cargoFirmaHTML = isDirectivoOGerente
    ? `${accionista.cargo_o_condicion || 'Director / Gerente de Confianza'}${accionista.departamento ? ` (${accionista.departamento})` : ''}`
    : `Accionista (${accionista.porcentaje_acciones}% Acciones)`;

  const correlativo = contrato?.correlativo || 'LC-ROT-2026-001';

  const htmlContent = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" 
          xmlns:w="urn:schemas-microsoft-com:office:word" 
          xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <title>${title} - ${correlativo}</title>
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>100</w:Zoom>
          <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
        @page {
          size: letter;
          margin: 1in 1in 1in 1in;
          mso-header-margin: 0.5in;
          mso-footer-margin: 0.5in;
        }
        body {
          font-family: 'Times New Roman', Times, serif;
          font-size: 11pt;
          line-height: 1.35;
          color: #000000;
          text-align: justify;
          text-justify: inter-ideograph;
        }
        .header-box {
          width: 100%;
          table-layout: fixed;
          border: 1.5pt solid #1e3a8a;
          background-color: #f8fafc;
          margin-bottom: 16pt;
          border-collapse: collapse;
        }
        .header-box td {
          padding: 8pt 10pt;
          vertical-align: top;
          overflow-wrap: break-word;
          word-break: break-word;
        }
        .company-name {
          font-size: 12pt;
          font-weight: bold;
          color: #1e3a8a;
          text-transform: uppercase;
        }
        .company-details {
          font-size: 8.5pt;
          color: #334155;
          line-height: 1.3;
        }
        .doc-title {
          font-size: 13pt;
          font-weight: bold;
          text-align: center;
          margin-top: 14pt;
          margin-bottom: 6pt;
          color: #0f172a;
          line-height: 1.25;
          text-transform: uppercase;
        }
        .correlativo-badge {
          text-align: center;
          font-size: 9.5pt;
          font-family: 'Courier New', monospace;
          font-weight: bold;
          color: #1e3a8a;
          margin-bottom: 14pt;
        }
        .techo-banner {
          width: 100%;
          border: 1pt dashed #0284c7;
          background-color: #f0f9ff;
          padding: 6pt 10pt;
          margin-bottom: 14pt;
          font-size: 9.5pt;
          color: #0369a1;
          text-align: center;
          font-weight: bold;
        }
        p.preamble-text {
          margin-top: 0;
          margin-bottom: 12pt;
          text-indent: 28pt;
          text-align: justify;
        }
        p.clause-title {
          font-weight: bold;
          font-size: 11pt;
          margin-top: 14pt;
          margin-bottom: 4pt;
          color: #0f172a;
          text-align: justify;
        }
        p.clause-text {
          margin-top: 0;
          margin-bottom: 10pt;
          text-indent: 28pt;
          text-align: justify;
        }
        .signatures-table {
          width: 100%;
          margin-top: 36pt;
          border-collapse: collapse;
          table-layout: fixed;
          page-break-inside: avoid;
        }
        .signature-cell {
          width: 50%;
          text-align: center;
          vertical-align: top;
          padding: 10pt;
        }
      </style>
    </head>
    <body>
      <table class="header-box" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="width: 70%;">
            <div class="company-name">${empresa.razon_social}</div>
            <div class="company-details"><strong>R.I.F.:</strong> ${empresa.rif_empresa} • <strong>REGISTRO:</strong> ${empresa.registro_mercantil}</div>
            <div class="company-details"><strong>DOMICILIO FISCAL:</strong> ${empresa.direccion_fiscal}, ${empresa.ciudad}, Edo. ${empresa.estado}</div>
            <div class="company-details"><strong>CONDICIÓN FISCAL:</strong> Contribuyente ${empresa.tipo_contribuyente}</div>
          </td>
          <td style="width: 30%; text-align: right;">
            <div style="font-size: 9pt; font-weight: bold; color: #1e3a8a;">BLINDAJE TRIBUTARIO SENIAT</div>
            <div style="font-size: 8pt; color: #475569;">1 Sola Notaría Anual</div>
            <div style="font-size: 8pt; color: #475569;">Art. 73 LISLR (12% Anual)</div>
            <div style="font-size: 8pt; color: #475569;">Art. 16 Num. 3 LIVA (No Sujeto)</div>
          </td>
        </tr>
      </table>

      <div class="doc-title">${title}</div>
      <div class="correlativo-badge">INSTRUMENTO LEGAL NOTARIAL NRO: ${correlativo}</div>

      <div class="techo-banner">
        TECHO MÁXIMO AUTORIZADO: ${formatUSD(limite)} • TASA PACTADA: ${tasa}% ANUAL • MODALIDAD: CUENTA CORRIENTE ROTATIVA
      </div>

      <p class="preamble-text">
        Nosotros, <strong>${empresa.razon_social}</strong>, sociedad mercantil legalmente constituida y domiciliada en ${empresa.ciudad}, Estado ${empresa.estado}, inscrita por ante el ${empresa.registro_mercantil}, con el Registro de Información Fiscal (R.I.F.) Nro. <strong>${empresa.rif_empresa}</strong>, en este acto válidamente representada por su ${empresa.cargo_representante}, ciudadano(a) <strong>${empresa.representante_legal}</strong>, titular de la Cédula de Identidad Nro. V-<strong>${empresa.cedula_representante}</strong>, debidamente facultado(a) según los Estatutos Sociales, en lo sucesivo y para todos los efectos denominada "<strong>LA MUTUANTE</strong>" (o LA ACREDITANTE), por una parte; y por la otra, el ciudadano(a) <strong>${accionista.nombre_accionista}</strong>, mayor de edad, titular de la Cédula de Identidad Nro. V-<strong>${accionista.cedula_accionista}</strong> y con R.I.F. Nro. <strong>${accionista.rif_accionista}</strong>, ${condicionFirmanteHTML}, en lo sucesivo denominado "<strong>EL MUTUARIO</strong>" (o EL ACREDITADO), convenimos en celebrar el presente <strong>CONTRATO MARCO DE APERTURA DE LÍNEA DE CRÉDITO ROTATIVA MEDIANTE CUENTA CORRIENTE MERCANTIL (MUTUO ROTATIVO)</strong>, el cual se regirá por las siguientes cláusulas:
      </p>

      ${clauses.map(c => `
        <p class="clause-title">${c.title}</p>
        <p class="clause-text">${c.text}</p>
      `).join('')}

      <table class="signatures-table" width="100%" cellpadding="0" cellspacing="0">
        <colgroup>
          <col width="50%" />
          <col width="50%" />
        </colgroup>
        <tr>
          <td class="signature-cell">
            <table width="85%" align="center" style="margin: 0 auto 6pt auto; border-top: 1.5pt solid #000000; border-collapse: collapse;">
              <tr><td style="font-size: 1pt; height: 1px; line-height: 1px;">&nbsp;</td></tr>
            </table>
            <strong>${empresa.representante_legal}</strong><br/>
            C.I. V-${empresa.cedula_representante}<br/>
            ${empresa.cargo_representante}<br/>
            <span style="font-size: 8.5pt; text-transform: uppercase;">Por LA MUTUANTE (${empresa.razon_social})</span>
          </td>
          <td class="signature-cell">
            <table width="85%" align="center" style="margin: 0 auto 6pt auto; border-top: 1.5pt solid #000000; border-collapse: collapse;">
              <tr><td style="font-size: 1pt; height: 1px; line-height: 1px;">&nbsp;</td></tr>
            </table>
            <strong>${accionista.nombre_accionista}</strong><br/>
            C.I. V-${accionista.cedula_accionista}<br/>
            R.I.F. ${accionista.rif_accionista}<br/>
            <span style="font-size: 8.5pt;">Por EL MUTUARIO (${cargoFirmaHTML})</span>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff' + htmlContent], {
    type: 'application/msword;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Contrato_Marco_Linea_Credito_Rotativa_${correlativo}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads the Contrato Marco de Línea de Crédito Rotativa as PDF
 */
export function downloadLineaCreditoPDF(
  contrato: ContratoMutuo | null | undefined,
  empresa: Empresa,
  accionista: Accionista,
  techoUSD?: number,
  tasaAnual?: number
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter',
  });

  const { title, clauses } = generateLineaCreditoRotativaText(contrato, empresa, accionista, techoUSD, tasaAnual);
  const limite = techoUSD || contrato?.limite_linea_credito_usd || 20000;
  const tasa = tasaAnual || contrato?.tasa_interes_anual || 12.0;
  const correlativo = contrato?.correlativo || 'LC-ROT-2026-001';

  const margin = 20;
  const pageWidth = 215.9;
  const pageHeight = 279.4;
  const usableWidth = pageWidth - margin * 2;
  let y = margin;

  // Header Box
  doc.setDrawColor(30, 58, 138);
  doc.setLineWidth(0.6);
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, y, usableWidth, 22, 'FD');

  doc.setFont('times', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(30, 58, 138);
  doc.text(empresa.razon_social, margin + 4, y + 5);

  doc.setFont('times', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text(`R.I.F. ${empresa.rif_empresa} • ${empresa.registro_mercantil}`, margin + 4, y + 9);
  doc.text(`Domicilio Fiscal: ${empresa.direccion_fiscal}, ${empresa.ciudad}, Edo. ${empresa.estado}`, margin + 4, y + 13);
  doc.text(`Condición Fiscal: Contribuyente ${empresa.tipo_contribuyente}`, margin + 4, y + 17);

  doc.setFont('times', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 58, 138);
  doc.text('BLINDAJE TRIBUTARIO SENIAT', pageWidth - margin - 4, y + 5, { align: 'right' });
  doc.setFont('times', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text('1 Sola Notaría Anual (20 Retiros/Mes)', pageWidth - margin - 4, y + 9, { align: 'right' });
  doc.text(`Techo: $${formatUSD(limite)} • Tasa: ${tasa}% Anual`, pageWidth - margin - 4, y + 13, { align: 'right' });
  doc.text('Art. 73 LISLR • Art. 16 Num 3 LIVA', pageWidth - margin - 4, y + 17, { align: 'right' });

  y += 26;

  // Document Title
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  const titleLines = doc.splitTextToSize(title, usableWidth);
  doc.text(titleLines, pageWidth / 2, y, { align: 'center' });
  y += titleLines.length * 4.5 + 1;

  doc.setFont('courier', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 58, 138);
  doc.text(`INSTRUMENTO NOTARIAL NRO: ${correlativo}`, pageWidth / 2, y, { align: 'center' });
  y += 6;

  // Banner
  doc.setFillColor(240, 249, 255);
  doc.setDrawColor(2, 132, 199);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, usableWidth, 6, 1, 1, 'FD');
  doc.setFont('times', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(3, 105, 161);
  doc.text(`LÍNEA ROTATIVA: ${formatUSD(limite)} USD • 12% INTERÉS ANUAL • EXENCIÓN DE CONTRATOS MENSUALES`, pageWidth / 2, y + 4.2, { align: 'center' });
  y += 9;

  // Preamble
  doc.setFont('times', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);

  const preambleText = `Nosotros, ${empresa.razon_social}, inscrita en el ${empresa.registro_mercantil}, R.I.F. Nro. ${empresa.rif_empresa}, representada por su ${empresa.cargo_representante}, ciudadano(a) ${empresa.representante_legal}, C.I. V-${empresa.cedula_representante}, denominada "LA MUTUANTE"; y por la otra, el ciudadano(a) ${accionista.nombre_accionista}, C.I. V-${accionista.cedula_accionista}, R.I.F. ${accionista.rif_accionista}, titular del ${accionista.porcentaje_acciones}% de acciones, denominado "EL MUTUARIO", convenimos en suscribir el presente Contrato Marco de Apertura de Línea de Crédito Rotativa bajo las siguientes cláusulas:`;
  const pLines = doc.splitTextToSize(preambleText, usableWidth);
  doc.text(pLines, margin, y, { align: 'justify', maxWidth: usableWidth });
  y += pLines.length * 4 + 3;

  // Clauses
  for (const clause of clauses) {
    if (y > pageHeight - 32) {
      doc.addPage();
      y = margin;
    }

    doc.setFont('times', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    const cTitleLines = doc.splitTextToSize(clause.title, usableWidth);
    doc.text(cTitleLines, margin, y);
    y += cTitleLines.length * 3.8 + 1;

    doc.setFont('times', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    const cTextLines = doc.splitTextToSize(clause.text, usableWidth);
    for (const line of cTextLines) {
      if (y > pageHeight - 25) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += 3.6;
    }
    y += 2.5;
  }

  // Signatures
  if (y > pageHeight - 40) {
    doc.addPage();
    y = margin + 10;
  } else {
    y += 8;
  }

  const colWidth = usableWidth / 2;
  const lineW = 60;

  // Left signature (Empresa)
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(margin + 10, y, margin + 10 + lineW, y);
  doc.setFont('times', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  doc.text(empresa.representante_legal, margin + 10 + lineW / 2, y + 4, { align: 'center' });
  doc.setFont('times', 'normal');
  doc.setFontSize(7.5);
  doc.text(`C.I. V-${empresa.cedula_representante} • ${empresa.cargo_representante}`, margin + 10 + lineW / 2, y + 7.5, { align: 'center' });
  doc.text(`Por LA MUTUANTE (${empresa.razon_social.substring(0, 30)})`, margin + 10 + lineW / 2, y + 11, { align: 'center' });

  // Right signature (Accionista)
  const rightX = margin + colWidth + 10;
  doc.line(rightX, y, rightX + lineW, y);
  doc.setFont('times', 'bold');
  doc.setFontSize(8);
  doc.text(accionista.nombre_accionista, rightX + lineW / 2, y + 4, { align: 'center' });
  doc.setFont('times', 'normal');
  doc.setFontSize(7.5);
  doc.text(`C.I. V-${accionista.cedula_accionista} • R.I.F. ${accionista.rif_accionista}`, rightX + lineW / 2, y + 7.5, { align: 'center' });
  doc.text(`Por EL MUTUARIO (Accionista ${accionista.porcentaje_acciones}%)`, rightX + lineW / 2, y + 11, { align: 'center' });

  // Footers
  const pageCount = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('times', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Página ${i} de ${pageCount} • Contrato Marco Línea de Crédito Rotativa - Respaldo SENIAT Art. 73 LISLR / Art. 16 LIVA`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
  }

  doc.save(`Contrato_Marco_Linea_Credito_Rotativa_${correlativo}.pdf`);
}

/**
 * Downloads the Contrato Marco de Línea de Crédito Rotativa as an Excel document (.xls)
 * with the Ficha Técnica, Tracking Table for Multiple Transfers, and Legal Contract
 */
export function downloadLineaCreditoExcel(
  contrato: ContratoMutuo | null | undefined,
  empresa: Empresa,
  accionista: Accionista,
  techoUSD?: number,
  tasaAnual?: number
): void {
  const { title, clauses } = generateLineaCreditoRotativaText(contrato, empresa, accionista, techoUSD, tasaAnual);
  const limite = techoUSD || contrato?.limite_linea_credito_usd || 20000;
  const tasa = tasaAnual || contrato?.tasa_interes_anual || 12.0;
  const correlativo = contrato?.correlativo || 'LC-ROT-2026-001';

  const xmlContent = `<?xml version="1.0" encoding="utf-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Borders/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#000000"/>
   <Interior/>
   <NumberFormat/>
   <Protection/>
  </Style>
  <Style ss:ID="HeaderTitle">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
   <Font ss:FontName="Calibri" ss:Size="14" ss:Color="#FFFFFF" ss:Bold="1"/>
   <Interior ss:Color="#1E3A8A" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="HeaderSub">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#FFFFFF" ss:Italic="1"/>
   <Interior ss:Color="#1E3A8A" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="SectionHeader">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#FFFFFF" ss:Bold="1"/>
   <Interior ss:Color="#0F766E" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="TableHeader">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#0F172A" ss:Bold="1"/>
   <Interior ss:Color="#E2E8F0" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#94A3B8"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#94A3B8"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#94A3B8"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#94A3B8"/>
   </Borders>
  </Style>
  <Style ss:ID="TableCell">
   <Alignment ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#1E293B"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
   </Borders>
  </Style>
  <Style ss:ID="TableCellBold">
   <Alignment ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#0F172A" ss:Bold="1"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
   </Borders>
  </Style>
  <Style ss:ID="CurrencyCell">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#0F172A" ss:Bold="1"/>
   <NumberFormat ss:Format="#,##0.00"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
   </Borders>
  </Style>
  <Style ss:ID="LegalText">
   <Alignment ss:Horizontal="Left" ss:Vertical="Top" ss:WrapText="1"/>
   <Font ss:FontName="Times New Roman" ss:Size="10" ss:Color="#1E293B"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
  </Style>
 </Styles>

 <Worksheet ss:Name="Ficha Tecnica &amp; Memoria">
  <Table ss:ExpandedColumnCount="8" ss:DefaultRowHeight="20">
   <Column ss:Width="40"/>
   <Column ss:Width="160"/>
   <Column ss:Width="140"/>
   <Column ss:Width="120"/>
   <Column ss:Width="80"/>
   <Column ss:Width="100"/>
   <Column ss:Width="100"/>
   <Column ss:Width="120"/>

   <Row ss:Height="28">
    <Cell ss:MergeAcross="7" ss:StyleID="HeaderTitle">
     <Data ss:Type="String">${empresa.razon_social} - EXPEDIENTE TRIBUTARIO SENIAT</Data>
    </Cell>
   </Row>
   <Row ss:Height="20">
    <Cell ss:MergeAcross="7" ss:StyleID="HeaderSub">
     <Data ss:Type="String">CONTRATO MARCO DE LÍNEA DE CRÉDITO ROTATIVA (1 SOLA NOTARÍA ANUAL) • RIF ${empresa.rif_empresa}</Data>
    </Cell>
   </Row>
   <Row><Cell><Data ss:Type="String"></Data></Cell></Row>

   <Row>
    <Cell ss:MergeAcross="7" ss:StyleID="SectionHeader">
     <Data ss:Type="String">1. PARÁMETROS GENERALES DEL CONTRATO NOTARIAL</Data>
    </Cell>
   </Row>
   <Row>
    <Cell ss:StyleID="TableCellBold"><Data ss:Type="String">Instrumento:</Data></Cell>
    <Cell ss:MergeAcross="2" ss:StyleID="TableCell"><Data ss:Type="String">${correlativo} - Apertura de Línea Rotativa</Data></Cell>
    <Cell ss:StyleID="TableCellBold"><Data ss:Type="String">Techo Máximo:</Data></Cell>
    <Cell ss:MergeAcross="2" ss:StyleID="CurrencyCell"><Data ss:Type="Number">${limite}</Data></Cell>
   </Row>
   <Row>
    <Cell ss:StyleID="TableCellBold"><Data ss:Type="String">Mutuante:</Data></Cell>
    <Cell ss:MergeAcross="2" ss:StyleID="TableCell"><Data ss:Type="String">${empresa.razon_social} (RIF: ${empresa.rif_empresa})</Data></Cell>
    <Cell ss:StyleID="TableCellBold"><Data ss:Type="String">Tasa Interés:</Data></Cell>
    <Cell ss:MergeAcross="2" ss:StyleID="TableCell"><Data ss:Type="String">${tasa}% Anual (${(tasa / 12).toFixed(2)}% Mensual)</Data></Cell>
   </Row>
   <Row>
    <Cell ss:StyleID="TableCellBold"><Data ss:Type="String">Mutuario:</Data></Cell>
    <Cell ss:MergeAcross="2" ss:StyleID="TableCell"><Data ss:Type="String">${accionista.nombre_accionista} (CI: ${accionista.cedula_accionista}, ${accionista.porcentaje_acciones}%)</Data></Cell>
    <Cell ss:StyleID="TableCellBold"><Data ss:Type="String">Régimen IVA:</Data></Cell>
    <Cell ss:MergeAcross="2" ss:StyleID="TableCell"><Data ss:Type="String">No Sujeto (Art. 16 Num 3 LIVA)</Data></Cell>
   </Row>
   <Row>
    <Cell ss:StyleID="TableCellBold"><Data ss:Type="String">Base Legal:</Data></Cell>
    <Cell ss:MergeAcross="2" ss:StyleID="TableCell"><Data ss:Type="String">Art. 73 LISLR (Dividendo Ficto) • Art. 503 C.Com</Data></Cell>
    <Cell ss:StyleID="TableCellBold"><Data ss:Type="String">Retención ISLR:</Data></Cell>
    <Cell ss:MergeAcross="2" ss:StyleID="TableCell"><Data ss:Type="String">5% Dto. 1808 (Personas Naturales)</Data></Cell>
   </Row>
   <Row><Cell><Data ss:Type="String"></Data></Cell></Row>

   <Row>
    <Cell ss:MergeAcross="7" ss:StyleID="SectionHeader">
     <Data ss:Type="String">2. MODELO DE MEMORIA DE CÁLCULO MENSUAL (PAPEL DE TRABAJO PARA LAS 20 TRANSFERENCIAS)</Data>
    </Cell>
   </Row>
   <Row ss:Height="22">
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">N°</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Fecha Tx</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Referencia Bancaria</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Banco Destino</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Días Mes</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Monto Dispuesto (USD)</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Interés 12% USD</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Equiv. Bs (BCV)</Data></Cell>
   </Row>
   ${[
     { n: 1, f: '02/10/2026', ref: 'BNC-749281', b: 'Banesco', d: 29, usd: 850 },
     { n: 2, f: '04/10/2026', ref: 'BNC-749402', b: 'Mercantil', d: 27, usd: 500 },
     { n: 3, f: '07/10/2026', ref: 'BNC-750119', b: 'Banesco', d: 24, usd: 1200 },
     { n: 4, f: '11/10/2026', ref: 'BNC-750982', b: 'Banesco', d: 20, usd: 400 },
     { n: 5, f: '14/10/2026', ref: 'BNC-751430', b: 'Provincial', d: 17, usd: 950 },
     { n: 6, f: '18/10/2026', ref: 'BNC-752104', b: 'Banesco', d: 13, usd: 600 },
     { n: 7, f: '22/10/2026', ref: 'BNC-753091', b: 'Mercantil', d: 9, usd: 1100 },
     { n: 8, f: '25/10/2026', ref: 'BNC-753820', b: 'Banesco', d: 6, usd: 750 },
     { n: 9, f: '28/10/2026', ref: 'BNC-754291', b: 'Banesco', d: 3, usd: 450 },
     { n: 10, f: '30/10/2026', ref: 'BNC-754810', b: 'Mercantil', d: 1, usd: 300 },
   ].map(r => {
     const intUsd = (r.usd * (tasa / 100) * r.d) / 360;
     const tasaBcvEst = 44.5;
     const intBs = intUsd * tasaBcvEst;
     return `
   <Row>
    <Cell ss:StyleID="TableCell"><Data ss:Type="Number">${r.n}</Data></Cell>
    <Cell ss:StyleID="TableCell"><Data ss:Type="String">${r.f}</Data></Cell>
    <Cell ss:StyleID="TableCell"><Data ss:Type="String">${r.ref}</Data></Cell>
    <Cell ss:StyleID="TableCell"><Data ss:Type="String">${r.b}</Data></Cell>
    <Cell ss:StyleID="TableCell"><Data ss:Type="Number">${r.d}</Data></Cell>
    <Cell ss:StyleID="CurrencyCell"><Data ss:Type="Number">${r.usd}</Data></Cell>
    <Cell ss:StyleID="CurrencyCell"><Data ss:Type="Number">${intUsd.toFixed(2)}</Data></Cell>
    <Cell ss:StyleID="CurrencyCell"><Data ss:Type="Number">${intBs.toFixed(2)}</Data></Cell>
   </Row>`;
   }).join('')}
   <Row ss:Height="22">
    <Cell ss:StyleID="TableCellBold"><Data ss:Type="String">TOTAL</Data></Cell>
    <Cell ss:MergeAcross="3" ss:StyleID="TableCell"><Data ss:Type="String">Múltiples disposiciones del mes (1 sola Nota de Débito)</Data></Cell>
    <Cell ss:StyleID="CurrencyCell"><Data ss:Type="Number">7100.00</Data></Cell>
    <Cell ss:StyleID="CurrencyCell"><Data ss:Type="Number">41.85</Data></Cell>
    <Cell ss:StyleID="CurrencyCell"><Data ss:Type="Number">1862.33</Data></Cell>
   </Row>
  </Table>
 </Worksheet>

 <Worksheet ss:Name="Texto Contrato Notarial">
  <Table ss:ExpandedColumnCount="2" ss:DefaultRowHeight="18">
   <Column ss:Width="200"/>
   <Column ss:Width="650"/>

   <Row ss:Height="26">
    <Cell ss:MergeAcross="1" ss:StyleID="HeaderTitle">
     <Data ss:Type="String">${title}</Data>
    </Cell>
   </Row>
   <Row><Cell><Data ss:Type="String"></Data></Cell></Row>

   <Row>
    <Cell ss:StyleID="TableCellBold"><Data ss:Type="String">Encabezamiento / Partes:</Data></Cell>
    <Cell ss:StyleID="LegalText"><Data ss:Type="String">Nosotros, ${empresa.razon_social} (LA MUTUANTE) y ${accionista.nombre_accionista} (EL MUTUARIO), convenimos en suscribir el presente Contrato Marco de Apertura de Línea de Crédito Rotativa.</Data></Cell>
   </Row>

   ${clauses.map(c => `
   <Row ss:Height="50">
    <Cell ss:StyleID="TableCellBold"><Data ss:Type="String">${c.title}</Data></Cell>
    <Cell ss:StyleID="LegalText"><Data ss:Type="String">${c.text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</Data></Cell>
   </Row>
   `).join('')}

   <Row><Cell><Data ss:Type="String"></Data></Cell></Row>
   <Row>
    <Cell ss:StyleID="TableCellBold"><Data ss:Type="String">Firma LA MUTUANTE:</Data></Cell>
    <Cell ss:StyleID="TableCell"><Data ss:Type="String">${empresa.representante_legal} - C.I. V-${empresa.cedula_representante} (${empresa.cargo_representante})</Data></Cell>
   </Row>
   <Row>
    <Cell ss:StyleID="TableCellBold"><Data ss:Type="String">Firma EL MUTUARIO:</Data></Cell>
    <Cell ss:StyleID="TableCell"><Data ss:Type="String">${accionista.nombre_accionista} - C.I. V-${accionista.cedula_accionista} (Accionista ${accionista.porcentaje_acciones}%)</Data></Cell>
   </Row>
  </Table>
 </Worksheet>
</Workbook>`;

  const blob = new Blob(['\ufeff' + xmlContent], {
    type: 'application/vnd.ms-excel;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Expediente_Linea_Credito_Rotativa_${correlativo}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}



