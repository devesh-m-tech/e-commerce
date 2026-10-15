import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { categoryApi } from "../../APi/categoryApi";
import "./CategoryNav.css";
import { ChevronRight, ChevronLeft } from "lucide-react";

const CategoryNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showArrows, setShowArrows] = useState(false);
  const scrollRef = useRef(null);

  const checkOverflow = () => {
    if (scrollRef.current) {
      const el = scrollRef.current;
      setShowArrows(el.scrollWidth > el.clientWidth + 8);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryApi.getAllCategories();
        const data = Array.isArray(response) ? response : (response.categories || []);
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [categories, loading]);

  const handleCategoryClick = (category) => {
    navigate(`/category/${category._id}?name=${encodeURIComponent(category.cName)}`);
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - 220 : scrollLeft + 220;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="category-nav-wrapper-sleek">
      <div className="category-nav-container-sleek">
        {showArrows && (
          <>
            <button className="scroll-arrow left" onClick={() => scroll('left')} aria-label="Scroll left">
              <ChevronLeft size={18} />
            </button>
            <button className="scroll-arrow right" onClick={() => scroll('right')} aria-label="Scroll right">
              <ChevronRight size={18} />
            </button>
          </>
        )}
        <div className="category-scroll-area" ref={scrollRef}>
          {loading ? (
            <div className="cat-skeleton-loader">
              {[1, 2].map(i => <div key={i} className="cat-skeleton-item" />)}
            </div>
          ) : (
            categories.map((cat) => {
              const isActive = location.pathname.includes(cat._id) || location.search.includes(cat.cName);
              return (
                <div
                  key={cat._id}
                  className={`cat-item-sleek ${isActive ? 'active' : ''}`}
                  onClick={() => handleCategoryClick(cat)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="cat-icon-container">
                    <img src={cat.cImage || "https://cdn-icons-png.flaticon.com/512/3061/3061730.png"} alt={cat.cName} />
                  </div>
                  <span className="cat-name-sleek">{cat.cName}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryNav;