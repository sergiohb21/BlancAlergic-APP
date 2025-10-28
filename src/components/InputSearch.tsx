import React, { useState, useEffect, useCallback } from 'react';
import { useAllergies } from '@/contexts/AppContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, CheckCircle, AlertTriangle, X } from 'lucide-react';
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

function AllergyCard({ allergy, showCategoryInfo = false }: {
  allergy: AlergiaType;
  showCategoryInfo?: boolean;
}) {
  return (
    <Card className={`hover:shadow-md transition-shadow duration-200 ${
      !allergy.isAlergic ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20' : ''
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{allergy.name}</CardTitle>
          <div className="flex items-center gap-2">
            {!allergy.isAlergic && (
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            )}
            {getIntensityIcon(allergy.intensity)}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {showCategoryInfo && (
            <Badge variant="outline">
              {allergy.category}
            </Badge>
          )}
          <Badge variant={allergy.isAlergic
            ? getIntensityVariant(allergy.intensity)
            : 'secondary'
          }>
            {allergy.isAlergic ? allergy.intensity : 'Seguro'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {allergy.KUA_Litro && (
          <CardDescription className="text-sm">
            Nivel de alergia: {allergy.KUA_Litro} KUA/L
          </CardDescription>
        )}
        {!allergy.isAlergic && (
          <CardDescription className="text-sm text-green-600 dark:text-green-400 mt-2">
            ✅ Blanca puede consumir este alimento
          </CardDescription>
        )}
      </CardContent>
    </Card>
  );
}

export default function InputSearch() {
  const { allergies, setSearchQuery, filterAllergies } = useAllergies();
  const [searchMode, setSearchMode] = useState<'name' | 'category'>('name');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [localQuery, setLocalQuery] = useState('');
  const [filteredResults, setFilteredResults] = useState<AlergiaType[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Optimized filtering logic
  const getFilteredResults = useCallback(() => {
    if (searchMode === 'category' && selectedCategory) {
      // MODO CATEGORÍA: TODOS los elementos de la categoría
      return allergies.filter(allergy =>
        allergy.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    } else if (searchMode === 'name' && localQuery.length > 3) {
      // MODO NOMBRE: Solo elementos alérgicos (comportamiento original)
      return allergies.filter(allergy =>
        allergy.isAlergic &&
        allergy.name.toLowerCase().includes(localQuery.toLowerCase())
      );
    }
    return [];
  }, [allergies, searchMode, selectedCategory, localQuery]);

  // Optimized debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      const results = getFilteredResults();

      if (searchMode === 'category' && selectedCategory) {
        // Para categorías, siempre mostrar resultados aunque estén vacíos
        setFilteredResults(results);
        setShowResults(true);
      } else if (searchMode === 'name') {
        // Para búsqueda por nombre, manejar según si hay resultados o no
        if (localQuery.length > 3 && results.length > 0) {
          setSearchQuery(localQuery);
          filterAllergies();
          setFilteredResults(results);
          setShowResults(true);
        } else if (localQuery.length > 3 && results.length === 0) {
          // Mostrar mensaje "no alérgico" cuando no hay resultados
          setFilteredResults([]);
          setShowResults(true);
        } else {
          setFilteredResults([]);
          setShowResults(false);
        }
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localQuery, searchMode, selectedCategory, getFilteredResults, setSearchQuery, filterAllergies]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalQuery(value);
    setSearchMode('name'); // Cambiar a modo nombre al escribir
    setSelectedCategory(null);
  };

  const handleCategoryClick = useCallback((category: string) => {
    setSearchMode('category');
    setSelectedCategory(category.toLowerCase());
    setLocalQuery(category.toLowerCase());

    // Para categorías, mostrar resultados inmediatamente sin esperar debouncing
    const results = allergies.filter(allergy =>
      allergy.category.toLowerCase() === category.toLowerCase()
    );
    setFilteredResults(results);
    setShowResults(true);
  }, [allergies]);

  const clearSearch = () => {
    setLocalQuery('');
    setShowResults(false);
    setSearchMode('name');
    setSelectedCategory(null);
    setSearchQuery('');
  };

  const switchToNameSearch = () => {
    setSearchMode('name');
    setSelectedCategory(null);
    setLocalQuery('');
    setShowResults(false);
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
            placeholder={searchMode === 'category'
              ? `Buscando en categoría: ${selectedCategory}...`
              : "Escribe el nombre de un alimento..."
            }
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

        {searchMode === 'name' && localQuery.length > 0 && localQuery.length <= 3 && (
          <p className="text-sm text-muted-foreground mt-2">
            Escribe al menos 4 caracteres para buscar...
          </p>
        )}
      </div>

      {/* Quick Categories */}
      {!showResults && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Buscar por categoría:</h3>
          <div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2"
            role="tablist"
            aria-label="Categorías de alergias"
          >
            {[
              'Crustáceos', 'Mariscos', 'Pescados', 'Frutas',
              'Vegetales', 'Frutos secos', 'Árboles', 'Hongos', 'Animales'
            ].map((category) => (
              <Button
                key={category}
                variant="outline"
                size="sm"
                onClick={() => handleCategoryClick(category)}
                role="tab"
                aria-selected={selectedCategory === category.toLowerCase()}
                aria-controls="search-results"
                className="justify-start text-sm"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Search Mode Indicator */}
      {showResults && (
        <div className="flex items-center justify-between mb-4">
          <Badge variant={searchMode === 'category' ? 'default' : 'outline'}>
            {searchMode === 'category'
              ? `Categoría: ${selectedCategory}`
              : 'Búsqueda por nombre'
            }
          </Badge>
          {searchMode === 'category' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={switchToNameSearch}
              className="text-sm"
            >
              <X className="h-4 w-4 mr-1" />
              Buscar por nombre
            </Button>
          )}
        </div>
      )}

      {/* Search Results */}
      {showResults && (
        <div className="space-y-4">
          {filteredResults.length > 0 ? (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">
                  {searchMode === 'category' ? 'Alimentos en esta categoría' : 'Resultados'} ({filteredResults.length})
                </h2>
                {searchMode === 'category' && (
                  <div className="flex gap-2">
                    <Badge variant="destructive">
                      Alérgicos: {filteredResults.filter(a => a.isAlergic).length}
                    </Badge>
                    <Badge variant="secondary">
                      Seguros: {filteredResults.filter(a => !a.isAlergic).length}
                    </Badge>
                  </div>
                )}
                {searchMode === 'name' && (
                  <Badge variant="outline">
                    Alérgico: Sí
                  </Badge>
                )}
              </div>

              {searchMode === 'category' ? (
                // Vista de categoría: mostrar alérgicos primero, luego seguros
                <div className="space-y-6">
                  {filteredResults.filter(a => a.isAlergic).length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-red-600 dark:text-red-400 mb-3">
                        ⚠️ No puede comer
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredResults
                          .filter(a => a.isAlergic)
                          .map((allergy, index: number) => (
                            <AllergyCard key={`alergic-${index}`} allergy={allergy} showCategoryInfo={false} />
                          ))
                        }
                      </div>
                    </div>
                  )}

                  {filteredResults.filter(a => !a.isAlergic).length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-green-600 dark:text-green-400 mb-3">
                        ✅ Sí puede comer
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredResults
                          .filter(a => !a.isAlergic)
                          .map((allergy, index: number) => (
                            <AllergyCard key={`safe-${index}`} allergy={allergy} showCategoryInfo={false} />
                          ))
                        }
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Vista normal de búsqueda por nombre
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredResults.map((allergy, index: number) => (
                    <AllergyCard key={index} allergy={allergy} />
                  ))}
                </div>
              )}
            </>
          ) : (
            <Card className="text-center p-8">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                    {searchMode === 'category' ? 'Categoría segura' : '¡Buena noticia!'}
                  </h3>
                  <p className="text-muted-foreground">
                    {searchMode === 'category'
                      ? `Blanca no tiene alergias en la categoría ${selectedCategory}`
                      : <>Blanca no es alérgica a <strong>{localQuery}</strong></>
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}