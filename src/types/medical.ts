import { AlergiaType } from "@/const/alergias";

export interface TestResult {
  id: string;
  date: Date;
  testType: 'skin-prick' | 'blood-test' | 'oral-challenge' | 'patch-test';
  allergen: string;
  kuaLevel?: number;
  igeLevel?: number;
  result: 'positive' | 'negative' | 'borderline';
  laboratory?: string;
  doctor?: string;
  notes?: string;
}

export interface ReactionHistory {
  id: string;
  date: Date;
  allergen: string;
  severity: 'mild' | 'moderate' | 'severe' | 'anaphylactic';
  symptoms: string[];
  context: string;
  treatment: string;
  location?: string;
  resolved: boolean;
  medicalAttention: boolean;
}

export interface CrossReactivity {
  allergen: string;
  crossReactiveWith: string[];
  riskLevel: 'low' | 'moderate' | 'high';
  notes?: string;
}

export interface MedicalRecord extends AlergiaType {
  id: string;
  patientId: string;
  recordDate: Date;
  lastUpdated: Date;
  testResults: TestResult[];
  reactionHistory: ReactionHistory[];
  crossReactivity: CrossReactivity[];
  doctorNotes?: string;
  emergencyContacts: EmergencyContact[];
  medications: Medication[];
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  isPrimary: boolean;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  purpose: 'emergency' | 'preventive' | 'maintenance';
  prescribedBy: string;
  startDate: Date;
  endDate?: Date;
  instructions: string;
}

export interface MedicalStatistics {
  totalAllergies: number;
  highRiskAllergies: number;
  categoriesWithAllergies: string[];
  recentTests: TestResult[];
  severeReactions: ReactionHistory[];
  lastTestDate: Date | null;
  nextTestDue: Date | null;
}

export interface RiskAssessment {
  overallRisk: 'low' | 'moderate' | 'high' | 'critical';
  riskFactors: string[];
  recommendations: string[];
  emergencyPreparedness: number; // 0-100 scale
}

export interface MedicalTimeline {
  date: Date;
  type: 'test' | 'reaction' | 'diagnosis' | 'update';
  title: string;
  description: string;
  severity?: 'mild' | 'moderate' | 'severe' | 'critical';
  icon: string;
}

export interface ExportOptions {
  format: 'pdf' | 'csv';
  includeSections: {
    basicInfo: boolean;
    testResults: boolean;
    reactionHistory: boolean;
    medications: boolean;
    emergencyContacts: boolean;
  };
  dateRange?: {
    start: Date;
    end: Date;
  };
}