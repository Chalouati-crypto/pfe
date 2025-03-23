//components/FormSuccess
import { CheckCircle } from "lucide-react";

export const FormSuccess = ({ message }: { message: string }) => {
  if (!message) return null;
  return (
    <>
      <div className="bg-chart-2 text-secondary p-3 rounded-md flex items-center gap-2">
        <CheckCircle className="v-4 h-4" />
        <p>{message}</p>
      </div>
    </>
  );
};
