// ============================================================
// DUMMY DATA — Dresses & Jewelleries Only (3 to 4 Products)
// Shri Deepaalaya Silks Frontend Offline / Local Mode
// ============================================================

export const DUMMY_CATEGORIES = [
  {
    _id: "cat_dresses",
    cName: "Dresses",
    cDescription: "Designer ethnic dresses, festive anarkalis & royal kurtis",
    cImage: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80",
    cStatus: 1,
    subCategories: [
      { _id: "sub_anarkali", name: "Anarkali Suits", status: 1 },
      { _id: "sub_kurtis", name: "Kurtis & Sets", status: 1 }
    ]
  },
  {
    _id: "cat_jewelleries",
    cName: "Jewelleries",
    cDescription: "Handcrafted traditional temple jewellery & bridal ornaments",
    cImage: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80",
    cStatus: 1,
    subCategories: [
      { _id: "sub_temple", name: "Temple Jewellery", status: 1 },
      { _id: "sub_bridal", name: "Bridal Jewellery", status: 1 }
    ]
  }
];

export const DUMMY_PRODUCTS = [
  // ── Dress 1 ────────────────────────────────────────────────
  {
    _id: "prod_dress_1",
    pName: "Embroidered Silk Anarkali Dress",
    pDescription: "Stunning floor-length embroidered silk Anarkali dress crafted from pure handloom silk with intricate golden zari border, gota patti embellishments, and a matching sheer dupatta. Perfect for weddings, festive occasions, and grand celebrations.",
    pPrice: 2499,
    pMrp: 4999,
    pPreviousPrice: 4999,
    price: 2499,
    mrp: 4999,
    pOffer: 50,
    pStock: 20,
    stock: 20,
    pSold: 142,
    pRating: 4.8,
    pCategory: "Dresses",
    pSubCategory: "Anarkali Suits",
    pBrand: "Shri Deepaalaya",
    pType: "normal",
    pStatus: "Active",
    pImage: [
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80"
    ],
    variants: [
      {
        _id: "var_dress_1_s",
        productId: "prod_dress_1",
        status: "active",
        price: 2499,
        previousPrice: 4999,
        offer: 50,
        stock: 5,
        min: 1,
        isDefault: true,
        attributes: { size: "S", color: "Ruby Red" },
        color: "Ruby Red",
        size: "S"
      },
      {
        _id: "var_dress_1_m",
        productId: "prod_dress_1",
        status: "active",
        price: 2499,
        previousPrice: 4999,
        offer: 50,
        stock: 8,
        min: 1,
        attributes: { size: "M", color: "Ruby Red" },
        color: "Ruby Red",
        size: "M"
      },
      {
        _id: "var_dress_1_l",
        productId: "prod_dress_1",
        status: "active",
        price: 2499,
        previousPrice: 4999,
        offer: 50,
        stock: 7,
        min: 1,
        attributes: { size: "L", color: "Ruby Red" },
        color: "Ruby Red",
        size: "L"
      }
    ],
    pRatingsReviews: [
      { _id: "rev_1", rating: 5, review: "Gorgeous fabric and beautiful zari embroidery! Fits perfectly.", user: "Priya S.", createdAt: "2026-03-15" },
      { _id: "rev_2", rating: 5, review: "The flare of the anarkali is amazing, looks very royal.", user: "Ananya M.", createdAt: "2026-04-02" }
    ]
  },

  // ── Dress 2 ────────────────────────────────────────────────
  {
    _id: "prod_dress_2",
    pName: "Royal Banarasi Silk Kurta & Palazzo Dress Set",
    pDescription: "Exquisite royal Banarasi silk kurta dress paired with comfortable flared palazzo pants and rich woven gold dupatta. Woven with authentic zari threads and timeless floral jaal motifs.",
    pPrice: 1899,
    pMrp: 3499,
    pPreviousPrice: 3499,
    price: 1899,
    mrp: 3499,
    pOffer: 45,
    pStock: 15,
    stock: 15,
    pSold: 98,
    pRating: 4.7,
    pCategory: "Dresses",
    pSubCategory: "Kurtis & Sets",
    pBrand: "Shri Deepaalaya",
    pType: "normal",
    pStatus: "Active",
    pImage: [
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80"
    ],
    variants: [
      {
        _id: "var_dress_2_m",
        productId: "prod_dress_2",
        status: "active",
        price: 1899,
        previousPrice: 3499,
        offer: 45,
        stock: 6,
        min: 1,
        isDefault: true,
        attributes: { size: "M", color: "Emerald Green" },
        color: "Emerald Green",
        size: "M"
      },
      {
        _id: "var_dress_2_l",
        productId: "prod_dress_2",
        status: "active",
        price: 1899,
        previousPrice: 3499,
        offer: 45,
        stock: 9,
        min: 1,
        attributes: { size: "L", color: "Emerald Green" },
        color: "Emerald Green",
        size: "L"
      }
    ],
    pRatingsReviews: [
      { _id: "rev_3", rating: 5, review: "Super comfortable and elegant. The Banarasi weave looks very premium.", user: "Deepa K.", createdAt: "2026-04-10" }
    ]
  },

  // ── Jewellery 1 ────────────────────────────────────────────
  {
    _id: "prod_jewel_1",
    pName: "Antique Temple Lakshmi Choker Necklace Set",
    pDescription: "Traditional South Indian antique temple jewellery choker set with Goddess Lakshmi centerpiece, studded with kemp ruby stones, emerald highlights, and cascading pearls. Includes matching jhumka earrings.",
    pPrice: 3299,
    pMrp: 5999,
    pPreviousPrice: 5999,
    price: 3299,
    mrp: 5999,
    pOffer: 45,
    pStock: 12,
    stock: 12,
    pSold: 210,
    pRating: 4.9,
    pCategory: "Jewelleries",
    pSubCategory: "Temple Jewellery",
    pBrand: "Shri Deepaalaya Heritage",
    pType: "normal",
    pStatus: "Active",
    pImage: [
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80"
    ],
    variants: [
      {
        _id: "var_jewel_1_gold",
        productId: "prod_jewel_1",
        status: "active",
        price: 3299,
        previousPrice: 5999,
        offer: 45,
        stock: 12,
        min: 1,
        isDefault: true,
        attributes: { size: "Standard", color: "Antique Gold" },
        color: "Antique Gold",
        size: "Standard"
      }
    ],
    pRatingsReviews: [
      { _id: "rev_4", rating: 5, review: "Breathtaking temple jewellery piece! Perfect antique gold finish.", user: "Meenakshi R.", createdAt: "2026-03-20" },
      { _id: "rev_5", rating: 5, review: "Heirloom quality, received so many compliments during the pooja.", user: "Kavitha N.", createdAt: "2026-04-05" }
    ]
  },

  // ── Jewellery 2 ────────────────────────────────────────────
  {
    _id: "prod_jewel_2",
    pName: "Kundan & Polki Bridal Jhumka Earrings with Pearls",
    pDescription: "Intricately detailed 22K gold plated Kundan and Polki jhumka earrings adorned with premium cubic zirconia, pearl drops, and classic meenakari craftsmanship on the reverse. Lightweight yet majestic.",
    pPrice: 1299,
    pMrp: 2499,
    pPreviousPrice: 2499,
    price: 1299,
    mrp: 2499,
    pOffer: 48,
    pStock: 25,
    stock: 25,
    pSold: 185,
    pRating: 4.8,
    pCategory: "Jewelleries",
    pSubCategory: "Bridal Jewellery",
    pBrand: "Shri Deepaalaya Heritage",
    pType: "normal",
    pStatus: "Active",
    pImage: [
      "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1611591475152-47754d9c4456?auto=format&fit=crop&w=800&q=80"
    ],
    variants: [
      {
        _id: "var_jewel_2_gold",
        productId: "prod_jewel_2",
        status: "active",
        price: 1299,
        previousPrice: 2499,
        offer: 48,
        stock: 25,
        min: 1,
        isDefault: true,
        attributes: { size: "Standard", color: "Gold & Pearl" },
        color: "Gold & Pearl",
        size: "Standard"
      }
    ],
    pRatingsReviews: [
      { _id: "rev_6", rating: 5, review: "Gorgeous kundan earrings! Very lightweight despite the grand look.", user: "Sneha P.", createdAt: "2026-04-11" }
    ]
  }
];

// Helper to get dummy cart from localStorage
export const getLocalCart = () => {
  try {
    const raw = localStorage.getItem("local_cart");
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return { items: [], totalAmount: 0 };
};

export const saveLocalCart = (cart) => {
  try {
    localStorage.setItem("local_cart", JSON.stringify(cart));
    localStorage.setItem("activeCartItems", JSON.stringify(cart.items || []));
  } catch (e) {}
};
