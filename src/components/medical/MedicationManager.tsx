import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MedicationRecord } from '../../firebase/types';
import { logger } from '@/utils/logger';

interface MedicationFormData {
  name: string;
  dosage: string;
  frequency: string;
  route: 'oral' | 'intravenosa' | 'intramuscular' | 'tópica' | 'inhalada';
  startDate: string;
  endDate: string;
  prescribedBy: string;
  reason: string;
  active: boolean;
  sideEffects: string;
  notes: string;
  reminderTimes: string;
}

export const MedicationManager: React.FC = () => {
  const navigate = useNavigate();

  const [medications, setMedications] = useState<MedicationRecord[]>([]);
  const [isAddingMedication, setIsAddingMedication] = useState(false);
  const [editingMedication, setEditingMedication] = useState<MedicationRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [loading] = useState(false);

  const [formData, setFormData] = useState<MedicationFormData>({
    name: '',
    dosage: '',
    frequency: '',
    route: 'oral',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    prescribedBy: '',
    reason: '',
    active: true,
    sideEffects: '',
    notes: '',
    reminderTimes: ''
  });

  const routes = [
    { value: 'oral', label: 'Oral' },
    { value: 'intravenosa', label: 'Intravenosa' },
    { value: 'intramuscular', label: 'Intramuscular' },
    { value: 'tópica', label: 'Tópica' },
    { value: 'inhalada', label: 'Inhalada' }
  ];

  const frequencies = [
    'Una vez al día',
    'Dos veces al día',
    'Tres veces al día',
    'Cuatro veces al día',
    'Cada 8 horas',
    'Cada 12 horas',
    'Cada 24 horas',
    'Según necesidad',
    'Otro'
  ];

  const statusFilters = [
    { value: 'todos', label: 'Todos los medicamentos' },
    { value: 'activos', label: 'Medicamentos activos' },
    { value: 'inactivos', label: 'Medicamentos inactivos' }
  ];

  const resetForm = () => {
    setFormData({
      name: '',
      dosage: '',
      frequency: '',
      route: 'oral',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      prescribedBy: '',
      reason: '',
      active: true,
      sideEffects: '',
      notes: '',
      reminderTimes: ''
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddMedication = () => {
    setEditingMedication(null);
    resetForm();
    setIsAddingMedication(true);
  };

  const handleEditMedication = (medication: MedicationRecord) => {
    setEditingMedication(medication);
    setFormData({
      name: medication.name,
      dosage: medication.dosage,
      frequency: medication.frequency,
      route: medication.route,
      startDate: medication.startDate,
      endDate: medication.endDate || '',
      prescribedBy: medication.prescribedBy,
      reason: medication.reason,
      active: medication.active,
      sideEffects: medication.sideEffects.join(', '),
      notes: medication.notes,
      reminderTimes: medication.reminderTimes.join(', ')
    });
    setIsAddingMedication(true);
  };

  const handleSaveMedication = () => {
    // TODO: Implement Firebase save functionality
    logger.debug('Saving medication');

    const newMedication: MedicationRecord = {
      id: editingMedication?.id || Date.now().toString(),
      ...formData,
      sideEffects: formData.sideEffects.split(',').map(s => s.trim()).filter(s => s),
      reminderTimes: formData.reminderTimes.split(',').map(s => s.trim()).filter(s => s)
    };

    if (editingMedication) {
      setMedications(prev => prev.map(med =>
        med.id === editingMedication.id ? newMedication : med
      ));
    } else {
      setMedications(prev => [...prev, newMedication]);
    }

    setIsAddingMedication(false);
    resetForm();
  };

  const handleDeleteMedication = (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este medicamento?')) {
      setMedications(prev => prev.filter(med => med.id !== id));
    }
  };

  const handleToggleActive = (id: string) => {
    setMedications(prev => prev.map(med =>
      med.id === id ? { ...med, active: !med.active } : med
    ));
  };

  const filteredMedications = medications.filter(medication => {
    const matchesSearch = medication.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         medication.reason.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'todos' ||
                         (filterStatus === 'activos' && medication.active) ||
                         (filterStatus === 'inactivos' && !medication.active);

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (active: boolean) => {
    return active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (active: boolean) => {
    return active ? 'Activo' : 'Inactivo';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/historial-medico')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Volver al menú médico"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gestión de Medicamentos</h2>
            <p className="text-gray-600">Controla tus medicamentos y tratamientos</p>
          </div>
        </div>
        <button
          onClick={handleAddMedication}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
        >
          <span>➕</span>
          <span>Añadir Medicamento</span>
        </button>
      </div>


      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              🔍 Buscar medicamento
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nombre o razón del medicamento"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              📊 Estado
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {statusFilters.map(filter => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              Total: {filteredMedications.length} medicamentos<br/>
              Activos: {filteredMedications.filter(m => m.active).length}
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Form */}
      {isAddingMedication && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingMedication ? 'Editar Medicamento' : 'Añadir Nuevo Medicamento'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Medicamento *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: Ibuprofeno"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dosis *
              </label>
              <input
                type="text"
                name="dosage"
                value={formData.dosage}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: 400mg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Frecuencia *
              </label>
              <select
                name="frequency"
                value={formData.frequency}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Seleccionar frecuencia</option>
                {frequencies.map(freq => (
                  <option key={freq} value={freq}>{freq}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vía de Administración *
              </label>
              <select
                name="route"
                value={formData.route}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                {routes.map(route => (
                  <option key={route.value} value={route.value}>{route.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Inicio *
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Fin
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                min={formData.startDate}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prescrito por *
              </label>
              <input
                type="text"
                name="prescribedBy"
                value={formData.prescribedBy}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nombre del médico"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Razón del tratamiento *
              </label>
              <input
                type="text"
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: Dolor de cabeza"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Efectos Secundarios
              </label>
              <input
                type="text"
                name="sideEffects"
                value={formData.sideEffects}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Separados por comas (ej: náuseas, mareos)"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Horarios de Recordatorio
              </label>
              <input
                type="text"
                name="reminderTimes"
                value={formData.reminderTimes}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Separados por comas (ej: 08:00, 20:00)"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Instrucciones adicionales, precauciones, etc."
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="active"
                  checked={formData.active}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Medicamento activo actualmente</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => {
                setIsAddingMedication(false);
                resetForm();
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveMedication}
              disabled={!formData.name || !formData.dosage || !formData.frequency || !formData.prescribedBy || !formData.reason}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {editingMedication ? 'Actualizar Medicamento' : 'Añadir Medicamento'}
            </button>
          </div>
        </div>
      )}

      {/* Medications List */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        {filteredMedications.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-4xl mb-4">💊</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay medicamentos registrados</h3>
            <p className="text-gray-600 mb-4">Comienza añadiendo tu primer medicamento</p>
            <button
              onClick={handleAddMedication}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Añadir Medicamento
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Medicamento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dosis y Frecuencia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vía
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMedications.map((medication) => (
                  <tr key={medication.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{medication.name}</div>
                        <div className="text-sm text-gray-500">{medication.reason}</div>
                        <div className="text-xs text-gray-400">
                          Inicio: {new Date(medication.startDate).toLocaleDateString()}
                          {medication.endDate && ` • Fin: ${new Date(medication.endDate).toLocaleDateString()}`}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{medication.dosage}</div>
                      <div className="text-sm text-gray-500">{medication.frequency}</div>
                      <div className="text-xs text-gray-400">Dr/a. {medication.prescribedBy}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900 capitalize">{medication.route}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(medication.active)}`}>
                        {getStatusText(medication.active)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleToggleActive(medication.id)}
                          className="text-blue-600 hover:text-blue-900 text-sm"
                          title={medication.active ? 'Desactivar' : 'Activar'}
                        >
                          {medication.active ? '⏸️' : '▶️'}
                        </button>
                        <button
                          onClick={() => handleEditMedication(medication)}
                          className="text-blue-600 hover:text-blue-900 text-sm"
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteMedication(medication.id)}
                          className="text-red-600 hover:text-red-900 text-sm"
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};