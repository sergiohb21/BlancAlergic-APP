import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LabResultRecord } from '../../firebase/types';
import { logger } from '@/utils/logger';

interface LabResultFormData {
  testName: string;
  category: string;
  resultDate: string;
  normalRange: string;
  doctor: string;
  laboratory: string;
  notes: string;
  results: LabResultInput[];
}

interface LabResultInput {
  parameter: string;
  value: string;
  unit: string;
  normalRange: string;
  status: 'normal' | 'alto' | 'bajo' | 'crítico';
}

export const LabResultsManager: React.FC = () => {
  const navigate = useNavigate();

  const [labResults, setLabResults] = useState<LabResultRecord[]>([]);
  const [isAddingResult, setIsAddingResult] = useState(false);
  const [editingResult, setEditingResult] = useState<LabResultRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('todos');
  const [loading] = useState(false);

  const [formData, setFormData] = useState<LabResultFormData>({
    testName: '',
    category: 'Análisis de Sangre',
    resultDate: new Date().toISOString().split('T')[0],
    normalRange: '',
    doctor: '',
    laboratory: '',
    notes: '',
    results: []
  });

  const categories = [
    'Análisis de Sangre',
    'Análisis de Orina',
    'Pruebas de Función Hepática',
    'Pruebas de Función Renal',
    'Perfil Lipídico',
    'Hemograma Completo',
    'Pruebas de Tiroides',
    'Marcadores Tumorales',
    'Pruebas de Coagulación',
    'Electrolitos',
    'Pruebas de Alergias',
    'Pruebas Genéticas',
    'Cultivos',
    'Pruebas COVID-19',
    'Otras'
  ];

  const statusFilters = [
    { value: 'todos', label: 'Todos los resultados' },
    { value: 'con-anomalias', label: 'Con anomalías' },
    { value: 'normales', label: 'Resultados normales' }
  ];

  const resetForm = () => {
    setFormData({
      testName: '',
      category: 'Análisis de Sangre',
      resultDate: new Date().toISOString().split('T')[0],
      normalRange: '',
      doctor: '',
      laboratory: '',
      notes: '',
      results: []
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddResult = () => {
    setEditingResult(null);
    resetForm();
    setIsAddingResult(true);
  };

  const handleEditResult = (result: LabResultRecord) => {
    setEditingResult(result);
    setFormData({
      testName: result.testName,
      category: result.category,
      resultDate: result.resultDate,
      normalRange: result.normalRange,
      doctor: result.doctor,
      laboratory: result.laboratory,
      notes: result.notes,
      results: result.results.map(r => ({ ...r })) as LabResultInput[]
    });
    setIsAddingResult(true);
  };

  const handleAddLabParameter = () => {
    setFormData(prev => ({
      ...prev,
      results: [...prev.results, {
        parameter: '',
        value: '',
        unit: '',
        normalRange: '',
        status: 'normal'
      }]
    }));
  };

  const handleParameterChange = (index: number, field: keyof LabResultInput, value: string) => {
    setFormData(prev => ({
      ...prev,
      results: prev.results.map((result, i) =>
        i === index ? { ...result, [field]: value } : result
      )
    }));
  };

  const handleRemoveParameter = (index: number) => {
    setFormData(prev => ({
      ...prev,
      results: prev.results.filter((_, i) => i !== index)
    }));
  };

  const handleSaveResult = () => {
    // TODO: Implement Firebase save functionality
    logger.debug('Saving lab result');

    const newLabResult: LabResultRecord = {
      id: editingResult?.id || Date.now().toString(),
      testName: formData.testName,
      category: formData.category,
      resultDate: formData.resultDate,
      normalRange: formData.normalRange,
      doctor: formData.doctor,
      laboratory: formData.laboratory,
      notes: formData.notes,
      results: formData.results
    };

    if (editingResult) {
      setLabResults(prev => prev.map(result =>
        result.id === editingResult.id ? newLabResult : result
      ));
    } else {
      setLabResults(prev => [...prev, newLabResult]);
    }

    setIsAddingResult(false);
    resetForm();
  };

  const handleDeleteResult = (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este resultado de laboratorio?')) {
      setLabResults(prev => prev.filter(result => result.id !== id));
    }
  };

  const filteredResults = labResults.filter(result => {
    const matchesSearch = result.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         result.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         result.doctor.toLowerCase().includes(searchTerm.toLowerCase());

    const hasAnomalies = result.results.some(r => r.status !== 'normal');

    const matchesCategory = filterCategory === 'todos' ||
                           (filterCategory === 'con-anomalias' && hasAnomalies) ||
                           (filterCategory === 'normales' && !hasAnomalies);

    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-green-100 text-green-800';
      case 'alto': return 'bg-red-100 text-red-800';
      case 'bajo': return 'bg-yellow-100 text-yellow-800';
      case 'crítico': return 'bg-red-200 text-red-900';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal': return '✅';
      case 'alto': return '⬆️';
      case 'bajo': return '⬇️';
      case 'crítico': return '⚠️';
      default: return '❓';
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
            <h2 className="text-2xl font-bold text-gray-900">Resultados de Laboratorio</h2>
            <p className="text-gray-600">Consulta y gestiona tus análisis y pruebas médicas</p>
          </div>
        </div>
        <button
          onClick={handleAddResult}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
        >
          <span>🧪</span>
          <span>Añadir Resultado</span>
        </button>
      </div>


      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              🔍 Buscar análisis
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nombre del análisis, médico o laboratorio"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              📊 Categoría
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
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
              Total: {filteredResults.length} resultados<br/>
              Con anomalías: {filteredResults.filter(r => r.results.some(res => res.status !== 'normal')).length}
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Form */}
      {isAddingResult && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingResult ? 'Editar Resultado de Laboratorio' : 'Añadir Nuevo Resultado'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Análisis *
              </label>
              <input
                type="text"
                name="testName"
                value={formData.testName}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: Hemograma completo"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha del Resultado *
              </label>
              <input
                type="date"
                name="resultDate"
                value={formData.resultDate}
                onChange={handleInputChange}
                max={new Date().toISOString().split('T')[0]}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Médico Solicitante *
              </label>
              <input
                type="text"
                name="doctor"
                value={formData.doctor}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nombre del médico"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Laboratorio *
              </label>
              <input
                type="text"
                name="laboratory"
                value={formData.laboratory}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nombre del laboratorio"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rango Normal General
              </label>
              <input
                type="text"
                name="normalRange"
                value={formData.normalRange}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Rango general del análisis"
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
                placeholder="Comentarios adicionales del médico o laboratorio"
              />
            </div>
          </div>

          {/* Parameters Section */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-semibold">Parámetros del Análisis</h4>
              <button
                type="button"
                onClick={handleAddLabParameter}
                className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors"
              >
                + Añadir Parámetro
              </button>
            </div>

            {formData.results.length === 0 ? (
              <div className="text-center py-4 border-2 border-dashed border-gray-300 rounded">
                <p className="text-gray-500">No hay parámetros añadidos. Haz clic en "Añadir Parámetro" para empezar.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {formData.results.map((param, index) => (
                  <div key={index} className="border border-gray-200 rounded p-3">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Parámetro</label>
                        <input
                          type="text"
                          value={param.parameter}
                          onChange={(e) => handleParameterChange(index, 'parameter', e.target.value)}
                          className="w-full p-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Ej: Hemoglobina"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Valor</label>
                        <input
                          type="text"
                          value={param.value}
                          onChange={(e) => handleParameterChange(index, 'value', e.target.value)}
                          className="w-full p-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Ej: 14.5"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Unidad</label>
                        <input
                          type="text"
                          value={param.unit}
                          onChange={(e) => handleParameterChange(index, 'unit', e.target.value)}
                          className="w-full p-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Ej: g/dL"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Rango Normal</label>
                        <input
                          type="text"
                          value={param.normalRange}
                          onChange={(e) => handleParameterChange(index, 'normalRange', e.target.value)}
                          className="w-full p-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Ej: 12-16"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Estado</label>
                        <select
                          value={param.status}
                          onChange={(e) => handleParameterChange(index, 'status', e.target.value)}
                          className="w-full p-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="normal">Normal</option>
                          <option value="alto">Alto</option>
                          <option value="bajo">Bajo</option>
                          <option value="crítico">Crítico</option>
                        </select>
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => handleRemoveParameter(index)}
                          className="px-2 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => {
                setIsAddingResult(false);
                resetForm();
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveResult}
              disabled={!formData.testName || !formData.category || !formData.resultDate || !formData.doctor || !formData.laboratory}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {editingResult ? 'Actualizar Resultado' : 'Guardar Resultado'}
            </button>
          </div>
        </div>
      )}

      {/* Results List */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        {filteredResults.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-4xl mb-4">🧪</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay resultados de laboratorio</h3>
            <p className="text-gray-600 mb-4">Comienza añadiendo tu primer resultado de análisis</p>
            <button
              onClick={handleAddResult}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Añadir Resultado
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredResults.map((result) => (
              <div key={result.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{result.testName}</h3>
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                        {result.category}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Fecha:</span> {new Date(result.resultDate).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">Laboratorio:</span> {result.laboratory}
                      </div>
                      <div>
                        <span className="font-medium">Médico:</span> Dr/a. {result.doctor}
                      </div>
                    </div>

                    {result.results.length > 0 && (
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Resultados principales:</h4>
                        <div className="flex flex-wrap gap-2">
                          {result.results.slice(0, 5).map((param, idx) => (
                            <span
                              key={idx}
                              className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded ${getStatusColor(param.status)}`}
                            >
                              {getStatusIcon(param.status)} {param.parameter}: {param.value} {param.unit}
                            </span>
                          ))}
                          {result.results.length > 5 && (
                            <span className="text-xs text-gray-500">
                              +{result.results.length - 5} más
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {result.notes && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Notas:</span> {result.notes}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleEditResult(result)}
                      className="text-blue-600 hover:text-blue-900 text-sm"
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteResult(result.id)}
                      className="text-red-600 hover:text-red-900 text-sm"
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};