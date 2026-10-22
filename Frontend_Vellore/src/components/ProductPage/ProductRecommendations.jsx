import React from "react";
import { Sparkles } from "lucide-react";
import SdsProductCard from "../common/SdsProductCard";
import "./ProductRecommendations.css";

const ProductRecommendations = ({
  products,
  loading = false,
  title = "Frequently Bought Together",
  subtitle = "Handpicked complementary silk weaves and heirloom jewellery to complete your ensemble"
}) => {
  if (loading) {
    return (
      <div className="sds-recommendations-wrapper">
        <div className="sds-recommendations-header">
          <div className="sds-recommendations-eyebrow">
            <Sparkles size={13} />
            <span>Curated Pairings</span>
          </div>
          <h2 className="sds-recommendations-title">{title}</h2>
          <p className="sds-recommendations-subtitle">Discovering authentic pairings…</p>
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="sds-recommendations-wrapper">
      <div className="sds-recommendations-header">
        <div className="sds-recommendations-eyebrow">
          <Sparkles size={13} />
          <span>Curated Pairings</span>
        </div>
        <h2 className="sds-recommendations-title">{title}</h2>
        <p className="sds-recommendations-subtitle">{subtitle}</p>
      </div>

      <div className="sds-recommendations-grid">
        {products.map((product, idx) => (
          <SdsProductCard key={product._id || product.id || idx} product={product} />
        ))}
      </div>
    </div>
  );
};

export default ProductRecommendations;
