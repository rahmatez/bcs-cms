#!/usr/bin/env node

/**
 * Script untuk memperbaiki implicit 'any' types di semua file
 * Menambahkan type annotations berdasarkan konteks
 */

const fs = require('fs');
const path = require('path');

// Mapping file dan lokasi error yang perlu diperbaiki
const fixes = [
  // Comments page
  {
    file: 'src/app/(admin)/comments/page.tsx',
    changes: [
      {
        search: /const sortedComments = comments\.sort\((comment[12]?, comment[12]?)\) =>/,
        replace: 'const sortedComments = comments.sort((comment1: CommentWithUser, comment2: CommentWithUser) =>'
      },
      {
        search: /const contentMap = await Promise\.all\(\[\s+prisma\.article\.findMany\(\{ select: \{ id: true, slug: true, title: true \} \}\),\s+prisma\.product\.findMany\(\{ select: \{ id: true, slug: true, name: true \} \}\)\s+\]\)\.then\(\[\(?article[s]?\)?, \(?product[s]?\)?\]/,
        replace: 'const contentMap = await Promise.all([\n    prisma.article.findMany({ select: { id: true, slug: true, title: true } }),\n    prisma.product.findMany({ select: { id: true, slug: true, name: true } })\n  ]).then(([articles, products]: [ArticleRef[], ProductRef[]]'
      },
      {
        search: /\{comments\.map\(\(comment\) =>/,
        replace: '{comments.map((comment: CommentWithUser) =>'
      }
    ],
    addTypes: 'type CommentWithUser = Awaited<ReturnType<typeof listAllComments>>[number];\ntype ArticleRef = { id: string; slug: string; title: string };\ntype ProductRef = { id: string; slug: string; name: string };'
  },
  
  // Coupons page
  {
    file: 'src/app/(admin)/coupons/page.tsx',
    changes: [
      {
        search: /\{coupons\.map\(\(coupon\) =>/,
        replace: '{coupons.map((coupon: CouponItem) =>'
      }
    ],
    addTypes: 'type CouponItem = Awaited<ReturnType<typeof listCoupons>>[number];'
  },

  // Products page (admin)
  {
    file: 'src/app/(admin)/products/page.tsx',
    changes: [
      {
        search: /\{products\.map\(\(product\) => \{/,
        replace: '{products.map((product: ProductItem) => {'
      },
      {
        search: /const totalStock = product\.variants\.reduce\(\(sum, variant\) =>/,
        replace: 'const totalStock = product.variants.reduce<number>((sum, variant) =>'
      }
    ],
    addTypes: 'type ProductItem = Awaited<ReturnType<typeof listAdminProducts>>[number];'
  },

  // Orders page
  {
    file: 'src/app/(admin)/orders/page.tsx',
    changes: [
      {
        search: /\{orders\.map\(\(order\) =>/,
        replace: '{orders.map((order: OrderItem) =>'
      }
    ],
    addTypes: 'type OrderItem = Awaited<ReturnType<typeof listOrders>>[number];'
  }
];

console.log('🔧 Memperbaiki implicit any types...\n');

fixes.forEach(({ file, changes, addTypes }) => {
  const filePath = path.join(__dirname, '..', file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⏩ Skip: ${file} (tidak ditemukan)`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Tambahkan type definitions jika ada
  if (addTypes) {
    // Cari posisi setelah imports dan sebelum komponen
    const insertPos = content.search(/\n\nexport (default )?(async )?function/);
    if (insertPos > 0) {
      content = content.slice(0, insertPos) + '\n\n' + addTypes + '\n' + content.slice(insertPos);
      modified = true;
    }
  }

  // Terapkan perubahan
  changes.forEach(({ search, replace }) => {
    if (content.match(search)) {
      content = content.replace(search, replace);
      modified = true;
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed: ${file}`);
  } else {
    console.log(`⚠️  No changes: ${file}`);
  }
});

console.log('\n✨ Selesai!');
