# BlancAlergic-APP: Migración de BeerCSS a shadcn/ui

## Análisis del Estado Actual

### Estructura del Proyecto
- **Framework**: Vite + React 18 + TypeScript
- **Estilos actuales**: BeerCSS (Material Design) + material-dynamic-colors
- **Rutas**: React Router DOM con basename `/BlancAlergic-APP/`
- **PWA**: Configurado con vite-plugin-pwa
- **Despliegue**: GitHub Pages

### Componentes Actuales (BeerCSS)
1. **Layout.tsx**: Layout principal con navegación, tema, PWA
2. **CardImg.tsx**: Componente de tarjeta con imagen
3. **InputSearch.tsx**: Campo de búsqueda con filtrado
4. **Table.tsx**: Tabla básica para resultados
5. **EmergencyView.tsx**: Vista de protocolo de emergencia
6. **TableView.tsx**: Vista de tabla con ordenamiento

### Clases CSS de BeerCSS Identificadas
- `fixed top responsive`, `flex space-between`, `padding`
- `field label prefix suffix`, `border round`
- `table-auto`, `stripes`
- `no-padding border round shadow`
- `purple white-text`, `dark white-text`

## Plan de Migración a shadcn/ui

### Fase 1: Configuración y Dependencias

#### 1.1 Dependencias Requeridas
```bash
# shadcn/ui y dependencias base
yarn add shadcn-ui class-variance-authority clsx tailwind-merge lucide-react

# Tailwind CSS
yarn add -D tailwindcss postcss autoprefixer

# Configuración adicional para tema
yarn add next-themes @radix-ui/react-slot

# Para tablas avanzadas
yarn add @tanstack/react-table
```

#### 1.2 Configuración de Tailwind CSS
Crear `tailwind.config.js`:
```javascript
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

#### 1.3 Variables CSS para Tema
Crear `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 270 81% 46%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 84% 4.9%;
    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96%;
    --accent-foreground: 222.2 84% 4.9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 270 81% 46%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 270 81% 46%;
    --primary-foreground: 210 40% 98%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 270 81% 46%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

#### 1.4 Configuración de shadcn/ui
Crear `src/lib/utils.ts`:
```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### Fase 2: Migración de Componentes

#### 2.1 Componentes shadcn/ui Requeridos
```bash
# Componentes base
npx shadcn@latest add button card input table badge

# Componentes de navegación
npx shadcn@latest add navigation-menu tabs sheet

# Componentes de tema
npx shadcn@latest add dropdown-menu switch

# Componentes adicionales
npx shadcn@latest add alert dialog separator
```

#### 2.2 Mapeo de Componentes BeerCSS → shadcn/ui

**Layout Principal (Layout.tsx)**
- **BeerCSS**: `nav`, `header`, `footer` con clases de BeerCSS
- **shadcn/ui**: `NavigationMenu`, `Sheet` (móvil), `DropdownMenu`, `Switch`

**Componente Card (CardImg.tsx)**
- **BeerCSS**: `article` con `border round shadow`
- **shadcn/ui**: `Card` + `CardHeader` + `CardContent` + `Button`

**Búsqueda (InputSearch.tsx)**
- **BeerCSS**: `field label prefix suffix`
- **shadcn/ui**: `Input` + `Search` icon + `Card` para resultados

**Tablas (Table.tsx, TableView.tsx)**
- **BeerCSS**: `table-auto`, `stripes`
- **shadcn/ui**: `Table` + `TableHeader` + `TableBody` + sorting con `@tanstack/react-table`

#### 2.3 Componentes a Crear/Modificar

**1. Proveedor de Tema**
Crear `src/components/theme-provider.tsx`:
```typescript
import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

**2. Layout Principal (Layout.tsx)**
```typescript
import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "next-themes"
import { Menu, Search, Home, Share2, Download, Moon, Sun } from "lucide-react"

interface LayoutProps {
  children: React.ReactNode
}

function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstallable, setIsInstallable] = useState(false)

  // ... lógica PWA existente

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 hidden md:flex">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger onClick={() => navigate("/")}>
                    BlancALergias
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-3 p-6 md:w-[400px] lg:w-[500px]">
                      {/* Navigation items */}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          
          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
              <div className="px-7">
                <Link className="flex items-center" to="/">
                  <span className="font-bold">BlancALergias</span>
                </Link>
              </div>
              {/* Mobile navigation */}
            </SheetContent>
          </Sheet>

          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              {/* Search button for mobile */}
            </div>
            <nav className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              >
                {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                <span className="sr-only">Toggle theme</span>
              </Button>
              {isInstallable && (
                <Button variant="ghost" size="icon" onClick={handleInstallClick}>
                  <Download className="h-4 w-4" />
                  <span className="sr-only">Install app</span>
                </Button>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="container py-6">
          {children}
          {location.pathname === "/" && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Feature cards */}
            </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t">
        <div className="container flex justify-around py-2">
          <Button variant="ghost" onClick={() => navigate("/")} className="flex flex-col items-center">
            <Home className="h-5 w-5" />
            <span className="text-xs">Inicio</span>
          </Button>
          <Button variant="ghost" onClick={() => navigate("/buscarAlergias")} className="flex flex-col items-center">
            <Search className="h-5 w-5" />
            <span className="text-xs">Alergias</span>
          </Button>
          <Button variant="ghost" onClick={handleShareWhatsApp} className="flex flex-col items-center">
            <Share2 className="h-5 w-5" />
            <span className="text-xs">Compartir</span>
          </Button>
        </div>
      </nav>

      {/* Footer */}
      <footer className="py-6 md:px-8 md:py-0 border-t">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              © {new Date().getFullYear()} BlancALergias | Todos los derechos reservados
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
```

**3. Componente Card Mejorado**
```typescript
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

interface FeatureCardProps {
  imgPath: string
  titleText: string
  infoText: string
  buttonAction: () => void
  buttonText: string
  badge?: string
}

function FeatureCard({
  imgPath,
  titleText,
  infoText,
  buttonAction,
  buttonText,
  badge
}: FeatureCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <div className="aspect-video relative">
        <Image
          src={imgPath}
          alt={titleText}
          fill
          className="object-cover"
        />
        {badge && (
          <Badge className="absolute top-2 right-2">
            {badge}
          </Badge>
        )}
      </div>
      <CardHeader>
        <CardTitle className="text-lg">{titleText}</CardTitle>
        <CardDescription>{infoText}</CardDescription>
      </CardHeader>
      <CardFooter>
        <Button onClick={buttonAction} className="w-full">
          {buttonText}
        </Button>
      </CardFooter>
    </Card>
  )
}
```

**4. Componente de Búsqueda Mejorado**
```typescript
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"
import { arrayAlergias as totalAlergias, AlergiaType } from "../const/alergias"

function SearchComponent() {
  const [input, setInput] = useState("")
  const [arrayAlergias] = useState<AlergiaType[]>(totalAlergias)
  const [arrayAlergiasFiltered, setArrayAlergiasFiltered] = useState<AlergiaType[]>([])

  useEffect(() => {
    const handleSearch = (inputValue: string) => {
      setArrayAlergiasFiltered(
        arrayAlergias.filter(
          (alergia) =>
            alergia.name.toLowerCase().includes(inputValue) && alergia.isAlergic
        )
      )
    }

    if (input.length > 3) {
      handleSearch(input)
    } else {
      setArrayAlergiasFiltered([])
    }
  }, [input, arrayAlergias])

  const getIntensityColor = (intensity: string) => {
    switch (intensity.toLowerCase()) {
      case "alta": return "destructive"
      case "media": return "default"
      case "baja": return "secondary"
      default: return "outline"
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Consulta un alimento (mínimo 4 caracteres)"
          value={input}
          onChange={(e) => setInput(e.target.value.toLowerCase())}
          className="pl-10"
        />
      </div>
      
      {input.length > 3 && (
        <div className="space-y-2">
          {arrayAlergiasFiltered.length > 0 ? (
            <div className="grid gap-2">
              {arrayAlergiasFiltered.map((alergia, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{alergia.name}</h4>
                        <p className="text-sm text-muted-foreground">{alergia.category}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={getIntensityColor(alergia.intensity)}>
                          {alergia.intensity}
                        </Badge>
                        {alergia.KUA_Litro && (
                          <Badge variant="outline">
                            {alergia.KUA_Litro} KUA/L
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-lg">
                  ¡Buena noticia! Blanca no es alérgica a <strong>{input}</strong>.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
```

**5. Componente de Tabla con Ordenamiento**
```typescript
import { useState, useMemo } from "react"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { arrayAlergias, AlergiaType } from "../const/alergias"
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"

function EnhancedTableView() {
  const [alergias, setAlergias] = useState<AlergiaType[]>([])
  const [orderBy, setOrderBy] = useState<keyof AlergiaType>('name')
  const [orderAsc, setOrderAsc] = useState(true)

  useEffect(() => {
    setAlergias(arrayAlergias.filter((alergia) => alergia.isAlergic))
  }, [])

  const handleSort = (field: keyof AlergiaType) => {
    if (field === orderBy) {
      setOrderAsc(!orderAsc)
    } else {
      setOrderBy(field)
      setOrderAsc(true)
    }
  }

  const sortedAlergias = useMemo(() => {
    return alergias.slice().sort((a, b) => {
      const aValue = a[orderBy]
      const bValue = b[orderBy]

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return orderAsc ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      } else {
        return orderAsc ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number)
      }
    })
  }, [alergias, orderBy, orderAsc])

  const getIntensityColor = (intensity: string) => {
    switch (intensity.toLowerCase()) {
      case "alta": return "destructive"
      case "media": return "default"
      case "baja": return "secondary"
      default: return "outline"
    }
  }

  const getSortIcon = (field: keyof AlergiaType) => {
    if (field !== orderBy) return <ArrowUpDown className="h-4 w-4" />
    return orderAsc ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableCaption>Tabla completa de alergias de Blanca</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('name')}
            >
              <div className="flex items-center gap-2">
                Nombre {getSortIcon('name')}
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('intensity')}
            >
              <div className="flex items-center gap-2">
                Intensidad {getSortIcon('intensity')}
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('category')}
            >
              <div className="flex items-center gap-2">
                Categoría {getSortIcon('category')}
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('KUA_Litro')}
            >
              <div className="flex items-center gap-2">
                KUA/L {getSortIcon('KUA_Litro')}
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedAlergias.map((alergia, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{alergia.name}</TableCell>
              <TableCell>
                <Badge variant={getIntensityColor(alergia.intensity)}>
                  {alergia.intensity}
                </Badge>
              </TableCell>
              <TableCell>{alergia.category}</TableCell>
              <TableCell>{alergia.KUA_Litro || '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
```

**6. Componente de Emergencia Mejorado**
```typescript
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Phone, AlertTriangle, Shield, Clock, Info } from "lucide-react"

interface EmergencyStep {
  imgPath: string
  titleText: string
  infoText: string
  moreInfo: string
  buttonAction: () => void
  buttonText: string
  priority: "high" | "medium" | "low"
}

function EnhancedEmergencyView() {
  const [showMoreInfo, setShowMoreInfo] = useState<{ [key: number]: boolean }>({})

  const steps: EmergencyStep[] = [
    {
      imgPath: "/Image/call-112.jpg",
      titleText: "Llamar al 112",
      infoText: "En caso de una reacción alérgica grave, lo primero que debe hacer es llamar al 112 para solicitar ayuda médica de emergencia.",
      moreInfo: "Marcar el 112 conectará directamente con los servicios de emergencia. Mantén la calma y explica claramente la situación.",
      buttonAction: () => (window.location.href = "tel:112"),
      buttonText: "Llamar ahora",
      priority: "high"
    },
    {
      imgPath: "/Image/identify-symptoms.png",
      titleText: "Identificar Síntomas",
      infoText: "Revise si la persona tiene síntomas de una reacción alérgica grave, como dificultad para respirar, hinchazón de la cara o labios, o erupciones en la piel.",
      moreInfo: "Los síntomas pueden variar, pero incluyen hinchazón, urticaria, dificultad para respirar y anafilaxia. La anafilaxia es una emergencia médica que requiere tratamiento inmediato.",
      buttonAction: () => toggleMoreInfo(1),
      buttonText: "Más información",
      priority: "high"
    },
    {
      imgPath: "/Image/epi-pen.jpg",
      titleText: "Usar EpiPen",
      infoText: "Si la persona tiene un EpiPen, administre la inyección de adrenalina en el muslo exterior. Esto puede ayudar a reducir los síntomas mientras espera la llegada de la ayuda médica.",
      moreInfo: "Asegúrese de seguir las instrucciones del EpiPen y mantenga la calma. La inyección debe administrarse en el muslo, a través de la ropa si es necesario.",
      buttonAction: () => toggleMoreInfo(2),
      buttonText: "Más información",
      priority: "medium"
    },
    {
      imgPath: "/Image/wait-help.jpg",
      titleText: "Esperar la Ayuda",
      infoText: "Mantenga a la persona cómoda y en una posición que facilite la respiración mientras espera la llegada de los servicios de emergencia.",
      moreInfo: "Intente mantener a la persona tranquila y vigilada en todo momento. Acuéstela sobre su espalda y eleve sus pies si es posible.",
      buttonAction: () => toggleMoreInfo(3),
      buttonText: "Más información",
      priority: "medium"
    }
  ]

  const toggleMoreInfo = (index: number) => {
    setShowMoreInfo(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "destructive"
      case "medium": return "default"
      case "low": return "secondary"
      default: return "outline"
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high": return <AlertTriangle className="h-4 w-4" />
      case "medium": return <Shield className="h-4 w-4" />
      case "low": return <Clock className="h-4 w-4" />
      default: return <Info className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertTitle className="text-red-800">Protocolo de Emergencia</AlertTitle>
        <AlertDescription className="text-red-700">
          Siga estos pasos en orden. En caso de reacción alérgica grave, cada minuto cuenta.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2">
        {steps.map((step, index) => (
          <Card key={index} className="overflow-hidden">
            <div className="aspect-video relative">
              <img
                src={step.imgPath}
                alt={step.titleText}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2">
                <Badge variant={getPriorityColor(step.priority)} className="gap-1">
                  {getPriorityIcon(step.priority)}
                  {step.priority === "high" ? "Alta Prioridad" : 
                   step.priority === "medium" ? "Prioridad Media" : "Prioridad Baja"}
                </Badge>
              </div>
            </div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {step.titleText}
                {getPriorityIcon(step.priority)}
              </CardTitle>
              <CardDescription>{step.infoText}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button 
                  onClick={step.buttonAction}
                  className="w-full"
                  variant={step.priority === "high" ? "destructive" : "default"}
                >
                  {step.buttonText === "Llamar ahora" && <Phone className="mr-2 h-4 w-4" />}
                  {step.buttonText}
                </Button>
                
                {showMoreInfo[index] && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Información Adicional</AlertTitle>
                    <AlertDescription>{step.moreInfo}</AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
```

### Fase 3: Actualización de Configuración

#### 3.1 Actualizar main.tsx
```typescript
import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom"
import { ThemeProvider } from "@/components/theme-provider"
import InputSearch from "./components/InputSearch"
import TableView from "./TableView"
import EmergencyView from "./EmergencyView"
import Layout from "./Layout"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <Router basename="/BlancAlergic-APP/">
        <Layout>
          <Routes>
            <Route path="/" element={<Outlet />} />
            <Route path="/buscarAlergias" element={<InputSearch />} />
            <Route path="/emergencias" element={<EmergencyView />} />
            <Route path="/tablaAlergias" element={<TableView />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  </React.StrictMode>
)
```

#### 3.2 Actualizar vite.config.ts
```typescript
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { VitePWA } from "vite-plugin-pwa"
import path from "path"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      manifest: {
        short_name: "BlancAlergic",
        name: "BlancAlergic App",
        icons: [
          {
            src: "icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
        start_url: "/BlancAlergic-APP/",
        background_color: "#ffffff",
        display: "standalone",
        scope: "/BlancAlergic-APP/",
        theme_color: "#7c3aed",
      },
      registerType: "autoUpdate",
      devOptions: {
        enabled: true,
      },
    }),
  ],
  base: "/BlancAlergic-APP/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
```

#### 3.3 Actualizar tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### Fase 4: Pruebas y Validación

#### 4.1 Validación de Funcionalidades
- [ ] Navegación entre rutas funciona correctamente
- [ ] Cambio de tema (claro/oscuro) funciona
- [ ] Búsqueda de alergias funciona correctamente
- [ ] Ordenamiento de tablas funciona
- [ ] PWA installation funciona
- [ ] Compartir por WhatsApp funciona
- [ ] Responsive design en móviles
- [ ] Despliegue a GitHub Pages

#### 4.2 Pruebas de Estilo
- [ ] Consistencia visual con diseño Material
- [ ] Colores y tipografía apropiados
- [ ] Espaciado y alineación correctos
- [ ] Estados hover/focus/active
- [ ] Accesibilidad (WCAG 2.1)

### Fase 5: Desafíos y Soluciones

#### 5.1 Mantener Estética Material Design
**Desafío**: shadcn/ui usa New York style, no Material Design
**Solución**: 
- Personalizar variables CSS para colores Material
- Ajustar border-radius y sombras
- Usar componentes específicos que imiten Material Design

#### 5.2 GitHub Pages con Basename
**Desafío**: Las rutas absolutas con basename `/BlancAlergic-APP/`
**Solución**: 
- Configurar basename en Router
- Ajustar base en vite.config.ts
- Verificar todas las rutas y enlaces

#### 5.3 PWA Compatibility
**Desafío**: shadcn/ui puede afectar el Service Worker
**Solución**: 
- Mantener configuración PWA existente
- Probar offline functionality
- Verificar manifest.json actualizado

#### 5.4 Performance
**Desafío**: shadcn/ui puede aumentar el bundle size
**Solución**: 
- Importar componentes individualmente
- Usar tree-shaking efectivo
- Optimizar imágenes y assets

### Fase 6: Implementación Gradual

#### 6.1 Estrategia de Migración
1. **Paso 1**: Configurar Tailwind CSS y shadcn/ui
2. **Paso 2**: Migrar componentes simples (Button, Input)
3. **Paso 3**: Migrar componentes complejos (Card, Table)
4. **Paso 4**: Actualizar Layout y navegación
5. **Paso 5**: Probar y optimizar
6. **Paso 6**: Desplegar y monitorear

#### 6.2 Rollback Plan
- Mantener versión BeerCSS en branch separado
- Documentar cambios para posible reversión
- Implementar feature flags para componentes críticos

## Conclusión

Esta migración transformará la aplicación de BeerCSS a shadcn/ui, manteniendo todas las funcionalidades existentes mientras se mejora:

1. **Mantenibilidad**: Componentes más consistentes y documentados
2. **Accesibilidad**: Mejor soporte WCAG 2.1
3. **Rendimiento**: Mejor tree-shaking y bundle optimization
4. **Experiencia de Desarrollo**: Tooling mejorado y TypeScript mejorado
5. **Diseño**: Sistema de diseño más consistente y moderno

La migración se realizará de forma gradual para minimizar riesgos y asegurar la continuidad del servicio.