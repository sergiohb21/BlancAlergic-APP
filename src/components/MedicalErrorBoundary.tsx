import { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Phone, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  componentName: string;
  showEmergencyInfo?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class MedicalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`MedicalErrorBoundary (${this.props.componentName}):`, error, errorInfo);

    // Critical medical component error - log with higher priority
    if (import.meta.env.PROD) {
      // In production, this should trigger immediate alert to monitoring system
      console.error('CRITICAL MEDICAL COMPONENT ERROR:', {
        component: this.props.componentName,
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      });
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
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
                El componente <strong>{this.props.componentName}</strong> ha encontrado un error crítico.
              </p>
              <p className="text-sm text-muted-foreground">
                {this.props.showEmergencyInfo && (
                  <>
                    <strong>Importante:</strong> Si necesita información médica de emergencia
                    mientras solucionamos este problema, por favor:
                  </>
                )}
              </p>
            </div>

            {this.props.showEmergencyInfo && (
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
                          Llame inmediatamente al <strong>112</strong>
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => (window.location.href = "tel:112")}
                      variant="destructive"
                      size="sm"
                      className="w-full"
                    >
                      <Phone className="mr-2 h-4 w-4" />
                      Llamar al 112
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
                contacte al soporte técnico con referencia: <strong>{this.props.componentName}</strong>
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default MedicalErrorBoundary;