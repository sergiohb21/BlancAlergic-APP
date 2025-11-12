import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../../firebase/config';
import { useAuth } from '../../hooks/useAuth';
import { logger } from '@/utils/logger';

interface DocumentRecord {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadDate: string;
  category: string;
  description?: string;
}

export const DocumentManager: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('todos');
  const [selectedDocument, setSelectedDocument] = useState<DocumentRecord | null>(null);

  const categories = [
    { value: 'todos', label: 'Todas las categorías' },
    { value: 'medical-reports', label: 'Informes Médicos' },
    { value: 'lab-results', label: 'Resultados de Laboratorio' },
    { value: 'prescriptions', label: 'Recetas Médicas' },
    { value: 'scans', label: 'Escáneres y Radiografías' },
    { value: 'vaccines', label: 'Cartillas de Vacunación' },
    { value: 'insurance', label: 'Seguros y Facturas' },
    { value: 'other', label: 'Otros Documentos' }
  ];

  const categoryIcons = {
    'medical-reports': '📋',
    'lab-results': '🔬',
    'prescriptions': '💊',
    'scans': '📷',
    'vaccines': '💉',
    'insurance': '📄',
    'other': '📁'
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return '🖼️';
    if (type.includes('pdf')) return '📕';
    if (type.includes('word') || type.includes('document')) return '📘';
    if (type.includes('excel') || type.includes('spreadsheet')) return '📗';
    if (type.includes('powerpoint') || type.includes('presentation')) return '📙';
    return '📄';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const category = filterCategory === 'todos' ? 'other' : filterCategory;

    // Validar archivo
    if (file.size > 10 * 1024 * 1024) { // 10MB
      alert('El archivo no debe superar los 10MB');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      // Crear referencia en Firebase Storage
      const storageRef = ref(storage, `medical-documents/${user?.uid}/${Date.now()}-${file.name}`);

      // Subir archivo
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Crear registro del documento
      const newDocument: DocumentRecord = {
        id: snapshot.ref.fullPath,
        name: file.name,
        type: file.type,
        size: file.size,
        url: downloadURL,
        uploadDate: new Date().toISOString(),
        category,
        description: ''
      };

      setDocuments(prev => [newDocument, ...prev]);
      setUploadProgress(100);
    } catch (error) {
      logger.error({ error, fileName: file.name, userId: user?.uid }, 'Error uploading medical document');
      alert('Error al subir el archivo. Por favor, inténtalo de nuevo.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (document: DocumentRecord) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar "${document.name}"?`)) {
      return;
    }

    try {
      // Eliminar de Firebase Storage
      const storageRef = ref(storage, document.id);
      await deleteObject(storageRef);

      // Eliminar del estado local
      setDocuments(prev => prev.filter(doc => doc.id !== document.id));
      setSelectedDocument(null);
    } catch (error) {
      logger.error({ error, documentId: document.id, userId: user?.uid }, 'Error deleting medical document');
      alert('Error al eliminar el archivo. Por favor, inténtalo de nuevo.');
    }
  };

  const handleDownload = (document: DocumentRecord) => {
    const link = window.document.createElement('a');
    link.href = document.url;
    link.download = document.name;
    link.target = '_blank';
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  };

  const handleView = (document: DocumentRecord) => {
    setSelectedDocument(document);
  };

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === 'todos' || doc.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  // Sort documents by upload date (newest first)
  const sortedDocuments = filteredDocuments.sort((a, b) =>
    new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
  );

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
            <h2 className="text-2xl font-bold text-gray-900">Gestión de Documentos</h2>
            <p className="text-gray-600">Almacena y gestiona tus documentos médicos</p>
          </div>
        </div>
      </div>

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
              placeholder="Buscar documento..."
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
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Subiendo...</span>
                </>
              ) : (
                <>
                  <span>📁</span>
                  <span>Subir Documento</span>
                </>
              )}
            </button>
          </div>
          <div className="flex items-end text-sm text-gray-600">
            <span>{sortedDocuments.length} documentos</span>
          </div>
        </div>

        {uploading && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-700">Progreso de subida</span>
              <span className="text-sm text-gray-700">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Documents Grid */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Mis Documentos</h3>

          {sortedDocuments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📂</div>
              <p>No se encontraron documentos</p>
              <p className="text-sm">
                {searchTerm || filterCategory !== 'todos'
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'Sube tu primer documento médico usando el botón de arriba'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedDocuments.map(doc => (
                <div key={doc.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">
                      {categoryIcons[doc.category as keyof typeof categoryIcons] || getFileIcon(doc.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate" title={doc.name}>
                        {doc.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(doc.size)} • {new Date(doc.uploadDate).toLocaleDateString()}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <button
                          onClick={() => handleView(doc)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Ver
                        </button>
                        <span className="text-gray-300">•</span>
                        <button
                          onClick={() => handleDownload(doc)}
                          className="text-green-600 hover:text-green-800 text-sm font-medium"
                        >
                          Descargar
                        </button>
                        <span className="text-gray-300">•</span>
                        <button
                          onClick={() => handleDelete(doc)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Document Viewer Modal */}
      {selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold truncate">{selectedDocument.name}</h3>
              <button
                onClick={() => setSelectedDocument(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-auto max-h-[calc(90vh-200px)]">
              {selectedDocument.type.startsWith('image/') ? (
                <img
                  src={selectedDocument.url}
                  alt={selectedDocument.name}
                  className="max-w-full h-auto mx-auto"
                />
              ) : selectedDocument.type.includes('pdf') ? (
                <iframe
                  src={selectedDocument.url}
                  className="w-full h-[600px]"
                  title={selectedDocument.name}
                />
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">{getFileIcon(selectedDocument.type)}</div>
                  <p className="text-gray-600 mb-4">
                    No se puede previsualizar este tipo de archivo
                  </p>
                  <button
                    onClick={() => handleDownload(selectedDocument)}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Descargar Archivo
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between p-4 border-t bg-gray-50">
              <div className="text-sm text-gray-600">
                <p>Tamaño: {formatFileSize(selectedDocument.size)}</p>
                <p>Subido: {new Date(selectedDocument.uploadDate).toLocaleDateString()}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleDownload(selectedDocument)}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Descargar
                </button>
                <button
                  onClick={() => setSelectedDocument(null)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help Information */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">ℹ️ Información de uso</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Formatos permitidos: PDF, Word, Excel, PowerPoint, imágenes (JPG, PNG, GIF)</li>
          <li>• Tamaño máximo por archivo: 10MB</li>
          <li>• Los documentos se almacenan de forma segura en la nube</li>
          <li>• Puedes organizar tus documentos por categorías para facilitar su búsqueda</li>
          <li>• Mantén tus informes médicos actualizados para un mejor seguimiento</li>
        </ul>
      </div>
    </div>
  );
};