import { describe, it, expect } from "vitest";

import { matchFormSchema } from "@/app/(admin)/matches/_schema";
import { pageFormSchema } from "@/app/(admin)/pages/_schema";
import { pollFormSchema } from "@/app/(admin)/polls/_schema";
import { productFormSchema } from "@/app/(admin)/products/_schema";

describe("validation schemas", () => {
  it("accepts valid match form values", () => {
    const result = matchFormSchema.safeParse({
      opponent: "Persija",
      eventDate: "2024-08-01T19:00",
      venue: "Stadion Mandala Krida",
      competition: "Liga 1",
      status: "SCHEDULED",
      scoreHome: "2",
      scoreAway: "1",
      highlightText: "Menang dramatis",
      highlightUrl: "https://youtu.be/highlight"
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid match score", () => {
    const result = matchFormSchema.safeParse({
      opponent: "Persija",
      eventDate: "2024-08-01T19:00",
      venue: "Stadion Mandala Krida",
      competition: "Liga 1",
      status: "SCHEDULED",
      scoreHome: "abc"
    });
    expect(result.success).toBe(false);
  });

  it("enforces slug pattern for static pages", () => {
    const result = pageFormSchema.safeParse({
      title: "Tentang BCS",
      slug: "about-bcs",
      body: "Konten lengkap mengenai BCS",
      status: "PUBLISHED",
      publishedAt: "2024-07-01T10:00"
    });
    expect(result.success).toBe(true);

    const invalid = pageFormSchema.safeParse({
      title: "Tentang BCS",
      slug: "ABOUT!!!",
      body: "Konten",
      status: "DRAFT"
    });
    expect(invalid.success).toBe(false);
  });

  it("requires at least two poll options", () => {
    const valid = pollFormSchema.safeParse({
      question: "Prediksi skor?",
      options: [
        { key: "win", label: "Menang" },
        { key: "draw", label: "Seri" }
      ],
      startsAt: "2024-07-01T10:00",
      endsAt: "2024-07-02T10:00"
    });
    expect(valid.success).toBe(true);

    const invalid = pollFormSchema.safeParse({
      question: "Prediksi skor?",
      options: [{ key: "win", label: "Menang" }]
    });
    expect(invalid.success).toBe(false);
  });

  it("normalises product variant input", () => {
    const result = productFormSchema.safeParse({
      name: "T-shirt",
      slug: "t-shirt",
      description: "Kaos nyaman",
      basePrice: 100000,
      status: "ACTIVE",
      coverUrl: "https://example.com/cover.jpg",
      variants: [
        {
          label: "Size M",
          sku: "TSHIRT-M",
          stock: 10,
          price: 110000
        }
      ]
    });
    expect(result.success).toBe(true);
  });
});
