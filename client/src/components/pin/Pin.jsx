import { Marker, Popup } from "react-leaflet";
import "./pin.scss";
import { Link } from "react-router-dom";

function Pin({ item }) {
  const toNumber = (v) => {
    const n = typeof v === "string" ? parseFloat(v) : v;
    return Number.isFinite(n) ? n : NaN;
  };

  const isValidCoord = (lat, lng) =>
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180;

  const lat = toNumber(item?.latitude);
  const lng = toNumber(item?.longitude);

  if (!isValidCoord(lat, lng)) return null;

  const imageSrc = Array.isArray(item?.images) && item.images.length > 0 ? item.images[0] : "";

  return (
    <Marker position={[lat, lng]}>
      <Popup>
        <div className="popupContainer">
          <img src={imageSrc} alt="" />
          <div className="textContainer">
            <Link to={`/${item.id}`}>{item.title}</Link>
            <span>{item.bedroom} bedroom</span>
            <b>$ {item.price}</b>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

export default Pin;
