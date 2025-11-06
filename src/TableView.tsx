import React from "react";
import { Card} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAllergies } from "./hooks/useAllergies";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { AlergiaType } from "./const/alergias";
import { getIntensityVariantDetailed, getIntensityIconDetailed, getAccessibleColorClasses, getAllergyAriaProps, getAllergyStatusId } from "@/utils/allergy-utils";
import MedicalErrorBoundary from "@/components/MedicalErrorBoundary";

const AllergyTableCard = React.memo(({ allergy }: { allergy: AlergiaType }) => {
  const statusId = getAllergyStatusId(allergy.name);
  const ariaProps = getAllergyAriaProps(allergy.isAlergic, allergy.name, allergy.intensity);

  return (
    <Card
      className={`p-4 hover:shadow-md transition-shadow duration-200 ${getAccessibleColorClasses(allergy.isAlergic, allergy.intensity)}`}
      {...ariaProps}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-1">
            {allergy.name}
          </h3>
          <Badge variant={getIntensityVariantDetailed(allergy.intensity)} className="text-xs">
            {allergy.intensity}
          </Badge>
        </div>
        <div className="ml-2">
          {getIntensityIconDetailed(allergy.intensity)}
        </div>
      </div>

      {/* Hidden description for screen readers */}
      <div id={statusId} className="sr-only">
        {allergy.name} - {allergy.isAlergic
          ? `ALÉRGICO - Intensidad: ${allergy.intensity}. NO CONSUMIR`
          : 'SEGURO - Sin alergia detectada'
        }
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Categoría:</span>
          <span className="font-medium">{allergy.category}</span>
        </div>
        {allergy.KUA_Litro && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">KUA/Litro:</span>
            <span className="font-medium">{allergy.KUA_Litro}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Estado:</span>
          <span className={`font-medium ${allergy.isAlergic ? 'text-purple-600 dark:text-purple-400' : 'text-teal-600 dark:text-teal-400'}`}>
            {allergy.isAlergic ? '❌ ALÉRGICO' : '✅ SEGURO'}
          </span>
        </div>
      </div>
    </Card>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.allergy.name === nextProps.allergy.name &&
    prevProps.allergy.intensity === nextProps.allergy.intensity &&
    prevProps.allergy.category === nextProps.allergy.category &&
    prevProps.allergy.KUA_Litro === nextProps.allergy.KUA_Litro
  );
});

function TableView(): JSX.Element {
  const { allergies, filteredAllergies, sortBy, sortOrder, setSortBy, setSortOrder, filterAllergies } = useAllergies();
  
  const displayAllergies = filteredAllergies.length > 0 ? filteredAllergies : allergies.filter(a => a.isAlergic);

  // Calculate statistics
  const highRiskAllergies = displayAllergies.filter(a => a.intensity.toLowerCase() === 'alta' || a.intensity.toLowerCase() === 'alto').length;
  const totalAllergies = displayAllergies.length;

  const handleSort = (field: keyof AlergiaType) => {
    if (field === sortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    filterAllergies();
  };

  const getSortIcon = (field: keyof AlergiaType) => {
    if (field !== sortBy) return <ArrowUpDown className="h-4 w-4" />;
    return sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  
  return (
    <MedicalErrorBoundary componentName="TableView" showEmergencyInfo={true}>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-bold mb-2 text-foreground">📋 Tabla de Alergias</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Información detallada de tus alergias detectadas
          </p>
        </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="text-center p-4">
          <div className="text-2xl md:text-3xl font-bold text-red-600 dark:text-red-400">
            {highRiskAllergies}
          </div>
          <div className="text-xs md:text-sm text-muted-foreground">Riesgo Alto</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400">
            {totalAllergies}
          </div>
          <div className="text-xs md:text-sm text-muted-foreground">Total Alergias</div>
        </Card>
      </div>

      {/* Sorting Controls */}
      <div className="flex flex-wrap gap-2 justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleSort('name')}
          className="flex items-center gap-2 text-sm"
        >
          Nombre {getSortIcon('name')}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleSort('intensity')}
          className="flex items-center gap-2 text-sm"
        >
          Intensidad {getSortIcon('intensity')}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleSort('category')}
          className="flex items-center gap-2 text-sm"
        >
          Categoría {getSortIcon('category')}
        </Button>
      </div>

      {/* Allergy Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayAllergies.map((alergia, index) => (
          <AllergyTableCard
            key={`${alergia.name}-${alergia.intensity}-${index}`}
            allergy={alergia}
          />
        ))}
      </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          Mostrando {displayAllergies.length} alergias detectadas
        </div>
      </div>
    </MedicalErrorBoundary>
  );
}

export default TableView;
