import { vi, beforeEach } from 'vitest'
import '@testing-library/jest-dom'

// Mock para Lucide React icons
vi.mock('lucide-react', () => ({
  AlertTriangle: () => <div data-testid="alert-triangle-icon">Alert</div>,
  CheckCircle: () => <div data-testid="check-circle-icon">Check</div>,
  Phone: () => <div data-testid="phone-icon">Phone</div>,
  Search: () => <div data-testid="search-icon">Search</div>,
  Home: () => <div data-testid="home-icon">Home</div>,
  PhoneCall: () => <div data-testid="phone-call-icon">PhoneCall</div>,
  List: () => <div data-testid="list-icon">List</div>,
  Table: () => <div data-testid="table-icon">Table</div>,
  SearchIcon: () => <div data-testid="search-icon">Search</div>,
  Info: () => <div data-testid="info-icon">Info</div>,
  Heart: () => <div data-testid="heart-icon">Heart</div>,
  ArrowUpDown: () => <div data-testid="arrow-up-down-icon">ArrowUpDown</div>,
  ArrowUp: () => <div data-testid="arrow-up-icon">ArrowUp</div>,
  ArrowDown: () => <div data-testid="arrow-down-icon">ArrowDown</div>,
  RefreshCw: () => <div data-testid="refresh-cw-icon">RefreshCw</div>,
  AlertCircle: () => <div data-testid="alert-circle-icon">AlertCircle</div>,
  X: () => <div data-testid="x-icon">X</div>,
  Check: () => <div data-testid="check-icon">Check</div>,
}))

// Mock para @radix-ui/react-slot
vi.mock('@radix-ui/react-slot', () => ({
  Slot: ({ children }: { children: React.ReactNode }) => children,
}))

// Mock para react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    Outlet: () => <div>Outlet Content</div>,
  }
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn()
mockIntersectionObserver.mockReturnValue({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
})
window.IntersectionObserver = mockIntersectionObserver

// Configuración global para tests
beforeEach(() => {
  vi.clearAllMocks()
})