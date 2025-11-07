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
import { logger } from '@/utils/logger';
import jsPDF from 'jspdf';

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
    logger.info(`Exporting medical records as ${format}`);

    if (format === 'csv') {
      // Basic CSV export implementation
      const headers = ['Nombre', 'Categoría', 'Intensidad', 'KUA/Litro', 'Es Alérgica'];
      const csvData = allergies.map(allergy => [
        allergy.name,
        allergy.category,
        allergy.intensity,
        allergy.KUA_Litro?.toString() || 'N/A',
        allergy.isAlergic ? 'Sí' : 'No'
      ]);

      const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `historial_medico_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      logger.info('CSV export completed successfully');
    } else if (format === 'pdf') {
      // PDF export implementation using jsPDF
      logger.info('Starting PDF export with jsPDF');

      try {
        // Crear nueva instancia de jsPDF
        const doc = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });

        // Configurar fuentes
        doc.setFont('helvetica');

        // Función para añadir texto con soporte para español
        const addText = (text: string, x: number, y: number, size: number = 12, style: 'normal' | 'bold' = 'normal') => {
          doc.setFontSize(size);
          doc.setFont('helvetica', style);
          doc.text(text, x, y);
        };

        // Variables de página
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        let currentY = margin;

        // Función para agregar nueva página si es necesario
        const checkPageBreak = (requiredHeight: number = 10) => {
          if (currentY + requiredHeight > pageHeight - margin) {
            doc.addPage();
            currentY = margin;
            return true;
          }
          return false;
        };

        // Encabezado
        addText('Historial Medico de Alergias', pageWidth / 2, currentY, 20, 'bold');
        doc.text('(BlancAlergic App)', pageWidth / 2, currentY + 7, { align: 'center' });
        currentY += 20;

        // Línea separadora
        doc.setDrawColor(37, 99, 235);
        doc.setLineWidth(0.5);
        doc.line(margin, currentY, pageWidth - margin, currentY);
        currentY += 15;

        // Resumen
        addText('Resumen del Paciente:', margin, currentY, 14, 'bold');
        currentY += 10;

        const summaryInfo = [
          `Paciente: ${patientName || 'Blanca'}`,
          `Fecha: ${new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`,
          `Total de alergias: ${allergies.filter(a => a.isAlergic).length}`,
          `Alergias severas: ${allergies.filter(a => a.isAlergic && a.intensity === 'Alta').length}`,
          `Generado: ${new Date().toLocaleString('es-ES')}`
        ];

        summaryInfo.forEach(info => {
          addText(info, margin + 5, currentY, 11);
          currentY += 7;
        });

        currentY += 15;

        // Tabla de alergias
        checkPageBreak(30);
        addText('Tabla de Alergias:', margin, currentY, 14, 'bold');
        currentY += 10;

        // Encabezados de tabla
        const tableStartY = currentY;
        const colWidths = [60, 40, 25, 25, 25];
        const colPositions = [margin, margin + colWidths[0], margin + colWidths[0] + colWidths[1], margin + colWidths[0] + colWidths[1] + colWidths[2], margin + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3]];

        // Fondo de encabezados
        doc.setFillColor(37, 99, 235);
        doc.rect(margin, tableStartY - 5, pageWidth - (margin * 2), 8, 'F');

        // Texto de encabezados
        doc.setTextColor(255, 255, 255);
        const headers = ['Nombre', 'Categoria', 'Intensidad', 'KUA/Litro', 'Estado'];
        headers.forEach((header, index) => {
          addText(header, colPositions[index], tableStartY, 10, 'bold');
        });

        doc.setTextColor(0, 0, 0);
        currentY += 10;

        // Filas de datos
        const allergicAllergies = allergies.filter(a => a.isAlergic);

        allergicAllergies.forEach((allergy) => {
          checkPageBreak(8);

          // Color de fondo según intensidad
          if (allergy.intensity === 'Alta') {
            doc.setFillColor(254, 226, 226); // Rojo claro
          } else if (allergy.intensity === 'Media') {
            doc.setFillColor(255, 243, 205); // Amarillo claro
          } else {
            doc.setFillColor(212, 237, 218); // Verde claro
          }

          doc.rect(margin, currentY - 2, pageWidth - (margin * 2), 6, 'F');

          // Texto de la fila
          const truncatedName = allergy.name.length > 20 ? allergy.name.substring(0, 20) + '...' : allergy.name;
          addText(truncatedName, colPositions[0], currentY, 9);
          addText(allergy.category, colPositions[1], currentY, 9);
          addText(allergy.intensity, colPositions[2], currentY, 9);
          addText(allergy.KUA_Litro?.toFixed(1) || 'N/A', colPositions[3], currentY, 9);
          addText('Alérgica', colPositions[4], currentY, 9);

          currentY += 7;
        });

        // Pie de página
        currentY = pageHeight - 50;
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, currentY, pageWidth - margin, currentY);
        currentY += 10;

        addText('Aviso Importante:', margin, currentY, 11, 'bold');
        currentY += 7;

        const footerTexts = [
          'Este documento es informativo y no sustituye el consejo medico profesional.',
          'Generado por BlancAlergic App - ' + new Date().toLocaleString('es-ES'),
          'Para mas informacion, consulte con un especialista en alergias.'
        ];

        footerTexts.forEach(text => {
          const lines = doc.splitTextToSize(text, pageWidth - (margin * 2));
          lines.forEach((line: string) => {
            checkPageBreak(5);
            addText(line, margin, currentY, 9);
            currentY += 5;
          });
        });

        // Guardar el PDF
        const fileName = `historial_medico_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);

        logger.info('PDF export completed successfully');
      } catch (error) {
        logger.error({ error }, 'Error generating PDF with jsPDF');

        // Fallback a CSV si falla el PDF
        logger.info('Falling back to CSV export');

        const csvHeaders = ['Nombre', 'Categoría', 'Intensidad', 'KUA/Litro', 'Es Alérgica'];
        const csvData = allergies.map(allergy => [
          allergy.name,
          allergy.category,
          allergy.intensity,
          allergy.KUA_Litro?.toString() || 'N/A',
          allergy.isAlergic ? 'Sí' : 'No'
        ]);

        const csvContent = [
          csvHeaders.join(','),
          ...csvData.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `historial_medico_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        alert('La exportación PDF falló. Se ha descargado un archivo CSV en su lugar.');
      }
    }
  }, [allergies, patientName]);

  const handlePrint = React.useCallback(() => {
    logger.info('Printing medical records');

    // Basic print functionality using window.print
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Historial Médico - ${patientName || 'Blanca'}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #2563eb; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
            .header { margin-bottom: 30px; }
            .footer { margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Historial Médico de Alergias</h1>
            <p><strong>Paciente:</strong> ${patientName || 'Blanca'}</p>
            <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-ES')}</p>
            <p><strong>Total de alergias:</strong> ${allergies.filter(a => a.isAlergic).length}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Intensidad</th>
                <th>KUA/Litro</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              ${allergies.map(allergy => `
                <tr>
                  <td>${allergy.name}</td>
                  <td>${allergy.category}</td>
                  <td>${allergy.intensity}</td>
                  <td>${allergy.KUA_Litro || 'N/A'}</td>
                  <td>${allergy.isAlergic ? 'Alérgica' : 'No alérgica'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            <p>Generado por BlancAlergic App - ${new Date().toLocaleString('es-ES')}</p>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
      logger.info('Print completed successfully');
    } else {
      logger.error('Failed to open print window');
      alert('No se pudo abrir la ventana de impresión. Verifica que tu navegador permita ventanas emergentes.');
    }
  }, [allergies, patientName]);

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
          <p className="text-muted-foreground dark:text-gray-300 text-sm md:text-base mt-2">
            Sistema integral de gestión médica para {patientName}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
          <Button
            variant="outline"
            size="default"
            onClick={() => handleExport('pdf')}
            className="w-full sm:w-auto h-12 px-3 sm:px-4 flex items-center justify-center gap-2 text-xs sm:text-sm font-medium"
            aria-label="Exportar historial médico completo como PDF"
          >
            <Download className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <span className="hidden sm:inline font-medium">Exportar PDF</span>
            <span className="sm:hidden font-medium">PDF</span>
          </Button>
          <Button
            variant="outline"
            size="default"
            onClick={handlePrint}
            className="w-full sm:w-auto h-12 px-3 sm:px-4 flex items-center justify-center gap-2 text-xs sm:text-sm font-medium"
            aria-label="Imprimir historial médico completo"
          >
            <Printer className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <span className="hidden sm:inline font-medium">Imprimir</span>
            <span className="sm:hidden font-medium">Print</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="mt-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 relative z-10 bg-background">
          <TabsTrigger value="dashboard" className="flex items-center gap-2 py-3">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="records" className="flex items-center gap-2 py-3">
            <User className="h-4 w-4" />
            Registros
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-2 py-3">
            <Clock className="h-4 w-4" />
            Línea Tiempo
          </TabsTrigger>
          <TabsTrigger value="emergency" className="flex items-center gap-2 py-3">
            <AlertTriangle className="h-4 w-4" />
            Emergencia
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="mt-12 relative">
          <MedicalDashboard
            statistics={statistics}
            riskAssessment={riskAssessment}
            patientName={patientName}
            patientAge={patientAge}
            lastTestDate={statistics.lastTestDate}
          />
        </TabsContent>

        {/* Records Tab */}
        <TabsContent value="records" className="mt-12 space-y-6 relative">
          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-gray-400" />
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
            <p className="text-sm text-muted-foreground dark:text-gray-300">
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
            <div className="text-center py-12 text-muted-foreground dark:text-gray-400">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No se encontraron registros</h3>
              <p className="text-sm">Intenta ajustar los filtros o términos de búsqueda</p>
            </div>
          )}
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="mt-12 relative">
          <div className="text-center py-12 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Línea de Tiempo Médica</h3>
            <p className="text-sm">Esta función estará disponible próximamente</p>
          </div>
        </TabsContent>

        {/* Emergency Tab */}
        <TabsContent value="emergency" className="mt-12 relative">
          <div className="text-center py-12 text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Información de Emergencia</h3>
            <p className="text-sm">Esta función estará disponible próximamente</p>
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </motion.div>
  );
};

MedicalHistory.displayName = 'MedicalHistory';

export { MedicalHistory };