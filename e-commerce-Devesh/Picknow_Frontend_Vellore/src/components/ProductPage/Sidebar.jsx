import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronDown, ChevronUp, Search, X, RotateCcw, Star, Check } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Slider } from '@mui/material';
import { categoryApi } from '../../APi/categoryApi';
import { productApi } from '../../APi/productApi';
import { FaTimes } from 'react-icons/fa';
import { useSnackbar } from "notistack";
import "./SideBar.css";

const PRICE_PRESETS = [
  { label: 'All Prices', range: [0, 100000] },
  { label: 'Under ₹5,000', range: [0, 5000] },
  { label: '₹5,000 – ₹10,000', range: [5000, 10000] },
  { label: '₹10,000 – ₹20,000', range: [10000, 20000] },
  { label: '₹20,000 – ₹35,000', range: [20000, 35000] },
  { label: 'Above ₹35,000', range: [35000, 100000] },
];

const Sidebar = ({
  selectedCategory,
  categories,
  priceRange = [0, 100000],
  selectedRating,
  selectedBrands = [],
  onCategoryChange,
  onPriceChange,
  onRatingSelect,
  onBrandChange,
  onResetFilters,
  ratingCounts = {},
  disableNavigate = false,
  baseCategoryName = ''
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();

  // Accordion state
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: true,
    rating: true,
    brands: true,
  });

  // Category state
  const [catalogCategories, setCatalogCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const [expandedCatIds, setExpandedCatIds] = useState({});

  // Brands state
  const [availableBrands, setAvailableBrands] = useState([]);
  const [loadingBrands, setLoadingBrands] = useState(false);

  // Local price input state (for smooth manual typing without jitter)
  const [minPriceInput, setMinPriceInput] = useState(priceRange[0] || 0);
  const [maxPriceInput, setMaxPriceInput] = useState(priceRange[1] || 100000);

  // Sync inputs with external priceRange prop
  useEffect(() => {
    setMinPriceInput(priceRange[0]);
    setMaxPriceInput(priceRange[1]);
  }, [priceRange]);

  // Read URL query parameters
  const queryParams = useMemo(() => {
    const sp = new URLSearchParams(location.search);
    return {
      q: sp.get('q') || '',
      category: sp.get('category') || '',
      subcategory: sp.get('subcategory') || '',
      categoryId: sp.get('categoryId') || '',
      subcategoryId: sp.get('subcategoryId') || '',
      brand: sp.get('brand') || ''
    };
  }, [location.search]);

  // Fetch Categories once on mount
  useEffect(() => {
    let isMounted = true;
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const response = await categoryApi.getAllCategories();
        if (Array.isArray(response) && isMounted) {
          const active = response.filter(
            (c) => c.cStatus === 'active' || c.cStatus === 1 || c.cStatus === true || !c.cStatus
          );
          setCatalogCategories(active);
          if (baseCategoryName) {
            const matchingCat = active.find(
              (c) => c.cName?.toLowerCase() === baseCategoryName.toLowerCase()
            );
            if (matchingCat) {
              setExpandedCatIds((prev) => ({ ...prev, [matchingCat._id]: true }));
            }
          }
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        if (isMounted) setLoadingCategories(false);
      }
    };
    fetchCategories();
    return () => {
      isMounted = false;
    };
  }, [baseCategoryName]);

  // Fetch Brands
  useEffect(() => {
    let isMounted = true;
    const fetchBrands = async () => {
      setLoadingBrands(true);
      try {
        const response = await productApi.getBrands(queryParams.q || '');
        const payload = response?.brands || response?.data || response;
        let items = [];
        if (Array.isArray(payload)) {
          items = payload
            .map((b) => (typeof b === 'string' ? b : b?.name || b?.brand || b?.pBrand || ''))
            .filter(Boolean);
        }
        // Fallback default brand if list is empty
        if (items.length === 0) {
          items = ['Shri Deepaalaya Silks'];
        }
        const unique = Array.from(new Set(items)).sort((a, b) => a.localeCompare(b));
        if (isMounted) setAvailableBrands(unique);
      } catch (err) {
        if (isMounted) setAvailableBrands(['Shri Deepaalaya Silks']);
      } finally {
        if (isMounted) setLoadingBrands(false);
      }
    };
    fetchBrands();
    return () => {
      isMounted = false;
    };
  }, [queryParams.q]);

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleCategoryExpand = (catId, e) => {
    e.stopPropagation();
    setExpandedCatIds((prev) => ({
      ...prev,
      [catId]: !prev[catId]
    }));
  };

  // Category Selection
  const handleSelectCategory = (cat) => {
    if (!cat || cat === 'all') {
      onCategoryChange('all');
      navigate('/products', { replace: true });
      return;
    }

    const catName = typeof cat === 'string' ? cat : cat.cName;
    const catId = typeof cat === 'object' ? cat._id : null;

    if (selectedCategory === catName) {
      // Toggle off if already selected
      onCategoryChange('all');
      navigate('/products', { replace: true });
    } else {
      onCategoryChange(catName);
      if (!disableNavigate) {
        const params = new URLSearchParams();
        if (catId) params.set('categoryId', catId);
        params.set('category', catName);
        navigate(`/products?${params.toString()}`);
      } else if (catId) {
        navigate(`/category/${catId}?name=${encodeURIComponent(catName)}`);
      }
    }
  };

  // Subcategory Selection
  const handleSelectSubCategory = (subCat, parentCat) => {
    const subName = typeof subCat === 'string' ? subCat : subCat.name;
    const subId = typeof subCat === 'object' ? subCat._id : null;
    const parentName = parentCat?.cName || '';

    if (selectedCategory?.toLowerCase() === subName.toLowerCase()) {
      onCategoryChange(parentName || 'all');
      if (!disableNavigate) {
        navigate(parentName ? `/products?category=${encodeURIComponent(parentName)}` : '/products');
      }
      return;
    }

    onCategoryChange(subName);
    if (!disableNavigate) {
      const params = new URLSearchParams();
      if (subId) params.set('subcategoryId', subId);
      params.set('subcategory', subName);
      if (parentName) params.set('category', parentName);
      params.set('subcategoryName', subName);
      navigate(`/products?${params.toString()}`);
    }
  };

  // Price Slider Change
  const handleSliderChange = (_, newValue) => {
    onPriceChange(newValue);
  };

  // Manual Price Input Commit
  const handleMinPriceBlur = () => {
    let val = Math.max(0, parseInt(minPriceInput) || 0);
    if (val > priceRange[1]) val = priceRange[1];
    setMinPriceInput(val);
    onPriceChange([val, priceRange[1]]);
  };

  const handleMaxPriceBlur = () => {
    let val = Math.min(100000, parseInt(maxPriceInput) || 100000);
    if (val < priceRange[0]) val = priceRange[0];
    setMaxPriceInput(val);
    onPriceChange([priceRange[0], val]);
  };

  const handlePriceKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleMinPriceBlur();
      handleMaxPriceBlur();
    }
  };

  // Rating Toggle
  const handleRatingClick = (star) => {
    if (selectedRating === star) {
      onRatingSelect(null);
    } else {
      onRatingSelect(star);
    }
  };

  // Brand Toggle
  const handleBrandToggle = (brand) => {
    const isChecked = selectedBrands.includes(brand);
    onBrandChange(brand, !isChecked);
  };

  // Clear Individual Filter
  const clearCategoryFilter = () => {
    onCategoryChange('all');
    if (!disableNavigate) {
      const params = new URLSearchParams(location.search);
      params.delete('category');
      params.delete('subcategory');
      params.delete('categoryId');
      params.delete('subcategoryId');
      navigate(`/products${params.toString() ? '?' + params.toString() : ''}`);
    }
  };

  const clearPriceFilter = () => {
    onPriceChange([0, 100000]);
  };

  const clearRatingFilter = () => {
    onRatingSelect(null);
  };

  const clearBrandFilter = (brandToRemove) => {
    if (brandToRemove) {
      onBrandChange(brandToRemove, false);
    } else {
      selectedBrands.forEach((b) => onBrandChange(b, false));
    }
  };

  const clearSearchFilter = () => {
    const params = new URLSearchParams(location.search);
    params.delete('q');
    if (!disableNavigate) {
      navigate(`/products${params.toString() ? '?' + params.toString() : ''}`);
    }
  };

  // Filter Categories by search term
  const displayedCategories = useMemo(() => {
    if (!categorySearch.trim()) return catalogCategories;
    const term = categorySearch.toLowerCase().trim();
    return catalogCategories.filter((cat) => {
      const matchCat = cat.cName?.toLowerCase().includes(term);
      const matchSub = (cat.subCategories || []).some((sub) =>
        sub.name?.toLowerCase().includes(term)
      );
      return matchCat || matchSub;
    });
  }, [catalogCategories, categorySearch]);

  // Determine if any filter is active
  const hasCategoryFilter =
    selectedCategory &&
    selectedCategory !== 'all' &&
    selectedCategory !== '' &&
    (!baseCategoryName || selectedCategory.toLowerCase() !== baseCategoryName.toLowerCase());
  const hasPriceFilter = priceRange[0] > 0 || priceRange[1] < 100000;
  const hasRatingFilter = selectedRating !== null && selectedRating !== undefined;
  const hasBrandFilter = selectedBrands.length > 0;
  const hasSearchFilter = !!queryParams.q;
  const anyFilterActive =
    hasCategoryFilter ||
    hasPriceFilter ||
    hasRatingFilter ||
    hasBrandFilter ||
    hasSearchFilter;

  // Check matching price preset
  const activePresetIndex = PRICE_PRESETS.findIndex(
    (p) => p.range[0] === priceRange[0] && p.range[1] === priceRange[1]
  );

  return (
    <div className="sds-filter-sidebar-inner">
      {/* ── Sidebar Top Header ── */}
      <div className="sidebar-header-premium">
        <div className="sidebar-header-title-wrap">
          <span className="sidebar-header-eyebrow">Refine By</span>
          <h4 className="sidebar-header-title">Filters</h4>
        </div>
        <div className="sidebar-header-actions">
          {anyFilterActive && (
            <button
              type="button"
              onClick={onResetFilters}
              className="reset-mini-link"
              title="Clear all active filters"
            >
              <RotateCcw size={11} />
              <span>Clear All</span>
            </button>
          )}
          <button
            type="button"
            className="sidebar-close-mobile"
            onClick={() => window.dispatchEvent(new Event('closeSidebar'))}
            aria-label="Close Filters"
          >
            <FaTimes />
          </button>
        </div>
      </div>

      {/* ── Active Filters Summary Bar ── */}
      {anyFilterActive && (
        <div className="active-filters-wrap" aria-label="Active Filters">
          <div className="active-filters-header">
            <span className="active-filters-label">Active Filters</span>
          </div>
          <div className="active-filter-chips">
            {hasSearchFilter && (
              <button
                type="button"
                className="active-filter-chip"
                onClick={clearSearchFilter}
                title="Remove search query"
              >
                <span>Search: "{queryParams.q}"</span>
                <X size={12} />
              </button>
            )}

            {hasCategoryFilter && (
              <button
                type="button"
                className="active-filter-chip"
                onClick={clearCategoryFilter}
                title="Remove category filter"
              >
                <span>{selectedCategory}</span>
                <X size={12} />
              </button>
            )}

            {hasPriceFilter && (
              <button
                type="button"
                className="active-filter-chip"
                onClick={clearPriceFilter}
                title="Reset price range"
              >
                <span>
                  ₹{priceRange[0].toLocaleString('en-IN')} – ₹{priceRange[1].toLocaleString('en-IN')}
                </span>
                <X size={12} />
              </button>
            )}

            {hasRatingFilter && (
              <button
                type="button"
                className="active-filter-chip"
                onClick={clearRatingFilter}
                title="Reset rating filter"
              >
                <span>{selectedRating}★ & Above</span>
                <X size={12} />
              </button>
            )}

            {hasBrandFilter &&
              selectedBrands.map((brand) => (
                <button
                  type="button"
                  key={brand}
                  className="active-filter-chip"
                  onClick={() => clearBrandFilter(brand)}
                  title={`Remove ${brand}`}
                >
                  <span>{brand}</span>
                  <X size={12} />
                </button>
              ))}
          </div>
        </div>
      )}

      {/* ── 1. Collections & Categories Section ── */}
      <section className="sidebar-section">
        <div
          className="filter-section-header"
          onClick={() => toggleSection('categories')}
          role="button"
          tabIndex={0}
          aria-expanded={expandedSections.categories}
        >
          <div className="filter-title-group">
            <h5 className="filter-title">Collections</h5>
            {hasCategoryFilter && <span className="filter-dot-active" />}
          </div>
          <span className="filter-chevron-icon">
            {expandedSections.categories ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </span>
        </div>

        {expandedSections.categories && (
          <div className="filter-section-body">
            {/* Quick search input */}
            <div className="category-search-box">
              <Search size={13} className="category-search-icon" />
              <input
                type="text"
                placeholder="Search collections..."
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                className="category-search-input"
              />
              {categorySearch && (
                <button
                  type="button"
                  onClick={() => setCategorySearch('')}
                  className="category-search-clear"
                  aria-label="Clear search"
                >
                  <X size={11} />
                </button>
              )}
            </div>

            {loadingCategories ? (
              <div className="filter-loading-text">Loading collections...</div>
            ) : (
              <div className="category-tree-list">
                {/* All Collections Link */}
                <div
                  className={`category-tree-item ${
                    (selectedCategory === 'all' || !selectedCategory) && !baseCategoryName ? 'active' : ''
                  }`}
                  onClick={() => handleSelectCategory('all')}
                  role="button"
                  tabIndex={0}
                >
                  <span className="category-name-text">All Collections</span>
                  <span className="category-count-pill">All</span>
                </div>

                {displayedCategories.map((cat) => {
                  const isCatSelected =
                    (selectedCategory && selectedCategory.toLowerCase() === cat.cName?.toLowerCase()) ||
                    (!selectedCategory && baseCategoryName && baseCategoryName.toLowerCase() === cat.cName?.toLowerCase()) ||
                    queryParams.category?.toLowerCase() === cat.cName?.toLowerCase();
                  const hasSubs = Array.isArray(cat.subCategories) && cat.subCategories.length > 0;
                  const isCatExpanded = !!expandedCatIds[cat._id];

                  return (
                    <div key={cat._id} className="category-group-wrap">
                      <div
                        className={`category-tree-item ${isCatSelected ? 'active' : ''}`}
                        onClick={() => handleSelectCategory(cat)}
                        role="button"
                        tabIndex={0}
                      >
                        <span className="category-name-text">{cat.cName}</span>
                        <div className="category-meta-actions">
                          {cat.products !== undefined && (
                            <span className="category-count-pill">{cat.products}</span>
                          )}
                          {hasSubs && (
                            <button
                              type="button"
                              className="category-sub-toggle"
                              onClick={(e) => toggleCategoryExpand(cat._id, e)}
                              aria-label={`Toggle ${cat.cName} subcategories`}
                            >
                              {isCatExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Subcategories (if expanded) */}
                      {hasSubs && isCatExpanded && (
                        <div className="category-sub-list">
                          {cat.subCategories.map((sub) => {
                            const isSubSelected =
                              selectedCategory?.toLowerCase() === sub.name?.toLowerCase() ||
                              queryParams.subcategory?.toLowerCase() === sub.name?.toLowerCase();
                            return (
                              <div
                                key={sub._id || sub.name}
                                className={`category-sub-item ${isSubSelected ? 'active' : ''}`}
                                onClick={() => handleSelectSubCategory(sub, cat)}
                                role="button"
                                tabIndex={0}
                              >
                                <span className="category-sub-dot" />
                                <span className="category-sub-name">{sub.name}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}

                {displayedCategories.length === 0 && (
                  <div className="no-filter-results">No collections found matching "{categorySearch}"</div>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      {/* ── 2. Price Range Section ── */}
      <section className="sidebar-section">
        <div
          className="filter-section-header"
          onClick={() => toggleSection('price')}
          role="button"
          tabIndex={0}
          aria-expanded={expandedSections.price}
        >
          <div className="filter-title-group">
            <h5 className="filter-title">Price Range</h5>
            {hasPriceFilter && <span className="filter-dot-active" />}
          </div>
          <span className="filter-chevron-icon">
            {expandedSections.price ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </span>
        </div>

        {expandedSections.price && (
          <div className="filter-section-body">
            {/* Live Range Display */}
            <div className="price-range-display">
              <span className="price-range-value">
                ₹{priceRange[0].toLocaleString('en-IN')}
              </span>
              <span className="price-range-divider">to</span>
              <span className="price-range-value">
                ₹{priceRange[1].toLocaleString('en-IN')}
              </span>
            </div>

            {/* Quick Price Preset Chips */}
            <div className="price-presets-grid">
              {PRICE_PRESETS.map((preset, index) => {
                const isActive = activePresetIndex === index;
                return (
                  <button
                    type="button"
                    key={preset.label}
                    className={`price-preset-chip ${isActive ? 'active' : ''}`}
                    onClick={() => onPriceChange(preset.range)}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            {/* MUI Luxury Slider */}
            <div className="price-slider-wrap">
              <Slider
                value={priceRange}
                onChange={handleSliderChange}
                min={0}
                max={100000}
                step={500}
                valueLabelDisplay="auto"
                valueLabelFormat={(val) => `₹${val.toLocaleString('en-IN')}`}
                aria-label="Price range slider"
              />
            </div>

            {/* Manual Numeric Inputs */}
            <div className="price-inputs-row">
              <div className="price-input-wrapper">
                <span className="price-input-currency">₹</span>
                <input
                  type="number"
                  min={0}
                  max={priceRange[1]}
                  step={500}
                  value={minPriceInput}
                  onChange={(e) => setMinPriceInput(e.target.value)}
                  onBlur={handleMinPriceBlur}
                  onKeyDown={handlePriceKeyDown}
                  placeholder="Min"
                  className="price-input-field"
                  aria-label="Minimum price"
                />
              </div>
              <span className="price-input-to">to</span>
              <div className="price-input-wrapper">
                <span className="price-input-currency">₹</span>
                <input
                  type="number"
                  min={priceRange[0]}
                  max={100000}
                  step={500}
                  value={maxPriceInput}
                  onChange={(e) => setMaxPriceInput(e.target.value)}
                  onBlur={handleMaxPriceBlur}
                  onKeyDown={handlePriceKeyDown}
                  placeholder="Max"
                  className="price-input-field"
                  aria-label="Maximum price"
                />
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ── 3. Customer Rating Section ── */}
      <section className="sidebar-section">
        <div
          className="filter-section-header"
          onClick={() => toggleSection('rating')}
          role="button"
          tabIndex={0}
          aria-expanded={expandedSections.rating}
        >
          <div className="filter-title-group">
            <h5 className="filter-title">Customer Rating</h5>
            {hasRatingFilter && <span className="filter-dot-active" />}
          </div>
          <span className="filter-chevron-icon">
            {expandedSections.rating ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </span>
        </div>

        {expandedSections.rating && (
          <div className="filter-section-body">
            <div className="rating-options-list">
              {[4, 3, 2, 1].map((stars) => {
                const isSelected = selectedRating === stars;
                const count = ratingCounts?.[stars] ?? 0;
                return (
                  <div
                    key={stars}
                    className={`rating-option-row ${isSelected ? 'active' : ''}`}
                    onClick={() => handleRatingClick(stars)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="rating-stars-group">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={15}
                          className={`rating-star-icon ${s <= stars ? 'filled' : 'empty'}`}
                        />
                      ))}
                    </div>
                    <span className="rating-label-text">{stars}★ & Above</span>
                    {count > 0 && <span className="rating-count-pill">({count})</span>}
                    {isSelected && <Check size={14} className="rating-selected-check" />}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* ── 4. Heritage Weavers & Brands Section ── */}
      {availableBrands.length > 0 && (
        <section className="sidebar-section">
          <div
            className="filter-section-header"
            onClick={() => toggleSection('brands')}
            role="button"
            tabIndex={0}
            aria-expanded={expandedSections.brands}
          >
            <div className="filter-title-group">
              <h5 className="filter-title">Weavers & Brands</h5>
              {hasBrandFilter && <span className="filter-dot-active" />}
            </div>
            <span className="filter-chevron-icon">
              {expandedSections.brands ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </span>
          </div>

          {expandedSections.brands && (
            <div className="filter-section-body">
              {loadingBrands ? (
                <div className="filter-loading-text">Loading brands...</div>
              ) : (
                <div className="brand-options-list">
                  {availableBrands.map((brand) => {
                    const isChecked = selectedBrands.includes(brand);
                    return (
                      <label key={brand} className="brand-option-item">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleBrandToggle(brand)}
                          className="brand-checkbox-input"
                        />
                        <span className="brand-checkbox-custom">
                          {isChecked && <Check size={11} strokeWidth={3} />}
                        </span>
                        <span className="brand-label-text">{brand}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* ── Sidebar Action Footer ── */}
      <div className="sidebar-action-footer">
        <button
          type="button"
          onClick={onResetFilters}
          className="luxury-reset-btn"
          title="Clear all filters and reset catalog"
        >
          <RotateCcw size={14} className="reset-icon-svg" />
          <span>RESET ALL FILTERS</span>
        </button>

        {/* Mobile-Only Apply Button */}
        <button
          type="button"
          className="sidebar-mobile-apply-btn"
          onClick={() => window.dispatchEvent(new Event('closeSidebar'))}
        >
          <span>VIEW RESULTS</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;