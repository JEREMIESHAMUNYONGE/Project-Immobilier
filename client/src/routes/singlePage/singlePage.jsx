import "./singlePage.scss";
import Slider from "../../components/slider/Slider";
import Map from "../../components/map/Map";
import { useNavigate, useLoaderData } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import apiRequest from "../../lib/apiRequest";
import SingleHeader from "../../components/singlePage/SingleHeader";
import SingleDescription from "../../components/singlePage/SingleDescription";
import SingleFeatures from "../../components/singlePage/SingleFeatures";
import SingleSizes from "../../components/singlePage/SingleSizes";
import SingleNearby from "../../components/singlePage/SingleNearby";

function SinglePage() {
  const post = useLoaderData();
  const [saved, setSaved] = useState(post.isSaved);
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSave = async () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    setSaved((prev) => !prev);
    try {
      await apiRequest.post("/users/save", { postId: post.id });
    } catch (err) {
      console.log(err);
      setSaved((prev) => !prev);
    }
  };

  const handleContact = async () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    if (currentUser.id === post.userId) {
      alert("Vous ne pouvez pas vous contacter vous-même !");
      return;
    }

    try {
      const response = await apiRequest.post("/chats", {
        receiverId: post.userId
      });
      
      navigate("/profile", { 
        state: { 
          openChat: response.data.id,
          receiver: post.user 
        } 
      });
    } catch (err) {
      console.log(err);
      alert("Erreur lors de l'envoi du message. Veuillez réessayer.");
    }
  };

  // ✅ Fonction pour supprimer le post
  const handleDelete = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce post ? Cette action est irréversible.")) {
      try {
        await apiRequest.delete(`/posts/${post.id}`);
        alert("Post supprimé avec succès !");
        navigate("/profile");
      } catch (err) {
        console.log(err);
        alert("Erreur lors de la suppression du post");
      }
    }
  };

  // ✅ Fonction pour modifier le post
  const handleEdit = () => {
    navigate(`/add?edit=${post.id}`);
  };

  // ✅ Vérifier si l'utilisateur est le propriétaire
  const isOwner = currentUser && currentUser.id === post.userId;

  return (
    <div className="singlePage">
      <div className="details">
        <div className="wrapper">
          <Slider images={post.images} />
          <div className="info">
            <SingleHeader
              title={post.title}
              address={post.address}
              price={post.price}
              user={post.user}
            />
            <SingleDescription desc={post.postDetail.desc} />
          </div>
        </div>
      </div>
      <div className="features">
        <div className="wrapper">
          <p className="title">General</p>
          <SingleFeatures
            utilities={post.postDetail.utilities}
            pet={post.postDetail.pet}
            income={post.postDetail.income}
          />
          <SingleSizes
            size={post.postDetail.size}
            bedroom={post.bedroom}
            bathroom={post.bathroom}
          />
          <SingleNearby
            school={post.postDetail.school}
            bus={post.postDetail.bus}
            restaurant={post.postDetail.restaurant}
          />
          <p className="title">Location</p>
          <div className="mapContainer">
            <Map items={[post]} />
          </div>
          <div className="buttons">
            {/* ✅ Boutons conditionnels selon le propriétaire */}
            {isOwner ? (
              // Boutons pour le propriétaire
              <>
                <button
                  onClick={handleEdit}
                  style={{
                    backgroundColor: "#4CAF50",
                    color: "white",
                    visibility: "hidden",
                  }}
                >
                  <img src="/edit.png" alt="" />
                  Modifier
                </button>

                <button
                  onClick={handleDelete}
                  style={{
                    backgroundColor: "#ff4444",
                    color: "white",
                    visibility: "hidden",
                  }}
                >
                  <img src="/delete.png" alt="" />
                  Supprimer
                </button>
              </>
            ) : (
              // Boutons pour les autres utilisateurs
              <>
                <button onClick={handleContact}>
                  <img src="/chat.png" alt="" />
                  Envoie le Message
                </button>

                <button
                  onClick={handleSave}
                  style={{
                    backgroundColor: saved ? "#fece51" : "white",
                  }}
                >
                  <img src="/save.png" alt="" />
                  {saved ? "Place Saved" : "Souvegardez"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SinglePage;
