# Image Assets

Folder ini berisi gambar-gambar yang digunakan sebagai asset di website BCS CMS.

## Struktur Folder

```
/public/images/
├── logo/                   # Logo dan emblem BCS
│   ├── EMBLEM.png         # Emblem BCS utama
│   ├── emblem b.png       # Emblem hitam
│   ├── emblem w.png       # Emblem putih
│   ├── logo-ss-black.png  # Logo horizontal hitam
│   ├── logo-ss-white.png  # Logo horizontal putih
│   └── logo.png           # Logo default
│
├── blog-top.jpg           # Header gambar untuk blog (dummy)
├── con-top.jpg            # Header untuk kontak
├── contact-img.png        # Gambar contact section
├── contact-top.png        # Top banner contact
├── favicon.png            # Favicon website
├── gal-1.jpg              # Galeri foto 1
├── gal-2.jpg              # Galeri foto 2
├── gal-3.jpg              # Galeri foto 3
├── gal-4.jpg              # Galeri foto 4
├── gal-5.jpg              # Galeri foto 5
├── gal-top.jpg            # Header galeri
├── hero1.jpg              # Hero image 1
├── hero2.JPG              # Hero image 2
├── hero3.jpg              # Hero image 3
├── square-banner.jpg      # Banner persegi
└── value-img.JPG          # Gambar untuk section value/who we are
```

## Penggunaan

### Di Homepage (`page.tsx`):
- **Logo Hero**: `/images/logo/EMBLEM.png`
- **Who We Are**: `/images/value-img.JPG`
- **Contact Section**: `/images/contact-img.png`
- **Blog Cards (dummy)**: `/images/blog-top.jpg`

### Di Header (`site-header.tsx`):
- **Logo Navigation**: `/images/logo/emblem w.png`

### Di Blog/News:
- **Default Cover**: `/images/blog-top.jpg` (jika article tidak memiliki coverUrl)

## Tips Optimasi

1. **Next.js Image Component**: Selalu gunakan komponen `<Image>` dari `next/image` untuk optimasi otomatis
2. **Sizes Prop**: Tentukan ukuran responsif dengan prop `sizes` untuk performa optimal
3. **Priority**: Gunakan `priority` untuk gambar yang muncul above the fold
4. **Fill Layout**: Gunakan `fill` dengan parent container `relative` untuk responsive images

## Contoh Penggunaan

```tsx
import Image from "next/image";

// Dengan ukuran tetap
<Image
  src="/images/logo/EMBLEM.png"
  alt="BCS Logo"
  width={120}
  height={120}
  priority
/>

// Dengan fill (responsive)
<div className="relative aspect-video">
  <Image
    src="/images/hero1.jpg"
    alt="Hero"
    fill
    className="object-cover"
    sizes="100vw"
  />
</div>
```

## Format File
- **PNG**: Untuk logo dengan transparansi
- **JPG**: Untuk foto dan gambar dengan banyak warna
- Semua gambar sudah dioptimasi oleh Next.js secara otomatis

## Source
Gambar-gambar ini dipindahkan dari: `/TEMPLATE/public/frontend/assets/img/`
