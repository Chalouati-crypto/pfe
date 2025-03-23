import { z } from "zod";

// Enum for property type
export const propertyTypeEnum = z.enum(["bati", "non bati"]);

// Enum for urban density
const densityEnum = z.enum(["haute", "moyenne", "basse"]).nullable().optional();
type DensityType = z.infer<typeof densityEnum>;
export type ArticleResult = {
  id: number;
  typeDePropriete: "bati" | "non bati";
  dateDebutImposition: string;
  arrondissement: string;
  zone: string;
  rue: string;
  cin: string;
  nom: string;
  prenom: string;
  email: string;
  adresse: string;
  telephone: string;

  // Optional bati_details
  surfaceTotale?: string | null;
  surfaceCouverte?: string | null;
  services?: ServiceType[] | null;
  densiteUrbain?: DensityType | null;
  autreService?: "" | null;
  taxe?: string | null;
};
export type ServiceType = {
  id: string;
  label?: string;
};

export const arrondissement = [
  {
    name: "Tunis",
    zones: [
      {
        name: "Centre-ville",
        streets: [
          "Avenue Habib Bourguiba",
          "Rue de Marseille",
          "Rue Al Jazira",
        ],
      },
      {
        name: "Lafayette",
        streets: ["Rue de Russie", "Rue d'Algérie", "Rue de Turquie"],
      },
      {
        name: "El Menzah",
        streets: [
          "Rue du Lac Biwa",
          "Rue du Lac Tanganyika",
          "Rue du Lac Ontario",
        ],
      },
      {
        name: "Cité El Khadra",
        streets: ["Rue de Palestine", "Rue de Syrie", "Rue de Liban"],
      },
    ],
  },
] as const;

// List of available services
export const services = [
  { id: "Nettoyage", label: "Nettoyage" },
  { id: "Éclairage public", label: "Éclairage public" },
  { id: "Voies pavées", label: "Voies pavées" },
  { id: "Drainage des eaux usées", label: "Drainage des eaux usées" },
  { id: "Drainage des eaux pluviales", label: "Drainage des eaux pluviales" },
  { id: "Trottoirs pavés", label: "Trottoirs pavés" },
  { id: "Autres", label: "Autres" },
] as const;

export const servicesSchema = z.array(
  z.object({
    id: z.string(),
    label: z.string().optional(),
  })
);

// **Main Zod Schema**
export const articlesSchema = z.object({
  general: z.object({
    id: z.number().int().positive().optional(),
    typeDePropriete: propertyTypeEnum,
    dateDebutImposition: z.preprocess((arg) => {
      if (arg instanceof Date) {
        // Convert Date object to ISO string and extract the date portion
        return arg.toISOString().split("T")[0];
      }
      return arg;
    }, z.string()),
  }),
  location: z.object({
    arrondissement: z.string().min(1).max(100),
    zone: z.string().min(1).max(100),
    rue: z.string().min(1).max(100),
  }),
  owner: z.object({
    cin: z.string().min(1).max(50),
    nom: z.string().min(1).max(100),
    prenom: z.string().min(1).max(100),
    email: z.string().email().max(100),
    adresse: z.string().min(1).max(255),
    telephone: z.string().min(1).max(50),
  }),
  bati_details: z
    .object({
      surfaceTotale: z.preprocess(
        (val) => (typeof val === "string" ? Number(val) : val),
        z.number().optional().nullable()
      ),
      surfaceCouverte: z.preprocess(
        (val) => (typeof val === "string" ? Number(val) : val),
        z.number().optional().nullable()
      ),
      services: servicesSchema.optional(),
      densiteUrbain: densityEnum.optional(),
      autreService: z.preprocess(
        (val) => (Array.isArray(val) ? val.join(",") : val),
        z.string().optional().nullable()
      ),

      taxe: z.string().optional().nullable(),
    })
    .optional(),
});
