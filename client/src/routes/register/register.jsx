import "./register.scss";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useState } from "react";
import apiRequest from "../../lib/apiRequest";

function Register() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("")
    setIsLoading(true);
    // Validation côté client
    if (!username.trim() || !email.trim() || !password || password.length < 6) {
      setIsLoading(false);
      return setError("Veuillez renseigner un nom d'utilisateur, un email valide et un mot de passe (≥ 6 caractères)");
    }

    try {
      await apiRequest.post("/auth/register", {
        username: username.trim(),
        email: email.trim(),
        password,
      });
      navigate("/login");
    } catch (err) {
      setError(err?.response?.data?.message || "Inscription impossible. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="registerPage">
      <div className="card">
        <div className="cardLeft">
          <div className="brand">
            <img src="/logo.png" alt="Logo" />
            <span>Loue chez moi</span>
          </div>
          <h1>Créer un compte</h1>
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
                value={username}
                onChange={(e)=>setUsername(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
            <div className="formGroup">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="exemple@mail.com"
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
            <div className="formGroup">
              <label htmlFor="password">Mot de passe</label>
              <div className="passwordField">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e)=>setPassword(e.target.value)}
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  className="togglePassword"
                  onClick={()=>setShowPassword(s=>!s)}
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? "Masquer" : "Afficher"}
                </button>
              </div>
            </div>

            {error && <div className="errorAlert">{error}</div>}

            <button type="submit" className="submitButton" disabled={isLoading}>
              {isLoading ? "Inscription…" : "S'inscrire"}
            </button>

            <div className="formFooter">
              <span>Déjà un compte ?</span>
              <Link to="/login">Se connecter</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
