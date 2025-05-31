"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { userSchema } from "@/types/users-schema";
import { useState } from "react";
import { z } from "zod";
import { columns } from "./columns";
import { AddEditUser } from "./add-edit-user";
import { DataTable } from "./data-table";
import DeleteAlert from "@/components/delete-alert";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { deleteUser } from "@/server/actions/users";

export type User = z.infer<typeof userSchema>;
interface UsersTableProps {
  users: User[];
}
// Infer the type from the Zod schema

// Correct function signature
export default function UsersTable({ users }: UsersTableProps) {
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<User | undefined>(
    undefined
  );
  const { execute: deleteExecute, status: deleteStatus } = useAction(
    deleteUser,
    {
      onSuccess() {
        toast.success("User successfully deleted !");
        setDeleteOpen(false);
      },
      onError(error) {
        console.error("Delete failed:", error);
        toast.error("Error deleting user");
      },
    }
  );
  const handleEdit = (user: User) => {
    setSelectedUser(user); // State update is asynchronous
    setEditOpen(true);
  };
  const handleDelete = (user: User) => {
    setContactToDelete(user); // State update is asynchronous
    setDeleteOpen(true);
  };

  return (
    <>
      <DataTable data={users} columns={columns(handleEdit, handleDelete)} />

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="flex flex-col gap-6">
          <DialogTitle>Suprimmer l&apos;utilisateur</DialogTitle>
          <AddEditUser
            user={selectedUser}
            handleClose={() => setEditOpen(false)}
          />
        </DialogContent>
      </Dialog>
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="flex flex-col gap-6">
          <DialogTitle>Suprimmer l&apos;utilisateur</DialogTitle>
          <DeleteAlert
            ressource=" utilisateur"
            setDeleteOpen={setDeleteOpen}
            deleteExecute={deleteExecute}
            id={contactToDelete?.id}
            deleteStatus={deleteStatus}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
