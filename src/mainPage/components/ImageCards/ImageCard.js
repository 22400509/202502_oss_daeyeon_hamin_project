import React from 'react';
import './ImageCard.css';

const ImageCard = ({ title, description, date, imageUrl, category }) => {
  return (
    <div className="card">
      <span className="card-category">{category}</span>
      <img src={imageUrl} alt={title} loading="lazy" />
      <div className="card-overlay">
        <div className="overlay-left">
          <h2 className="card-title">{title}</h2>
          <p className="card-description">{description}</p>
        </div>
        <div className="overlay-right">
          {/* --- THIS IS THE FIX --- */}
          {/* Convert the Date object to a string before displaying it */}
          <span className="card-date">{date.toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

export default ImageCard;