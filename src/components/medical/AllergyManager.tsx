import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfileManagement } from '../../hooks/useProfileManagement';
import { useAuth } from '../../hooks/useAuth';
import { AllergyRecord } from '../../firebase/types';

interface AllergyFormData {
  name: string;
  category: string;
  intensity: 'Baja' | 'Media' | 'Alta';
  symptoms: string;
  notes: string;
  KUA_Litro?: number;
}

export const AllergyManager: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { allergies, loading, error, syncStatus, addAllergy, updateAllergy, deleteAllergy } = useProfileManagement(user?.uid);

  const [isAddingAllergy, setIsAddingAllergy] = useState(false);
  const [editingAllergy, setEditingAllergy] = useState<AllergyRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('todas');
  const [filterIntensity, setFilterIntensity] = useState('todas');

  const [formData, setFormData] = useState<AllergyFormData>({
    name: '',
    category: 'Frutos secos',
    intensity: 'Media',
    symptoms: '',
    notes: '',
    KUA_Litro: undefined
  });

  const categories = ['todas', 'Crustáceos', 'Mariscos', 'Pescados', 'Frutas', 'Vegetales', 'Frutos secos', 'Árboles', 'Hongos', 'Animales', 'Otros'];
  const intensities = ['todas', 'Baja', 'Media', 'Alta'];

  useEffect(() => {
    if (editingAllergy) {
      setFormData({
        name: editingAllergy.name,
        category: editingAllergy.category,
        intensity: editingAllergy.intensity,
        symptoms: Array.isArray(editingAllergy.symptoms) ? editingAllergy.symptoms.join(', ') : editingAllergy.symptoms,
        notes: editingAllergy.notes,
        KUA_Litro: editingAllergy.KUA_Litro
      });
      setIsAddingAllergy(true);
    } else {
      resetForm();
    }
  }, [editingAllergy]);

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'Frutos secos',
      intensity: 'Media',
      symptoms: '',
      notes: '',
      KUA_Litro: undefined
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
      // Convert form data to AllergyRecord format
      const allergyData = {
        ...formData,
        symptoms: formData.symptoms.split(',').map(s => s.trim()).filter(s => s.length > 0),
        isAlergic: true,
        reactions: [],
        diagnosedDate: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };

      if (editingAllergy) {
        await updateAllergy(editingAllergy.id, allergyData);
        setEditingAllergy(null);
      } else {
        await addAllergy(allergyData);
      }
      setIsAddingAllergy(false);
      resetForm();
    } catch (err) {
      console.error('Error saving allergy:', err);
    }
  };

  const handleEdit = (allergy: AllergyRecord) => {
    setEditingAllergy(allergy);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta alergia?')) {
      try {
        await deleteAllergy(id);
      } catch (err) {
        console.error('Error deleting allergy:', err);
      }
    }
  };

  const handleCancel = () => {
    setIsAddingAllergy(false);
    setEditingAllergy(null);
    resetForm();
  };

  // Filter allergies
  const filteredAllergies = allergies.filter(allergy => {
    const symptomsText = Array.isArray(allergy.symptoms) ? allergy.symptoms.join(', ') : allergy.symptoms;
    const matchesSearch = allergy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         symptomsText.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'todas' || allergy.category === filterCategory;
    const matchesIntensity = filterIntensity === 'todas' || allergy.intensity === filterIntensity;

    return matchesSearch && matchesCategory && matchesIntensity;
  });

  // Get intensity color
  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'Alta': return 'bg-red-100 text-red-800 border-red-200';
      case 'Media': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Baja': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

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
            <h2 className="text-2xl font-bold text-gray-900">Gestión de Alergias</h2>
            <p className="text-gray-600">Administra tus alergias y reacciones alérgicas</p>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              🔍 Buscar
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar alergia o síntoma..."
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'todas' ? 'Todas las categorías' : cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Intensidad
            </label>
            <select
              value={filterIntensity}
              onChange={(e) => setFilterIntensity(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {intensities.map(int => (
                <option key={int} value={int}>
                  {int === 'todas' ? 'Todas las intensidades' : int}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setIsAddingAllergy(true)}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center space-x-2"
            >
              <span>➕</span>
              <span>Agregar Alergia</span>
            </button>
          </div>
        </div>
      </div>

      {/* Add/Edit Allergy Form */}
      {isAddingAllergy && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingAllergy ? '✏️ Editar Alergia' : '➕ Agregar Nueva Alergia'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la Alergia *
                </label>
                <input
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: Maní, Látex, Polen..."
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
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {categories.filter(cat => cat !== 'todas').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Intensidad *
                </label>
                <select
                  name="intensity"
                  value={formData.intensity}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Baja">Baja</option>
                  <option value="Media">Media</option>
                  <option value="Alta">Alta</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  KUA/Litro (opcional)
                </label>
                <input
                  name="KUA_Litro"
                  type="number"
                  step="0.01"
                  value={formData.KUA_Litro || ''}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Síntomas *
              </label>
              <textarea
                name="symptoms"
                value={formData.symptoms}
                onChange={handleInputChange}
                required
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe los síntomas que experimentas..."
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas Adicionales
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={2}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Información adicional, medicamentos para emergencia, etc..."
              />
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center space-x-2"
              >
                <span>{editingAllergy ? '💾' : '➕'}</span>
                <span>{editingAllergy ? 'Actualizar' : 'Agregar'}</span>
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

      {/* Allergies List */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            Mis Alergias ({filteredAllergies.length})
          </h3>

          {filteredAllergies.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">🌿</div>
              <p>No se encontraron alergias</p>
              <p className="text-sm">
                {searchTerm || filterCategory !== 'todas' || filterIntensity !== 'todas'
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'Agrega tu primera alergia usando el botón de arriba'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAllergies.map(allergy => (
                <div key={allergy.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold text-lg">{allergy.name}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getIntensityColor(allergy.intensity)}`}>
                          {allergy.intensity}
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {allergy.category}
                        </span>
                      </div>

                      <div className="mb-2">
                        <span className="text-sm font-medium text-gray-700">Síntomas: </span>
                        <span className="text-sm text-gray-600">
                          {Array.isArray(allergy.symptoms) ? allergy.symptoms.join(', ') : allergy.symptoms}
                        </span>
                      </div>

                      {allergy.KUA_Litro && (
                        <div className="mb-2">
                          <span className="text-sm font-medium text-gray-700">KUA/Litro: </span>
                          <span className="text-sm text-gray-600">{allergy.KUA_Litro}</span>
                        </div>
                      )}

                      {allergy.notes && (
                        <div className="mb-2">
                          <span className="text-sm font-medium text-gray-700">Notas: </span>
                          <span className="text-sm text-gray-600">{allergy.notes}</span>
                        </div>
                      )}

                      <div className="text-xs text-gray-500">
                        Última actualización: {new Date(allergy.updatedAt || allergy.lastUpdated).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleEdit(allergy)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(allergy.id)}
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