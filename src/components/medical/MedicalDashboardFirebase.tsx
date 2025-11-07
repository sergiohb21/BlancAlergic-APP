import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import {
  getAllergies,
  getMedications
} from '../../firebase/firestore';
import { AllergyRecord, MedicationRecord } from '../../firebase/types';

const MedicalDashboardFirebase: React.FC = () => {
  const { user, medicalProfile, syncStatus, refreshMedicalProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [allergies, setAllergies] = useState<AllergyRecord[]>([]);
  const [medications, setMedications] = useState<MedicationRecord[]>([]);

  const loadMedicalData = useCallback(async () => {
    if (!user) return;

    try {
      const [allergiesData, medicationsData] = await Promise.all([
        getAllergies(user.uid),
        getMedications(user.uid)
      ]);

      setAllergies(allergiesData);
      setMedications(medicationsData);
    } catch (error) {
      console.error('Error cargando datos médicos:', error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadMedicalData();
    }
  }, [user, loadMedicalData]);

  const handleRefresh = async () => {
    await refreshMedicalProfile();
    await loadMedicalData();
  };

  if (!user || !medicalProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información médica...</p>
        </div>
      </div>
    );
  }

  const severeAllergies = allergies.filter(a => a.intensity === 'Alta' && a.isAlergic);
  const activeMedications = medications.filter(m => m.active);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Mi Historial Médico
              </h1>
              <p className="text-gray-600 mt-1">
                Bienvenido, {medicalProfile.displayName}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Sync Status */}
              <div className="flex items-center gap-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${syncStatus.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                <span className="text-gray-600">
                  {syncStatus.isOnline ? 'Conectado' : 'Modo offline'}
                </span>
              </div>

              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Actualizar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Alertas Críticas */}
      {severeAllergies.length > 0 && (
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-red-800 font-medium">
                  Alergias Severas Detectadas
                </h3>
                <p className="text-red-600 text-sm">
                  Tienes {severeAllergies.length} alergia(s) de alta intensidad. Mantén tu medicación de emergencia accesible.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Resumen', icon: '📊' },
                { id: 'allergies', label: 'Alergias', icon: '⚠️' },
                { id: 'medications', label: 'Medicamentos', icon: '💊' },
                { id: 'visits', label: 'Visitas Médicas', icon: '🏥' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Stats Cards */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Alergias</p>
                    <p className="text-2xl font-bold text-gray-900">{allergies.length}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {severeAllergies.length} severas
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">⚠️</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Medicamentos Activos</p>
                    <p className="text-2xl font-bold text-gray-900">{activeMedications.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">💊</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Grupo Sanguíneo</p>
                    <p className="text-lg font-bold text-gray-900">
                      {medicalProfile.bloodType || 'No especificado'}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🩸</span>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm lg:col-span-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Contacto de Emergencia</h3>
                {medicalProfile.emergencyContact.name ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Nombre</p>
                      <p className="font-medium">{medicalProfile.emergencyContact.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Teléfono</p>
                      <p className="font-medium">{medicalProfile.emergencyContact.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Relación</p>
                      <p className="font-medium">{medicalProfile.emergencyContact.relationship}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500 mb-4">No has configurado un contacto de emergencia</p>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      Configurar Contacto
                    </button>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm lg:col-span-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Acciones Rápidas</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <span className="text-2xl mb-2 block">➕</span>
                    <span className="text-sm font-medium">Añadir Alergia</span>
                  </button>
                  <button
                    className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <span className="text-2xl mb-2 block">💊</span>
                    <span className="text-sm font-medium">Añadir Medicamento</span>
                  </button>
                  <button
                    className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <span className="text-2xl mb-2 block">🏥</span>
                    <span className="text-sm font-medium">Registrar Visita</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'allergies' && (
            <AllergiesTab
              allergies={allergies}
              onRefresh={loadMedicalData}
            />
          )}

          {activeTab === 'medications' && (
            <MedicationsTab
              medications={medications}
              onRefresh={loadMedicalData}
            />
          )}

          {activeTab === 'visits' && (
            <VisitsTab />
          )}
        </div>
      </div>
    </div>
  );
};

// Componentes auxiliares para las pestañas
const AllergiesTab: React.FC<{
  allergies: AllergyRecord[];
  onRefresh: () => Promise<void>;
}> = ({ allergies, onRefresh }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Mis Alergias</h2>
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Actualizar
        </button>
      </div>

      {allergies.length > 0 ? (
        <div className="space-y-4">
          {allergies.map((allergy) => (
            <div key={allergy.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">{allergy.name}</h3>
                  <p className="text-sm text-gray-600">{allergy.category}</p>
                  {allergy.symptoms.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-gray-700">Síntomas:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {allergy.symptoms.map((symptom, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                          >
                            {symptom}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  allergy.intensity === 'Alta' ? 'bg-red-100 text-red-800' :
                  allergy.intensity === 'Media' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {allergy.intensity}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No tienes alergias registradas</p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Añadir Primera Alergia
          </button>
        </div>
      )}
    </div>
  );
};

const MedicationsTab: React.FC<{
  medications: MedicationRecord[];
  onRefresh: () => Promise<void>;
}> = ({ medications, onRefresh }) => {
  const activeMedications = medications.filter(m => m.active);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Mis Medicamentos</h2>
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Actualizar
        </button>
      </div>

      {activeMedications.length > 0 ? (
        <div className="space-y-4">
          {activeMedications.map((medication) => (
            <div key={medication.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">{medication.name}</h3>
                  <p className="text-sm text-gray-600">{medication.dosage} - {medication.frequency}</p>
                  <p className="text-sm text-gray-600 mt-1">Prescrito por: {medication.prescribedBy}</p>
                  <p className="text-sm text-gray-600">Motivo: {medication.reason}</p>
                </div>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Activo
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No tienes medicamentos activos registrados</p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Añadir Medicamento
          </button>
        </div>
      )}
    </div>
  );
};

const VisitsTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Visitas Médicas</h2>
      <div className="text-center py-12">
        <p className="text-gray-500">Componente de visitas médicas en desarrollo</p>
      </div>
    </div>
  );
};

export default MedicalDashboardFirebase;