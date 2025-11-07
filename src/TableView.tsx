import AllergyTableSimple from "@/components/medical/AllergyTableSimple";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Card, CardContent } from "@/components/ui/card";
import { Filter } from "lucide-react";

function TableView(): JSX.Element {
  return (
    <ErrorBoundary mode="medical" componentName="TableView" showEmergencyInfo={true}>
      <div className="space-y-6">
        {/* Simple Header */}
        <Card className="border-2">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Filter className="h-6 w-6 text-primary" />
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  Tabla de Alergias
                </h2>
                <p className="text-sm text-muted-foreground dark:text-gray-300">
                  Visualiza y filtra todas las alergias registradas
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table Content */}
        <AllergyTableSimple />
      </div>
    </ErrorBoundary>
  );
}

export default TableView;