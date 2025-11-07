import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMedicalData } from '../../hooks/useMedicalData';
import { useAuth } from '../../hooks/useAuth';
import { MedicalRecord } from '../../firebase/types';

interface MedicalFormData {
  type: 'visit' | 'test' | 'vaccination' | 'medication' | 'document' | 'other';
  title: string;
  description: string;
  date: string;
  doctor?: string;
  location?: string;
  result?: string;
  nextAction?: string;
  attachments?: string[];
}

export const MedicalRecordsManager: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { records, loading, error, syncStatus, addRecord, updateRecord, deleteRecord } = useMedicalData(user?.uid);

  const [isAddingRecord, setIsAddingRecord] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('todos');

  const [formData, setFormData] = useState<MedicalFormData>({
    type: 'visit',
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    doctor: '',
    location: '',
    result: '',
    nextAction: '',
    attachments: []
  });

  const recordTypes = [
    { value: 'todos', label: 'Todos los registros' },
    { value: 'visit', label: 'Visitas Médicas' },
    { value: 'test', label: 'Análisis y Pruebas' },
    { value: 'vaccination', label: 'Vacunas' },
    { value: 'medication', label: 'Medicamentos' },
    { value: 'document', label: 'Documentos' },
    { value: 'other', label: 'Otros' }
  ];

  const typeIcons: Record<string, string> = {
    visit: '🏥',
    test: '🔬',
    vaccination: '💉',
    medication: '💊',
    document: '📄',
    other: '📋'
  };

  const typeColors: Record<string, string> = {
    visit: 'bg-blue-100 text-blue-800 border-blue-200',
    test: 'bg-purple-100 text-purple-800 border-purple-200',
    vaccination: 'bg-green-100 text-green-800 border-green-200',
    medication: 'bg-orange-100 text-orange-800 border-orange-200',
    document: 'bg-gray-100 text-gray-800 border-gray-200',
    other: 'bg-pink-100 text-pink-800 border-pink-200'
  };

  React.useEffect(() => {
    if (editingRecord) {
      setFormData({
        type: editingRecord.type,
        title: editingRecord.title,
        description: editingRecord.description,
        date: editingRecord.date,
        doctor: editingRecord.doctor || '',
        location: editingRecord.location || '',
        result: editingRecord.result || '',
        nextAction: editingRecord.nextAction || '',
        attachments: editingRecord.attachments || []
      });
      setIsAddingRecord(true);
    }
  }, [editingRecord]);

  const resetForm = () => {
    setFormData({
      type: 'visit',
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      doctor: '',
      location: '',
      result: '',
      nextAction: '',
      attachments: []
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRecord) {
        await updateRecord(editingRecord.id, formData);
        setEditingRecord(null);
      } else {
        await addRecord(formData);
      }
      setIsAddingRecord(false);
      resetForm();
    } catch (err) {
      console.error('Error saving record:', err);
    }
  };

  const handleEdit = (record: MedicalRecord) => {
    setEditingRecord(record);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este registro médico?')) {
      try {
        await deleteRecord(id);
      } catch (err) {
        console.error('Error deleting record:', err);
      }
    }
  };

  const handleCancel = () => {
    setIsAddingRecord(false);
    setEditingRecord(null);
    resetForm();
  };

  // Filter records
  const filteredRecords = records.filter(record => {
    const matchesSearch = record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (record.doctor && record.doctor.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'todos' || record.type === filterType;

    return matchesSearch && matchesType;
  });

  // Sort records by date (newest first)
  const sortedRecords = filteredRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getSyncStatusColor = () => {
    switch (syncStatus) {
      case 'synced': return 'bg-green-500';
      case 'syncing': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getSyncStatusText = () => {
    switch (syncStatus) {
      case 'synced': return 'Sincronizado';
      case 'syncing': return 'Sincronizando...';
      case 'error': return 'Error';
      case 'offline': return 'Sin conexión';
      default: return 'Desconocido';
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
            <h2 className="text-2xl font-bold text-gray-900">Historial Médico</h2>
            <p className="text-gray-600">Gestiona tu historial médico completo</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${getSyncStatusColor()}`}></div>
          <span className="text-sm text-gray-600">{getSyncStatusText()}</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              🔍 Buscar
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar en historial..."
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Registro
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {recordTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setIsAddingRecord(true)}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center space-x-2"
            >
              <span>➕</span>
              <span>Agregar Registro</span>
            </button>
          </div>
        </div>
      </div>

      {/* Add/Edit Record Form */}
      {isAddingRecord && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingRecord ? '✏️ Editar Registro' : '➕ Agregar Nuevo Registro'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Registro *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="visit">Visita Médica</option>
                  <option value="test">Análisis/Prueba</option>
                  <option value="vaccination">Vacuna</option>
                  <option value="medication">Medicamento</option>
                  <option value="document">Documento</option>
                  <option value="other">Otro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título *
                </label>
                <input
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: Control de alergias, Análisis de sangre..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha *
                </label>
                <input
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Médico/Facilitador
                </label>
                <input
                  name="doctor"
                  type="text"
                  value={formData.doctor}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nombre del médico o especialista"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ubicación
                </label>
                <input
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Hospital, clínica, laboratorio..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resultado
                </label>
                <input
                  name="result"
                  type="text"
                  value={formData.result}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Resultado del análisis o visita"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe los detalles del registro médico..."
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Próximos Pasos
              </label>
              <textarea
                name="nextAction"
                value={formData.nextAction}
                onChange={handleInputChange}
                rows={2}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Próximas acciones, seguimiento recomendado..."
              />
            </div>

            <div className="flex space-x-2">
              <button
                type="submit"
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center space-x-2"
              >
                <span>{editingRecord ? '💾' : '➕'}</span>
                <span>{editingRecord ? 'Actualizar' : 'Agregar'}</span>
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Records List */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            Registros Médicos ({sortedRecords.length})
          </h3>

          {sortedRecords.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📋</div>
              <p>No se encontraron registros médicos</p>
              <p className="text-sm">
                {searchTerm || filterType !== 'todos'
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'Agrega tu primer registro médico usando el botón de arriba'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedRecords.map(record => (
                <div key={record.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-lg">{typeIcons[record.type]}</span>
                        <h4 className="font-semibold text-lg">{record.title}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${typeColors[record.type]}`}>
                          {recordTypes.find(t => t.value === record.type)?.label || record.type}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                        <div className="text-sm">
                          <span className="font-medium text-gray-700">📅 Fecha: </span>
                          <span className="text-gray-600">{new Date(record.date).toLocaleDateString()}</span>
                        </div>
                        {record.doctor && (
                          <div className="text-sm">
                            <span className="font-medium text-gray-700">👨‍⚕️ Médico: </span>
                            <span className="text-gray-600">{record.doctor}</span>
                          </div>
                        )}
                        {record.location && (
                          <div className="text-sm">
                            <span className="font-medium text-gray-700">📍 Ubicación: </span>
                            <span className="text-gray-600">{record.location}</span>
                          </div>
                        )}
                        {record.result && (
                          <div className="text-sm">
                            <span className="font-medium text-gray-700">🔬 Resultado: </span>
                            <span className="text-gray-600">{record.result}</span>
                          </div>
                        )}
                      </div>

                      <div className="mb-2">
                        <span className="text-sm font-medium text-gray-700">Descripción: </span>
                        <p className="text-sm text-gray-600">{record.description}</p>
                      </div>

                      {record.nextAction && (
                        <div className="mb-2">
                          <span className="text-sm font-medium text-gray-700">Próximos Pasos: </span>
                          <p className="text-sm text-gray-600">{record.nextAction}</p>
                        </div>
                      )}

                      <div className="text-xs text-gray-500">
                        Creado: {new Date(record.createdAt).toLocaleDateString()} |
                        Actualizado: {new Date(record.updatedAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleEdit(record)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(record.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
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
    </div>
  );
};