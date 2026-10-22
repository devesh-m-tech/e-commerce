import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { transformImageUrl } from '../../APi/utils';
import { addToWishlist, removeFromWishlist } from '../../APi/userApi';
import { cartApi } from '../../APi/cartApi';
import { useSnackbar } from 'notistack';
import './SdsProductCard.css';

const formatINR = (amount) => {
  if (!amount && amount !== 0) return '—';
  return '₹' + Number(amount).toLocaleString('en-IN');
};

const discountPct = (original, sale) => {
  if (!original || !sale || sale >= original) return null;
  return Math.round(((original - sale) / original) * 100);
};

const SdsProductCard = ({ product, isInitialWishlisted, onRemove }) => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const name     = product.pName  || product.name  || 'Product';
  const imgRaw   = Array.isArray(product.pImage) ? product.pImage[0] : (product.pImage || product.image);
  const img      = transformImageUrl(imgRaw);
  const price    = product.pPrice || product.price;
  const mrp      = product.pMrp   || product.pPreviousPrice || product.mrp;
  const inStock  = product.pStock !== 0 && product.stock !== 0;
  const discount = product.pOffer || discountPct(mrp, price);
  const id       = product._id;

  const [isWishlisted, setIsWishlisted] = useState(Boolean(isInitialWishlisted));
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('userWishlist') || '[]';
      const list = JSON.parse(raw);
      if (isInitialWishlisted !== undefined) {
        setIsWishlisted(Boolean(isInitialWishlisted));
      } else {
        setIsWishlisted(list.includes(id));
      }
    } catch (e) {}
  }, [id, isInitialWishlisted]);

  const handleWishlistToggle = async (e) => {
    e.stopPropagation();
    try {
      if (isWishlisted) {
        await removeFromWishlist(id);
        setIsWishlisted(false);
        enqueueSnackbar('Removed from wishlist', { variant: 'info' });
        if (onRemove) onRemove(id);
      } else {
        await addToWishlist(id);
        setIsWishlisted(true);
        enqueueSnackbar('Added to wishlist', { variant: 'success' });
      }
      window.dispatchEvent(new CustomEvent('wishlistUpdated'));
    } catch (err) {
      console.error('Wishlist error:', err);
    }
  };

  const handleQuickAdd = async (e) => {
    e.stopPropagation();
    try {
      setAddingToCart(true);
      await cartApi.addToCart({
        productId: id,
        quantity: 1,
        variantId: product.variants?.[0]?._id,
        price: price
      });
      enqueueSnackbar(`${name} added to cart!`, { variant: 'success' });
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (err) {
      console.error('Add to cart error:', err);
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <article
      className="sds-product-card"
      onClick={() => navigate(`/product/${id}`)}
      style={{ cursor: 'pointer' }}
      aria-label={`${name}, ${formatINR(price)}`}
    >
      <div className="sds-product-card-img-wrap">
        <img
          src={img}
          alt={name}
          className="sds-product-img"
          loading="lazy"
          width={400}
          height={533}
        />
        {discount ? (
          <div className="sds-product-badge-wrap">
            <span className="sds-badge">{discount}% OFF</span>
          </div>
        ) : null}

        <button
          type="button"
          className={`sds-card-wishlist-btn ${isWishlisted ? 'active' : ''}`}
          onClick={handleWishlistToggle}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            size={18}
            strokeWidth={2}
            className="sds-wishlist-icon"
            color={isWishlisted ? '#ffffff' : '#6D1734'}
            fill={isWishlisted ? '#ffffff' : 'none'}
          />
        </button>

        {!inStock && (
          <div className="sds-product-badge-wrap" style={{ top: 'auto', bottom: 10, left: 0, right: 0, alignItems: 'center' }}>
            <span className="sds-badge" style={{ background: 'rgba(40,35,33,0.7)' }}>Out of Stock</span>
          </div>
        )}

        <div className="sds-quick-add-overlay">
          <button
            className="sds-quick-add-btn"
            onClick={handleQuickAdd}
            disabled={addingToCart || !inStock}
          >
            <ShoppingBag size={14} style={{ marginRight: 6 }} />
            {addingToCart ? 'Adding...' : 'Add to Cart'}
          </button>
        </div>
      </div>

      <div className="sds-product-info">
        <h3 className="sds-product-name">{name}</h3>
        <div className="sds-product-price-row">
          <span className="sds-price">{formatINR(price)}</span>
          {mrp && mrp > price && (
            <span className="sds-price-original">{formatINR(mrp)}</span>
          )}
          {discount ? (
            <span className="sds-price-discount">{discount}% off</span>
          ) : null}
        </div>
      </div>
    </article>
  );
};

export default SdsProductCard;
