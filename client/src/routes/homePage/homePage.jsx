import { useContext } from "react";
import SearchBar from "../../components/searchBar/SearchBar";
import "./homePage.scss";
import { AuthContext } from "../../context/AuthContext";
import { Link } from "react-router-dom";

function HomePage() {

  const { currentUser } = useContext(AuthContext)

  return (
    <div className="homePage">
      <div className="textContainer">
        <div className="wrapper">
          
          <h1 className="title">Trouvez votre logement idéal facilement</h1>
          <p className="subtitle">
            Parcourez des centaines d’annonces vérifiées et découvrez des lieux qui correspondent à votre style, votre budget et votre quotidien.
          </p>
          <div className="searchGlass">
            <SearchBar />
          </div>
          <div className="ctaSection">
            <Link to="/list" className="primaryButton">
              Explorer les annonces
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            
            </Link>
            {currentUser ? (
              <Link to="/profile" className="secondaryButton">
                Mon tableau de bord
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M20 22C20 18.6863 16.4183 16 12 16C7.58172 16 4 18.6863 4 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            ) : (
              <Link to="/register" className="secondaryButton">
                Créer un compte
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            )}
          </div>
          <div className="boxes">
            <div className="box">
              <h1>16+</h1>
              <h2>Years of Experience</h2>
            </div>
            <div className="box">
              <h1>200</h1>
              <h2>Award Gained</h2>
            </div>
            <div className="box">
              <h1>2000+</h1>
              <h2>Property Ready</h2>
            </div>
          </div>

          <div className="trustBar">
            <span>Ils nous font confiance</span>
            <div className="logos">
              <img src="/logo.png" alt="Brand" />
              <img src="/logo.png" alt="Brand" />
              <img src="/logo.png" alt="Brand" />
              <img src="/logo.png" alt="Brand" />
            </div>
          </div>

          <div className="features">
            <div className="feature">
              <div className="icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div className="content">
                <h3>Publication rapide</h3>
                <p>Déposez une annonce en quelques minutes et touchez des milliers de locataires.</p>
              </div>
            </div>
            <div className="feature">
              <div className="icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div className="content">
                <h3>Messagerie intégrée</h3>
                <p>Échangez en toute simplicité avec les propriétaires et agences.</p>
              </div>
            </div>
            <div className="feature">
              <div className="icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M19.4 15A1.65 1.65 0 0 0 21 13.35V10.65A1.65 1.65 0 0 0 19.4 9L17.55 8.1A1.65 1.65 0 0 1 16.7 6.55L15.8 4.6A1.65 1.65 0 0 0 14.15 3H9.85A1.65 1.65 0 0 0 8.2 4.6L7.3 6.55A1.65 1.65 0 0 1 6.45 8.1L4.6 9A1.65 1.65 0 0 0 3 10.65V13.35A1.65 1.65 0 0 0 4.6 15L6.45 15.9A1.65 1.65 0 0 1 7.3 17.45L8.2 19.4A1.65 1.65 0 0 0 9.85 21H14.15A1.65 1.65 0 0 0 15.8 19.4L16.7 17.45A1.65 1.65 0 0 1 17.55 15.9L19.4 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div className="content">
                <h3>Recherche avancée</h3>
                <p>Filtres précis et résultats pertinents pour gagner du temps.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
     
    </div>
  );
}

export default HomePage;
