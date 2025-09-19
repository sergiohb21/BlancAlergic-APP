# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React + TypeScript + Vite application called **BlancAlergic-APP** - an allergy management application designed to help track and manage food allergies for a user named Blanca. The application is deployed as a Progressive Web App (PWA) on GitHub Pages.

## Development Commands

```bash
npm run dev        # Start development server
npm run build      # Build for production (includes TypeScript compilation)
npm run lint       # Run ESLint with React and TypeScript rules
npm run preview    # Preview production build locally
npm run deploy     # Deploy to GitHub Pages using gh-pages
```

## Architecture Overview

### Framework & Stack
- **Frontend**: React 18.3.1 with TypeScript 5.2.2
- **Build Tool**: Vite 5.3.1 with custom configuration for PWA and GitHub Pages deployment
- **Styling**: BeerCSS (Material Design framework) with Material Dynamic Colors
- **Routing**: React Router DOM 6.24.0 with basename configuration for GitHub Pages
- **PWA**: vite-plugin-pwa with auto-update and custom manifest

### Key Features
1. **Allergy Search** - Search and filter allergens from a comprehensive database
2. **Emergency Protocol** - Step-by-step emergency procedures for allergic reactions
3. **Allergy Table** - Sortable table view of all confirmed allergies with medical data
4. **Dark/Light Theme** - Theme toggle with Material Dynamic Colors
5. **PWA Installation** - Native app installation prompts
6. **WhatsApp Sharing** - Direct sharing functionality

### Application Structure

#### Core Components
- **Layout** (`src/Layaout.tsx`) - Main app layout with navigation, theme toggle, and PWA installation
- **EmergencyView** (`src/EmergencyView.tsx`) - Emergency protocol display with interactive steps
- **TableView** (`src/TableView.tsx`) - Sortable allergy data table with filtering
- **InputSearch** (`src/components/InputSearch.tsx`) - Search interface for allergy lookup

#### Supporting Components
- **Table** (`src/components/Table.tsx`) - Reusable table component
- **CardImg** (`src/components/CardImg.tsx`) - Image card component for feature displays

#### Data Management
- **Allergy Database** (`src/const/alergias.ts`) - Comprehensive allergy data with TypeScript interfaces
  - Contains 29+ allergens with medical data including KUA/Litro measurements
  - Categories: Crustaceos, Mariscos, Pescados, Frutas, Vegetales, Frutos secos, Árboles, Hongos, Animales

### Key Technical Details

#### Routing Configuration
```typescript
<Router basename="/BlancAlergic-APP/">
  <Layout>
    <Routes>
      <Route path="/" element={<Outlet />}/>
      <Route path="/buscarAlergias" element={<InputSearch />} />
      <Route path="/emergencias" element={<EmergencyView />} />
      <Route path="/tablaAlergias" element={<TableView />} />
    </Routes>
  </Layout>
</Router>
```

#### PWA Configuration
- Custom manifest with app icons and GitHub Pages base path
- Auto-update service worker registration
- PWA installation prompts with fallback handling

#### Data Structure
```typescript
interface AlergiaType {
  name: string;
  isAlergic: boolean;
  intensity: string; // "Alta", "Media", "Baja"
  category: string;
  KUA_Litro?: number; // Medical measurement unit
}
```

### Build & Deployment
- **Production Build**: `tsc -b && vite build` outputs to `dist/` folder
- **GitHub Pages**: Configured with custom base path `/BlancAlergic-APP/`
- **PWA Assets**: Icons in `public/icons/` directory (192x192, 512x512)
- **Images**: Feature images in `public/Image/` directory

### Development Workflow
1. All development happens in `src/` directory with TypeScript strict mode
2. Component-based architecture with reusable UI elements
3. ESLint configuration for React/TypeScript best practices
4. Hot reload via Vite development server
5. PWA features work in development mode with `devOptions.enabled: true`

### Important Notes
- The application uses Spanish language throughout the interface and comments
- All routing must account for the GitHub Pages basename `/BlancAlergic-APP/`
- Theme management uses BeerCSS classes (`dark`, `white`) with Material Dynamic Colors
- PWA installation prompts are handled manually with `beforeinstallprompt` event
- Medical data (KUA/Litro values) are for display purposes and should be verified by medical professionals

## WORKFLOW RULES
### Phase 1
- At the starting point of a feature on plan mode phase you MUST ALWAYS init a `.claude/sessions/context_session_{feature_name}.md` with your first analysis
- You MUST ask to the sub agents that you considered that have to be involved about the implementation and check their opinions, try always to run them on parallel if possible
- After a plan mode phase you ALWAYS update the `.claude/sessions/context_session_{feature_name}.md` with the definition of the plan and the recommendations of the sub agents
### Phase 2
- Before you do any work, MUST view files in `.claude/sessions/context_session_{feature_name}.md` file to get the full context
- `.claude/sessions/context_session_{feature_name}.md` should contain most of context of what we did, overall plan, and sub agents will continuously add context to the file
- After you finish each phase, MUST update the `.claude/sessions/context_session_{feature_name}.md` file to make sure others can get full context of what you did
- After you finish the work, MUST update the `.claude/sessions/context_session_{feature_name}.md` file to make sure others can get full context of what you did
### Phase 3
- You must ensure that the application has no errors in the linter with `npm run lint` and that it builds correctly with `npm run build`.
- You must ensure that the application runs correctly in the development server with `npm run dev`.

### SUB AGENTS MANAGEMENT
You have access to 3 sub agents:
- shadcn-ui-architect: all task related to UI building & tweaking HAVE TO consult this agent
- ui-ux-analyzer: all the task related with UI review, improvements & tweaking HAVE TO consult this agent
- frontend-expert: all task related to business logic before create the UI building & tweaking HAVE TO consult this agent

Sub agents will do research about the implementation and report feedback, but you will do the actual implementation;

When passing task to sub agent, make sure you pass the context file, e.g. `.claude/sessions/context_session_{feature_name}.md`.

After each sub agent finishes the work, make sure you read the related with this feature documentation they created in `.claude/doc/{feature_name}/` to get full context of the plan before you start executing.