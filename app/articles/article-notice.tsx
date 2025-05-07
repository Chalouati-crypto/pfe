"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Download, Printer, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Article, ServiceType } from "@/types/articles-schema";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { PdfDocument } from "./pdf-document";

// Helper function to format date
const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), "dd MMMM yyyy", { locale: fr });
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString;
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
      return "0.300 DH/m²";
    case "moyenne":
      return "0.090 DH/m²";
    case "basse":
      return "0.030 DH/m²";
    default:
      return "N/A";
  }
};

export default function ArticleNotice({
  article,
  onBack,
  isNew = true,
}: {
  article: Article;
  onBack: () => void;
  isNew?: boolean;
}) {
  const servicesArray = Array.isArray(article.services) ? article.services : [];
  const hasOtherService =
    article.autreService && article.autreService.length > 0;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
        <div className="space-x-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Printer className="h-4 w-4" />
            Imprimer
          </Button>
          <PDFDownloadLink
            document={<PdfDocument article={article} />}
            fileName="avis.pdf"
          >
            {({ loading }) => (
              <Button disabled={loading}>
                <Download className="h-4 w-4" />
                {loading ? "Generating..." : "Download PDF"}
              </Button>
            )}
          </PDFDownloadLink>
        </div>
      </div>

      <div className="bg-white p-8 rounded-lg border shadow-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-primary">
            Avis d&apos;Imposition
          </h1>
          <p className="text-muted-foreground">
            {isNew ? "Nouvelle propriété enregistrée" : "Propriété mise à jour"}{" "}
            le {format(new Date(), "dd MMMM yyyy", { locale: fr })}
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Informations Générales</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Type de propriété
              </p>
              <p className="font-medium">
                {article.typeDePropriete === "bati" ? "Bâti" : "Non Bâti"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Date début d&apos;imposition
              </p>
              <p className="font-medium">
                {formatDate(article.dateDebutImposition)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Surface Totale
              </p>
              <p className="font-medium">{article.surfaceTotale} m²</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Densité Urbaine
              </p>
              <p className="font-medium">
                {article.densiteUrbain === "haute"
                  ? "Haute"
                  : article.densiteUrbain === "moyenne"
                  ? "Moyenne"
                  : article.densiteUrbain === "basse"
                  ? "Basse"
                  : "Non spécifiée"}
              </p>
              {article.typeDePropriete === "non bati" &&
                article.densiteUrbain && (
                  <p className="text-xs text-muted-foreground">
                    {getDensityPrice(article.densiteUrbain)}
                  </p>
                )}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Localisation</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Arrondissement
              </p>
              <p className="font-medium">{article.arrondissement}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Zone</p>
              <p className="font-medium">{article.zone}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Rue</p>
              <p className="font-medium">{article.rue}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Propriétaire</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">CIN</p>
              <p className="font-medium">{article.cin}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Nom Complet
              </p>
              <p className="font-medium">
                {article.nom} {article.prenom}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="font-medium">{article.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Téléphone
              </p>
              <p className="font-medium">{article.telephone}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm font-medium text-muted-foreground">
                Adresse
              </p>
              <p className="font-medium">{article.adresse}</p>
            </div>
          </CardContent>
        </Card>

        {article.typeDePropriete === "bati" && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Détails du Bâtiment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Surface Couverte
                  </p>
                  <p className="font-medium">{article.surfaceCouverte} m²</p>
                  <p className="text-xs text-muted-foreground">
                    {getSurfaceCategory(article.surfaceCouverte!)} (Prix de
                    référence: {getPriceReference(article.surfaceCouverte!)} DH)
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Services
                </p>
                <div className="mt-1 flex flex-wrap gap-2">
                  {servicesArray.map((service: ServiceType, index: number) => (
                    <span
                      key={index}
                      className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold"
                    >
                      {service.label}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Taux de prestation:{" "}
                  {getServiceRate(servicesArray.length, hasOtherService)}
                </p>
              </div>

              {hasOtherService && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Autres Services
                  </p>
                  <p className="font-medium">{article.autreService}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Taxe Applicable</span>
              <span className="text-xl font-bold">{article.taxe} DH</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Cette taxe est calculée selon les paramètres fournis et
              conformément à la réglementation en vigueur. Le paiement doit être
              effectué avant la fin de l&apos;année fiscale.
            </p>
          </CardContent>
          <CardFooter className="text-xs text-muted-foreground border-t pt-4">
            <p>
              Document généré le{" "}
              {format(new Date(), "dd MMMM yyyy à HH:mm", { locale: fr })}. Ce
              document a une valeur informative.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
