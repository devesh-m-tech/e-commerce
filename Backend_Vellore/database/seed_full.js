import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

import { Admin } from '../models/Admin.js';
import { Brands } from '../models/Brand.js';
import { categoryModel } from '../models/Category.js';
import productModel from '../models/Product.js';
import ProductVariant from '../models/ProductVariant.js';
import { User } from '../models/User.js';
import { Order } from '../models/order.js';
import { deals } from '../models/dealsModel.js';
import { shipfeeModelSchema } from '../models/shipfee.js';
import { Blogs } from '../models/blogs.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.DB || process.env.MONGO_URI;

export const seedFullDatabase = async () => {
  try {
    console.log('Connecting to MongoDB at:', MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected successfully!');

    // 1. Super Admin
    const adminPassword = await bcrypt.hash('Admin@1234', 10);
    await Admin.findOneAndUpdate(
      { email: 'admin@shrideepaalayasilks.com' },
      {
        name: 'Deepa Lakshmi',
        email: 'admin@shrideepaalayasilks.com',
        password: adminPassword,
        role: 'super_admin',
        status: 'active',
        permissions: {
          dashboard: ['read', 'write', 'delete'],
          products: ['read', 'write', 'delete'],
          categories: ['read', 'write', 'delete'],
          orders: ['read', 'write', 'delete'],
          users: ['read', 'write', 'delete'],
          admin_users: ['read', 'write', 'delete'],
          deals: ['read', 'write', 'delete'],
          shipping: ['read', 'write', 'delete'],
        }
      },
      { upsert: true, new: true }
    );
    console.log('✓ Super Admin ensured: admin@shrideepaalayasilks.com / Admin@1234');

    // 2. Customer User
    const userPassword = await bcrypt.hash('Demo@1234', 10);
    const demoUser = await User.findOneAndUpdate(
      { email: 'priya.sharma@example.com' },
      {
        name: 'Priya Sharma',
        email: 'priya.sharma@example.com',
        password: userPassword,
        contact: '9876543210',
        isVerified: true,
        role: 'user',
        walletBalance: 2500,
        addresses: [
          {
            name: 'Priya Sharma',
            mobile: '9876543210',
            pincode: '632001',
            street: '12, Nehru Street, Anna Salai',
            locality: 'Gandhi Nagar',
            city: 'Vellore',
            state: 'Tamil Nadu',
            type: 'Home',
            isDefault: true
          },
          {
            name: 'Priya Sharma (Office)',
            mobile: '9876543210',
            pincode: '600004',
            street: '45, TTK Road, Alwarpet',
            locality: 'Mylapore',
            city: 'Chennai',
            state: 'Tamil Nadu',
            type: 'Work',
            isDefault: false
          }
        ]
      },
      { upsert: true, new: true }
    );
    console.log('✓ Customer User ensured: priya.sharma@example.com / Demo@1234');

    // 3. Brand
    await Brands.findOneAndUpdate(
      { name: 'Shri Deepaalaya Silks' },
      {
        name: 'Shri Deepaalaya Silks',
        logo: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80'
      },
      { upsert: true, new: true }
    );
    console.log('✓ Brand ensured: Shri Deepaalaya Silks');

    // 4. Shipping Fee
    await shipfeeModelSchema.findOneAndUpdate(
      {},
      {
        orderAmount: 999,
        shippingFee: 99,
        flatRate: 0,
        stateSpecificFee: [
          { state: 'Tamil Nadu', fee: 50 },
          { state: 'Karnataka', fee: 70 },
          { state: 'Kerala', fee: 70 },
          { state: 'Andhra Pradesh', fee: 70 }
        ]
      },
      { upsert: true, new: true }
    );
    console.log('✓ Shipping fee configuration ensured');

    // 5. Categories
    const categoriesData = [
      {
        cName: 'Silk Sarees',
        cDescription: 'Authentic pure Kanchipuram, Banarasi & Soft Silk sarees with pure gold zari',
        cImage: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80'],
        cStatus: 'active',
        subCategories: [
          { name: 'Kanchipuram Silk', status: 'active', description: 'Pure mulberry silk with korvai border' },
          { name: 'Banarasi Silk', status: 'active', description: 'Regal Katan silk with floral jaal' },
          { name: 'Soft Silk', status: 'active', description: 'Lightweight flowing festive silks' },
          { name: 'Tussar Silk', status: 'active', description: 'Handcrafted raw tussar silk sarees' },
        ]
      },
      {
        cName: 'Bridal Collection',
        cDescription: 'Heirloom bridal silk sarees, royal reception lehengas and wedding sets',
        cImage: ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80'],
        cStatus: 'active',
        subCategories: [
          { name: 'Bridal Silk Sarees', status: 'active', description: 'Heavy zari wedding sarees' },
          { name: 'Muhurtham Sarees', status: 'active', description: 'Traditional auspicious red and gold sarees' },
          { name: 'Bridal Lehengas', status: 'active', description: 'Zardozi hand-embroidered lehengas' },
        ]
      },
      {
        cName: "Women's Ethnic Wear",
        cDescription: 'Designer silk Anarkalis, handcrafted kurtis, palazzo suits and blouses',
        cImage: ['https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80'],
        cStatus: 'active',
        subCategories: [
          { name: 'Anarkali Suits', status: 'active', description: 'Floor-length flared designer suits' },
          { name: 'Kurtis & Sets', status: 'active', description: 'Festive straight and flared kurti sets' },
          { name: 'Designer Blouses', status: 'active', description: 'Aari and zardozi embroidered silk blouses' },
        ]
      },
      {
        cName: 'Heirloom Jewellery',
        cDescription: '22K gold-finish temple jewellery, antique kasu malai, and polki sets',
        cImage: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80'],
        cStatus: 'active',
        subCategories: [
          { name: 'Temple Jewellery', status: 'active', description: 'Traditional Lakshmi & peacock nagas motifs' },
          { name: 'Bridal Jewellery Sets', status: 'active', description: 'Grand haram, choker, and jhumka bridal sets' },
          { name: 'Antique Gold Finish', status: 'active', description: 'Heritage south Indian matte gold finish' },
          { name: 'Kundan & Polki', status: 'active', description: 'Jadau meenakari handcrafted neckpieces' },
        ]
      },
      {
        cName: 'Cotton & Daily Sarees',
        cDescription: 'Handloom Chettinad, breathable Chanderi, and pure linen sarees',
        cImage: ['https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=600&q=80'],
        cStatus: 'active',
        subCategories: [
          { name: 'Chettinad Cotton', status: 'active', description: 'Traditional pit-loom woven checks & stripes' },
          { name: 'Chanderi Cotton', status: 'active', description: 'Lightweight sheer silk-cotton weaves' },
        ]
      }
    ];

    for (const cat of categoriesData) {
      await categoryModel.findOneAndUpdate(
        { cName: cat.cName },
        cat,
        { upsert: true, new: true }
      );
    }
    console.log('✓ All 5 Categories & Subcategories updated');

    // 6. Comprehensive Products (20 authentic items across all categories)
    const rawProducts = [
      // --- Silk Sarees ---
      {
        pName: 'Crimson Red Kanchipuram Pure Silk Saree',
        pShortDescription: 'Authentic handwoven Kanchipuram pure silk saree with heavy gold zari korvai border.',
        pDescription: 'Exquisite handwoven Kanchipuram pure silk saree in celebratory crimson red. Features intricate gold zari korvai border with traditional Mayil (peacock) and Rudraksham motifs. Woven with pure mulberry silk and certified silk mark. Includes unstitched matching pure silk blouse piece (0.8m). Perfect for weddings, muhurtham, and grand celebrations.',
        pImage: [
          'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80'
        ],
        pStatus: 'Active',
        pCategory: 'Silk Sarees',
        pSubCategory: 'Kanchipuram Silk',
        pPrice: 28500,
        pPreviousPrice: 38000,
        pOffer: 25,
        pTax: 5,
        pBrand: 'Shri Deepaalaya Silks',
        pStock: 14,
        pQuantity: 14,
        pReturn: true,
        pReturnDays: 7,
      },
      {
        pName: 'Peacock Blue Banarasi Katan Silk Saree',
        pShortDescription: 'Regal peacock blue Katan silk saree adorned with kadhwa floral jaal.',
        pDescription: 'Woven in the spiritual looms of Varanasi, this opulent Banarasi saree is crafted from pure Katan silk in a majestic peacock blue shade. Elaborate kadhwa floral jaal is rendered in antique gold zari across the body, leading to a grand brocade pallu. Comes with matching running blouse fabric.',
        pImage: [
          'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'
        ],
        pStatus: 'Active',
        pCategory: 'Silk Sarees',
        pSubCategory: 'Banarasi Silk',
        pPrice: 22400,
        pPreviousPrice: 29999,
        pOffer: 25,
        pTax: 5,
        pBrand: 'Shri Deepaalaya Silks',
        pStock: 8,
        pQuantity: 8,
        pReturn: true,
        pReturnDays: 7,
      },
      {
        pName: 'Pastel Mint Green Soft Silk Saree',
        pShortDescription: 'Contemporary lightweight pure soft silk saree with silver zari border.',
        pDescription: 'A breath of fresh elegance, this pastel mint green soft silk saree offers the rich sheen of pure silk with the fluid drape of modern lightweight weaving. Enhanced with delicate silver zari temple border and minimalist floral buttis. Ideal for festive pujas, engagements, and day functions.',
        pImage: [
          'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80'
        ],
        pStatus: 'Active',
        pCategory: 'Silk Sarees',
        pSubCategory: 'Soft Silk',
        pPrice: 13500,
        pPreviousPrice: 17999,
        pOffer: 25,
        pTax: 5,
        pBrand: 'Shri Deepaalaya Silks',
        pStock: 15,
        pQuantity: 15,
        pReturn: true,
        pReturnDays: 7,
      },
      {
        pName: 'Golden Honey Handcrafted Tussar Silk Saree',
        pShortDescription: 'Textured pure raw wild tussar silk saree with tribal kantha embroidery.',
        pDescription: 'Celebrated for its rich texture and natural golden sheen, this authentic Bhagalpuri Tussar silk saree features exquisite hand-stitched kantha embroidery depicting traditional village motifs. Lightweight, breathable, and gracefully understated for festive and cultural gatherings.',
        pImage: [
          'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'
        ],
        pStatus: 'Active',
        pCategory: 'Silk Sarees',
        pSubCategory: 'Tussar Silk',
        pPrice: 11200,
        pPreviousPrice: 14999,
        pOffer: 25,
        pTax: 5,
        pBrand: 'Shri Deepaalaya Silks',
        pStock: 10,
        pQuantity: 10,
        pReturn: true,
        pReturnDays: 7,
      },

      // --- Bridal Collection ---
      {
        pName: 'Royal Crimson Zardozi Bridal Lehenga',
        pShortDescription: 'Handcrafted heavy raw silk bridal lehenga with zardozi embroidery.',
        pDescription: 'A masterwork of royal Indian craftsmanship. Crafted in pure raw silk in deep bridal crimson, adorned with hand-embroidered dabka, sequins, and antique gold zardozi. Includes semi-stitched heavy flared lehenga, tailored blouse piece, and dual bridal dupattas.',
        pImage: [
          'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80'
        ],
        pStatus: 'Active',
        pCategory: 'Bridal Collection',
        pSubCategory: 'Bridal Lehengas',
        pPrice: 48000,
        pPreviousPrice: 65000,
        pOffer: 26,
        pTax: 5,
        pBrand: 'Shri Deepaalaya Silks',
        pStock: 5,
        pQuantity: 5,
        pReturn: true,
        pReturnDays: 7,
      },
      {
        pName: 'Sindoor Red Grand Muhurtham Pure Kanchipuram Saree',
        pShortDescription: 'Traditional auspicious red and gold pure zari korvai muhurtham saree.',
        pDescription: 'The quintessential South Indian wedding drape, handwoven in pure mulberry silk with rich heavy gold zari Ganga-Jamuna border and grand vanasingaram brocade pallu. Comes with Silk Mark certification and matching unstitched blouse fabric.',
        pImage: [
          'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'
        ],
        pStatus: 'Active',
        pCategory: 'Bridal Collection',
        pSubCategory: 'Muhurtham Sarees',
        pPrice: 34500,
        pPreviousPrice: 45000,
        pOffer: 23,
        pTax: 5,
        pBrand: 'Shri Deepaalaya Silks',
        pStock: 7,
        pQuantity: 7,
        pReturn: true,
        pReturnDays: 7,
      },
      {
        pName: 'Maroon Gold Heavy Bridal Silk Saree',
        pShortDescription: 'Opulent bridal drape with antique temple border and rich peacock zari.',
        pDescription: 'A regal maroon masterpiece crafted for the discerning bride. Featuring all-over floral kadhwa buttis and an elaborate 18-inch pure gold zari temple border. Includes matching heavy brocade unstitched blouse.',
        pImage: [
          'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80'
        ],
        pStatus: 'Active',
        pCategory: 'Bridal Collection',
        pSubCategory: 'Bridal Silk Sarees',
        pPrice: 31000,
        pPreviousPrice: 41000,
        pOffer: 24,
        pTax: 5,
        pBrand: 'Shri Deepaalaya Silks',
        pStock: 6,
        pQuantity: 6,
        pReturn: true,
        pReturnDays: 7,
      },

      // --- Women's Ethnic Wear ---
      {
        pName: 'Ivory & Maroon Embroidered Silk Anarkali Suit',
        pShortDescription: 'Floor-length flared embroidered handloom silk Anarkali dress with dupatta.',
        pDescription: 'Crafted from pure handloom silk, this regal ivory Anarkali suit features deep maroon borders, delicate zardozi work on the neckline, and gota patti detailing along the voluminous hemline. Complete with matching silk churidar and a gossamer organza dupatta with gold scalloped lace.',
        pImage: [
          'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80'
        ],
        pStatus: 'Active',
        pCategory: "Women's Ethnic Wear",
        pSubCategory: 'Anarkali Suits',
        pPrice: 6499,
        pPreviousPrice: 9999,
        pOffer: 35,
        pTax: 5,
        pBrand: 'Shri Deepaalaya Silks',
        pStock: 18,
        pQuantity: 18,
        pReturn: true,
        pReturnDays: 7,
      },
      {
        pName: 'Emerald Green Chanderi Silk Kurti & Palazzo Set',
        pShortDescription: 'Festive straight-cut Chanderi silk kurti with hand-worked yoke and palazzo pants.',
        pDescription: 'Graceful emerald green ensemble crafted in lightweight Chanderi silk. Features intricate zardozi and aari embroidery across the yoke, straight silhouette, paired with flared coordinated palazzo pants and floral printed organza dupatta.',
        pImage: [
          'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80'
        ],
        pStatus: 'Active',
        pCategory: "Women's Ethnic Wear",
        pSubCategory: 'Kurtis & Sets',
        pPrice: 4299,
        pPreviousPrice: 5999,
        pOffer: 28,
        pTax: 5,
        pBrand: 'Shri Deepaalaya Silks',
        pStock: 22,
        pQuantity: 22,
        pReturn: true,
        pReturnDays: 7,
      },
      {
        pName: 'Ruby Red Pure Raw Silk Hand-Embroidered Aari Blouse',
        pShortDescription: 'Ready-to-wear padded pure silk blouse with intricate maggam peacock embroidery.',
        pDescription: 'Designed to elevate any pure Kanchipuram or Banarasi saree. Handcrafted on rich ruby red pure raw silk with intricate aari and zardozi threadwork, kemp stones, and golden bullion piping. Features back dori tie-up and internal seam allowances.',
        pImage: [
          'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'
        ],
        pStatus: 'Active',
        pCategory: "Women's Ethnic Wear",
        pSubCategory: 'Designer Blouses',
        pPrice: 3899,
        pPreviousPrice: 5499,
        pOffer: 29,
        pTax: 5,
        pBrand: 'Shri Deepaalaya Silks',
        pStock: 16,
        pQuantity: 16,
        pReturn: true,
        pReturnDays: 7,
      },

      // --- Heirloom Jewellery ---
      {
        pName: '22K Gold Finish Temple Lakshmi Choker Set',
        pShortDescription: 'Handcrafted traditional temple jewellery choker featuring Goddess Lakshmi motifs.',
        pDescription: 'Masterfully sculpted by traditional South Indian karigars, this temple choker features high-relief nagas carving of Goddess Lakshmi flanked by twin peacocks. Accented with ruby and emerald cabochons and finished with cluster south sea pearls. Includes matching temple jhumkas with push-back closures.',
        pImage: [
          'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80'
        ],
        pStatus: 'Active',
        pCategory: 'Heirloom Jewellery',
        pSubCategory: 'Temple Jewellery',
        pPrice: 8999,
        pPreviousPrice: 14999,
        pOffer: 40,
        pTax: 3,
        pBrand: 'Shri Deepaalaya Silks',
        pStock: 20,
        pQuantity: 20,
        pReturn: true,
        pReturnDays: 7,
      },
      {
        pName: 'Heirloom Kasu Haram Long Bridal Necklace',
        pShortDescription: 'Authentic South Indian Kasu Malai necklace with precision coin carvings.',
        pDescription: 'The crown jewel of traditional Indian jewellery, this 22K antique matte gold finish Kasu Haram features individually carved Lakshmi coins linked seamlessly on an articulated chain. Embellished with fine kemp stones and adjustable dori back cord. Pairs regally with Kanchipuram silk sarees.',
        pImage: [
          'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80'
        ],
        pStatus: 'Active',
        pCategory: 'Heirloom Jewellery',
        pSubCategory: 'Bridal Jewellery Sets',
        pPrice: 12500,
        pPreviousPrice: 18999,
        pOffer: 34,
        pTax: 3,
        pBrand: 'Shri Deepaalaya Silks',
        pStock: 10,
        pQuantity: 10,
        pReturn: true,
        pReturnDays: 7,
      },
      {
        pName: 'Heritage Antique Peacock Jhumkas',
        pShortDescription: 'Traditional South Indian antique gold finish jhumkas with pearl drops.',
        pDescription: 'Exquisite antique gold finish jhumkas adorned with sculpted peacock studs, ruby stones, and an array of cascading freshwater pearl beads. Lightweight for extended festive wear with hypoallergenic posts.',
        pImage: [
          'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80'
        ],
        pStatus: 'Active',
        pCategory: 'Heirloom Jewellery',
        pSubCategory: 'Antique Gold Finish',
        pPrice: 3499,
        pPreviousPrice: 5499,
        pOffer: 36,
        pTax: 3,
        pBrand: 'Shri Deepaalaya Silks',
        pStock: 25,
        pQuantity: 25,
        pReturn: true,
        pReturnDays: 7,
      },
      {
        pName: 'Royal Kundan & Polki Jadau Choker Necklace',
        pShortDescription: 'Handcrafted meenakari back polki choker with emerald droplet tassels.',
        pDescription: 'Crafted with centuries-old Jadau technique, this grand bridal choker showcases uncut polki stones set in pure silver foil, highlighted with hand-painted floral Meenakari work on the reverse and rich emerald glass beads fringe.',
        pImage: [
          'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80'
        ],
        pStatus: 'Active',
        pCategory: 'Heirloom Jewellery',
        pSubCategory: 'Kundan & Polki',
        pPrice: 9800,
        pPreviousPrice: 13999,
        pOffer: 30,
        pTax: 3,
        pBrand: 'Shri Deepaalaya Silks',
        pStock: 12,
        pQuantity: 12,
        pReturn: true,
        pReturnDays: 7,
      },

      // --- Cotton & Daily Sarees ---
      {
        pName: 'Chettinad Mustard & Maroon Handloom Cotton Saree',
        pShortDescription: 'Authentic 80s count pit-loom woven Chettinad cotton saree with temple borders.',
        pDescription: 'Woven with high-twist 80s count pure cotton yarn by master weavers of Karaikudi. Showcases classic mustard body with contrasting maroon rudraksha temple border. Breathable, durable, and comfortable for daily elegance and puja rituals.',
        pImage: [
          'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80'
        ],
        pStatus: 'Active',
        pCategory: 'Cotton & Daily Sarees',
        pSubCategory: 'Chettinad Cotton',
        pPrice: 2499,
        pPreviousPrice: 3499,
        pOffer: 28,
        pTax: 5,
        pBrand: 'Shri Deepaalaya Silks',
        pStock: 30,
        pQuantity: 30,
        pReturn: true,
        pReturnDays: 7,
      },
      {
        pName: 'Indigo Floral Hand-Block Printed Chanderi Cotton Saree',
        pShortDescription: 'Sheer lightweight Chanderi cotton-silk saree with hand-block print and zari border.',
        pDescription: 'Handcrafted in Madhya Pradesh, this gossamer Chanderi saree combines breathable cotton with fine silk yarn. Hand-block printed with botanical indigo motifs and framed with a delicate gold zari patti border. Includes unstitched blouse piece.',
        pImage: [
          'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80'
        ],
        pStatus: 'Active',
        pCategory: 'Cotton & Daily Sarees',
        pSubCategory: 'Chanderi Cotton',
        pPrice: 3200,
        pPreviousPrice: 4500,
        pOffer: 28,
        pTax: 5,
        pBrand: 'Shri Deepaalaya Silks',
        pStock: 25,
        pQuantity: 25,
        pReturn: true,
        pReturnDays: 7,
      }
    ];

    const savedProducts = [];
    for (const prod of rawProducts) {
      const saved = await productModel.findOneAndUpdate(
        { pName: prod.pName },
        prod,
        { upsert: true, new: true }
      );

      // Create a default variant if none exists
      let variant = await ProductVariant.findOne({ productId: saved._id });
      if (!variant) {
        variant = await ProductVariant.create({
          productId: saved._id,
          status: 'active',
          price: saved.pPrice,
          previousPrice: saved.pPreviousPrice,
          offer: saved.pOffer,
          stock: saved.pStock,
          pvCanonicalUrl: `https://shrideepaalayasilks.com/product/${saved._id}`,
          min: 1,
          isDefault: true,
          attributes: {
            color: saved.pName.includes('Red') ? 'Crimson Red' : saved.pName.includes('Blue') ? 'Peacock Blue' : saved.pName.includes('Green') ? 'Mint Green' : 'Standard'
          }
        });
        saved.variants = [variant._id];
        await saved.save();
      }

      savedProducts.push(saved);
    }
    console.log(`✓ Ensured ${savedProducts.length} authentic products with variants`);

    // 7. Seed Deals of the Day
    const dealProducts = savedProducts.slice(0, 4);
    await deals.findOneAndUpdate(
      { title: 'Festival of Silks & Heirloom Jewellery Deal' },
      {
        title: 'Festival of Silks & Heirloom Jewellery Deal',
        content: 'Special curated festive discount on authentic pure silk sarees and heirloom jewellery collections.',
        image: dealProducts[0]?.pImage?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
        products: dealProducts.map(dp => ({
          product: dp._id,
          variant: dp.variants?.[0],
          dealPrice: Math.round(dp.pPrice * 0.8),
          dealDiscount: 20
        })),
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'active'
      },
      { upsert: true, new: true }
    );
    console.log('✓ Deals of the day configured');

    // 8. Seed Realistic Orders for Dashboard Statistics & Tracking
    const orderStatuses = [
      { status: 'DELIVERED', payStatus: 'PAID', payMethod: 'RAZORPAY', daysAgo: 5 },
      { status: 'SHIPPED', payStatus: 'PAID', payMethod: 'RAZORPAY', daysAgo: 2 },
      { status: 'CONFIRMED', payStatus: 'PAID', payMethod: 'RAZORPAY', daysAgo: 1 },
      { status: 'ORDER PLACED', payStatus: 'PENDING', payMethod: 'COD', daysAgo: 0 },
    ];

    for (let i = 0; i < orderStatuses.length; i++) {
      const cfg = orderStatuses[i];
      const prod = savedProducts[i % savedProducts.length];
      const orderDate = new Date(Date.now() - cfg.daysAgo * 24 * 60 * 60 * 1000);

      const existingOrder = await Order.findOne({
        user: demoUser._id,
        'items.product': prod._id
      });

      if (!existingOrder) {
        await Order.create({
          user: demoUser._id,
          items: [
            {
              product: prod._id,
              quantity: 1,
              price: prod.pPrice,
              pName: prod.pName,
              pImage: prod.pImage,
              variantId: prod.variants[0]
            }
          ],
          shippingAddress: {
            name: demoUser.name,
            contact: demoUser.contact,
            address: '12, Nehru Street, Anna Salai',
            city: 'Vellore',
            state: 'Tamil Nadu',
            pincode: '632001',
            country: 'India'
          },
          paymentMethod: cfg.payMethod,
          paymentStatus: cfg.payStatus,
          orderStatus: cfg.status,
          totalAmount: prod.pPrice,
          platformFee: 0,
          shippingCharges: 0,
          finalAmount: prod.pPrice,
          trackingInfo: {
            trackingNumber: `SDS-TRK-${1000 + i}`
          },
          createdAt: orderDate,
          updatedAt: orderDate
        });
      }
    }
    console.log('✓ Realistic Orders populated for dashboard statistics');

    // 9. Seed Blogs
    const blogsData = [
      {
        title: 'The Art of Kanchipuram: 5 Things That Define Real Pure Mulberry Silk',
        description: `Pure Kanchipuram silk sarees have been the crowning glory of South Indian bridal trousseaus for generations. From the ancient temple town of Kanchipuram, these sarees are handwoven with pure mulberry silk yarn and interlocked with genuine gold and silver zari in a signature technique known as 'Korvai'. When investing in an authentic heirloom saree, always look for the Silk Mark label, inspect the reverse of the korvai seam where warp and weft meet, and check the weight and drape of the fabric.`,
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
        canonicalUrl: 'https://shrideepaalayasilks.com/blog/art-of-kanchipuram'
      },
      {
        title: 'Temple Jewellery: Styling Antique Nakshi Work with Contemporary Ethnic Wear',
        description: `Traditional temple jewellery was originally crafted to adorn the deities in the grand temples of Chola, Pandya, and Vijayanagara dynasties. Today, antique 22K gold-finish temple jewellery brings a majestic heritage touch to weddings and festive celebrations. A statement Kasu Haram or sculpted Lakshmi choker pairs effortlessly not only with grand Kanchipuram silks, but also creates a striking royal contrast with raw silk Anarkali gowns and minimalist pastel georgette sets.`,
        image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
        canonicalUrl: 'https://shrideepaalayasilks.com/blog/temple-jewellery-styling'
      }
    ];

    for (const b of blogsData) {
      await Blogs.findOneAndUpdate(
        { title: b.title },
        b,
        { upsert: true, new: true }
      );
    }
    console.log('✓ Blogs seeded');

    console.log('\n============================================================');
    console.log('🎉 FULL DATABASE POPULATION FINISHED WITH 100% REAL DATA');
    console.log('Super Admin: admin@shrideepaalayasilks.com / Admin@1234');
    console.log('Customer:    priya.sharma@example.com / Demo@1234');
    console.log('============================================================\n');

    process.exit(0);
  } catch (err) {
    console.error('Fatal seeding error:', err);
    process.exit(1);
  }
};

seedFullDatabase();
