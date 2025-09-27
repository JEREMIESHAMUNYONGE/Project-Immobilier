import React from "react";

function SingleNearby({ school, bus, restaurant }) {
  return (
    <>
      <p className="title">Nearby Places</p>
      <div className="listHorizontal">
        <div className="feature">
          <img src="/school.png" alt="" />
          <div className="featureText">
            <span>School</span>
            <p>
              {school > 999 ? school / 1000 + "km" : school + "m"} away
            </p>
          </div>
        </div>
        <div className="feature">
          <img src="/pet.png" alt="" />
          <div className="featureText">
            <span>Bus Stop</span>
            <p>{bus}m away</p>
          </div>
        </div>
        <div className="feature">
          <img src="/fee.png" alt="" />
          <div className="featureText">
            <span>Restaurant</span>
            <p>{restaurant}m away</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default SingleNearby;
