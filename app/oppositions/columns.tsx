"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Eye } from "lucide-react";
import type { Opposition } from "@/types/opposition-schema";

// Helper function to get status badge variant
const getStatusVariant = (status: string) => {
  switch (status) {
    case "opposition_pending":
      return "outline";
    case "opposition_approved":
      return "success";
    case "opposition_refused":
      return "destructive";
    default:
      return "secondary";
  }
};

// Helper function to format the status text
const formatStatus = (status: string) => {
  return status.replace("opposition_", "").replace("_", " ").toUpperCase();
};

export const columns = (
  handleCompare: (opposition: Opposition) => void
): ColumnDef<Opposition>[] => [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => <div className="font-medium">#{row.original.id}</div>,
  },
  {
    accessorKey: "articleId",
    header: "Article",
    cell: ({ row }) => <div>{row.original.articleId}</div>,
  },
  {
    accessorKey: "proposedServices",
    header: "Proposed Services",
    cell: ({ row }) => {
      const services = row.original.proposedServices;
      // Extract service names and join with commas
      if (services)
        return <div>{services.map((service) => service.label).join(", ")}</div>;
      else return <div>-</div>;
    },
  },

  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={getStatusVariant(row.original.status)}>
        {formatStatus(row.original.status)}
      </Badge>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Submitted",
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">
        {formatDistanceToNow(new Date(row.original.createdAt), {
          addSuffix: true,
          locale: fr,
        })}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleCompare(row.original)}
          className="flex items-center gap-1"
        >
          <Eye className="h-4 w-4" />
          {row.original.status === "opposition_pending" ? "Review" : "View"}
        </Button>
      );
    },
  },
];
