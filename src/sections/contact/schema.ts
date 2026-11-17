import { z } from "zod";

export const contactProps = z.object({
  heading: z.string(),
  body: z.string().optional(),
  email: z.string().optional().describe("Real address only. The form needs it; without one the section shows phone and address."),
  phone: z.string().optional(),
  address: z.string().optional(),
  hours: z.array(z.string()).optional().describe("e.g. ['Mon-Fri 7am-6pm', 'Sat 8am-2pm']"),
  fields: z
    .array(
      z.object({
        name: z.string().describe("lowercase, no spaces"),
        label: z.string(),
        type: z.enum(["text", "email", "tel", "textarea"]),
        required: z.boolean(),
      }),
    )
    .describe("2-5 fields"),
  submitLabel: z.string().describe("Says what happens, e.g. 'Request a quote'"),
});

export type ContactProps = z.infer<typeof contactProps>;
