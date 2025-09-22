import { useEffect, useState } from "react";
import "./createPostModal.scss";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import UploadWidget from "../uploadWidget/UploadWidget";
import apiRequest from "../../lib/apiRequest";

function CreatePostModal({ isOpen, onClose, onSuccess, mode = "create", post = null }) {
  const [value, setValue] = useState(post?.postDetail?.desc || "");
  const [images, setImages] = useState(post?.images || []);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Sync state when switching between create/edit or when a new post is provided
  useEffect(() => {
    if (mode === "edit" && post) {
      setValue(post?.postDetail?.desc || "");
      setImages(Array.isArray(post?.images) ? post.images : []);
    }
    if (mode === "create" && !post) {
      // ensure clean state for creation
      setValue("");
      setImages([]);
    }
  }, [mode, post]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    const formData = new FormData(e.target);
    const inputs = Object.fromEntries(formData);

    try {
      const payload = {
        postData: {
          title: inputs.title,
          price: parseInt(inputs.price || 0),
          address: inputs.address,
          city: inputs.city,
          bedroom: parseInt(inputs.bedroom || 0),
          bathroom: parseInt(inputs.bathroom || 0),
          type: inputs.type,
          property: inputs.property,
          latitude: inputs.latitude,
          longitude: inputs.longitude,
          images: images,
        },
        postDetail: {
          desc: value,
          utilities: inputs.utilities,
          pet: inputs.pet,
          income: inputs.income,
          size: parseInt(inputs.size || 0),
          school: parseInt(inputs.school || 0),
          bus: parseInt(inputs.bus || 0),
          restaurant: parseInt(inputs.restaurant || 0),
        },
      };

      // Important: If editing and user didn't touch images, avoid sending empty array
      if (mode === "edit" && (!images || images.length === 0)) {
        delete payload.postData.images;
      }

      if (mode === "edit" && post?.id) {
        await apiRequest.put(`/posts/${post.id}`, payload);
      } else {
        await apiRequest.post("/posts", payload);
      }
      setSubmitting(false);
      onSuccess && onSuccess();
      onClose && onClose();
    } catch (err) {
      console.log(err);
      setError("Une erreur est survenue. Réessayez.");
      setSubmitting(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="createPostModal">
      <div className="modalOverlay" onClick={onClose}></div>
      <div className="modalContent">
        <button className="closeButton" onClick={onClose} aria-label="Fermer">✕</button>
        <div className="header">
          <h2 className="title">{mode === "edit" ? "Modifier l'annonce" : "Créer une annonce"}</h2>
        </div>
        <div className="body">
          <form onSubmit={handleSubmit} className="formGrid">
            <div className="formLeft">
              <div className="item">
                <label htmlFor="title">Titre</label>
                <input id="title" name="title" type="text" placeholder="Ex: Bel appartement..." required defaultValue={post?.title || ""} />
              </div>
              <div className="twoCols">
                <div className="item">
                  <label htmlFor="price">Prix</label>
                  <input id="price" name="price" type="number" min={0} placeholder="Ex: 120000" required defaultValue={post?.price ?? ""} />
                </div>
                <div className="item">
                  <label htmlFor="size">Surface (m²)</label>
                  <input id="size" name="size" type="number" min={0} defaultValue={post?.postDetail?.size ?? ""} />
                </div>
              </div>
              <div className="item">
                <label htmlFor="address">Adresse</label>
                <input id="address" name="address" type="text" placeholder="Adresse complète" defaultValue={post?.address || ""} />
              </div>
              <div className="twoCols">
                <div className="item">
                  <label htmlFor="city">Commune / Ville</label>
                  <input id="city" name="city" type="text" defaultValue={post?.city || ""} />
                </div>
                <div className="item">
                  <label htmlFor="property">Type de bien</label>
                  <select name="property" defaultValue={post?.property || "apartment"}>
                    <option value="apartment">Appartement</option>
                    <option value="house">Maison</option>
                    <option value="condo">Condo</option>
                    <option value="land">Terrain</option>
                  </select>
                </div>
              </div>

              <div className="twoCols">
                <div className="item">
                  <label htmlFor="bedroom">Chambres</label>
                  <input min={1} id="bedroom" name="bedroom" type="number" defaultValue={post?.bedroom ?? ""} />
                </div>
                <div className="item">
                  <label htmlFor="bathroom">Salles de bain</label>
                  <input min={1} id="bathroom" name="bathroom" type="number" defaultValue={post?.bathroom ?? ""} />
                </div>
              </div>

              <div className="twoCols">
                <div className="item">
                  <label htmlFor="type">Transaction</label>
                  <select name="type" defaultValue={post?.type || "buy"}>
                    <option value="buy">Acheter</option>
                    <option value="rent">Louer</option>
                  </select>
                </div>
                <div className="item">
                  <label htmlFor="income">Revenus requis</label>
                  <input id="income" name="income" type="text" placeholder="Ex: 3x loyer" defaultValue={post?.postDetail?.income || ""} />
                </div>
              </div>

              <div className="twoCols">
                <div className="item">
                  <label htmlFor="utilities">Charges</label>
                  <select name="utilities" defaultValue={post?.postDetail?.utilities || "owner"}>
                    <option value="owner">Propriétaire</option>
                    <option value="tenant">Locataire</option>
                    <option value="shared">Partagées</option>
                  </select>
                </div>
                <div className="item">
                  <label htmlFor="pet">Animaux</label>
                  <select name="pet" defaultValue={post?.postDetail?.pet || "allowed"}>
                    <option value="allowed">Autorisés</option>
                    <option value="not-allowed">Non autorisés</option>
                  </select>
                </div>
              </div>

              <div className="twoCols">
                <div className="item">
                  <label htmlFor="school">École (m)</label>
                  <input min={0} id="school" name="school" type="number" defaultValue={post?.postDetail?.school ?? ""} />
                </div>
                <div className="item">
                  <label htmlFor="bus">Bus (m)</label>
                  <input min={0} id="bus" name="bus" type="number" defaultValue={post?.postDetail?.bus ?? ""} />
                </div>
              </div>

              <div className="item">
                <label htmlFor="restaurant">Restaurant (m)</label>
                <input min={0} id="restaurant" name="restaurant" type="number" defaultValue={post?.postDetail?.restaurant ?? ""} />
              </div>

              <div className="item description">
                <label>Description</label>
                <ReactQuill theme="snow" onChange={setValue} value={value} />
              </div>
              {/* Médias & Localisation (déplacés sous la description) */}
              <div className="item mediaBlock">
                <label>Images</label>
                <div className="imagesPreview">
                  {images.map((img, i) => (
                    <img key={i} src={img} alt="preview" />
                  ))}
                </div>
                <UploadWidget
                  uwConfig={{
                    multiple: true,
                    cloudName: "lamadev",
                    uploadPreset: "estate",
                    folder: "posts",
                  }}
                  setState={setImages}
                  label="Importer des images"
                />
              </div>

              <div className="coords twoCols">
                <div className="item">
                  <label htmlFor="latitude">Latitude</label>
                  <input id="latitude" name="latitude" type="text" defaultValue={post?.latitude || ""} />
                </div>
                <div className="item">
                  <label htmlFor="longitude">Longitude</label>
                  <input id="longitude" name="longitude" type="text" defaultValue={post?.longitude || ""} />
                </div>
              </div>

              <div className="actions">
                <button type="button" className="btn cancelBtn" onClick={onClose}>Annuler</button>
                <button type="submit" className="btn submitBtn" disabled={submitting}>
                  {submitting ? (mode === "edit" ? "Mise à jour..." : "Envoi...") : (mode === "edit" ? "Mettre à jour" : "Créer")}
                </button>
              </div>
              {error && <div className="error">{error}</div>}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreatePostModal;
