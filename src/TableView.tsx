import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAllergies } from "./contexts/AppContext";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { AlergiaType } from "./const/alergias";

function TableView(): JSX.Element {
  const { allergies, filteredAllergies, sortBy, sortOrder, setSortBy, setSortOrder, filterAllergies } = useAllergies();
  
  const displayAllergies = filteredAllergies.length > 0 ? filteredAllergies : allergies;

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-foreground">Tabla de Alergias</h1>
        <p className="text-muted-foreground">
          Vista completa de las alergias detectadas con su información detallada
        </p>
      </div>
      
      <div className="rounded-md border dark:border-border/60 shadow-sm dark:shadow-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button 
                  variant="ghost" 
                  onClick={() => handleSort('name')}
                  className="h-auto p-0 font-semibold hover:bg-transparent text-foreground dark:text-foreground/90"
                >
                  <div className="flex items-center space-x-1">
                    <span>Nombre</span>
                    {getSortIcon('name')}
                  </div>
                </Button>
              </TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  onClick={() => handleSort('intensity')}
                  className="h-auto p-0 font-semibold hover:bg-transparent text-foreground dark:text-foreground/90"
                >
                  <div className="flex items-center space-x-1">
                    <span>Intensidad</span>
                    {getSortIcon('intensity')}
                  </div>
                </Button>
              </TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  onClick={() => handleSort('category')}
                  className="h-auto p-0 font-semibold hover:bg-transparent text-foreground dark:text-foreground/90"
                >
                  <div className="flex items-center space-x-1">
                    <span>Categoría</span>
                    {getSortIcon('category')}
                  </div>
                </Button>
              </TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  onClick={() => handleSort('KUA_Litro')}
                  className="h-auto p-0 font-semibold hover:bg-transparent text-foreground dark:text-foreground/90"
                >
                  <div className="flex items-center space-x-1">
                    <span>KUA/L</span>
                    {getSortIcon('KUA_Litro')}
                  </div>
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayAllergies.map((alergia, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium text-foreground">{alergia.name}</TableCell>
                <TableCell>
                  <Badge variant={getIntensityVariant(alergia.intensity)}>
                    {alergia.intensity}
                  </Badge>
                </TableCell>
                <TableCell>{alergia.category}</TableCell>
                <TableCell className="text-right">
                  {alergia.KUA_Litro}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <div className="mt-4 text-sm text-muted-foreground text-center">
        Mostrando {displayAllergies.length} alergias
      </div>
    </div>
  );
}

export default TableView;
