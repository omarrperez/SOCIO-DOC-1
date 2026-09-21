import React from 'react';
import { ShieldAlert, CheckCircle2, X } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept?: () => void;
  accepted?: boolean;
}

export const TermsModal: React.FC<TermsModalProps> = ({
  isOpen,
  onClose,
  onAccept,
  accepted = true,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                Términos de Exención de Responsabilidad Tributaria
              </h2>
              <p className="text-xs text-slate-500">
                Artículo X: Cumplimiento bajo la legislación mercantil y tributaria venezolana
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-4 text-sm text-slate-700 leading-relaxed font-sans border-b border-slate-200">
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex gap-2.5 items-start">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
            <span>
              <strong>Aviso Legal Importante:</strong> El uso de <strong>SOCIO-DOC</strong> automatiza la emisión probatoria pero requiere que la información suministrada concuerde fielmente con los movimientos bancarios reales de la empresa y los libros mercantiles físicos sellados.
            </span>
          </div>

          <div className="space-y-3 text-xs text-slate-700">
            <p className="font-bold text-slate-900 uppercase tracking-wide text-[11px]">
              CLÁUSULA DE EXENCIÓN DE RESPONSABILIDAD TRIBUTARIA Y LEGAL
            </p>
            <p>
              <strong>"El Usuario"</strong> (término que agrupa a contadores, administradores, empresas y personas naturales que utilicen la plataforma) reconoce y acepta formalmente que <strong>SOCIO-DOC</strong> es única y exclusivamente una herramienta tecnológica de automatización documental y asistencia administrativa.
            </p>
            <p>En consecuencia, las partes acuerdan los siguientes términos de exclusión de responsabilidad:</p>

            <div className="space-y-2.5 pl-3 border-l-2 border-slate-300">
              <div>
                <strong className="text-slate-900">1. Naturaleza del Servicio:</strong> La plataforma no presta servicios de asesoría jurídica, fiscal, contable ni financiera personalizada. Los modelos de contratos, recibos y alertas fiscales generados por el sistema son estándares referenciales basados en la normativa legal venezolana vigente, pero su validez definitiva dependerá exclusivamente de la veracidad de los datos introducidos por El Usuario.
              </div>

              <div>
                <strong className="text-slate-900">2. Negligencia u Omisión del Usuario:</strong> SOCIO-DOC queda totalmente exenta de cualquier responsabilidad legal, civil, penal o mercantil si la Administración Tributaria Nacional (SENIAT) o cualquier otro organismo regulador rechaza, impugna o descalifica los contratos generados a través de la aplicación debido a:
                <ul className="list-disc pl-5 mt-1 space-y-1 text-slate-600">
                  <li>Introducción de datos falsos, erróneos, inexactos o simulados por parte del Usuario (montos, fechas, identidades o números de referencia bancaria).</li>
                  <li>Omisión en la ejecución de los pasos recomendados por el sistema, tales como la obtención de Fecha Cierta (notarización, sellado de tiempo digital o firma electrónica certificada).</li>
                  <li>Falta de correspondencia real y verificable entre el contrato generado por la aplicación y los movimientos reflejados en los estados de cuenta bancarios o registros de la Blockchain de la empresa.</li>
                  <li>Configuración de contratos calificados como "Dividendos Presuntos" (Art. 72 de la LISLR) cuando el Usuario, bajo su propio riesgo, decida realizar préstamos de la empresa hacia el accionista sin cumplir con los requisitos legales mínimos exigidos por la ley.</li>
                </ul>
              </div>

              <div>
                <strong className="text-slate-900">3. Inexistencia de Garantía de Resultado:</strong> SOCIO-DOC no garantiza que la sola presentación de los documentos generados por la plataforma impida el levantamiento de un acta de reparo, imposición de multas o sanciones por parte del SENIAT durante un proceso de fiscalización, toda vez que los fiscales actúan bajo la sana crítica y la valoración integral de la contabilidad material del contribuyente.
              </div>

              <div>
                <strong className="text-slate-900">4. Indemnidad:</strong> El Usuario se obliga a mantener indemne a SOCIO-DOC, sus desarrolladores, directivos y filiales frente a cualquier reclamación, sanción económica, demanda o pérdida financiera derivada del uso incorrecto, fraudulento o negligente de los documentos emitidos por el sistema.
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-emerald-700 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Condiciones vigentes (Ejercicio Fiscal Venezuela 2026)</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (onAccept) onAccept();
                onClose();
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              {accepted ? 'Entendido y Conforme' : 'Aceptar Términos'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
