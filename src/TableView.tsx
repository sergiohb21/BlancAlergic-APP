import { MedicalHistory } from "@/components/medical/MedicalHistory";
import MedicalErrorBoundary from "@/components/MedicalErrorBoundary";

function TableView(): JSX.Element {
  return (
    <MedicalErrorBoundary componentName="MedicalHistory" showEmergencyInfo={true}>
      <MedicalHistory
        patientName="Blanca"
        patientBirthDate={new Date('2010-05-15')}
      />
    </MedicalErrorBoundary>
  );
}

export default TableView;
