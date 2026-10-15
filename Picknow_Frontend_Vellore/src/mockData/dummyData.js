// ============================================================
// DUMMY DATA — SHRI DEEPAALAYA SILKS
// Complete offline catalog: Silk Sarees, Bridal Wear, Ethnic Wear & Heirloom Jewellery
// ============================================================

export const DUMMY_CATEGORIES = [
  {
    _id: "cat_silk_sarees",
    cName: "Silk Sarees",
    cDescription: "Pure Kanchipuram, Banarasi & Soft Silk sarees with pure gold zari",
    cImage: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80",
    cStatus: 1,
    subCategories: [
      { _id: "sub_kanchi", name: "Kanchipuram Silk", status: 1 },
      { _id: "sub_banarasi", name: "Banarasi Silk", status: 1 },
      { _id: "sub_soft_silk", name: "Soft Silk", status: 1 },
      { _id: "sub_tussar", name: "Tussar Silk", status: 1 }
    ]
  },
  {
    _id: "cat_bridal_wear",
    cName: "Bridal Collection",
    cDescription: "Heirloom bridal silk sarees, royal reception lehengas and wedding sets",
    cImage: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80",
    cStatus: 1,
    subCategories: [
      { _id: "sub_bridal_saree", name: "Bridal Silk Sarees", status: 1 },
      { _id: "sub_muhurtham", name: "Muhurtham Sarees", status: 1 },
      { _id: "sub_lehengas", name: "Bridal Lehengas", status: 1 }
    ]
  },
  {
    _id: "cat_womens_wear",
    cName: "Women's Ethnic Wear",
    cDescription: "Designer silk Anarkalis, handcrafted kurtis, palazzo suits and blouses",
    cImage: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80",
    cStatus: 1,
    subCategories: [
      { _id: "sub_anarkali", name: "Anarkali Suits", status: 1 },
      { _id: "sub_kurtis", name: "Kurtis & Sets", status: 1 },
      { _id: "sub_blouses", name: "Designer Blouses", status: 1 }
    ]
  },
  {
    _id: "cat_jewellery",
    cName: "Heirloom Jewellery",
    cDescription: "22K gold-finish temple jewellery, antique kasu malai, and polki sets",
    cImage: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80",
    cStatus: 1,
    subCategories: [
      { _id: "sub_temple", name: "Temple Jewellery", status: 1 },
      { _id: "sub_bridal_jewel", name: "Bridal Jewellery Sets", status: 1 },
      { _id: "sub_antique", name: "Antique Gold Finish", status: 1 },
      { _id: "sub_kundan", name: "Kundan & Polki", status: 1 }
    ]
  },
  {
    _id: "cat_cotton_sarees",
    cName: "Cotton & Daily Sarees",
    cDescription: "Handloom Chettinad, breathable Chanderi, and pure linen sarees",
    cImage: "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=600&q=80",
    cStatus: 1,
    subCategories: [
      { _id: "sub_chettinad", name: "Chettinad Cotton", status: 1 },
      { _id: "sub_chanderi", name: "Chanderi Cotton", status: 1 }
    ]
  }
];

export const DUMMY_PRODUCTS = [
  // ── Saree 1 ──────────────────────────────────────────────────
  {
    _id: "prod_kanchi_1",
    pName: "Crimson Red Kanchipuram Pure Silk Saree",
    pShortDescription: "Authentic handwoven Kanchipuram pure silk saree with heavy gold zari korvai border.",
    pDescription: "Exquisite handwoven Kanchipuram pure silk saree in celebratory crimson red. Features intricate gold zari korvai border with traditional Mayil (peacock) and Rudraksham motifs. Woven with pure mulberry silk and certified silk mark. Includes unstitched matching pure silk blouse piece (0.8m). Perfect for weddings, muhurtham, and grand celebrations.",
    pPrice: 28500,
    pMrp: 38000,
    pPreviousPrice: 38000,
    price: 28500,
    mrp: 38000,
    pOffer: 25,
    pStock: 12,
    stock: 12,
    pSold: 46,
    pRating: 4.9,
    pCategory: "Silk Sarees",
    pSubCategory: "Kanchipuram Silk",
    pBrand: "Shri Deepaalaya Silks",
    pType: "normal",
    pStatus: "Active",
    fabric: "Pure Mulberry Silk",
    weave: "Korvai Handloom",
    zari: "Pure Gold Zari",
    blousePiece: "Included (Unstitched 0.8m)",
    length: "6.3 Meters with Blouse",
    occasion: "Bridal / Muhurtham / Festive",
    careInstructions: "Dry Clean Only. Store wrapped in soft muslin cloth.",
    pImage: [
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80"
    ],
    variants: [
      {
        _id: "var_k1_crimson",
        productId: "prod_kanchi_1",
        status: "active",
        price: 28500,
        previousPrice: 38000,
        offer: 25,
        stock: 12,
        min: 1,
        isDefault: true,
        attributes: { color: "Crimson Red & Gold" },
        color: "Crimson Red & Gold"
      }
    ],
    pRatingsReviews: [
      { _id: "rev_k1", rating: 5, review: "The zari work is breathtaking! Absolutely authentic Kanchipuram quality.", user: "Priya S.", createdAt: "2026-05-12" },
      { _id: "rev_k2", rating: 5, review: "Wore this for my sister's wedding and received endless compliments.", user: "Lakshmi N.", createdAt: "2026-06-04" }
    ]
  },

  // ── Saree 2 ──────────────────────────────────────────────────
  {
    _id: "prod_banarasi_1",
    pName: "Peacock Blue Banarasi Katan Silk Saree",
    pShortDescription: "Regal peacock blue Katan silk saree adorned with kadhwa floral jaal.",
    pDescription: "Woven in the spiritual looms of Varanasi, this opulent Banarasi saree is crafted from pure Katan silk in a majestic peacock blue shade. Elaborate kadhwa floral jaal is rendered in antique gold zari across the body, leading to a grand brocade pallu. Comes with matching running blouse fabric.",
    pPrice: 22400,
    pMrp: 29999,
    pPreviousPrice: 29999,
    price: 22400,
    mrp: 29999,
    pOffer: 25,
    pStock: 8,
    stock: 8,
    pSold: 29,
    pRating: 4.8,
    pCategory: "Silk Sarees",
    pSubCategory: "Banarasi Silk",
    pBrand: "Shri Deepaalaya Silks",
    pType: "normal",
    pStatus: "Active",
    fabric: "Pure Katan Silk",
    weave: "Handwoven Kadwa Jaal",
    zari: "Antique Gold Zari",
    blousePiece: "Included (Unstitched 0.8m)",
    length: "6.3 Meters",
    occasion: "Reception / Festive Celebration",
    careInstructions: "Dry Clean Only",
    pImage: [
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80"
    ],
    variants: [
      {
        _id: "var_b1_blue",
        productId: "prod_banarasi_1",
        status: "active",
        price: 22400,
        previousPrice: 29999,
        offer: 25,
        stock: 8,
        min: 1,
        isDefault: true,
        attributes: { color: "Peacock Blue" },
        color: "Peacock Blue"
      }
    ],
    pRatingsReviews: [
      { _id: "rev_b1", rating: 5, review: "The drape and weight are royal. Authentic Banarasi weave.", user: "Ananya M.", createdAt: "2026-05-18" }
    ]
  },

  // ── Saree 3 ──────────────────────────────────────────────────
  {
    _id: "prod_soft_silk_1",
    pName: "Pastel Mint Green Soft Silk Saree",
    pShortDescription: "Contemporary lightweight pure soft silk saree with silver zari border.",
    pDescription: "A breath of fresh elegance, this pastel mint green soft silk saree offers the rich sheen of pure silk with the fluid drape of modern lightweight weaving. Enhanced with delicate silver zari temple border and minimalist floral buttis. Ideal for festive pujas, engagements, and day functions.",
    pPrice: 13500,
    pMrp: 17999,
    pPreviousPrice: 17999,
    price: 13500,
    mrp: 17999,
    pOffer: 25,
    pStock: 15,
    stock: 15,
    pSold: 58,
    pRating: 4.8,
    pCategory: "Silk Sarees",
    pSubCategory: "Soft Silk",
    pBrand: "Shri Deepaalaya Silks",
    pType: "normal",
    pStatus: "Active",
    fabric: "Pure Soft Silk",
    weave: "Lightweight Jacquard",
    zari: "Silver Zari",
    blousePiece: "Included (Unstitched 0.8m)",
    length: "6.3 Meters",
    occasion: "Engagement / Festive Day Wear",
    careInstructions: "Dry Clean Only",
    pImage: [
      "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80"
    ],
    variants: [
      {
        _id: "var_ss1_mint",
        productId: "prod_soft_silk_1",
        status: "active",
        price: 13500,
        previousPrice: 17999,
        offer: 25,
        stock: 15,
        min: 1,
        isDefault: true,
        attributes: { color: "Mint Green" },
        color: "Mint Green"
      }
    ],
    pRatingsReviews: [
      { _id: "rev_ss1", rating: 5, review: "Very soft and easy to drape for hours! Loved the color.", user: "Radhika K.", createdAt: "2026-06-11" }
    ]
  },

  // ── Jewellery 1 ──────────────────────────────────────────────
  {
    _id: "prod_jewel_temple_1",
    pName: "22K Gold Finish Temple Lakshmi Choker Set",
    pShortDescription: "Handcrafted traditional temple jewellery choker featuring Goddess Lakshmi motifs.",
    pDescription: "Masterfully sculpted by traditional South Indian karigars, this temple choker features high-relief nagas carving of Goddess Lakshmi flanked by twin peacocks. Accented with ruby and emerald cabochons and finished with cluster south sea pearls. Includes matching temple jhumkas with push-back closures.",
    pPrice: 8999,
    pMrp: 14999,
    pPreviousPrice: 14999,
    price: 8999,
    mrp: 14999,
    pOffer: 40,
    pStock: 20,
    stock: 20,
    pSold: 84,
    pRating: 4.9,
    pCategory: "Heirloom Jewellery",
    pSubCategory: "Temple Jewellery",
    pBrand: "Shri Deepaalaya Silks",
    pType: "normal",
    pStatus: "Active",
    material: "Brass / Copper Base with 22K Gold Micro Plating",
    stones: "Synthetic Kemp Rubies, Emeralds & South Sea Cluster Pearls",
    closure: "Adjustable Thread Cord (Dori)",
    careInstructions: "Keep away from perfumes, sprays, and water. Store in airtight zip pouch.",
    pImage: [
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80"
    ],
    variants: [
      {
        _id: "var_jt1_set",
        productId: "prod_jewel_temple_1",
        status: "active",
        price: 8999,
        previousPrice: 14999,
        offer: 40,
        stock: 20,
        min: 1,
        isDefault: true,
        attributes: { finish: "Antique Matte Gold" },
        finish: "Antique Matte Gold"
      }
    ],
    pRatingsReviews: [
      { _id: "rev_jt1", rating: 5, review: "Looks identical to real 22K solid temple gold jewellery! Sturdy craftsmanship.", user: "Meenakshi S.", createdAt: "2026-05-20" }
    ]
  },

  // ── Jewellery 2 ──────────────────────────────────────────────
  {
    _id: "prod_jewel_kasu_1",
    pName: "Heirloom Kasu Haram Long Bridal Necklace",
    pShortDescription: "Authentic South Indian Kasu Malai necklace with precision coin carvings.",
    pDescription: "The crown jewel of traditional Indian jewellery, this 22K antique matte gold finish Kasu Haram features individually carved Lakshmi coins linked seamlessly on an articulated chain. Embellished with fine kemp stones and adjustable dori back cord. Pairs regally with Kanchipuram silk sarees.",
    pPrice: 12500,
    pMrp: 18999,
    pPreviousPrice: 18999,
    price: 12500,
    mrp: 18999,
    pOffer: 34,
    pStock: 10,
    stock: 10,
    pSold: 38,
    pRating: 5.0,
    pCategory: "Heirloom Jewellery",
    pSubCategory: "Bridal Jewellery Sets",
    pBrand: "Shri Deepaalaya Silks",
    pType: "normal",
    pStatus: "Active",
    material: "Antique Matte Gold Plated Copper Base",
    length: "24 Inches (Adjustable)",
    stones: "Kemp Stones",
    careInstructions: "Store wrapped in cotton in a moisture-free pouch.",
    pImage: [
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80"
    ],
    variants: [
      {
        _id: "var_jk1_gold",
        productId: "prod_jewel_kasu_1",
        status: "active",
        price: 12500,
        previousPrice: 18999,
        offer: 34,
        stock: 10,
        min: 1,
        isDefault: true,
        attributes: { finish: "Heritage Matte Gold" },
        finish: "Heritage Matte Gold"
      }
    ],
    pRatingsReviews: [
      { _id: "rev_jk1", rating: 5, review: "A true heirloom piece. Heavy and dignified.", user: "Geetha V.", createdAt: "2026-04-28" }
    ]
  },

  // ── Dress 1 ──────────────────────────────────────────────────
  {
    _id: "prod_anarkali_1",
    pName: "Ivory & Maroon Embroidered Silk Anarkali Suit",
    pShortDescription: "Floor-length flared embroidered handloom silk Anarkali dress with dupatta.",
    pDescription: "Crafted from pure handloom silk, this regal ivory Anarkali suit features deep maroon borders, delicate zardozi work on the neckline, and gota patti detailing along the voluminous hemline. Complete with matching silk churidar and a gossamer organza dupatta with gold scalloped lace.",
    pPrice: 6499,
    pMrp: 9999,
    pPreviousPrice: 9999,
    price: 6499,
    mrp: 9999,
    pOffer: 35,
    pStock: 18,
    stock: 18,
    pSold: 72,
    pRating: 4.8,
    pCategory: "Women's Ethnic Wear",
    pSubCategory: "Anarkali Suits",
    pBrand: "Shri Deepaalaya Silks",
    pType: "normal",
    pStatus: "Active",
    fabric: "Handloom Chanderi Silk with Shantoon Lining",
    dupatta: "Pure Organza with Scalloped Zari",
    careInstructions: "Dry Clean Only",
    pImage: [
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80"
    ],
    variants: [
      {
        _id: "var_an1_s",
        productId: "prod_anarkali_1",
        status: "active",
        price: 6499,
        previousPrice: 9999,
        offer: 35,
        stock: 5,
        min: 1,
        isDefault: true,
        attributes: { size: "S" },
        size: "S"
      },
      {
        _id: "var_an1_m",
        productId: "prod_anarkali_1",
        status: "active",
        price: 6499,
        previousPrice: 9999,
        offer: 35,
        stock: 8,
        min: 1,
        attributes: { size: "M" },
        size: "M"
      },
      {
        _id: "var_an1_l",
        productId: "prod_anarkali_1",
        status: "active",
        price: 6499,
        previousPrice: 9999,
        offer: 35,
        stock: 5,
        min: 1,
        attributes: { size: "L" },
        size: "L"
      }
    ],
    pRatingsReviews: [
      { _id: "rev_an1", rating: 5, review: "Magnificent flare and the organza dupatta is so graceful!", user: "Kavitha R.", createdAt: "2026-06-15" }
    ]
  },

  // ── Dress 2 (Anarkali) ───────────────────────────────────────
  {
    _id: "prod_anarkali_2",
    pName: "Royal Emerald Green Georgette Flared Anarkali Suit",
    pShortDescription: "Grand flared royal emerald green Anarkali suit with Lucknowi chikankari and mirror borders.",
    pDescription: "Channel royal poise in this opulent emerald green Anarkali suit. Tailored from premium flowy georgette with tone-on-tone embroidery and intricate mirror work along the yoke and 48-kali flare. Paired with coordinating churidar and a sheer embroidered dupatta.",
    pPrice: 7200,
    pMrp: 10999,
    pPreviousPrice: 10999,
    price: 7200,
    mrp: 10999,
    pOffer: 34,
    pStock: 14,
    stock: 14,
    pSold: 53,
    pRating: 4.9,
    pCategory: "Women's Ethnic Wear",
    pSubCategory: "Anarkali Suits",
    pBrand: "Shri Deepaalaya Silks",
    pType: "normal",
    pStatus: "Active",
    fabric: "Flowy Georgette with Shantoon Lining",
    dupatta: "Embroidered Georgette with Gold Zari Border",
    careInstructions: "Dry Clean Only",
    pImage: [
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80"
    ],
    variants: [
      {
        _id: "var_an2_s",
        productId: "prod_anarkali_2",
        status: "active",
        price: 7200,
        previousPrice: 10999,
        offer: 34,
        stock: 4,
        min: 1,
        isDefault: true,
        attributes: { size: "S", color: "Emerald Green" },
        size: "S",
        color: "Emerald Green"
      },
      {
        _id: "var_an2_m",
        productId: "prod_anarkali_2",
        status: "active",
        price: 7200,
        previousPrice: 10999,
        offer: 34,
        stock: 6,
        min: 1,
        attributes: { size: "M", color: "Emerald Green" },
        size: "M",
        color: "Emerald Green"
      },
      {
        _id: "var_an2_l",
        productId: "prod_anarkali_2",
        status: "active",
        price: 7200,
        previousPrice: 10999,
        offer: 34,
        stock: 4,
        min: 1,
        attributes: { size: "L", color: "Emerald Green" },
        size: "L",
        color: "Emerald Green"
      }
    ],
    pRatingsReviews: [
      { _id: "rev_an2_1", rating: 5, review: "The emerald color is so royal and rich. Flare is super wide!", user: "Sangeetha N.", createdAt: "2026-07-02" }
    ]
  },

  // ── Dress 3 (Anarkali) ───────────────────────────────────────
  {
    _id: "prod_anarkali_3",
    pName: "Blush Pink Mirror Work Silk Anarkali Suit Set",
    pShortDescription: "Pastel blush pink pure chanderi silk Anarkali suit with artisanal mirror work.",
    pDescription: "Effortlessly festive, this blush pink Anarkali suit combines traditional hand-done mirror work with modern pastel sensibility. Includes scalloped net dupatta with zari buttis and matching trousers.",
    pPrice: 5899,
    pMrp: 8999,
    pPreviousPrice: 8999,
    price: 5899,
    mrp: 8999,
    pOffer: 34,
    pStock: 16,
    stock: 16,
    pSold: 61,
    pRating: 4.8,
    pCategory: "Women's Ethnic Wear",
    pSubCategory: "Anarkali Suits",
    pBrand: "Shri Deepaalaya Silks",
    pType: "normal",
    pStatus: "Active",
    fabric: "Chanderi Silk with Soft Crepe Lining",
    dupatta: "Fine Net with Scalloped Zari",
    careInstructions: "Dry Clean Only",
    pImage: [
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80"
    ],
    variants: [
      {
        _id: "var_an3_s",
        productId: "prod_anarkali_3",
        status: "active",
        price: 5899,
        previousPrice: 8999,
        offer: 34,
        stock: 5,
        min: 1,
        isDefault: true,
        attributes: { size: "S", color: "Blush Pink" },
        size: "S",
        color: "Blush Pink"
      },
      {
        _id: "var_an3_m",
        productId: "prod_anarkali_3",
        status: "active",
        price: 5899,
        previousPrice: 8999,
        offer: 34,
        stock: 7,
        min: 1,
        attributes: { size: "M", color: "Blush Pink" },
        size: "M",
        color: "Blush Pink"
      }
    ],
    pRatingsReviews: [
      { _id: "rev_an3_1", rating: 5, review: "Very pretty blush pink color, perfect for reception guest wear.", user: "Divya M.", createdAt: "2026-07-10" }
    ]
  },

  // ── Bridal Lehenga ───────────────────────────────────────────
  {
    _id: "prod_lehenga_1",
    pName: "Royal Crimson Zardozi Bridal Lehenga",
    pShortDescription: "Handcrafted heavy raw silk bridal lehenga with zardozi embroidery.",
    pDescription: "A masterwork of royal Indian craftsmanship. Crafted in pure raw silk in deep bridal crimson, adorned with hand-embroidered dabka, sequins, and antique gold zardozi. Includes semi-stitched heavy flared lehenga, tailored blouse piece, and dual bridal dupattas.",
    pPrice: 48000,
    pMrp: 65000,
    pPreviousPrice: 65000,
    price: 48000,
    mrp: 65000,
    pOffer: 26,
    pStock: 5,
    stock: 5,
    pSold: 14,
    pRating: 5.0,
    pCategory: "Bridal Collection",
    pSubCategory: "Bridal Lehengas",
    pBrand: "Shri Deepaalaya Silks",
    pType: "normal",
    pStatus: "Active",
    fabric: "Raw Silk with Can-Can Underlayer",
    work: "Hand Zardozi, Sequins & Dabka",
    careInstructions: "Specialist Dry Clean Only",
    pImage: [
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80"
    ],
    variants: [
      {
        _id: "var_lh1_bridal",
        productId: "prod_lehenga_1",
        status: "active",
        price: 48000,
        previousPrice: 65000,
        offer: 26,
        stock: 5,
        min: 1,
        isDefault: true,
        attributes: { color: "Crimson Red" },
        color: "Crimson Red"
      }
    ],
    pRatingsReviews: [
      { _id: "rev_lh1", rating: 5, review: "Pure bridal perfection. The craftsmanship is worthy of royalty.", user: "Deepa L.", createdAt: "2026-05-01" }
    ]
  },

  // ── Jewellery Jhumka ─────────────────────────────────────────
  {
    _id: "prod_jhumka_1",
    pName: "Heritage Antique Peacock Jhumkas",
    pShortDescription: "Traditional South Indian antique gold finish jhumkas with pearl drops.",
    pDescription: "Exquisite antique gold finish jhumkas adorned with sculpted peacock studs, ruby stones, and an array of cascading freshwater pearl beads. Lightweight for extended festive wear with hypoallergenic posts.",
    pPrice: 3499,
    pMrp: 5499,
    pPreviousPrice: 5499,
    price: 3499,
    mrp: 5499,
    pOffer: 36,
    pStock: 25,
    stock: 25,
    pSold: 92,
    pRating: 4.9,
    pCategory: "Heirloom Jewellery",
    pSubCategory: "Antique Gold Finish",
    pBrand: "Shri Deepaalaya Silks",
    pType: "normal",
    pStatus: "Active",
    material: "Brass with Antique Gold Micro-Plating",
    stones: "Kemp Rubies & Pearls",
    closure: "Push-Back with Silicone Stopper",
    careInstructions: "Store in a dry pouch after wiping clean.",
    pImage: [
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80"
    ],
    variants: [
      {
        _id: "var_jh1_pair",
        productId: "prod_jhumka_1",
        status: "active",
        price: 3499,
        previousPrice: 5499,
        offer: 36,
        stock: 25,
        min: 1,
        isDefault: true,
        attributes: { finish: "Antique Gold" },
        finish: "Antique Gold"
      }
    ],
    pRatingsReviews: [
      { _id: "rev_jh1", rating: 5, review: "Lightweight and so traditional! Matches my silk sarees wonderfully.", user: "Sangeetha P.", createdAt: "2026-06-25" }
    ]
  }
];

// Helper to get local cart
export const getLocalCart = () => {
  try {
    const raw = localStorage.getItem("local_cart") || localStorage.getItem("cart");
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [];
};

// Helper to save local cart
export const saveLocalCart = (items) => {
  try {
    localStorage.setItem("local_cart", JSON.stringify(items));
    localStorage.setItem("cart", JSON.stringify(items));
    window.dispatchEvent(new Event("cartUpdated"));
  } catch (e) {}
};
