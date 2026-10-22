import React from 'react';
import { motion } from 'framer-motion';

export const BlurText = ({
  text = '',
  delay = 0.05,
  className = '',
  animateBy = 'words', // 'words' | 'letters'
  direction = 'top', // 'top' | 'bottom'
  onAnimationComplete,
}) => {
  const elements = animateBy === 'words' ? text.split(' ') : text.split('');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: delay,
      },
    },
  };

  const itemVariants = {
    hidden: {
      filter: 'blur(10px)',
      opacity: 0,
      y: direction === 'top' ? -20 : 20,
    },
    visible: {
      filter: 'blur(0px)',
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  return (
    <motion.span
      className={`inline-block ${className}`}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      onAnimationComplete={onAnimationComplete}
      style={{ display: 'inline-flex', flexWrap: 'wrap', gap: animateBy === 'words' ? '0.35em' : '0' }}
    >
      {elements.map((el, i) => (
        <motion.span
          key={i}
          variants={itemVariants}
          style={{ display: 'inline-block', willChange: 'transform, filter, opacity' }}
        >
          {el === ' ' ? '\u00A0' : el}
        </motion.span>
      ))}
    </motion.span>
  );
};

export default BlurText;
