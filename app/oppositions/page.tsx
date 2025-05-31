import FormDialog from "@/components/form-dialog";
import { TypographyH1 } from "@/components/ui/heading-1";
import { AddOppositionForm } from "./add-opposition";
import { getOppositions } from "@/server/actions/oppositions";
import OppositionsTable from "./oppositions-table";

export default async function Oppositions() {
  const oppositions = await getOppositions();
  if (!oppositions) return;

  return (
    <div className="grid gap-12 mt-12">
      <div className="flex items-center justify-between">
        <TypographyH1>Liste des oppositions</TypographyH1>
        <FormDialog
          big={false}
          trigger="Ajouter une opposition"
          title="Ajouter une nouveau opposition"
        >
          <AddOppositionForm />
        </FormDialog>
      </div>
      <OppositionsTable oppositions={oppositions} />
    </div>
  );
}
