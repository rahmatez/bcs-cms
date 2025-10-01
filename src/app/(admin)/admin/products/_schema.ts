import { z } from "zod";

export const productFormSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  slug: z
    .string()
    .min(2, "Slug minimal 2 karakter")
    .regex(/^[a-z0-9-]+$/, "Gunakan huruf kecil, angka, dan tanda hubung"),
  description: z.string().optional(),
  basePrice: z.coerce.number().int().nonnegative({ message: "Harga tidak boleh negatif" }),
  status: z.enum(["ACTIVE", "INACTIVE"] as const, {
    invalid_type_error: "Status tidak valid"
  }),
  coverUrl: z
    .string()
    .url("URL tidak valid")
    .optional()
    .or(z.literal("")),
  variants: z
    .array(
      z.object({
        id: z.string().optional(),
        label: z.string().min(1, "Label varian wajib diisi"),
        sku: z.string().min(1, "SKU wajib diisi"),
        stock: z.coerce.number().int().min(0, "Stok minimal 0"),
        price: z.coerce.number().int().min(0, "Harga varian minimal 0")
      })
    )
    .min(1, "Minimal satu varian")
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
