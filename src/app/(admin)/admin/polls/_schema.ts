import { z } from "zod";

export const pollOptionSchema = z.object({
  key: z
    .string()
    .min(1, "Key wajib diisi")
    .regex(/^[a-z0-9-]+$/, "Gunakan huruf kecil, angka, atau tanda hubung"),
  label: z.string().min(1, "Label wajib diisi")
});

export const pollFormSchema = z.object({
  question: z.string().min(4, "Pertanyaan minimal 4 karakter"),
  options: z.array(pollOptionSchema).min(2, "Minimal dua opsi"),
  startsAt: z.string().optional(),
  endsAt: z.string().optional()
});

export type PollFormValues = z.infer<typeof pollFormSchema>;
