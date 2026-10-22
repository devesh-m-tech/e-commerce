import React, { useState, useEffect, useMemo } from "react";
import { useParams, useSearchParams, Link, useNavigate } from "react-router-dom";
import { productApi } from "../../APi/productApi";
import { categoryApi } from "../../APi/categoryApi";
import ProductCard from "../common/SdsProductCard";
import ModernLoader from "../Loading/ModernLoader";
import Sidebar from "../ProductPage/Sidebar";
import { AnimatePresence, motion } from "framer-motion";
import { FaFilter } from "react-icons/fa";
import { Sparkles } from "lucide-react";
import "../ProductPage/ProductPage.css";
import "../ProductPage/SideBar.css";

const KNOWN_SLUG_NAMES = {
  cat_silk_sarees: "Silk Sarees",
  cat_womens_wear: "Women's Ethnic Wear",
  cat_temple_jewellery: "Heirloom Jewellery",
  cat_jewellery: "Heirloom Jewellery",
  cat_cotton_sarees: "Cotton & Daily Sarees",
  cat_bridal_wear: "Bridal Collection",
};

const CategoryProducts = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const paramName = searchParams.get("name");
  const fallbackName =
    paramName ||
    KNOWN_SLUG_NAMES[id] ||
    (id?.toLowerCase().includes("jewel")
      ? "Heirloom Jewellery"
      : id?.toLowerCase().includes("bridal")
      ? "Bridal Collection"
      : id?.toLowerCase().includes("women")
      ? "Women's Ethnic Wear"
      : id?.toLowerCase().includes("cotton")
      ? "Cotton & Daily Sarees"
      : "Silk Sarees");

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [selectedSubCat, setSelectedSubCat] = useState(
    searchParams.get("subcategory") || ""
  );
  const [loading, setLoading] = useState(true);
  const [activeCategoryName, setActiveCategoryName] = useState(fallbackName);
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [selectedRating, setSelectedRating] = useState(null);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [sortOption, setSortOption] = useState("featured");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Close filter drawer
  const closeFilter = () => {
    setIsFilterOpen(false);
    document.body.style.overflow = "auto";
  };

  const toggleFilter = () => {
    setIsFilterOpen((prev) => !prev);
    document.body.style.overflow = !isFilterOpen ? "hidden" : "auto";
  };

  // Close filter drawer on 'closeSidebar' event (triggered by mobile apply button in Sidebar)
  useEffect(() => {
    const handleClose = () => closeFilter();
    window.addEventListener("closeSidebar", handleClose);
    return () => window.removeEventListener("closeSidebar", handleClose);
  }, []);

  // Fetch category details, products, and categories
  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchData = async () => {
      try {
        setLoading(true);

        let realName = fallbackName;
        try {
          const catDetails = await categoryApi.getCategoryById(id);
          if (catDetails?.cName) {
            realName = catDetails.cName;
          }
        } catch (err) {
          console.warn("Could not fetch category by id, using fallback name:", realName);
        }

        setActiveCategoryName(realName);

        const [prodRes, allCatsRes] = await Promise.all([
          productApi.getProductsByCategory(realName).catch(() => ({ products: [] })),
          categoryApi.getAllCategories().catch(() => [])
        ]);

        const prodList = Array.isArray(prodRes?.products)
          ? prodRes.products
          : Array.isArray(prodRes)
          ? prodRes
          : [];

        // Filter active products
        const activeProds = prodList.filter(
          (p) => !p.pStatus || p.pStatus.toLowerCase() === "active"
        );

        setProducts(activeProds);
        setFilteredProducts(activeProds);

        const loadedAllCats = Array.isArray(allCatsRes)
          ? allCatsRes
          : allCatsRes?.categories || [];
        setAllCategories(loadedAllCats);

        const initialSub = searchParams.get("subcategory");
        if (initialSub) {
          setSelectedSubCat(initialSub);
        }
      } catch (error) {
        console.error("Error fetching category data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, fallbackName, searchParams]);

  // Compute rating counts for Sidebar
  const ratingCounts = useMemo(() => {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    (products || []).forEach((product) => {
      product.pRatingsReviews?.forEach((review) => {
        const rating = Math.floor(Number(review.rating));
        if (rating >= 1 && rating <= 5) {
          counts[rating]++;
        }
      });
    });
    return counts;
  }, [products]);

  // Filter and sort products
  useEffect(() => {
    let filtered = [...products];

    // 1. Subcategory filter
    if (selectedSubCat && selectedSubCat !== "all" && selectedSubCat !== activeCategoryName) {
      const selLower = selectedSubCat.toLowerCase();
      filtered = filtered.filter((p) => {
        const subName = (p.pSubCategory || p.subcategory || "").toLowerCase();
        const catName = (p.pCategory || p.category || "").toLowerCase();
        return (
          subName === selLower ||
          catName === selLower ||
          subName.includes(selLower) ||
          catName.includes(selLower)
        );
      });
    }

    // 2. Price filter
    if (priceRange && priceRange.length === 2) {
      filtered = filtered.filter((product) => {
        const productPrice = Number(product.pPrice || product.price) || 0;
        const variantPrices =
          product.variants
            ?.filter((v) => !v.status || v.status.toLowerCase() === "active")
            .map((v) => Number(v.price) || productPrice) || [];

        const allPrices = [productPrice, ...variantPrices].filter((p) => !isNaN(p) && p > 0);
        if (allPrices.length === 0) return true;
        const minPrice = Math.min(...allPrices);
        const maxPrice = Math.max(...allPrices);

        return (
          (minPrice >= priceRange[0] && minPrice <= priceRange[1]) ||
          (maxPrice >= priceRange[0] && maxPrice <= priceRange[1]) ||
          (minPrice <= priceRange[0] && maxPrice >= priceRange[1])
        );
      });
    }

    // 3. Customer Rating filter
    if (selectedRating) {
      filtered = filtered.filter((product) => {
        const totalRatings = product.pRatingsReviews?.length || 0;
        const avgRating =
          totalRatings > 0
            ? p.pRatingsReviews.reduce((sum, item) => sum + Number(item.rating), 0) /
              totalRatings
            : Number(p.pRating || p.rating) || 0;
        return avgRating >= selectedRating;
      });
    }

    // 4. Brand filter
    if (selectedBrands.length > 0) {
      filtered = filtered.filter((product) =>
        selectedBrands.includes(product.pBrand || product.brand)
      );
    }

    // 5. Sort
    const sorted = [...filtered];
    switch (sortOption) {
      case "price-low":
        sorted.sort(
          (a, b) =>
            (Number(a.pPrice || a.price) || 0) - (Number(b.pPrice || b.price) || 0)
        );
        break;
      case "price-high":
        sorted.sort(
          (a, b) =>
            (Number(b.pPrice || b.price) || 0) - (Number(a.pPrice || a.price) || 0)
        );
        break;
      case "rating":
        sorted.sort(
          (a, b) =>
            (Number(b.pRating || b.rating) || 0) - (Number(a.pRating || a.rating) || 0)
        );
        break;
      case "newest":
        sorted.sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
        break;
      default:
        // featured: default ordering
        break;
    }

    setFilteredProducts(sorted);
  }, [
    selectedSubCat,
    activeCategoryName,
    products,
    priceRange,
    selectedRating,
    selectedBrands,
    sortOption,
  ]);

  const handleCategoryChange = (catOrSub) => {
    if (!catOrSub || catOrSub === "all") {
      setSelectedSubCat("");
    } else {
      setSelectedSubCat(catOrSub);
    }
  };

  const handlePriceChange = (newRange) => {
    setPriceRange(newRange);
  };

  const handleRatingSelect = (rating) => {
    setSelectedRating(rating === selectedRating ? null : rating);
  };

  const handleBrandChange = (brand, isChecked) => {
    setSelectedBrands((prev) =>
      isChecked ? [...prev, brand] : prev.filter((b) => b !== brand)
    );
  };

  const resetAllFilters = () => {
    setSelectedSubCat("");
    setPriceRange([0, 100000]);
    setSelectedRating(null);
    setSelectedBrands([]);
    setSortOption("featured");
  };

  return (
    <div className="sds-products-page">
      {/* ── 1. Editorial Hero Banner ── */}
      <section className="sds-catalog-hero" aria-label="Category Catalog Banner">
        <div className="sds-container">
          <nav className="sds-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <Link to="/products">Collections</Link>
            <span>/</span>
            <span className="current">{activeCategoryName}</span>
          </nav>
          <span className="sds-catalog-label">The Royal Saree & Ethnic Collection</span>
          <h1 className="sds-catalog-title">{activeCategoryName}</h1>
          <p className="sds-catalog-subtitle">
            Discover authentic handwoven silks, pure zari borders, and timeless bridal heirlooms curated with heritage craftsmanship.
          </p>
        </div>
      </section>

      {/* ── 2. Main Product Layout ── */}
      <div className="product-layout">
        {/* Mobile Backdrop */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="overlay open"
              onClick={closeFilter}
            />
          )}
        </AnimatePresence>

        {/* ── Filter Sidebar (Exact Same Component & Design as /products) ── */}
        <aside
          className={`filter-sidebar ${isFilterOpen ? "open" : ""}`}
          aria-label="Product filters"
        >
          <Sidebar
            selectedCategory={selectedSubCat}
            baseCategoryName={activeCategoryName}
            categories={allCategories}
            priceRange={priceRange}
            selectedRating={selectedRating}
            selectedBrands={selectedBrands}
            onCategoryChange={handleCategoryChange}
            onPriceChange={handlePriceChange}
            onRatingSelect={handleRatingSelect}
            onBrandChange={handleBrandChange}
            onResetFilters={resetAllFilters}
            ratingCounts={ratingCounts}
            disableNavigate={true}
          />
        </aside>

        {/* ── 3. Products Container ── */}
        <main className="products-container" id="category-products-main">
          {/* Toolbar / Products Header */}
          <div className="products-header">
            <div className="header-left-actions">
              <button
                type="button"
                className="mobile-toggle"
                onClick={toggleFilter}
                aria-label="Toggle filters"
              >
                <FaFilter className="filter-icon" />
                <span>Filters</span>
              </button>
              <span className="products-count">
                {loading
                  ? "Loading royal collection…"
                  : `Showing ${filteredProducts.length} handcrafted piece${
                      filteredProducts.length === 1 ? "" : "s"
                    }`}
              </span>
            </div>
            <div className="header-right-actions">
              <div className="sds-sort-wrapper">
                <label htmlFor="sds-cat-sort-select" className="sds-sort-label">
                  Sort By:
                </label>
                <select
                  id="sds-cat-sort-select"
                  className="sds-sort-select"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                >
                  <option value="featured">Featured Collection</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Customer Rating</option>
                  <option value="newest">New Arrivals</option>
                </select>
              </div>
            </div>
          </div>

          {/* Listing Grid / Loader / Empty State */}
          {loading ? (
            <div className="loader-full-height-modern">
              <ModernLoader />
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="products-grid">
              {filteredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Sparkles size={32} />
              </div>
              <h3 className="empty-state-title">No matching pieces found</h3>
              <p className="empty-state-subtitle">
                We couldn't find items matching your active filter criteria in{" "}
                <strong>{activeCategoryName}</strong>. Try clearing filters or adjusting price range.
              </p>
              <button
                type="button"
                onClick={resetAllFilters}
                className="empty-state-reset-btn"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CategoryProducts;