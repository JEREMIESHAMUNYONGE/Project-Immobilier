import React from "react";
import "./card.scss";

function CardSkeleton() {
  return (
    <div className="card card--skeleton">
      <div className="imageContainer sk" />
      <div className="textContainer">
        <div className="sk sk-title" />
        <div className="sk sk-address">
          <div className="sk sk-pin" />
          <div className="sk sk-line" />
        </div>
        <div className="sk sk-price" />
        <div className="bottom">
          <div className="features">
            <div className="sk sk-chip" />
            <div className="sk sk-chip" />
          </div>
          <div className="icons">
            <div className="sk sk-icon" />
            <div className="sk sk-icon" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default CardSkeleton;
