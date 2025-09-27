import React from "react";

function SingleSizes({ size, bedroom, bathroom }) {
  return (
    <>
      <p className="title">Sizes</p>
      <div className="sizes">
        <div className="size">
          <img src="/size.png" alt="" />
          <span>{size} sqft</span>
        </div>
        <div className="size">
          <img src="/bed.png" alt="" />
          <span>{bedroom} beds</span>
        </div>
        <div className="size">
          <img src="/bath.png" alt="" />
          <span>{bathroom} bathroom</span>
        </div>
      </div>
    </>
  );
}

export default SingleSizes;
