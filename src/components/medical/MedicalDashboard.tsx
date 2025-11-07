import * as React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Activity,
  AlertTriangle,
  Calendar,
  FileText,
  Heart,
  Shield,
  TrendingUp,
  Phone,
  Download,
  Printer
} from 'lucide-react';
import { MedicalStatistics, RiskAssessment } from '@/types/medical';
import { medicalUtils } from '@/lib/medical-data';
import { cn } from '@/lib/utils';

interface MedicalDashboardProps {
  statistics: MedicalStatistics;
  riskAssessment: RiskAssessment;
  patientName: string;
  patientAge: number;
  lastTestDate: Date | null;
  onExport: (format: 'pdf' | 'csv') => void;
  onPrint: () => void;
}

const containerVariants = {
  initial: {
    opacity: 0,
    y: 20
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  initial: {
    opacity: 0,
    scale: 0.95
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4
    }
  }
};

const riskLevelConfig = {
  low: { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', icon: '✅' },
  moderate: { color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', icon: '⚠️' },
  high: { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', icon: '⚡' },
  critical: { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: '🚨' }
};

const MedicalDashboard: React.FC<MedicalDashboardProps> = ({
  statistics,
  riskAssessment,
  patientName,
  patientAge,
  lastTestDate,
  onExport,
  onPrint
}) => {
  const riskConfig = riskLevelConfig[riskAssessment.overallRisk];

  const StatCard = React.memo(({
    title,
    value,
    description,
    icon: Icon,
    color = 'text-primary',
    bg = 'bg-primary/10'
  }: {
    title: string;
    value: string | number;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    color?: string;
    bg?: string;
  }) => (
    <motion.div variants={itemVariants}>
      <Card className={cn("hover:shadow-md transition-shadow duration-200", bg)}>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className={cn("p-3 rounded-full", bg)}>
              <Icon className={cn("h-6 w-6", color)} />
            </div>
            <div className="flex-1">
              <div className={cn("text-2xl font-bold", color)}>{value}</div>
              <div className="text-sm text-muted-foreground">{title}</div>
            </div>
          </div>
          {description && (
            <div className="mt-3 text-xs text-muted-foreground">{description}</div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  ));

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      {/* Header Section */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-3">
                <Heart className="h-8 w-8 text-primary" />
                Historial Médico
              </CardTitle>
              <CardDescription className="text-lg mt-2">
                <span className="font-medium">{patientName}</span> • {patientAge} años
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExport('pdf')}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onPrint}
                className="flex items-center gap-2"
              >
                <Printer className="h-4 w-4" />
                Imprimir
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Risk Assessment Alert */}
      <motion.div variants={itemVariants}>
        <Card className={cn("border-2", riskConfig.border, riskConfig.bg)}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{riskConfig.icon}</div>
                <div>
                  <CardTitle className={cn("text-lg", riskConfig.color)}>
                    Nivel de Riesgo: {riskAssessment.overallRisk.toUpperCase()}
                  </CardTitle>
                  <CardDescription>
                    Evaluación médica actualizada
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Preparación para Emergencias</span>
              <span className="text-sm">{riskAssessment.emergencyPreparedness}%</span>
            </div>
            <Progress value={riskAssessment.emergencyPreparedness} className="h-2" />
          </CardContent>
        </Card>
      </motion.div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Alergias"
          value={statistics.totalAllergies}
          description="Alergias confirmadas"
          icon={Shield}
          color="text-purple-600"
          bg="bg-purple-50"
        />
        <StatCard
          title="Riesgo Alto"
          value={statistics.highRiskAllergies}
          description="Requieren atención especial"
          icon={AlertTriangle}
          color="text-red-600"
          bg="bg-red-50"
        />
        <StatCard
          title="Categorías Afectadas"
          value={statistics.categoriesWithAllergies.length}
          description={statistics.categoriesWithAllergies.join(', ')}
          icon={Activity}
          color="text-blue-600"
          bg="bg-blue-50"
        />
        <StatCard
          title="Última Prueba"
          value={lastTestDate ? medicalUtils.formatMedicalDate(lastTestDate) : 'No registrada'}
          description="Test más reciente"
          icon={Calendar}
          color="text-green-600"
          bg="bg-green-50"
        />
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Actividad Médica Reciente
          </CardTitle>
          <CardDescription>
            Pruebas y reacciones de los últimos 30 días
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {statistics.recentTests.length > 0 ? (
              statistics.recentTests.map((test) => (
                <div key={test.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-lg">
                      {medicalUtils.getTestTypeIcon(test.testType)}
                    </div>
                    <div>
                      <div className="font-medium">{test.allergen}</div>
                      <div className="text-sm text-muted-foreground">
                        {medicalUtils.formatMedicalDate(test.date)} • {test.testType.replace('-', ' ')}
                      </div>
                    </div>
                  </div>
                  <Badge variant={test.result === 'positive' ? 'destructive' : 'secondary'}>
                    {test.result === 'positive' ? 'Positivo' : 'Negativo'}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No hay pruebas recientes registradas
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Risk Factors and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Factores de Riesgo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {riskAssessment.riskFactors.map((factor, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm">{factor}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Recomendaciones Médicas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {riskAssessment.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm">{recommendation}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Emergency Information */}
      <Card className="border-2 border-red-200 bg-red-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <Phone className="h-5 w-5" />
            Información de Emergencia
          </CardTitle>
          <CardDescription>
            Datos críticos para atención médica de emergencia
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="font-medium text-red-700">Alergias Críticas:</div>
              <div className="text-sm">
                {statistics.severeReactions.length > 0 ? (
                  statistics.severeReactions.map(reaction => reaction.allergen).join(', ')
                ) : (
                  'Ninguna registrada'
                )}
              </div>
            </div>
            <div className="space-y-2">
              <div className="font-medium text-red-700">Acciones en Emergencia:</div>
              <div className="text-sm space-y-1">
                <div>1. Administrar EpiPen si disponible</div>
                <div>2. Llamar emergencias (112)</div>
                <div>3. Contactar al alergólogo</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

MedicalDashboard.displayName = 'MedicalDashboard';

export { MedicalDashboard };