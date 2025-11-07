# Medical History System - Frontend Architecture Implementation Plan

## Executive Summary

This document provides a comprehensive frontend architecture plan for implementing a professional medical history system in the BlancAlergic allergy management application. The architecture leverages React 18.3.1 with TypeScript, Vite, and the existing component ecosystem to create a scalable, maintainable, and production-ready medical interface.

## Current Architecture Analysis

### Existing Strengths
- **Modern React Stack**: React 18.3.1 with TypeScript 5.2.2 and strict mode
- **Robust State Management**: Context API with Redux-like patterns using Reselect
- **Component Architecture**: Well-structured shadcn/ui components with Tailwind CSS
- **Accessibility**: Medical Error Boundary component with emergency information
- **Performance Optimizations**: Memoization, lazy loading, and efficient selectors
- **Testing Infrastructure**: Vitest with React Testing Library and comprehensive coverage

### Current State Management
```typescript
// Existing AppContext structure (consolidated)
interface AppState {
  allergies: AlergiaType[];           // Basic allergy data
  search: SearchState;                // Advanced search with filters
  sort: SortState;                    // Sorting configuration
  ui: UIState;                        // Global UI state
}

// Existing search capabilities
interface SearchState {
  query: string;
  mode: 'name' | 'category' | 'advanced';
  filters: {
    category: AllergyCategory | 'all';
    intensity: AllergyIntensity | 'all';
    isAlergicOnly: boolean;
    showSafeFoods: boolean;
  };
  results: SearchResultState;
  ui: SearchUIState;
}
```

## Proposed Medical History Architecture

### 1. Enhanced Data Structure Extensions

```typescript
// Medical-specific type extensions
interface MedicalRecord extends AlergiaType {
  id: string;
  patientId: string;
  recordedDate: Date;
  lastUpdated: Date;
  recordingPhysician?: string;
  testType: TestType;
  testLocation: string;
  clinicalNotes?: string;
  symptoms: Symptom[];
  severity: ReactionSeverity;
  crossReactiveAllergens: string[];
  recommendedTests?: TestRecommendation[];
  emergencyTreatment?: EmergencyTreatment;
  medicalCode?: string;               // ICD-10 or SNOMED CT codes
}

interface TestResult {
  id: string;
  allergenId: string;
  testDate: Date;
  testType: TestType;
  result: TestResultType;
  kuaValue?: number;
  igeLevel?: number;
  testingLab?: string;
  physicianNotes?: string;
  testMethod: string;
  referenceRange?: {
    min: number;
    max: number;
    unit: string;
  };
}

interface ReactionHistory {
  id: string;
  allergenId: string;
  reactionDate: Date;
  severity: ReactionSeverity;
  symptoms: Symptom[];
  exposureType: ExposureType;
  treatmentReceived: TreatmentReceived;
  medicalFacility?: string;
  followUpRequired: boolean;
}

interface RiskAssessment {
  overallRiskLevel: RiskLevel;
  anaphylaxisRisk: boolean;
  asthmaRisk: boolean;
  crossContaminationRisk: number; // 0-100
  dietaryRestrictions: DietaryRestriction[];
  emergencyActionPlan: EmergencyActionPlan;
  lastAssessmentDate: Date;
  nextReviewDate: Date;
  riskFactors: RiskFactor[];
}

// Enhanced enums for medical data
enum TestType {
  SKIN_PRICK = 'skin_prick',
  BLOOD_TEST = 'blood_test',
  ORAL_CHALLENGE = 'oral_challenge',
  PATCH_TEST = 'patch_test',
  COMPONENT_TEST = 'component_test',
  HISTORY_BASED = 'history_based'
}

enum ReactionSeverity {
  MILD = 'mild',
  MODERATE = 'moderate',
  SEVERE = 'severe',
  ANAPHYLAXIS = 'anaphylaxis'
}

enum RiskLevel {
  CRITICAL = 'critical',
  HIGH = 'high',
  MODERATE = 'moderate',
  LOW = 'low'
}
```

### 2. Component Architecture Design

#### 2.1 Feature-Based Structure
```
src/features/medical-history/
├── MedicalHistoryDashboard.tsx      # Main dashboard container
├── MedicalTimeline.tsx              # Historical timeline view
├── MedicalReports.tsx               # Reports and export panel
├── RiskAssessment.tsx               # Risk analysis dashboard
├── EmergencySummary.tsx             # Critical emergency info
├── components/
│   ├── medical-dashboard/
│   │   ├── VitalSignsCard.tsx
│   │   ├── StatisticsGrid.tsx
│   │   ├── EmergencyBanner.tsx
│   │   └── QuickActionsPanel.tsx
│   ├── medical-records/
│   │   ├── AllergyDetailCard.tsx
│   │   ├── TestResultsCard.tsx
│   │   ├── ReactionHistoryCard.tsx
│   │   └── CrossReferencePanel.tsx
│   ├── medical-timeline/
│   │   ├── TimelineEvent.tsx
│   │   ├── TimelineFilters.tsx
│   │   └── TimelineNavigation.tsx
│   ├── medical-visualization/
│   │   ├── RiskMatrixChart.tsx
│   │   ├── SeverityDistributionChart.tsx
│   │   ├── TimelineChart.tsx
│   │   └── KUATrendChart.tsx
│   ├── medical-export/
│   │   ├── ExportPanel.tsx
│   │   ├── PDFGenerator.tsx
│   │   ├── CSVExporter.tsx
│   │   └── PrintPreview.tsx
│   └── medical-search/
│       ├── AdvancedSearch.tsx
│       ├── SearchFilters.tsx
│       └── SearchResults.tsx
├── hooks/
│   ├── useMedicalData.ts            # Medical data management
│   ├── useRiskAssessment.ts         # Risk calculation logic
│   ├── useMedicalExport.ts          # Export functionality
│   ├── useMedicalTimeline.ts        # Timeline data processing
│   └── useMedicalSearch.ts          # Advanced medical search
└── types/
    ├── medical-records.ts
    ├── medical-export.ts
    ├── medical-visualization.ts
    └── medical-search.ts
```

#### 2.2 Component Design Patterns

##### Medical Dashboard Container
```typescript
// MedicalHistoryDashboard.tsx
interface MedicalHistoryDashboardProps {
  patientId: string;
  viewMode: 'overview' | 'detailed' | 'timeline' | 'reports';
}

const MedicalHistoryDashboard: React.FC<MedicalHistoryDashboardProps> = ({
  patientId,
  viewMode = 'overview'
}) => {
  const medicalData = useMedicalData(patientId);
  const riskAssessment = useRiskAssessment(patientId);
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <MedicalErrorBoundary
      componentName="MedicalHistoryDashboard"
      showEmergencyInfo={true}
    >
      <div className="medical-dashboard-container">
        {/* Patient Header with Emergency Info */}
        <MedicalPatientHeader
          patient={medicalData.patient}
          riskLevel={riskAssessment.overallRiskLevel}
        />

        {/* Critical Emergency Banner */}
        <EmergencyBanner
          criticalAllergies={riskAssessment.criticalAllergies}
          emergencyActionPlan={riskAssessment.emergencyActionPlan}
        />

        {/* Medical Navigation Tabs */}
        <MedicalTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabs={['overview', 'timeline', 'detailed-records', 'risk-assessment', 'reports']}
        />

        {/* Tab Content */}
        <MedicalTabContent activeTab={activeTab}>
          <MedicalTabPanel value="overview">
            <MedicalOverview data={medicalData} risk={riskAssessment} />
          </MedicalTabPanel>
          <MedicalTabPanel value="timeline">
            <MedicalTimeline patientId={patientId} />
          </MedicalTabPanel>
          {/* ... other panels */}
        </MedicalTabContent>
      </div>
    </MedicalErrorBoundary>
  );
};
```

##### Medical Data Hook
```typescript
// hooks/useMedicalData.ts
export function useMedicalData(patientId: string) {
  const { state, actions, dispatch } = useApp();

  // Memoized medical data processing
  const medicalRecords = useMemo(() => {
    return state.allergies
      .filter(allergy => allergy.isAlergic)
      .map(allergy => enhanceWithMedicalData(allergy));
  }, [state.allergies]);

  // Medical statistics calculation
  const statistics = useMemo(() => {
    return calculateMedicalStatistics(medicalRecords);
  }, [medicalRecords]);

  // Medical actions
  const medicalActions = useMemo(() => ({
    updateMedicalRecord: (recordId: string, updates: Partial<MedicalRecord>) => {
      dispatch({
        type: 'MEDICAL_UPDATE_RECORD',
        payload: { recordId, updates }
      });
    },
    addTestResult: (testResult: TestResult) => {
      dispatch({
        type: 'MEDICAL_ADD_TEST_RESULT',
        payload: testResult
      });
    },
    addReactionHistory: (reaction: ReactionHistory) => {
      dispatch({
        type: 'MEDICAL_ADD_REACTION',
        payload: reaction
      });
    }
  }), [dispatch]);

  return {
    medicalRecords,
    statistics,
    isLoading: state.ui.isLoading,
    error: state.ui.error,
    actions: medicalActions
  };
}
```

### 3. State Management Architecture

#### 3.1 Extended AppState for Medical Data
```typescript
// Extended AppState interface
interface MedicalAppState extends AppState {
  // Medical-specific data
  medical: {
    records: MedicalRecord[];
    testResults: TestResult[];
    reactions: ReactionHistory[];
    riskAssessment: RiskAssessment;
    patientInfo: PatientInfo;
  };

  // Medical UI state
  medicalUI: {
    activeView: 'overview' | 'timeline' | 'detailed' | 'reports';
    selectedRecordId?: string;
    timelineFilters: TimelineFilters;
    exportOptions: ExportOptions;
    printPreview: boolean;
  };

  // Medical search state
  medicalSearch: {
    query: string;
    filters: MedicalSearchFilters;
    results: MedicalSearchResult[];
    suggestions: MedicalSearchSuggestion[];
  };
}
```

#### 3.2 Medical Selectors with Reselect
```typescript
// selectors/medicalSelectors.ts
export const medicalSelectors = {
  // Medical records selectors
  getMedicalRecords: createSelector(
    [(state: MedicalAppState) => state.medical.records],
    (records) => records.sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime())
  ),

  getCriticalAllergies: createSelector(
    [
      (state: MedicalAppState) => state.medical.records,
      (state: MedicalAppState) => state.medical.riskAssessment
    ],
    (records, risk) => records.filter(record =>
      risk.overallRiskLevel === 'critical' ||
      record.severity === ReactionSeverity.ANAPHYLAXIS
    )
  ),

  // Medical statistics selectors
  getMedicalStatistics: createSelector(
    [
      (state: MedicalAppState) => state.medical.records,
      (state: MedicalAppState) => state.medical.testResults,
      (state: MedicalAppState) => state.medical.reactions
    ],
    (records, testResults, reactions) => ({
      totalAllergies: records.length,
      criticalAllergies: records.filter(r => r.severity === ReactionSeverity.SEVERE).length,
      recentTests: testResults.filter(t =>
        Date.now() - t.testDate.getTime() < (365 * 24 * 60 * 60 * 1000) // Last year
      ).length,
      totalReactions: reactions.length,
      severeReactions: reactions.filter(r =>
        r.severity === ReactionSeverity.SEVERE ||
        r.severity === ReactionSeverity.ANAPHYLAXIS
      ).length
    })
  ),

  // Timeline data selector
  getTimelineEvents: createSelector(
    [
      (state: MedicalAppState) => state.medical.records,
      (state: MedicalAppState) => state.medical.testResults,
      (state: MedicalAppState) => state.medical.reactions,
      (state: MedicalAppState) => state.medicalUI.timelineFilters
    ],
    (records, testResults, reactions, filters) => {
      const events = [
        ...records.map(r => ({ type: 'record', data: r, date: r.recordedDate })),
        ...testResults.map(t => ({ type: 'test', data: t, date: t.testDate })),
        ...reactions.map(r => ({ type: 'reaction', data: r, date: r.reactionDate }))
      ];

      return events
        .filter(event => passesTimelineFilters(event, filters))
        .sort((a, b) => b.date.getTime() - a.date.getTime());
    }
  )
};
```

### 4. Performance Optimization Strategies

#### 4.1 Component Memoization
```typescript
// Optimized medical components
const AllergyDetailCard = React.memo(({
  record,
  onUpdate
}: AllergyDetailCardProps) => {
  const handleUpdate = useCallback((updates: Partial<MedicalRecord>) => {
    onUpdate(record.id, updates);
  }, [record.id, onUpdate]);

  return (
    <Card className="medical-allergy-detail-card">
      <AllergyDetailHeader record={record} />
      <AllergyDetailContent record={record} onUpdate={handleUpdate} />
    </Card>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for medical data
  return (
    prevProps.record.id === nextProps.record.id &&
    prevProps.record.lastUpdated === nextProps.record.lastUpdated &&
    prevProps.record.severity === nextProps.record.severity
  );
});
```

#### 4.2 Virtual Scrolling for Large Datasets
```typescript
// Virtualized timeline component
const VirtualizedTimeline: React.FC<VirtualizedTimelineProps> = ({
  events,
  itemHeight = 120
}) => {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(
    throttle(() => {
      if (!containerRef.current) return;

      const { scrollTop, clientHeight } = containerRef.current;
      const start = Math.floor(scrollTop / itemHeight);
      const end = start + Math.ceil(clientHeight / itemHeight) + 5;

      setVisibleRange({ start, end });
    }, 16), // 60fps
    [itemHeight]
  );

  const visibleEvents = useMemo(() => {
    return events.slice(visibleRange.start, visibleRange.end);
  }, [events, visibleRange]);

  return (
    <div
      ref={containerRef}
      className="virtualized-timeline"
      onScroll={handleScroll}
      style={{ height: '600px', overflow: 'auto' }}
    >
      <div style={{ height: events.length * itemHeight, position: 'relative' }}>
        {visibleEvents.map((event, index) => (
          <TimelineEvent
            key={event.id}
            event={event}
            style={{
              position: 'absolute',
              top: (visibleRange.start + index) * itemHeight,
              height: itemHeight,
              width: '100%'
            }}
          />
        ))}
      </div>
    </div>
  );
};
```

#### 4.3 Efficient Data Aggregation
```typescript
// Optimized medical data processing
const useOptimizedMedicalData = (patientId: string) => {
  const { state } = useApp();

  // Memoized data transformations
  const processedData = useMemo(() => {
    const records = state.medical.records;
    const testResults = state.medical.testResults;
    const reactions = state.medical.reactions;

    // Use Web Workers for heavy computations
    const worker = new Worker('/workers/medicalDataProcessor.js');

    return new Promise((resolve) => {
      worker.postMessage({ records, testResults, reactions });
      worker.onmessage = (event) => {
        resolve(event.data);
        worker.terminate();
      };
    });
  }, [state.medical.records, state.medical.testResults, state.medical.reactions]);

  return processedData;
};
```

### 5. Medical Visualization Components

#### 5.1 Chart Integration with Recharts
```typescript
// Risk Matrix Chart
const RiskMatrixChart: React.FC<RiskMatrixChartProps> = ({
  riskData,
  onCellClick
}) => {
  const data = useMemo(() => {
    return riskData.map(item => ({
      probability: item.probability,
      severity: item.severityScore,
      riskLevel: item.riskLevel,
      allergen: item.allergen,
      color: getRiskColor(item.riskLevel)
    }));
  }, [riskData]);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ScatterChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="probability"
          name="Probability"
          domain={[0, 1]}
          label={{ value: 'Probability', position: 'insideBottom', offset: -10 }}
        />
        <YAxis
          dataKey="severity"
          name="Severity"
          domain={[0, 4]}
          label={{ value: 'Severity', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload[0]) {
              const data = payload[0].payload;
              return (
                <div className="risk-tooltip">
                  <p className="font-semibold">{data.allergen}</p>
                  <p>Probability: {(data.probability * 100).toFixed(1)}%</p>
                  <p>Severity: {data.severity}/4</p>
                  <p className={`text-${data.color}-600`}>
                    Risk Level: {data.riskLevel}
                  </p>
                </div>
              );
            }
            return null;
          }}
        />
        <Scatter
          name="Risk Assessment"
          dataKey="severity"
          fill="#8884d8"
          shape={({ cx, cy, payload }) => (
            <circle
              cx={cx}
              cy={cy}
              r={8}
              fill={payload.color}
              stroke="#fff"
              strokeWidth={2}
              className="cursor-pointer hover:opacity-80"
              onClick={() => onCellClick?.(payload)}
            />
          )}
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
};
```

#### 5.2 Medical Timeline Visualization
```typescript
// Medical Timeline with Gantt-style visualization
const MedicalTimelineChart: React.FC<MedicalTimelineChartProps> = ({
  events,
  onEventSelect
}) => {
  const processedEvents = useMemo(() => {
    return events.map((event, index) => ({
      id: event.id,
      type: event.type,
      title: getEventTitle(event),
      date: event.date,
      category: event.type,
      color: getEventColor(event.type),
      description: getEventDescription(event)
    }));
  }, [events]);

  return (
    <ResponsiveContainer width="100%" height={500}>
      <BarChart
        data={processedEvents}
        layout="horizontal"
        margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          type="number"
          domain={['dataMin', 'dataMax']}
          tickFormatter={(value) => new Date(value).toLocaleDateString()}
        />
        <YAxis
          type="category"
          dataKey="title"
          width={90}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload[0]) {
              const event = payload[0].payload;
              return (
                <div className="timeline-tooltip">
                  <p className="font-semibold">{event.title}</p>
                  <p>Date: {new Date(event.date).toLocaleDateString()}</p>
                  <p>Type: {event.type}</p>
                  <p>{event.description}</p>
                </div>
              );
            }
            return null;
          }}
        />
        <Bar
          dataKey="date"
          fill={(entry: any) => entry.color}
          onClick={(data) => onEventSelect?.(data)}
          className="cursor-pointer"
        />
      </BarChart>
    </ResponsiveContainer>
  );
};
```

### 6. Browser-Based Export Functionality

#### 6.1 PDF Generation with jsPDF and html2canvas
```typescript
// Medical PDF Export Service
class MedicalPDFExportService {
  private jsPDF: jsPDF;

  constructor() {
    this.jsPDF = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
  }

  async generateMedicalReport(data: MedicalReportData): Promise<void> {
    const pageWidth = this.jsPDF.internal.pageSize.getWidth();
    const pageHeight = this.jsPDF.internal.pageSize.getHeight();
    let yPosition = 20;

    // Header
    this.addMedicalHeader();
    yPosition += 40;

    // Patient Information
    this.addPatientInfo(data.patientInfo, yPosition);
    yPosition += 30;

    // Critical Allergies Section
    yPosition = await this.addCriticalAllergies(data.criticalAllergies, yPosition);

    // Medical Records Table
    yPosition = await this.addMedicalRecordsTable(data.records, yPosition);

    // Charts and Visualizations
    if (data.includeCharts) {
      yPosition = await this.addMedicalCharts(data.charts, yPosition);
    }

    // Footer
    this.addMedicalFooter();

    // Save the PDF
    this.jsPDF.save(`medical-report-${data.patientId}-${Date.now()}.pdf`);
  }

  private async addMedicalCharts(charts: ChartData[], yPosition: number): Promise<number> {
    for (const chart of charts) {
      const chartElement = document.getElementById(chart.elementId);
      if (chartElement) {
        const canvas = await html2canvas(chartElement);
        const imgData = canvas.toDataURL('image/png');

        const imgWidth = pageWidth - 40;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        if (yPosition + imgHeight > pageHeight - 20) {
          this.jsPDF.addPage();
          yPosition = 20;
        }

        this.jsPDF.addImage(imgData, 'PNG', 20, yPosition, imgWidth, imgHeight);
        yPosition += imgHeight + 10;
      }
    }
    return yPosition;
  }

  async generateEmergencyCard(data: EmergencyCardData): Promise<void> {
    // Wallet-sized emergency card format
    const emergencyPDF = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [85.6, 53.98] // Credit card size
    });

    emergencyPDF.setFontSize(8);
    emergencyPDF.text('EMERGENCY ALLERGY CARD', 5, 5);
    emergencyPDF.text(`Patient: ${data.patientName}`, 5, 10);
    emergencyPDF.text(`Critical Allergies: ${data.criticalAllergies.join(', ')}`, 5, 15);
    emergencyPDF.text('In case of emergency: Call 112 / Use EpiPen', 5, 20);

    emergencyPDF.save(`emergency-card-${data.patientId}.pdf`);
  }
}
```

#### 6.2 CSV Export for Medical Data
```typescript
// Medical CSV Export
export const exportMedicalDataToCSV = (data: MedicalExportData): void => {
  const headers = [
    'Allergen Name',
    'Severity',
    'Last Test Date',
    'KUA/Litro',
    'Test Type',
    'Symptoms',
    'Cross-Reactive Allergens',
    'Emergency Treatment'
  ];

  const csvContent = [
    headers.join(','),
    ...data.records.map(record => [
      record.name,
      record.severity,
      record.lastUpdated.toISOString().split('T')[0],
      record.KUA_Litro || '',
      record.testType,
      record.symptoms.map(s => s.name).join('; '),
      record.crossReactiveAllergens.join('; '),
      record.emergencyTreatment || ''
    ].map(field => `"${field}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `medical-data-${Date.now()}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
```

### 7. Advanced Medical Search Implementation

#### 7.1 Medical Search Filters
```typescript
// Advanced medical search interface
interface MedicalSearchFilters {
  // Basic filters
  allergenName: string;
  category: AllergyCategory | 'all';
  severity: ReactionSeverity | 'all';
  testType: TestType | 'all';

  // Medical-specific filters
  testDateRange: {
    start: Date | null;
    end: Date | null;
  };
  kuaRange: {
    min: number | null;
    max: number | null;
  };
  hasReactions: boolean | null;
  crossReactive: boolean;
  emergencyTreatment: boolean;

  // Symptom-based search
  symptoms: string[];
  exposureType: ExposureType | 'all';

  // Risk-based filters
  riskLevel: RiskLevel | 'all';
  anaphylaxisRisk: boolean;
}

// Advanced medical search hook
export const useMedicalSearch = (filters: MedicalSearchFilters) => {
  const { state } = useApp();

  const searchResults = useMemo(() => {
    let results = state.medical.records;

    // Apply text search
    if (filters.allergenName.trim()) {
      results = results.filter(record =>
        record.name.toLowerCase().includes(filters.allergenName.toLowerCase()) ||
        record.clinicalNotes?.toLowerCase().includes(filters.allergenName.toLowerCase())
      );
    }

    // Apply category filter
    if (filters.category !== 'all') {
      results = results.filter(record => record.category === filters.category);
    }

    // Apply severity filter
    if (filters.severity !== 'all') {
      results = results.filter(record => record.severity === filters.severity);
    }

    // Apply test date range
    if (filters.testDateRange.start || filters.testDateRange.end) {
      results = results.filter(record => {
        const testDate = new Date(record.recordedDate);
        const afterStart = !filters.testDateRange.start || testDate >= filters.testDateRange.start;
        const beforeEnd = !filters.testDateRange.end || testDate <= filters.testDateRange.end;
        return afterStart && beforeEnd;
      });
    }

    // Apply KUA range filter
    if (filters.kuaRange.min !== null || filters.kuaRange.max !== null) {
      results = results.filter(record => {
        if (!record.KUA_Litro) return false;
        const aboveMin = !filters.kuaRange.min || record.KUA_Litro >= filters.kuaRange.min;
        const belowMax = !filters.kuaRange.max || record.KUA_Litro <= filters.kuaRange.max;
        return aboveMin && belowMax;
      });
    }

    // Apply symptom search
    if (filters.symptoms.length > 0) {
      results = results.filter(record =>
        filters.symptoms.some(symptom =>
          record.symptoms.some(s =>
            s.name.toLowerCase().includes(symptom.toLowerCase())
          )
        )
      );
    }

    // Apply cross-reactive filter
    if (filters.crossReactive) {
      results = results.filter(record => record.crossReactiveAllergens.length > 0);
    }

    return results;
  }, [state.medical.records, filters]);

  return { searchResults, totalResults: state.medical.records.length };
};
```

### 8. Accessibility Implementation (WCAG 2.1 AA)

#### 8.1 Medical Accessibility Components
```typescript
// Accessible medical information display
const AccessibleMedicalAlert: React.FC<AccessibleMedicalAlertProps> = ({
  type,
  title,
  message,
  emergencyContact
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      role="alert"
      aria-live={type === 'critical' ? 'assertive' : 'polite'}
      aria-atomic="true"
      className={`medical-alert medical-alert-${type}`}
    >
      <div className="alert-header">
        <h2 className="alert-title">{title}</h2>
        <button
          aria-expanded={isExpanded}
          aria-controls="alert-details"
          onClick={() => setIsExpanded(!isExpanded)}
          className="alert-toggle"
        >
          {isExpanded ? 'Show Less' : 'Show More'}
        </button>
      </div>

      <p className="alert-message">{message}</p>

      <div
        id="alert-details"
        aria-hidden={!isExpanded}
        hidden={!isExpanded}
        className="alert-details"
      >
        {emergencyContact && (
          <div className="emergency-contact">
            <span className="contact-label">Emergency Contact:</span>
            <a
              href={`tel:${emergencyContact.phone}`}
              className="contact-phone"
              aria-label={`Call emergency contact at ${emergencyContact.phone}`}
            >
              {emergencyContact.phone}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

// Accessible medical data table
const AccessibleMedicalTable: React.FC<AccessibleMedicalTableProps> = ({
  data,
  columns,
  title
}) => {
  const [sortColumn, setSortColumn] = useState<keyof MedicalRecord>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return 0;
    });
  }, [data, sortColumn, sortOrder]);

  const handleSort = (column: keyof MedicalRecord) => {
    const newOrder = sortColumn === column && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortColumn(column);
    setSortOrder(newOrder);
  };

  return (
    <div className="medical-table-container">
      <h2 className="table-title">{title}</h2>

      <table
        role="table"
        aria-label={title}
        aria-rowcount={sortedData.length + 1}
        className="medical-data-table"
      >
        <thead>
          <tr role="row">
            {columns.map((column) => (
              <th
                key={column.key}
                role="columnheader"
                aria-sort={
                  sortColumn === column.key
                    ? sortOrder === 'asc' ? 'ascending' : 'descending'
                    : 'none'
                }
              >
                <button
                  onClick={() => handleSort(column.key as keyof MedicalRecord)}
                  className="sort-button"
                  aria-label={`Sort by ${column.label} ${
                    sortColumn === column.key
                      ? sortOrder === 'asc' ? 'ascending' : 'descending'
                      : ''
                  }`}
                >
                  {column.label}
                  <span className="sort-indicator" aria-hidden="true">
                    {sortColumn === column.key && (
                      sortOrder === 'asc' ? ' ↑' : ' ↓'
                    )}
                  </span>
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, index) => (
            <tr key={row.id} role="row" aria-rowindex={index + 2}>
              {columns.map((column) => (
                <td
                  key={`${row.id}-${column.key}`}
                  role="gridcell"
                  data-label={column.label}
                >
                  {formatMedicalValue(row[column.key as keyof MedicalRecord], column.format)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {sortedData.length === 0 && (
        <div className="no-results" role="status" aria-live="polite">
          No medical records found matching the current filters.
        </div>
      )}
    </div>
  );
};
```

### 9. Print Optimization for Medical Reports

#### 9.1 Print-Friendly CSS
```css
/* src/styles/medical-print.css */
@media print {
  /* Page setup */
  @page {
    size: A4;
    margin: 1.5cm;
    orphans: 3;
    widows: 3;
  }

  /* Hide non-print elements */
  .no-print,
  .medical-tabs,
  .medical-navigation,
  button,
  input,
  select {
    display: none !important;
  }

  /* Medical report styling */
  .medical-report {
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
    color-adjust: exact;
  }

  /* Ensure text readability */
  .medical-report {
    font-size: 12pt;
    line-height: 1.4;
    color: #000;
    background: #fff;
  }

  /* Medical headers */
  .medical-header {
    border-bottom: 2pt solid #333;
    margin-bottom: 20pt;
    padding-bottom: 10pt;
  }

  /* Emergency information prominence */
  .emergency-banner {
    background: #ffebee !important;
    border: 2pt solid #f44336 !important;
    padding: 10pt;
    margin: 20pt 0;
    page-break-inside: avoid;
  }

  /* Medical tables */
  .medical-table {
    width: 100%;
    border-collapse: collapse;
    margin: 15pt 0;
  }

  .medical-table th,
  .medical-table td {
    border: 1pt solid #ccc;
    padding: 8pt;
    text-align: left;
  }

  .medical-table th {
    background: #f5f5f5 !important;
    font-weight: bold;
  }

  /* Avoid breaking important medical information */
  .critical-allergy,
  .emergency-treatment {
    page-break-inside: avoid;
  }

  /* Chart printing */
  .medical-chart {
    page-break-inside: avoid;
    margin: 20pt 0;
  }

  /* Print headers and footers */
  .print-header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 50pt;
    text-align: center;
    border-bottom: 1pt solid #ccc;
  }

  .print-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 30pt;
    text-align: center;
    border-top: 1pt solid #ccc;
    font-size: 10pt;
  }

  /* Page numbering */
  .page-number::after {
    content: "Page " counter(page);
  }

  /* Ensure proper spacing */
  .medical-section {
    page-break-inside: avoid;
    margin-bottom: 30pt;
  }

  /* Medical contact information */
  .medical-contact {
    background: #f8f9fa !important;
    border: 1pt solid #dee2e6 !important;
    padding: 10pt;
    margin: 15pt 0;
  }
}
```

#### 9.2 Print Service Implementation
```typescript
// Medical Print Service
class MedicalPrintService {
  private setupPrintStyles(): void {
    const printStyles = document.createElement('style');
    printStyles.textContent = `
      @media print {
        /* Print-specific styles injected here */
      }
    `;
    document.head.appendChild(printStyles);
  }

  async printMedicalReport(data: MedicalPrintData): Promise<void> {
    // Setup print styles
    this.setupPrintStyles();

    // Generate print content
    const printContent = await this.generatePrintContent(data);

    // Create print window
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Failed to open print window');
    }

    // Write content to print window
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Medical Report - ${data.patientName}</title>
          <style>
            /* Include print styles here */
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);

    printWindow.document.close();

    // Wait for content to load, then print
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  }

  private async generatePrintContent(data: MedicalPrintData): Promise<string> {
    return `
      <div class="medical-report">
        ${this.generateHeader(data)}
        ${this.generateEmergencyInfo(data)}
        ${this.generateMedicalRecords(data)}
        ${this.generateFooter(data)}
      </div>
    `;
  }

  private generateHeader(data: MedicalPrintData): string {
    return `
      <header class="medical-header">
        <h1>Medical Allergy Report</h1>
        <div class="patient-info">
          <p><strong>Patient:</strong> ${data.patientName}</p>
          <p><strong>Date of Birth:</strong> ${data.patientDateOfBirth}</p>
          <p><strong>Report Generated:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
      </header>
    `;
  }

  private generateEmergencyInfo(data: MedicalPrintData): string {
    const criticalAllergies = data.records.filter(r =>
      r.severity === ReactionSeverity.SEVERE ||
      r.severity === ReactionSeverity.ANAPHYLAXIS
    );

    return `
      <section class="emergency-banner">
        <h2>⚠️ EMERGENCY INFORMATION</h2>
        <div class="critical-allergies">
          <strong>CRITICAL ALLERGENS:</strong>
          <ul>
            ${criticalAllergies.map(a => `<li>${a.name} (${a.severity})</li>`).join('')}
          </ul>
        </div>
        <div class="emergency-treatment">
          <strong>IMMEDIATE ACTION:</strong> ${data.emergencyActionPlan}
        </div>
        <div class="emergency-contact">
          <strong>EMERGENCY CONTACT:</strong> ${data.emergencyPhone}
        </div>
      </section>
    `;
  }
}
```

### 10. Testing Strategy for Medical Components

#### 10.1 Medical Component Testing
```typescript
// Medical components testing setup
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MedicalHistoryDashboard } from '../MedicalHistoryDashboard';

// Mock medical data for testing
const mockMedicalData = {
  patient: {
    id: 'test-patient-1',
    name: 'Test Patient',
    dateOfBirth: '1990-01-01'
  },
  records: [
    {
      id: 'allergy-1',
      name: 'Peanuts',
      severity: 'severe',
      testType: 'blood_test',
      KUA_Litro: 15.5,
      crossReactiveAllergens: ['Other nuts', 'Legumes'],
      emergencyTreatment: 'Epinephrine auto-injector'
    }
  ],
  riskAssessment: {
    overallRiskLevel: 'high',
    criticalAllergies: ['Peanuts'],
    emergencyActionPlan: 'Use EpiPen immediately, call 112'
  }
};

describe('MedicalHistoryDashboard', () => {
  it('renders emergency information prominently', () => {
    render(<MedicalHistoryDashboard patientId="test-patient-1" />);

    // Check that emergency banner is present
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/EMERGENCY INFORMATION/i)).toBeInTheDocument();

    // Check critical allergens are displayed
    expect(screen.getByText(/Peanuts/i)).toBeInTheDocument();
    expect(screen.getByText(/severe/i)).toBeInTheDocument();
  });

  it('displays medical records accurately', async () => {
    render(<MedicalHistoryDashboard patientId="test-patient-1" />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Peanuts')).toBeInTheDocument();
    });

    // Check medical data accuracy
    expect(screen.getByText('15.5')).toBeInTheDocument(); // KUA value
    expect(screen.getByText('blood_test')).toBeInTheDocument(); // Test type
    expect(screen.getByText('Epinephrine auto-injector')).toBeInTheDocument(); // Treatment
  });

  it('provides accessible navigation', () => {
    render(<MedicalHistoryDashboard patientId="test-patient-1" />);

    // Check for proper ARIA labels
    expect(screen.getByRole('tablist')).toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(5); // Overview, Timeline, Detailed, Risk, Reports

    // Check keyboard navigation
    const firstTab = screen.getByRole('tab', { name: /overview/i });
    expect(firstTab).toHaveAttribute('tabindex', '0');
  });

  it('handles medical data updates correctly', async () => {
    const user = userEvent.setup();
    render(<MedicalHistoryDashboard patientId="test-patient-1" />);

    // Navigate to detailed records
    const detailedTab = screen.getByRole('tab', { name: /detailed records/i });
    await user.click(detailedTab);

    // Check that detailed view is active
    expect(screen.getByRole('tabpanel', { name: /detailed records/i })).toBeInTheDocument();
  });
});

// Medical export functionality testing
describe('Medical Export Service', () => {
  it('generates PDF report with correct medical data', async () => {
    const exportService = new MedicalPDFExportService();
    const mockData = {
      patientId: 'test-1',
      patientName: 'Test Patient',
      records: mockMedicalData.records,
      includeCharts: false
    };

    // Mock jsPDF methods
    const mockAddPage = jest.fn();
    const mockSave = jest.fn();
    jest.spyOn(require('jspdf'), 'jsPDF').mockImplementation(() => ({
      addPage: mockAddPage,
      save: mockSave,
      internal: { pageSize: { getWidth: () => 210, getHeight: () => 297 } },
      setFontSize: jest.fn(),
      text: jest.fn(),
      addImage: jest.fn()
    }));

    await exportService.generateMedicalReport(mockData);

    expect(mockSave).toHaveBeenCalledWith(
      expect.stringMatching(/medical-report-test-1-\d+\.pdf/)
    );
  });

  it('exports CSV data with correct formatting', () => {
    const data = {
      records: mockMedicalData.records
    };

    // Mock Blob and download functionality
    global.URL.createObjectURL = jest.fn();
    global.Blob = jest.fn().mockImplementation((content, options) => ({
      content,
      options
    }));

    exportMedicalDataToCSV(data);

    expect(global.Blob).toHaveBeenCalledWith(
      expect.stringContaining('Allergen Name,Severity'),
      { type: 'text/csv;charset=utf-8;' }
    );
  });
});
```

#### 10.2 Medical Accessibility Testing
```typescript
// Accessibility testing for medical components
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Medical Components Accessibility', () => {
  it('should not have accessibility violations', async () => {
    const { container } = render(<MedicalHistoryDashboard patientId="test-1" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('provides proper ARIA labels for medical information', () => {
    render(<MedicalHistoryDashboard patientId="test-1" />);

    // Emergency alert should have proper ARIA live region
    const emergencyAlert = screen.getByRole('alert');
    expect(emergencyAlert).toHaveAttribute('aria-live', 'assertive');
    expect(emergencyAlert).toHaveAttribute('aria-atomic', 'true');

    // Medical data table should be properly labeled
    const medicalTable = screen.getByRole('table');
    expect(medicalTable).toHaveAttribute('aria-label');
  });

  it('supports keyboard navigation for medical interfaces', async () => {
    const user = userEvent.setup();
    render(<MedicalHistoryDashboard patientId="test-1" />);

    // Test tab navigation
    await user.tab();
    expect(screen.getByRole('tab', { name: /overview/i })).toHaveFocus();

    await user.tab();
    expect(screen.getByRole('tab', { name: /timeline/i })).toHaveFocus();

    // Test arrow key navigation in tabs
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: /detailed records/i })).toHaveFocus();
  });

  it('provides sufficient color contrast for medical indicators', () => {
    // This would require a color contrast checking library
    // Example using color-contrast-checker
    const ColorContrastChecker = require('color-contrast-checker');
    const colorChecker = new ColorContrastChecker();

    // Check emergency red contrast
    expect(colorChecker.isLevelAA('#ffffff', '#dc2626', 14)).toBe(true);

    // Check medical green contrast
    expect(colorChecker.isLevelAA('#ffffff', '#16a34a', 14)).toBe(true);
  });
});
```

### 11. Implementation Phases and Timeline

#### Phase 1: Foundation and Core Components (Week 1-2)
1. **Data Structure Extensions**
   - Extend `AlergiaType` to `MedicalRecord`
   - Create medical-specific TypeScript interfaces
   - Update state management for medical data

2. **Core Medical Components**
   - `MedicalHistoryDashboard` container
   - `MedicalPatientHeader` with emergency info
   - `EmergencyBanner` component
   - Basic `VitalSignsCard` statistics

3. **Enhanced State Management**
   - Extend `AppState` with medical data
   - Create medical selectors with Reselect
   - Implement medical actions and reducers

#### Phase 2: Medical Data Display (Week 3-4)
1. **Detailed Medical Records**
   - `AllergyDetailCard` with comprehensive information
   - `TestResultsCard` for medical test history
   - `ReactionHistoryCard` for reaction tracking
   - `CrossReferencePanel` for related allergens

2. **Medical Timeline**
   - `MedicalTimeline` component
   - `TimelineEvent` visualization
   - Timeline filtering and navigation

3. **Medical Search Enhancement**
   - Advanced medical search filters
   - Medical-specific search logic
   - Search results optimization

#### Phase 3: Visualization and Export (Week 5-6)
1. **Medical Visualizations**
   - Risk assessment charts with Recharts
   - Timeline visualizations
   - KUA level trend charts
   - Severity distribution graphs

2. **Export Functionality**
   - PDF generation service
   - CSV export for medical data
   - Print optimization
   - Emergency card generation

3. **Performance Optimization**
   - Virtual scrolling for large datasets
   - Memoization of medical calculations
   - Lazy loading of medical components

#### Phase 4: Polish and Testing (Week 7-8)
1. **Accessibility Enhancement**
   - WCAG 2.1 AA compliance implementation
   - Screen reader testing
   - Keyboard navigation optimization
   - Color contrast validation

2. **Comprehensive Testing**
   - Unit tests for medical components
   - Integration tests for medical workflows
   - Accessibility testing
   - Performance testing

3. **Documentation and Deployment**
   - Medical component documentation
   - User guides for medical features
   - Deployment preparation
   - Final testing and validation

### 12. Files to Create/Modify

#### New Files (22 files)
```
src/features/medical-history/
├── MedicalHistoryDashboard.tsx              # Main dashboard
├── MedicalTimeline.tsx                      # Timeline component
├── MedicalReports.tsx                       # Reports panel
├── RiskAssessment.tsx                       # Risk dashboard
├── EmergencySummary.tsx                     # Emergency info
├── components/
│   ├── medical-dashboard/
│   │   ├── VitalSignsCard.tsx
│   │   ├── StatisticsGrid.tsx
│   │   ├── EmergencyBanner.tsx
│   │   └── QuickActionsPanel.tsx
│   ├── medical-records/
│   │   ├── AllergyDetailCard.tsx
│   │   ├── TestResultsCard.tsx
│   │   ├── ReactionHistoryCard.tsx
│   │   └── CrossReferencePanel.tsx
│   ├── medical-visualization/
│   │   ├── RiskMatrixChart.tsx
│   │   ├── SeverityDistributionChart.tsx
│   │   └── KUATrendChart.tsx
│   └── medical-export/
│       ├── ExportPanel.tsx
│       ├── PDFGenerator.tsx
│       └── CSVExporter.tsx
├── hooks/
│   ├── useMedicalData.ts
│   ├── useRiskAssessment.ts
│   ├── useMedicalExport.ts
│   └── useMedicalTimeline.ts
└── types/
    ├── medical-records.ts
    ├── medical-export.ts
    └── medical-visualization.ts
```

#### Modified Files (7 files)
1. `/src/TableView.tsx` → `/src/features/medical-history/MedicalHistoryDashboard.tsx`
2. `/src/const/alergias.ts` - Extend with medical-specific fields
3. `/src/contexts/AppContext.tsx` - Add medical state management
4. `/src/types/search.ts` - Extend with medical types
5. `/src/utils/searchSelectors.ts` - Add medical selectors
6. `/src/index.css` - Add medical theme variables and print styles
7. `/package.json` - Add dependencies for charts and PDF generation

### 13. Required Dependencies

```json
{
  "dependencies": {
    "recharts": "^2.12.7",
    "jspdf": "^2.5.1",
    "html2canvas": "^1.4.1",
    "date-fns": "^3.6.0",
    "react-window": "^1.8.8",
    "react-window-infinite-loader": "^1.0.9"
  },
  "devDependencies": {
    "@types/react-window": "^1.8.8",
    "@types/jspdf": "^2.3.0",
    "jest-axe": "^9.0.0",
    "color-contrast-checker": "^2.1.0"
  }
}
```

## Success Metrics

### Performance Metrics
- **Initial Load Time**: < 2 seconds for medical dashboard
- **Interaction Response**: < 500ms for medical data filtering
- **Memory Usage**: < 50MB for large medical datasets
- **Bundle Size**: < 200KB additional gzipped for medical features

### Accessibility Metrics
- **WCAG 2.1 AA Compliance**: 100% automated accessibility test pass rate
- **Keyboard Navigation**: Full functionality without mouse
- **Screen Reader Support**: All medical information announced correctly
- **Color Contrast**: All medical indicators meet 4.5:1 ratio

### Medical Accuracy Metrics
- **Data Integrity**: 100% accuracy in medical data display
- **Emergency Information**: Critical info always visible within 3 seconds
- **Cross-Reference Accuracy**: Complete allergen relationship mapping
- **Risk Assessment**: Clinically validated risk calculations

## Conclusion

This frontend architecture plan provides a comprehensive, production-ready foundation for implementing a professional medical history system. The architecture emphasizes:

1. **Scalability**: Modular component architecture supporting future medical features
2. **Performance**: Optimized rendering and data processing for large medical datasets
3. **Accessibility**: WCAG 2.1 AA compliance with medical-specific considerations
4. **Medical Accuracy**: Clinically validated data structures and displays
5. **Maintainability**: Clean TypeScript interfaces and well-documented components

The implementation leverages existing React patterns and infrastructure while adding medical-specific capabilities through a layered approach. The phased implementation allows for iterative development and testing, ensuring each component meets medical-grade standards before integration.

The architecture is designed to handle the complexity of medical data while maintaining the simplicity and usability required for emergency situations. With proper implementation following this plan, the BlancAlergic application will provide a professional, reliable, and accessible medical history interface suitable for clinical use.