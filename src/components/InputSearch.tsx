import React, { useState, useEffect } from 'react';
import { useAllergies } from '@/contexts/AppContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, CheckCircle, AlertTriangle } from 'lucide-react';
import { AlergiaType, AllergyIntensity } from '@/const/alergias';

function getIntensityVariant(intensity: AllergyIntensity) {
  switch (intensity) {
    case 'Alta':
      return 'destructive';
    case 'Media':
      return 'default';
    case 'Baja':
      return 'secondary';
    default:
      return 'outline';
  }
}

function getIntensityIcon(intensity: AllergyIntensity) {
  switch (intensity) {
    case 'Alta':
      return <AlertTriangle className="h-4 w-4 text-destructive" />;
    case 'Media':
      return <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />;
    case 'Baja':
      return <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />;
    default:
      return null;
  }
}

function AllergyCard({ allergy }: { allergy: AlergiaType }) {
  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{allergy.name}</CardTitle>
          {getIntensityIcon(allergy.intensity)}
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={getIntensityVariant(allergy.intensity)}>
            {allergy.intensity}
          </Badge>
          <Badge variant="outline">
            {allergy.category}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {allergy.KUA_Litro && (
          <CardDescription className="text-sm">
            Nivel de alergia: {allergy.KUA_Litro} KUA/L
          </CardDescription>
        )}
      </CardContent>
    </Card>
  );
}

export default function InputSearch() {
  const { allergies, setSearchQuery, filterAllergies } = useAllergies();
  const [localQuery, setLocalQuery] = useState('');
  const [filteredResults, setFilteredResults] = useState<AlergiaType[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Optimized debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localQuery.length > 3) {
        setSearchQuery(localQuery);
        filterAllergies();
        
        // Filter locally for immediate feedback
        const results = allergies.filter(
          (allergy) =>
            allergy.isAlergic &&
            allergy.name.toLowerCase().includes(localQuery.toLowerCase())
        );
        setFilteredResults(results);
        setShowResults(true);
      } else {
        setFilteredResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localQuery, allergies, setSearchQuery, filterAllergies]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setLocalQuery(value);
  };

  const clearSearch = () => {
    setLocalQuery('');
    setShowResults(false);
    setSearchQuery('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Search Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Buscar Alergias</h1>
        <p className="text-muted-foreground">
          Consulta si un alimento es alergénico para Blanca
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Escribe el nombre de un alimento..."
            value={localQuery}
            onChange={handleInputChange}
            className="pl-10 pr-10 h-12 text-base"
          />
          {localQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
            >
              ×
            </Button>
          )}
        </div>
        
        {localQuery.length > 0 && localQuery.length <= 3 && (
          <p className="text-sm text-muted-foreground mt-2">
            Escribe al menos 4 caracteres para buscar...
          </p>
        )}
      </div>

      {/* Search Results */}
      {showResults && (
        <div className="space-y-4">
          {filteredResults.length > 0 ? (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">
                  Resultados ({filteredResults.length})
                </h2>
                <Badge variant="outline">
                  Alérgico: Sí
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredResults.map((allergy, index: number) => (
                  <AllergyCard key={index} allergy={allergy} />
                ))}
              </div>
            </>
          ) : (
            <Card className="text-center p-8">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                    ¡Buena noticia!
                  </h3>
                  <p className="text-muted-foreground">
                    Blanca no es alérgica a <strong>{localQuery}</strong>
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Quick Categories */}
      {!showResults && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Buscar por categoría:</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {[
              'Crustaceos', 'Mariscos', 'Pescados', 'Frutas', 
              'Vegetales', 'Frutos secos', 'Árboles', 'Hongos', 'Animales'
            ].map((category) => (
              <Button
                key={category}
                variant="outline"
                size="sm"
                onClick={() => {
                  setLocalQuery(category.toLowerCase());
                }}
                className="justify-start text-sm"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}