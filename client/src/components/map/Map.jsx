import { MapContainer, TileLayer } from "react-leaflet";
import "./map.scss";
import "leaflet/dist/leaflet.css";
import Pin from "../pin/Pin";

function Map({ items }) {
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

  const parsedItems = (items || []).map((it) => ({
    ...it,
    latitude: toNumber(it?.latitude),
    longitude: toNumber(it?.longitude),
  }));

  const validItems = parsedItems.filter((it) =>
    isValidCoord(it.latitude, it.longitude)
  );

  const defaultCenter = [52.4797, -1.90269];

  return (
    <MapContainer
      center={
        validItems.length === 1
          ? [validItems[0].latitude, validItems[0].longitude]
          : defaultCenter
      }
      zoom={7}
      scrollWheelZoom={false}
      className="map"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {parsedItems.map((item) => (
        <Pin item={item} key={item.id} />
      ))}
    </MapContainer>
  );
}

export default Map;
