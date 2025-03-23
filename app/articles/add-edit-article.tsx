"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getDefaultValues } from "@/lib/utils";
import { upsertArticle } from "@/server/actions/articles";
import { articlesSchema } from "@/types/articles-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import General from "./general-form";
import Location from "./location-form";
import Owner from "./owner-form";
import Bati from "./bati-form";
import { toast } from "sonner";

export default function AddEditArticle({
  handleClose,
  article,
}: {
  handleClose?: () => void;
  article?: z.infer<typeof articlesSchema>;
}) {
  const router = useRouter();

  // Server action
  const { execute, status } = useAction(upsertArticle, {
    onSuccess(data) {
      console.log(data);
      toast.success("Update successful!");
      router.refresh(); // Refresh the page data
      handleClose?.();
    },
    onError(data) {
      toast.success("Server action error");
      console.log(data);
    },
  });

  // Initialize form with either existing article or default values
  const methods = useForm({
    mode: "onSubmit",
    resolver: zodResolver(articlesSchema),
    defaultValues: article || getDefaultValues(),
  });

  // Reset form when article changes (convert date if necessary)

  // Extracting methods from react-hook-form
  const { handleSubmit, watch, formState } = methods;
  const { errors } = formState;
  // Watch values
  const typeDePropriete = watch("general.typeDePropriete");
  const generalFormValues = watch("general") || {};
  const locationFormValues = watch("location");
  const ownerFormValues = watch("owner");
  const batiFormValues = watch("bati_details");

  // Manage tabs
  // When editing, if type is "bati" open tab "4", otherwise default to "1"
  const [activeTab, setActiveTab] = useState("1");

  console.log("Active tab on render:", activeTab); // Log the active tab

  const isValidGeneralTab = () => {
    const { typeDePropriete, dateDebutImposition } = generalFormValues;
    console.log("Validating General Tab:", {
      typeDePropriete,
      dateDebutImposition,
    });
    return typeDePropriete && dateDebutImposition; // Validate required fields
  };

  const isValidLocationTab = () => {
    const { arrondissement, zone, rue } = locationFormValues;
    console.log("Validating Location Tab:", { arrondissement, zone, rue });
    return arrondissement && zone && rue; // Validate required fields
  };

  const isValidOwnerTab = () => {
    const { cin, nom, prenom, email, adresse, telephone } = ownerFormValues;
    console.log("Validating Owner Tab:", {
      cin,
      nom,
      prenom,
      email,
      adresse,
      telephone,
    });
    return cin && nom && prenom && email && adresse && telephone; // Validate required fields
  };

  const isValidBatiTab = () => {
    const { surfaceTotale, surfaceCouverte, services, autreService } =
      batiFormValues || {};
    console.log("Validating Bati Tab:", {
      surfaceTotale,
      surfaceCouverte,
      services,
      autreService,
    });
    return (
      surfaceTotale !== undefined &&
      surfaceCouverte !== undefined &&
      autreService &&
      services
    );
  };

  const isNextButtonEnabled = () => {
    if (activeTab === "1") {
      return isValidGeneralTab();
    } else if (activeTab === "2") {
      return isValidLocationTab();
    } else if (activeTab === "3") {
      return isValidOwnerTab();
    } else if (activeTab === "4" && typeDePropriete === "bati") {
      return isValidBatiTab();
    }
    return false;
  };

  // Submit handler
  const onSubmit = (values: z.infer<typeof articlesSchema>) => {
    console.log("Form errors:", errors);
    const updatedValues = {
      ...values,
      bati_details: {
        ...values.bati_details,
        autreService: Array.isArray(values.bati_details?.autreService)
          ? values.bati_details.autreService.join(",") // Convert to string
          : values.bati_details?.autreService,
      },
    };

    execute(updatedValues);
  };

  useEffect(() => {
    console.log("Form errors:", formState.errors);
    console.log("Is form valid?", formState.isValid);
    console.log("Is submitting?", formState.isSubmitting);
  }, [formState]);

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-6 space-y-6 flex flex-col justify-between h-full"
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="mb-8 mx-auto">
            <TabsTrigger
              className={errors.general ? "text-destructive" : ""}
              value="1"
            >
              Paramètre Généraux
            </TabsTrigger>
            <TabsTrigger
              disabled={Number(activeTab) < 2 && !isNextButtonEnabled()}
              className={errors.location ? "text-destructive" : ""}
              value="2"
            >
              Localisation
            </TabsTrigger>
            <TabsTrigger
              disabled={Number(activeTab) < 3 && !isNextButtonEnabled()}
              className={errors.owner ? "text-destructive" : ""}
              value="3"
            >
              Propriétaire
            </TabsTrigger>
            {typeDePropriete === "bati" && (
              <TabsTrigger
                disabled={Number(activeTab) < 4 && !isNextButtonEnabled()}
                className={errors.bati_details ? "text-destructive" : ""}
                value="4"
              >
                Infos Bâtiment
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="1">
            <General />
          </TabsContent>
          <TabsContent value="2">
            <Location />
          </TabsContent>
          <TabsContent value="3">
            <Owner />
          </TabsContent>
          {typeDePropriete === "bati" && (
            <TabsContent value="4">
              <Bati />
            </TabsContent>
          )}
        </Tabs>
        <div className="space-x-4 mx-auto">
          <Button
            type="submit"
            className={status === "executing" ? "animate-pulse" : ""}
          >
            {article ? "Modifier" : "Ajouter"}
          </Button>
          <Button
            variant="outline"
            type="button"
            disabled={!isNextButtonEnabled()}
            onClick={() => {
              const nextTab = (parseInt(activeTab, 10) + 1).toString();
              if (typeDePropriete === "non bati" && nextTab > "3") {
                setActiveTab("1");
              } else if (typeDePropriete === "bati" && nextTab > "4") {
                setActiveTab("1");
              } else {
                setActiveTab(nextTab);
              }
            }}
          >
            Next
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
