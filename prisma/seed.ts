import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hash("admin123", 10);

  const superAdmin = await prisma.user.upsert({
    where: { email: "admin@bcs.com" },
    update: {},
    create: {
      email: "admin@bcs.com",
      name: "Super Admin",
      passwordHash,
      role: "SUPER_ADMIN",
      status: "ACTIVE"
    }
  });

  const categories = await Promise.all(
    [
      { name: "Berita", slug: "berita" },
      { name: "Opini", slug: "opini" },
      { name: "Komunitas", slug: "komunitas" }
    ].map((category) =>
      prisma.category.upsert({
        where: { slug: category.slug },
        update: {},
        create: category
      })
    )
  );

  const article = await prisma.article.upsert({
    where: { slug: "selamat-datang-bcs" },
    update: {},
    create: {
      title: "Selamat Datang di CMS Brigata Curva Sud",
      slug: "selamat-datang-bcs",
      excerpt: "Portal resmi untuk mengelola berita, pertandingan, dan merchandise BCS.",
      body: "## Halo Curva Sud!\n\nInilah pusat kendali semua konten BCS. Perbarui berita, jadwal pertandingan, dan merchandise dengan mudah.",
      coverUrl: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef",
      status: "PUBLISHED",
      authorId: superAdmin.id,
      publishedAt: new Date()
    }
  });

  await prisma.articleCategory.upsert({
    where: {
      articleId_categoryId: {
        articleId: article.id,
        categoryId: categories[0].id
      }
    },
    update: {},
    create: {
      articleId: article.id,
      categoryId: categories[0].id
    }
  });

  await prisma.page.upsert({
    where: { slug: "about" },
    update: {},
    create: {
      title: "Tentang Brigata Curva Sud",
      slug: "about",
      body: "## Tentang BCS\n\nBrigata Curva Sud adalah gerakan suporter kreatif dan kolektif.",
      status: "PUBLISHED",
      publishedAt: new Date()
    }
  });

  await prisma.match.upsert({
    where: { id: "seed-match" },
    update: {
      opponent: "Persija",
      eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      venue: "Stadion Mandala Krida",
      competition: "Liga 1",
      status: "SCHEDULED"
    },
    create: {
      id: "seed-match",
      opponent: "Persija",
      eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      venue: "Stadion Mandala Krida",
      competition: "Liga 1",
      status: "SCHEDULED"
    }
  });

  const product = await prisma.product.upsert({
    where: { slug: "jersey-home-2025" },
    update: {},
    create: {
      name: "Jersey Home 2025",
      slug: "jersey-home-2025",
      description: "Jersey edisi spesial Brigata Curva Sud musim 2025.",
      basePrice: 350000,
      status: "ACTIVE",
      coverUrl: "https://images.unsplash.com/photo-1517649763962-0c623066013b"
    }
  });

  const variant = await prisma.productVariant.upsert({
    where: { sku: "BCS-JERSEY-25-M" },
    update: { stock: 25, price: 375000 },
    create: {
      productId: product.id,
      sku: "BCS-JERSEY-25-M",
      stock: 25,
      price: 375000,
      optionJson: { label: "Size M" }
    }
  });

  await prisma.coupon.upsert({
    where: { code: "BCS30" },
    update: {},
    create: {
      code: "BCS30",
      type: "PERCENT",
      value: 30,
      startsAt: new Date(),
      endsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    }
  });

  await prisma.poll.upsert({
    where: { id: "seed-poll" },
    update: {},
    create: {
      id: "seed-poll",
      question: "Prediksi skor pertandingan selanjutnya?",
      optionsJson: {
        win: "Menang",
        draw: "Seri",
        lose: "Kalah"
      },
      status: "ACTIVE"
    }
  });

  await prisma.order.upsert({
    where: { id: "seed-order" },
    update: {},
    create: {
      id: "seed-order",
      userId: superAdmin.id,
      total: 375000,
      discount: 0,
      finalTotal: 375000,
      status: "PAID",
      paymentMethod: "TRANSFER",
      shippingAddressJson: {
        name: "Super Admin",
        address: "Jl. Malioboro No. 1",
        city: "Yogyakarta",
        postalCode: "55131"
      }
    }
  });

  await prisma.orderItem.upsert({
    where: { id: "seed-order-item" },
    update: {},
    create: {
      id: "seed-order-item",
      orderId: "seed-order",
      productVariantId: variant.id,
      qty: 1,
      price: 375000
    }
  });

  console.log("Seed data created. Credentials: admin@bcs.com / admin123");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
