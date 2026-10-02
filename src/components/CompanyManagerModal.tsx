import React, { useState, useEffect } from 'react';
import { Empresa, Accionista, ContratoMutuo, TipoContribuyente, ConfiguracionFiscalEmpresa, ConceptoRetencionISLR } from '../types';
import { formatVES, formatUSD } from '../utils/formatters';
import { 
  Building2, 
  Plus, 
  Check, 
  X, 
  Users, 
  FileText, 
  Edit3, 
  ShieldCheck, 
  AlertCircle, 
  MapPin, 
  Phone, 
  Mail, 
  Coins, 
  Save, 
  Trash2,
  CheckCircle2,
  Briefcase,
  UserCheck,
  Shield,
  Layers,
  Sparkles,
  Info,
  Percent,
  Calculator,
  Scale,
  Receipt,
  RotateCcw,
  FileSpreadsheet,
  Sliders
} from 'lucide-react';
import { 
  obtenerConfiguracionFiscal, 
  CATALOGO_CONCEPTOS_ISLR, 
  ConceptoFiscalInfo, 
  CONFIGURACION_FISCAL_DEFAULT,
  calcularRecibosConConfiguracionFiscal
} from '../utils/fiscalUtils';
import { RECIBOS_PAGOS_AGRICOLA_ONI } from '../data/recibosPagosData';

interface CompanyManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  empresas: Empresa[];
  selectedEmpresa: Empresa;
  onSelectEmpresa: (empresa: Empresa) => void;
  onSaveEmpresa: (empresa: Empresa) => void;
  onUpdateEmpresa: (empresa: Empresa) => void;
  accionistas: Accionista[];
  onSaveAccionista: (accionista: Accionista) => void;
  onDeleteAccionista?: (accionistaId: string) => void;
  contratos: ContratoMutuo[];
  initialTab?: 'directorio' | 'nueva' | 'editar' | 'socios' | 'fiscal';
}

export const CompanyManagerModal: React.FC<CompanyManagerModalProps> = ({
  isOpen,
  onClose,
  empresas,
  selectedEmpresa,
  onSelectEmpresa,
  onSaveEmpresa,
  onUpdateEmpresa,
  accionistas,
  onSaveAccionista,
  onDeleteAccionista,
  contratos,
  initialTab,
}) => {
  const [activeTab, setActiveTab] = useState<'directorio' | 'nueva' | 'editar' | 'socios' | 'fiscal'>(initialTab || 'directorio');
  const [companyToEdit, setCompanyToEdit] = useState<Empresa>(selectedEmpresa);
  const [fiscalConfig, setFiscalConfig] = useState<ConfiguracionFiscalEmpresa>(() => obtenerConfiguracionFiscal(selectedEmpresa));

  // Sync state on prop changes
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  useEffect(() => {
    setFiscalConfig(obtenerConfiguracionFiscal(selectedEmpresa));
    setCompanyToEdit(selectedEmpresa);
  }, [selectedEmpresa]);

  // Filter and mode states for Socios / Directores / Gerentes tab
  const [memberType, setMemberType] = useState<'accionista' | 'director_gerente'>('accionista');
  const [filtroVinculo, setFiltroVinculo] = useState<'todos' | 'accionistas' | 'directivos'>('todos');
  const [editingAccionistaId, setEditingAccionistaId] = useState<string | null>(null);
  const [departamento, setDepartamento] = useState<string>('Operaciones');

  // New Company Form State
  const [formData, setFormData] = useState<Partial<Empresa>>({
    razon_social: '',
    rif_empresa: 'J-',
    registro_mercantil: '',
    representante_legal: '',
    cedula_representante: '',
    cargo_representante: 'Director General',
    tipo_contribuyente: 'Especial',
    capital_social_ves: 100000,
    ciudad: 'Caracas',
    estado: 'Distrito Capital',
    direccion_fiscal: '',
    telefono: '+58 ',
    email: '',
  });

  // New Accionista Form State
  const [newAccionista, setNewAccionista] = useState<Partial<Accionista>>({
    nombre_accionista: '',
    cedula_accionista: '',
    rif_accionista: 'V-',
    porcentaje_acciones: 50,
    cargo_o_condicion: 'Socio Accionista',
    tipo_vinculo: 'accionista',
    es_accionista: true,
    departamento: '',
    facultades: '',
    telefono: '+58 ',
    email: '',
    banco_frecuente: 'Banesco Banco Universal',
    numero_cuenta: '',
    billetera_usdt: '',
  });

  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStartEdit = (emp: Empresa) => {
    setCompanyToEdit({ ...emp });
    setActiveTab('editar');
  };

  const handleCreateCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.razon_social || !formData.rif_empresa || !formData.representante_legal) {
      alert('Por favor complete los campos obligatorios (Razón Social, RIF y Representante Legal).');
      return;
    }

    const newEmpresa: Empresa = {
      id: `emp-${Date.now()}`,
      razon_social: formData.razon_social.toUpperCase().trim(),
      rif_empresa: formData.rif_empresa.toUpperCase().trim(),
      registro_mercantil: formData.registro_mercantil || 'Registro Mercantil Segundo, Tomo 1-A',
      representante_legal: formData.representante_legal.trim(),
      cedula_representante: formData.cedula_representante?.trim() || '00.000.000',
      cargo_representante: formData.cargo_representante || 'Director Presidente',
      tipo_contribuyente: (formData.tipo_contribuyente as TipoContribuyente) || 'Especial',
      capital_social_ves: Number(formData.capital_social_ves) || 50000,
      ciudad: formData.ciudad || 'Caracas',
      estado: formData.estado || 'Distrito Capital',
      direccion_fiscal: formData.direccion_fiscal || 'Zona Empresarial',
      telefono: formData.telefono || '+58 212-0000000',
      email: formData.email || 'administracion@empresa.com.ve',
    };

    onSaveEmpresa(newEmpresa);
    onSelectEmpresa(newEmpresa);

    // Auto-create default representative as partner
    const defaultAccionista: Accionista = {
      id: `acc-${Date.now()}`,
      empresa_id: newEmpresa.id,
      nombre_accionista: newEmpresa.representante_legal,
      cedula_accionista: newEmpresa.cedula_representante,
      rif_accionista: `V-${newEmpresa.cedula_representante.replace(/\./g, '')}-1`,
      porcentaje_acciones: 100,
      cargo_o_condicion: `${newEmpresa.cargo_representante} y Accionista Principal`,
      telefono: newEmpresa.telefono,
      email: newEmpresa.email,
    };
    onSaveAccionista(defaultAccionista);

    setFormSuccess(`¡Empresa "${newEmpresa.razon_social}" registrada exitosamente y activada!`);
    setTimeout(() => {
      setFormSuccess(null);
      setActiveTab('directorio');
    }, 1500);
  };

  const handleUpdateCompany = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateEmpresa(companyToEdit);
    if (selectedEmpresa.id === companyToEdit.id) {
      onSelectEmpresa(companyToEdit);
    }
    setFormSuccess('Datos de la empresa actualizados correctamente.');
    setTimeout(() => {
      setFormSuccess(null);
      setActiveTab('directorio');
    }, 1200);
  };

  const handleAddAccionista = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccionista.nombre_accionista || !newAccionista.cedula_accionista) {
      alert('Por favor ingrese el nombre y la cédula de la persona.');
      return;
    }

    const isDirectivo = memberType === 'director_gerente';
    const cargoFinal = newAccionista.cargo_o_condicion?.trim() || 
      (isDirectivo ? 'Director / Gerente de Confianza' : 'Socio Accionista');

    const accionistaObj: Accionista = {
      id: editingAccionistaId || `acc-${Date.now()}`,
      empresa_id: selectedEmpresa.id,
      nombre_accionista: newAccionista.nombre_accionista.trim(),
      cedula_accionista: newAccionista.cedula_accionista.trim(),
      rif_accionista: newAccionista.rif_accionista?.trim() || `V-${newAccionista.cedula_accionista.replace(/\./g, '')}-0`,
      porcentaje_acciones: isDirectivo ? 0 : (Number(newAccionista.porcentaje_acciones) || 0),
      cargo_o_condicion: cargoFinal,
      tipo_vinculo: isDirectivo
        ? (cargoFinal.toLowerCase().includes('director') ? 'director' : 'gerente')
        : 'accionista',
      es_accionista: !isDirectivo,
      departamento: isDirectivo ? (newAccionista.departamento || departamento) : undefined,
      facultades: isDirectivo
        ? (newAccionista.facultades || 'Personal de confianza facultado para transferencias operativas y rendición de cuentas')
        : 'Socio titular con participación en capital social',
      telefono: newAccionista.telefono || '',
      email: newAccionista.email || '',
      banco_frecuente: newAccionista.banco_frecuente,
      numero_cuenta: newAccionista.numero_cuenta,
      billetera_usdt: newAccionista.billetera_usdt,
    };

    onSaveAccionista(accionistaObj);
    setEditingAccionistaId(null);
    setNewAccionista({
      nombre_accionista: '',
      cedula_accionista: '',
      rif_accionista: 'V-',
      porcentaje_acciones: 10,
      cargo_o_condicion: isDirectivo ? 'Gerente de Operaciones' : 'Socio Accionista',
      tipo_vinculo: isDirectivo ? 'gerente' : 'accionista',
      es_accionista: !isDirectivo,
      departamento: departamento,
      facultades: '',
      telefono: '+58 ',
      email: '',
      banco_frecuente: 'Banesco Banco Universal',
      numero_cuenta: '',
      billetera_usdt: '',
    });
    setFormSuccess(
      editingAccionistaId
        ? `Datos de "${accionistaObj.nombre_accionista}" actualizados exitosamente.`
        : `${isDirectivo ? 'Director/Gerente' : 'Socio'} "${accionistaObj.nombre_accionista}" registrado para ${selectedEmpresa.razon_social}`
    );
    setTimeout(() => setFormSuccess(null), 2500);
  };

  const handleEditMember = (acc: Accionista) => {
    setEditingAccionistaId(acc.id);
    const isDirectivo = 
      acc.es_accionista === false || 
      acc.porcentaje_acciones === 0 || 
      acc.tipo_vinculo === 'director' || 
      acc.tipo_vinculo === 'gerente' || 
      acc.tipo_vinculo === 'personal_confianza';

    setMemberType(isDirectivo ? 'director_gerente' : 'accionista');
    if (acc.departamento) setDepartamento(acc.departamento);
    setNewAccionista({
      ...acc,
      departamento: acc.departamento || 'Operaciones',
    });
  };

  const handleCancelEdit = () => {
    setEditingAccionistaId(null);
    setNewAccionista({
      nombre_accionista: '',
      cedula_accionista: '',
      rif_accionista: 'V-',
      porcentaje_acciones: 10,
      cargo_o_condicion: memberType === 'director_gerente' ? 'Gerente de Operaciones' : 'Socio Accionista',
      tipo_vinculo: memberType === 'director_gerente' ? 'gerente' : 'accionista',
      es_accionista: memberType !== 'director_gerente',
      departamento: departamento,
      facultades: '',
      telefono: '+58 ',
      email: '',
      banco_frecuente: 'Banesco Banco Universal',
      numero_cuenta: '',
      billetera_usdt: '',
    });
  };

  const handleDeleteMember = (acc: Accionista) => {
    if (window.confirm(`¿Está seguro de eliminar a "${acc.nombre_accionista}" de ${selectedEmpresa.razon_social}?`)) {
      if (onDeleteAccionista) {
        onDeleteAccionista(acc.id);
        if (editingAccionistaId === acc.id) {
          handleCancelEdit();
        }
        setFormSuccess(`Registro de "${acc.nombre_accionista}" eliminado.`);
        setTimeout(() => setFormSuccess(null), 2000);
      }
    }
  };

  const currentAccionistas = accionistas.filter(a => a.empresa_id === selectedEmpresa.id);
  const countAccionistas = currentAccionistas.filter(
    a => a.es_accionista !== false && (a.porcentaje_acciones > 0 || a.tipo_vinculo === 'accionista')
  ).length;
  const countDirectivos = currentAccionistas.filter(
    a => a.es_accionista === false || a.porcentaje_acciones === 0 || a.tipo_vinculo === 'director' || a.tipo_vinculo === 'gerente' || a.tipo_vinculo === 'personal_confianza'
  ).length;

  const filteredMembers = currentAccionistas.filter(a => {
    const isDirectivo = a.es_accionista === false || a.porcentaje_acciones === 0 || a.tipo_vinculo === 'director' || a.tipo_vinculo === 'gerente' || a.tipo_vinculo === 'personal_confianza';
    if (filtroVinculo === 'accionistas') return !isDirectivo;
    if (filtroVinculo === 'directivos') return isDirectivo;
    return true;
  });

  const handleSelectConceptoFiscal = (concepto: ConceptoRetencionISLR) => {
    let nuevoPorcentaje = 5.0;
    if (concepto === 'honorarios_profesionales_pn') {
      nuevoPorcentaje = fiscalConfig.porcentaje_honorarios_profesionales_pn || 3.0;
    } else if (concepto === 'servicios_profesionales_pj') {
      nuevoPorcentaje = fiscalConfig.porcentaje_servicios_profesionales_pj || 5.0;
    } else if (concepto === 'intereses_mutuo_pn') {
      nuevoPorcentaje = fiscalConfig.porcentaje_intereses_mutuo_pn || 5.0;
    } else if (concepto === 'intereses_mutuo_pj') {
      nuevoPorcentaje = fiscalConfig.porcentaje_intereses_mutuo_pj || 5.0;
    } else if (concepto === 'comisiones_mercantiles_pn') {
      nuevoPorcentaje = fiscalConfig.porcentaje_comisiones_pn || 3.0;
    } else if (concepto === 'comisiones_mercantiles_pj') {
      nuevoPorcentaje = fiscalConfig.porcentaje_comisiones_pj || 5.0;
    } else if (concepto === 'ejecucion_obras_servicios_pn') {
      nuevoPorcentaje = fiscalConfig.porcentaje_obras_servicios_pn || 1.0;
    } else if (concepto === 'ejecucion_obras_servicios_pj') {
      nuevoPorcentaje = fiscalConfig.porcentaje_obras_servicios_pj || 2.0;
    } else if (concepto === 'no_domiciliados_exterior') {
      nuevoPorcentaje = fiscalConfig.porcentaje_no_domiciliados || 34.0;
    } else if (concepto === 'personalizado') {
      nuevoPorcentaje = fiscalConfig.porcentaje_personalizado || 5.0;
    }

    setFiscalConfig(prev => ({
      ...prev,
      concepto_activo: concepto,
      porcentaje_retencion_activo: nuevoPorcentaje,
    }));
  };

  const handleSaveFiscalConfig = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const updatedCompany: Empresa = {
      ...selectedEmpresa,
      configuracion_fiscal: { ...fiscalConfig },
    };
    onUpdateEmpresa(updatedCompany);
    if (selectedEmpresa.id === updatedCompany.id) {
      onSelectEmpresa(updatedCompany);
    }
    setCompanyToEdit(updatedCompany);
    setFormSuccess(
      `¡Configuración fiscal guardada con éxito! La retención del ${fiscalConfig.porcentaje_retencion_activo}% (${CATALOGO_CONCEPTOS_ISLR[fiscalConfig.concepto_activo]?.titulo || 'Personalizado'}) se aplicará automáticamente a los recibos de pago.`
    );
    setTimeout(() => setFormSuccess(null), 3500);
  };

  const handleResetFiscalDefaults = () => {
    if (window.confirm('¿Desea restablecer las alícuotas fiscales a los valores estándar de la normativa del Decreto 1.808?')) {
      const resetConfig: ConfiguracionFiscalEmpresa = {
        ...CONFIGURACION_FISCAL_DEFAULT,
        concepto_activo: 'honorarios_profesionales_pn',
        porcentaje_retencion_activo: 3.0,
      };
      setFiscalConfig(resetConfig);
      setFormSuccess('Se han restablecido los porcentajes estándar del Decreto 1.808.');
      setTimeout(() => setFormSuccess(null), 2500);
    }
  };

  const previewCalculation = calcularRecibosConConfiguracionFiscal(
    RECIBOS_PAGOS_AGRICOLA_ONI,
    fiscalConfig
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-2xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Gestión Multi-Empresas</span>
                <span className="text-[11px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                  {empresas.length} {empresas.length === 1 ? 'Empresa' : 'Empresas'}
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Administre expedientes fiscales, socios y contratos independientes por cada razón social
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 py-2 bg-white border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('directorio')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'directorio'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Directorio de Empresas</span>
          </button>

          <button
            onClick={() => setActiveTab('nueva')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'nueva'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Registrar Nueva Empresa</span>
          </button>

          <button
            onClick={() => {
              setCompanyToEdit({ ...selectedEmpresa });
              setActiveTab('editar');
            }}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'editar'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Editar Datos ({selectedEmpresa.rif_empresa})</span>
          </button>

          <button
            onClick={() => setActiveTab('socios')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'socios'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Socios, Directores & Gerentes ({currentAccionistas.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('fiscal')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'fiscal'
                ? 'bg-purple-700 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Percent className="w-3.5 h-3.5" />
            <span>Configuración Fiscal & ISLR</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
              activeTab === 'fiscal' ? 'bg-purple-900/60 text-purple-200' : 'bg-purple-100 text-purple-800'
            }`}>
              {fiscalConfig.aplicar_retencion_automatica ? `${fiscalConfig.porcentaje_retencion_activo}%` : 'Inactivo'}
            </span>
          </button>
        </div>

        {/* Success alert banner */}
        {formSuccess && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{formSuccess}</span>
          </div>
        )}

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 text-slate-800 text-xs">
          
          {/* TAB 1: DIRECTORIO DE EMPRESAS */}
          {activeTab === 'directorio' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                  Haga clic en <strong className="text-slate-700">"Seleccionar"</strong> para conmutar la empresa de trabajo activa en todos los módulos contables y fiscales.
                </span>
                <button
                  onClick={() => setActiveTab('nueva')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir Empresa</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {empresas.map((emp) => {
                  const isSelected = emp.id === selectedEmpresa.id;
                  const empContratos = contratos.filter(c => c.empresa_id === emp.id);
                  const empAccionistas = accionistas.filter(a => a.empresa_id === emp.id);
                  const totalPagarUSD = empContratos
                    .filter(c => c.tipo_flujo === 'socio_a_empresa' && c.estado === 'activo')
                    .reduce((acc, c) => acc + c.monto_indexado_usd, 0);
                  const totalCobrarUSD = empContratos
                    .filter(c => c.tipo_flujo === 'empresa_a_socio' && c.estado === 'activo')
                    .reduce((acc, c) => acc + c.monto_indexado_usd, 0);

                  return (
                    <div
                      key={emp.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/40 shadow-xs ring-1 ring-blue-500/20'
                          : 'border-slate-200 bg-white hover:border-slate-300 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-sm text-slate-900 line-clamp-1">
                              {emp.razon_social}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="font-mono text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              {emp.rif_empresa}
                            </span>
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                              emp.tipo_contribuyente === 'Especial'
                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}>
                              {emp.tipo_contribuyente === 'Especial' ? 'Sujeto Pasivo Especial (IGTF 3%)' : 'Ordinario'}
                            </span>
                          </div>
                        </div>

                        {isSelected ? (
                          <span className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-600 text-white text-[11px] font-bold shadow-2xs">
                            <Check className="w-3 h-3" />
                            <span>Activa</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => onSelectEmpresa(emp)}
                            className="shrink-0 px-2.5 py-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            Seleccionar
                          </button>
                        )}
                      </div>

                      <div className="text-[11px] text-slate-500 space-y-1 my-3 border-t border-b border-slate-100 py-2">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{emp.ciudad}, Edo. {emp.estado} - {emp.direccion_fiscal}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>Rep. Legal: <strong>{emp.representante_legal}</strong> (C.I. {emp.cedula_representante})</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>Capital Social Registrado: <strong>{formatVES(emp.capital_social_ves)}</strong></span>
                        </div>
                      </div>

                      {/* Financial summary pills */}
                      <div className="grid grid-cols-2 gap-2 text-[11px] mb-3">
                        <div className="bg-emerald-50 border border-emerald-200 p-2 rounded-lg">
                          <div className="text-emerald-700 font-medium text-[10px]">Cuentas por Pagar Socios:</div>
                          <div className="font-bold text-emerald-800 text-xs">{formatUSD(totalPagarUSD)}</div>
                        </div>
                        <div className="bg-rose-50 border border-rose-200 p-2 rounded-lg">
                          <div className="text-rose-700 font-medium text-[10px]">Cuentas por Cobrar Socios:</div>
                          <div className="font-bold text-rose-800 text-xs">{formatUSD(totalCobrarUSD)}</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 text-[11px]">
                        <span className="text-slate-500">
                          {empContratos.length} Contratos • {empAccionistas.length} Socios
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleStartEdit(emp)}
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium hover:underline cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Editar</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: REGISTRAR NUEVA EMPRESA */}
          {activeTab === 'nueva' && (
            <form onSubmit={handleCreateCompany} className="space-y-4 max-w-2xl mx-auto bg-slate-50/50 p-5 rounded-2xl border border-slate-200">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="font-bold text-sm text-slate-900">Registrar Nueva Sociedad Mercantil</h3>
                <p className="text-xs text-slate-500">
                  Ingrese los datos jurídicos y fiscales conforme a su R.I.F. y Acta Constitutiva inscrita en el Registro Mercantil.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Razón Social Completa *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="EJ: SERVICIOS Y SUMINISTROS PETROLEROS DE ORIENTE, C.A."
                    value={formData.razon_social}
                    onChange={(e) => setFormData({ ...formData, razon_social: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    R.I.F. Fiscal *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="J-50123456-7"
                    value={formData.rif_empresa}
                    onChange={(e) => setFormData({ ...formData, rif_empresa: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono uppercase font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tipo de Contribuyente SENIAT *
                  </label>
                  <select
                    value={formData.tipo_contribuyente}
                    onChange={(e) => setFormData({ ...formData, tipo_contribuyente: e.target.value as TipoContribuyente })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    <option value="Especial">Sujeto Pasivo Especial (Obligado a retener 3% IGTF)</option>
                    <option value="Ordinario">Contribuyente Ordinario</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Datos de Registro Mercantil
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Registro Mercantil Primero de Caracas, Tomo 45-A, Nro. 18 de fecha 10/06/2019"
                    value={formData.registro_mercantil}
                    onChange={(e) => setFormData({ ...formData, registro_mercantil: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Representante Legal *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nombre y Apellidos"
                    value={formData.representante_legal}
                    onChange={(e) => setFormData({ ...formData, representante_legal: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cédula Representante Legal
                  </label>
                  <input
                    type="text"
                    placeholder="15.678.901"
                    value={formData.cedula_representante}
                    onChange={(e) => setFormData({ ...formData, cedula_representante: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cargo Representante Legal
                  </label>
                  <input
                    type="text"
                    placeholder="Director General / Presidente"
                    value={formData.cargo_representante}
                    onChange={(e) => setFormData({ ...formData, cargo_representante: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Capital Social Registrado (Bs.)
                  </label>
                  <input
                    type="number"
                    step="1000"
                    placeholder="100000"
                    value={formData.capital_social_ves}
                    onChange={(e) => setFormData({ ...formData, capital_social_ves: parseFloat(e.target.value) })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ciudad / Municipio
                  </label>
                  <input
                    type="text"
                    placeholder="Caracas"
                    value={formData.ciudad}
                    onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Estado
                  </label>
                  <input
                    type="text"
                    placeholder="Distrito Capital / Miranda / Carabobo"
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Dirección Fiscal
                  </label>
                  <input
                    type="text"
                    placeholder="Avenida, Centro Empresarial, Piso, Oficina"
                    value={formData.direccion_fiscal}
                    onChange={(e) => setFormData({ ...formData, direccion_fiscal: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    placeholder="+58 (212) 000-0000"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    placeholder="administracion@empresa.com.ve"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('directorio')}
                  className="px-4 py-2 border border-slate-300 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar y Activar Empresa</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: EDITAR EMPRESA SELECCIONADA */}
          {activeTab === 'editar' && (
            <form onSubmit={handleUpdateCompany} className="space-y-4 max-w-2xl mx-auto bg-slate-50/50 p-5 rounded-2xl border border-slate-200">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="font-bold text-sm text-slate-900">Editar Datos de la Empresa</h3>
                <p className="text-xs text-slate-500">
                  Actualice los datos legales y la clasificación tributaria para {companyToEdit.razon_social}.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Razón Social Completa
                  </label>
                  <input
                    type="text"
                    required
                    value={companyToEdit.razon_social}
                    onChange={(e) => setCompanyToEdit({ ...companyToEdit, razon_social: e.target.value.toUpperCase() })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    R.I.F. Fiscal
                  </label>
                  <input
                    type="text"
                    required
                    value={companyToEdit.rif_empresa}
                    onChange={(e) => setCompanyToEdit({ ...companyToEdit, rif_empresa: e.target.value.toUpperCase() })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tipo de Contribuyente SENIAT
                  </label>
                  <select
                    value={companyToEdit.tipo_contribuyente}
                    onChange={(e) => setCompanyToEdit({ ...companyToEdit, tipo_contribuyente: e.target.value as TipoContribuyente })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    <option value="Especial">Sujeto Pasivo Especial (Retiene 3% IGTF)</option>
                    <option value="Ordinario">Contribuyente Ordinario</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Registro Mercantil
                  </label>
                  <input
                    type="text"
                    value={companyToEdit.registro_mercantil}
                    onChange={(e) => setCompanyToEdit({ ...companyToEdit, registro_mercantil: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Representante Legal
                  </label>
                  <input
                    type="text"
                    value={companyToEdit.representante_legal}
                    onChange={(e) => setCompanyToEdit({ ...companyToEdit, representante_legal: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cédula Representante
                  </label>
                  <input
                    type="text"
                    value={companyToEdit.cedula_representante}
                    onChange={(e) => setCompanyToEdit({ ...companyToEdit, cedula_representante: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Capital Social Registrado (Bs.)
                  </label>
                  <input
                    type="number"
                    value={companyToEdit.capital_social_ves}
                    onChange={(e) => setCompanyToEdit({ ...companyToEdit, capital_social_ves: parseFloat(e.target.value) })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ciudad / Estado
                  </label>
                  <input
                    type="text"
                    value={`${companyToEdit.ciudad}, ${companyToEdit.estado}`}
                    onChange={(e) => {
                      const parts = e.target.value.split(',');
                      setCompanyToEdit({
                        ...companyToEdit,
                        ciudad: parts[0]?.trim() || companyToEdit.ciudad,
                        estado: parts[1]?.trim() || companyToEdit.estado,
                      });
                    }}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('directorio')}
                  className="px-4 py-2 border border-slate-300 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold cursor-pointer"
                >
                  Volver al Directorio
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Actualizar Empresa</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: SOCIOS, DIRECTORES Y GERENTES DE LA EMPRESA SELECCIONADA */}
          {activeTab === 'socios' && (
            <div className="space-y-5">
              {/* Header Box with Status */}
              <div className="bg-gradient-to-r from-blue-50/80 via-slate-50 to-indigo-50/70 border border-blue-200/80 p-4 rounded-xl shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        Directorio de Firmantes: {selectedEmpresa.razon_social}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-blue-100/70 text-blue-800 rounded font-semibold">
                        RIF: {selectedEmpresa.rif_empresa}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Personas legalmente facultadas para celebrar contratos de mutuo con la empresa (Socios, Directores, Gerentes y Personal de Confianza).
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold text-blue-800 bg-white px-2.5 py-1 rounded-lg border border-blue-200 font-mono shadow-2xs">
                      Capital Social: {currentAccionistas.reduce((acc, a) => acc + (a.porcentaje_acciones || 0), 0)}%
                    </span>
                  </div>
                </div>

                {/* Practical Case Notice (Crisbaorca 2009, C.A. pattern) */}
                <div className="mt-3 pt-3 border-t border-blue-200/60 flex items-start gap-2.5 text-xs text-slate-700 bg-white/80 p-2.5 rounded-lg border border-blue-100">
                  <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-blue-900 font-semibold">Blindaje Fiscal Operativo (Ej: Crisbaorca 2009, C.A.):</strong>{' '}
                    En empresas con accionista único o varios socios donde <strong>Directores y Gerentes</strong> (ej. Gerente de Operaciones, Gerente de Administración) reciben transferencias de la empresa para gastos y compras, estos fondos <strong>no son dividendos ni sueldos ocultos</strong>. Se deben documentar con contratos mutuos y rendición de cuentas para evitar sanciones del SENIAT.
                  </div>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2">
                <div className="flex items-center gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setFiltroVinculo('todos')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                      filtroVinculo === 'todos'
                        ? 'bg-slate-900 text-white font-semibold'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Todos ({currentAccionistas.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFiltroVinculo('accionistas')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                      filtroVinculo === 'accionistas'
                        ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Socios / Accionistas ({countAccionistas})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFiltroVinculo('directivos')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                      filtroVinculo === 'directivos'
                        ? 'bg-amber-600 text-white font-semibold shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Directores & Gerentes ({countDirectivos})</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    handleCancelEdit();
                    // Scroll to form smoothly
                    const formElement = document.getElementById('form-gestion-firmante');
                    if (formElement) formElement.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nuevo Firmante</span>
                </button>
              </div>

              {/* List of current members */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {filteredMembers.length === 0 ? (
                  <div className="col-span-full py-8 text-center text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                    <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="text-xs">No se encontraron firmantes bajo este filtro.</p>
                  </div>
                ) : (
                  filteredMembers.map((acc) => {
                    const isDirectivo =
                      acc.es_accionista === false ||
                      acc.porcentaje_acciones === 0 ||
                      acc.tipo_vinculo === 'director' ||
                      acc.tipo_vinculo === 'gerente' ||
                      acc.tipo_vinculo === 'personal_confianza';

                    const contratosAsociados = contratos.filter(
                      c => c.accionista_id === acc.id || c.empresa_id === selectedEmpresa.id
                    );

                    return (
                      <div
                        key={acc.id}
                        className={`p-4 bg-white border rounded-xl shadow-2xs transition-all relative ${
                          editingAccionistaId === acc.id
                            ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50/20'
                            : isDirectivo
                            ? 'border-amber-200/80 hover:border-amber-300'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-900 text-sm">{acc.nombre_accionista}</h4>
                              {isDirectivo ? (
                                <span className="text-[10px] font-semibold bg-amber-100 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                                  <Briefcase className="w-3 h-3 text-amber-700" />
                                  <span>Director / Gerente</span>
                                </span>
                              ) : (
                                <span className="text-[10px] font-semibold bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                                  <Users className="w-3 h-3 text-blue-600" />
                                  <span>Accionista ({acc.porcentaje_acciones}%)</span>
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center gap-2">
                              <span>C.I. {acc.cedula_accionista}</span>
                              <span>•</span>
                              <span>RIF: {acc.rif_accionista}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleEditMember(acc)}
                              title="Editar datos de este firmante"
                              className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            {onDeleteAccionista && (
                              <button
                                type="button"
                                onClick={() => handleDeleteMember(acc)}
                                title="Eliminar registro"
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="mt-2.5 pt-2.5 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Cargo / Función:</span>
                            <strong className="text-slate-900 font-semibold">{acc.cargo_o_condicion}</strong>
                          </div>

                          {acc.departamento && (
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">Área / Departamento:</span>
                              <span className="text-slate-800 font-medium">{acc.departamento}</span>
                            </div>
                          )}

                          {acc.facultades && (
                            <div className="text-[11px] text-slate-500 bg-slate-50 p-1.5 rounded border border-slate-100 mt-1">
                              <strong>Facultades:</strong> {acc.facultades}
                            </div>
                          )}

                          {acc.banco_frecuente && (
                            <div className="flex items-center justify-between pt-1">
                              <span className="text-slate-500">Banco habitual:</span>
                              <span className="font-mono text-slate-800 text-[11px] truncate max-w-[200px]">
                                {acc.banco_frecuente} {acc.numero_cuenta ? `(${acc.numero_cuenta.slice(-4)})` : ''}
                              </span>
                            </div>
                          )}

                          {acc.billetera_usdt && (
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-slate-500">Wallet USDT:</span>
                              <span className="font-mono text-emerald-700 truncate max-w-[180px]">
                                {acc.billetera_usdt}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Add / Edit Form */}
              <form
                id="form-gestion-firmante"
                onSubmit={handleAddAccionista}
                className="bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200 space-y-4 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    {editingAccionistaId ? (
                      <>
                        <Edit3 className="w-4 h-4 text-blue-600" />
                        <span>Modificar Firmante: {newAccionista.nombre_accionista}</span>
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-4 h-4 text-blue-600" />
                        <span>Registrar Nuevo Firmante para {selectedEmpresa.razon_social}</span>
                      </>
                    )}
                  </div>

                  {editingAccionistaId && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
                    >
                      Cancelar Edición
                    </button>
                  )}
                </div>

                {/* Role / Relationship Selector: Accionista vs Director / Gerente */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Tipo de Vínculo Jurídico con la Empresa *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setMemberType('accionista');
                        setNewAccionista(prev => ({
                          ...prev,
                          porcentaje_acciones: prev.porcentaje_acciones && prev.porcentaje_acciones > 0 ? prev.porcentaje_acciones : 25,
                          cargo_o_condicion: prev.cargo_o_condicion || 'Socio Accionista',
                          tipo_vinculo: 'accionista',
                          es_accionista: true,
                        }));
                      }}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                        memberType === 'accionista'
                          ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-100 text-blue-900 shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className={`p-2 rounded-lg shrink-0 ${memberType === 'accionista' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs">Socio / Accionista</div>
                        <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                          Posee porcentaje del capital social y acciones registradas en el libro mercantil.
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMemberType('director_gerente');
                        setNewAccionista(prev => ({
                          ...prev,
                          porcentaje_acciones: 0,
                          cargo_o_condicion: prev.cargo_o_condicion && prev.cargo_o_condicion !== 'Socio Accionista' ? prev.cargo_o_condicion : 'Gerente de Operaciones',
                          tipo_vinculo: 'gerente',
                          es_accionista: false,
                          departamento: prev.departamento || 'Operaciones',
                          facultades: prev.facultades || 'Personal de confianza facultado para transferencias y compras operativas',
                        }));
                      }}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                        memberType === 'director_gerente'
                          ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-100 text-amber-900 shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className={`p-2 rounded-lg shrink-0 ${memberType === 'director_gerente' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs">Director / Gerente de Confianza</div>
                        <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                          Sin acciones (0%). Maneja cuentas o recibe transferencias para operatividad y compras (ej. Crisbaorca 2009).
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Quick Presets for Directors and Managers */}
                {memberType === 'director_gerente' && (
                  <div className="bg-amber-50/70 border border-amber-200 p-3 rounded-lg space-y-2">
                    <div className="text-[11px] font-semibold text-amber-900 flex items-center justify-between">
                      <span>Cargos Frecuentes de Personal de Confianza:</span>
                      <span className="text-[10px] text-amber-700">Haga clic para autocompletar</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { cargo: 'Gerente de Operaciones', depto: 'Operaciones', fac: 'Gestión y compras operativas de planta y equipos' },
                        { cargo: 'Gerente de Administración', depto: 'Administración', fac: 'Supervisión contable, tesorería y pagos a proveedores' },
                        { cargo: 'Director General', depto: 'Dirección General', fac: 'Representación operativa y coordinación ejecutiva' },
                        { cargo: 'Gerente de Finanzas', depto: 'Finanzas', fac: 'Control presupuestario y administración de fondos operativos' },
                        { cargo: 'Gerente de Logística', depto: 'Logística', fac: 'Compras y traslados de insumos para la empresa' },
                      ].map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setNewAccionista(prev => ({
                              ...prev,
                              cargo_o_condicion: item.cargo,
                              departamento: item.depto,
                              facultades: item.fac,
                            }));
                            setDepartamento(item.depto);
                          }}
                          className="px-2.5 py-1 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-md text-[11px] font-medium transition-colors cursor-pointer"
                        >
                          + {item.cargo}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Form Fields Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Nombre Completo *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Carlos Luis Salazar Rondón"
                      value={newAccionista.nombre_accionista}
                      onChange={(e) => setNewAccionista({ ...newAccionista, nombre_accionista: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Cédula de Identidad *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: 14.892.110"
                      value={newAccionista.cedula_accionista}
                      onChange={(e) => {
                        const val = e.target.value;
                        const cleanNum = val.replace(/\D/g, '');
                        setNewAccionista({ 
                          ...newAccionista, 
                          cedula_accionista: val,
                          rif_accionista: newAccionista.rif_accionista?.startsWith('V-') && cleanNum
                            ? `V-${cleanNum}-0`
                            : newAccionista.rif_accionista
                        });
                      }}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">RIF Fiscal *</label>
                    <input
                      type="text"
                      required
                      placeholder="V-14892110-0"
                      value={newAccionista.rif_accionista}
                      onChange={(e) => setNewAccionista({ ...newAccionista, rif_accionista: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      {memberType === 'director_gerente' ? 'Cargo Oficial' : 'Cargo o Condición'} *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={memberType === 'director_gerente' ? 'Ej: Gerente de Operaciones' : 'Ej: Accionista Mayoritario'}
                      value={newAccionista.cargo_o_condicion}
                      onChange={(e) => setNewAccionista({ ...newAccionista, cargo_o_condicion: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {memberType === 'accionista' ? (
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        % Cuota de Acciones (1 a 100%) *
                      </label>
                      <input
                        type="number"
                        required
                        min="0.01"
                        max="100"
                        step="0.01"
                        placeholder="50"
                        value={newAccionista.porcentaje_acciones}
                        onChange={(e) => setNewAccionista({ ...newAccionista, porcentaje_acciones: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Área / Departamento
                      </label>
                      <select
                        value={newAccionista.departamento || departamento}
                        onChange={(e) => {
                          setDepartamento(e.target.value);
                          setNewAccionista({ ...newAccionista, departamento: e.target.value });
                        }}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="Operaciones">Operaciones y Producción</option>
                        <option value="Administración">Administración</option>
                        <option value="Finanzas y Contabilidad">Finanzas y Contabilidad</option>
                        <option value="Logística y Suministros">Logística y Suministros</option>
                        <option value="Dirección General">Dirección General</option>
                        <option value="Ventas y Comercialización">Ventas y Comercialización</option>
                        <option value="General">Personal de Confianza General</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      {memberType === 'director_gerente' ? 'Facultades / Destino de Fondos' : 'Teléfono de Contacto'}
                    </label>
                    <input
                      type="text"
                      placeholder={memberType === 'director_gerente' ? 'Compras operativas, compras de insumos' : '+58 414-0000000'}
                      value={memberType === 'director_gerente' ? (newAccionista.facultades || '') : (newAccionista.telefono || '')}
                      onChange={(e) => {
                        if (memberType === 'director_gerente') {
                          setNewAccionista({ ...newAccionista, facultades: e.target.value });
                        } else {
                          setNewAccionista({ ...newAccionista, telefono: e.target.value });
                        }
                      }}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Banco Frecuente</label>
                    <input
                      type="text"
                      placeholder="Banesco / Provincial / Venezuela"
                      value={newAccionista.banco_frecuente || ''}
                      onChange={(e) => setNewAccionista({ ...newAccionista, banco_frecuente: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Número de Cuenta Bancaria (20 dígitos)</label>
                    <input
                      type="text"
                      maxLength={20}
                      placeholder="0134-0000-00-0000000000"
                      value={newAccionista.numero_cuenta || ''}
                      onChange={(e) => setNewAccionista({ ...newAccionista, numero_cuenta: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Billetera USDT (Opcional - Red TRC-20)</label>
                    <input
                      type="text"
                      placeholder="TXx... (Red TRC-20)"
                      value={newAccionista.billetera_usdt || ''}
                      onChange={(e) => setNewAccionista({ ...newAccionista, billetera_usdt: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono text-[11px]"
                    />
                  </div>
                </div>

                {/* Role Note */}
                {memberType === 'director_gerente' && (
                  <div className="text-[11px] text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200/80 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      <strong>Blindaje SENIAT:</strong> Este directivo/gerente figurará con 0% de acciones en los libros societarios, pero con plena personalidad para ser contraparte en contratos de mutuo sobre transferencias bancarias de fondos de la empresa.
                    </span>
                  </div>
                )}

                <div className="pt-2 flex items-center justify-end gap-2">
                  {editingAccionistaId && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium rounded-lg text-xs transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    type="submit"
                    className={`px-5 py-2 font-semibold rounded-lg text-xs transition-all cursor-pointer shadow-2xs flex items-center gap-1.5 text-white ${
                      memberType === 'director_gerente'
                        ? 'bg-amber-600 hover:bg-amber-700'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    <Save className="w-4 h-4" />
                    <span>
                      {editingAccionistaId
                        ? 'Guardar Modificaciones'
                        : memberType === 'director_gerente'
                        ? `Registrar ${newAccionista.cargo_o_condicion || 'Director/Gerente'}`
                        : 'Registrar Socio Accionista'}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 5: CONFIGURACIÓN FISCAL & RETENCIONES ISLR */}
          {activeTab === 'fiscal' && (
            <div className="space-y-5">
              {/* Header Box with Status */}
              <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 border border-purple-700/60 p-5 rounded-2xl text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16"></div>
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-purple-500/20 text-purple-200 rounded-full text-[11px] font-semibold tracking-wide border border-purple-400/30">
                      <Scale className="w-3.5 h-3.5 text-purple-300" />
                      SENIAT • DECRETO N° 1.808 (GACETA OFICIAL N° 36.203)
                    </div>
                    <h3 className="font-extrabold text-base sm:text-lg text-white tracking-tight flex items-center gap-2">
                      <span>Módulo de Configuración Fiscal & Retenciones de I.S.L.R.</span>
                    </h3>
                    <p className="text-xs text-purple-200/90 leading-relaxed max-w-2xl">
                      Defina las alícuotas y el régimen tributario para retener y enterar el Impuesto sobre la Renta en 
                      <strong> {selectedEmpresa.razon_social}</strong> (R.I.F. {selectedEmpresa.rif_empresa}). 
                      La aplicación aplicará automáticamente este descuento en el cálculo de los recibos de pago según la normativa vigente para honorarios, servicios profesionales y financiamientos.
                    </p>
                  </div>

                  <div className="flex flex-col sm:items-end gap-1.5 shrink-0">
                    <span className="text-xs font-bold px-3 py-1 bg-purple-500/30 text-purple-100 rounded-lg border border-purple-400/40">
                      Sujeto Pasivo {selectedEmpresa.tipo_contribuyente}
                    </span>
                    <span className="text-[11px] text-purple-200/80 font-mono">
                      Agente de Retención: <strong>{fiscalConfig.es_agente_retencion ? 'ACTIVO' : 'NO'}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Main Automatic Calculation Switch */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl shrink-0 ${
                    fiscalConfig.aplicar_retencion_automatica ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                      Aplicación Automática de Retención de I.S.L.R. en Recibos de Pago
                    </h4>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      {fiscalConfig.aplicar_retencion_automatica
                        ? 'ACTIVADO: Los recibos de pago descuentan automáticamente el impuesto calculado sobre los intereses devengados según el porcentaje legal vigente.'
                        : 'DESACTIVADO: Los recibos de pago no aplicarán retención de impuesto (tasa 0%).'}
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={fiscalConfig.aplicar_retencion_automatica}
                    onChange={(e) => setFiscalConfig(prev => ({ ...prev, aplicar_retencion_automatica: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              {/* Concept Selector: Honorarios vs Servicios vs Intereses */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                      <Percent className="w-4 h-4 text-purple-600" />
                      <span>Seleccionar Concepto y Alícuota Vigente para Recibos</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Haga clic en el concepto que regula la relación contractual de {selectedEmpresa.razon_social} para aplicarlo en los recibos:
                    </p>
                  </div>
                  <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200">
                    Alícuota Activa: {fiscalConfig.porcentaje_retencion_activo}%
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(Object.keys(CATALOGO_CONCEPTOS_ISLR) as ConceptoRetencionISLR[])
                    .filter(c => ['honorarios_profesionales_pn', 'servicios_profesionales_pj', 'intereses_mutuo_pn', 'intereses_mutuo_pj', 'comisiones_mercantiles_pn', 'personalizado'].includes(c))
                    .map((cKey) => {
                      const item = CATALOGO_CONCEPTOS_ISLR[cKey];
                      const isSelected = fiscalConfig.concepto_activo === cKey;
                      
                      let rateDisplay = item.porcentajeDefecto;
                      if (cKey === 'honorarios_profesionales_pn') rateDisplay = fiscalConfig.porcentaje_honorarios_profesionales_pn;
                      if (cKey === 'servicios_profesionales_pj') rateDisplay = fiscalConfig.porcentaje_servicios_profesionales_pj;
                      if (cKey === 'intereses_mutuo_pn') rateDisplay = fiscalConfig.porcentaje_intereses_mutuo_pn;
                      if (cKey === 'intereses_mutuo_pj') rateDisplay = fiscalConfig.porcentaje_intereses_mutuo_pj;
                      if (cKey === 'comisiones_mercantiles_pn') rateDisplay = fiscalConfig.porcentaje_comisiones_pn;
                      if (cKey === 'personalizado') rateDisplay = fiscalConfig.porcentaje_personalizado;

                      return (
                        <div
                          key={cKey}
                          onClick={() => handleSelectConceptoFiscal(cKey)}
                          className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all relative flex flex-col justify-between ${
                            isSelected
                              ? 'border-purple-600 bg-purple-50/70 shadow-sm ring-2 ring-purple-500/20'
                              : 'border-slate-200 bg-white hover:border-purple-300 hover:bg-slate-50/80 shadow-2xs'
                          }`}
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2 mb-1.5">
                              <span className="font-bold text-xs text-slate-900 leading-snug">
                                {item.titulo}
                              </span>
                              <span className={`shrink-0 font-mono text-xs font-black px-2 py-0.5 rounded-md ${
                                isSelected
                                  ? 'bg-purple-600 text-white shadow-2xs'
                                  : 'bg-purple-100 text-purple-800 border border-purple-200'
                              }`}>
                                {rateDisplay.toFixed(1)}%
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-500 leading-relaxed mb-2">
                              {item.subtitulo}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                            <span className="font-mono text-slate-600 font-semibold truncate max-w-[180px]">
                              {item.articuloLegal}
                            </span>
                            {isSelected ? (
                              <span className="inline-flex items-center gap-1 font-bold text-purple-700">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Activo</span>
                              </span>
                            ) : (
                              <span className="text-slate-400 group-hover:text-purple-600">
                                Seleccionar
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Editable Rates Table and Adjustment */}
              <div className="bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                      <Calculator className="w-4 h-4 text-purple-600" />
                      <span>Ajuste Detallado de Alícuotas por Rubro (Decreto 1808)</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Configure individualmente las tasas que aplicará su departamento de administración tributaria:
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleResetFiscalDefaults}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-purple-700 hover:underline cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Restablecer Valores Oficiales Decreto 1808</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Honorarios Profesionales (PN) %
                    </label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={fiscalConfig.porcentaje_honorarios_profesionales_pn}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setFiscalConfig(prev => ({
                            ...prev,
                            porcentaje_honorarios_profesionales_pn: val,
                            porcentaje_retencion_activo: prev.concepto_activo === 'honorarios_profesionales_pn' ? val : prev.porcentaje_retencion_activo
                          }));
                        }}
                        className="w-full bg-white border border-slate-300 rounded-md px-2 py-1 text-xs text-slate-900 font-mono font-bold focus:ring-1 focus:ring-purple-500"
                      />
                      <span className="text-xs font-bold text-slate-400">%</span>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">Art. 9 Num. 1 lit. a (3%)</span>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Servicios Profesionales (PJ) %
                    </label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={fiscalConfig.porcentaje_servicios_profesionales_pj}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setFiscalConfig(prev => ({
                            ...prev,
                            porcentaje_servicios_profesionales_pj: val,
                            porcentaje_retencion_activo: prev.concepto_activo === 'servicios_profesionales_pj' ? val : prev.porcentaje_retencion_activo
                          }));
                        }}
                        className="w-full bg-white border border-slate-300 rounded-md px-2 py-1 text-xs text-slate-900 font-mono font-bold focus:ring-1 focus:ring-purple-500"
                      />
                      <span className="text-xs font-bold text-slate-400">%</span>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">Art. 9 Num. 1 lit. b (5%)</span>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Intereses Préstamos / Mutuos (PN) %
                    </label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={fiscalConfig.porcentaje_intereses_mutuo_pn}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setFiscalConfig(prev => ({
                            ...prev,
                            porcentaje_intereses_mutuo_pn: val,
                            porcentaje_retencion_activo: prev.concepto_activo === 'intereses_mutuo_pn' ? val : prev.porcentaje_retencion_activo
                          }));
                        }}
                        className="w-full bg-white border border-slate-300 rounded-md px-2 py-1 text-xs text-slate-900 font-mono font-bold focus:ring-1 focus:ring-purple-500"
                      />
                      <span className="text-xs font-bold text-slate-400">%</span>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">Art. 9 Num. 8 (5%)</span>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Alícuota Personalizada %
                    </label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={fiscalConfig.porcentaje_personalizado}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setFiscalConfig(prev => ({
                            ...prev,
                            porcentaje_personalizado: val,
                            porcentaje_retencion_activo: prev.concepto_activo === 'personalizado' ? val : prev.porcentaje_retencion_activo
                          }));
                        }}
                        className="w-full bg-white border border-slate-300 rounded-md px-2 py-1 text-xs text-slate-900 font-mono font-bold focus:ring-1 focus:ring-purple-500"
                      />
                      <span className="text-xs font-bold text-slate-400">%</span>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">Convenio Especial</span>
                  </div>
                </div>
              </div>

              {/* Agente de Retención SENIAT & Parámetros Formales */}
              <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 space-y-4 shadow-2xs">
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <span>Datos Oficiales del Agente de Retención SENIAT y Sustraendo</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Condición de Agente de Retención
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="checkbox"
                        id="es-agente-retencion"
                        checked={fiscalConfig.es_agente_retencion}
                        onChange={(e) => setFiscalConfig(prev => ({ ...prev, es_agente_retencion: e.target.checked }))}
                        className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500 cursor-pointer"
                      />
                      <label htmlFor="es-agente-retencion" className="text-xs font-medium text-slate-800 cursor-pointer">
                        Empresa designada Agente de Retención
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Nro. Providencia o Resolución SENIAT
                    </label>
                    <input
                      type="text"
                      value={fiscalConfig.resolucion_agente_retencion}
                      onChange={(e) => setFiscalConfig(prev => ({ ...prev, resolucion_agente_retencion: e.target.value }))}
                      placeholder="SNAT/2021/000048 - Sujeto Pasivo Especial"
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:ring-1 focus:ring-purple-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Valor Unidad Tributaria Vigente (Bs.)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={fiscalConfig.unidad_tributaria_ves}
                      onChange={(e) => setFiscalConfig(prev => ({ ...prev, unidad_tributaria_ves: parseFloat(e.target.value) || 9.0 }))}
                      placeholder="9.00"
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-mono font-bold focus:ring-1 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Cuenta Contable de Retenciones
                    </label>
                    <input
                      type="text"
                      value={fiscalConfig.cuenta_contable_retencion}
                      onChange={(e) => setFiscalConfig(prev => ({ ...prev, cuenta_contable_retencion: e.target.value }))}
                      placeholder="2.1.03.01.002 - Retenciones de ISLR por Enterar"
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-mono focus:ring-1 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Prefijo Correlativo de Comprobantes
                    </label>
                    <input
                      type="text"
                      value={fiscalConfig.prefijo_comprobante_retencion}
                      onChange={(e) => setFiscalConfig(prev => ({ ...prev, prefijo_comprobante_retencion: e.target.value }))}
                      placeholder="COMP-ISLR-ONI-2026-"
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-mono focus:ring-1 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Sustraendo Legal (Art. 9 Parágrafo Segundo)
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="checkbox"
                        id="aplicar-sustraendo-pn"
                        checked={fiscalConfig.aplicar_sustraendo_pn}
                        onChange={(e) => setFiscalConfig(prev => ({ ...prev, aplicar_sustraendo_pn: e.target.checked }))}
                        className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500 cursor-pointer"
                      />
                      <label htmlFor="aplicar-sustraendo-pn" className="text-xs font-medium text-slate-800 cursor-pointer">
                        Descontar factor de 83.3334 U.T. en PN
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Real-time Calculation Simulation Panel */}
              <div className="bg-gradient-to-br from-slate-900 to-purple-950 p-5 rounded-2xl text-white space-y-4 border border-purple-800/50 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-purple-800/60 pb-3">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-purple-400" />
                    <h4 className="font-bold text-sm text-white">
                      Simulación en Tiempo Real: Liquidación de los 18 Recibos de Pago
                    </h4>
                  </div>
                  <span className="text-[11px] bg-purple-500/20 text-purple-300 border border-purple-400/30 px-2.5 py-0.5 rounded-full font-mono">
                    Régimen: {previewCalculation.conceptoInfo.titulo} ({previewCalculation.porcentajeAplicado.toFixed(1)}%)
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                    <div className="text-[10px] text-purple-300 uppercase font-semibold">Total Intereses Devengados</div>
                    <div className="text-base font-black text-white mt-1">
                      {formatVES(previewCalculation.totalInteresesDevengadosVes)}
                    </div>
                    <div className="text-[10px] text-purple-200/70 font-mono mt-0.5">
                      Base imponible legal
                    </div>
                  </div>

                  <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-xl">
                    <div className="text-[10px] text-red-300 uppercase font-semibold">Retención ISLR a Enterar</div>
                    <div className="text-base font-black text-red-300 mt-1">
                      - {formatVES(previewCalculation.totalRetencionIslrVes)}
                    </div>
                    <div className="text-[10px] text-red-200/70 font-mono mt-0.5">
                      Alícuota {previewCalculation.porcentajeAplicado.toFixed(2)}% ({formatUSD(previewCalculation.totalRetencionIslrUsd)})
                    </div>
                  </div>

                  <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl">
                    <div className="text-[10px] text-emerald-300 uppercase font-semibold">Interés Neto Percibido</div>
                    <div className="text-base font-black text-emerald-300 mt-1">
                      {formatVES(previewCalculation.totalInteresNetoPercibidoVes)}
                    </div>
                    <div className="text-[10px] text-emerald-200/70 font-mono mt-0.5">
                      Ingreso neto disponible
                    </div>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/30 p-3 rounded-xl">
                    <div className="text-[10px] text-blue-300 uppercase font-semibold">Amortización a Capital</div>
                    <div className="text-base font-black text-blue-300 mt-1">
                      {formatVES(previewCalculation.totalAmortizacionCapitalVes)}
                    </div>
                    <div className="text-[10px] text-blue-200/70 font-mono mt-0.5">
                      {formatUSD(previewCalculation.totalAmortizacionCapitalUsd)}
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-[11px] text-purple-200 space-y-1">
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-purple-400" />
                    <span>Cita Jurídica Certificada para los Comprobantes:</span>
                  </div>
                  <p className="leading-relaxed text-purple-200/90 font-mono text-[10px]">
                    "{previewCalculation.conceptoInfo.articuloLegal} del {previewCalculation.conceptoInfo.reglamento}. {previewCalculation.conceptoInfo.descripcion}"
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('directorio')}
                  className="w-full sm:w-auto px-4 py-2 border border-slate-300 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold cursor-pointer text-xs"
                >
                  Volver al Directorio
                </button>

                <button
                  type="button"
                  onClick={handleSaveFiscalConfig}
                  className="w-full sm:w-auto px-6 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 text-xs"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Configuración Fiscal y Aplicar a Recibos</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="text-slate-600">
            Empresa activa en la sesión: <strong className="text-slate-900">{selectedEmpresa.razon_social}</strong>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-2xs"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
