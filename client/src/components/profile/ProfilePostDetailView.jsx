import React from "react";
import Slider from "../slider/Slider";
import Map from "../map/Map";
import SingleHeader from "../singlePage/SingleHeader";
import SingleDescription from "../singlePage/SingleDescription";
import SingleFeatures from "../singlePage/SingleFeatures";
import SingleSizes from "../singlePage/SingleSizes";
import SingleNearby from "../singlePage/SingleNearby";

function ProfilePostDetailView({ post, isOwner, saved, onEdit, onDelete, onContact, onSave }) {
  if (!post) return null;
  return (
    <div className="postDetailContainer">
      {/* Slider */}
      <div className="sliderSection">
        <Slider images={post.images} />
      </div>

      {/* Contenu en deux colonnes */}
      <div className="contentSection">
        {/* Colonne gauche */}
        <div className="leftColumn">
          {/* En-tête avec titre et prix + adresse + user */}
          <div className="header">
            <SingleHeader
              title={post.title}
              address={post.address}
              price={post.price}
              user={post.user}
            />
          </div>

          {/* Caractéristiques générales */}
          <div className="featuresSection">
            <h3>Caractéristiques</h3>
            <div className="featuresGrid">
              <SingleFeatures
                utilities={post.postDetail.utilities}
                pet={post.postDetail.pet}
                income={post.postDetail.income}
              />
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="actionButtons">
            {isOwner ? (
              <>
                <button className="btn editBtn" onClick={onEdit}>
                  <img src="/edit.png" alt="Modifier" />
                  Modifier
                </button>
                <button className="btn deleteBtn" onClick={onDelete}>
                  <img src="/delete.png" alt="Supprimer" />
                  Supprimer
                </button>
              </>
            ) : (
              <>
                <button className="btn contactBtn" onClick={onContact}>
                  <img src="/chat.png" alt="Contacter" />
                  Contacter
                </button>
                <button
                  className={`btn saveBtn ${saved ? 'saved' : ''}`}
                  onClick={onSave}
                >
                  <img src="/save.png" alt="Sauvegarder" />
                  {saved ? "Sauvegardé" : "Sauvegarder"}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Colonne droite */}
        <div className="rightColumn">
          {/* Description */}
          <div className="description">
            <h3>Description</h3>
            <div className="descriptionContent">
              <SingleDescription desc={post.postDetail.desc} />
            </div>
          </div>

          {/* Dimensions */}
          <div className="dimensionsSection">
            <h3>Dimensions</h3>
            <div className="dimensionsGrid">
              <SingleSizes
                size={post.postDetail.size}
                bedroom={post.bedroom}
                bathroom={post.bathroom}
              />
            </div>
          </div>

          {/* Lieux à proximité */}
          <div className="nearbySection">
            <h3>À proximité</h3>
            <div className="nearbyGrid">
              <SingleNearby
                school={post.postDetail.school}
                bus={post.postDetail.bus}
                restaurant={post.postDetail.restaurant}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Carte en pleine largeur */}
      <div className="mapSection">
        <h3>Localisation</h3>
        <div className="mapContainer">
          <Map items={[post]} />
        </div>
      </div>
    </div>
  );
}

export default ProfilePostDetailView;
