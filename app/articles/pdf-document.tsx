import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { z } from "zod";
import type { articleSchema } from "@/types/articles-schema";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Helper functions
const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return "Non spécifiée";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString;
    }
    return format(date, "dd MMMM yyyy", { locale: fr });
  } catch (error) {
    return dateString;
  }
};

const getSurfaceCategory = (surface: number) => {
  if (surface <= 100) return "Catégorie 1";
  if (surface <= 200) return "Catégorie 2";
  if (surface <= 400) return "Catégorie 3";
  return "Catégorie 4";
};

const getPriceReference = (surface: number) => {
  if (surface <= 100) return 150;
  if (surface <= 200) return 200;
  if (surface <= 400) return 250;
  return 300;
};

const getServiceRate = (servicesCount: number, hasOtherService: boolean) => {
  if (servicesCount <= 2) return "8%";
  if (servicesCount <= 4) return "10%";
  if (servicesCount <= 6) return "12%";
  if (servicesCount > 6 || hasOtherService) return "14%";
  return "8%";
};

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

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontFamily: "Helvetica",
    fontSize: 10,
  },
  header: {
    backgroundColor: "#EEF2FF",
    padding: 16,
    borderRadius: 4,
    marginBottom: 16,
    textAlign: "center",
    borderBottom: "1px solid #C7D2FE",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3B82F6",
    marginBottom: 4,
  },
  headerDate: {
    fontSize: 10,
    color: "#6B7280",
  },
  card: {
    border: "1px solid #E5E7EB",
    borderRadius: 4,
    marginBottom: 16,
    overflow: "hidden",
  },
  cardHeader: {
    backgroundColor: "#F3F4F6",
    padding: 8,
    borderBottom: "1px solid #E5E7EB",
  },
  cardHeaderText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  cardContent: {
    padding: 12,
  },
  grid: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
  },
  gridItem: {
    width: "50%",
    marginBottom: 12,
  },
  gridItem3Col: {
    width: "33%",
    marginBottom: 12,
  },
  label: {
    fontSize: 8,
    color: "#6B7280",
    marginBottom: 2,
  },
  value: {
    fontSize: 11,
    fontWeight: "bold",
  },
  smallText: {
    fontSize: 8,
    color: "#6B7280",
    marginTop: 4,
  },
  badge: {
    backgroundColor: "#F3F4F6",
    padding: "2 4",
    borderRadius: 2,
    fontSize: 7,
    color: "#6B7280",
    display: "inline",
  },
  serviceTag: {
    backgroundColor: "#EEF2FF",
    borderColor: "#C7D2FE",
    borderWidth: 1,
    borderRadius: 10,
    padding: "2 6",
    marginRight: 4,
    marginBottom: 4,
    fontSize: 8,
    display: "inline",
  },
  servicesContainer: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
  },
  taxCard: {
    border: "1px solid #C7D2FE",
    borderRadius: 4,
    marginBottom: 16,
    overflow: "hidden",
    backgroundColor: "#EEF2FF",
  },
  taxHeader: {
    padding: 8,
    borderBottom: "1px solid #C7D2FE",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  taxHeaderText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#3B82F6",
  },
  taxAmount: {
    backgroundColor: "white",
    padding: "4 8",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    fontSize: 14,
    fontWeight: "bold",
    color: "#3B82F6",
  },
  taxContent: {
    padding: 12,
  },
  footer: {
    borderTop: "1px solid #C7D2FE",
    marginTop: 8,
    paddingTop: 8,
    fontSize: 7,
    color: "#6B7280",
  },
  fullWidth: {
    width: "100%",
    marginBottom: 12,
  },
});

export const PdfDocument = ({
  article,
}: {
  article: z.infer<typeof articleSchema>;
}) => {
  // Extract the actual article data from the nested structure
  const articleData = article?.input || article?.data?.data || article;
  const servicesArray = Array.isArray(articleData?.services)
    ? articleData?.services
    : [];
  const hasOtherService = Boolean(articleData?.autreService?.length);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Avis d'Imposition</Text>
          <Text style={styles.headerDate}>
            {format(new Date(), "dd MMMM yyyy", { locale: fr })}
          </Text>
        </View>

        {/* General Information Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderText}>Informations Générales</Text>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.grid}>
              <View style={styles.gridItem}>
                <Text style={styles.label}>Type de propriété</Text>
                <Text style={styles.value}>
                  {articleData?.typeDePropriete === "bati"
                    ? "Bâti"
                    : "Non Bâti"}
                </Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>Date début d'imposition</Text>
                <Text style={styles.value}>
                  {formatDate(articleData?.dateDebutImposition)}
                </Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>Surface Totale</Text>
                <Text style={styles.value}>
                  {articleData?.surfaceTotale} m²
                </Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>Densité Urbaine</Text>
                <Text style={styles.value}>
                  {articleData?.densiteUrbain === "haute"
                    ? "Haute"
                    : articleData?.densiteUrbain === "moyenne"
                    ? "Moyenne"
                    : articleData?.densiteUrbain === "basse"
                    ? "Basse"
                    : "Non spécifiée"}
                </Text>
                {articleData?.typeDePropriete === "non bati" &&
                  articleData?.densiteUrbain && (
                    <Text style={styles.badge}>
                      {getDensityPrice(articleData?.densiteUrbain)}
                    </Text>
                  )}
              </View>
            </View>
          </View>
        </View>

        {/* Location Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderText}>
              Localisation:{" "}
              <Text style={{ color: "#6B7280", fontSize: 8 }}>
                article N: {articleData?.number}
              </Text>
            </Text>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.grid}>
              <View style={styles.gridItem3Col}>
                <Text style={styles.label}>Arrondissement</Text>
                <Text style={styles.value}>
                  {articleData?.arrondissement || "Non spécifié"}
                </Text>
              </View>
              <View style={styles.gridItem3Col}>
                <Text style={styles.label}>Zone</Text>
                <Text style={styles.value}>
                  {articleData?.zone || "Non spécifiée"}
                </Text>
              </View>
              <View style={styles.gridItem3Col}>
                <Text style={styles.label}>Rue</Text>
                <Text style={styles.value}>
                  {articleData?.rue || "Non spécifiée"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Owner Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderText}>Propriétaire</Text>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.grid}>
              <View style={styles.gridItem}>
                <Text style={styles.label}>CIN</Text>
                <Text style={styles.value}>
                  {articleData?.cin || "Non spécifié"}
                </Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>Nom Complet</Text>
                <Text style={styles.value}>
                  {articleData?.nom} {articleData?.prenom}
                </Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>Email</Text>
                <Text style={styles.value}>
                  {articleData?.email || "Non spécifié"}
                </Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>Téléphone</Text>
                <Text style={styles.value}>
                  {articleData?.telephone || "Non spécifié"}
                </Text>
              </View>
              <View style={styles.fullWidth}>
                <Text style={styles.label}>Adresse</Text>
                <Text style={styles.value}>
                  {articleData?.adresse || "Non spécifiée"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Building Details Card (if applicable) */}
        {articleData?.typeDePropriete === "bati" && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardHeaderText}>Détails du Bâtiment</Text>
            </View>
            <View style={styles.cardContent}>
              <View style={styles.fullWidth}>
                <Text style={styles.label}>Surface Couverte</Text>
                <Text style={styles.value}>
                  {articleData?.surfaceCouverte} m²
                </Text>
                <Text style={styles.badge}>
                  {getSurfaceCategory(articleData?.surfaceCouverte)} (Prix de
                  référence: {getPriceReference(articleData?.surfaceCouverte)}{" "}
                  DT)
                </Text>
              </View>

              <View style={styles.fullWidth}>
                <Text style={styles.label}>Services</Text>
                <View style={styles.servicesContainer}>
                  {servicesArray.map((service: any, index: number) => (
                    <Text key={index} style={styles.serviceTag}>
                      {service.label}
                    </Text>
                  ))}
                </View>
                <Text style={styles.badge}>
                  Taux de prestation:{" "}
                  {getServiceRate(servicesArray.length, hasOtherService)}
                </Text>
              </View>

              {hasOtherService && (
                <View style={styles.fullWidth}>
                  <Text style={styles.label}>Autres Services</Text>
                  <Text style={styles.value}>{articleData?.autreService}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Tax Information Card */}
        <View style={styles.taxCard}>
          <View style={styles.taxHeader}>
            <Text style={styles.taxHeaderText}>Taxe Applicable</Text>
            <Text style={styles.taxAmount}>{articleData?.taxe} DT</Text>
          </View>
          <View style={styles.taxContent}>
            <Text style={styles.smallText}>
              Cette taxe est calculée selon les paramètres fournis et
              conformément à la réglementation en vigueur. Le paiement doit être
              effectué avant la fin de l'année fiscale.
            </Text>
            <View style={styles.footer}>
              <Text>
                Document généré le{" "}
                {format(new Date(), "dd MMMM yyyy à HH:mm", { locale: fr })} -
                Ce document a une valeur informative.
              </Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};
