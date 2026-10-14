import React from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, MapPin, Package, CreditCard, Check } from "lucide-react";
import "./CheckoutProgressBar.css";

const STEPS = [
  { id: 1, key: "cart", label: "Bag", icon: ShoppingBag, path: "/cart" },
  { id: 2, key: "address", label: "Address", icon: MapPin },
  { id: 3, key: "summary", label: "Order Summary", icon: Package },
  { id: 4, key: "payment", label: "Payment", icon: CreditCard },
];

/**
 * CheckoutProgressBar — Quick Steps Bar for Cart & Checkout
 * @param {number} currentStep - 1: Bag, 2: Address, 3: Order Summary, 4: Payment
 * @param {function} onStepClick - Callback for clicking a completed step
 */
const CheckoutProgressBar = ({ currentStep = 1, onStepClick }) => {
  const navigate = useNavigate();

  const handleStepClick = (step) => {
    // Only allow clicking already completed steps
    if (step.id < currentStep) {
      if (step.id === 1) {
        navigate("/cart");
      } else if (onStepClick) {
        // In CheckoutPage: step 2 is Address (internal step 1), step 3 is Summary (internal step 2)
        onStepClick(step.id - 1);
      }
    }
  };

  const activeStepObj = STEPS.find((s) => s.id === currentStep) || STEPS[0];

  return (
    <div className="checkout-header-wrapper" role="region" aria-label="Checkout Progress">
      {/* Mobile Active Step Info */}
      <div className="mobile-step-info">
        Step {currentStep} of {STEPS.length}: <strong>{activeStepObj.label}</strong>
      </div>

      <div className="checkout-progress-bar">
        {STEPS.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;
          const isLast = index === STEPS.length - 1;
          const isClickable = isCompleted;
          const Icon = step.icon;

          return (
            <React.Fragment key={step.id}>
              <div
                className={`progress-step-column ${isActive ? "active" : ""} ${
                  isCompleted ? "completed" : ""
                } ${isClickable ? "clickable" : ""}`}
                onClick={() => handleStepClick(step)}
                onKeyDown={(e) => {
                  if (isClickable && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    handleStepClick(step);
                  }
                }}
                role={isClickable ? "button" : "group"}
                tabIndex={isClickable ? 0 : -1}
                aria-current={isActive ? "step" : undefined}
                aria-label={`${step.label} - ${
                  isCompleted ? "Completed" : isActive ? "Current step" : "Upcoming step"
                }`}
                title={isClickable ? `Go back to ${step.label}` : undefined}
              >
                <div
                  className={`step-circle ${isActive ? "active" : ""} ${
                    isCompleted ? "completed" : ""
                  }`}
                >
                  {isCompleted ? (
                    <Check size={14} strokeWidth={2.8} color="#fff" />
                  ) : (
                    <span className={`circle-icon ${isActive ? "active" : ""}`}>
                      <Icon size={14} />
                    </span>
                  )}
                </div>
                <span
                  className={`step-label ${isActive ? "active" : ""} ${
                    isCompleted ? "completed" : ""
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {!isLast && (
                <div className="progress-line-track" aria-hidden="true">
                  <div
                    className="progress-line-fill"
                    style={{ width: isCompleted ? "100%" : "0%" }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default CheckoutProgressBar;
