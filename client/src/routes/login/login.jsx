import { useContext, useState } from "react";
import "./login.scss";
import { Link, useNavigate } from "react-router-dom";
import apiRequest from "../../lib/apiRequest";
import { AuthContext } from "../../context/AuthContext";

function Login() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {updateUser} = useContext(AuthContext)

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    const formData = new FormData(e.target);

    const identifier = formData.get("username");
    const password = formData.get("password");
    // Send both username and email for maximum backend compatibility
    const payload = { username: identifier, email: identifier, password };

    try {
      const res = await apiRequest.post("/auth/login", payload);

      updateUser(res.data);

      const destination = res.data?.isAdmin ? "/admin" : "/";
      navigate(destination);
    } catch (err) {
      console.error(err?.response || err);
      setError(err?.response?.data?.message || "Identifiants invalides");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <>
     <div className="registerPage">
      <div className="card">
        <div className="cardLeft">
          <div className="brand">
            <img src="/logo.png" alt="Logo" />
            <span>Loue chez moi</span>
          </div>
          <h1>Connectez-vous</h1>
          <p>Rejoignez la communauté pour trouver et publier des annonces.</p>
        </div>
        <div className="cardRight">
          <form onSubmit={handleSubmit} noValidate>
            <div className="formGroup">
              <label htmlFor="username">Nom d'utilisateur</label>
              <input
                id="username"
                name="username"
                type="text"
                placeholder="Ex: johndoe"
                autoComplete="username"
                required
                minLength={3}
                maxLength={20}
              />
            </div>
          
            <div className="formGroup">
              <label htmlFor="password">Mot de passe</label>
              <div className="passwordField">
                <input
                name="password"
                 type="password"
                 required
                  id="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  minLength={6}
                />
              </div>
            </div>

            <button type="submit" className="submitButton" disabled={isLoading}>
              {isLoading ? "Connexion…" : "Connexion"}
            </button>

            <div className="formFooter">
              <span>vous êtes nouveau ?</span>
              <Link to="/register">Creer un nouveau compt</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
    </>
   
  );
}

export default Login;
