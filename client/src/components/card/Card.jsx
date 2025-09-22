import { Link } from "react-router-dom";
import "./card.scss";

function Card({ item, onClick }) {
  const handleClick = (e) => {
    if (onClick) {
      e.preventDefault();
      onClick(item);
    }
  };

  // Formatage du prix en FR (USD par défaut)
  const formattedPrice = typeof item.price === "number"
    ? new Intl.NumberFormat("fr-FR", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(item.price)
    : item.price;

  return (
    <div className="card">
      {onClick ? (
        <div className="imageContainer" onClick={handleClick} style={{ cursor: 'pointer' }}>
          <img src={item.images?.[0] || "/noimage.jpg"} alt={item.title} />
        </div>
      ) : (
        <Link to={`/${item.id}`} className="imageContainer">
          <img src={item.images?.[0] || "/noimage.jpg"} alt={item.title} />
        </Link>
      )}
      <div className="textContainer">
        <h2 className="title">
          {onClick ? (
            <span onClick={handleClick} style={{ cursor: 'pointer' }}>
              {item.title}
            </span>
          ) : (
            <Link to={`/${item.id}`}>{item.title}</Link>
          )}
        </h2>
        <p className="address">
          <img src="/pin.png" alt="Adresse" />
          <span>{item.address}</span>
        </p>
        <p className="price">{formattedPrice}</p>
        <div className="bottom">
          <div className="features">
            <div className="feature">
              <img src="/bed.png" alt="Chambres" />
              <span>{item.bedroom} chambres</span>
            </div>
            <div className="feature">
              <img src="/bath.png" alt="Salles de bain" />
              <span>{item.bathroom} salles de bain</span>
            </div>
          </div>
          <div className="icons">
            <div className="icon">
              <img src="/save.png" alt="Sauvegarder" />
            </div>
            <div className="icon">
              <img src="/chat.png" alt="Contacter" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Card;
