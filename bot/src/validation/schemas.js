const { z } = require('zod');

const addRoomPayloadSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Room name is required')
    .max(200, 'Room name must be at most 200 characters'),
  capacity: z.coerce
    .number({ invalid_type_error: 'Capacity must be a number' })
    .int('Capacity must be a whole number')
    .min(0, 'Capacity cannot be negative')
    .max(1_000_000, 'Capacity is too large'),
});

/**
 * @param {string | undefined} messageText
 * @returns {{ success: true, data: { name: string, capacity: number } } | { success: false, error: z.ZodError | null, message: string }}
 */
function parseAddRoomCommand(messageText) {
  const raw = typeof messageText === 'string' ? messageText : '';
  const rest = raw.replace(/^\/addroom(?:@\w+)?\s*/i, '').trim();
  const parts = rest.split(/\s+/);

  if (parts.length < 2) {
    return {
      success: false,
      error: null,
      message: 'Usage: /addroom <name> <capacity>\nExample: /addroom Conference A 12',
    };
  }

  const capStr = parts[parts.length - 1];
  const name = parts.slice(0, -1).join(' ').trim();
  const result = addRoomPayloadSchema.safeParse({
    name,
    capacity: capStr,
  });

  if (!result.success) {
    return { success: false, error: result.error, message: '' };
  }

  return { success: true, data: result.data };
}

const reasonTextSchema = z
  .string()
  .max(4000, 'Reason is too long (max 4000 characters)')
  .transform((s) => s.trim())
  .pipe(z.string().min(1, 'Reason cannot be empty'));

const objectIdStringSchema = z
  .string()
  .min(1)
  .regex(/^[a-fA-F0-9]{24}$/, 'Invalid room id');

const countCallbackSchema = z.coerce
  .number()
  .int()
  .min(0, 'Count cannot be negative');

/**
 * @param {z.ZodError} err
 * @returns {string}
 */
function formatZodError(err) {
  return err.issues.map((i) => i.message).join('; ');
}

module.exports = {
  addRoomPayloadSchema,
  parseAddRoomCommand,
  reasonTextSchema,
  objectIdStringSchema,
  countCallbackSchema,
  formatZodError,
};
