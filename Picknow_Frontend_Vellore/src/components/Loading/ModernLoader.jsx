import React, { useEffect, useState } from 'react';
import './ModernLoader.css';

const ModernLoader = ({
  text = 'Shri Deepaalaya Silks',
  showProgress = true,
  customMessage = 'Weaving tradition into luxury...',
  preventScroll = true,
  inline = false
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (preventScroll && !inline) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflowY = 'scroll';

      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflowY = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [preventScroll, inline]);

  useEffect(() => {
    if (showProgress) {
      const interval = setInterval(() => {
        setProgress(prev =>
          prev >= 100 ? 100 : Math.min(prev + Math.random() * 8, 100)
        );
      }, 200);

      return () => clearInterval(interval);
    }
  }, [showProgress]);

  return (
    <div className={`modern-discovery-loader ${inline ? 'inline' : ''}`}>
      <div className="loader-portal-sleek">
        <div className="loader-logo-container-sleek">
          <div className="loader-spinner-minimal"></div>
          <div className="loader-luxury-mark" style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontWeight: 800,
            fontSize: '24px',
            color: '#6D1734',
            letterSpacing: '1px',
            zIndex: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ color: '#6D1734' }}>/</span>
            <span style={{ color: '#C5A15A' }}>\</span>
            <span style={{ color: '#6D1734' }}>/</span>
            <span style={{ color: '#C5A15A' }}>\</span>
            <span style={{ color: '#6D1734', fontSize: '28px', lineHeight: 0.5 }}>.</span>
          </div>
        </div>
        
        <div className="loader-info-sleek">
          <h3 className="loader-title-sleek" style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            letterSpacing: '1px',
            color: '#6D1734',
            fontSize: '1.15rem'
          }}>{text}</h3>
          <p className="loader-msg-sleek" style={{
            fontFamily: "'Karla', sans-serif",
            color: '#8C827A',
            fontSize: '0.85rem'
          }}>{customMessage}</p>
          
          {showProgress && (
            <div className="loader-progress-sleek">
              <div className="loader-bar-bg-sleek" style={{ background: '#EDE2D2' }}>
                <div 
                  className="loader-bar-fill-sleek" 
                  style={{ width: `${Math.round(progress)}%`, background: '#6D1734' }}
                ></div>
              </div>
              <span className="loader-percent-sleek" style={{ color: '#C5A15A', fontWeight: 700 }}>
                {Math.round(progress)}%
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModernLoader;