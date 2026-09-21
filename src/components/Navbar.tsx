import React, { useState } from 'react';
import { Empresa } from '../types';
import { 
  Building2, 
  ShieldCheck, 
  Coins, 
  TrendingUp, 
  FileText, 
  Landmark, 
  Scale, 
  CheckCircle2, 
  ChevronDown, 
  Edit3, 
  Sparkles,
  BookOpen,
  ShieldAlert,
  FileSpreadsheet
} from 'lucide-react';

interface NavbarProps {
  empresas: Empresa[];
  selectedEmpresa: Empresa;
  onSelectEmpresa: (empresa: Empresa) => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  tasaBCV: number;
  onUpdateTasaBCV: (nuevaTasa: number) => void;
  onOpenPricing: () => void;
  onOpenTerms: () => void;
  onOpenCompanyManager: () => void;
  onOpenFiscalReport?: () => void;
  onOpenLineaCredito?: () => void;
  onOpenGuide: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  empresas,
  selectedEmpresa,
  onSelectEmpresa,
  activeTab,
  onSelectTab,
  tasaBCV,
  onUpdateTasaBCV,
  onOpenPricing,
  onOpenTerms,
  onOpenCompanyManager,
  onOpenFiscalReport,
  onOpenLineaCredito,
  onOpenGuide,
}) => {
  const [editingTasa, setEditingTasa] = useState(false);
  const [tempTasa, setTempTasa] = useState(tasaBCV.toString());

  const handleSaveTasa = () => {
    const val = parseFloat(tempTasa);
    if (!isNaN(val) && val > 0) {
      onUpdateTasaBCV(val);
    }
    setEditingTasa(false);
  };

  const navItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard / Semáforo', 
      icon: TrendingUp,
      color: 'emerald',
    },
    { 
      id: 'contratos', 
      label: 'Contratos de Mutuo', 
      icon: FileText, 
      color: 'blue',
    },
    { 
      id: 'asamblea', 
      label: 'Actas de Asamblea', 
      icon: Landmark, 
      color: 'purple',
    },
    { 
      id: 'matching', 
      label: 'Matching Bancario', 
      icon: Scale, 
      color: 'amber',
    },
    { 
      id: 'asientos', 
      label: 'Asientos Contables', 
      icon: BookOpen,
      color: 'slate',
    },
    { 
      id: 'igtf', 
      label: 'Control IGTF (3%)', 
      icon: Coins,
      color: 'slate',
    },
    { 
      id: 'validador', 
      label: 'Fecha Cierta & Respaldo', 
      icon: ShieldCheck,
      color: 'slate',
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
      
      {/* Top Banner Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100">
        
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black shadow-sm shadow-blue-500/25">
            <span className="text-base tracking-tight font-black">SD</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl tracking-wider text-slate-900 uppercase">
                SOCIO<span className="text-blue-600">-DOC</span>
              </span>
              <span className="text-[10px] font-bold bg-blue-50 border border-blue-200/80 text-blue-700 px-2 py-0.5 rounded-full uppercase tracking-wider">
                VENEZUELA 2026
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Control de Cuentas de Socios & Blindaje Tributario SENIAT
            </p>
          </div>
        </div>

        {/* Center: Empresa Selector & Multi-Empresa Manager */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 transition-colors shadow-2xs">
            <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <select
              value={selectedEmpresa.id}
              onChange={(e) => {
                if (e.target.value === '__add_new__') {
                  onOpenCompanyManager();
                  return;
                }
                const found = empresas.find(emp => emp.id === e.target.value);
                if (found) onSelectEmpresa(found);
              }}
              className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer pr-1 max-w-[200px] sm:max-w-[280px] truncate"
            >
              {empresas.map(emp => (
                <option key={emp.id} value={emp.id} className="bg-white text-slate-900">
                  {emp.razon_social.substring(0, 32)}... ({emp.rif_empresa})
                </option>
              ))}
              <option value="__add_new__" className="bg-blue-50 text-blue-700 font-bold">
                + Registrar Nueva Empresa...
              </option>
            </select>
          </div>

          <button
            onClick={onOpenCompanyManager}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-2xs"
            title="Abrir panel de administración multi-empresa"
          >
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Empresas</span>
            <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
              {empresas.length}
            </span>
          </button>

          <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-lg border hidden md:inline-block ${
            selectedEmpresa.tipo_contribuyente === 'Especial'
              ? 'bg-purple-50 text-purple-700 border-purple-200'
              : 'bg-slate-100 text-slate-600 border-slate-200'
          }`}>
            {selectedEmpresa.tipo_contribuyente === 'Especial' ? 'Sujeto Pasivo Especial' : 'Contribuyente Ordinario'}
          </span>
        </div>

        {/* Right: BCV Exchange Rate & SaaS Plan CTA */}
        <div className="flex items-center gap-2">
          
          {/* BCV Rate Pill */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1 rounded-xl text-xs font-mono shadow-2xs">
            <span className="text-[11px] text-slate-500 font-sans font-medium">Tasa BCV:</span>
            {editingTasa ? (
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  step="0.01"
                  value={tempTasa}
                  onChange={(e) => setTempTasa(e.target.value)}
                  className="w-16 bg-white border border-blue-500 rounded px-1.5 py-0.5 text-xs text-slate-900 focus:outline-none"
                />
                <button
                  onClick={handleSaveTasa}
                  className="bg-blue-600 text-white font-bold px-1.5 py-0.5 rounded text-[10px] cursor-pointer hover:bg-blue-700"
                >
                  OK
                </button>
              </div>
            ) : (
              <div
                onClick={() => setEditingTasa(true)}
                className="flex items-center gap-1 text-blue-700 font-bold cursor-pointer hover:underline"
                title="Haga clic para actualizar la tasa oficial BCV"
              >
                <span>Bs. {tasaBCV.toFixed(2)}</span>
                <Edit3 className="w-3 h-3 text-slate-400" />
              </div>
            )}
          </div>

          {/* Botón: Contrato Marco de Línea (1 Notaría/Año) */}
          {onOpenLineaCredito && (
            <button
              onClick={onOpenLineaCredito}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 hover:text-blue-800 text-xs font-medium rounded-lg transition-colors cursor-pointer shadow-2xs"
              title="Abrir Contrato Marco de Línea de Crédito Rotativa (1 Sola Notaría Anual para Múltiples Retiros)"
            >
              <Scale className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Contrato Marco de Línea</span>
              <span className="sm:hidden">C. Marco</span>
              <span className="bg-blue-200/70 text-blue-800 text-[10px] font-semibold px-1 py-0.2 rounded">
                1 Notaría/Año
              </span>
            </button>
          )}

          {/* Cierre Fiscal Excel Button */}
          {onOpenFiscalReport && (
            <button
              onClick={onOpenFiscalReport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-2xs"
              title="Exportar Resumen Consolidado Excel para el Cierre Fiscal SENIAT"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Cierre Fiscal Excel</span>
            </button>
          )}

          {/* Pricing Button */}
          <button
            onClick={onOpenPricing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Planes SaaS</span>
          </button>

          {/* Guide Button */}
          <button
            onClick={onOpenGuide}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-2xs"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
            <span>Guía de Inicio</span>
          </button>

          {/* Legal Disclaimer link */}
          <button
            onClick={onOpenTerms}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            title="Exención de Responsabilidad Tributaria (Art. X)"
          >
            <ShieldAlert className="w-4 h-4" />
          </button>

        </div>

      </div>

      {/* Navigation Submenu Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-wrap items-center gap-2 py-2.5 text-xs bg-slate-50/90 border-t border-slate-200">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          let btnClass = '';
          let iconWrapClass = '';

          if (item.id === 'dashboard') {
            btnClass = isActive
              ? 'bg-emerald-600 text-white border-2 border-emerald-700 shadow-sm font-bold ring-2 ring-emerald-300'
              : 'bg-emerald-50 text-emerald-950 border border-emerald-400 hover:bg-emerald-100 hover:border-emerald-600 font-bold';
            iconWrapClass = isActive ? 'bg-white/20 text-white' : 'bg-emerald-200/80 text-emerald-900';
          } else if (item.id === 'contratos') {
            btnClass = isActive
              ? 'bg-blue-600 text-white border-2 border-blue-700 shadow-sm font-bold ring-2 ring-blue-300'
              : 'bg-blue-50 text-blue-950 border border-blue-400 hover:bg-blue-100 hover:border-blue-600 font-bold';
            iconWrapClass = isActive ? 'bg-white/20 text-white' : 'bg-blue-200/80 text-blue-900';
          } else if (item.id === 'asamblea') {
            btnClass = isActive
              ? 'bg-purple-600 text-white border-2 border-purple-700 shadow-sm font-bold ring-2 ring-purple-300'
              : 'bg-purple-50 text-purple-950 border border-purple-400 hover:bg-purple-100 hover:border-purple-600 font-bold';
            iconWrapClass = isActive ? 'bg-white/20 text-white' : 'bg-purple-200/80 text-purple-900';
          } else if (item.id === 'matching') {
            btnClass = isActive
              ? 'bg-amber-500 text-white border-2 border-amber-600 shadow-sm font-bold ring-2 ring-amber-300'
              : 'bg-amber-50 text-amber-950 border border-amber-400 hover:bg-amber-100 hover:border-amber-600 font-bold';
            iconWrapClass = isActive ? 'bg-white/20 text-white' : 'bg-amber-200/80 text-amber-950';
          } else {
            btnClass = isActive
              ? 'bg-slate-800 text-white border border-slate-900 shadow-xs font-semibold'
              : 'bg-white text-slate-700 hover:text-slate-950 hover:bg-slate-100 border border-slate-300 font-medium';
            iconWrapClass = isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600';
          }

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-all whitespace-nowrap cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 ${btnClass}`}
              title={`Ir a: ${item.label}`}
            >
              <span className={`p-1 rounded-md flex items-center justify-center transition-colors ${iconWrapClass}`}>
                <Icon className="w-3.5 h-3.5" />
              </span>
              <span className="tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>

    </header>
  );
};
