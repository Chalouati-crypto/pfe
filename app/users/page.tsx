import FormDialog from "@/components/form-dialog";
import { TypographyH1 } from "@/components/ui/heading-1";
import { getUsers } from "@/server/actions/users";
import UsersTable from "./users-table";
import { AddEditUser } from "./add-edit-user";

export default async function Users() {
  const users = await getUsers();

  console.log(users);

  return (
    <div className="grid gap-12 mt-12">
      <div className="flex items-center justify-between">
        <TypographyH1>Liste des utilisateurs</TypographyH1>
        <FormDialog
          big={false}
          trigger="Ajouter un utilisateur"
          title="Ajouter un nouveau utilisateur"
        >
          <AddEditUser />
        </FormDialog>
      </div>
      <UsersTable users={users} />
    </div>
  );
}
