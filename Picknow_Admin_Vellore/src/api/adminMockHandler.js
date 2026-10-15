// ============================================================
// SHRI DEEPAALAYA SILKS — Admin Mock API Handler
// Provides comprehensive local mock data when MongoDB is offline
// ============================================================

export const ADMIN_CATEGORIES = [
  {
    _id: "cat_silk_sarees",
    cName: "Silk Sarees",
    cDescription: "Pure Kanchipuram, Banarasi & Soft Silk Sarees with pure zari",
    cImage: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80",
    cStatus: 1,
    subCategories: [
      { _id: "sub_kanchi", name: "Kanchipuram Silk", status: 1 },
      { _id: "sub_banarasi", name: "Banarasi Silk", status: 1 },
      { _id: "sub_soft_silk", name: "Soft Silk", status: 1 }
    ]
  },
  {
    _id: "cat_bridal_wear",
    cName: "Bridal Collection",
    cDescription: "Heirloom bridal silk sarees, royal lehengas & bridal sets",
    cImage: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80",
    cStatus: 1,
    subCategories: [
      { _id: "sub_bridal_saree", name: "Bridal Silk Sarees", status: 1 },
      { _id: "sub_muhurtham", name: "Muhurtham Sarees", status: 1 }
    ]
  },
  {
    _id: "cat_womens_wear",
    cName: "Women's Ethnic Wear",
    cDescription: "Designer Anarkali suits, handcrafted kurtis & festive sets",
    cImage: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80",
    cStatus: 1,
    subCategories: [
      { _id: "sub_anarkali", name: "Anarkali Suits", status: 1 },
      { _id: "sub_kurtis", name: "Kurtis & Sets", status: 1 }
    ]
  },
  {
    _id: "cat_jewellery",
    cName: "Heirloom Jewellery",
    cDescription: "Handcrafted 22K gold-finish temple jewellery & antique sets",
    cImage: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80",
    cStatus: 1,
    subCategories: [
      { _id: "sub_temple", name: "Temple Jewellery", status: 1 },
      { _id: "sub_bridal_jewel", name: "Bridal Jewellery Sets", status: 1 }
    ]
  }
];

export const ADMIN_PRODUCTS = [
  {
    _id: "prod_sds_1",
    pName: "Crimson Red Kanchipuram Pure Silk Saree",
    pDescription: "Authentic handwoven Kanchipuram pure silk saree with heavy gold zari korvai border and grand pallu. Woven by master weavers.",
    pPrice: 28500,
    pMrp: 38000,
    price: 28500,
    mrp: 38000,
    pStock: 12,
    stock: 12,
    pSold: 46,
    pRating: 4.9,
    pCategory: "Silk Sarees",
    pSubCategory: "Kanchipuram Silk",
    pBrand: "Shri Deepaalaya Silks",
    pStatus: "Active",
    status: "Active",
    pImage: [
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    _id: "prod_sds_2",
    pName: "Peacock Blue Banarasi Katan Silk Saree",
    pDescription: "Regal peacock blue Katan silk saree adorned with kadhwa floral jaal and antique gold zari booti.",
    pPrice: 22400,
    pMrp: 29999,
    price: 22400,
    mrp: 29999,
    pStock: 8,
    stock: 8,
    pSold: 29,
    pRating: 4.8,
    pCategory: "Silk Sarees",
    pSubCategory: "Banarasi Silk",
    pBrand: "Shri Deepaalaya Silks",
    pStatus: "Active",
    status: "Active",
    pImage: [
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    _id: "prod_sds_3",
    pName: "22K Gold Finish Temple Lakshmi Choker Set",
    pDescription: "Handcrafted traditional temple jewellery choker featuring Goddess Lakshmi motifs, nagas work and cluster pearls.",
    pPrice: 8999,
    pMrp: 14999,
    price: 8999,
    mrp: 14999,
    pStock: 15,
    stock: 15,
    pSold: 64,
    pRating: 4.9,
    pCategory: "Heirloom Jewellery",
    pSubCategory: "Temple Jewellery",
    pBrand: "Shri Deepaalaya Silks",
    pStatus: "Active",
    status: "Active",
    pImage: [
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    _id: "prod_sds_4",
    pName: "Heirloom Bridal Kasu Malai Long Necklace",
    pDescription: "Authentic South Indian Kasu Haram necklace crafted with precision coin carvings and ruby-emerald embellishments.",
    pPrice: 12500,
    pMrp: 18999,
    price: 12500,
    mrp: 18999,
    pStock: 10,
    stock: 10,
    pSold: 32,
    pRating: 5.0,
    pCategory: "Heirloom Jewellery",
    pSubCategory: "Bridal Jewellery Sets",
    pBrand: "Shri Deepaalaya Silks",
    pStatus: "Active",
    status: "Active",
    pImage: [
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    _id: "prod_sds_5",
    pName: "Embroidered Silk Anarkali Suit with Dupatta",
    pDescription: "Floor-sweeping ivory and maroon handloom silk Anarkali suit with delicate zardozi embroidery and organza dupatta.",
    pPrice: 6499,
    pMrp: 9999,
    price: 6499,
    mrp: 9999,
    pStock: 18,
    stock: 18,
    pSold: 51,
    pRating: 4.7,
    pCategory: "Women's Ethnic Wear",
    pSubCategory: "Anarkali Suits",
    pBrand: "Shri Deepaalaya Silks",
    pStatus: "Active",
    status: "Active",
    pImage: [
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80"
    ]
  }
];

export const ADMIN_ORDERS = [
  {
    _id: "ORD_SDS_1001",
    customerName: "Priya Sharma",
    phone: "9876543210",
    email: "priya.sharma@example.com",
    address: "12, Nehru Street, Anna Salai, Vellore, Tamil Nadu - 632001",
    items: [
      { product: ADMIN_PRODUCTS[0], quantity: 1, price: 28500 }
    ],
    finalAmount: 28500,
    totalAmount: 28500,
    status: "Delivered",
    paymentStatus: "Paid",
    paymentMethod: "Razorpay (UPI)",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    _id: "ORD_SDS_1002",
    customerName: "Meenakshi Sundaram",
    phone: "9840123456",
    email: "meenakshi.s@example.com",
    address: "45, Temple View Road, Mylapore, Chennai, Tamil Nadu - 600004",
    items: [
      { product: ADMIN_PRODUCTS[2], quantity: 1, price: 8999 },
      { product: ADMIN_PRODUCTS[4], quantity: 1, price: 6499 }
    ],
    finalAmount: 15498,
    totalAmount: 15498,
    status: "Processing",
    paymentStatus: "Paid",
    paymentMethod: "Credit Card",
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    _id: "ORD_SDS_1003",
    customerName: "Ananya Iyer",
    phone: "9789012345",
    email: "ananya.iyer@example.com",
    address: "78, Palace Road, Vasanth Nagar, Bengaluru, Karnataka - 560052",
    items: [
      { product: ADMIN_PRODUCTS[1], quantity: 1, price: 22400 }
    ],
    finalAmount: 22400,
    totalAmount: 22400,
    status: "Shipped",
    paymentStatus: "Paid",
    paymentMethod: "Net Banking",
    createdAt: new Date(Date.now() - 43200000).toISOString()
  }
];

export const handleAdminMockRequest = (config) => {
  const url = config.url || "";
  const method = (config.method || "get").toLowerCase();

  // Login
  if (url.includes("/admin/login")) {
    return {
      success: true,
      token: "mock_sds_admin_token_jwt",
      admin: {
        _id: "admin_sds_01",
        name: "Deepa Lakshmi",
        email: "admin@shrideepaalayasilks.com",
        role: "super_admin",
        status: "Active"
      },
      message: "Welcome to Shri Deepaalaya Silks Admin!"
    };
  }

  // Dashboard Stats
  if (url.includes("/dashboard")) {
    return {
      success: true,
      metrics: {
        totalSales: 1485600,
        todaySales: 66398,
        totalOrders: 348,
        todayOrders: 5,
        deliveredOrders: 295,
        processingOrders: 38,
        pendingOrders: 15,
        totalCustomers: 512,
        totalProducts: 48
      },
      recentOrders: ADMIN_ORDERS,
      salesChart: [
        { date: "Day 1", sales: 120000 },
        { date: "Day 2", sales: 185000 },
        { date: "Day 3", sales: 240000 },
        { date: "Day 4", sales: 195000 },
        { date: "Day 5", sales: 310000 },
        { date: "Day 6", sales: 280000 },
        { date: "Today", sales: 155600 }
      ],
      topProducts: ADMIN_PRODUCTS.slice(0, 3)
    };
  }

  // Products
  if (url.includes("/product") || url.includes("/products")) {
    return {
      success: true,
      products: ADMIN_PRODUCTS,
      total: ADMIN_PRODUCTS.length,
      page: 1,
      totalPages: 1
    };
  }

  // Categories
  if (url.includes("/categor")) {
    return {
      success: true,
      categories: ADMIN_CATEGORIES
    };
  }

  // Orders
  if (url.includes("/order")) {
    return {
      success: true,
      orders: ADMIN_ORDERS,
      total: ADMIN_ORDERS.length
    };
  }

  // Users / Customers
  if (url.includes("/users") || url.includes("/user")) {
    return {
      success: true,
      users: [
        { _id: "usr_1", name: "Priya Sharma", email: "priya@example.com", phone: "9876543210", ordersCount: 4, createdAt: "2026-08-10" },
        { _id: "usr_2", name: "Meenakshi Sundaram", email: "meenakshi@example.com", phone: "9840123456", ordersCount: 2, createdAt: "2026-09-02" },
        { _id: "usr_3", name: "Ananya Iyer", email: "ananya@example.com", phone: "9789012345", ordersCount: 5, createdAt: "2026-07-15" }
      ]
    };
  }

  // Admin users
  if (url.includes("/admin/users")) {
    return {
      success: true,
      admins: [
        { _id: "admin_sds_01", name: "Deepa Lakshmi", email: "admin@shrideepaalayasilks.com", role: "super_admin", status: "Active" },
        { _id: "admin_sds_02", name: "Kavitha R", email: "inventory@shrideepaalayasilks.com", role: "manager", status: "Active" }
      ]
    };
  }

  return { success: true };
};
