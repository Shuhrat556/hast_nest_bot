const { z } = require('zod');

const mongoUriSchema = z
  .string()
  .min(1, 'MONGO_URI is required')
  .refine(
    (s) => s.startsWith('mongodb://') || s.startsWith('mongodb+srv://'),
    { message: 'MONGO_URI must start with mongodb:// or mongodb+srv://' }
  );

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  LOG_LEVEL: z
    .enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'])
    .default('info'),
  BOT_TOKEN: z.string().min(1, 'BOT_TOKEN is required'),
  MONGO_URI: mongoUriSchema,
  /** Telegram chat id (string or number from env) */
  GROUP_ID: z.preprocess(
    (v) => (v === undefined || v === null ? v : String(v).trim()),
    z.string().min(1, 'GROUP_ID is required')
  ),
  ADMIN_ID: z.coerce
    .number({
      invalid_type_error: 'ADMIN_ID must be a number',
    })
    .int('ADMIN_ID must be an integer'),
  PORT: z.preprocess((v) => {
    if (v === undefined || v === null || v === '') return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  }, z.number().int().positive().optional()),
});

/**
 * Parse and validate `process.env`. Call once at startup.
 * @returns {z.infer<typeof envSchema>}
 */
function loadEnv() {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    const detail = JSON.stringify({ fieldErrors: flat.fieldErrors }, null, 2);
    throw new Error(`Invalid environment configuration:\n${detail}`);
  }
  return parsed.data;
}

module.exports = { loadEnv, envSchema };
