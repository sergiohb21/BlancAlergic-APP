import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  Filter,
  Download,
  Printer,
  AlertTriangle,
  Shield,
  User,
  FileText,
  BarChart3,
  Clock,
  ChevronDown
} from 'lucide-react';
import { MedicalDashboard } from './MedicalDashboard';
import { AllergyDetailCard } from './AllergyDetailCard';
import { MedicalStatistics, RiskAssessment } from '@/types/medical';
import { medicalUtils, createMedicalRecord } from '@/lib/medical-data';
import { useAllergies } from '@/hooks/useAllergies';
import { cn } from '@/lib/utils';

interface MedicalHistoryProps {
  patientName?: string;
  patientBirthDate?: Date;
}

const containerVariants = {
  initial: {
    opacity: 0
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1
    }
  }
};

const MedicalHistory: React.FC<MedicalHistoryProps> = ({
  patientName = 'Blanca',
  patientBirthDate = new Date('2010-05-15')
}) => {
  const { allergies } = useAllergies();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
  const [selectedRisk, setSelectedRisk] = React.useState<string>('all');
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const [expandedCards, setExpandedCards] = React.useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = React.useState(false);

  // Enhanced medical records with sample data
  const medicalRecords = React.useMemo(() => {
    return allergies
      .filter(allergy => allergy.isAlergic)
      .map(allergy => createMedicalRecord(allergy, 'PATIENT-001', patientName));
  }, [allergies, patientName]);

  // Calculate medical statistics
  const statistics: MedicalStatistics = React.useMemo(() => {
    const totalAllergies = medicalRecords.length;
    const highRiskAllergies = medicalRecords.filter(record =>
      record.intensity.toLowerCase() === 'alta' || record.intensity.toLowerCase() === 'alto'
    ).length;
    const categoriesWithAllergies = [...new Set(medicalRecords.map(record => record.category))];
    const recentTests = medicalRecords.flatMap(record =>
      record.testResults.filter(test => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return test.date > thirtyDaysAgo;
      })
    );
    const severeReactions = medicalRecords.flatMap(record =>
      record.reactionHistory.filter(reaction =>
        reaction.severity === 'severe' || reaction.severity === 'anaphylactic'
      )
    );
    const allTestDates = medicalRecords.flatMap(record => record.testResults.map(test => test.date));
    const lastTestDate = allTestDates.length > 0 ? new Date(Math.max(...allTestDates.map(date => date.getTime()))) : null;
    const nextTestDue = lastTestDate ? new Date(lastTestDate.getTime() + (365 * 24 * 60 * 60 * 1000)) : null;

    return {
      totalAllergies,
      highRiskAllergies,
      categoriesWithAllergies,
      recentTests,
      severeReactions,
      lastTestDate,
      nextTestDue
    };
  }, [medicalRecords]);

  // Risk assessment
  const riskAssessment: RiskAssessment = React.useMemo(() => {
    const overallRisk = statistics.highRiskAllergies > 2 ? 'critical' :
                       statistics.highRiskAllergies > 1 ? 'high' :
                       statistics.highRiskAllergies > 0 ? 'moderate' : 'low';

    const riskFactors = [];
    if (statistics.highRiskAllergies > 0) {
      riskFactors.push(`${statistics.highRiskAllergies} alergias de alto riesgo`);
    }
    if (statistics.severeReactions.length > 0) {
      riskFactors.push(`${statistics.severeReactions.length} reacciones severas registradas`);
    }
    if (!statistics.lastTestDate || new Date().getTime() - statistics.lastTestDate.getTime() > (365 * 24 * 60 * 60 * 1000)) {
      riskFactors.push('Pruebas de alergia desactualizadas');
    }

    const recommendations = [
      'Mantener EpiPen disponible en todo momento',
      'Evitar restaurantes con alto riesgo de contaminación cruzada',
      'Leer etiquetas de alimentos cuidadosamente',
      'Informar a escuela sobre alergias severas',
      'Realizar pruebas de seguimiento anualmente'
    ];

    if (statistics.highRiskAllergies > 0) {
      recommendations.unshift('Considerar bracelet de identificación médica');
    }

    return {
      overallRisk,
      riskFactors,
      recommendations,
      emergencyPreparedness: Math.min(100, (medicalRecords.filter(r => r.medications.length > 0).length / Math.max(medicalRecords.length, 1)) * 100)
    };
  }, [statistics, medicalRecords]);

  // Filtering logic
  const filteredRecords = React.useMemo(() => {
    let filtered = medicalRecords;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(record => record.category === selectedCategory);
    }

    // Risk filter
    if (selectedRisk !== 'all') {
      filtered = filtered.filter(record => {
        const latestTest = record.testResults[record.testResults.length - 1];
        if (!latestTest) return false;
        const riskLevel = medicalUtils.getRiskLevel(latestTest.kuaLevel);
        return riskLevel === selectedRisk;
      });
    }

    return filtered;
  }, [medicalRecords, searchTerm, selectedCategory, selectedRisk]);

  // Get unique categories for filter
  const categories = React.useMemo(() => {
    return [...new Set(medicalRecords.map(record => record.category))];
  }, [medicalRecords]);

  // Toggle card expansion
  const toggleCardExpansion = React.useCallback((recordId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(recordId)) {
        newSet.delete(recordId);
      } else {
        newSet.add(recordId);
      }
      return newSet;
    });
  }, []);

  // Export functionality
  const handleExport = React.useCallback((format: 'pdf' | 'csv') => {
    // TODO: Implement PDF/CSV export
    console.log(`Exporting medical records as ${format}`);
    alert(`Exportación en formato ${format.toUpperCase()} - Funcionalidad en desarrollo`);
  }, []);

  const handlePrint = React.useCallback(() => {
    // TODO: Implement print functionality
    console.log('Printing medical records');
    alert('Función de impresión - En desarrollo');
  }, []);

  const patientAge = medicalUtils.calculateAge(patientBirthDate);

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="container mx-auto px-4 py-6 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            Historial Médico Completo
          </h1>
          <p className="text-muted-foreground text-sm md:text-base mt-2">
            Sistema integral de gestión médica para {patientName}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('pdf')}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Exportar PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            Imprimir
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="records" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Registros
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Línea Tiempo
          </TabsTrigger>
          <TabsTrigger value="emergency" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Emergencia
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="mt-6">
          <MedicalDashboard
            statistics={statistics}
            riskAssessment={riskAssessment}
            patientName={patientName}
            patientAge={patientAge}
            lastTestDate={statistics.lastTestDate}
            onExport={handleExport}
            onPrint={handlePrint}
          />
        </TabsContent>

        {/* Records Tab */}
        <TabsContent value="records" className="mt-6 space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar alergias por nombre o categoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtros
              <ChevronDown className={cn("h-4 w-4 transition-transform", showFilters && "rotate-180")} />
            </Button>
          </div>

          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="p-4 bg-muted/50 rounded-lg space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Categoría</label>
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant={selectedCategory === 'all' ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => setSelectedCategory('all')}
                      >
                        Todas ({categories.length})
                      </Badge>
                      {categories.map(category => (
                        <Badge
                          key={category}
                          variant={selectedCategory === category ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => setSelectedCategory(category)}
                        >
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Nivel de Riesgo</label>
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant={selectedRisk === 'all' ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => setSelectedRisk('all')}
                      >
                        Todos
                      </Badge>
                      <Badge
                        variant={selectedRisk === 'low' ? 'default' : 'outline'}
                        className="cursor-pointer bg-green-100 text-green-800 hover:bg-green-200"
                        onClick={() => setSelectedRisk('low')}
                      >
                        Bajo
                      </Badge>
                      <Badge
                        variant={selectedRisk === 'moderate' ? 'default' : 'outline'}
                        className="cursor-pointer bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                        onClick={() => setSelectedRisk('moderate')}
                      >
                        Moderado
                      </Badge>
                      <Badge
                        variant={selectedRisk === 'high' ? 'default' : 'outline'}
                        className="cursor-pointer bg-red-100 text-red-800 hover:bg-red-200"
                        onClick={() => setSelectedRisk('high')}
                      >
                        Alto
                      </Badge>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results Summary */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Mostrando {filteredRecords.length} de {medicalRecords.length} registros
              {filteredRecords.length !== medicalRecords.length && ' (filtrados)'}
            </p>
          </div>

          {/* Medical Records Grid */}
          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence>
              {filteredRecords.map((record) => (
                <AllergyDetailCard
                  key={record.id}
                  record={record}
                  expanded={expandedCards.has(record.id)}
                  onToggleExpanded={() => toggleCardExpansion(record.id)}
                />
              ))}
            </AnimatePresence>
          </div>

          {filteredRecords.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No se encontraron registros</h3>
              <p className="text-sm">Intenta ajustar los filtros o términos de búsqueda</p>
            </div>
          )}
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="mt-6">
          <div className="text-center py-12 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Línea de Tiempo Médica</h3>
            <p className="text-sm">Esta función estará disponible próximamente</p>
          </div>
        </TabsContent>

        {/* Emergency Tab */}
        <TabsContent value="emergency" className="mt-6">
          <div className="text-center py-12 text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Información de Emergencia</h3>
            <p className="text-sm">Esta función estará disponible próximamente</p>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

MedicalHistory.displayName = 'MedicalHistory';

export { MedicalHistory };