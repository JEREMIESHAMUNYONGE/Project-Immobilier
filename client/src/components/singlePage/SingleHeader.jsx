import React from "react";

function SingleHeader({ title, address, price, user }) {
  return (
    <div className="top">
      <div className="post">
        <h1>{title}</h1>
        <div className="address">
          <img src="/pin.png" alt="" />
          <span>{address}</span>
        </div>
        <div className="price">$ {price}</div>
      </div>
      <div className="user">
        <img src={user?.avatar || "/noavatar.jpg"} alt="" />
        <span>{user?.username}</span>
      </div>
    </div>
  );
}

export default SingleHeader;
