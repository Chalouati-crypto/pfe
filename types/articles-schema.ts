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
    id: "Tunis",
    name: "Tunis",
    coordinates: { lat: 36.7989, lng: 10.1765 },
    zones: [
      {
        id: "Bab El Bhar",
        name: "Bab El Bhar",
        coordinates: { lat: 36.7989, lng: 10.1765 },
        streets: [
          {
            id: "Avenue Habib-Bourguiba",
            name: "Avenue Habib-Bourguiba",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
          {
            id: "Fondouk El Ghalla",
            name: "Fondouk El Ghalla",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
          {
            id: "Place de Barcelone",
            name: "Place de Barcelone",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
          {
            id: "Quartier Lafayette",
            name: "Quartier Lafayette",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
          {
            id: "Jardin Habib-Thameur",
            name: "Jardin Habib-Thameur",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
          {
            id: "Avenue de la Liberté",
            name: "Avenue de la Liberté",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
          {
            id: "Montplaisir",
            name: "Montplaisir",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
        ],
      },
      {
        id: "Bab Souika",
        name: "Bab Souika",
        coordinates: { lat: 36.7989, lng: 10.1765 },
        streets: [
          {
            id: "Halfaouine",
            name: "Halfaouine",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
          {
            id: "Bab Saadoun",
            name: "Bab Saadoun",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
          {
            id: "Bab Laassal",
            name: "Bab Laassal",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
          {
            id: "Bab Sidi Abdessalem",
            name: "Bab Sidi Abdessalem",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
          {
            id: "Bab El Allouj",
            name: "Bab El Allouj",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
          {
            id: "Bab Souika",
            name: "Bab Souika",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
          {
            id: "Bab El Khadra",
            name: "Bab El Khadra",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
          {
            id: "Bab Lakouas",
            name: "Bab Lakouas",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
          {
            id: "Borj Zouara",
            name: "Borj Zouara",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
          {
            id: "Hammam El Remimi",
            name: "Hammam El Remimi",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
          {
            id: "Sidi Djebeli",
            name: "Sidi Djebeli",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
          {
            id: "Tronja",
            name: "Tronja",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
          {
            id: "Zaouiet El Bakria",
            name: "Zaouiet El Bakria",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
        ],
      },
      {
        id: "Médina",
        name: "Médina",
        coordinates: { lat: 36.7989, lng: 10.1765 },
        streets: [
          {
            id: "El Hafsia",
            name: "El Hafsia",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
          {
            id: "Kasbah",
            name: "Kasbah",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
          {
            id: "Sidi El Morjani",
            name: "Sidi El Morjani",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
          {
            id: "Tourbet El Bey",
            name: "Tourbet El Bey",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
          {
            id: "Place Maâkal Az-Zaïm",
            name: "Place Maâkal Az-Zaïm",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
          {
            id: "El Sabbaghine",
            name: "El Sabbaghine",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
          {
            id: "Sidi Boumendil",
            name: "Sidi Boumendil",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
          {
            id: "Bab Menara",
            name: "Bab Menara",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
          {
            id: "Bab Sidi Kacem",
            name: "Bab Sidi Kacem",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
          {
            id: "Bab Jedid",
            name: "Bab Jedid",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
        ],
      },
      {
        id: "Sidi El Béchir",
        name: "Sidi El Béchir",
        coordinates: { lat: 36.7989, lng: 10.1765 },
        streets: [
          {
            id: "Bab El Fellah",
            name: "Bab El Fellah",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
          {
            id: "Sidi El Béchir",
            name: "Sidi El Béchir",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
          {
            id: "Maakel Ezzam",
            name: "Maakel Ezzam",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
          {
            id: "Bab El Gorjani",
            name: "Bab El Gorjani",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
          {
            id: "Montfleury",
            name: "Montfleury",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
          {
            id: "Abou El Kacem Chebbi",
            name: "Abou El Kacem Chebbi",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
          {
            id: "Saïda Manoubia",
            name: "Saïda Manoubia",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
          {
            id: "Bab Alioua",
            name: "Bab Alioua",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
          {
            id: "Sidi Mansour",
            name: "Sidi Mansour",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
        ],
      },
      {
        id: "Djebel Jelloud",
        name: "Djebel Jelloud",
        coordinates: { lat: 36.7989, lng: 10.1765 },
        streets: [
          {
            id: "Sidi Fathallah",
            name: "Sidi Fathallah",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
          {
            id: "Djebel Jelloud",
            name: "Djebel Jelloud",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
          {
            id: "Ali Bach-Hamba",
            name: "Ali Bach-Hamba",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
          {
            id: "Cité Thameur",
            name: "Cité Thameur",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
          {
            id: "El Afrane",
            name: "El Afrane",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
          {
            id: "El Garjouma",
            name: "El Garjouma",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
          {
            id: "El Sebkha",
            name: "El Sebkha",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
        ],
      },
      {
        id: "El Kabaria",
        name: "El Kabaria",
        coordinates: { lat: 36.7989, lng: 10.1765 },
        streets: [
          {
            id: "El Ouardia 4",
            name: "El Ouardia 4",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
          {
            id: "El Kabaria 1",
            name: "El Kabaria 1",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
          {
            id: "El Kabaria 2",
            name: "El Kabaria 2",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
          {
            id: "El Kabaria 3",
            name: "El Kabaria 3",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
          {
            id: "El Kabaria 4",
            name: "El Kabaria 4",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
          {
            id: "Cité Ibn Sina",
            name: "Cité Ibn Sina",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
          {
            id: "Cité Bou Hjar",
            name: "Cité Bou Hjar",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
          {
            id: "El Mourouj 2",
            name: "El Mourouj 2",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
        ],
      },
      {
        id: "Séjoumi",
        name: "Séjoumi",
        coordinates: { lat: 36.7989, lng: 10.1765 },
        streets: [
          {
            id: "Cité Khaled Ibn El Oualid",
            name: "Cité Khaled Ibn El Oualid",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
          {
            id: "Cité Ibn Khaldoun",
            name: "Cité Ibn Khaldoun",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
          {
            id: "Cité Ibn Charaf",
            name: "Cité Ibn Charaf",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
          {
            id: "Cité El Wafa",
            name: "Cité El Wafa",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
          {
            id: "Cité Ennour",
            name: "Cité Ennour",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
          {
            id: "Cité Erriadh",
            name: "Cité Erriadh",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
          {
            id: "Cité El Badr",
            name: "Cité El Badr",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
          {
            id: "Cité Intilaka",
            name: "Cité Intilaka",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
          {
            id: "Zone Sebkha Séjoumi",
            name: "Zone Sebkha Séjoumi",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
        ],
      },
      {
        id: "El Ouardia",
        name: "El Ouardia",
        coordinates: { lat: 36.7989, lng: 10.1765 },
        streets: [
          {
            id: "Cité Monome",
            name: "Cité Monome",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
          {
            id: "Belle Vue",
            name: "Belle Vue",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
          {
            id: "Cité Mohamed-Ali",
            name: "Cité Mohamed-Ali",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
          {
            id: "La Cagna",
            name: "La Cagna",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
          {
            id: "Dubosville",
            name: "Dubosville",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
          {
            id: "Borj Ali Raïs",
            name: "Borj Ali Raïs",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
          {
            id: "Cité El Izdihar",
            name: "Cité El Izdihar",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
          {
            id: "El Ouardia",
            name: "El Ouardia",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
          {
            id: "Les Martyrs",
            name: "Les Martyrs",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
          {
            id: "Mathul de Ville",
            name: "Mathul de Ville",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
        ],
      },
      {
        id: "Sidi Hassine",
        name: "Sidi Hassine",
        coordinates: { lat: 36.7989, lng: 10.1765 },
        streets: [
          {
            id: "Sidi Hassine",
            name: "Sidi Hassine",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
          {
            id: "Cité El Ghezala",
            name: "Cité El Ghezala",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
          {
            id: "Cité Ibn Khaldoun",
            name: "Cité Ibn Khaldoun",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
          {
            id: "Cité El Amine",
            name: "Cité El Amine",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
          {
            id: "Cité El Kheir",
            name: "Cité El Kheir",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
          {
            id: "Cité Ennahda",
            name: "Cité Ennahda",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
          {
            id: "Cité El Manar",
            name: "Cité El Manar",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
        ],
      },
      {
        id: "Ezzouhour",
        name: "Ezzouhour",
        coordinates: { lat: 36.7989, lng: 10.1765 },
        streets: [
          {
            id: "Cité des Officiers",
            name: "Cité des Officiers",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
          {
            id: "Cité Essaada",
            name: "Cité Essaada",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
          {
            id: "Cité Essomrane",
            name: "Cité Essomrane",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
          {
            id: "Cité Ezzouhour",
            name: "Cité Ezzouhour",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
          {
            id: "Ezzouhour 4",
            name: "Ezzouhour 4",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
        ],
      },
      {
        id: "Hraïria",
        name: "Hraïria",
        coordinates: { lat: 36.7989, lng: 10.1765 },
        streets: [
          {
            id: "Cité Hraïria",
            name: "Cité Hraïria",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
          {
            id: "Cité El Gharbi",
            name: "Cité El Gharbi",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
          {
            id: "Cité Ennour",
            name: "Cité Ennour",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
          {
            id: "Cité El Amal",
            name: "Cité El Amal",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
          {
            id: "Cité El Khadra",
            name: "Cité El Khadra",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
          {
            id: "Cité El Menzeh",
            name: "Cité El Menzeh",
            coordinates: { lat: 36.7989, lng: 10.1765 },
          },
        ],
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
  x: z.string().max(100),
  y: z.string().max(100),
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
  // status: OppsitionStatusEnum.default("active"),
});

export type Article = z.infer<typeof articleSchema>;
export type OppositionStatus = z.infer<typeof OppsitionStatusEnum>;
