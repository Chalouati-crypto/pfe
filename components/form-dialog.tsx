"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

export default function FormDialog({
  trigger,
  title,
  children,
}: {
  trigger: string;
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogHeader>
        <DialogTrigger>
          <a className="px-6 py-3 border rounded-md shadow-xs cursor-pointer border-input bg-background hover:bg-accent hover:text-accent-foreground ">
            {trigger}
          </a>
        </DialogTrigger>
      </DialogHeader>
      <DialogContent className="min-w-[50vw] h-[95vh] flex flex-col gap-6">
        <DialogTitle>{title}</DialogTitle>
        {React.isValidElement(children) &&
          React.cloneElement(children, { handleClose: () => setOpen(false) })}
      </DialogContent>
    </Dialog>
  );
}
