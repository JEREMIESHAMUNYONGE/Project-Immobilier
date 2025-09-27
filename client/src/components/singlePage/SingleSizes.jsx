import React from "react";

function SingleSizes({ size, bedroom, bathroom }) {
  return (
    <>
      <p className="title">Tailles</p>
      <div className="sizes">
        <div className="size">
          <img src="/size.png" alt="" />
          <span>{size} m²</span>
        </div>
        <div className="size">
          <img src="/bed.png" alt="" />
          <span>{bedroom} lits</span>
        </div>
        <div className="size">
          <img src="/bath.png" alt="" />
          <span>{bathroom} salle de bain</span>
        </div>
      </div>
    </>
  );
}

export default SingleSizes;
