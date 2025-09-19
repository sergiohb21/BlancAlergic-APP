# BlancAlergic-APP - Plan de Corrección de Errores

## Diagnóstico General

La aplicación ha sido parcialmente migrada de BeerCSS a shadcn/ui, pero existen varios errores críticos que impiden su funcionamiento correcto:

### **Estado Actual:**
- ✅ **Hecho**: Configuración básica de shadcn/ui y Tailwind CSS
- ✅ **Hecho**: Layout principal migrado a shadcn/ui
- ✅ **Hecho**: Sistema de temas y navegación
- ❌ **Pendiente**: Componentes específicos sin migrar
- ❌ **Pendiente**: Errores de TypeScript
- ❌ **Pendiente**: Estilos inconsistentes

## Errores Críticos Identificados

### **1. Errores de TypeScript (Prioridad ALTA)**

#### **1.1 Header.tsx - Tipo `any` en PWA**
**Archivo:** `src/components/layout/Header.tsx`
**Líneas:** 11, 15, 31
**Problema:** Uso de tipo `any` en lugar de tipos específicos para eventos PWA

**Solución:**
```typescript
// Reemplazar:
const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

// Por:
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
```

#### **1.2 AppContext.tsx - Declaraciones en case blocks**
**Archivo:** `src/contexts/AppContext.tsx`
**Líneas:** 75, 77
**Problema:** Declaraciones léxicas dentro de case blocks

**Solución:**
```typescript
// Reemplazar:
case 'FILTER_ALLERGIES':
  const { allergies, searchQuery, selectedCategory, selectedIntensity, sortBy, sortOrder } = state;
  // ... resto del código

// Por:
case 'FILTER_ALLERGIES': {
  const { allergies, searchQuery, selectedCategory, selectedIntensity, sortBy, sortOrder } = state;
  // ... resto del código
  break;
}
```

### **2. Migración Incompleta a shadcn/ui (Prioridad ALTA)**

#### **2.1 EmergencyView.tsx - Componente sin migrar**
**Archivo:** `src/EmergencyView.tsx`
**Problema:** Usa `CardVideo` con clases BeerCSS, no usa shadcn/ui

**Solución:**
```typescript
// Reemplazar:
import CardVideo from "./components/CardImg";

// Por:
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Phone } from 'lucide-react';

// Migrar componente a shadcn/ui con clases Tailwind
```

#### **2.2 CardImg.tsx - Componente obsoleto**
**Archivo:** `src/components/CardImg.tsx`
**Problema:** Componente con clases BeerCSS que debe ser reemplazado

**Solución:** Eliminar y reemplazar usos con componentes shadcn/ui

#### **2.3 TableView.tsx - Tabla sin migrar**
**Archivo:** `src/TableView.tsx`
**Problema:** Usa tabla HTML pura con clases BeerCSS

**Solución:**
```typescript
// Reemplazar:
<table className="stripes">

// Por:
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
```

### **3. Problemas de Estado y Arquitectura (Prioridad MEDIA)**

#### **3.1 TableView.tsx - Estado local inconsistente**
**Problema:** `TableView` usa estado local en lugar del contexto global

**Solución:** Migrar para usar `useAllergies()` del contexto global

#### **3.2 InputSearch.tsx - Lógica duplicada**
**Problema:** Maneja filtrado local y global simultáneamente

**Solución:** Consolidar en el contexto global

## Plan de Implementación

### **Fase 1: Corrección de Errores TypeScript (1-2 horas)**
1. **Header.tsx** - Corregir tipos PWA
2. **MobileNavigation.tsx** - Corregir tipos any
3. **AppContext.tsx** - Corregir declaraciones en case blocks
4. **Validar** - Ejecutar `npm run lint` para asegurar 0 errores

### **Fase 2: Migración Componentes shadcn/ui (2-3 horas)**
1. **EmergencyView.tsx** - Migrar a componentes shadcn/ui
2. **TableView.tsx** - Migrar a Table shadcn/ui
3. **Eliminar** - Componentes obsoletos (CardImg.tsx, Table.tsx)
4. **Actualizar** - Todos los estilos a Tailwind CSS

### **Fase 3: Normalización de Estado (1-2 horas)**
1. **TableView.tsx** - Migrar a contexto global
2. **InputSearch.tsx** - Simplificar lógica
3. **AppContext.tsx** - Optimizar reducers
4. **Probar** - Funcionalidad completa

### **Fase 4: Validación Final (1 hora)**
1. **Probar** - Todas las rutas y funcionalidades
2. **Verificar** - Estilos responsive y temas
3. **Validar** - Funcionalidad PWA
4. **Test** - Compartir en WhatsApp y otras features

## Archivos a Modificar

### **Modificar Existente:**
1. `src/components/layout/Header.tsx` - Corregir tipos PWA
2. `src/components/layout/MobileNavigation.tsx` - Corregir tipos any
3. `src/contexts/AppContext.tsx` - Corregir case blocks
4. `src/EmergencyView.tsx` - Migrar a shadcn/ui
5. `src/TableView.tsx` - Migrar a shadcn/ui y contexto global
6. `src/components/InputSearch.tsx` - Simplificar lógica
7. `src/components/CardImg.tsx` - Eliminar (reemplazar usos)
8. `src/components/Table.tsx` - Eliminar (reemplazar usos)

### **Crear Nuevos:**
1. Componente de emergencia con shadcn/ui (reemplazar CardImg)

## Tecnologías y Patrones

### **Stack Confirmado:**
- **React 18.3.1** con TypeScript 5.2.2
- **Vite** como build tool
- **shadcn/ui** para componentes UI
- **Tailwind CSS** para estilos
- **React Router DOM** para navegación
- **Context API** para manejo de estado
- **Lucide React** para iconos

### **Patrones de Arquitectura:**
- **Feature-based organization** - Componentes por característica
- **Context API + useReducer** - Manejo de estado global
- **Custom hooks** - Lógica reutilizable
- **TypeScript strict** - Tipado fuerte
- **Responsive design** - Mobile-first

## Validación

### **Criterios de Éxito:**
- [ ] **0 errores TypeScript/ESLint** (`npm run lint`)
- [ ] **Todas las rutas funcionales** (/buscarAlergias, /emergencias, /tablaAlergias)
- [ ] **Búsqueda y filtrado funcionales**
- [ ] **Tabla ordenable funcionando**
- [ ] **Protocolo de emergencia completo**
- [ ] **Cambios de tema (light/dark)**
- [ ] **PWA funcional**
- [ ] **Compartir en WhatsApp funcional**
- [ ] **Estilos consistentes en todos los componentes**

## Estimación de Tiempo

- **Fase 1:** 1-2 horas
- **Fase 2:** 2-3 horas
- **Fase 3:** 1-2 horas
- **Fase 4:** 1 hora
- **Total:** 5-8 horas

## Notas Importantes

1. **Mantener interfaz en español** - Todos los textos y mensajes
2. **Preservar PWA** - Funcionalidad de instalación y service workers
3. **GitHub Pages** - Mantener configuración de despliegue
4. **BasePath** - Mantener `/BlancAlergic-APP/` en todas las rutas
5. **Data integrity** - Preservar estructura de datos de alergias

## Pruebas Post-Corrección

1. **Pruebas funcionales:**
   - Navegación entre páginas
   - Búsqueda de alergias
   - Ordenamiento de tabla
   - Cambio de tema
   - Compartir en WhatsApp
   - Instalación PWA

2. **Pruebas de estilo:**
   - Responsive design (mobile, tablet, desktop)
   - Tema claro/oscuro
   - Consistencia visual
   - Accesibilidad

3. **Pruebas técnicas:**
   - Build exitoso (`npm run build`)
   - Lint sin errores (`npm run lint`)
   - Tipado correcto
   - Performance aceptable

---

Este plan asegura una corrección completa y sistemática de todos los errores identificados, manteniendo la funcionalidad existente y mejorando la calidad del código.