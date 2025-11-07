import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Search,
  Filter,
  AlertTriangle,
  Shield,
  Eye,
  Download,
  Heart
} from 'lucide-react';
import { arrayAlergias } from '@/const/alergias';
import { cn } from '@/lib/utils';
import { logger } from '@/utils/logger';

interface AllergyType {
  name: string;
  isAlergic: boolean;
  intensity: string;
  category: string;
  KUA_Litro?: number;
}

interface AllergyTableSimpleProps {
  className?: string;
}

type SortField = 'name' | 'intensity' | 'category' | 'KUA_Litro';
type SortDirection = 'asc' | 'desc';

const AllergyTableSimple: React.FC<AllergyTableSimpleProps> = ({ className }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedIntensity, setSelectedIntensity] = useState<string>('all');
  const [showOnlyAlergic, setShowOnlyAlergic] = useState(false);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Accessibility refs
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = [...new Set(arrayAlergias.map((allergy: AllergyType) => allergy.category))];
    return cats.sort();
  }, []);

  // Filter and sort allergies
  const filteredAndSortedAllergies = useMemo(() => {
    let filtered = [...arrayAlergias];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((allergy: AllergyType) =>
        allergy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        allergy.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((allergy: AllergyType) => allergy.category === selectedCategory);
    }

    // Intensity filter
    if (selectedIntensity !== 'all') {
      filtered = filtered.filter((allergy: AllergyType) => allergy.intensity === selectedIntensity);
    }

    // Show only allergic
    if (showOnlyAlergic) {
      filtered = filtered.filter((allergy: AllergyType) => allergy.isAlergic);
    }

    // Sort
    filtered.sort((a: AllergyType, b: AllergyType) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'intensity':
          aValue = a.intensity;
          bValue = b.intensity;
          break;
        case 'category':
          aValue = a.category;
          bValue = b.category;
          break;
        case 'KUA_Litro':
          aValue = a.KUA_Litro || 0;
          bValue = b.KUA_Litro || 0;
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }

      let comparison = 0;
      if (aValue < bValue) comparison = -1;
      if (aValue > bValue) comparison = 1;

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [searchTerm, selectedCategory, selectedIntensity, showOnlyAlergic, sortField, sortDirection]);

  // Statistics
  const stats = useMemo(() => {
    const total = arrayAlergias.length;
    const allergic = arrayAlergias.filter((a: AllergyType) => a.isAlergic).length;
    const high = arrayAlergias.filter((a: AllergyType) => a.intensity === 'Alta' && a.isAlergic).length;
    const medium = arrayAlergias.filter((a: AllergyType) => a.intensity === 'Media' && a.isAlergic).length;
    const low = arrayAlergias.filter((a: AllergyType) => a.intensity === 'Baja' && a.isAlergic).length;

    return { total, allergic, high, medium, low };
  }, []);

  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField, sortDirection]);

  const exportData = useCallback(() => {
    logger.info('Exporting allergy table data');
    const csvContent = [
      ['Nombre', 'Categoría', 'Intensidad', 'KUA/Litro', 'Es Alérgico'],
      ...filteredAndSortedAllergies.map((allergy: AllergyType) => [
        allergy.name,
        allergy.category,
        allergy.intensity,
        allergy.KUA_Litro?.toString() || 'N/A',
        allergy.isAlergic ? 'Sí' : 'No'
      ])
    ].map((row: string[]) => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'alergias_blancalergic.csv';
    link.click();
  }, [filteredAndSortedAllergies]);

  // Keyboard navigation and shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts when not in input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Ctrl/Cmd + F for search focus
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }

      // Ctrl/Cmd + E for export
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        exportData();
      }

      // Ctrl/Cmd + 1 for category filter
      if ((e.ctrlKey || e.metaKey) && e.key === '1') {
        e.preventDefault();
        const categorySelect = document.querySelector('select[aria-label="Filtrar por categoría"]') as HTMLSelectElement;
        categorySelect?.focus();
      }

      // Ctrl/Cmd + 2 for intensity filter
      if ((e.ctrlKey || e.metaKey) && e.key === '2') {
        e.preventDefault();
        const intensitySelect = document.querySelector('select[aria-label="Filtrar por intensidad"]') as HTMLSelectElement;
        intensitySelect?.focus();
      }

      // Ctrl/Cmd + 3 for only allergic toggle
      if ((e.ctrlKey || e.metaKey) && e.key === '3') {
        e.preventDefault();
        setShowOnlyAlergic(prev => !prev);
      }

      // Arrow keys for sort navigation
      if (e.key === 'ArrowUp' && e.ctrlKey) {
        e.preventDefault();
        handleSort('name');
      }
      if (e.key === 'ArrowDown' && e.ctrlKey) {
        e.preventDefault();
        handleSort('intensity');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [exportData, handleSort]);

  const getIntensityColor = (intensity: string, isAlergic: boolean) => {
    if (!isAlergic) return 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';

    switch (intensity) {
      case 'Alta':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700';
      case 'Media':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700';
      case 'Baja':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    }
  };

  const getIntensityIcon = (intensity: string, isAlergic: boolean) => {
    if (!isAlergic) return null;

    if (intensity === 'Alta') return <AlertTriangle className="h-3 w-3" />;
    return <Shield className="h-3 w-3" />;
  };

  return (
    <div className={cn('space-y-6', className)} role="main" aria-label="Tabla de alergias">
      {/* Header with stats */}
      <header className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-primary" aria-hidden="true" />
              Tabla de Alergias Completa
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base mt-1">
              Registro completo de alergias y sensibilizaciones ({filteredAndSortedAllergies.length} de {stats.total} items)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportData}
              aria-label="Exportar datos de alergias a CSV"
            >
              <Download className="h-4 w-4 mr-2" aria-hidden="true" />
              <span className="hidden sm:inline">Exportar</span>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <section aria-label="Estadísticas de alergias" className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800">
            <CardContent className="p-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600 dark:text-red-300">{stats.allergic}</div>
                <div className="text-xs text-red-700 font-medium dark:text-red-400">Alérgicas</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800">
            <CardContent className="p-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-300">{stats.high}</div>
                <div className="text-xs text-yellow-700 font-medium dark:text-yellow-400">Alta</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
            <CardContent className="p-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-300">{stats.medium}</div>
                <div className="text-xs text-blue-700 font-medium dark:text-blue-400">Media</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
            <CardContent className="p-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-300">{stats.low}</div>
                <div className="text-xs text-green-700 font-medium dark:text-green-400">Baja</div>
              </div>
            </CardContent>
          </Card>
        </section>
      </header>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" aria-hidden="true" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-gray-400" aria-hidden="true" />
            <Input
              ref={searchInputRef}
              placeholder="Buscar alergias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              aria-label="Buscar alergias por nombre o categoría"
              autoComplete="off"
            />
          </div>

          {/* Simple Filter Controls */}
          <div className="flex flex-wrap gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-12 px-4 border rounded-md bg-background focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              aria-label="Filtrar por categoría"
            >
              <option value="all">Todas</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select
              value={selectedIntensity}
              onChange={(e) => setSelectedIntensity(e.target.value)}
              className="h-12 px-4 border rounded-md bg-background focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              aria-label="Filtrar por intensidad"
            >
              <option value="all">Todas</option>
              <option value="Alta">Alta</option>
              <option value="Media">Media</option>
              <option value="Baja">Baja</option>
            </select>

            <Button
              variant={showOnlyAlergic ? "default" : "outline"}
              onClick={() => setShowOnlyAlergic(!showOnlyAlergic)}
              className="h-12 px-4 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              aria-pressed={showOnlyAlergic}
              aria-label="Mostrar solo alergias confirmadas"
            >
              <Eye className="h-4 w-4 mr-2" aria-hidden="true" />
              Solo alérgicas
            </Button>

            <Button
              variant="outline"
              onClick={exportData}
              className="h-12 px-4 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              aria-label="Exportar datos filtrados como CSV"
            >
              <Download className="h-4 w-4 mr-2" aria-hidden="true" />
              Exportar
            </Button>
          </div>

          {/* Keyboard shortcuts - Desktop only */}
          <div className="hidden md:block">
            <div className="text-xs text-muted-foreground dark:text-gray-400 space-x-4">
              <span>Atajos:</span>
              <span><kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl</kbd>+<kbd className="px-1 py-0.5 bg-muted rounded text-xs">F</kbd> Buscar</span>
              <span><kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl</kbd>+<kbd className="px-1 py-0.5 bg-muted rounded text-xs">E</kbd> Exportar</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results - Simple Card View for All Devices */}
      <section aria-label="Resultados de alergias">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filteredAndSortedAllergies.map((allergy: AllergyType, index: number) => (
            <Card
              key={allergy.name}
              className={cn(
                "p-4 transition-all duration-200 hover:shadow-md hover:scale-[1.02]",
                allergy.isAlergic && allergy.intensity === 'Alta' && "border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/30"
              )}
              role="article"
              aria-label={`Tarjeta ${index + 1}: ${allergy.name}, ${allergy.intensity} intensidad, ${allergy.isAlergic ? 'alérgica' : 'no alérgica'}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 pr-2">
                  {allergy.isAlergic && getIntensityIcon(allergy.intensity, allergy.isAlergic)}
                  <h3 className={cn(
                    "font-semibold text-base leading-tight",
                    allergy.isAlergic ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {allergy.name}
                  </h3>
                </div>
                <Badge
                  variant={allergy.isAlergic ? "destructive" : "secondary"}
                  className={cn("text-xs shrink-0", !allergy.isAlergic && "dark:border-gray-600 dark:text-gray-400 dark:bg-gray-800/50")}
                >
                  {allergy.isAlergic ? 'Alérgica' : 'No'}
                </Badge>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground dark:text-gray-400 text-xs font-medium">
                    Categoría
                  </span>
                  <Badge variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-200 dark:bg-gray-800/50">
                    {allergy.category}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground dark:text-gray-400 text-xs font-medium">
                    Intensidad
                  </span>
                  <Badge
                    variant="outline"
                    className={cn("text-xs", getIntensityColor(allergy.intensity, allergy.isAlergic))}
                  >
                    {allergy.intensity}
                  </Badge>
                </div>

                {allergy.KUA_Litro && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground dark:text-gray-400 text-xs font-medium">
                      KUA/Litro
                    </span>
                    <span className="font-mono text-sm dark:text-gray-300 bg-muted/30 px-2 py-1 rounded">
                      {allergy.KUA_Litro.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </motion.div>
      </section>

      {filteredAndSortedAllergies.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No se encontraron alergias</h3>
              <p className="text-sm">Intenta ajustar los filtros o términos de búsqueda</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AllergyTableSimple;