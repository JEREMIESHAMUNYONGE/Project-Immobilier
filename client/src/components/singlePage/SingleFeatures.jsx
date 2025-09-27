import React from "react";

function SingleFeatures({ utilities, pet, income }) {
  return (
    <>
      <p className="title">General</p>
      <div className="listVertical">
        <div className="feature">
          <img src="/utility.png" alt="" />
          <div className="featureText">
            <span>Utilities</span>
            {utilities === "owner" ? (
              <p>Owner is responsible</p>
            ) : (
              <p>Tenant is responsible</p>
            )}
          </div>
        </div>
        <div className="feature">
          <img src="/pet.png" alt="" />
          <div className="featureText">
            <span>Pet Policy</span>
            {pet === "allowed" ? <p>Pets Allowed</p> : <p>Pets not Allowed</p>}
          </div>
        </div>
        <div className="feature">
          <img src="/fee.png" alt="" />
          <div className="featureText">
            <span>Income Policy</span>
            <p>{income}</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default SingleFeatures;
