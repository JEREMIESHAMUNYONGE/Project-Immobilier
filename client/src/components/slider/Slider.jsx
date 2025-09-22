import { useState } from "react";
import "./slider.scss";

function Slider({ images }) {
  const [imageIndex, setImageIndex] = useState(null);

  const changeSlide = (direction) => {
    if (!images || images.length === 0) return;
    
    if (direction === "left") {
      setImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1);
    } else {
      setImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1);
    }
  };

  const openFullscreen = (index) => {
    setImageIndex(index);
  };

  const closeFullscreen = () => {
    setImageIndex(null);
  };

  // Si pas d'images
  if (!images || images.length === 0) {
    return (
      <div className="slider no-images">
        <div className="placeholder">
          <span className="placeholder-icon">📷</span>
          <p>Aucune image disponible</p>
        </div>
      </div>
    );
  }

  return (
    <div className="slider">
      {/* Mode plein écran */}
      {imageIndex !== null && (
        <div className="fullSlider">
          <div className="arrow left" onClick={() => changeSlide("left")}>
            <img src="/arrow.png" alt="Image précédente" />
          </div>
          
          <div className="imgContainer">
            <img 
              src={images[imageIndex]} 
              alt={`Image ${imageIndex + 1}`}
            />
          </div>
          
          <div className="arrow right" onClick={() => changeSlide("right")}>
            <img src="/arrow.png" alt="Image suivante" />
          </div>
          
          <button className="close" onClick={closeFullscreen} aria-label="Fermer">
            ✕
          </button>
        </div>
      )}

      {/* Image principale */}
      <div className="bigImage">
        <img 
          src={images[0]} 
          alt="Image principale"
          onClick={() => openFullscreen(0)} 
        />
      </div>

      {/* Miniatures */}
      <div className="smallImages">
        {images.slice(1).map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`Miniature ${index + 2}`}
            onClick={() => openFullscreen(index + 1)}
          />
        ))}
      </div>
    </div>
  );
}

export default Slider;
