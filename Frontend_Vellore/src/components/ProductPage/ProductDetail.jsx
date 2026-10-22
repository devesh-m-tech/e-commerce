import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  ArrowLeft,
  ShoppingCart,
  X,
  Heart,
  Star,
  Minus,
  Plus,
  Share2,
  Package,
  RefreshCw,
  Truck,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Search,
  Scale,
  Award,
} from "lucide-react";
import ProductRecommendations from "./ProductRecommendations";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./ProductDetail.css";

import api from "../../APi/api";
import { productApi } from "../../APi/productApi";
import { cartApi } from "../../APi/cartApi";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from "../../APi/userApi";
import { useSnackbar } from "notistack";
import { transformImageUrl } from "../../APi/utils";
import ModernLoader from "../Loading/ModernLoader";
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  IconButton,
  Rating,
  Chip,
  Tabs,
  Tab,
  Card,
  CardContent,
  Stack,
  Divider,
  useTheme,
  useMediaQuery,
  styled,
  CardMedia,
  CircularProgress,
  TextField,
} from "@mui/material";
import {
  FavoriteBorder,
  Favorite,
  Share,
  LocalShipping,
  Security,
  Loop,
  Check,
  ExpandMore,
} from "@mui/icons-material";
// import Footer from "../Footer/Footer"; // Removed to prevent duplication
import Heading from "../Heading";
// Styled components
const ProductImage = styled("img")(({ theme }) => ({
  width: "100%",
  height: "400px",
  objectFit: "contain",
  cursor: "pointer",
  [theme.breakpoints.down("md")]: {
    height: "250px",
  },
  [theme.breakpoints.down("sm")]: {
    height: "200px",
  },
}));

const ImageContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  overflow: "hidden",
  maxWidth: "500px",
  margin: "0 auto",
  boxShadow: "none",
}));

const ZoomHint = styled(Typography)(({ theme }) => ({
  position: "absolute",
  bottom: "10px",
  left: "50%",
  transform: "translateX(-50%)",
  background: "rgba(0, 0, 0, 0.7)",
  color: "white",
  padding: "6px 12px",
  borderRadius: "20px",
  fontSize: "12px",
  opacity: 1,
  transition: "opacity 0.2s",
  zIndex: 2,
  pointerEvents: "none",
}));

const ThumbnailImage = styled("img")(({ theme, active }) => ({
  width: "80px",
  height: "80px",
  objectFit: "cover",
  borderRadius: theme.shape.borderRadius,
  cursor: "pointer",
  backgroundColor: "#fff",
  border: active
    ? `2px solid ${theme.palette.primary.main}`
    : "2px solid transparent",
  transition: theme.transitions.create(["transform", "border-color"]),
  "&:hover": {
    transform: "scale(1.05)",
  },
}));

const ProductDetail = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isVideoSelected, setIsVideoSelected] = useState(false);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartSuccessOpen, setCartSuccessOpen] = useState(false);
  const [cartSuccessMessage, setCartSuccessMessage] = useState("");
  const cartSuccessTimerRef = useRef(null);
  const [canreview, setcanreview] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsPerPage] = useState(5);
  const [visibleReviews, setVisibleReviews] = useState(5);
  const [selectedSize, setSelectedSize] = useState("M");
  const [activeTab, setActiveTab] = useState("description");
  const [selectedColor, setSelectedColor] = useState("");
  const [tabValue, setTabValue] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [variants, setVariants] = useState([]);
  const [userReview, setUserReview] = useState("");
  const [userRating, setUserRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [groupedProducts, setGroupedProducts] = useState([]);
  const [groupedProductData, setGroupedProductData] = useState(null);
  const [variantsResponse, setVariantsResponse] = useState(null);
  const [imagePopup, setImagePopup] = useState({
    show: false,
    x: 0,
    y: 0,
    image: null,
  });
  const [popupImageIndex, setPopupImageIndex] = useState(0);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [isZooming, setIsZooming] = useState(false);

  const handleMouseMoveZoom = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - left) / width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - top) / height) * 100));
    setZoomPosition({ x, y });
  };
  const [loadingGrouped, setLoadingGrouped] = useState(false);
  const [colorToProductMap, setColorToProductMap] = useState({});

  const handleColorChange = (color) => {
    setSelectedColor(color);
    
    // 1. Try to find color in current variants
    const colorVariants = variants.filter(
      (v) => (v.attributes?.color || v.color)?.toLowerCase() === color.toLowerCase()
    );
    
    if (colorVariants.length > 0) {
      setSelectedVariant(colorVariants[0]);
      setQuantity(colorVariants[0].min || 1);
      return;
    }

    // 2. If not in current variants, check mapping for navigation
    // Only navigate if the target product has the SAME product name (same group)
    const targetId = colorToProductMap[color.toLowerCase()];
    if (targetId && targetId.toString() !== id) {
      const targetProductName = colorToProductMap[`__name__${color.toLowerCase()}`];
      if (targetProductName && targetProductName === product?.pName) {
        navigate(`/product/${targetId}`);
      }
    }
  };

  const handleImagepopup = (index) => {
    const safeIndex =
      typeof index === "number" && index >= 0 && index < productImages.length
        ? index
        : 0;

    setPopupImageIndex(safeIndex);
    setImagePopup((prev) => ({
      ...prev,
      show: true,
      image: productImages[safeIndex]?.url || product?.pImage?.[0] || "",
    }));
  };

  const closeImagePopup = () => {
    setImagePopup({ show: false, x: 0, y: 0, image: null });
  };

  const handlePopupPrev = (e) => {
    e.stopPropagation();
    if (!productImages || productImages.length === 0) return;

    if (popupImageIndex === 0) return; // 🚫 stop at first image

    const newIndex = popupImageIndex - 1;
    setPopupImageIndex(newIndex);
    setImagePopup((prev) => ({
      ...prev,
      image: productImages[newIndex]?.url || product?.pImage?.[0] || "",
    }));
  };

  const handlePopupNext = (e) => {
    e.stopPropagation();
    if (!productImages || productImages.length === 0) return;

    if (popupImageIndex === productImages.length - 1) return; // 🚫 stop at last image

    const newIndex = popupImageIndex + 1;
    setPopupImageIndex(newIndex);
    setImagePopup((prev) => ({
      ...prev,
      image: productImages[newIndex]?.url || product?.pImage?.[0] || "",
    }));
  };



  const trustBadges = [
    { title: "Secure Checkout", desc: "100% Safe Payments", icon: <Security /> },
    { title: "100% Authentic", desc: "Silk Mark Certified", icon: <Award /> },
    { title: "24/7 Support", desc: "Dedicated Team", icon: <Truck /> },
  ];

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [showSticky, setShowSticky] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      // Hide sticky bar only when reaching the absolute bottom of the page (near the copyright bar)
      // This ensures actions are visible through the entire footer content area as requested
      const distanceToBottom = scrollHeight - (scrollTop + windowHeight);
      
      if (distanceToBottom < 50) {
        setShowSticky(false);
      } else {
        setShowSticky(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchRelatedProducts = async (productId) => {
    try {
      setLoadingRelated(true);
      const response = await productApi.getRelatedProducts(productId);
      if (response.success && response.relatedProducts?.length > 0) {
        setRelatedProducts(response.relatedProducts);
      } else {
        // Fallback: Fetch any products from the same category or just all products
        const allRes = await productApi.getAllProducts(1, 10);
        if (allRes.success) {
          // Filter out current product
          const filtered = (allRes.products || []).filter(p => p._id !== productId);
          setRelatedProducts(filtered.slice(0, 4));
        }
      }
    } catch (error) {
      console.error("Error fetching related products:", error);
    } finally {
      setLoadingRelated(false);
    }
  };

  const fetchGroupedProducts = async () => {
    try {
      setLoadingGrouped(true);
      const response = await productApi.getProductsGroupedByName();

      if (response.success && response.data) {
        const currentProductName = product?.pName;
        const currentProductId = product?._id?.toString();
        const allGroupedProducts = [];
        const seenProductIds = new Set();
        let matchedGroup = null;

        // Process all groups to extract unique products
        response.data.forEach((group) => {
          // Only consider groups for this product name (if available)
          if (currentProductName && group.pName !== currentProductName) {
            return;
          }

          // Store the matched group for color data - only if it has real color values
          if (!matchedGroup && group.color && Array.isArray(group.color)) {
            // Filter out null, empty, and invalid color values
            const validColors = group.color.filter(c => 
              c && c !== 'null' && c !== 'undefined' && c.trim() !== ''
            );
            if (validColors.length > 0) {
              matchedGroup = { ...group, color: validColors };
            }
          }

          // If API provides totalProducts, only show when there's more than 1 option
          if (
            typeof group.totalProducts === "number" &&
            group.totalProducts <= 1
          ) {
            return;
          }

          if (
            group.variants &&
            Array.isArray(group.variants) &&
            group.variants.length > 0
          ) {
            // Extract unique products from variants
            group.variants.forEach((variant) => {
              // Handle both object and string productId
              const productId =
                variant.productId?._id ||
                variant.productId ||
                variant.productId?._id?.toString();

              if (productId) {
                const productIdStr = productId.toString();

                // Skip current product and duplicates
                if (currentProductId && productIdStr === currentProductId) {
                  return;
                }

                if (!seenProductIds.has(productIdStr)) {
                  seenProductIds.add(productIdStr);

                  // Find the index of this productId within the grouped productIds (if provided by API)
                  let productImage = null;
                  if (
                    Array.isArray(group.productIds) &&
                    Array.isArray(group.productImages)
                  ) {
                    const idx = group.productIds.findIndex((pid) =>
                      pid?.toString
                        ? pid.toString() === productIdStr
                        : String(pid) === productIdStr
                    );

                    if (
                      idx >= 0 &&
                      Array.isArray(group.productImages[idx]) &&
                      group.productImages[idx].length > 0
                    ) {
                      // Take the first image of the matched product
                      productImage = group.productImages[idx][0];
                    }
                  }

                  // Fallback: use the full nested pImage array if mapping not available
                  if (!productImage) {
                    const groupPImage =
                      group.product && group.product.pImage
                        ? group.product.pImage
                        : null;
                    if (Array.isArray(groupPImage) && groupPImage.length > 0) {
                      const first = groupPImage[0];
                      productImage = Array.isArray(first) && first.length > 0 ? first[0] : first;
                    } else {
                      productImage = groupPImage;
                    }
                  }

                  allGroupedProducts.push({
                    _id: productId,
                    pName: group.pName,
                    pImage: productImage,
                    pPrice: variant.price || 0,
                    pPreviousPrice: variant.previousPrice || 0,
                    pOffer: variant.offer || 0,
                    pStock: variant.stock || 0,
                    pRating: 0,
                    pRatingsReviews: [],
                  });
                }
              }
            });
          }
        });

        // Build color-to-product map - ONLY for groups matching current product name
        const colorMap = {};
        
        // Scan variants in matching groups for colors
        response.data.forEach(group => {
          // Only map colors for groups with the same product name
          if (currentProductName && group.pName !== currentProductName) {
            return;
          }
          if (group.variants) {
            group.variants.forEach(v => {
              const c = (v.attributes?.color || v.color);
              const pid = v.productId?._id || v.productId;
              // Validate that color is a real, meaningful value
              if (c && pid && c !== 'null' && c !== 'undefined' && c.trim() !== '') {
                colorMap[c.toLowerCase()] = pid;
                // Store the product name for this color to validate navigation
                colorMap[`__name__${c.toLowerCase()}`] = group.pName;
              }
            });
          }
        });

        setColorToProductMap(colorMap);
        setGroupedProducts(allGroupedProducts);
        setGroupedProductData(matchedGroup);
      }
    } catch (error) {
      console.error("Error fetching grouped products:", error);
      enqueueSnackbar("Failed to fetch grouped products", { variant: "error" });
    } finally {
      setLoadingGrouped(false);
    }
  };

  const fetchProductVariants = async (productId) => {
    try {
      setLoadingVariants(true);
      let allVariants = [];

      // Try to fetch variants from API
      try {
        const response = await productApi.getProductVariants(productId);

        if (response.success && response.variants) {
          allVariants = response.variants;
        }
      } catch (apiError) {
        console.log("API variant fetch failed, trying product object");
      }

      // Fallback: Check if variants are in the product object
      if (allVariants.length === 0 && product?.variants && Array.isArray(product.variants)) {
        allVariants = product.variants;
      }

      // Filter only active variants
      const activeVariants = allVariants.filter(
        (v) => String(v?.status).toLowerCase() === "active"
      );

      // Sort active variants in ascending order for display
      const sortVariantsAscending = (variantList = []) => {
        const getSortKey = (v) => {
          const attrs = v?.attributes || {};
          const size = (attrs.size || v.size || "").toString();
          const color = (attrs.color || v.color || "").toString();
          const weight = (attrs.weight || v.weight || "").toString();
          return `${size}||${color}||${weight}`;
        };

        return [...variantList].sort((a, b) => {
          const keyA = getSortKey(a).toLowerCase();
          const keyB = getSortKey(b).toLowerCase();
          if (keyA < keyB) return -1;
          if (keyA > keyB) return 1;
          return 0;
        });
      };

      const sortedActiveVariants = sortVariantsAscending(activeVariants);
      setVariants(sortedActiveVariants);

      // Initialize selectedColor only if variants have meaningful color values
      const variantColors = [...new Set(
        sortedActiveVariants
          .map(v => v.attributes?.color || v.color)
          .filter(c => c && c !== 'null' && c !== 'undefined' && String(c).trim() !== '')
      )];
      // Only set color if there are multiple valid colors to choose from
      if (variantColors.length > 1 && !selectedColor) {
        setSelectedColor(variantColors[0]);
      }

      // Set the first ACTIVE variant as selected by default if available
      if (sortedActiveVariants.length > 0) {
        // Prefer default variant if exists
        const defaultVariant =
          sortedActiveVariants.find((v) => v.isDefault) || sortedActiveVariants[0];
        setSelectedVariant(defaultVariant);
        setQuantity(defaultVariant.min || 1);
      } else {
        setSelectedVariant(null);
        setQuantity(1);
      }
    } catch (error) {
      console.error("Error fetching product variants:", error);
      enqueueSnackbar("Failed to fetch product variants", { variant: "error" });
    } finally {
      setLoadingVariants(false);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await productApi.getProductById(id);
        if (response.success) {
          const productData = response.product;
          setProduct(productData);
          // Fetch reviews after getting product details
          const reviewsResponse = await productApi.getReviews(id);
          if (reviewsResponse.success) {
            setReviews(reviewsResponse.reviews);
          }
          // Fetch related products
          await fetchRelatedProducts(productData._id);
          // Fetch product variants (will check product object as fallback)
          await fetchProductVariants(productData._id);
          await fetchAuthReviews(productData._id);
          // Note: fetchGroupedProducts is called in useEffect when product is set
        } else {
          setError("Product not found");
          enqueueSnackbar("Product not found", { variant: "error" });
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to load product details");
        enqueueSnackbar(err.message || "Failed to load product details", {
          variant: "error",
        });
      }
      finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, enqueueSnackbar]);

  useEffect(() => {
    if (product?.variants && Array.isArray(product.variants) && variants.length === 0) {
      const activeVariants = product.variants.filter(
        (v) => String(v?.status).toLowerCase() === "active"
      );
      if (activeVariants.length > 0) {
        setVariants(activeVariants);
        const defaultVariant = activeVariants.find((v) => v.isDefault) || activeVariants[0];
        setSelectedVariant(defaultVariant);
        setQuantity(defaultVariant.min || 1);
        
        // Only set color if variants have multiple valid color values
        const validColors = [...new Set(
          activeVariants
            .map(v => v.attributes?.color || v.color)
            .filter(c => c && c !== 'null' && c !== 'undefined' && String(c).trim() !== '')
        )];
        if (validColors.length > 1) {
          setSelectedColor(validColors[0]);
        }
      }
    }
  }, [product]);

  useEffect(() => {
    if (product?._id) {
      fetchGroupedProducts();
    }
  }, [product?._id, product?.pName]);

  const addToCart = async (e, relatedProduct = null) => {
    e.preventDefault();

    // Use relatedProduct if provided, otherwise use current product
    const targetProduct = relatedProduct || product;
    if (!targetProduct) return;

    // For related products, use quantity 1 and try to find their default variant
    let targetQuantity = relatedProduct ? 1 : quantity;
    let targetVariant = relatedProduct ? null : selectedVariant;

    // If it's a related product with variants, pick its default or first active variant
    if (relatedProduct && relatedProduct.variants && Array.isArray(relatedProduct.variants)) {
      const activeVariants = relatedProduct.variants.filter(
        v => String(v?.status).toLowerCase() === "active"
      );
      if (activeVariants.length > 0) {
        targetVariant = activeVariants.find(v => v.isDefault) || activeVariants[0];
        targetQuantity = targetVariant.min || 1;
      }
    }

    // Check if this exact product/variant combination is already in cart
    const variantIdToCheck = targetVariant?._id || null;
    const isInCart = isProductInCart(targetProduct._id, variantIdToCheck);

    if (isInCart) {
      // Find the existing cart item to check its quantity
      const existingItem = cartItems.find((item) => {
        if (!item || !item.product) return false;
        if (variantIdToCheck) {
          return item.product._id === targetProduct._id &&
            item.variantId &&
            String(item.variantId) === String(variantIdToCheck);
        }
        return item.product._id === targetProduct._id && !item.variantId;
      });

      if (existingItem) {
        const currentQuantity = existingItem.quantity || 0;
        const availableStock = targetVariant
          ? (targetVariant.stock || 0)
          : (targetProduct.pStock || 0);

        if (currentQuantity >= availableStock) {
          enqueueSnackbar("Maximum stock limit reached for this variant", {
            variant: "warning",
          });
          return;
        }

        // If already in cart and not at max stock, suggest updating quantity instead
        enqueueSnackbar("Product variant is already in cart. Update quantity from cart page.", {
          variant: "info",
        });
        return;
      }
    }

    // Validate stock before making API call
    if (targetVariant) {
      const variantStock = targetVariant.stock || 0;
      if (variantStock < targetQuantity) {
        enqueueSnackbar("Not enough stock available for selected variant", {
          variant: "error",
        });
        return;
      }

      // Check if adding this quantity would exceed stock
      if (isInCart) {
        const existingItem = cartItems.find((item) => {
          if (!item || !item.product) return false;
          return item.product._id === targetProduct._id &&
            item.variantId &&
            String(item.variantId) === String(targetVariant._id);
        });

        if (existingItem) {
          const currentQuantity = existingItem.quantity || 0;
          if (currentQuantity + targetQuantity > variantStock) {
            enqueueSnackbar(`Only ${variantStock - currentQuantity} more items available for this variant`, {
              variant: "warning",
            });
            return;
          }
        }
      }
    } else {
      const productStock = targetProduct.pStock || 0;
      if (productStock < targetQuantity) {
        enqueueSnackbar("Not enough stock available", {
          variant: "error",
        });
        return;
      }

      // Check if adding this quantity would exceed stock
      if (isInCart) {
        const existingItem = cartItems.find((item) => {
          if (!item || !item.product) return false;
          return item.product._id === targetProduct._id && !item.variantId;
        });

        if (existingItem) {
          const currentQuantity = existingItem.quantity || 0;
          if (currentQuantity + targetQuantity > productStock) {
            enqueueSnackbar(`Only ${productStock - currentQuantity} more items available`, {
              variant: "warning",
            });
            return;
          }
        }
      }
    }

    try {
      setAddingToCart(true);
      const cartData = {
        productId: targetProduct._id,
        quantity: targetQuantity,
        variantId: targetVariant?._id,
        variantType: targetVariant?.attributes?.size
          ? "size"
          : targetVariant?.attributes?.color
            ? "color"
            : targetVariant?.attributes?.weight
              ? "weight"
              : targetVariant?.type || "size",
        variantValue:
          targetVariant?.attributes?.size ||
          targetVariant?.attributes?.color ||
          targetVariant?.attributes?.weight ||
          targetVariant?.size ||
          targetVariant?.color ||
          targetVariant?.weight ||
          "",
        variantAttributes: {
          ...targetVariant,
          size:
            targetVariant?.attributes?.size !== undefined
              ? targetVariant.attributes.size
              : targetVariant?.size,
          color:
            targetVariant?.attributes?.color !== undefined
              ? targetVariant.attributes.color
              : targetVariant?.color,
          weight:
            targetVariant?.attributes?.weight !== undefined
              ? targetVariant.attributes.weight
              : targetVariant?.weight,
        },
        price: targetVariant ? targetVariant.price : targetProduct.pPrice,
      };

      const response = await cartApi.addToCart(cartData);

      if (response.success) {
        // Update cart items state
        if (response.cart?.items) {
          setCartItems(response.cart.items);
        }

        // Visible in-page success message (in addition to snackbar)
        setCartSuccessMessage("Product added to cart successfully");
        setCartSuccessOpen(true);
        setShowCelebration(true);

        if (cartSuccessTimerRef.current) {
          clearTimeout(cartSuccessTimerRef.current);
        }
        cartSuccessTimerRef.current = setTimeout(() => {
          setCartSuccessOpen(false);
          setShowCelebration(false);
        }, 2600);

        enqueueSnackbar("Product added to cart successfully", {
          variant: "success",
        });

        // Update cart count in header
        if (response.cart?.items) {
          const totalItems = response.cart.items.reduce(
            (sum, item) => sum + item.quantity,
            0
          );
          window.dispatchEvent(
            new CustomEvent("cartUpdated", {
              detail: { count: totalItems },
            })
          );
        }
      }
      return true;
    } catch (error) {
      console.error("Error adding to cart:", error);
      if (error.message === "Unauthorized access. Please login.") {
        enqueueSnackbar("Please login to add items to cart", {
          variant: "warning",
        });
        window.dispatchEvent(new Event("openLogin"));
      } else {
        enqueueSnackbar(error.message || "Failed to add product to cart", {
          variant: "error",
        });
      }
      return false;
    } finally {
      setAddingToCart(false);
      // Dispatch cart update event for Navbar
      window.dispatchEvent(new CustomEvent("cartUpdated"));
    }
  };

  const handleBuyNow = async () => {
    try {
      // First try to add to cart and wait for it
      const success = await addToCart({ preventDefault: () => { } });
      if (!success) return; 

      // Build the cart item in the exact shape CheckoutPage expects
      const currentPrice = selectedVariant ? selectedVariant.price : product.pPrice;
      const previousPrice = selectedVariant ? (selectedVariant.previousPrice || 0) : (product.pPreviousPrice || 0);
      const offer = selectedVariant ? (selectedVariant.offer || 0) : (product.pOffer || 0);
      const stock = selectedVariant ? (selectedVariant.stock || 0) : (product.pStock || 0);

      // Determine variant type and value
      let variantType = "";
      let variantValue = "";
      if (selectedVariant) {
        if (selectedVariant.attributes?.size || selectedVariant.size) {
          variantType = "size";
          variantValue = selectedVariant.attributes?.size || selectedVariant.size;
        } else if (selectedVariant.attributes?.color || selectedVariant.color) {
          variantType = "color";
          variantValue = selectedVariant.attributes?.color || selectedVariant.color;
        } else if (selectedVariant.attributes?.weight || selectedVariant.weight) {
          variantType = "weight";
          variantValue = selectedVariant.attributes?.weight || selectedVariant.weight;
        }
      }

      const cartItem = {
        // Product object nested exactly as CheckoutPage expects
        product: {
          _id: product._id,
          pName: product.pName,
          pPrice: currentPrice,
          pPreviousPrice: previousPrice,
          pOffer: offer,
          pImage: product.pImage,
          pStock: stock,
          pBrand: product.pBrand || "",
          pQuantity: product.pQuantity,
          pDescription: product.pDescription,
          pType: product.pType || "product",
          freeshipping: product.freeshipping || false,
          pis_voucher_50: product.pis_voucher_50 || false,
          pis_voucher_100: product.pis_voucher_100 || false,
          // Include variants array so CheckoutPage can find variant details
          variants: selectedVariant ? [{
            _id: selectedVariant._id,
            price: selectedVariant.price,
            previousPrice: selectedVariant.previousPrice || 0,
            offer: selectedVariant.offer || 0,
            stock: selectedVariant.stock || 0,
            attributes: selectedVariant.attributes || {},
          }] : [],
        },
        quantity,
        price: currentPrice,
        variantId: selectedVariant?._id || null,
        variantType: variantType,
        variantValue: variantValue,
      };

      // Navigate to checkout with properly structured data
      navigate("/CheckoutPage", {
        state: {
          cart: [cartItem],
          totalAmount: currentPrice * quantity,
          isFromCart: false,
        },
      });
    } catch (error) {
      // Error handling is done in addToCart
      console.error("Error in buy now:", error);
    }
  };
  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!userRating) {
      enqueueSnackbar("Please select a rating", { variant: "warning" });
      return;
    }

    if (!userReview.trim()) {
      enqueueSnackbar("Please write a review", { variant: "warning" });
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await productApi.addReview(
        id,
        userRating,
        userReview.trim()
      );

      if (response.success) {
        enqueueSnackbar("Review submitted successfully", {
          variant: "success",
        });
        setUserRating(0);
        setUserReview("");
        await fetchReviews();
        await fetchAuthReviews(id);
      }
    } catch (error) {
      enqueueSnackbar(error.message || "Failed to submit review", {
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleStarClick = (selectedRating) => {
    setUserRating(selectedRating);
  };
  const fetchAuthReviews = async (id) => {
    try {
      const response = await productApi.getAuthReviews(id);
      if (response.success) {
        setcanreview(response.canreview);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      enqueueSnackbar(error.message || "Failed to fetch reviews", {
        variant: "error",
      });
    }
  };
  const fetchReviews = async () => {
    try {
      const response = await productApi.getReviews(id);
      if (response.success) {
        setReviews(response.reviews);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      enqueueSnackbar(error.message || "Failed to fetch reviews", {
        variant: "error",
      });
    }
  };
  const renderStars = (rating, isClickable = false) => {

    return (
      <Rating
        value={Number(rating)}
        precision={0.5}
        readOnly={!isClickable}
        onChange={(event, newValue) => {
          if (isClickable) {
            handleStarClick(newValue);
          }
        }}
        size="medium"
        sx={{
          color: "#C5A15A",
          "& .MuiRating-iconFilled": {
            color: "#C5A15A",
          },
          "& .MuiRating-iconHover": {
            marginTop: "4px",
            color: "#A88338",
          },
        }}
      />
    );
  };

  // Update the image URL construction
  const getImageUrl = (img) => {
    if (!img) return ""; // Return default image if no image provided

    // If it's a Cloudinary URL, remove any prefixes and return the clean URL
    if (img.includes("cloudinary.com")) {
      return img.split("/uploads/").pop();
    }

    // If it's already a full URL, return as is
    if (img.startsWith("http")) {
      return img;
    }

    // For local files, construct the full URL
    return `${import.meta.env.VITE_SERVER_URL || ""}/uploads/${img}`;
  };

  const productImages = (product?.pImage && product.pImage.length > 0)
    ? product.pImage.map((img, index) => ({
        id: index + 1,
        url: getImageUrl(img),
        alt: `${product.pName || "Product"} view ${index + 1}`,
      }))
    : [
        {
          id: 1,
          url: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80",
          alt: "Default product image",
        },
      ];

  const handleThumbnailClick = (index) => {
    setSelectedImage(index);
  };

  const handleScrollThumbnails = (direction) => {
    const container = document.querySelector(".thumbnail-scroll-container");
    if (container) {
      const scrollAmount = 200; // Adjust scroll amount as needed
      const currentScroll = container.scrollLeft;

      if (direction === "left") {
        container.scrollTo({
          left: currentScroll - scrollAmount,
          behavior: "smooth",
        });
      } else {
        container.scrollTo({
          left: currentScroll + scrollAmount,
          behavior: "smooth",
        });
      }
    }
  };

  const checkScrollPosition = () => {
    const container = document.querySelector(".thumbnail-scroll-container");
    if (container) {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  // Add scroll event listener
  useEffect(() => {
    const container = document.querySelector(".thumbnail-scroll-container");
    if (container) {
      container.addEventListener("scroll", checkScrollPosition);
      // Initial check
      checkScrollPosition();

      return () => {
        container.removeEventListener("scroll", checkScrollPosition);
      };
    }
  }, [productImages]);

  // Add keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handleScrollThumbnails("left");
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleScrollThumbnails("right");
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleQuantityChange = (type) => {
    if (type === "decrease" && quantity > 1) {
      setQuantity(quantity - 1);
    } else if (type === "increase" && selectedVariant?.stock > quantity) {
      setQuantity(quantity + 1);
    }
  };

  // Cleanup success banner timer on unmount
  useEffect(() => {
    return () => {
      if (cartSuccessTimerRef.current) clearTimeout(cartSuccessTimerRef.current);
    };
  }, []);

  const isProductInCart = (productId, variantId = null) => {
    if (!cartItems || !Array.isArray(cartItems)) return false;

    return cartItems.some((item) => {
      if (!item || !item.product) return false;

      // If checking for a specific variant, match both product and variant
      if (variantId) {
        return item.product._id === productId &&
          item.variantId &&
          String(item.variantId) === String(variantId);
      }

      // Otherwise, just check if product is in cart (without variant)
      return item.product._id === productId && !item.variantId;
    });
  };

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const response = await cartApi.getCart();
        if (response.success) {
          setCartItems(response.cart?.items || []);
        }
      } catch (error) {
        console.error("Error fetching cart items:", error);
      }
    };

    fetchCartItems();
  }, []);

  // Add checkWishlistStatus function
  const checkWishlistStatus = async () => {
    try {
      const response = await getWishlist();
      if (response.success) {
        const isProductInWishlist = response.products.some(
          (item) => item._id === id
        );
        setIsInWishlist(isProductInWishlist);
      }
    } catch (error) {
      console.error("Error checking wishlist status:", error);
    }
  };

  // Add useEffect for wishlist status
  useEffect(() => {
    if (id) {
      checkWishlistStatus();
    }
  }, [id]);

  // Add handleWishlist function
  const handleWishlist = async () => {
    try {
      setLoadingWishlist(true);
      if (isInWishlist) {
        const response = await removeFromWishlist(id);
        if (response.success) {
          setIsInWishlist(false);
          enqueueSnackbar("Removed from wishlist", { variant: "success" });
          window.dispatchEvent(new CustomEvent("wishlistUpdated"));
        }
      } else {
        const response = await addToWishlist(id);
        if (response.success) {
          setIsInWishlist(true);
          enqueueSnackbar("Added to wishlist", { variant: "success" });
          window.dispatchEvent(new CustomEvent("wishlistUpdated"));
        }
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
      if (error.message === "Unauthorized access. Please login.") {
        enqueueSnackbar("Please login to manage wishlist", {
          variant: "warning",
        });
        window.dispatchEvent(new Event("openLogin"));
      } else {
        enqueueSnackbar(error.message || "Failed to update wishlist", {
          variant: "error",
        });
      }
    } finally {
      setLoadingWishlist(false);
    }
  };

  const handleViewMore = () => {
    setVisibleReviews((prev) => prev + reviewsPerPage);
  };

  const getAverageRating = () => {
    if (!reviews || reviews.length === 0) return 0;
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (totalRating / reviews.length).toFixed(1);
  };

  const truncateDescription = (text, maxLength = 200) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const getDescriptionText = () => {
    if (!product?.pDescription) return "";
    return isDescriptionExpanded
      ? product.pDescription
      : truncateDescription(product.pDescription);
  };
  if (loading) {
    return (
      <div className="loading-container">
        <ModernLoader
          showTiming={false}
          animationType="orbit"
          size={0.8}
          customMessage="Loading product details..."
          showProgress={true}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="error-container">
        <p>Product not found</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }


  return (
    <>
      {product && (
        <>
          <Helmet>
            {product.pCanonicalUrl && <link rel="canonical" href={product.pCanonicalUrl} />}
            {product.schemaMarkup && (
              <script type="application/ld+json">{JSON.stringify(JSON.parse(product.schemaMarkup))}</script>
            )}
          </Helmet>
          <Heading
            title={product.pMetaTitle || product.pName || "Product Detail"}
            description={product.pMetaDescription || product.pDescription?.substring(0, 160)}
            keywords={product.pMetaKeywords || `${product.pName}, ${product.pBrand}, ${product.pCategory}`}
            image={productImages[0]?.url}
          />
        </>
      )}

      <div className="sds-product-detail-page">
        {/* Breadcrumbs Navigation */}
        <div className="sds-breadcrumb-wrapper">
          <div className="sds-breadcrumb-container">
            <button onClick={() => navigate(-1)} className="sds-breadcrumb-back-btn" title="Go back">
              <ArrowLeft size={15} /> Back
            </button>
            <span className="sds-breadcrumb-sep">|</span>
            <Link to="/" className="sds-breadcrumb-link">Home</Link>
            <span className="sds-breadcrumb-sep">/</span>
            <Link to="/products" className="sds-breadcrumb-link">
              {typeof product?.pCategory === 'object' ? product?.pCategory?.cName : (product?.pCategory || "Silk Sarees")}
            </Link>
            {product?.pSubCategory && (
              <>
                <span className="sds-breadcrumb-sep">/</span>
                <span className="sds-breadcrumb-muted">{product.pSubCategory}</span>
              </>
            )}
            <span className="sds-breadcrumb-sep">/</span>
            <span className="sds-breadcrumb-active">{product?.pName}</span>
          </div>
        </div>

        {/* ── THE MAIN PRODUCT SECTION (ONE COHESIVE, PROPERLY ALIGNED SECTION) ── */}
        <section className="sds-product-showcase-section">
          <div className="sds-product-showcase-card">
            
            {/* Left Column: Amazon-Style Multi-Image Side Gallery */}
            <div className="sds-gallery-column">
              <div className="sds-gallery-main-row">
                {((productImages && productImages.length > 1) || product?.pVideo) && (
                  <div className="sds-thumbs-pillar">
                    {productImages.length > 5 && (
                      <button
                        className="sds-thumb-arrow-btn up"
                        onClick={(e) => {
                          e.stopPropagation();
                          const prev = selectedImage > 0 ? selectedImage - 1 : productImages.length - 1;
                          setSelectedImage(prev);
                          setIsVideoSelected(false);
                        }}
                        aria-label="Previous thumbnail"
                      >
                        <ChevronUp size={16} />
                      </button>
                    )}

                    <div className="sds-thumbs-scroll-track">
                      {productImages.map((image, index) => (
                        <div
                          key={index}
                          className={`sds-thumb-cell ${(!isVideoSelected && selectedImage === index) ? "active" : ""}`}
                          onMouseEnter={() => {
                            setIsVideoSelected(false);
                            setSelectedImage(index);
                          }}
                          onClick={() => {
                            setIsVideoSelected(false);
                            setSelectedImage(index);
                          }}
                        >
                          <img src={transformImageUrl(image.url)} alt={image.alt || `${product?.pName} view ${index + 1}`} />
                        </div>
                      ))}

                      {product?.pVideo && (
                        <div
                          className={`sds-thumb-cell sds-thumb-video ${isVideoSelected ? "active" : ""}`}
                          onMouseEnter={() => setIsVideoSelected(true)}
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsVideoSelected(true);
                          }}
                          title="Watch Product Video"
                        >
                          <Youtube size={22} color="#6D1734" />
                          <span className="sds-video-thumb-label">VIDEO</span>
                        </div>
                      )}
                    </div>

                    {productImages.length > 5 && (
                      <button
                        className="sds-thumb-arrow-btn down"
                        onClick={(e) => {
                          e.stopPropagation();
                          const next = selectedImage < productImages.length - 1 ? selectedImage + 1 : 0;
                          setSelectedImage(next);
                          setIsVideoSelected(false);
                        }}
                        aria-label="Next thumbnail"
                      >
                        <ChevronDown size={16} />
                      </button>
                    )}
                  </div>
                )}

                <div className={`sds-main-stage ${(!productImages || productImages.length <= 1) ? 'single-image' : ''}`}>
                  {isVideoSelected && product?.pVideo ? (
                    <video
                      controls
                      autoPlay
                      src={product.pVideo}
                      className="sds-main-stage-video"
                    />
                  ) : (
                    <div
                      className="sds-main-stage-img-wrapper"
                      onMouseEnter={() => setIsZooming(true)}
                      onMouseLeave={() => setIsZooming(false)}
                      onMouseMove={handleMouseMoveZoom}
                      onClick={() => handleImagepopup(selectedImage)}
                    >
                      <span className={`sds-zoom-pill ${isZooming ? "zooming" : ""}`}>
                        <Search size={12} /> {isZooming ? "Zoomed View · Click to Enlarge" : "Roll over image to zoom in"}
                      </span>
                      <img
                        src={transformImageUrl(productImages[selectedImage]?.url || product?.pImage?.[0])}
                        alt={product?.pName}
                        className="sds-main-stage-img"
                        style={{
                          transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                          transform: isZooming ? "scale(2.2)" : "scale(1)",
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Information & Purchase Console */}
            <div className="sds-info-column">
              {/* Brand & Collection Eyebrow */}
              <div className="sds-product-eyebrow">
                <span className="sds-brand-tag">{product?.pBrand || "Shri Deepaalaya Silks"}</span>
                {product?.pSubCategory && (
                  <span className="sds-collection-tag">{product.pSubCategory}</span>
                )}
              </div>

              {/* Product Title */}
              <h1 className="sds-product-title">{product?.pName}</h1>

              {/* Weight or Size Badge */}
              {(() => {
                const weight = selectedVariant?.attributes?.weight || selectedVariant?.weight || product?.pQuantity;
                const size = selectedVariant?.attributes?.size || selectedVariant?.size || product?.pSize;
                const unitValue = weight || size;
                const label = (selectedVariant?.attributes?.weight || selectedVariant?.weight || product?.pQuantity) ? "Weight" : "Size";
                if (unitValue) {
                  return (
                    <div className="sds-unit-badge">
                      <Scale size={14} className="sds-unit-icon" />
                      <span className="sds-unit-label">{label}:</span>
                      <span className="sds-unit-text">{unitValue}</span>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Rating & Review Summary */}
              <div className="sds-rating-summary">
                {renderStars(getAverageRating())}
                <span className="sds-rating-number">{getAverageRating()}</span>
                <span className="sds-reviews-count">({reviews.length} Verified Buyer Reviews)</span>
              </div>

              {/* Pricing Island */}
              <div className="sds-pricing-island">
                <div className="sds-price-row-main">
                  <span className="sds-price-current">
                    ₹{((selectedVariant ? selectedVariant.price : product.pPrice) * quantity).toLocaleString('en-IN')}
                  </span>
                  {(selectedVariant?.previousPrice || product.pPreviousPrice) > (selectedVariant?.price || product.pPrice) && (
                    <>
                      <span className="sds-price-original">
                        ₹{((selectedVariant ? selectedVariant.previousPrice : product.pPreviousPrice) * quantity).toLocaleString('en-IN')}
                      </span>
                      <span className="sds-price-save-badge">
                        {selectedVariant ? selectedVariant.offer : product.pOffer}% OFF
                      </span>
                    </>
                  )}
                </div>
                <div className="sds-tax-inclusive-tag">
                  Inclusive of all taxes · Silk Mark Authenticated
                </div>
                <div className="sds-delivery-status-tag">
                  <Truck size={15} />
                  <span>
                    {product.freeshipping
                      ? "Free Insured Delivery Across India"
                      : "Free Insured Delivery on orders above ₹500"}
                  </span>
                </div>
              </div>

              {/* Stock Status Badge */}
              <div className="sds-stock-badge-container">
                {Number(selectedVariant ? selectedVariant.stock : (product.pStock ?? product.pQuantity ?? 0)) > 0 ? (
                  <div className={`sds-stock-badge in-stock ${Number(selectedVariant ? selectedVariant.stock : (product.pStock ?? product.pQuantity ?? 0)) < 10 ? "low-stock" : ""}`}>
                    <Check size={14} />
                    <span>
                      {Number(selectedVariant ? selectedVariant.stock : (product.pStock ?? product.pQuantity ?? 0)) < 10
                        ? `Only ${selectedVariant ? selectedVariant.stock : (product.pStock ?? product.pQuantity ?? 0)} handloom weaves left in stock`
                        : "In Stock — Handloom Verified & Ready to Ship"}
                    </span>
                  </div>
                ) : (
                  <div className="sds-stock-badge out-of-stock">
                    <X size={14} />
                    <span>Currently Out of Stock</span>
                  </div>
                )}
              </div>

              {/* Color Selection - Only show when product has actual distinct color options */}
              {(() => {
                const variantColors = variants
                  .map(v => v.attributes?.color || v.color)
                  .filter(c => c && c !== 'null' && c !== 'undefined' && String(c).trim() !== '' && String(c).toLowerCase() !== 'standard');
                const groupColors = (groupedProductData?.color || [])
                  .filter(c => c && c !== 'null' && c !== 'undefined' && String(c).trim() !== '' && String(c).toLowerCase() !== 'standard');
                const pColors = (product.pColors || [])
                  .filter(c => c && c !== 'null' && c !== 'undefined' && String(c).trim() !== '' && String(c).toLowerCase() !== 'standard');
                
                const allColors = [...variantColors, ...groupColors, ...pColors];
                const rawUnique = [...new Set(allColors.map(c => String(c).trim().toLowerCase()))];
                const uniqueColors = rawUnique.map(c => {
                  return allColors.find(oc => String(oc).toLowerCase() === c) || c;
                });

                if (uniqueColors.length > 1) {
                  return (
                    <div className="sds-variant-section">
                      <div className="sds-variant-header">
                        <span className="sds-v-label">Select Color</span>
                        {selectedColor && (
                          <span className="sds-v-selected">Selected: {selectedColor}</span>
                        )}
                      </div>
                      <div className="sds-color-swatches-grid">
                        {uniqueColors.map((color, idx) => (
                          <div
                            key={idx}
                            className={`sds-color-swatch ${selectedColor?.toLowerCase() === color.toLowerCase() ? 'active' : ''}`}
                            onClick={() => handleColorChange(color)}
                            style={{ backgroundColor: color.toLowerCase() }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Variant / Size Options - Only show if there are >= 2 options or real distinct sizes */}
              {(() => {
                const hasMeaningfulVariants = variants.length > 1 || variants.some(v => {
                  const size = v.attributes?.size || v.size;
                  const weight = v.attributes?.weight || v.weight;
                  return (size && size !== 'Standard' && size !== 'Default') || (weight && weight !== 'Standard');
                });

                if (!hasMeaningfulVariants) return null;

                return (
                  <div className="sds-variant-section">
                    <div className="sds-variant-header">
                      <span className="sds-v-label">Select Option</span>
                      {selectedVariant && (
                        <span className="sds-v-selected">
                          {selectedVariant.attributes?.size || selectedVariant.attributes?.weight || selectedVariant.size || selectedVariant.weight || "Selected"}
                        </span>
                      )}
                    </div>
                    <div className="sds-bubbles-grid">
                      {variants.map((variant) => (
                        <div
                          key={variant._id}
                          className={`sds-v-bubble ${selectedVariant?._id === variant._id ? "active" : ""} ${Number(variant.stock) <= 0 ? "out-of-stock" : ""}`}
                          onClick={() => {
                            if (Number(variant.stock) > 0) {
                              setSelectedVariant(variant);
                              setQuantity(variant.min || 1);
                            }
                          }}
                        >
                          <span className="sds-v-bubble-name">
                            {variant.attributes?.size || variant.attributes?.weight || variant.size || variant.weight || "Option"}
                          </span>
                          <span className="sds-v-bubble-price">₹{variant.price?.toLocaleString('en-IN')}</span>
                          <span className="sds-v-bubble-stock">
                            {Number(variant.stock) <= 0 ? "Out of Stock" : `${variant.stock} in stock`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Action Console: Stepper, Wishlist, Share, Add To Cart, Buy Now */}
              <div className="sds-action-console">
                <div className="sds-action-row-upper">
                  <div className="sds-qty-stepper">
                    <button
                      onClick={() => handleQuantityChange("decrease")}
                      disabled={quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="sds-qty-val">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange("increase")}
                      disabled={quantity >= (selectedVariant?.stock || product.pStock)}
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <div className="sds-utility-buttons">
                    <button
                      className={`sds-detail-wishlist-btn ${isInWishlist ? "active" : ""}`}
                      onClick={handleWishlist}
                      title={isInWishlist ? "Remove from Wishlist" : "Save to Wishlist"}
                    >
                      <Heart size={16} fill={isInWishlist ? "#6D1734" : "none"} stroke={isInWishlist ? "#6D1734" : "currentColor"} />
                      <span>{isInWishlist ? "Saved" : "Wishlist"}</span>
                    </button>
                    <button
                      className="sds-share-btn"
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: product?.pName,
                            text: product?.pDescription,
                            url: window.location.href,
                          }).catch(console.error);
                        } else {
                          enqueueSnackbar("Link copied to clipboard", { variant: "info" });
                          navigator.clipboard.writeText(window.location.href);
                        }
                      }}
                      title="Share Product"
                    >
                      <Share2 size={16} />
                      <span>Share</span>
                    </button>
                  </div>
                </div>

                <div className="sds-action-row-lower">
                  <button
                    className={`sds-btn-add-cart ${addingToCart ? "loading" : ""} ${(cartSuccessOpen || isProductInCart(product._id, selectedVariant?._id)) ? "added" : ""} ${(selectedVariant ? selectedVariant.stock : product.pStock) <= 0 ? "out-of-stock" : ""}`}
                    onClick={(e) => {
                      if (isProductInCart(product._id, selectedVariant?._id)) {
                        navigate('/cart');
                      } else {
                        addToCart(e);
                      }
                    }}
                    disabled={addingToCart || ((selectedVariant ? selectedVariant.stock : product.pStock) <= 0 && !isProductInCart(product._id, selectedVariant?._id))}
                  >
                    <ShoppingCart size={17} />
                    <span>
                      {addingToCart ? "Adding..." : (isProductInCart(product._id, selectedVariant?._id) ? "GO TO CART" : "ADD TO CART")}
                    </span>
                  </button>

                  <button
                    className="sds-btn-buy-now"
                    onClick={handleBuyNow}
                    disabled={addingToCart || (selectedVariant ? selectedVariant.stock : product.pStock) <= 0}
                  >
                    BUY NOW
                  </button>
                </div>
              </div>

              {/* Integrated Trust Strip in Console */}
              <div className="sds-trust-strip">
                <div className="sds-trust-item">
                  <Award size={20} className="sds-trust-icon" />
                  <div className="sds-trust-text">
                    <strong>100% Tested Pure Silk</strong>
                    <span>Authentic Silk Mark</span>
                  </div>
                </div>
                <div className="sds-trust-item">
                  <Security size={20} className="sds-trust-icon" />
                  <div className="sds-trust-text">
                    <strong>Sacred Bridal Purity</strong>
                    <span>Pristine Untouched Weave</span>
                  </div>
                </div>
                <div className="sds-trust-item">
                  <RefreshCw size={20} className="sds-trust-icon" />
                  <div className="sds-trust-text">
                    <strong>7-Day Transit Exchange</strong>
                    <span>Insured Damage Cover</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── FULL-WIDTH PRODUCT DETAILS & TABS SECTION ── */}
        <section className="sds-product-tabs-section">
          <div className="sds-tabs-card">
            <div className="sds-tab-nav">
              <button
                className={`sds-tab-nav-btn ${activeTab === "description" ? "active" : ""}`}
                onClick={() => setActiveTab("description")}
              >
                Description & Heritage
              </button>
              <button
                className={`sds-tab-nav-btn ${activeTab === "specs" ? "active" : ""}`}
                onClick={() => setActiveTab("specs")}
              >
                Fabric & Specifications
              </button>
              <button
                className={`sds-tab-nav-btn ${activeTab === "purity" ? "active" : ""}`}
                onClick={() => setActiveTab("purity")}
              >
                Purity & Sacred Promise
              </button>
              <button
                className={`sds-tab-nav-btn ${activeTab === "reviews" ? "active" : ""}`}
                onClick={() => setActiveTab("reviews")}
              >
                Reviews ({reviews.length})
              </button>
            </div>

            <div className="sds-tab-pane">
              {/* Tab 1: Description */}
              {activeTab === "description" && (
                <div className="sds-description-wrap">
                  <p className={`sds-desc-text ${!isDescriptionExpanded ? 'clamped' : ''}`}>
                    {product.pDescription || "Handcrafted on traditional South Indian handlooms with generational artisan mastery. Each weave celebrates timeless motifs, certified zari purity, and royal silk drape."}
                  </p>
                  {product.pDescription && product.pDescription.length > 250 && (
                    <button
                      className="sds-desc-read-more-btn"
                      onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                    >
                      {isDescriptionExpanded ? 'Read Less' : 'Read Full Description'}
                    </button>
                  )}
                </div>
              )}

              {/* Tab 2: Specs Grid */}
              {activeTab === "specs" && (
                <div className="sds-specs-table">
                  <div className="sds-spec-row">
                    <span className="sds-spec-name">Brand</span>
                    <span className="sds-spec-val">{product.pBrand || "Shri Deepaalaya Silks"}</span>
                  </div>
                  <div className="sds-spec-row">
                    <span className="sds-spec-name">Category</span>
                    <span className="sds-spec-val">
                      {typeof product.pCategory === 'object' ? product.pCategory?.cName : (product.pCategory || "Silk Sarees")}
                    </span>
                  </div>
                  {product.pSubCategory && (
                    <div className="sds-spec-row">
                      <span className="sds-spec-name">Collection / Type</span>
                      <span className="sds-spec-val">{product.pSubCategory}</span>
                    </div>
                  )}
                  <div className="sds-spec-row">
                    <span className="sds-spec-name">Fabric / Material</span>
                    <span className="sds-spec-val">{product.fabric || product.material || "100% Pure Mulberry Silk"}</span>
                  </div>
                  <div className="sds-spec-row">
                    <span className="sds-spec-name">Weave Technique</span>
                    <span className="sds-spec-val">{product.weave || product.work || "Traditional Korvai Handloom Weave"}</span>
                  </div>
                  <div className="sds-spec-row">
                    <span className="sds-spec-name">Zari / Finish</span>
                    <span className="sds-spec-val">{product.zari || product.finish || "Pure Tested Silver & Gold Dipped Zari"}</span>
                  </div>
                  <div className="sds-spec-row">
                    <span className="sds-spec-name">Blouse Piece</span>
                    <span className="sds-spec-val">{product.blousePiece || "Included (Matching unstitched blouse piece)"}</span>
                  </div>
                  <div className="sds-spec-row">
                    <span className="sds-spec-name">Saree Length</span>
                    <span className="sds-spec-val">{product.length || "6.2 Meters (including blouse piece)"}</span>
                  </div>
                  <div className="sds-spec-row">
                    <span className="sds-spec-name">Occasion</span>
                    <span className="sds-spec-val">{product.occasion || "Muhurtham, Bridal, Temple Festivals, Special Celebrations"}</span>
                  </div>
                  <div className="sds-spec-row">
                    <span className="sds-spec-name">Care Instructions</span>
                    <span className="sds-spec-val">{product.careInstructions || "Dry Clean Only. Preserve in pure cotton/muslin wrap."}</span>
                  </div>
                  <div className="sds-spec-row">
                    <span className="sds-spec-name">Authenticity</span>
                    <span className="sds-spec-val">Certified Handcrafted Artisan Quality</span>
                  </div>
                </div>
              )}

              {/* Tab 3: Purity & Sacred Promise */}
              {activeTab === "purity" && (
                <div className="sds-purity-promise-wrap">
                  <div className="sds-purity-callout">
                    <h4>The Sacred Bridal Muhurtham Promise</h4>
                    <p>
                      A bride’s wedding saree is a sacred heirloom of beauty and blessing. To preserve untouched purity and pristine hygiene, all sarees are steamed, inspected, and sealed in breathable heirloom covers.
                    </p>
                  </div>
                  <div className="sds-purity-callout" style={{ borderLeftColor: "#6D1734" }}>
                    <h4>Controlled 7-Day Transit Damage Exchange</h4>
                    <p>
                      Because our creations are delicate handloom masterpieces, we maintain a strict <strong>No-Return Policy</strong> to guarantee you never receive a pre-worn garment. Verified transit damages or manufacturing defects are fully covered under our dedicated 7-day exchange program.
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 4: Reviews */}
              {activeTab === "reviews" && (
                <div className="sds-reviews-wrap">
                  <div className="sds-reviews-header-bar">
                    <h4 style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontSize: '18px' }}>
                      Customer Feedback ({reviews.length})
                    </h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {renderStars(getAverageRating())}
                      <strong style={{ fontSize: '14px' }}>{getAverageRating()} out of 5</strong>
                    </div>
                  </div>

                  {reviews.length > 0 ? (
                    <div className="sds-reviews-list">
                      {reviews.map((r, i) => (
                        <div key={i} className="sds-review-card">
                          <div className="sds-review-card-top">
                            <span className="sds-review-user">{r.name || r.user?.name || "Verified Customer"}</span>
                            <div>{renderStars(r.rating)}</div>
                          </div>
                          <p className="sds-review-text">{r.review || r.comment}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: "#7d726b", fontStyle: "italic", margin: "16px 0" }}>
                      No reviews yet for this handloom creation. Be the first to share your experience!
                    </p>
                  )}

                  {/* Add Review Form if eligible */}
                  {canreview && (
                    <form onSubmit={handleSubmitReview} style={{ marginTop: 24, padding: 20, background: '#faf8f5', borderRadius: 8, border: '1px solid #ebd9c4' }}>
                      <h5 style={{ margin: '0 0 12px', color: '#6D1734', fontWeight: 700 }}>Write a Review</h5>
                      <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>Your Rating:</span>
                        <Rating
                          value={userRating}
                          onChange={(e, val) => setUserRating(val)}
                        />
                      </div>
                      <textarea
                        rows={3}
                        value={userReview}
                        onChange={(e) => setUserReview(e.target.value)}
                        placeholder="Share your feedback on the silk texture, zari sheen, and drape..."
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #ebd9c4', fontFamily: 'inherit', fontSize: 14 }}
                      />
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        style={{ marginTop: 10, padding: '10px 24px', background: '#6D1734', color: '#ffffff', border: 'none', borderRadius: 4, fontWeight: 700, cursor: 'pointer' }}
                      >
                        {isSubmitting ? "Submitting..." : "Submit Review"}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── FREQUENTLY BOUGHT TOGETHER / RECOMMENDATIONS ── */}
        {relatedProducts.length > 0 && (
          <section className="sds-related-section">
            <ProductRecommendations
              products={relatedProducts}
              title="Frequently Bought Together"
              onAddToCart={addToCart}
            />
          </section>
        )}

        {/* ── MOBILE STICKY BOTTOM BAR ── */}
        {isMobile && (
          <div className={`mobile-sticky-actions ${!showSticky ? 'hidden' : ''}`}>
            <div className={`mobile-action-pill-btn ${isInWishlist ? "active" : ""}`} onClick={handleWishlist}>
              <Heart size={20} fill={isInWishlist ? "#6D1734" : "none"} stroke={isInWishlist ? "#6D1734" : "currentColor"} />
            </div>
            <div className="mobile-action-pill-btn" onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: product?.pName,
                  text: product?.pDescription,
                  url: window.location.href,
                }).catch(console.error);
              } else {
                navigator.clipboard.writeText(window.location.href);
              }
            }}>
              <Share2 size={20} />
            </div>
            <button
              className={`sds-btn-add-cart ${addingToCart ? "loading" : ""} ${(cartSuccessOpen || isProductInCart(product._id, selectedVariant?._id)) ? "added" : ""} ${(selectedVariant ? selectedVariant.stock : product.pStock) <= 0 ? "out-of-stock" : ""}`}
              onClick={(e) => {
                if (isProductInCart(product._id, selectedVariant?._id)) {
                  navigate('/cart');
                } else {
                  addToCart(e);
                }
              }}
              disabled={addingToCart || ((selectedVariant ? selectedVariant.stock : product.pStock) <= 0 && !isProductInCart(product._id, selectedVariant?._id))}
              style={{ flex: 1 }}
            >
              {addingToCart ? "Adding..." : (isProductInCart(product._id, selectedVariant?._id) ? "GO TO CART" : "ADD TO CART")}
            </button>
            <button
              className="sds-btn-buy-now"
              onClick={handleBuyNow}
              disabled={addingToCart || (selectedVariant ? selectedVariant.stock : product.pStock) <= 0}
              style={{ flex: 1 }}
            >
              BUY NOW
            </button>
          </div>
        )}

        {/* ── HIGH-RESOLUTION LIGHTBOX MODAL ── */}
        {imagePopup.show && (
          <div className="sds-lightbox-overlay" onClick={closeImagePopup}>
            <div className="sds-lightbox-dialog" onClick={(e) => e.stopPropagation()}>
              <button className="sds-lightbox-close" onClick={closeImagePopup} aria-label="Close image popup">
                <X size={26} />
              </button>

              {productImages.length > 1 && (
                <button
                  className="sds-lightbox-nav prev"
                  onClick={handlePopupPrev}
                  disabled={popupImageIndex === 0}
                  aria-label="Previous image"
                >
                  <ChevronLeft size={28} />
                </button>
              )}

              <div className="sds-lightbox-stage">
                <img
                  src={transformImageUrl(productImages[popupImageIndex]?.url || imagePopup.image)}
                  alt={product?.pName}
                  className="sds-lightbox-img"
                />
                <div className="sds-lightbox-counter">
                  {popupImageIndex + 1} / {productImages.length || 1}
                </div>
              </div>

              {productImages.length > 1 && (
                <button
                  className="sds-lightbox-nav next"
                  onClick={handlePopupNext}
                  disabled={popupImageIndex === productImages.length - 1}
                  aria-label="Next image"
                >
                  <ChevronRight size={28} />
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </>
  );
};

export default ProductDetail;
