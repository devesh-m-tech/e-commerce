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

  // Admin users (specific route before general user)
  if (url.includes("/admin/users") || url.includes("/admin/admins")) {
    return {
      success: true,
      admins: [
        { _id: "admin_sds_01", name: "Deepa Lakshmi", email: "admin@shrideepaalayasilks.com", role: "super_admin", status: "active", createdAt: "2026-01-15" },
        { _id: "admin_sds_02", name: "Kavitha R", email: "inventory@shrideepaalayasilks.com", role: "manager", status: "active", createdAt: "2026-03-20" }
      ]
    };
  }

  // Transactions (specific route before general user)
  if (url.includes("/transaction") || url.includes("/transactions")) {
    return {
      success: true,
      data: {
        transactions: [
          {
            _id: "txn_01",
            transactionId: "TXN-781928",
            userId: { _id: "usr_1", name: "Priya Sharma", email: "priya@example.com", contact: "9876543210" },
            user: { name: "Priya Sharma", email: "priya@example.com" },
            amount: 28500,
            type: "credit",
            status: "completed",
            description: "Online payment for Order #ORD-98211",
            createdAt: "2026-09-12T10:30:00Z"
          },
          {
            _id: "txn_02",
            transactionId: "TXN-781929",
            userId: { _id: "usr_2", name: "Ananya Iyer", email: "ananya@example.com", contact: "9789012345" },
            user: { name: "Ananya Iyer", email: "ananya@example.com" },
            amount: 22400,
            type: "credit",
            status: "completed",
            description: "Online payment for Order #ORD-98212",
            createdAt: "2026-09-14T14:15:00Z"
          }
        ],
        pagination: { currentPage: 1, totalPages: 1, totalTransactions: 2, limit: 10 },
        summary: { totalCredit: 50900, totalDebit: 0, netAmount: 50900, totalTransactions: 2, completedTransactions: 2, pendingTransactions: 0, failedTransactions: 0 }
      }
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

  // Vendors
  if (url.includes("/vendor")) {
    return {
      success: true,
      vendors: [
        {
          _id: "ven_sds_1",
          vendorName: "Sri Kanchi Handlooms",
          businessInfo: { businessName: "Sri Kanchi Handlooms Pvt Ltd", businessType: "Manufacturer" },
          email: "contact@kanchihandlooms.in",
          phoneNumber: "9840112233",
          status: "active",
          kycStatus: "verified",
          createdAt: "2026-05-10"
        },
        {
          _id: "ven_sds_2",
          vendorName: "Varanasi Silk Weavers Guild",
          businessInfo: { businessName: "Varanasi Silk Crafts", businessType: "Weaver Society" },
          email: "varanasi.weavers@gmail.com",
          phoneNumber: "9450998877",
          status: "active",
          kycStatus: "verified",
          createdAt: "2026-06-01"
        },
        {
          _id: "ven_sds_3",
          vendorName: "Madurai Temple Jewels",
          businessInfo: { businessName: "Madurai Heritage Craft Works", businessType: "Jewellery Artisan" },
          email: "maduraijewels@crafts.com",
          phoneNumber: "9944556677",
          status: "active",
          kycStatus: "verified",
          createdAt: "2026-06-20"
        }
      ]
    };
  }

  // Blogs
  if (url.includes("/blog")) {
    return {
      success: true,
      blogs: [
        {
          _id: "blog_1",
          title: "The Art of Kanchipuram Korvai Weaving",
          description: "Discover the heritage of centuries-old pure silk weaving with genuine gold zari borders and temple motifs.",
          canonicalUrl: "https://shrideepaalayasilks.com/blog/kanchipuram-korvai-art",
          metaTitle: "Kanchipuram Silk Saree Weaving Guide",
          metaDescription: "Learn how authentic Kanchipuram silk sarees are handwoven by master artisans.",
          metaKeywords: "kanchipuram, silk saree, wedding, handloom",
          image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80",
          createdAt: "2026-07-01"
        },
        {
          _id: "blog_2",
          title: "How to Style Traditional Temple Jewellery for Weddings",
          description: "A complete guide to pairing antique Lakshmi chokers and Kasu Malai with bridal silk sarees.",
          canonicalUrl: "https://shrideepaalayasilks.com/blog/temple-jewellery-styling",
          metaTitle: "Temple Jewellery Styling Guide",
          metaDescription: "Bridal jewellery combinations for grand South Indian muhurthams.",
          metaKeywords: "temple jewellery, kasu malai, bridal, 22k gold",
          image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80",
          createdAt: "2026-07-15"
        }
      ]
    };
  }

  // Combos
  if (url.includes("/combo")) {
    return {
      success: true,
      combos: [
        {
          _id: "combo_sds_1",
          ccName: "Bridal Silk Saree & Temple Jewellery Royale Combo",
          ccDescription: "Pure Kanchipuram Silk Saree paired with 22K Gold Finish Temple Lakshmi Choker Set.",
          ccPrice: 34999,
          ccOffer: 25,
          ccStatus: "Active",
          ccImage: ["https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80"],
          ccProducts: [
            { _id: "prod_sds_1", pName: "Crimson Red Kanchipuram Pure Silk Saree", pPrice: 28500, quantity: 1 },
            { _id: "prod_sds_3", pName: "22K Gold Finish Temple Lakshmi Choker Set", pPrice: 8999, quantity: 1 }
          ],
          createdAt: "2026-08-01"
        }
      ]
    };
  }

  // Deals
  if (url.includes("/deal") || url.includes("/deals")) {
    return {
      success: true,
      deals: [
        {
          _id: "deal_1",
          title: "Muhurtham Silk Special — Festive 25% Off",
          content: "Limited-period festive pricing on handwoven Kanchipuram and Banarasi bridal sarees.",
          startDate: "2026-09-01",
          endDate: "2026-12-31",
          status: "active",
          products: []
        }
      ]
    };
  }

  // Exchanges
  if (url.includes("/exchange")) {
    return {
      success: true,
      exchanges: [
        {
          _id: "exch_01",
          exchangeId: "EX-10023",
          orderId: "ORD-98211",
          customerName: "Priya Sharma",
          customerEmail: "priya@example.com",
          customerPhone: "9876543210",
          reason: "Size Mismatch (Requested L)",
          status: "PENDING",
          exchangeOrderStatus: "REQUESTED",
          createdAt: "2026-09-10"
        }
      ],
      stats: { total: 1, pending: 1, approved: 0, rejected: 0, completed: 0 }
    };
  }

  // Shipping / Delivery
  if (url.includes("/delivery") || url.includes("/shipp")) {
    return {
      success: true,
      data: [
        { state: "Tamil Nadu", productdeliveryfee: 0, combodeliveryfee: 0, above500_deliveryfee: 0 },
        { state: "Karnataka", productdeliveryfee: 50, combodeliveryfee: 80, above500_deliveryfee: 0 },
        { state: "Andhra Pradesh", productdeliveryfee: 60, combodeliveryfee: 90, above500_deliveryfee: 0 },
        { state: "All Other States", productdeliveryfee: 80, combodeliveryfee: 120, above500_deliveryfee: 0 }
      ]
    };
  }



  // Reports
  if (url.includes("/report")) {
    return {
      success: true,
      salesSummary: { totalOrders: 348, totalRevenue: 1485600, totalShipping: 0, totalDiscount: 185000, averageOrderValue: 4268 },
      paymentMethods: [
        { method: "UPI / QR", count: 210, amount: 890000 },
        { method: "Cards", count: 98, amount: 450000 },
        { method: "Net Banking", count: 40, amount: 145600 }
      ],
      orderStatuses: [
        { status: "Delivered", count: 295 },
        { status: "Processing", count: 38 },
        { status: "Pending", count: 15 }
      ],
      productSales: [
        { pName: "Crimson Red Kanchipuram Pure Silk Saree", sold: 46, revenue: 1311000 },
        { pName: "Peacock Blue Banarasi Katan Silk Saree", sold: 29, revenue: 649600 }
      ],
      lowStockReport: [],
      exchangeReport: { total: 1, pending: 1, approved: 0, rejected: 0, completed: 0, reasonsList: ["Size Mismatch"] }
    };
  }

  // Brands
  if (url.includes("/brand")) {
    return [
      {
        _id: "brand_sds_01",
        name: "Shri Deepaalaya Silks",
        logo: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80"
      },
      {
        _id: "brand_sds_02",
        name: "Shri Deepaalaya Heritage",
        logo: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=300&q=80"
      }
    ];
  }

  return { success: true };
};
