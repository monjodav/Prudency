import { z } from 'zod';
import { APP_CONFIG } from './constants';

export const emailSchema = z.string().email('Cette adresse email ne semble pas valide.');

export const passwordSchema = z
  .string()
  .min(8, 'Ton mot de passe doit contenir au moins 8 caractères.')
  .regex(/[A-Z]/, "Ton mot de passe n'est pas assez robuste. Ajoute des chiffres ou des caractères spéciaux.")
  .regex(/[a-z]/, "Ton mot de passe n'est pas assez robuste. Ajoute des chiffres ou des caractères spéciaux.")
  .regex(/[0-9]/, "Ton mot de passe n'est pas assez robuste. Ajoute des chiffres ou des caractères spéciaux.");

export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Ce numéro ne semble pas valide.');

export const tripDurationSchema = z
  .number()
  .int()
  .min(APP_CONFIG.MIN_TRIP_DURATION_MINUTES, `Durée minimum: ${APP_CONFIG.MIN_TRIP_DURATION_MINUTES} minutes`)
  .max(APP_CONFIG.MAX_TRIP_DURATION_MINUTES, `Durée maximum: ${APP_CONFIG.MAX_TRIP_DURATION_MINUTES / 60} heures`);

export const coordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const createTripSchema = z.object({
  estimatedDurationMinutes: tripDurationSchema,
  departureAddress: z.string().optional(),
  departureLat: z.number().min(-90).max(90).optional(),
  departureLng: z.number().min(-180).max(180).optional(),
  arrivalAddress: z.string().optional(),
  arrivalLat: z.number().min(-90).max(90).optional(),
  arrivalLng: z.number().min(-180).max(180).optional(),
});

export const createContactSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(100),
  phone: phoneSchema,
  isPrimary: z.boolean().default(false),
});

export const sendAlertSchema = z.object({
  tripId: z.string().uuid().optional(),
  type: z.enum(['manual', 'automatic', 'timeout']),
  reason: z.string().max(500).optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  batteryLevel: z.number().int().min(0).max(100).optional(),
});

export const updateLocationSchema = z.object({
  tripId: z.string().uuid(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  accuracy: z.number().positive().optional(),
  speed: z.number().min(0).optional(),
  heading: z.number().min(0).max(360).optional(),
  batteryLevel: z.number().int().min(0).max(100).optional(),
});

export const tripNoteSchema = z.object({
  tripId: z.string().uuid(),
  content: z.string().min(1).max(1000),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
});

export type CreateTripInput = z.infer<typeof createTripSchema>;
export type CreateContactInput = z.infer<typeof createContactSchema>;
export type SendAlertInput = z.infer<typeof sendAlertSchema>;
export type UpdateLocationInput = z.infer<typeof updateLocationSchema>;
export type TripNoteInput = z.infer<typeof tripNoteSchema>;
