import React, { useState } from 'react';
import './slideshow.css';

const Gallery = ({ images, galleryName = "Black and White" }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const currentImage = images[currentIndex];

  return (
    <div className="gallery-container">
      {/* Top Left Menu Icon (Placeholder based on image) */}
      <div className="menu-icon">
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
      </div>

      {/* --- NEW: Gallery Name (Top Right) --- */}
      <div className="gallery-header">
        <h1>{galleryName}</h1>
      </div>

      {/* Main Slideshow Area */}
      <div className="slideshow-wrapper">
        <button className="nav-btn left" onClick={prevSlide}>&lt;</button>
        
        <div className="image-display">
          <img src={currentImage.src} alt={currentImage.title} />
          {/* REMOVED: Old hover overlay div was here */}
        </div>

        <button className="nav-btn right" onClick={nextSlide}>&gt;</button>
      </div>

      {/* --- NEW: Title Moved to Bottom Right (Static, no hover) --- */}
      <div className="image-info">
        <h2>{currentImage.title}</h2>
      </div>

      {/* Footer */}
      <footer className="gallery-footer">
        © 2026 • All rights reserved
      </footer>
    </div>
  );
};

export default Gallery;