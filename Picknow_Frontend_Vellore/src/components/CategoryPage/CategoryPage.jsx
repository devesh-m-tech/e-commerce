import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { DUMMY_CATEGORIES } from '../../mockData/dummyData';
import './CategoryPage.css';

const CategoryPage = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="category-page">
      <div className="category-header">
        <h1>Shop by Collection</h1>
        <p>Explore our exclusive handcrafted dresses and heirloom jewelleries</p>
      </div>

      <div className="categories-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', maxWidth: 900, margin: '0 auto 3rem' }}>
        {loading ? (
          Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="card shimmer-effect"></div>
          ))
        ) : (
          DUMMY_CATEGORIES.map(category => (
            <Link to={`/category/${category._id}?name=${encodeURIComponent(category.cName)}`} key={category._id} className="card">
              <div className="content">
                <div className="front">
                  <img src={category.cImage} alt={category.cName} className="card-image" style={{ objectFit: 'cover' }} />
                  <div className="front-content">
                    <small className="badge">{category.cName}</small>
                    <div className="description">
                      <div className="title">
                        <strong>{category.cName}</strong>
                      </div>
                      <p className="card-footer">{category.cDescription}</p>
                    </div>
                  </div>
                </div>
                <div className="back">
                  <div className="back-content">
                    <Sparkles size={36} color="#d4af37" />
                    <strong>{category.cName}</strong>
                    <span style={{ fontSize: 13, color: '#f3e5ab', marginTop: 8 }}>View Products</span>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      <div className="category-featured">
        <h2>Curated Collections</h2>
        <div className="featured-banners">
          <div className="featured-banner">
            <img src={DUMMY_CATEGORIES[0].cImage} alt="Dresses" style={{ objectFit: 'cover' }} />
            <div className="banner-content">
              <h3>Designer Dresses & Suits</h3>
              <p>Handwoven silk anarkalis & kurtis · Up to 50% off</p>
              <Link to="/category/cat_dresses?name=Dresses" className="shop-now-btn">Shop Dresses</Link>
            </div>
          </div>
          <div className="featured-banner">
            <img src={DUMMY_CATEGORIES[1].cImage} alt="Jewelleries" style={{ objectFit: 'cover' }} />
            <div className="banner-content">
              <h3>Heirloom Temple Jewelleries</h3>
              <p>22K gold-plated temple choker sets & bridal jhumkas</p>
              <Link to="/category/cat_jewelleries?name=Jewelleries" className="shop-now-btn">Explore Jewelleries</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
