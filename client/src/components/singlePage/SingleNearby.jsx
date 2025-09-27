import React from "react";

function SingleNearby({ school, bus, restaurant }) {
  return (
    <>
      <p className="title">Lieux à proximité</p>
      <div className="listHorizontal">
        <div className="feature">
          <img src="/school.png" alt="" />
          <div className="featureText">
            <span>École</span>
            <p>
              {school > 999 ? school / 1000 + "km" : school + "m"} 
            </p>
          </div>
        </div>
        <div className="feature">
          <img src="/pet.png" alt="" />
          <div className="featureText">
            <span>Arrêt de bus</span>
            <p>{bus}m </p>
          </div>
        </div>
        <div className="feature">
          <img src="/fee.png" alt="" />
          <div className="featureText">
            <span>Restaurant</span>
            <p>{restaurant}m </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default SingleNearby;
