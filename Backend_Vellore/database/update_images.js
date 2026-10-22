import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || process.env.DB;

const SAREE_GALLERY_RED = [
  'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1200&q=85'
];

const SAREE_GALLERY_BLUE = [
  'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=85'
];

const SAREE_GALLERY_GREEN = [
  'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1200&q=85'
];

const JEWELLERY_GALLERY = [
  'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85'
];

const ETHNIC_GALLERY = [
  'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=1200&q=85'
];

async function updateImages() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const products = await mongoose.connection.db.collection('products').find({}).toArray();
    console.log(`Found ${products.length} products to enrich.`);

    for (const prod of products) {
      const cat = String(prod.pCategory || '').toLowerCase();
      const name = String(prod.pName || '').toLowerCase();

      let gallery;
      if (cat.includes('jewel') || name.includes('necklace') || name.includes('jhumka') || name.includes('choker')) {
        gallery = JEWELLERY_GALLERY;
      } else if (cat.includes('ethnic') || name.includes('lehenga') || name.includes('anarkali') || name.includes('kurti')) {
        gallery = ETHNIC_GALLERY;
      } else if (name.includes('blue') || name.includes('honey') || name.includes('indigo')) {
        gallery = SAREE_GALLERY_BLUE;
      } else if (name.includes('green') || name.includes('mint') || name.includes('cotton')) {
        gallery = SAREE_GALLERY_GREEN;
      } else {
        // Red / Maroon / Bridal Saree (including 6ad849c6726555a65e623dd5)
        gallery = SAREE_GALLERY_RED;
      }

      // Preserve first original image if valid, and append the rest
      const firstImg = (prod.pImage && prod.pImage.length > 0) ? prod.pImage[0] : gallery[0];
      const merged = [firstImg, ...gallery.filter(img => img !== firstImg)];

      await mongoose.connection.db.collection('products').updateOne(
        { _id: prod._id },
        { $set: { pImage: merged } }
      );
      console.log(`Updated ${prod.pName} with ${merged.length} images.`);
    }

    console.log('All products successfully enriched with multi-angle galleries!');
    process.exit(0);
  } catch (err) {
    console.error('Error updating product images:', err);
    process.exit(1);
  }
}

updateImages();
