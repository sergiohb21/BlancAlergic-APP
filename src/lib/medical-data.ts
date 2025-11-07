import { TestResult, ReactionHistory, CrossReactivity, MedicalRecord, EmergencyContact, Medication } from '@/types/medical';
import { AlergiaType } from '@/const/alergias';

// Sample test results
export const sampleTestResults: TestResult[] = [
  {
    id: 'test-001',
    date: new Date('2024-01-15'),
    testType: 'blood-test',
    allergen: 'Cacahuate',
    kuaLevel: 3.2,
    igeLevel: 12.5,
    result: 'positive',
    laboratory: 'Laboratorio Médico Central',
    doctor: 'Dra. María González',
    notes: 'Niveles elevados de IgE específica'
  },
  {
    id: 'test-002',
    date: new Date('2023-11-20'),
    testType: 'skin-prick',
    allergen: 'Mariscos',
    kuaLevel: 4.1,
    result: 'positive',
    laboratory: 'Clínica de Alergías del Sol',
    doctor: 'Dr. Carlos Rodríguez',
    notes: 'Reacción fuerte en piel-prick test'
  },
  {
    id: 'test-003',
    date: new Date('2024-03-10'),
    testType: 'blood-test',
    allergen: 'Frutos secos',
    kuaLevel: 2.8,
    igeLevel: 8.7,
    result: 'positive',
    laboratory: 'Laboratorio Médico Central'
  }
];

// Sample reaction history
export const sampleReactionHistory: ReactionHistory[] = [
  {
    id: 'reaction-001',
    date: new Date('2024-02-14'),
    allergen: 'Cacahuate',
    severity: 'moderate',
    symptoms: ['Urticaria', 'Hinchazón labios', 'Picazón garganta'],
    context: 'Consumo de cookies con mantequilla de maní',
    treatment: 'Antihistamínico (Loratadina 10mg)',
    location: 'Restaurante familiar',
    resolved: true,
    medicalAttention: false
  },
  {
    id: 'reaction-002',
    date: new Date('2023-12-25'),
    allergen: 'Mariscos (camarones)',
    severity: 'severe',
    symptoms: ['Dificultad respiratoria', 'Vómitos', 'Urticaria generalizada', 'Mareos'],
    context: 'Cena navideña familiar',
    treatment: 'Visita urgente a emergencias, epinefrina administrada',
    location: 'Domicilio familiar',
    resolved: true,
    medicalAttention: true
  }
];

// Cross-reactivity data
export const crossReactivityData: CrossReactivity[] = [
  {
    allergen: 'Cacahuate',
    crossReactiveWith: ['Almendras', 'Nueces', 'Avellanas', 'Soja'],
    riskLevel: 'high',
    notes: 'Reactividad cruzada común con otras leguminosas y frutos secos'
  },
  {
    allergen: 'Mariscos',
    crossReactiveWith: ['Crustáceos', 'Moluscos', 'Pescado'],
    riskLevel: 'moderate',
    notes: 'Riesgo de reactividad cruzada con otros mariscos y pescados'
  }
];

// Emergency contacts
export const emergencyContacts: EmergencyContact[] = [
  {
    id: 'contact-001',
    name: 'Dra. María González',
    relationship: 'Alergólogo',
    phone: '+52 55 1234 5678',
    isPrimary: true
  },
  {
    id: 'contact-002',
    name: 'Carlos Rodríguez',
    relationship: 'Padre',
    phone: '+52 55 8765 4321',
    isPrimary: false
  }
];

// Medications
export const medications: Medication[] = [
  {
    id: 'med-001',
    name: 'EpiPen',
    dosage: '0.3mg',
    frequency: 'Según necesidad',
    purpose: 'emergency',
    prescribedBy: 'Dra. María González',
    startDate: new Date('2023-12-26'),
    instructions: 'Autoinyector de epinefrina para emergencias alérgicas'
  },
  {
    id: 'med-002',
    name: 'Loratadina',
    dosage: '10mg',
    frequency: 'Diario',
    purpose: 'preventive',
    prescribedBy: 'Dra. María González',
    startDate: new Date('2024-01-01'),
    instructions: 'Antihistamínico para prevención de reacciones leves'
  }
];

// Medical utilities
export const medicalUtils = {
  getRiskLevel: (kuaLevel?: number): 'low' | 'moderate' | 'high' | 'critical' => {
    if (!kuaLevel) return 'low';
    if (kuaLevel < 1) return 'low';
    if (kuaLevel < 3) return 'moderate';
    if (kuaLevel < 5) return 'high';
    return 'critical';
  },

  getRiskColor: (risk: string): string => {
    const colors = {
      low: 'text-green-600 bg-green-50 border-green-200',
      moderate: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      high: 'text-orange-600 bg-orange-50 border-orange-200',
      critical: 'text-red-600 bg-red-50 border-red-200'
    };
    return colors[risk as keyof typeof colors] || colors.low;
  },

  formatMedicalDate: (date: Date): string => {
    return date.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  },

  formatMedicalDateTime: (date: Date): string => {
    return date.toLocaleString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  calculateAge: (birthDate: Date): number => {
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    return age;
  },

  generateMedicalId: (patientName: string, date: Date): string => {
    const initials = patientName.split(' ').map(n => n[0]).join('').toUpperCase();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `MED-${initials}-${dateStr}-${random}`;
  },

  getTestTypeIcon: (testType: string): string => {
    const icons = {
      'skin-prick': '🩸',
      'blood-test': '🧪',
      'oral-challenge': '🍽️',
      'patch-test': '🩹'
    };
    return icons[testType as keyof typeof icons] || '🏥';
  },

  getSeverityIcon: (severity: string): string => {
    const icons = {
      mild: '🟢',
      moderate: '🟡',
      severe: '🟠',
      anaphylactic: '🔴',
      critical: '⚠️'
    };
    return icons[severity as keyof typeof icons] || '⚪';
  }
};

// Create enhanced medical records from basic allergy data
export const createMedicalRecord = (
  allergy: AlergiaType,
  patientId: string,
  patientName: string
): MedicalRecord => {
  return {
    ...allergy,
    id: medicalUtils.generateMedicalId(patientName, new Date()),
    patientId,
    recordDate: new Date(),
    lastUpdated: new Date(),
    testResults: sampleTestResults.filter(test => test.allergen === allergy.name),
    reactionHistory: sampleReactionHistory.filter(reaction => reaction.allergen === allergy.name),
    crossReactivity: crossReactivityData.filter(cross => cross.allergen === allergy.name),
    emergencyContacts,
    medications: medications.filter(med =>
      allergy.isAlergic && med.purpose === 'emergency'
    )
  };
};