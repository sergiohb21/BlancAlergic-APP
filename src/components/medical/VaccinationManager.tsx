import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { VaccinationRecord } from '../../firebase/types';
import { logger } from '@/utils/logger';

interface VaccinationFormData {
  vaccineName: string;
  vaccineType: string;
  administrationDate: string;
  nextDoseDate: string;
  administeredBy: string;
  batchNumber: string;
  adverseReactions: string;
  notes: string;
}

export const VaccinationManager: React.FC = () => {
  const navigate = useNavigate();

  const [vaccinations, setVaccinations] = useState<VaccinationRecord[]>([]);
  const [isAddingVaccination, setIsAddingVaccination] = useState(false);
  const [editingVaccination, setEditingVaccination] = useState<VaccinationRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [loading] = useState(false);

  const [formData, setFormData] = useState<VaccinationFormData>({
    vaccineName: '',
    vaccineType: '',
    administrationDate: new Date().toISOString().split('T')[0],
    nextDoseDate: '',
    administeredBy: '',
    batchNumber: '',
    adverseReactions: '',
    notes: ''
  });

  const vaccineTypes = [
    'COVID-19',
    'Influenza (Gripe)',
    'Hepatitis A',
    'Hepatitis B',
    'Tétanos',
    'Difteria',
    'Tos Ferina (DTP)',
    'Poliomielitis',
    'Sarampión',
    'Rubéola',
    'Parotiditis (Paperas)',
    'Varicela',
    'Neumococo',
    'Meningococo',
    'Rotavirus',
    'VPH',
    'Herpes Zóster',
    'Fiebre Amarilla',
    'Otra'
  ];

  const statusFilters = [
    { value: 'todos', label: 'Todas las vacunas' },
    { value: 'pendientes', label: 'Próximas dosis pendientes' },
    { value: 'completadas', label: 'Esquema completo' }
  ];

  const resetForm = () => {
    setFormData({
      vaccineName: '',
      vaccineType: '',
      administrationDate: new Date().toISOString().split('T')[0],
      nextDoseDate: '',
      administeredBy: '',
      batchNumber: '',
      adverseReactions: '',
      notes: ''
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddVaccination = () => {
    setEditingVaccination(null);
    resetForm();
    setIsAddingVaccination(true);
  };

  const handleEditVaccination = (vaccination: VaccinationRecord) => {
    setEditingVaccination(vaccination);
    setFormData({
      vaccineName: vaccination.vaccineName,
      vaccineType: vaccination.vaccineType,
      administrationDate: vaccination.administrationDate,
      nextDoseDate: vaccination.nextDoseDate || '',
      administeredBy: vaccination.administeredBy,
      batchNumber: vaccination.batchNumber,
      adverseReactions: vaccination.adverseReactions.join(', '),
      notes: vaccination.notes
    });
    setIsAddingVaccination(true);
  };

  const handleSaveVaccination = () => {
    // TODO: Implement Firebase save functionality
    logger.debug('Saving vaccination');

    const newVaccination: VaccinationRecord = {
      id: editingVaccination?.id || Date.now().toString(),
      ...formData,
      adverseReactions: formData.adverseReactions.split(',').map(r => r.trim()).filter(r => r)
    };

    if (editingVaccination) {
      setVaccinations(prev => prev.map(vac =>
        vac.id === editingVaccination.id ? newVaccination : vac
      ));
    } else {
      setVaccinations(prev => [...prev, newVaccination]);
    }

    setIsAddingVaccination(false);
    resetForm();
  };

  const handleDeleteVaccination = (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este registro de vacunación?')) {
      setVaccinations(prev => prev.filter(vac => vac.id !== id));
    }
  };

  const filteredVaccinations = vaccinations.filter(vaccination => {
    const matchesSearch = vaccination.vaccineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vaccination.vaccineType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vaccination.administeredBy.toLowerCase().includes(searchTerm.toLowerCase());

    const today = new Date();
    const hasNextDose = vaccination.nextDoseDate && new Date(vaccination.nextDoseDate) >= today;

    const matchesStatus = filterStatus === 'todos' ||
                         (filterStatus === 'pendientes' && hasNextDose) ||
                         (filterStatus === 'completadas' && !hasNextDose);

    return matchesSearch && matchesStatus;
  });

  const getNextDoseStatus = (nextDoseDate?: string) => {
    if (!nextDoseDate) {
      return { text: 'Completado', color: 'bg-green-100 text-green-800' };
    }

    const today = new Date();
    const nextDose = new Date(nextDoseDate);
    const diffDays = Math.ceil((nextDose.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: 'Atrasada', color: 'bg-red-100 text-red-800' };
    } else if (diffDays <= 30) {
      return { text: `Próxima (${diffDays} días)`, color: 'bg-yellow-100 text-yellow-800' };
    } else {
      return { text: `Programada (${diffDays} días)`, color: 'bg-blue-100 text-blue-800' };
    }
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
            <h2 className="text-2xl font-bold text-gray-900">Historial de Vacunación</h2>
            <p className="text-gray-600">Gestiona tu historial de vacunas y próximas dosis</p>
          </div>
        </div>
        <button
          onClick={handleAddVaccination}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
        >
          <span>💉</span>
          <span>Añadir Vacuna</span>
        </button>
      </div>


      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              🔍 Buscar vacuna
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nombre de vacuna, tipo o médico"
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
              Total: {filteredVaccinations.length} vacunas<br/>
              Próximas dosis: {filteredVaccinations.filter(v => v.nextDoseDate && new Date(v.nextDoseDate) >= new Date()).length}
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Form */}
      {isAddingVaccination && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingVaccination ? 'Editar Registro de Vacunación' : 'Añadir Nuevo Registro'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de la Vacuna *
              </label>
              <input
                type="text"
                name="vaccineName"
                value={formData.vaccineName}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: Pfizer-BioNTech COVID-19"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Vacuna *
              </label>
              <select
                name="vaccineType"
                value={formData.vaccineType}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Seleccionar tipo de vacuna</option>
                {vaccineTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Administración *
              </label>
              <input
                type="date"
                name="administrationDate"
                value={formData.administrationDate}
                onChange={handleInputChange}
                max={new Date().toISOString().split('T')[0]}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Próxima Dosis (opcional)
              </label>
              <input
                type="date"
                name="nextDoseDate"
                value={formData.nextDoseDate}
                onChange={handleInputChange}
                min={formData.administrationDate}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Administrado por *
              </label>
              <input
                type="text"
                name="administeredBy"
                value={formData.administeredBy}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nombre del profesional"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de Lote *
              </label>
              <input
                type="text"
                name="batchNumber"
                value={formData.batchNumber}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: ABC12345"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reacciones Adversas
              </label>
              <input
                type="text"
                name="adverseReactions"
                value={formData.adverseReactions}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Separadas por comas (ej: fiebre, dolor en el sitio)"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas Adicionales
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Información adicional sobre la vacunación"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => {
                setIsAddingVaccination(false);
                resetForm();
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveVaccination}
              disabled={!formData.vaccineName || !formData.vaccineType || !formData.administrationDate || !formData.administeredBy || !formData.batchNumber}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {editingVaccination ? 'Actualizar Registro' : 'Guardar Registro'}
            </button>
          </div>
        </div>
      )}

      {/* Vaccinations List */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        {filteredVaccinations.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-4xl mb-4">💉</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay registros de vacunación</h3>
            <p className="text-gray-600 mb-4">Comienza añadiendo tu primer registro de vacunación</p>
            <button
              onClick={handleAddVaccination}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Añadir Vacuna
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vacuna
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha de Administración
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Próxima Dosis
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Administrado por
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lote
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredVaccinations.map((vaccination) => {
                  const nextDoseStatus = getNextDoseStatus(vaccination.nextDoseDate);
                  return (
                    <tr key={vaccination.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{vaccination.vaccineName}</div>
                          <div className="text-sm text-gray-500">{vaccination.vaccineType}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {new Date(vaccination.administrationDate).toLocaleDateString()}
                        </div>
                        {vaccination.adverseReactions.length > 0 && (
                          <div className="text-xs text-red-600">
                            {vaccination.adverseReactions.length} reacción(es)
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {vaccination.nextDoseDate ? (
                          <div>
                            <div className="text-sm text-gray-900">
                              {new Date(vaccination.nextDoseDate).toLocaleDateString()}
                            </div>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${nextDoseStatus.color}`}>
                              {nextDoseStatus.text}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">No programada</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{vaccination.administeredBy}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{vaccination.batchNumber}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditVaccination(vaccination)}
                            className="text-blue-600 hover:text-blue-900 text-sm"
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteVaccination(vaccination.id)}
                            className="text-red-600 hover:text-red-900 text-sm"
                            title="Eliminar"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};