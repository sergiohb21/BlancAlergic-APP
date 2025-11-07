import * as React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  AlertTriangle,
  FlaskConical,
  Heart,
  Info,
  TestTube,
  User,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { MedicalRecord, TestResult, ReactionHistory } from '@/types/medical';
import { medicalUtils } from '@/lib/medical-data';
import { cn } from '@/lib/utils';

interface AllergyDetailCardProps {
  record: MedicalRecord;
  onEdit?: (record: MedicalRecord) => void;
  expanded?: boolean;
  onToggleExpanded?: () => void;
}

const cardVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as const
    }
  }
};

const riskLevelConfig = {
  low: { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', label: 'Bajo' },
  moderate: { color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', label: 'Moderado' },
  high: { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', label: 'Alto' },
  critical: { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', label: 'Crítico' }
};

const AllergyDetailCard: React.FC<AllergyDetailCardProps> = ({
  record,
  onEdit,
  expanded = false,
  onToggleExpanded
}) => {
  const [isExpanded, setIsExpanded] = React.useState(expanded);

  const handleToggleExpanded = React.useCallback(() => {
    setIsExpanded(!isExpanded);
    onToggleExpanded?.();
  }, [isExpanded, onToggleExpanded]);

  const riskLevel = React.useMemo(() => {
    const latestTest = record.testResults[record.testResults.length - 1];
    return latestTest ? medicalUtils.getRiskLevel(latestTest.kuaLevel) : 'low';
  }, [record.testResults]);

  const riskConfig = riskLevelConfig[riskLevel];

  const TestResultItem = React.memo(({ test }: { test: TestResult }) => (
    <div className="p-3 bg-muted/30 rounded-lg space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="text-lg">{medicalUtils.getTestTypeIcon(test.testType)}</div>
          <span className="font-medium text-sm">{test.testType.replace('-', ' ')}</span>
        </div>
        <Badge variant={test.result === 'positive' ? 'destructive' : 'secondary'} className="text-xs">
          {test.result === 'positive' ? 'Positivo' : 'Negativo'}
        </Badge>
      </div>
      <div className="text-xs text-muted-foreground space-y-1">
        <div>Fecha: {medicalUtils.formatMedicalDate(test.date)}</div>
        {test.kuaLevel && <div>KUA/L: {test.kuaLevel}</div>}
        {test.igeLevel && <div>IgE: {test.igeLevel} kU/L</div>}
        {test.doctor && <div>Médico: {test.doctor}</div>}
        {test.laboratory && <div>Laboratorio: {test.laboratory}</div>}
      </div>
      {test.notes && (
        <div className="text-xs p-2 bg-background rounded border">
          <strong>Notas:</strong> {test.notes}
        </div>
      )}
    </div>
  ));

  const ReactionItem = React.memo(({ reaction }: { reaction: ReactionHistory }) => (
    <div className="p-3 bg-red-50/30 rounded-lg space-y-2 border border-red-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="text-lg">{medicalUtils.getSeverityIcon(reaction.severity)}</div>
          <span className="font-medium text-sm">{reaction.severity === 'severe' ? 'Severa' : reaction.severity === 'moderate' ? 'Moderada' : 'Leve'}</span>
        </div>
        {reaction.medicalAttention && (
          <Badge variant="destructive" className="text-xs">
            Atención médica
          </Badge>
        )}
      </div>
      <div className="text-xs text-muted-foreground space-y-1">
        <div>Fecha: {medicalUtils.formatMedicalDate(reaction.date)}</div>
        <div>Contexto: {reaction.context}</div>
        <div>Síntomas: {reaction.symptoms.join(', ')}</div>
        <div>Tratamiento: {reaction.treatment}</div>
      </div>
    </div>
  ));

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      layout
    >
      <Card className={cn("overflow-hidden transition-all duration-300", riskConfig.border)}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CardTitle className="text-xl">{record.name}</CardTitle>
                <Badge variant="outline" className={cn(riskConfig.bg, riskConfig.color, riskConfig.border)}>
                  Riesgo {riskConfig.label}
                </Badge>
              </div>
              <CardDescription className="text-sm">
                Categoría: {record.category} • Diagnóstico: {medicalUtils.formatMedicalDate(record.recordDate)}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(record)}
                  className="flex items-center gap-1"
                >
                  <User className="h-3 w-3" />
                  Editar
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleExpanded}
                className="flex items-center gap-1"
              >
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                Detalles
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-xs text-muted-foreground">Estado</div>
                <div className={record.isAlergic ? "text-red-600 font-medium" : "text-green-600 font-medium"}>
                  {record.isAlergic ? 'ALÉRGICO' : 'SEGURO'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-xs text-muted-foreground">Intensidad</div>
                <div className="font-medium">{record.intensity}</div>
              </div>
            </div>
            {record.KUA_Litro && (
              <div className="flex items-center gap-2">
                <TestTube className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-xs text-muted-foreground">KUA/L</div>
                  <div className="font-medium">{record.KUA_Litro}</div>
                </div>
              </div>
            )}
          </div>

          {/* Cross-reactivity Warnings */}
          {record.crossReactivity.length > 0 && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <span className="font-medium text-sm text-yellow-800">Reactividad Cruzada</span>
              </div>
              <div className="text-xs text-yellow-700">
                Posible reacción con: {record.crossReactivity[0].crossReactiveWith.join(', ')}
              </div>
            </div>
          )}

          {/* Expanded Details */}
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <Separator />

              {/* Test Results */}
              {record.testResults.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <FlaskConical className="h-4 w-4 text-blue-600" />
                    <h4 className="font-medium text-sm">Resultados de Pruebas</h4>
                    <Badge variant="outline" className="text-xs">
                      {record.testResults.length}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {record.testResults.map((test) => (
                      <TestResultItem key={test.id} test={test} />
                    ))}
                  </div>
                </div>
              )}

              {/* Reaction History */}
              {record.reactionHistory.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <h4 className="font-medium text-sm">Historial de Reacciones</h4>
                    <Badge variant="destructive" className="text-xs">
                      {record.reactionHistory.length}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {record.reactionHistory.map((reaction) => (
                      <ReactionItem key={reaction.id} reaction={reaction} />
                    ))}
                  </div>
                </div>
              )}

              {/* Medical Notes */}
              {record.doctorNotes && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="h-4 w-4 text-blue-600" />
                    <h4 className="font-medium text-sm">Notas Médicas</h4>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">{record.doctorNotes}</p>
                  </div>
                </div>
              )}

              {/* Emergency Medications */}
              {record.medications.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <h4 className="font-medium text-sm">Medicamentos de Emergencia</h4>
                  </div>
                  <div className="space-y-2">
                    {record.medications.map((med) => (
                      <div key={med.id} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="font-medium text-sm">{med.name} - {med.dosage}</div>
                        <div className="text-xs text-red-700 mt-1">{med.instructions}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

AllergyDetailCard.displayName = 'AllergyDetailCard';

export { AllergyDetailCard };