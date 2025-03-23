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
    typeDePropriete: "non bati" as const, // Explicitly cast to enum type
    dateDebutImposition: new Date().toISOString(),
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
    densiteUrbain: "moyenne", // Matches enum
    taxe: null,
    surfaceCouverte: null,
    surfaceTotale: null,
    services: [],
    autreService: "",
  },
});
