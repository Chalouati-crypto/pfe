"use client";

import { articlesSchema } from "@/types/articles-schema";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { deleteArticle } from "@/server/actions/articles";
import { toast } from "sonner";
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
async function deleteArticleWrapper(article: number) {
  const id = article.general.id;
  const { data } = await deleteArticle({ id });
  if (!data) return new Error("no data found");
  if (data.success) toast.success(data.success);
  if (data.error) toast.error(data.error);
}

export const columns = (
  handleEdit: (article: any) => void
): ColumnDef<typeof articlesSchema>[] => [
  {
    accessorKey: "general.id",
    header: "id",
  },
  {
    accessorKey: "general.typeDePropriete",
    header: `Type de propriete`,
  },
  {
    accessorKey: "location.arrondissement",
    header: `Arrondissement`,
  },

  {
    accessorKey: "owner.fullName",
    header: `Nom & Prénom`,
    cell: ({ row }) => `${row.original.owner.nom} ${row.original.owner.prenom}`,
  },
  {
    accessorKey: "owner.cin",
    header: `CIN`,
  },
  {
    accessorKey: "general.dateDebutImposition",
    header: `Date de Début d'Imposition`,
    cell: (row) => {
      const date = new Date(row.getValue("general.dateDebutImposition"));
      return format(date, "dd/MM/yyyy"); // Format as "day/month/year"
    },
  },

  {
    id: "actions",
    cell: ({ row }) => {
      console.log(row.original, "this is row.original");
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild className="cursor-pointer">
            <Button variant="ghost" className="w-8 h-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>

            <DropdownMenuItem
              onClick={() => handleEdit(row.original)} // ✅ Pass clicked row
              className="cursor-pointer"
            >
              Modifier l&apos;article
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => deleteArticleWrapper(row.original)}
              className="cursor-pointer"
            >
              Suprimmer l&apos;article
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
