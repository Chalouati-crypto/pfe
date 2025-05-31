"use client";

import type { Article, articleSchema } from "@/types/articles-schema";
import type { ColumnDef } from "@tanstack/react-table";
import { Book, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { deleteArticle } from "@/server/actions/articles";
import { toast } from "sonner";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
async function deleteArticleWrapper(article: Article) {
  const id = article.id;
  const { data } = await deleteArticle({ id });
  if (!data) return new Error("no data found");
  if (data.success) toast.success(data.success);
  if (data.error) toast.error(data.error);
}

export const columns = (
  handleCompare: (article: Article) => void // New function to handle opening the opposition form
): ColumnDef<typeof articleSchema>[] => [
  {
    accessorKey: "id",
    header: "id",
  },
  {
    accessorKey: "typeDePropriete",
    header: `Type de propriete`,
  },
  {
    accessorKey: "arrondissement",
    header: `Arrondissement`,
  },

  {
    accessorKey: "fullName",
    header: `Nom & Prénom`,
    cell: ({ row }) => `${row.original.nom} ${row.original.prenom}`,
  },
  {
    id: "cin", // 👈 this is what you'll use in getColumn("cin")
    header: `CIN`,
    accessorFn: (row) => row.cin,
  },
  {
    accessorKey: "dateDebutImposition",

    header: ({ column }) => {
      return (
        <span
          className="cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date de Début d&apos;Imposition
        </span>
      );
    },
    cell: (row) => {
      const date = new Date(row.getValue("dateDebutImposition"));
      return format(date, "dd/MM/yyyy"); // Format as "day/month/year"
    },
  },

  {
    id: "actions",
    cell: ({ row }) => {
      const article: Article = row.original;
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
              onClick={() => handleCompare(article)}
              className="cursor-pointer"
            >
              <Book className="mr-2 h-4 w-4" /> Consulter Paiment
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
