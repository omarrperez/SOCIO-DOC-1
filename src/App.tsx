/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  INITIAL_EMPRESAS, 
  INITIAL_ACCIONISTAS, 
  INITIAL_ACTAS, 
  INITIAL_CONTRATOS, 
  INITIAL_TRANSACCIONES_BANCARIAS, 
  INITIAL_TASA_BCV 
} from './data/initialData';
import { 
  Empresa, 
  Accionista, 
  ActaAsamblea, 
  ContratoMutuo, 
  TransaccionBancaria, 
  CapitalizacionAcreencia 
} from './types';
import { FirstStepsGuide } from './components/FirstStepsGuide';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { ContractsList } from './components/ContractsList';
import { CorporateAssembly } from './components/CorporateAssembly';
import { BankMatching } from './components/BankMatching';
import { AccountingEntries } from './components/AccountingEntries';
import { IgtfManager } from './components/IgtfManager';
import { BlockchainValidator } from './components/BlockchainValidator';
import { ContractWizard } from './components/ContractWizard';
import { LegalDocumentModal } from './components/LegalDocumentModal';
import { CapitalizationModal } from './components/CapitalizationModal';
import { PricingModal } from './components/PricingModal';
import { TermsModal } from './components/TermsModal';
import { CompanyManagerModal } from './components/CompanyManagerModal';
import { FiscalClosingReportModal } from './components/FiscalClosingReportModal';
import { MonthlyCalculationModal } from './components/MonthlyCalculationModal';
import { RecibosCupoManager } from './components/RecibosCupoManager';
import { RecibosPagosManager } from './components/RecibosPagosManager';
import { CrucePeriodicoManager } from './components/CrucePeriodicoManager';

export default function App() {
  // Main State
  const [empresas, setEmpresas] = useState<Empresa[]>(INITIAL_EMPRESAS);
  const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa>(INITIAL_EMPRESAS[0]);
  const [accionistas, setAccionistas] = useState<Accionista[]>(INITIAL_ACCIONISTAS);
  const [actas, setActas] = useState<ActaAsamblea[]>(INITIAL_ACTAS);
  const [contratos, setContratos] = useState<ContratoMutuo[]>(INITIAL_CONTRATOS);
  const [transacciones, setTransacciones] = useState<TransaccionBancaria[]>(INITIAL_TRANSACCIONES_BANCARIAS);
  const [tasaBCV, setTasaBCV] = useState<number>(INITIAL_TASA_BCV);

  // Navigation tab
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Modals state
  const [isContractWizardOpen, setIsContractWizardOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isCompanyManagerOpen, setIsCompanyManagerOpen] = useState(false);
  const [isFiscalReportOpen, setIsFiscalReportOpen] = useState(false);

  // Legal Document Viewer State
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalDocType, setLegalDocType] = useState<
    'contrato' | 'recibo_caja' | 'acta_macro' | 'acta_capitalizacion' | 'informe_comisario' | 'recibo_intereses' | 'linea_credito'
  >('contrato');
  const [selectedContratoForLegal, setSelectedContratoForLegal] = useState<ContratoMutuo | undefined>(undefined);
  const [selectedActaForLegal, setSelectedActaForLegal] = useState<ActaAsamblea | undefined>(undefined);
  const [capitalizacionDataForLegal, setCapitalizacionDataForLegal] = useState<CapitalizacionAcreencia | undefined>(undefined);

  // Capitalization Modal State
  const [isCapitalizationOpen, setIsCapitalizationOpen] = useState(false);
  const [contratoToCapitalize, setContratoToCapitalize] = useState<ContratoMutuo | undefined>(undefined);

  // Blockchain Validator selected ID
  const [selectedValidatorContratoId, setSelectedValidatorContratoId] = useState<string | undefined>(undefined);

  // Monthly Interest Calculation & Debit Note Modal State
  const [isMonthlyCalcOpen, setIsMonthlyCalcOpen] = useState(false);
  const [selectedContratoForMonthlyCalc, setSelectedContratoForMonthlyCalc] = useState<ContratoMutuo | undefined>(undefined);

  // Handlers
  const handleOpenMonthlyCalc = (contrato: ContratoMutuo) => {
    setSelectedContratoForMonthlyCalc(contrato);
    setIsMonthlyCalcOpen(true);
  };

  const handleSaveContract = (nuevoContrato: ContratoMutuo) => {
    setContratos(prev => [nuevoContrato, ...prev]);
  };

  const handleSaveNewActa = (nuevaActa: ActaAsamblea) => {
    setActas(prev => [nuevaActa, ...prev]);
  };

  const handleToggleLibroFisico = (actaId: string) => {
    setActas(prev => prev.map(a => {
      if (a.id === actaId) {
        const nextStatus = !a.estatus_libro_fisico;
        return {
          ...a,
          estatus_libro_fisico: nextStatus,
          fecha_asentamiento_libro: nextStatus ? new Date().toISOString().split('T')[0] : undefined,
        };
      }
      return a;
    }));
  };

  const handleImportTransactions = (newTx: TransaccionBancaria[]) => {
    setTransacciones(prev => [...newTx, ...prev]);
  };

  const handleMatchTransaction = (txId: string, contratoId: string) => {
    setTransacciones(prev => prev.map(t => {
      if (t.id === txId) {
        return {
          ...t,
          estado_conciliacion: 'conciliado',
          contrato_vinculado_id: contratoId,
        };
      }
      return t;
    }));
  };

  const handleCrearContratoDesdeBanco = (tx: TransaccionBancaria) => {
    setIsContractWizardOpen(true);
  };

  const handleOpenLegalForContrato = (contrato: ContratoMutuo) => {
    setSelectedContratoForLegal(contrato);
    setSelectedActaForLegal(undefined);
    setCapitalizacionDataForLegal(undefined);
    setLegalDocType(contrato.tipo_activo === 'USD_EFECTIVO' ? 'recibo_caja' : 'contrato');
    setLegalModalOpen(true);
  };

  const handleOpenLegalForActa = (acta: ActaAsamblea) => {
    setSelectedActaForLegal(acta);
    setSelectedContratoForLegal(undefined);
    setCapitalizacionDataForLegal(undefined);
    setLegalDocType('acta_macro');
    setLegalModalOpen(true);
  };

  const handleOpenLineaCredito = (contrato?: ContratoMutuo) => {
    const targetContrato = contrato
      || contratos.find(c => c.empresa_id === selectedEmpresa.id && c.modalidad_contrato === 'linea_credito_rotativa')
      || contratos.find(c => c.empresa_id === selectedEmpresa.id && c.tipo_flujo === 'empresa_a_socio')
      || contratos.find(c => c.empresa_id === selectedEmpresa.id)
      || contratos[0];

    setSelectedContratoForLegal(targetContrato);
    setSelectedActaForLegal(undefined);
    setCapitalizacionDataForLegal(undefined);
    setLegalDocType('linea_credito');
    setLegalModalOpen(true);
  };

  const handleOpenCapitalization = (contrato?: ContratoMutuo) => {
    const candidate = contrato || contratos.find(c => c.empresa_id === selectedEmpresa.id && c.tipo_flujo === 'socio_a_empresa' && c.estado === 'activo');
    if (candidate) {
      setContratoToCapitalize(candidate);
      setIsCapitalizationOpen(true);
    } else {
      alert('No se encontraron contratos de cuentas por pagar con socios activos para capitalizar en esta empresa.');
    }
  };

  const handleExecuteCapitalization = (data: CapitalizacionAcreencia, contratoId: string) => {
    // 1. Mark contract as capitalized
    setContratos(prev => prev.map(c => {
      if (c.id === contratoId) {
        return { ...c, estado: 'capitalizado' };
      }
      return c;
    }));

    // 2. Increase company's registered capital
    setEmpresas(prev => prev.map(emp => {
      if (emp.id === selectedEmpresa.id) {
        const updated = {
          ...emp,
          capital_social_ves: data.capital_nuevo_ves,
        };
        setSelectedEmpresa(updated);
        return updated;
      }
      return emp;
    }));

    // 3. Open Legal document with the generated assembly minute
    const cand = contratos.find(c => c.id === contratoId);
    setSelectedContratoForLegal(cand);
    setCapitalizacionDataForLegal(data);
    setLegalDocType('acta_capitalizacion');
    setLegalModalOpen(true);
  };

  const handleOpenValidator = (contratoId: string) => {
    setSelectedValidatorContratoId(contratoId);
    setActiveTab('validador');
  };

  const handleOpenAccounting = (contrato: ContratoMutuo) => {
    setActiveTab('asientos');
  };

  const handleSaveEmpresa = (empresa: Empresa) => {
    setEmpresas(prev => {
      const exists = prev.some(e => e.id === empresa.id);
      if (exists) {
        return prev.map(e => e.id === empresa.id ? empresa : e);
      }
      return [...prev, empresa];
    });
    if (selectedEmpresa.id === empresa.id) {
      setSelectedEmpresa(empresa);
    }
  };

  const handleDeleteEmpresa = (empresaId: string) => {
    if (empresas.length <= 1) {
      return;
    }
    const remaining = empresas.filter(e => e.id !== empresaId);
    setEmpresas(remaining);
    if (selectedEmpresa.id === empresaId) {
      setSelectedEmpresa(remaining[0]);
    }
  };

  const handleSaveAccionista = (accionista: Accionista) => {
    setAccionistas(prev => {
      const exists = prev.some(a => a.id === accionista.id);
      if (exists) {
        return prev.map(a => a.id === accionista.id ? accionista : a);
      }
      return [...prev, accionista];
    });
  };

  const handleDeleteAccionista = (accionistaId: string) => {
    setAccionistas(prev => prev.filter(a => a.id !== accionistaId));
  };

  // Find partner for modal
  const modalAccionista = accionistas.find(a => a.id === selectedContratoForLegal?.accionista_id);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      
      {/* Navigation Header */}
      <Navbar
        empresas={empresas}
        selectedEmpresa={selectedEmpresa}
        onSelectEmpresa={setSelectedEmpresa}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        tasaBCV={tasaBCV}
        onUpdateTasaBCV={setTasaBCV}
        onOpenPricing={() => setIsPricingOpen(true)}
        onOpenTerms={() => setIsTermsOpen(true)}
        onOpenCompanyManager={() => setIsCompanyManagerOpen(true)}
        onOpenFiscalReport={() => setIsFiscalReportOpen(true)}
        onOpenLineaCredito={() => handleOpenLineaCredito()}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        
        {isGuideOpen && <FirstStepsGuide onClose={() => setIsGuideOpen(false)} />}
        
        {activeTab === 'dashboard' && (
          <Dashboard
            empresa={selectedEmpresa}
            accionistas={accionistas}
            actas={actas}
            contratos={contratos}
            transacciones={transacciones}
            tasaBCV={tasaBCV}
            onOpenContractWizard={() => setIsContractWizardOpen(true)}
            onOpenActaWizard={() => setActiveTab('asamblea')}
            onOpenViewDocument={handleOpenLegalForContrato}
            onOpenCapitalization={handleOpenCapitalization}
            onNavigateTab={setActiveTab}
            onOpenCompanyManager={() => setIsCompanyManagerOpen(true)}
            onOpenFiscalReport={() => setIsFiscalReportOpen(true)}
            onOpenLineaCredito={() => handleOpenLineaCredito()}
          />
        )}

        {activeTab === 'contratos' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Contratos de Mutuo & Instrumentos Financieros
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Expediente legal de cuentas por pagar y cobrar socios para {selectedEmpresa.razon_social}
                </p>
              </div>
            </div>

            <ContractsList
              contratos={contratos}
              empresa={selectedEmpresa}
              accionistas={accionistas}
              tasaBCV={tasaBCV}
              onOpenContractWizard={() => setIsContractWizardOpen(true)}
              onOpenViewDocument={handleOpenLegalForContrato}
              onOpenAccountingEntry={handleOpenAccounting}
              onOpenCapitalization={handleOpenCapitalization}
              onOpenValidator={handleOpenValidator}
              onOpenFiscalReport={() => setIsFiscalReportOpen(true)}
              onOpenMonthlyCalc={handleOpenMonthlyCalc}
              onOpenLineaCredito={() => handleOpenLineaCredito()}
            />
          </div>
        )}

        {activeTab === 'asamblea' && (
          <CorporateAssembly
            actas={actas}
            empresa={selectedEmpresa}
            accionistas={accionistas}
            onOpenViewDocument={handleOpenLegalForActa}
            onSaveNewActa={handleSaveNewActa}
            onToggleLibroFisico={handleToggleLibroFisico}
          />
        )}

        {activeTab === 'matching' && (
          <BankMatching
            transacciones={transacciones}
            contratos={contratos}
            empresa={selectedEmpresa}
            accionistas={accionistas}
            tasaBCV={tasaBCV}
            onMatchTransaction={handleMatchTransaction}
            onCrearContratoDesdeBanco={handleCrearContratoDesdeBanco}
            onImportTransactions={handleImportTransactions}
            onOpenLineaCredito={handleOpenLineaCredito}
            onNavigateToRecibosCupo={() => setActiveTab('recibos_cupo')}
          />
        )}

        {activeTab === 'recibos_cupo' && (
          <RecibosCupoManager
            empresa={selectedEmpresa}
            accionistas={accionistas}
            contratos={contratos}
            tasaBCV={tasaBCV}
            onOpenLineaCredito={handleOpenLineaCredito}
            onNavigateToRecibosPagos={() => setActiveTab('recibos_pagos')}
            onNavigateToCrucePeriodico={() => setActiveTab('cruce_periodico')}
          />
        )}

        {activeTab === 'recibos_pagos' && (
          <RecibosPagosManager
            empresa={selectedEmpresa}
            accionistas={accionistas}
            contratos={contratos}
            tasaBCV={tasaBCV}
            onOpenLineaCredito={handleOpenLineaCredito}
            onNavigateToRecibosCupo={() => setActiveTab('recibos_cupo')}
            onNavigateToCrucePeriodico={() => setActiveTab('cruce_periodico')}
          />
        )}

        {activeTab === 'cruce_periodico' && (
          <CrucePeriodicoManager
            empresa={selectedEmpresa}
            accionistas={accionistas}
            contratos={contratos}
            tasaBCV={tasaBCV}
            onOpenLineaCredito={handleOpenLineaCredito}
            onNavigateToRecibosCupo={() => setActiveTab('recibos_cupo')}
            onNavigateToRecibosPagos={() => setActiveTab('recibos_pagos')}
          />
        )}

        {activeTab === 'asientos' && (
          <AccountingEntries
            contratos={contratos}
            empresa={selectedEmpresa}
            accionistas={accionistas}
            tasaBCV={tasaBCV}
          />
        )}

        {activeTab === 'igtf' && (
          <IgtfManager
            contratos={contratos}
            empresa={selectedEmpresa}
            accionistas={accionistas}
            tasaBCV={tasaBCV}
          />
        )}

        {activeTab === 'validador' && (
          <BlockchainValidator
            contratos={contratos}
            empresa={selectedEmpresa}
            accionistas={accionistas}
            initialContratoId={selectedValidatorContratoId}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 text-xs text-slate-500 py-5 mt-10 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 tracking-wider uppercase">SOCIO-DOC</span>
            <span className="text-slate-300">•</span>
            <span>Blindaje Jurídico y Tributario de Cuentas de Socios en Venezuela</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-slate-500">Normativa: LISLR Art. 72 • Ley IGTF • VEN-NIF PYME</span>
            <button
              onClick={() => setIsTermsOpen(true)}
              className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-medium"
            >
              Exención de Responsabilidad Legal
            </button>
          </div>
        </div>
      </footer>

      {/* Modal: Contract Creation Wizard */}
      <ContractWizard
        isOpen={isContractWizardOpen}
        onClose={() => setIsContractWizardOpen(false)}
        empresas={empresas}
        selectedEmpresa={selectedEmpresa}
        accionistas={accionistas}
        actas={actas}
        tasaBCV={tasaBCV}
        onSaveContract={handleSaveContract}
        onOpenCreateActa={() => {
          setIsContractWizardOpen(false);
          setActiveTab('asamblea');
        }}
      />

      {/* Modal: Legal Document Viewer & Printer */}
      <LegalDocumentModal
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        documentType={legalDocType}
        contrato={selectedContratoForLegal}
        empresa={selectedEmpresa}
        accionista={modalAccionista}
        accionistas={accionistas}
        actaMacro={selectedActaForLegal}
        capitalizacionData={capitalizacionDataForLegal}
        tasaBCV={tasaBCV}
        onOpenMonthlyCalc={handleOpenMonthlyCalc}
      />

      {/* Modal: Capitalization of Debt to Capital Social */}
      <CapitalizationModal
        isOpen={isCapitalizationOpen}
        onClose={() => setIsCapitalizationOpen(false)}
        contrato={contratoToCapitalize}
        empresa={selectedEmpresa}
        accionistas={accionistas}
        tasaBCV={tasaBCV}
        onExecuteCapitalization={handleExecuteCapitalization}
      />

      {/* Modal: SaaS Pricing Plans */}
      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
      />

      {/* Modal: Legal Disclaimer & Terms */}
      <TermsModal
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
      />

      {/* Modal: Multi-Empresas Management */}
      <CompanyManagerModal
        isOpen={isCompanyManagerOpen}
        onClose={() => setIsCompanyManagerOpen(false)}
        empresas={empresas}
        selectedEmpresa={selectedEmpresa}
        onSelectEmpresa={(emp) => {
          setSelectedEmpresa(emp);
        }}
        onSaveEmpresa={handleSaveEmpresa}
        onUpdateEmpresa={handleSaveEmpresa}
        accionistas={accionistas}
        onSaveAccionista={handleSaveAccionista}
        onDeleteAccionista={handleDeleteAccionista}
        contratos={contratos}
      />

      {/* Modal: Fiscal Closing Consolidated CSV Report for SENIAT */}
      <FiscalClosingReportModal
        isOpen={isFiscalReportOpen}
        onClose={() => setIsFiscalReportOpen(false)}
        empresa={selectedEmpresa}
        contratos={contratos}
        accionistas={accionistas}
        tasaBCV={tasaBCV}
      />

      {/* Modal: Memoria de Cálculo Mensual de Intereses & Nota de Débito Fiscal */}
      <MonthlyCalculationModal
        isOpen={isMonthlyCalcOpen}
        onClose={() => setIsMonthlyCalcOpen(false)}
        contrato={selectedContratoForMonthlyCalc}
        empresa={selectedEmpresa}
        accionista={
          selectedContratoForMonthlyCalc
            ? accionistas.find(a => a.id === selectedContratoForMonthlyCalc.accionista_id)
            : undefined
        }
        tasaBCV={tasaBCV}
      />

    </div>
  );
}
