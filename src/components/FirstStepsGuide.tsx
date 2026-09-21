import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Scale, 
  Coins, 
  FileSpreadsheet, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  X,
  BookOpen
} from 'lucide-react';

interface GuideStep {
  title: string;
  description: string;
  icon: React.ElementType;
}

const steps: GuideStep[] = [
  {
    title: "1. Configuración Inicial",
    description: "Registra tu empresa y vincula a los socios en el módulo 'Company Manager' para asegurar que toda la documentación legal contenga los datos correctos.",
    icon: Building2
  },
  {
    title: "2. Contrato Marco",
    description: "Genera el Contrato de Línea de Crédito desde el Dashboard. Este contrato permite agrupar múltiples transferencias y requiere notarización solo una vez al año.",
    icon: Scale
  },
  {
    title: "3. Registro Bancario",
    description: "Traslada los fondos de la empresa al socio y registra el movimiento bancario en el sistema para crear la trazabilidad legal.",
    icon: Coins
  },
  {
    title: "4. Memoria de Cálculo",
    description: "Usa la planilla de cálculo mensual para liquidar los intereses según la tasa oficial BCV y mantener el control de los saldos.",
    icon: FileSpreadsheet
  },
  {
    title: "5. Reporte Fiscal SENIAT",
    description: "Emite la nota de débito fiscal como soporte contable final para presentar ante el SENIAT y blindar la operación.",
    icon: CheckCircle2
  }
];

export const FirstStepsGuide: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-200">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <BookOpen className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">Primeros Pasos en SOCIO-DOC</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg cursor-pointer">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                {React.createElement(steps[currentStep].icon, { className: "w-6 h-6" })}
              </div>
              <h3 className="text-lg font-black text-slate-900">{steps[currentStep].title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{steps[currentStep].description}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between p-4 bg-slate-50 border-t border-slate-100">
          <div className="flex gap-1">
            {steps.map((_, index) => (
              <div 
                key={index} 
                className={`w-2 h-2 rounded-full ${index === currentStep ? 'bg-blue-600' : 'bg-slate-300'}`} 
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button 
              disabled={currentStep === 0}
              onClick={() => setCurrentStep(prev => prev - 1)}
              className="p-2 rounded-lg hover:bg-slate-200 disabled:opacity-50 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <button 
              onClick={() => currentStep === steps.length - 1 ? onClose() : setCurrentStep(prev => prev + 1)}
              className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 cursor-pointer"
            >
              {currentStep === steps.length - 1 ? 'Finalizar' : 'Siguiente'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
