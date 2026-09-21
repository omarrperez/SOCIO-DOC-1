import React, { useState } from 'react';
import { Empresa, Accionista, ContratoMutuo, TipoContribuyente } from '../types';
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
  Info
} from 'lucide-react';

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
}) => {
  const [activeTab, setActiveTab] = useState<'directorio' | 'nueva' | 'editar' | 'socios'>('directorio');
  const [companyToEdit, setCompanyToEdit] = useState<Empresa>(selectedEmpresa);

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
