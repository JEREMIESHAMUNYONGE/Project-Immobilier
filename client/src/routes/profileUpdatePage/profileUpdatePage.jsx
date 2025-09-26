import { useContext, useState } from "react";
import "./profileUpdatePage.scss";
import { AuthContext } from "../../context/AuthContext";
import apiRequest from "../../lib/apiRequest";
import { useNavigate } from "react-router-dom";
import UploadWidget from "../../components/uploadWidget/UploadWidget";

function ProfileUpdatePage({ stayInDashboard = false, onSaved }) {
  const { currentUser, updateUser } = useContext(AuthContext);
  const [error, setError] = useState("");
  const [avatar, setAvatar] = useState([]);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const { username, email, password } = Object.fromEntries(formData);

    try {
      const res = await apiRequest.put(`/users/${currentUser.id}`, {
        username,
        email,
        password,
        avatar: avatar[0]
      });
      updateUser(res.data);
      if (typeof onSaved === 'function') onSaved(res.data);
      if (!stayInDashboard) {
        navigate("/profile");
      }
    } catch (err) {
      console.log(err);
      setError(err?.response?.data?.message || "Une erreur est survenue. Veuillez réessayer.");
    }
  };

  return (
    <div className="profileUpdatePage">
      <div className="card">
        <div className="cardBody">
          <div className="leftPanel">
            <form onSubmit={handleSubmit} className="updateForm" noValidate>
              <div className="formHeader">
                <h1>Modifier mon profil</h1>
                <p>Mettez à jour vos informations personnelles</p>
              </div>

              <div className="formGrid">
                <div className="formGroup">
                  <label htmlFor="username">Nom d'utilisateur</label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Votre nom d'utilisateur"
                    defaultValue={currentUser?.username || ""}
                    autoComplete="username"
                  />
                </div>

                <div className="formGroup">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="votre@email.com"
                    defaultValue={currentUser?.email || ""}
                    autoComplete="email"
                  />
                </div>

                <div className="formGroup fullWidth">
                  <label htmlFor="password">Mot de passe (laisser vide pour ne pas changer)</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              {error && <div className="errorAlert">{error}</div>}

              <div className="formActions">
                <button type="submit" className="submitButton">Enregistrer</button>
              </div>
            </form>
          </div>

          <div className="rightPanel">
            <div className="avatarCard">
              <div className="avatarPreview">
                <img src={avatar[0] || currentUser?.avatar || "/noavatar.jpg"} alt="Avatar utilisateur" className="avatar" />
              </div>
              <div className="avatarActions">
                <UploadWidget
                  uwConfig={{
                    cloudName: "lamadev",
                    uploadPreset: "estate",
                    multiple: false,
                    maxImageFileSize: 2000000,
                    folder: "avatars",
                  }}
                  setState={setAvatar}
                  label={"Mettre à jour l'image"}
                />
                <p className="helperText">Taille max: 2MB. Formats: JPG, PNG.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileUpdatePage;
