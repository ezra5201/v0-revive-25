import { z } from "zod"

// ============================================================================
// SHARED SCHEMAS
// ============================================================================

export const ClientNameSchema = z
  .string()
  .min(1, "Client name is required")
  .max(255, "Client name must be 255 characters or less")
  .trim()

export const ProviderNameSchema = z
  .string()
  .min(1, "Provider name is required")
  .max(255, "Provider name must be 255 characters or less")
  .trim()

export const UUIDSchema = z.string().uuid("Invalid UUID format").optional().nullable()

export const EmailSchema = z.string().email("Invalid email format").max(255)

export const DateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
  .optional()
  .nullable()

export const PhoneSchema = z.string().max(20, "Phone number must be 20 characters or less").optional().nullable()

export const NotesSchema = z.string().max(2000, "Notes must be 2000 characters or less").optional().nullable()

// ============================================================================
// CONTACT SCHEMAS
// ============================================================================

export const CreateContactSchema = z.object({
  client_name: ClientNameSchema,
  provider_name: ProviderNameSchema,
  contact_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  category: z.enum(["Client", "Prospect", "CM", "OT"], {
    errorMap: () => ({ message: "Category must be one of: Client, Prospect, CM, OT" }),
  }),
  services_requested: z.array(z.string()).default([]),
  services_provided: z.array(z.any()).default([]), // Can be more specific based on your service structure
  comments: z.string().max(2000, "Comments must be 2000 characters or less").optional().default(""),
  food_accessed: z.boolean().optional().default(false),
  location: z.string().max(255).optional().nullable(),
})

export const UpdateContactSchema = CreateContactSchema.partial()

// ============================================================================
// CLIENT SCHEMAS
// ============================================================================

export const CreateClientSchema = z.object({
  name: ClientNameSchema,
  category: z.enum(["Client", "Prospect"]).default("Prospect"),
  dob: DateSchema,
  gender: z.string().max(50).optional().nullable(),
  phone: PhoneSchema,
  email: EmailSchema.optional().nullable(),
  address: z.string().max(500).optional().nullable(),
})

// ============================================================================
// GOAL SCHEMAS (CM and OT)
// ============================================================================

export const CreateGoalSchema = z.object({
  client_name: ClientNameSchema,
  client_uuid: UUIDSchema,
  goal_text: z.string().min(1, "Goal text is required").max(500, "Goal text must be 500 characters or less").trim(),
  target_date: DateSchema,
  priority: z
    .number()
    .int("Priority must be an integer")
    .min(1, "Priority must be between 1 and 5")
    .max(5, "Priority must be between 1 and 5")
    .optional()
    .default(1),
  checkin_id: z.number().int().positive().optional().nullable(),
})

export const UpdateGoalSchema = z.object({
  goal_text: z
    .string()
    .min(1, "Goal text is required")
    .max(500, "Goal text must be 500 characters or less")
    .trim()
    .optional(),
  target_date: DateSchema.optional(),
  priority: z
    .number()
    .int("Priority must be an integer")
    .min(1, "Priority must be between 1 and 5")
    .max(5, "Priority must be between 1 and 5")
    .optional(),
  status: z.enum(["Not Started", "In Progress", "Completed", "Deferred"]).optional(),
  progress_note: z.string().max(1000, "Progress note must be 1000 characters or less").optional(),
})

// ============================================================================
// CHECK-IN SCHEMAS (CM and OT)
// ============================================================================

export const CreateCheckinSchema = z.object({
  contact_id: z.number().int().positive().optional().nullable(),
  client_name: ClientNameSchema,
  client_uuid: UUIDSchema,
  provider_name: ProviderNameSchema,
  notes: NotesSchema,
})

export const UpdateCheckinSchema = z.object({
  notes: NotesSchema.optional(),
  status: z.enum(["Draft", "Submitted", "Completed", "Cancelled"]).optional(),
})

// ============================================================================
// INTAKE FORM SCHEMAS
// ============================================================================

export const CreateIntakeFormSchema = z.object({
  client_id: z.number().int().positive(),
  name: z.string().max(255).optional().nullable(),
  pronouns: z.string().max(50).optional().nullable(),
  date_of_birth: DateSchema,
  birth_year: z.number().int().min(1900).max(new Date().getFullYear()).optional().nullable(),
  program: z.string().max(100).optional().nullable(),
  how_heard_about_us: z.string().max(500).optional().nullable(),
  needs: z.array(z.string()).default([]),
  see_staff: z.array(z.string()).default([]),
  other_support: z.string().max(1000).optional().nullable(),
  languages: z.array(z.string()).default([]),
  current_housing_status: z.array(z.string()).default([]),
  past_housing_status: z.array(z.string()).default([]),
  race: z.string().max(100).optional().nullable(),
  ethnicity: z.string().max(50).optional().nullable(),
  gender: z.string().max(50).optional().nullable(),
  is_disabled: z.boolean().optional().nullable(),
  is_veteran: z.boolean().optional().nullable(),
  employment_status: z.string().max(50).optional().nullable(),
  income_sources: z.array(z.string()).default([]),
  goal_1: z.string().max(500).optional().nullable(),
  goal_2: z.string().max(500).optional().nullable(),
  goal_3: z.string().max(500).optional().nullable(),
  phone: PhoneSchema,
  email: EmailSchema.optional().nullable(),
  preferred_contact_method: z.string().max(100).optional().nullable(),
  emergency_contact_name: z.string().max(255).optional().nullable(),
  emergency_contact_relationship: z.string().max(100).optional().nullable(),
  emergency_contact_phone: PhoneSchema,
})

// ============================================================================
// OUTREACH SCHEMAS
// ============================================================================

export const CreateOutreachClientSchema = z.object({
  first_name: z.string().max(255).optional().nullable(),
  last_name: z.string().max(255).optional().nullable(),
  nickname: z.string().max(255).optional().nullable(),
  date_of_birth: DateSchema,
  gender: z.string().max(50).optional().nullable(),
  phone: PhoneSchema,
})

export const CreateOutreachContactSchema = z.object({
  run_id: z.number().int().positive().optional().nullable(),
  client_id: z.number().int().positive().optional().nullable(),
  location_id: z.number().int().positive().optional().nullable(),
  staff_member: z.string().min(1, "Staff member is required").max(255),
  services_provided: z.string().max(500).optional().nullable(),
  supplies_given: z.array(z.string()).default([]),
  narcan_administered: z.boolean().default(false),
  medical_concerns: z.string().max(1000).optional().nullable(),
  housing_status: z.string().max(100).optional().nullable(),
  follow_up_needed: z.boolean().default(false),
  follow_up_notes: z.string().max(1000).optional().nullable(),
  is_new_client: z.boolean().default(false),
  new_client_first_name: z.string().max(255).optional().nullable(),
  new_client_last_name: z.string().max(255).optional().nullable(),
})

export const CreateOutreachLocationSchema = z.object({
  name: z.string().min(1, "Location name is required").max(255),
  intersection: z.string().max(255).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
  safety_concerns: z.string().max(1000).optional().nullable(),
})

export const UpdateOutreachLocationSchema = CreateOutreachLocationSchema.partial().extend({
  is_active: z.boolean().optional(),
})

// ============================================================================
// USER MANAGEMENT SCHEMAS
// ============================================================================

export const CreateUserSchema = z
  .object({
    email: EmailSchema,
    can_view_client_demographics: z.boolean().default(false),
    can_view_client_services: z.boolean().default(false),
    can_view_all_clients: z.boolean().default(false),
    can_export_client_data: z.boolean().default(false),
    can_manage_users: z.boolean().default(false),
    can_manage_system_settings: z.boolean().default(false),
    can_view_audit_logs: z.boolean().default(false),
    can_manage_database: z.boolean().default(false),
    can_create_contacts: z.boolean().default(false),
    can_edit_own_contacts: z.boolean().default(false),
    can_edit_all_contacts: z.boolean().default(false),
    can_delete_contacts: z.boolean().default(false),
  })
  .refine((data) => Object.values(data).some((val) => val === true && typeof val === "boolean"), {
    message: "At least one permission must be enabled",
  })

export const UpdateUserSchema = CreateUserSchema.omit({ email: true }).partial().extend({
  active: z.boolean().optional(),
})

// ============================================================================
// HELPER FUNCTION FOR VALIDATION
// ============================================================================

export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown) {
  const result = schema.safeParse(data)

  if (!result.success) {
    const errors = result.error.format()
    return {
      success: false,
      errors,
      formattedError: {
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        details: result.error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      },
    }
  }

  return {
    success: true,
    data: result.data,
  }
}
