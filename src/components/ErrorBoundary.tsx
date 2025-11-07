import { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Phone, RefreshCw } from 'lucide-react';
import { EMERGENCY_PHONE, EMERGENCY_PHONE_TEL } from '@/utils/constants';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  mode?: 'default' | 'medical' | 'simple';
  componentName?: string;
  showEmergencyInfo?: boolean;
  emergencyNumber?: string;
  customTitle?: string;
  customMessage?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { mode, componentName, onError } = this.props;

    // Enhanced logging for medical components
    if (mode === 'medical') {
      console.error(`MedicalErrorBoundary (${componentName}):`, error, errorInfo);

      // Critical medical component error - log with higher priority
      if (import.meta.env.PROD) {
        console.error('CRITICAL MEDICAL COMPONENT ERROR:', {
          component: componentName,
          error: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString(),
        });
      }
    } else {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo);
    }

    // Log to external monitoring service in production
    if (import.meta.env.PROD) {
      console.warn('Production error detected:', {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        mode,
        componentName,
      });
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  private renderSimpleError() {
    const { error } = this.state;

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg border border-red-200 p-6">
          <div className="text-center">
            <div className="text-6xl mb-4">😵</div>
            <h1 className="text-xl font-bold text-red-600 mb-2">
              ¡Ups! Algo salió mal
            </h1>
            <p className="text-gray-600 mb-4">
              Ha ocurrido un error inesperado. Por favor, recarga la página e inténtalo de nuevo.
            </p>

            {import.meta.env.DEV && error && (
              <details className="text-left mb-4 p-2 bg-red-50 rounded text-sm">
                <summary className="cursor-pointer font-medium text-red-800">
                  Detalles del error (desarrollo)
                </summary>
                <pre className="mt-2 text-xs text-red-700 whitespace-pre-wrap">
                  {error.stack}
                </pre>
              </details>
            )}

            <div className="space-x-2">
              <button
                onClick={this.handleReset}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Intentar de nuevo
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Recargar página
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  private renderMedicalError() {
    const { componentName, showEmergencyInfo = true, emergencyNumber = EMERGENCY_PHONE } = this.props;
    const { error } = this.state;

    return (
      <Card className="border-red-500/50 bg-red-50 dark:bg-red-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertTriangle className="h-5 w-5" />
            Error Crítico en Componente Médico
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-red-700 dark:text-red-300">
              El componente <strong>{componentName}</strong> ha encontrado un error crítico.
            </p>
            <p className="text-sm text-muted-foreground">
              {showEmergencyInfo && (
                <>
                  <strong>Importante:</strong> Si necesita información médica de emergencia
                  mientras solucionamos este problema, por favor:
                </>
              )}
            </p>
          </div>

          {showEmergencyInfo && (
            <Card className="bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    <div>
                      <p className="font-semibold text-orange-800 dark:text-orange-200">
                        Emergencia Médica
                      </p>
                      <p className="text-sm text-orange-700 dark:text-orange-300">
                        Llame inmediatamente al <strong>{emergencyNumber}</strong>
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => (window.location.href = `${EMERGENCY_PHONE_TEL}`.replace('112', emergencyNumber))}
                    variant="destructive"
                    size="sm"
                    className="w-full"
                  >
                    <Phone className="mr-2 h-4 w-4" />
                    Llamar al {emergencyNumber}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              onClick={this.handleReset}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Reintentar Componente
            </Button>
            <Button
              onClick={() => window.location.reload()}
              variant="default"
              size="sm"
            >
              Recargar Aplicación
            </Button>
          </div>

          <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
            <p>
              Este error ha sido registrado. Si el problema persiste,
              contacte al soporte técnico con referencia: <strong>{componentName}</strong>
            </p>
          </div>

          {import.meta.env.DEV && error && (
            <details className="mt-2">
              <summary className="cursor-pointer text-xs font-mono">
                Detalles del error (desarrollo)
              </summary>
              <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                {error.message}
                {error.stack}
              </pre>
            </details>
          )}
        </CardContent>
      </Card>
    );
  }

  private renderDefaultError() {
    const { customTitle, customMessage, emergencyNumber = EMERGENCY_PHONE } = this.props;
    const { error } = this.state;

    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            {customTitle || 'Error en la Aplicación'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p className="mb-2">
              {customMessage || 'Ha ocurrido un error inesperado en la aplicación.'}
            </p>
            {error && (
              <details className="mt-2">
                <summary className="cursor-pointer text-xs font-mono">
                  Detalles del error (desarrollo)
                </summary>
                <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                  {error.message}
                  {error.stack}
                </pre>
              </details>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={this.handleReset}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Reintentar
            </Button>
            <Button
              onClick={() => window.location.reload()}
              variant="default"
              size="sm"
            >
              Recargar Página
            </Button>
          </div>

          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">
              Si el problema persiste, por favor contacte al soporte técnico.
              <br />
              <strong>Importante:</strong> En caso de emergencia médica, llame al {emergencyNumber}.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  render() {
    const { hasError } = this.state;
    const { fallback, mode = 'default' } = this.props;

    if (hasError) {
      // Custom fallback UI if provided
      if (fallback) {
        return fallback;
      }

      // Render different error UIs based on mode
      switch (mode) {
        case 'simple':
          return this.renderSimpleError();
        case 'medical':
          return this.renderMedicalError();
        default:
          return this.renderDefaultError();
      }
    }

    return this.props.children;
  }
}

export default ErrorBoundary;