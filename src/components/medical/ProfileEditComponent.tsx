import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfileManagement } from '../../hooks/useProfileManagement';
import { useAuth } from '../../hooks/useAuth';
import { logger } from '@/utils/logger';
import { BLOOD_TYPES, FILE_UPLOAD_LIMITS } from '@/utils/constants';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Avatar } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Camera, Save, Upload, Phone, Calendar, User, ArrowLeft } from 'lucide-react';

interface ProfileEditComponentProps {
  onSave?: () => void;
  mode?: 'full' | 'simple' | 'card';
  showBackButton?: boolean;
  backButtonTo?: string;
  customTitle?: string;
  showAccountInfo?: boolean;
  compact?: boolean;
}

export const ProfileEditComponent: React.FC<ProfileEditComponentProps> = React.memo(({
  onSave,
  mode = 'full',
  showBackButton = false,
  backButtonTo = '/historial-medico',
  customTitle,
  showAccountInfo = true,
  compact = false
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
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
      logger.error({ msg: 'Error saving profile', error: err });
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingPhoto(true);
      await uploadProfilePhoto(file);
    } catch (err) {
      logger.error({ msg: 'Error uploading photo', error: err });
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

  const renderTitle = () => {
    const title = customTitle || 'Mi Perfil Médico';

    if (mode === 'simple' || showBackButton) {
      return (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <button
                onClick={() => navigate(backButtonTo)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Volver"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
            )}
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${getSyncStatusColor()}`}></div>
            <span className="text-sm text-muted-foreground">{getSyncStatusText()}</span>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{title}</h2>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${getSyncStatusColor()}`}></div>
          <span className="text-sm text-gray-600">{getSyncStatusText()}</span>
        </div>
      </div>
    );
  };

  const renderError = () => {
    const errorClass = mode === 'simple'
      ? "bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded mb-4"
      : "bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded";

    return (
      <div className={errorClass}>
        {error}
      </div>
    );
  };

  const renderProfilePhoto = () => {
    const photoUrl = profile?.photoURL || user?.photoURL || '';
    const avatarText = profile?.displayName?.charAt(0) || user?.displayName?.charAt(0) || 'U';

    if (mode === 'simple') {
      return (
        <div className="bg-card rounded-lg shadow-md border border-border mb-6">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Foto de Perfil</h3>
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-muted-foreground text-xl">{avatarText}</span>
                )}
              </div>
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {uploadingPhoto ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Subiendo...</span>
                    </>
                  ) : (
                    <>
                      <span>📷</span>
                      <span>Cambiar Foto</span>
                    </>
                  )}
                </button>
                <p className="text-sm text-muted-foreground mt-1">
                  Formatos: JPG, PNG. Tamaño máximo: {FILE_UPLOAD_LIMITS.MAX_SIZE_MB}MB
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Camera className="w-5 h-5" />
            <span>Foto de Perfil</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Avatar className="w-20 h-20" src={photoUrl}>
              {avatarText}
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
                Formatos: JPG, PNG. Tamaño máximo: {FILE_UPLOAD_LIMITS.MAX_SIZE_MB}MB
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderFormSection = (title: string, icon: React.ReactNode, children: React.ReactNode, description?: string) => {
    if (mode === 'simple') {
      return (
        <div className="bg-card rounded-lg shadow-md border border-border mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{title}</h3>
              {title === 'Información Personal' && (
                <button
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                  className={`px-4 py-2 rounded ${
                    isEditing
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {isEditing ? '💾 Guardar' : '✏️ Editar'}
                </button>
              )}
            </div>
            {children}
          </div>
        </div>
      );
    }

    return (
      <Card>
        <CardHeader>
          {title === 'Información Personal' ? (
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                {icon}
                <span>{title}</span>
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
          ) : (
            <>
              <CardTitle className="flex items-center space-x-2">
                {icon}
                <span>{title}</span>
              </CardTitle>
              {description && <CardDescription>{description}</CardDescription>}
            </>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {children}
        </CardContent>
      </Card>
    );
  };

  const renderInputField = (name: string, label: string, type: string = 'text', icon?: React.ReactNode) => {
    const value = formData[name as keyof typeof formData];
    const isDisabled = !isEditing || (name === 'email');

    if (mode === 'simple') {
      return (
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            {icon ? <>{icon} {label}</> : label}
          </label>
          <input
            id={name}
            name={name}
            type={type}
            value={value}
            onChange={handleInputChange}
            disabled={isDisabled}
            className="w-full p-2 border border-input rounded-md focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-muted disabled:cursor-not-allowed"
            placeholder={name === 'email' ? 'tu@email.com' :
                       name === 'phone' || name === 'emergencyPhone' ? '+34 600 000 000' : ''}
          />
        </div>
      );
    }

    const labelContent = icon ? (
      <Label htmlFor={name} className="flex items-center space-x-1">
        {icon}
        <span>{label}</span>
      </Label>
    ) : (
      <Label htmlFor={name}>{label}</Label>
    );

    return (
      <div>
        {labelContent}
        <Input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={handleInputChange}
          disabled={isDisabled}
          placeholder={name === 'email' ? 'tu@email.com' :
                     name === 'phone' || name === 'emergencyPhone' ? '+34 600 000 000' : ''}
        />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const containerClass = mode === 'simple'
    ? "container max-w-4xl mx-auto p-4"
    : `max-w-4xl mx-auto ${compact ? 'p-4' : 'p-6'} space-y-6`;

  return (
    <div className={containerClass}>
      {/* Title and Sync Status */}
      {renderTitle()}

      {error && renderError()}

      {/* Profile Photo Section */}
      {renderProfilePhoto()}

      {/* Personal Information */}
      {renderFormSection(
        "Información Personal",
        <User className="w-5 h-5" />,
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderInputField("displayName", "Nombre Completo")}
          {renderInputField("email", "Correo Electrónico", "email")}
          {renderInputField("phone", "Teléfono", "tel", <Phone className="w-4 h-4" />)}
          {renderInputField("birthDate", "Fecha de Nacimiento", "date", <Calendar className="w-4 h-4" />)}
        </div>,
        "Información básica y datos de contacto"
      )}

      {/* Emergency Contact */}
      {renderFormSection(
        "Contacto de Emergencia",
        null,
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderInputField("emergencyContact", "Nombre del Contacto")}
          {renderInputField("emergencyPhone", "Teléfono de Emergencia", "tel")}
        </div>,
        "Persona a contactar en caso de emergencia médica"
      )}

      {/* Medical Information */}
      {renderFormSection(
        "Información Médica",
        null,
        <div className="space-y-4">
          <div>
            <Label htmlFor="bloodType">Tipo de Sangre</Label>
            <select
              id="bloodType"
              name="bloodType"
              value={formData.bloodType}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={mode === 'simple'
                ? "w-full p-2 border border-input rounded-md focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-muted disabled:cursor-not-allowed"
                : "w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              }
            >
              <option value="">Seleccionar tipo de sangre</option>
              {BLOOD_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
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
        </div>,
        "Datos médicos importantes y notas adicionales"
      )}

      {/* Account Information */}
      {showAccountInfo && renderFormSection(
        "Información de la Cuenta",
        null,
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
      )}
    </div>
  );
});

ProfileEditComponent.displayName = 'ProfileEditComponent';