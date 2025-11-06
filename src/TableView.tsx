import { Card} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAllergies } from "./hooks/useAllergies";
import { ArrowUpDown, ArrowUp, ArrowDown, AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";
import { AlergiaType } from "./const/alergias";

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

  const getIntensityVariant = (intensity: string) => {
    switch (intensity.toLowerCase()) {
      case 'alta':
      case 'alto':
        return 'destructive';
      case 'media':
      case 'medio':
        return 'default';
      case 'baja':
      case 'bajo':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getIntensityIcon = (intensity: string) => {
    switch (intensity.toLowerCase()) {
      case 'alta':
      case 'alto':
        return <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />;
      case 'media':
      case 'medio':
        return <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
      case 'baja':
      case 'bajo':
        return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />;
      default:
        return null;
    }
  };

  const getIntensityColor = (intensity: string) => {
    switch (intensity.toLowerCase()) {
      case 'alta':
      case 'alto':
        return 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20';
      case 'media':
      case 'medio':
        return 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/20';
      case 'baja':
      case 'bajo':
        return 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20';
      default:
        return 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/20';
    }
  };

  return (
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
          <Card key={index} className={`p-4 hover:shadow-md transition-shadow duration-200 ${getIntensityColor(alergia.intensity)}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  {alergia.name}
                </h3>
                <Badge variant={getIntensityVariant(alergia.intensity)} className="text-xs">
                  {alergia.intensity}
                </Badge>
              </div>
              <div className="ml-2">
                {getIntensityIcon(alergia.intensity)}
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Categoría:</span>
                <span className="font-medium">{alergia.category}</span>
              </div>
              {alergia.KUA_Litro && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">KUA/Litro:</span>
                  <span className="font-medium">{alergia.KUA_Litro}</span>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground">
        Mostrando {displayAllergies.length} alergias detectadas
      </div>
    </div>
  );
}

export default TableView;
