import productModel from "../models/Product.js";
import { comboModel } from "../models/combo.js";
import { categoryModel } from "../models/Category.js";
import ProductVariant from "../models/ProductVariant.js";

// Common Indian ethnic & apparel colors for semantic color search
const COLOR_KEYWORDS = [
  "red", "crimson", "maroon", "vermilion", "scarlet", "ruby",
  "blue", "peacock blue", "navy", "royal blue", "sky blue", "indigo", "teal", "cyan",
  "green", "mint", "mint green", "emerald", "bottle green", "olive", "sage",
  "gold", "golden", "antique gold", "yellow", "mustard", "lemon", "ochre",
  "pink", "rose", "magenta", "rani pink", "baby pink", "coral", "peach",
  "purple", "violet", "lavender", "plum", "wine", "aubergine",
  "white", "off-white", "ivory", "cream", "beige", "champagne",
  "black", "grey", "silver", "charcoal",
  "orange", "rust", "copper", "bronze", "amber"
];

// Helper: escape regex special characters
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Enhanced Search Controller:
 * Searches across:
 * 1. Product Name (pName)
 * 2. Color (ProductVariant.attributes.color, pName, pDescription)
 * 3. Category & SubCategory (pCategory, pSubCategory, pNestedSubCategory)
 * 4. Multi-word phrases (e.g., "Red silk saree", "Gold choker")
 */
export const search = async (req, res) => {
  try {
    const {
      type = 'all',
      pType,
      category,
      minPrice,
      maxPrice,
      brand,
      inStock,
      sort = 'relevance',
      page = 1,
      limit = 20,
      comboLimit
    } = req.query;

    // Support both 'q' and 'query' parameter
    const query = (req.query.query || req.query.q || req.query.searchTerm || '').trim();

    // 1. Build base filters (status, stock, brand, price)
    const baseConditions = [
      { pStatus: { $regex: new RegExp("^(active|Out of Stock)$", "i") } }
    ];

    if (inStock === 'true') {
      baseConditions.push({ pStock: { $gt: 0 } });
    }

    if (brand) {
      baseConditions.push({ pBrand: { $regex: escapeRegex(brand), $options: 'i' } });
    }

    if (category && category.toLowerCase() !== 'all') {
      baseConditions.push({
        $or: [
          { pCategory: { $regex: escapeRegex(category), $options: 'i' } },
          { pSubCategory: { $regex: escapeRegex(category), $options: 'i' } }
        ]
      });
    }

    if (pType && pType.toLowerCase() !== 'all' && pType.toLowerCase() !== 'combo') {
      baseConditions.push({ pType });
    }

    if (minPrice || maxPrice) {
      const priceFilter = {};
      if (minPrice) priceFilter.$gte = Number(minPrice);
      if (maxPrice) priceFilter.$lte = Number(maxPrice);
      baseConditions.push({ pPrice: priceFilter });
    }

    // 2. Build text / name / color / category search criteria
    if (query) {
      const escapedQuery = escapeRegex(query);

      // A. Find product IDs from ProductVariant matching color
      const matchingColorVariants = await ProductVariant.find({
        $or: [
          { 'attributes.color': { $regex: escapedQuery, $options: 'i' } },
          { 'attributes.size': { $regex: escapedQuery, $options: 'i' } }
        ],
        status: { $regex: /^active$/i }
      }).distinct('productId');

      // B. Find categories & subcategories matching query
      const matchingCategoryDocs = await categoryModel.find({
        $or: [
          { cName: { $regex: escapedQuery, $options: 'i' } },
          { 'subCategories.name': { $regex: escapedQuery, $options: 'i' } }
        ]
      }).select('cName subCategories.name');

      const matchedCategoryNames = [];
      matchingCategoryDocs.forEach((c) => {
        matchedCategoryNames.push(c.cName);
        (c.subCategories || []).forEach((sub) => {
          if (new RegExp(escapedQuery, 'i').test(sub.name)) {
            matchedCategoryNames.push(sub.name);
          }
        });
      });

      // C. Split multi-word query (e.g. "Red silk saree")
      const words = query
        .split(/\s+/)
        .map((w) => w.trim())
        .filter((w) => w.length > 1 && !['in', 'for', 'with', 'the', 'and', 'a', 'of'].includes(w.toLowerCase()));

      let textQueryCondition;

      if (words.length > 1) {
        // Multi-word matching: each word must match somewhere across [name, category, subcategory, color, desc]
        const wordSubConditions = await Promise.all(
          words.map(async (word) => {
            const escWord = escapeRegex(word);
            const wordColorVariantIds = await ProductVariant.find({
              'attributes.color': { $regex: escWord, $options: 'i' },
              status: { $regex: /^active$/i }
            }).distinct('productId');

            return {
              $or: [
                { pName: { $regex: escWord, $options: 'i' } },
                { pCategory: { $regex: escWord, $options: 'i' } },
                { pSubCategory: { $regex: escWord, $options: 'i' } },
                { pNestedSubCategory: { $regex: escWord, $options: 'i' } },
                { pDescription: { $regex: escWord, $options: 'i' } },
                { pShortDescription: { $regex: escWord, $options: 'i' } },
                { pBrand: { $regex: escWord, $options: 'i' } },
                ...(wordColorVariantIds.length > 0 ? [{ _id: { $in: wordColorVariantIds } }] : [])
              ]
            };
          })
        );

        textQueryCondition = {
          $or: [
            // Full phrase match takes priority
            { pName: { $regex: escapedQuery, $options: 'i' } },
            { pCategory: { $regex: escapedQuery, $options: 'i' } },
            { pSubCategory: { $regex: escapedQuery, $options: 'i' } },
            ...(matchingColorVariants.length > 0 ? [{ _id: { $in: matchingColorVariants } }] : []),
            // Or all individual words present
            { $and: wordSubConditions }
          ]
        };
      } else {
        // Single word or exact phrase matching
        textQueryCondition = {
          $or: [
            // 1. Product Name
            { pName: { $regex: escapedQuery, $options: 'i' } },
            // 2. Category & Subcategory
            { pCategory: { $regex: escapedQuery, $options: 'i' } },
            { pSubCategory: { $regex: escapedQuery, $options: 'i' } },
            { pNestedSubCategory: { $regex: escapedQuery, $options: 'i' } },
            ...(matchedCategoryNames.length > 0
              ? [
                  { pCategory: { $in: matchedCategoryNames } },
                  { pSubCategory: { $in: matchedCategoryNames } }
                ]
              : []),
            // 3. Color (via variant match or in text)
            ...(matchingColorVariants.length > 0 ? [{ _id: { $in: matchingColorVariants } }] : []),
            // 4. Descriptions & Brand
            { pDescription: { $regex: escapedQuery, $options: 'i' } },
            { pShortDescription: { $regex: escapedQuery, $options: 'i' } },
            { pBrand: { $regex: escapedQuery, $options: 'i' } }
          ]
        };
      }

      baseConditions.push(textQueryCondition);
    }

    const searchQuery = { $and: baseConditions };

    // 3. Sorting options
    let sortOptions = {};
    switch (sort) {
      case 'price_asc':
      case 'price-low':
        sortOptions = { pPrice: 1 };
        break;
      case 'price_desc':
      case 'price-high':
        sortOptions = { pPrice: -1 };
        break;
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      case 'bestselling':
        sortOptions = { pSold: -1 };
        break;
      case 'rating':
        sortOptions = { pRating: -1, createdAt: -1 };
        break;
      case 'name_asc':
        sortOptions = { pName: 1 };
        break;
      case 'name_desc':
        sortOptions = { pName: -1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }

    // 4. Pagination
    const skip = (Number(page) - 1) * Number(limit);

    // 5. Execute search based on type
    let results = {};
    let products = [];
    let facets = {};

    switch (type.toLowerCase()) {
      case 'products':
        products = await searchProducts(searchQuery, sortOptions, skip, Number(limit));
        results = { products };
        facets = await getProductFacets(searchQuery);
        break;

      case 'combos':
        results.combos = await searchCombos(query, sortOptions, skip, Number(limit));
        break;

      case 'all':
      default: {
        const combosPageSize = Number(comboLimit) || 10;
        const [prodList, combos, categories] = await Promise.all([
          searchProducts(searchQuery, sortOptions, skip, Number(limit)),
          searchCombos(query, sortOptions, 0, combosPageSize),
          searchCategories(query, skip, Number(limit))
        ]);
        products = prodList;
        results = { products: prodList, combos, categories };
        facets = await getProductFacets(searchQuery);
        break;
      }
    }

    // 6. Total counts
    const totalCounts = await getTotalCounts(type, searchQuery, query);

    return res.status(200).json({
      success: true,
      products, // Top-level products array for ProductPage.jsx and general consumers
      total: totalCounts.products || totalCounts.total,
      count: products.length,
      results,  // For SearchResults.jsx
      facets,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.max(1, Math.ceil((totalCounts.products || totalCounts.total) / Number(limit))),
        totalResults: totalCounts.products || totalCounts.total,
        limit: Number(limit)
      },
      filters: {
        appliedFilters: {
          query,
          type,
          pType: pType || undefined,
          category,
          minPrice,
          maxPrice,
          brand,
          inStock,
          sort
        }
      }
    });
  } catch (error) {
    console.error('Search error in searchController:', error);
    return res.status(500).json({
      success: false,
      message: 'Error performing search',
      error: error.message
    });
  }
};

// Helper: Search and format products with variants and colors
async function searchProducts(searchQuery, sortOptions, skip, limit) {
  const products = await productModel
    .find(searchQuery)
    .populate('variants')
    .sort(sortOptions)
    .skip(skip)
    .limit(limit);

  return products.map((product) => {
    const totalRatings = product.pRatingsReviews?.length || 0;
    const avgRating =
      totalRatings > 0
        ? product.pRatingsReviews.reduce((sum, item) => sum + Number(item.rating), 0) / totalRatings
        : Number(product.pRating) || 0;

    const activeVariants = (product.variants || []).filter(
      (v) => !v.status || v.status.toLowerCase() === 'active'
    );

    // Extract color attribute
    const variantColor = activeVariants.find((v) => v.attributes?.color)?.attributes?.color || '';

    return {
      ...product.toObject(),
      pImage: Array.isArray(product.pImage) ? product.pImage : [],
      variants: activeVariants,
      color: variantColor,
      averageRating: Number(avgRating.toFixed(1)),
      totalReviews: totalRatings,
      inStock: (product.pStock || 0) > 0
    };
  });
}

// Helper: Product Facets (brands, categories, priceRanges)
async function getProductFacets(searchQuery) {
  try {
    const facets = await productModel.aggregate([
      { $match: searchQuery },
      {
        $facet: {
          brands: [
            { $group: { _id: '$pBrand', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ],
          categories: [
            { $group: { _id: '$pCategory', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ],
          subCategories: [
            { $group: { _id: '$pSubCategory', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ]
        }
      }
    ]);
    return facets[0] || {};
  } catch (err) {
    console.error('Error computing facets:', err);
    return {};
  }
}

// Helper: Search combos
async function searchCombos(query, sortOptions, skip, limit) {
  const searchQuery = query
    ? {
        $or: [
          { ccName: { $regex: escapeRegex(query), $options: 'i' } },
          { ccDescription: { $regex: escapeRegex(query), $options: 'i' } }
        ]
      }
    : {};

  return await comboModel
    .find(searchQuery)
    .populate('ccProducts')
    .sort(sortOptions)
    .skip(skip)
    .limit(limit);
}

// Helper: Search categories
async function searchCategories(query, skip, limit) {
  const searchQuery = query
    ? {
        $or: [
          { cName: { $regex: escapeRegex(query), $options: 'i' } },
          { cDescription: { $regex: escapeRegex(query), $options: 'i' } },
          { 'subCategories.name': { $regex: escapeRegex(query), $options: 'i' } }
        ]
      }
    : {};

  return await categoryModel.find(searchQuery).skip(skip).limit(limit);
}

// Helper: Get total counts
async function getTotalCounts(type, searchQuery, query) {
  const counts = { products: 0, combos: 0, categories: 0, total: 0 };
  try {
    counts.products = await productModel.countDocuments(searchQuery);

    if (query) {
      const escaped = escapeRegex(query);
      counts.combos = await comboModel.countDocuments({
        $or: [
          { ccName: { $regex: escaped, $options: 'i' } },
          { ccDescription: { $regex: escaped, $options: 'i' } }
        ]
      });
      counts.categories = await categoryModel.countDocuments({
        $or: [
          { cName: { $regex: escaped, $options: 'i' } },
          { cDescription: { $regex: escaped, $options: 'i' } },
          { 'subCategories.name': { $regex: escaped, $options: 'i' } }
        ]
      });
    }

    counts.total = counts.products + counts.combos + counts.categories;
  } catch (err) {
    console.error('Error counting results:', err);
  }
  return counts;
}

/**
 * Enhanced Live Search Suggestions:
 * Matches Product Name, Color, and Category for real-time drawer dropdown
 */
export const getSearchSuggestions = async (req, res) => {
  try {
    const query = (req.query.query || req.query.q || '').trim();
    const limit = Number(req.query.limit) || 8;

    if (!query || query.length < 2) {
      return res.status(200).json({
        success: true,
        suggestions: { products: [], categories: [], colors: [], brands: [] }
      });
    }

    const escapedQuery = escapeRegex(query);

    // 1. Color variant lookup
    const matchingColorVariants = await ProductVariant.find({
      'attributes.color': { $regex: escapedQuery, $options: 'i' },
      status: { $regex: /^active$/i }
    }).select('productId attributes.color');

    const colorProductIds = matchingColorVariants.map((v) => v.productId);
    const matchedColorNames = Array.from(
      new Set(matchingColorVariants.map((v) => v.attributes?.color).filter(Boolean))
    );

    // 2. Parallel queries for products, categories, and brands
    const [products, matchingCategories, brands] = await Promise.all([
      productModel
        .find({
          pStatus: { $regex: new RegExp("^(active|Out of Stock)$", "i") },
          $or: [
            { pName: { $regex: escapedQuery, $options: 'i' } },
            { pCategory: { $regex: escapedQuery, $options: 'i' } },
            { pSubCategory: { $regex: escapedQuery, $options: 'i' } },
            ...(colorProductIds.length > 0 ? [{ _id: { $in: colorProductIds } }] : [])
          ]
        })
        .populate('variants')
        .select('pName pCategory pSubCategory pBrand pPrice pPreviousPrice pOffer pImage variants')
        .limit(limit),

      categoryModel
        .find({
          $or: [
            { cName: { $regex: escapedQuery, $options: 'i' } },
            { 'subCategories.name': { $regex: escapedQuery, $options: 'i' } }
          ]
        })
        .select('cName subCategories.name')
        .limit(4),

      productModel.distinct('pBrand', {
        pBrand: { $regex: escapedQuery, $options: 'i' }
      })
    ]);

    // Format products with color information
    const formattedProducts = products.map((p) => {
      const activeVars = (p.variants || []).filter(
        (v) => !v.status || v.status.toLowerCase() === 'active'
      );
      const color = activeVars.find((v) => v.attributes?.color)?.attributes?.color || '';

      return {
        type: 'product',
        id: p._id,
        _id: p._id,
        name: p.pName,
        category: p.pCategory,
        subCategory: p.pSubCategory,
        brand: p.pBrand,
        price: p.pPrice,
        previousPrice: p.pPreviousPrice,
        offer: p.pOffer,
        color: color,
        image: Array.isArray(p.pImage) ? p.pImage[0] : p.pImage
      };
    });

    // Format categories (including matching subcategories)
    const categorySuggestions = [];
    matchingCategories.forEach((cat) => {
      if (new RegExp(escapedQuery, 'i').test(cat.cName)) {
        categorySuggestions.push({
          type: 'category',
          name: cat.cName,
          categoryName: cat.cName
        });
      }
      (cat.subCategories || []).forEach((sub) => {
        if (new RegExp(escapedQuery, 'i').test(sub.name)) {
          categorySuggestions.push({
            type: 'subcategory',
            name: sub.name,
            categoryName: cat.cName,
            subCategoryName: sub.name
          });
        }
      });
    });

    // Also check semantic color keywords (e.g. if query matches "red", "gold", "blue")
    const semanticColors = COLOR_KEYWORDS.filter((col) => col.includes(query.toLowerCase())).slice(0, 3);
    const combinedColors = Array.from(new Set([...matchedColorNames, ...semanticColors])).slice(0, 5);

    return res.status(200).json({
      success: true,
      suggestions: {
        products: formattedProducts,
        categories: categorySuggestions.slice(0, 5),
        colors: combinedColors.map((c) => ({ type: 'color', name: c })),
        brands: brands.slice(0, 3).map((b) => ({ type: 'brand', name: b }))
      }
    });
  } catch (error) {
    console.error('getSearchSuggestions error in searchController:', error);
    return res.status(500).json({
      success: false,
      message: 'Error getting search suggestions',
      error: error.message
    });
  }
};