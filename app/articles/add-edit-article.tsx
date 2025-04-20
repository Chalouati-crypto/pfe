"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { upsertArticle } from "@/server/actions/articles";
import { articleSchema } from "@/types/articles-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import type { z } from "zod";
import General from "./general-form";
import Location from "./location-form";
import Owner from "./owner-form";
import Bati from "./bati-form";
import { toast } from "sonner";
import { AlertCircle, Coins } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FormField } from "@/components/ui/form";
import { useArticleNoticeStore } from "@/stores/article-notice-store";

// Helper function to format date as YYYY-MM-DD
const formatDateToYYYYMMDD = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Tax calculation function based on the provided rules
const calculateTax = (
  typeDePropriete: string,
  surfaceTotale: number,
  densiteUrbain: string | undefined,
  surfaceCouverte: number,
  services: Array<{ id: string; label: string }> | undefined,
  autreService: string | undefined
) => {
  // Initialize tax
  let tax = 0;

  if (typeDePropriete === "bati") {
    // For built properties (bati)

    // 1. Determine reference price based on covered surface category
    let prixRef = 0;
    if (surfaceCouverte <= 100) {
      prixRef = 150; // Category 1: 0-100 m²
    } else if (surfaceCouverte <= 200) {
      prixRef = 200; // Category 2: 101-200 m²
    } else if (surfaceCouverte <= 400) {
      prixRef = 250; // Category 3: 201-400 m²
    } else {
      prixRef = 300; // Category 4: >400 m²
    }

    // 2. Determine service rate based on number of services
    let tauxPrestation = 0;
    const serviceCount = services ? services.length : 0;
    const hasAutreService = autreService && autreService.length > 0;

    if (serviceCount <= 2) {
      tauxPrestation = 0.08; // 1-2 services
    } else if (serviceCount <= 4) {
      tauxPrestation = 0.1; // 3-4 services
    } else if (serviceCount <= 6) {
      tauxPrestation = 0.12; // 5-6 services
    } else if (serviceCount > 6 || hasAutreService) {
      tauxPrestation = 0.14; // 6+ with "autre"
    }

    // 3. Calculate tax using the formula
    const baseCalc = surfaceCouverte * prixRef * 0.02;
    tax = baseCalc * tauxPrestation + baseCalc * 0.04;
  } else {
    // For non-built properties (non bati)

    // Determine price based on urban density
    let prixDensite = 0;
    if (densiteUrbain === "haute") {
      prixDensite = 0.3; // High density
    } else if (densiteUrbain === "moyenne") {
      prixDensite = 0.09; // Medium density
    } else if (densiteUrbain === "basse") {
      prixDensite = 0.03; // Low density
    } else {
      prixDensite = 0.03; // Default to low density if not specified
    }

    // Calculate tax using the formula
    tax = surfaceTotale * prixDensite;
  }

  // Round to 2 decimal places
  return Math.round(tax * 100) / 100;
};

export default function AddEditArticle({
  handleClose,
  article,
  onSubmitSuccess,
}: {
  handleClose?: () => void;
  article?: z.infer<typeof articleSchema>;
  onSubmitSuccess?: (data: any) => void;
}) {
  const router = useRouter();
  const [isEditing] = useState(!!article);
  const openNotice = useArticleNoticeStore((state) => state.openNotice);
  // Server action
  const { execute, status, error } = useAction(upsertArticle, {
    onSuccess(data) {
      // Show success message
      // Show success message
      toast.success("Opération réussie!");

      // Refresh the page data in the background
      router.refresh();

      // Log the data to help with debugging
      console.log("Form submitted successfully:", data);

      // Extract the actual article data - use input as it contains the complete form data
      const articleData = data.input || (data.data && data.data.data) || data;

      // Open the notice modal using the global store with the correct data
      openNotice(articleData, !isEditing);

      // Call the success callback with the submitted data if provided
      if (onSubmitSuccess) {
        onSubmitSuccess(data);
      }

      // Close the form modal if a close handler is provided
      if (handleClose) {
        handleClose();
      }
    },
    onError(error) {
      toast.error("Une erreur est survenue");
      console.error("Form submission error:", error);
    },
  });

  // Format the default date in YYYY-MM-DD format
  const today = new Date();
  const defaultDate = formatDateToYYYYMMDD(today);

  // Initialize form with either existing article or default values
  console.log(typeof article?.number);
  const methods = useForm({
    mode: "onChange",
    resolver: zodResolver(articleSchema),
    defaultValues: article
      ? { ...article, number: Number(article.number) }
      : {
          typeDePropriete: "non bati",
          dateDebutImposition: defaultDate, // Use the formatted date
          arrondissement: "",
          zone: "",
          rue: "",
          number: 0,
          cin: "",
          nom: "",
          prenom: "",
          email: "",
          adresse: "",
          telephone: "",
          // Optional fields with defaults
          surfaceTotale: 0,
          densiteUrbain: undefined,
          surfaceCouverte: 0,
          services: [{ id: "Nettoyage", label: "Nettoyage" }],
          autreService: "",
          taxe: 0,
        },
  });

  // Extracting methods from react-hook-form
  const { handleSubmit, watch, formState, control, setValue } = methods;
  const { errors, isSubmitting } = formState;

  // Watch values that affect tax calculation
  const typeDePropriete = watch("typeDePropriete");
  const surfaceTotale = watch("surfaceTotale");
  const densiteUrbain = watch("densiteUrbain");
  const surfaceCouverte = watch("surfaceCouverte");
  const services = watch("services");
  const autreService = watch("autreService");

  // Manage tabs
  const [activeTab, setActiveTab] = useState("1");

  // Calculate tax whenever relevant fields change
  useEffect(() => {
    const newTax = calculateTax(
      typeDePropriete,
      Number(surfaceTotale) || 0,
      densiteUrbain,
      Number(surfaceCouverte) || 0,
      services,
      autreService
    );
    setValue("taxe", newTax);
  }, [
    typeDePropriete,
    surfaceTotale,
    densiteUrbain,
    surfaceCouverte,
    services,
    autreService,
    setValue,
  ]);

  // Submit handler
  const onSubmit = (values: z.infer<typeof articleSchema>) => {
    // Only convert taxe to number
    const updatedValues = {
      ...values,
      taxe: Number(values.taxe),
    };

    console.log("Submitting form with values:", updatedValues);
    execute(updatedValues);
  };

  // Check if there are any errors in a specific tab
  const hasTabErrors = (tab: string) => {
    switch (tab) {
      case "1": // General
        return (
          !!errors.typeDePropriete ||
          !!errors.dateDebutImposition ||
          !!errors.surfaceTotale ||
          !!errors.densiteUrbain
        );
      case "2": // Location
        return (
          !!errors.arrondissement ||
          !!errors.zone ||
          !!errors.rue ||
          !!errors.number
        );
      case "3": // Owner
        return (
          !!errors.cin ||
          !!errors.nom ||
          !!errors.prenom ||
          !!errors.email ||
          !!errors.adresse ||
          !!errors.telephone
        );
      case "4": // Bati
        return (
          !!errors.surfaceCouverte ||
          !!errors.services ||
          !!errors.autreService ||
          !!errors.taxe
        );
      default:
        return false;
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col h-full max-h-[calc(100vh-100px)]"
      >
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>
              Une erreur est survenue lors de la soumission du formulaire.
            </AlertDescription>
          </Alert>
        )}

        {/* Header with tax info */}
        <div className="flex items-center justify-between py-2 px-4 bg-muted/50 rounded-t-lg border-x border-t mb-2">
          <div className="flex items-center">
            <Coins className="h-5 w-5 text-primary mr-2" />
            <h3 className="font-medium">Taxe applicable:</h3>
          </div>
          <FormField
            control={control}
            name="taxe"
            render={({ field }) => (
              <div className="bg-background rounded-md px-3 py-1 border shadow-sm">
                <span className="font-bold text-primary">
                  {field.value || 0} DT
                </span>
              </div>
            )}
          />
        </div>

        {/* Main content area with tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col"
        >
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger
              value="1"
              className={
                hasTabErrors("1") ? "text-destructive border-destructive" : ""
              }
            >
              Général
            </TabsTrigger>
            <TabsTrigger
              value="2"
              className={
                hasTabErrors("2") ? "text-destructive border-destructive" : ""
              }
            >
              Localisation
            </TabsTrigger>
            <TabsTrigger
              value="3"
              className={
                hasTabErrors("3") ? "text-destructive border-destructive" : ""
              }
            >
              Propriétaire
            </TabsTrigger>
            <TabsTrigger
              value="4"
              className={
                hasTabErrors("4") ? "text-destructive border-destructive" : ""
              }
              disabled={typeDePropriete !== "bati"}
            >
              Détails Bâti
            </TabsTrigger>
          </TabsList>

          <div className="bg-card rounded-lg border shadow-sm overflow-auto flex-1">
            <div className="p-5">
              <TabsContent value="1" className="m-0">
                <General isEditing={isEditing} />
              </TabsContent>
              <TabsContent value="2" className="m-0">
                <Location isEditing={isEditing} />
              </TabsContent>
              <TabsContent value="3" className="m-0">
                <Owner isEditing={isEditing} />
              </TabsContent>
              {typeDePropriete === "bati" && (
                <TabsContent value="4" className="m-0">
                  <Bati isEditing={isEditing} />
                </TabsContent>
              )}
            </div>
          </div>
        </Tabs>

        {/* Footer with buttons */}
        <div className="flex justify-between py-4 mt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const currentTab = Number.parseInt(activeTab, 10);
              if (currentTab > 1) {
                setActiveTab((currentTab - 1).toString());
              }
            }}
            disabled={activeTab === "1"}
          >
            Précédent
          </Button>

          <div className="space-x-4">
            {activeTab !== "4" &&
              typeDePropriete !== "bati" &&
              activeTab === "3" && (
                <Button
                  type="submit"
                  className={isSubmitting ? "animate-pulse" : ""}
                  disabled={isSubmitting}
                >
                  {article ? "Modifier" : "Ajouter"}
                </Button>
              )}

            {activeTab !== "4" &&
              typeDePropriete !== "bati" &&
              activeTab !== "3" && (
                <Button
                  type="button"
                  onClick={() => {
                    const nextTab = (
                      Number.parseInt(activeTab, 10) + 1
                    ).toString();
                    setActiveTab(nextTab);
                  }}
                >
                  Suivant
                </Button>
              )}

            {(activeTab === "4" ||
              (typeDePropriete !== "bati" && activeTab === "3")) && (
              <Button
                type="submit"
                className={isSubmitting ? "animate-pulse" : ""}
                disabled={isSubmitting}
              >
                {article ? "Modifier" : "Ajouter"}
              </Button>
            )}
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
