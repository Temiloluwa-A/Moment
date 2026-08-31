const { z } = require('zod');

// Loosely typed on purpose — timer.model.js (Mongoose) remains the source of
// truth for full validation. These schemas exist to reject obviously bad or
// missing input early with a clear message, not to duplicate every Mongoose
// constraint (background/trigger/borderStyle sub-shapes especially).

// isGift/isPublic/notify arrive as real booleans over a plain JSON body, but
// as the strings 'true'/'false' over multipart form-data (when a file is
// attached — see Customize.jsx's FormData branch) — accept both without
// misreading the string "false" as truthy.
const flexBoolean = z.union([z.boolean(), z.enum(['true', 'false'])])
    .transform((v) => v === true || v === 'true')
    .optional();

const backgroundSchema = z.object({
    type: z.enum(['solid', 'gradient', 'image']),
    value: z.string().min(1, "A background value is required."),
}).passthrough().optional();

const triggerSchema = z.object({
    type: z.enum(['preset', 'custom']),
}).passthrough().optional();

const customizationSchema = z.object({
    background: backgroundSchema,
    trigger: triggerSchema,
}).passthrough().optional();

const baseMomentSchema = z.object({
    title: z.string().optional(),
    mode: z.enum(['countup', 'countdown']),
    timeZone: z.string().min(1, "Time zone is required."),
    startAt: z.string().optional().nullable(),
    endAt: z.string().optional().nullable(),
    units: z.object({}).passthrough().optional(),
    isGift: flexBoolean,
    isPublic: flexBoolean,
    notify: flexBoolean,
    customization: customizationSchema,
}).passthrough();

const createMomentSchema = baseMomentSchema;
const updateMomentSchema = baseMomentSchema.partial();

module.exports = { createMomentSchema, updateMomentSchema };
