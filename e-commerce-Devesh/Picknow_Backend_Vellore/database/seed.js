import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

import { Admin } from '../models/Admin.js';
import { Brands } from '../models/Brand.js';
import { categoryModel } from '../models/Category.js';
import productModel from '../models/Product.js';
import { User } from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.DB || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shrideepaalaya_silks';

export const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB at:', MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected successfully!');

    // 1. Seed Super Admin
    const existingAdmin = await Admin.findOne({ email: 'admin@shrideepaalayasilks.com' });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('Admin@1234', 10);
      await Admin.create({
        name: 'Deepa Lakshmi',
        email: 'admin@shrideepaalayasilks.com',
        password: hashedPassword,
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
      });
      console.log('Super Admin created: admin@shrideepaalayasilks.com / Admin@1234');
    } else {
      console.log('Super Admin already exists.');
    }

    // 2. Seed Brand
    const existingBrand = await Brands.findOne({ name: 'Shri Deepaalaya Silks' });
    if (!existingBrand) {
      await Brands.create({
        name: 'Shri Deepaalaya Silks',
        logo: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80'
      });
      console.log('Brand created: Shri Deepaalaya Silks');
    }

    // 3. Seed Categories
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
      const exists = await categoryModel.findOne({ cName: cat.cName });
      if (!exists) {
        await categoryModel.create(cat);
        console.log(`Category created: ${cat.cName}`);
      }
    }

    // 4. Seed Products
    const productsData = [
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
        pStock: 12,
        pQuantity: 12,
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
      }
    ];

    for (const prod of productsData) {
      const exists = await productModel.findOne({ pName: prod.pName });
      if (!exists) {
        await productModel.create(prod);
        console.log(`Product created: ${prod.pName}`);
      }
    }

    // 5. Seed Customer
    const existingUser = await User.findOne({ email: 'priya.sharma@example.com' });
    if (!existingUser) {
      const userHash = await bcrypt.hash('Demo@1234', 10);
      await User.create({
        name: 'Priya Sharma',
        email: 'priya.sharma@example.com',
        password: userHash,
        contact: '9876543210',
        isVerified: true,
        role: 'user'
      });
      console.log('Demo customer created: priya.sharma@example.com / Demo@1234');
    }

    console.log('\n============================================================');
    console.log('SHRI DEEPAALAYA SILKS DATABASE SEEDING COMPLETED SUCCESSFULLY');
    console.log('Super Admin: admin@shrideepaalayasilks.com / Admin@1234');
    console.log('Customer:    priya.sharma@example.com / Demo@1234');
    console.log('============================================================\n');

    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

// Execute if run directly
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase();
}
