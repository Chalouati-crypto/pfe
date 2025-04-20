"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useReactToPrint } from "react-to-print";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
// Helper function to format date
const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return "Non spécifiée";

  try {
    // Check if the date is valid before formatting
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString; // Return the original string if it's not a valid date
    }
    return format(date, "dd MMMM yyyy", { locale: fr });
  } catch (error) {
    console.error("Date formatting error:", error);
    return dateString; // Return the original string in case of error
  }
};

// Helper function to get category name based on surface
const getSurfaceCategory = (surface: number) => {
  if (surface <= 100) return "Catégorie 1";
  if (surface <= 200) return "Catégorie 2";
  if (surface <= 400) return "Catégorie 3";
  return "Catégorie 4";
};

// Helper function to get price reference based on surface
const getPriceReference = (surface: number) => {
  if (surface <= 100) return 150;
  if (surface <= 200) return 200;
  if (surface <= 400) return 250;
  return 300;
};

// Helper function to get service rate based on services count
const getServiceRate = (servicesCount: number, hasOtherService: boolean) => {
  if (servicesCount <= 2) return "8%";
  if (servicesCount <= 4) return "10%";
  if (servicesCount <= 6) return "12%";
  if (servicesCount > 6 || hasOtherService) return "14%";
  return "8%";
};

// Helper function to get density price
const getDensityPrice = (density: string) => {
  switch (density) {
    case "haute":
      return "0.300 DT/m²";
    case "moyenne":
      return "0.090 DT/m²";
    case "basse":
      return "0.030 DT/m²";
    default:
      return "N/A";
  }
};

export default function ArticleNoticeModal({
  article,
  isOpen,
  onClose,
  isNew = true,
}: {
  article: any;
  isOpen: boolean;
  onClose: () => void;
  isNew?: boolean;
}) {
  const printRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Extract the actual article data from the nested structure
  console.log("Article data received in modal:", article);
  const articleData = article?.input || article?.data?.data || article;
  const servicesArray = Array.isArray(articleData?.services)
    ? articleData?.services
    : [];
  const hasOtherService = Boolean(articleData?.autreService?.length);
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Avis_Fiscal_${articleData?.cin || ""}`,
    onBeforeGetContent: () => {
      if (!printRef.current) {
        toast.error("Erreur: Impossible d'imprimer le document");
        return Promise.reject();
      }
      return Promise.resolve();
    },
    onPrintError: () => {
      toast.error("Erreur d'impression. Veuillez réessayer.");
    },
  });
  if (!article) return null;

  const handleDownloadPDF = async () => {
    if (!printRef.current) {
      toast.error("Erreur: Impossible de générer le PDF");
      return;
    }

    setIsGeneratingPDF(true);
    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        logging: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`Avis_Fiscal_${articleData?.cin || ""}.pdf`);
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Erreur lors de la génération du PDF");
    } finally {
      setIsGeneratingPDF(false);
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-7xl min-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary text-xl">
            {isNew ? "Nouvelle propriété enregistrée" : "Propriété mise à jour"}
          </DialogTitle>
          <DialogDescription>
            Enregistré le {format(new Date(), "dd MMMM yyyy", { locale: fr })}
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-auto flex-1 pr-1 my-4">
          {/* Important: This is the element that will be printed */}
          <div ref={printRef} className="bg-white rounded-lg shadow-sm">
            {/* Header */}
            <div className="bg-primary/10 p-6 rounded-t-lg border-b border-primary/20">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-primary">
                  Avis d&apos;Imposition
                </h1>
                <p className="text-muted-foreground mt-1">
                  {format(new Date(), "dd MMMM yyyy", { locale: fr })}
                </p>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* General Information */}
              <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
                <div className="bg-muted px-4 py-3 border-b">
                  <h3 className="font-semibold text-lg">
                    Informations Générales
                  </h3>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Type de propriété
                      </p>
                      <p className="font-medium text-lg">
                        {articleData?.typeDePropriete === "bati"
                          ? "Bâti"
                          : "Non Bâti"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Date début d&apos;imposition
                      </p>
                      <p className="font-medium text-lg">
                        {formatDate(articleData?.dateDebutImposition)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Surface Totale
                      </p>
                      <p className="font-medium text-lg">
                        {articleData?.surfaceTotale} m²
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Densité Urbaine
                      </p>
                      <p className="font-medium text-lg">
                        {articleData?.densiteUrbain === "haute"
                          ? "Haute"
                          : articleData?.densiteUrbain === "moyenne"
                          ? "Moyenne"
                          : articleData?.densiteUrbain === "basse"
                          ? "Basse"
                          : "Non spécifiée"}
                      </p>
                      {articleData?.typeDePropriete === "non bati" &&
                        articleData?.densiteUrbain && (
                          <p className="text-xs text-muted-foreground mt-1 bg-muted inline-block px-2 py-0.5 rounded">
                            {getDensityPrice(articleData?.densiteUrbain)}
                          </p>
                        )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
                <div className="bg-muted px-4 py-3 border-b">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg">Localisation: </h3>
                    <span className="text-muted-foreground text-sm  ">
                      article N: {articleData?.number}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Arrondissement
                      </p>
                      <p className="font-medium text-lg">
                        {articleData?.arrondissement || "Non spécifié"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Zone
                      </p>
                      <p className="font-medium text-lg">
                        {articleData?.zone || "Non spécifiée"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Rue
                      </p>
                      <p className="font-medium text-lg">
                        {articleData?.rue || "Non spécifiée"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Owner */}
              <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
                <div className="bg-muted px-4 py-3 border-b">
                  <h3 className="font-semibold text-lg">Propriétaire</h3>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        CIN
                      </p>
                      <p className="font-medium text-lg">
                        {articleData?.cin || "Non spécifié"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Nom Complet
                      </p>
                      <p className="font-medium text-lg">
                        {articleData?.nom} {articleData?.prenom}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Email
                      </p>
                      <p className="font-medium text-lg">
                        {articleData?.email || "Non spécifié"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Téléphone
                      </p>
                      <p className="font-medium text-lg">
                        {articleData?.telephone || "Non spécifié"}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        Adresse
                      </p>
                      <p className="font-medium text-lg">
                        {articleData?.adresse || "Non spécifiée"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Building Details (if applicable) */}
              {articleData?.typeDePropriete === "bati" && (
                <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
                  <div className="bg-muted px-4 py-3 border-b">
                    <h3 className="font-semibold text-lg">
                      Détails du Bâtiment
                    </h3>
                  </div>
                  <div className="p-4 space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Surface Couverte
                      </p>
                      <p className="font-medium text-lg">
                        {articleData?.surfaceCouverte} m²
                      </p>
                      <div className="mt-1 inline-block bg-muted px-2 py-0.5 rounded text-xs">
                        {getSurfaceCategory(articleData?.surfaceCouverte)} (Prix
                        de référence:{" "}
                        {getPriceReference(articleData?.surfaceCouverte)} DT)
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Services
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {servicesArray.map((service: any, index: number) => (
                          <span
                            key={index}
                            className="inline-flex items-center rounded-full bg-primary/10 border-primary/20 border px-3 py-1 text-xs font-medium"
                          >
                            {service.label}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 inline-block bg-muted px-2 py-0.5 rounded">
                        Taux de prestation:{" "}
                        {getServiceRate(servicesArray.length, hasOtherService)}
                      </p>
                    </div>

                    {hasOtherService && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Autres Services
                        </p>
                        <p className="font-medium text-lg">
                          {articleData?.autreService}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tax Information */}
              <div className="bg-primary/10 rounded-lg border border-primary/30 shadow-sm overflow-hidden">
                <div className="px-4 py-4 flex justify-between items-center border-b border-primary/20">
                  <h3 className="font-semibold text-lg text-primary">
                    Taxe Applicable
                  </h3>
                  <div className="bg-white px-4 py-2 rounded-md border shadow-sm">
                    <span className="text-xl font-bold text-primary">
                      {articleData?.taxe} DT
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm text-muted-foreground">
                    Cette taxe est calculée selon les paramètres fournis et
                    conformément à la réglementation en vigueur. Le paiement
                    doit être effectué avant la fin de l&apos;année fiscale.
                  </p>
                  <div className="text-xs text-muted-foreground mt-4 pt-3 border-t border-primary/20">
                    <p>
                      Document généré le{" "}
                      {(() => {
                        try {
                          return format(new Date(), "dd MMMM yyyy à HH:mm", {
                            locale: fr,
                          });
                        } catch (error) {
                          return new Date().toLocaleString();
                        }
                      })()}{" "}
                      - Ce document a une valeur informative.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between items-center pt-4 border-t">
          <Button variant="outline" className="mr-auto" onClick={onClose}>
            Fermer
          </Button>
          <div className="space-x-2 flex">
            <Button
              variant="outline"
              onClick={handlePrint}
              className="flex items-center gap-1"
            >
              <Printer className="h-4 w-4" />
              <span>Imprimer</span>
            </Button>

            <Button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="flex items-center gap-1"
            >
              <Download className="h-4 w-4" />
              <span>{isGeneratingPDF ? "Génération..." : "PDF"}</span>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
