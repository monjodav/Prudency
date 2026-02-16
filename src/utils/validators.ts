import { z } from 'zod';
import { APP_CONFIG } from './constants';

export const emailSchema = z.string().email('Email invalide');

export const passwordSchema = z
  .string()
  .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
  .regex(/[A-Z]/, 'Le mot de passe doit contenir une majuscule')
  .regex(/[a-z]/, 'Le mot de passe doit contenir une minuscule')
  .regex(/[0-9]/, 'Le mot de passe doit contenir un chiffre');

export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Numéro de téléphone invalide (format E.164)');

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
  departureCoords: coordinatesSchema.optional(),
  arrivalAddress: z.string().optional(),
  arrivalCoords: coordinatesSchema.optional(),
});

export const createContactSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(100),
  phone: phoneSchema,
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  isPrimary: z.boolean().default(false),
  notifyByPush: z.boolean().default(true),
  notifyBySms: z.boolean().default(true),
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
