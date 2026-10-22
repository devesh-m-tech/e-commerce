import React, { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

export const CountUp = ({
  to,
  from = 0,
  direction = 'up',
  delay = 0,
  duration = 2,
  className = '',
  prefix = '',
  suffix = '',
  separator = ',',
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [value, setValue] = useState(from);

  // Extract numeric part from string if passed like "35+" or "10,000+"
  const numericTarget = typeof to === 'number' ? to : parseFloat(String(to).replace(/[^0-9.]/g, '')) || 0;
  const inferredSuffix = typeof to === 'string' && to.includes('+') ? '+' : (typeof to === 'string' && to.includes('%') ? '%' : suffix);

  useEffect(() => {
    if (!isInView) return;

    let startTime = null;
    let animationFrame = null;

    const timeout = setTimeout(() => {
      const step = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
        
        // Ease out expo curve
        const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const currentVal = Math.floor(from + (numericTarget - from) * easeProgress);
        
        setValue(currentVal);

        if (progress < 1) {
          animationFrame = requestAnimationFrame(step);
        } else {
          setValue(numericTarget);
        }
      };

      animationFrame = requestAnimationFrame(step);
    }, delay * 1000);

    return () => {
      clearTimeout(timeout);
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [isInView, from, numericTarget, duration, delay]);

  const formattedValue = value.toLocaleString('en-IN');

  return (
    <span ref={ref} className={className}>
      {prefix}{formattedValue}{inferredSuffix}
    </span>
  );
};

export default CountUp;
