import { useContext } from "react";
import SearchBar from "../../components/searchBar/SearchBar";
import "./homePage.scss";
import { AuthContext } from "../../context/AuthContext";

function HomePage() {

  const {currentUser} = useContext(AuthContext)

  return (
    <div className="homePage" >
      <div className="textContainer">
        <div className="wrapper">
          <h1 className="title">Trouvez un bien immobilier et obtenez l'endroit de vos rêves</h1>
          <p>
            Simplifiez votre recherche ! Que vous cherchiez à louer ou à acheter,
            notre plateforme vous connecte aux meilleures propriétés, des appartements
            chics aux maisons spacieuses. Commencez votre aventure immobilière en toute
            confiance et trouvez l'endroit parfait pour bâtir votre avenir.
          </p>
          <SearchBar />
        </div>
      </div>
      <div className="imgContainer">
        <img src="/bg.png" alt="" />
      </div>
    </div>
  );
}

export default HomePage;