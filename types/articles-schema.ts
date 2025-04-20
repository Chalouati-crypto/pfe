import { z } from "zod";

// Enum for property type
export const propertyTypeEnum = z.enum(["bati", "non bati"]);

// Enum for urban density

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

// Create enum schemas
const PropertyTypeEnum = z.enum(["bati", "non bati"]);
const DensityEnum = z.enum(["haute", "moyenne", "basse"]);
const OppsitionStatusEnum = z.enum([
  "active",
  "opposition_pending",
  "opposition_approved",
  "opposition_refused",
]);

export const articleSchema = z.object({
  // General Section
  id: z.number().optional(),
  typeDePropriete: PropertyTypeEnum,
  dateDebutImposition: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Date must be in YYYY-MM-DD format",
  }),
  surfaceTotale: z.coerce.number().optional(),
  densiteUrbain: DensityEnum.optional(),

  // Location Section
  arrondissement: z.string().max(100).nonempty(),
  zone: z.string().max(100).nonempty(),
  rue: z.string().max(100).nonempty(),
  number: z.number(),
  // Owner Section
  cin: z.string().max(50).nonempty(),
  nom: z.string().max(100).nonempty(),
  prenom: z.string().max(100).nonempty(),
  email: z.string().email().max(100).nonempty(),
  adresse: z.string().max(255).nonempty(),
  telephone: z.string().max(50).nonempty(),
  taxe: z.coerce.number().optional(),

  // Bâti Details (Optional)
  surfaceCouverte: z.coerce.number().optional(),
  services: z
    .array(
      z.object({
        id: z.string(),
        label: z.string().optional(),
      })
    )
    .optional(),
  autreService: z.string().optional(),
  archive: z.boolean().optional(),
  status: OppsitionStatusEnum.default("active"),
});

export type Article = z.infer<typeof articleSchema>;
export type OppositionStatus = z.infer<typeof OppsitionStatusEnum>;
