import React, { useState, useRef } from 'react';
import { useProfileManagement } from '../../hooks/useProfileManagement';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Avatar } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Camera, Save, Upload, Phone, Calendar, User } from 'lucide-react';

interface ProfileEditComponentProps {
  onSave?: () => void;
}

export const ProfileEditComponent: React.FC<ProfileEditComponentProps> = ({ onSave }) => {
  const { user } = useAuth();
  const { profile, loading, error, syncStatus, updateProfile, uploadProfilePhoto } = useProfileManagement(user?.uid);

  const [formData, setFormData] = useState({
    displayName: profile?.displayName || '',
    email: profile?.email || user?.email || '',
    phone: profile?.phone || '',
    birthDate: profile?.birthDate || '',
    emergencyContact: profile?.emergencyContact || '',
    emergencyPhone: profile?.emergencyPhone || '',
    bloodType: profile?.bloodType || '',
    medicalNotes: profile?.medicalNotes || ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      await updateProfile(formData);
      setIsEditing(false);
      onSave?.();
    } catch (err) {
      console.error('Error saving profile:', err);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingPhoto(true);
      await uploadProfilePhoto(file);
    } catch (err) {
      console.error('Error uploading photo:', err);
    } finally {
      setUploadingPhoto(false);
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
      case 'error': return 'Error de sincronización';
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
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Sync Status Indicator */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Mi Perfil Médico</h2>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${getSyncStatusColor()}`}></div>
          <span className="text-sm text-gray-600">{getSyncStatusText()}</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Profile Photo Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Camera className="w-5 h-5" />
            <span>Foto de Perfil</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Avatar className="w-20 h-20" src={profile?.photoURL || user?.photoURL || ''}>
              {profile?.displayName?.charAt(0) || user?.displayName?.charAt(0) || 'U'}
            </Avatar>
            <div className="flex-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="flex items-center space-x-2"
              >
                {uploadingPhoto ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    <span>Subiendo...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Cambiar Foto</span>
                  </>
                )}
              </Button>
              <p className="text-sm text-gray-500 mt-1">
                Formatos: JPG, PNG. Tamaño máximo: 5MB
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Información Personal</span>
            </CardTitle>
            <Button
              variant={isEditing ? "default" : "outline"}
              size="sm"
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            >
              {isEditing ? (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar
                </>
              ) : (
                'Editar'
              )}
            </Button>
          </div>
          <CardDescription>
            Información básica y datos de contacto
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="displayName">Nombre Completo</Label>
              <Input
                id="displayName"
                name="displayName"
                value={formData.displayName}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Tu nombre completo"
              />
            </div>
            <div>
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={true} // Email no se puede editar desde aquí
                placeholder="tu@email.com"
              />
            </div>
            <div>
              <Label htmlFor="phone" className="flex items-center space-x-1">
                <Phone className="w-4 h-4" />
                <span>Teléfono</span>
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="+34 600 000 000"
              />
            </div>
            <div>
              <Label htmlFor="birthDate" className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>Fecha de Nacimiento</span>
              </Label>
              <Input
                id="birthDate"
                name="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card>
        <CardHeader>
          <CardTitle>Contacto de Emergencia</CardTitle>
          <CardDescription>
            Persona a contactar en caso de emergencia médica
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="emergencyContact">Nombre del Contacto</Label>
              <Input
                id="emergencyContact"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Nombre completo del contacto"
              />
            </div>
            <div>
              <Label htmlFor="emergencyPhone">Teléfono de Emergencia</Label>
              <Input
                id="emergencyPhone"
                name="emergencyPhone"
                type="tel"
                value={formData.emergencyPhone}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="+34 600 000 000"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medical Information */}
      <Card>
        <CardHeader>
          <CardTitle>Información Médica</CardTitle>
          <CardDescription>
            Datos médicos importantes y notas adicionales
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="bloodType">Tipo de Sangre</Label>
            <select
              id="bloodType"
              name="bloodType"
              value={formData.bloodType}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Seleccionar tipo de sangre</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>
          <div>
            <Label htmlFor="medicalNotes">Notas Médicas</Label>
            <Textarea
              id="medicalNotes"
              name="medicalNotes"
              value={formData.medicalNotes}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder="Información médica relevante, medicamentos habituales, condiciones crónicas, etc."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Información de la Cuenta</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Proveedor:</span>
              <Badge variant="secondary">Google</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">ID de Usuario:</span>
              <span className="text-sm font-mono">{user?.uid?.substring(0, 8)}...</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Última actualización:</span>
              <span className="text-sm">
                {profile?.updatedAt ? new Date(profile.updatedAt).toLocaleDateString() : 'No disponible'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};