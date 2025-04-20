import { articlesSchema } from "@/types/articles-schema";
import bcrypt from "bcryptjs";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { z } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export async function saltAndHashPassword(pwd: string, rounds: number = 10) {
  const hashedPassword = await bcrypt.hash(pwd, rounds);
  return hashedPassword;
}
export const formatArticleForForm = (article: any) => {
  if (!article) return {};
  let formattedDate;

  // Check if article.dateDebutImposition exists and is valid
  if (
    article.dateDebutImposition &&
    !isNaN(new Date(article.dateDebutImposition).getTime())
  ) {
    formattedDate = new Date(article.dateDebutImposition);
  } else {
    formattedDate = new Date(); // Default to current date if invalid or missing
  }
  return {
    general: {
      id: article.id,
      typeDePropriete: article.typeDePropriete,
      dateDebutImposition: formattedDate,
    },
    location: {
      arrondissement: article.arrondissement,
      zone: article.zone,
      rue: article.rue,
    },
    owner: {
      cin: article.cin,
      nom: article.nom,
      prenom: article.prenom,
      email: article.email,
      adresse: article.adresse,
      telephone: article.telephone,
    },
    bati_details: {
      densiteUrbain: article.densiteUrbain,
      taxe: article.taxe,
      surfaceCouverte: article.surfaceCouverte,
      surfaceTotale: article.surfaceTotale,
      services: article.services || [],
      autreService: article.autreService || [],
    },
  };
};
export const getDefaultValues = (): z.infer<typeof articlesSchema> => ({
  general: {
    id: undefined, // Matches schema
    densiteUrbain: "moyenne", // Matches enum
    typeDePropriete: "non bati" as const, // Explicitly cast to enum type
    dateDebutImposition: new Date().toISOString(),
    surfaceTotale: null,
  },
  location: {
    arrondissement: "",
    zone: "",
    rue: "",
  },
  owner: {
    cin: "",
    nom: "",
    prenom: "",
    email: "",
    adresse: "",
    telephone: "",
  },
  bati_details: {
    taxe: null,
    surfaceCouverte: null,
    services: [],
    autreService: "",
  },
});
export const calculateTax = (
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

// Helper function to format date
export const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), "dd MMMM yyyy", { locale: fr });
  } catch (error) {
    return dateString;
  }
};

// Helper function to get category name based on surface
export const getSurfaceCategory = (surface: number) => {
  if (surface <= 100) return "Catégorie 1";
  if (surface <= 200) return "Catégorie 2";
  if (surface <= 400) return "Catégorie 3";
  return "Catégorie 4";
};

// Helper function to get price reference based on surface
export const getPriceReference = (surface: number) => {
  if (surface <= 100) return 150;
  if (surface <= 200) return 200;
  if (surface <= 400) return 250;
  return 300;
};

// Helper function to get service rate based on services count
export const getServiceRate = (
  servicesCount: number,
  hasOtherService: boolean
) => {
  if (servicesCount <= 2) return "8%";
  if (servicesCount <= 4) return "10%";
  if (servicesCount <= 6) return "12%";
  if (servicesCount > 6 || hasOtherService) return "14%";
  return "8%";
};

// Helper function to get density price
export const getDensityPrice = (density: string) => {
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
