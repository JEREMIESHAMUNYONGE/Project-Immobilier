import React from "react";

function SingleFeatures({ utilities, pet, income }) {
  return (
    <>
      <p className="title">General</p>
      <div className="listVertical">
        <div className="feature">
          <img src="/utility.png" alt="" />
          <div className="featureText">
            <span>Services publics</span>
            {utilities === "owner" ? (
              <p>Le propriétaire est responsable</p>
            ) : (
              <p>Le locataire est responsable</p>
            )}
          </div>
        </div>
        <div className="feature">
          <img src="/pet.png" alt="" />
          <div className="featureText">
            <span>Politique relative aux animaux domestiques</span>
            {pet === "allowed" ? <p>Animaux acceptés</p> : <p>Animaux non admis</p>}
          </div>
        </div>
        <div className="feature">
          <img src="/fee.png" alt="" />
          <div className="featureText">
            <span>Politique en matière de revenus</span>
            <p>{income}</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default SingleFeatures;
