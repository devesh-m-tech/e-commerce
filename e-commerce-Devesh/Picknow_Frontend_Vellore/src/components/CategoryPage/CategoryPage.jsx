import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { DUMMY_CATEGORIES } from '../../mockData/dummyData';
import { categoryApi } from '../../APi/categoryApi';
import './CategoryPage.css';

const CategoryPage = () => {
  const [categories, setCategories] = useState(DUMMY_CATEGORIES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryApi.getAllCategories();
        if (response && Array.isArray(response) && response.length > 0) {
          setCategories(response);
        } else if (response?.categories && Array.isArray(response.categories)) {
          setCategories(response.categories);
        }
      } catch (error) {
        console.warn('Using fallback categories:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="category-page">
      <div className="category-header">
        <h1>Handcrafted Collections</h1>
        <p>Explore our timeless repertoire of pure silk weaves, bridal heirloom drapes, and antique temple jewellery.</p>
      </div>

      <div className="categories-grid">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="category-card-luxury shimmer-effect" style={{ height: 380 }}></div>
          ))
        ) : (
          categories.map((category) => (
            <Link
              to={`/category/${category._id}?name=${encodeURIComponent(category.cName)}`}
              key={category._id}
              className="category-card-luxury"
            >
              <div className="category-image-wrap">
                <img
                  src={category.cImage}
                  alt={category.cName}
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800';
                  }}
                />
                <span className="category-badge-luxury">Silk Mark</span>
              </div>
              <div className="category-info-luxury">
                <h3>{category.cName}</h3>
                <p>{category.cDescription}</p>
                <span className="category-link-cta">
                  Explore Collection <ArrowRight size={14} />
                </span>
              </div>
            </Link>
          ))
        )}
      </div>

      <div className="category-featured">
        <h2>Editorial Curation</h2>
        <div className="featured-banners">
          <div className="featured-banner">
            <img
              src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1200"
              alt="Pure Kanchipuram Silks"
            />
            <div className="banner-content">
              <h3>Kanchipuram & Banarasi Silk Sarees</h3>
              <p>Certified pure zari, korvai border weaves crafted by master artisans.</p>
              <Link to="/products?category=Pure+Kanchipuram+Silk+Sarees" className="shop-now-btn">
                Shop Sarees
              </Link>
            </div>
          </div>
          <div className="featured-banner">
            <img
              src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=1200"
              alt="Bridal Jewellery"
            />
            <div className="banner-content">
              <h3>Heirloom Temple Jewellery</h3>
              <p>22K antique gold-plated nakshi work, kemp stone bridal adornments.</p>
              <Link to="/products?category=Heirloom+Gold+Temple+Jewellery" className="shop-now-btn">
                Explore Jewellery
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
