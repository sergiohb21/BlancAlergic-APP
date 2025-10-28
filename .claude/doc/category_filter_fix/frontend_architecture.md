# Plan de Arquitectura Frontend: Corrección del Filtrado por Categorías

## Resumen Ejecutivo

Problema crítico identificado en el componente `InputSearch.tsx` donde el filtrado por categorías no muestra todos los elementos de una categoría como necesita la usuaria Blanca para tomar decisiones informadas sobre su dieta.

## Análisis Técnico del Problema

### Estado Actual
```typescript
// Líneas 78-82 - PROBLEMA: Siempre filtra por isAlergic
const results = allergies.filter(
  (allergy) =>
    allergy.isAlergic &&  // ❌ Esto evita ver no-alérgicos
    allergy.name.toLowerCase().includes(localQuery.toLowerCase())
);

// Líneas 198-200 - PROBLEMA: Solo establece query, no cambia modo
onClick={() => {
  setLocalQuery(category.toLowerCase());
}}
```

### Impacto en Usuario
- Blanca no puede ver qué alimentos de una categoría SÍ puede consumir
- No tiene contexto completo para tomar decisiones informadas
- La experiencia es frustrante y poco útil

## Solución Arquitectónica Propuesta

### 1. Nuevo Estado del Componente

```typescript
interface SearchState {
  searchMode: 'name' | 'category';
  selectedCategory: string | null;
  localQuery: string;
  filteredResults: AlergiaType[];
  showResults: boolean;
}
```

### 2. Lógica de Filtrado Diferenciada

```typescript
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
```

### 3. Manejadores de Eventos Separados

```typescript
const handleCategoryClick = useCallback((category: string) => {
  setSearchMode('category');
  setSelectedCategory(category.toLowerCase());
  setLocalQuery(category.toLowerCase());
  setShowResults(true);
}, []);

const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  setLocalQuery(value);
  setSearchMode('name'); // Cambiar a modo nombre al escribir
  setSelectedCategory(null);
}, []);

const clearSearch = useCallback(() => {
  setLocalQuery('');
  setShowResults(false);
  setSearchMode('name');
  setSelectedCategory(null);
  setSearchQuery('');
}, [setSearchQuery]);
```

### 4. Mejoras UI/UX

#### Indicadores Visuales del Modo Activo
```typescript
{showResults && (
  <div className="flex items-center justify-between mb-4">
    <Badge variant={searchMode === 'category' ? 'default' : 'outline'}>
      {searchMode === 'category'
        ? `Categoría: ${selectedCategory}`
        : 'Búsqueda por nombre'
      }
    </Badge>
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setSearchMode('name')}
      className="text-sm"
    >
      Cambiar a búsqueda por nombre
    </Button>
  </div>
)}
```

#### Estadísticas Contextuales
```typescript
<div className="flex items-center justify-between">
  <h2 className="text-xl font-semibold text-foreground">
    Resultados ({filteredResults.length})
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
```

#### Mejora en Componente AllergyCard
```typescript
function AllergyCard({ allergy, showCategoryInfo = false }: {
  allergy: AlergiaType;
  showCategoryInfo?: boolean;
}) {
  return (
    <Card className={`hover:shadow-md transition-shadow duration-200 ${
      !allergy.isAlergic ? 'border-green-200 dark:border-green-800' : ''
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
          <CardDescription className="text-sm text-green-600 dark:text-green-400">
            ✅ Blanca puede consumir este alimento
          </CardDescription>
        )}
      </CardContent>
    </Card>
  );
}
```

### 5. Accesibilidad Mejorada

```typescript
// ARIA labels y roles
<div
  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2"
  role="tablist"
  aria-label="Categorías de alergias"
>
  {categories.map((category) => (
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

// Results container
<div
  id="search-results"
  role="tabpanel"
  aria-label={`Resultados de ${searchMode === 'category' ? 'categoría' : 'búsqueda'}`}
>
  {/* Results content */}
</div>
```

## Implementación Paso a Paso

### Phase 1: Lógica Core (CRÍTICO)
1. Añadir nuevos estados: `searchMode`, `selectedCategory`
2. Implementar `getFilteredResults()` con lógica diferenciada
3. Crear `handleCategoryClick()` y modificar `handleInputChange()`
4. Actualizar `useEffect` para usar nueva lógica

### Phase 2: UI/UX Mejorado (ALTO)
1. Añadir indicadores visuales del modo activo
2. Implementar estadísticas contextuales
3. Mejorar componente `AllergyCard` para modo categoría
4. Añadir botón para cambiar entre modos

### Phase 3: Accesibilidad (MEDIO)
1. Implementar ARIA labels y roles
2. Mejorar navegación por teclado
3. Añadir screen reader announcements

### Phase 4: Performance (BAJO)
1. Optimizar useCallback y useMemo
2. Mejorar debouncing para búsquedas largas
3. Implementar virtualización si la lista crece mucho

## Validación y Testing

### Casos de Prueba
1. **Categoría Frutas**: Debe mostrar TODAS las frutas (alérgicas y no alérgicas)
2. **Búsqueda "fresa"**: Solo debe mostrar fresa si es alérgica
3. **Cambio entre modos**: Estado debe mantenerse consistente
4. **Accesibilidad**: Navegación por teclado funcional

### Métricas de Éxito
- ✅ Blanca puede ver qué alimentos SÍ puede consumir por categoría
- ✅ Búsqueda por nombre mantiene comportamiento original
- ✅ Transición clara entre modos de búsqueda
- ✅ Sin confusiones UX para el usuario

## Archivos a Modificar

### Principal
- `/src/components/InputSearch.tsx` - Implementación completa de la solución

### Secundarios (Opcional)
- `/src/types/allergy.ts` - Si necesitamos tipado adicional
- `/src/hooks/useSearch.ts` - Si extraemos la lógica a un hook

## Notas Importantes para Desarrolladores

1. **Preservar comportamiento existente**: La búsqueda por nombre debe funcionar exactamente igual
2. **Test data**: Considerar limpiar datos duplicados en `alergias.ts`
3. **Performance**: Usar `useCallback` para evitar re-renders innecesarios
4. **Consistencia**: Mantener estilo visual consistente con resto de la app
5. **Error handling**: Manejar casos edge donde no hay resultados

## Impacto Esperado

### Positivo
- Resuelve el problema principal de UX para Blanca
- Mantiene compatibilidad con búsqueda existente
- Mejora accesibilidad y usabilidad general
- Arquitectura más escalable para futuras mejoras

### Riesgos Mitigados
- Cambios mínimos al flujo existente
- Estados claramente separados para evitar bugs
- Fallbacks implementados para casos edge

Este plan proporciona una solución robusta que resuelve el problema inmediato de Blanca mientras mejora la arquitectura general del componente.