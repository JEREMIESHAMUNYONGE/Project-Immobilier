import Chat from "../../components/chat/Chat";
import List from "../../components/list/List";
import Card from "../../components/card/Card";
import Slider from "../../components/slider/Slider";
import Map from "../../components/map/Map";
import PostDetailModal from "../../components/postDetailModal/PostDetailModal";
import CreatePostModal from "../../components/createPostModal/CreatePostModal";
import ProfileUpdatePage from "../profileUpdatePage/profileUpdatePage";
import "./profilePage.scss";
import apiRequest from "../../lib/apiRequest";
import { Await, Link, useLoaderData, useNavigate, useLocation, Navigate } from "react-router-dom";
import { Suspense, useContext, useEffect, useRef, useState } from "react";
import { useNotificationStore } from "../../lib/notificationStore";
import { AuthContext } from "../../context/AuthContext";
import DOMPurify from "dompurify";

function ProfilePage() {
  const data = useLoaderData();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("accueil");
  const [openChatId, setOpenChatId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [postDetails, setPostDetails] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showProfileUpdate, setShowProfileUpdate] = useState(false);
  const [saved, setSaved] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    type: "",
    property: "",
    minPrice: "",
    maxPrice: "",
    bedroom: "",
    bathroom: "",
    city: "",
    address: ""
  });

  // Blank delay control (show nothing briefly on tab switch)
  const [showBlankMes, setShowBlankMes] = useState(false);
  const [showBlankSaved, setShowBlankSaved] = useState(false);
  const blankDelayMs = 800; // adjust as needed
  const blankMesTimer = useRef(null);
  const blankSavedTimer = useRef(null);
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    address: "",
    city: "",
    bedroom: "",
    bathroom: "",
    type: "buy",
    property: "apartment",
    utilities: "",
    pet: "",
    income: "",
    size: "",
    school: "",
    bus: "",
    restaurant: "",
    description: "",
    images: []
  });

  const { updateUser, currentUser } = useContext(AuthContext);
  // Si un admin tente d'accéder au dashboard utilisateur, redirection vers /admin
  if (currentUser && currentUser.isAdmin) {
    return <Navigate to="/admin" replace />;
  }
  const navigate = useNavigate();
  const notifNumber = useNotificationStore((state) => state.number);
  const fetchNotif = useNotificationStore((state) => state.fetch);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (location.state?.openChat) {
      setOpenChatId(location.state.openChat);
      setActiveTab("messages");
    }
  }, [location.state]);

  // Initialiser/rafraîchir le compteur de messages non lus en arrivant sur la page
  useEffect(() => {
    if (currentUser) {
      fetchNotif();
    }
  }, [currentUser, fetchNotif]);

  // Afficher un toast si une création a réussi (flag mis avant un reload)
  useEffect(() => {
    const created = localStorage.getItem("post_created_success");
    if (created) {
      setToastMessage("Annonce créée avec succès");
      localStorage.removeItem("post_created_success");
      const t = setTimeout(() => setToastMessage(""), 4000);
      return () => clearTimeout(t);
    }
  }, []);

  const handleLogout = async () => {
    try {
      await apiRequest.post("/auth/logout");
      updateUser(null);
      navigate("/");
    } catch (err) {
      console.log(err);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab !== "messages") {
      setOpenChatId(null);
    }
    if (tab !== "mes-maisons") {
      setShowCreateForm(false);
    }
    if (tab !== "profile-update") {
      setShowProfileUpdate(false);
    }
    if (tab !== "post-detail") {
      setPostDetails(null);
    }
    if (tab !== "recherche") {
      setSearchResults([]);
    }
    setSelectedPost(null);

    // Trigger blank (no UI) for a short delay
    if (tab === "mes-maisons") {
      setShowBlankMes(true);
      if (blankMesTimer.current) clearTimeout(blankMesTimer.current);
      blankMesTimer.current = setTimeout(() => setShowBlankMes(false), blankDelayMs);
    }
    if (tab === "maisons-sauvees") {
      setShowBlankSaved(true);
      if (blankSavedTimer.current) clearTimeout(blankSavedTimer.current);
      blankSavedTimer.current = setTimeout(() => setShowBlankSaved(false), blankDelayMs);
    }
  };

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (blankMesTimer.current) clearTimeout(blankMesTimer.current);
      if (blankSavedTimer.current) clearTimeout(blankSavedTimer.current);
    };
  }, []);

  const handlePostClick = async (post) => {
    try {
      // Récupérer les détails complets du post
      const response = await apiRequest(`/posts/${post.id}`);
      setPostDetails(response.data);
      setShowPostModal(true);
    } catch (err) {
      console.log(err);
      alert("Erreur lors du chargement des détails de l'annonce");
    }
  };

  const handleBackToList = () => {
    setPostDetails(null);
    setActiveTab("mes-maisons");
  };

  const handleContact = async () => {
    if (!currentUser) return;

    if (currentUser.id === postDetails.userId) {
      alert("Vous ne pouvez pas vous contacter vous-même !");
      return;
    }

    try {
      const response = await apiRequest.post("/chats", {
        receiverId: postDetails.userId
      });

      setOpenChatId(response.data.id);
      setActiveTab("messages");
    } catch (err) {
      console.log(err);
      alert("Erreur lors de l'envoi du message. Veuillez réessayer.");
    }
  };

  const handleSave = async () => {
    if (!currentUser || !postDetails) return;

    setSaved((prev) => !prev);
    try {
      await apiRequest.post("/users/save", { postId: postDetails.id });
    } catch (err) {
      console.log(err);
      setSaved((prev) => !prev);
    }
  };

  const handleDelete = async () => {
    if (!postDetails) return;

    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce post ? Cette action est irréversible.")) {
      try {
        await apiRequest.delete(`/posts/${postDetails.id}`);
        alert("Post supprimé avec succès !");
        setPostDetails(null);
        setActiveTab("accueil");
        setToastMessage("Annonce supprimée avec succès");
        navigate("/profile");
      } catch (err) {
        console.log(err);
        alert("Erreur lors de la suppression du post");
      }
    }
  };

  const handleEdit = () => {
    if (!postDetails) return;
    setShowCreateForm(true);
  };

  const handleProfileUpdate = () => {
    setShowProfileUpdate(true);
    setActiveTab("profile-update");
  };

  const handleBackToDashboard = () => {
    setShowProfileUpdate(false);
    setActiveTab("accueil");
  };

  const handleSaveProfile = async () => {
    if (!selectedPost) return;

    try {
      await apiRequest.post("/user/save", { postId: selectedPost.id });
      setSaved(true);
    } catch (err) {
      console.log(err);
    }
  };

  const handleUnsave = async () => {
    if (!selectedPost) return;

    try {
      await apiRequest.post("/user/unsave", { postId: selectedPost.id });
      setSaved(false);
    } catch (err) {
      console.log(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await apiRequest.post("/posts", formData);
      setShowCreateForm(false);
      setFormData({
        title: "",
        price: "",
        address: "",
        city: "",
        bedroom: "",
        bathroom: "",
        type: "buy",
        property: "apartment",
        utilities: "",
        pet: "",
        income: "",
        size: "",
        school: "",
        bus: "",
        restaurant: "",
        description: "",
        images: []
      });
      navigate("/profile");
    } catch (err) {
      console.log(err);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Vérifier si l'utilisateur est le propriétaire du post
  const isOwner = currentUser && postDetails && currentUser.id === postDetails.userId;

  return (
    <div className="profilePage">
      {/* Inline CSS for mobile sidebar toggle (kept minimal to avoid SCSS edits) */}
      <style>{`
        .headerToggle { display: none; }
        @media (max-width: 738px) {
          .headerToggle { display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; border: 1px solid #eaeaea; border-radius: 8px; background: #f5f5f5; margin-right: 8px; }
          .headerToggle:hover { background: #eaeaea; }
          .profilePage .sidebar { display: none; }
          .profilePage .sidebar.open { display: block; position: fixed; left: 0; top: 0; width: 260px; height: 100vh; z-index: 3000; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
          .profilePage .sidebarOverlay { display: none; }
          .profilePage .sidebarOverlay.active { display: block; position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 2500; }

          /* Ensure title and create button remain visible */
          .profilePage .contentHeader { padding: 12px 16px; gap: 8px; display: flex; flex-wrap: wrap; }
          .profilePage .contentHeader .headerLeft { flex: 1 1 auto; min-width: 0; display: flex; align-items: center; }
          .profilePage .contentHeader .pageTitle { font-size: 18px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
          .profilePage .contentHeader .headerRight { display: flex; align-items: center; gap: 8px; flex: 1 1 100%; justify-content: flex-end; margin-top: 8px; }
          .profilePage .contentHeader .headerRight .createButton { padding: 10px 12px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; color: #111111; background: transparent; border: 1px solid #eaeaea; border-radius: 8px; }
          .profilePage .contentHeader .headerRight .createButton .btnLabel { display: none; }
          .profilePage .contentHeader .headerRight .createButton { padding: 10px; width: 40px; height: 40px; }
          .profilePage .contentHeader .headerRight .createButton svg { width: 22px; height: 22px; display: block; }
          .profilePage .contentHeader .headerRight .createButton svg path,
          .profilePage .contentHeader .headerRight .createButton svg line,
          .profilePage .contentHeader .headerRight .createButton svg circle { stroke: currentColor !important; fill: none !important; stroke-width: 2 !important; }
          .profilePage .contentHeader .headerRight .refreshButton { width: 36px; height: 36px; }
          /* Optionally hide breadcrumb to free space */
          .profilePage .contentHeader .breadcrumb { display: none; }
        }
      `}</style>
      {/* Sidebar */}
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebarHeader">
          <Link to="/" className="logo">
            <div className="logoIcon">
              <img src="/logo.png" alt="Logo" />
            </div>
            Loue chez moi
          </Link>
        </div>

        <div className="sidebarContent">
          <div className="navMenu">
            <button
              className={`navItem ${activeTab === "accueil" ? "active" : ""}`}
              onClick={() => handleTabChange("accueil")}
            >
              <div className="navIcon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="navLabel">Accueil</span>
            </button>

            {currentUser?.isProprietaire && (
              <button
                className={`navItem ${activeTab === "mes-maisons" ? "active" : ""}`}
                onClick={() => handleTabChange("mes-maisons")}
              >
                <div className="navIcon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="navLabel">Mes Maisons</span>
              </button>
            )}

            <button
              className={`navItem ${activeTab === "maisons-sauvees" ? "active" : ""}`}
              onClick={() => handleTabChange("maisons-sauvees")}
            >
              <div className="navIcon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 14C19 14.5304 18.7893 15.0391 18.4142 15.4142C18.0391 15.7893 17.5304 16 17 16H7C6.46957 16 5.96086 15.7893 5.58579 15.4142C5.21071 15.0391 5 14.5304 5 14V6C5 5.46957 5.21071 4.96086 5.58579 4.58579C5.96086 4.21071 6.46957 4 7 4H17C17.5304 4 18.0391 4.21071 18.4142 4.58579C18.7893 4.96086 19 5.46957 19 6V14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="navLabel">Maisons Sauvées</span>
            </button>

            <button
              className={`navItem ${activeTab === "messages" ? "active" : ""}`}
              onClick={() => handleTabChange("messages")}
            >
              <div className="navIcon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="navLabel">Messages</span>
            </button>
          </div>
        </div>

        <div className="userProfile">
          <div className="userInfo">
            <img
              src={currentUser?.avatar || "/noavatar.jpg"}
              alt={currentUser?.username}
              className="userAvatar"
            />
            <div className="userDetails">
              <div className="userName">{currentUser?.username}</div>
              <div className="userEmail">{currentUser?.email}</div>
            </div>
          </div>
          <div className="userActions">
            <button className="updateButton" onClick={handleProfileUpdate}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13M18.5 2.5C18.8978 2.10218 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10218 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10218 21.5 5.5L12 15L8 11L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Modifier le profil</span>
            </button>
            <button className="logoutButton" onClick={handleLogout}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9M16 17L21 12L16 7M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile to close sidebar when clicking outside */}
      <div
        className={`sidebarOverlay ${isSidebarOpen ? 'active' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
        aria-hidden={!isSidebarOpen}
      />

      {/* Main Content */}
      <div className="mainContent">
        <div className="contentHeader">
          {toastMessage && (
            <div className="toast toast--success">
              <div className="toastIcon" aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="toastText">{toastMessage}</div>
              <button className="toastClose" onClick={() => setToastMessage("")} aria-label="Fermer">×</button>
            </div>
          )}
          <div className="headerLeft">
            {/* Mobile toggle button */}
            <button
              type="button"
              className="headerToggle"
              onClick={() => setIsSidebarOpen((v) => !v)}
              aria-label={isSidebarOpen ? "Fermer le menu" : "Ouvrir le menu"}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 6H21M3 12H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <div className="pageTitle">
              {activeTab === "accueil" && "Tableau de bord"}
              {activeTab === "mes-maisons" && "Mes Annonces"}
              {activeTab === "maisons-sauvees" && "Annonces Sauvées"}
              {activeTab === "messages" && "Messages"}
              {activeTab === "profile-update" && "Modifier le Profil"}
              {activeTab === "post-detail" && "Détails de l'annonce"}
            </div>
            <div className="breadcrumb">
              <span>Dashboard</span>
              <span>›</span>
              <span>
                {activeTab === "accueil" && "Accueil"}
                {activeTab === "mes-maisons" && "Mes Annonces"}
                {activeTab === "maisons-sauvees" && "Annonces Sauvées"}
                {activeTab === "messages" && "Messages"}
                {activeTab === "profile-update" && "Modifier le Profil"}
                {activeTab === "post-detail" && "Détails"}
              </span>
            </div>
          </div>
          <div className="headerRight">
            {activeTab === "post-detail" && (
              <button className="backButton" onClick={handleBackToList}>
                ← Retour à la liste
              </button>
            )}
            {currentUser?.isProprietaire && (
              <button
                type="button"
                className="createButton"
                onClick={() => setShowCreateForm(true)}
                aria-label="Créer une nouvelle annonce"
                title="Créer une nouvelle annonce"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="btnLabel">Nouvelle annonce</span>
              </button>
            )}
            <button className="refreshButton">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 12A9 9 0 0 1 12 3A9 9 0 0 1 21 12M21 12A9 9 0 0 1 12 21A9 9 0 0 1 3 12M21 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        <div className="contentBody">
          {/* Modal d'affichage des détails d'annonce */}
          <PostDetailModal
            post={postDetails}
            isOpen={showPostModal}
            onClose={() => { setShowPostModal(false); setPostDetails(null); }}
            onContact={(chatId) => {
              // Ouvre l'onglet messages sur le chat créé
              setOpenChatId(chatId);
              setActiveTab("messages");
              setShowPostModal(false);
            }}
            onSave={() => {
              // Pas d'action spécifique ici; l'API a déjà mis à jour l'état serveur
            }}
            onEdit={(postId) => {
              // Ouvrir le modal d'édition avec les détails déjà chargés
              setShowPostModal(false);
              setShowCreateForm(true);
            }}
            onDelete={() => {
              // Après suppression, fermer le modal et rediriger vers l'accueil du dashboard
              setShowPostModal(false);
              setPostDetails(null);
              setActiveTab("accueil");
              setToastMessage("Annonce supprimée avec succès");
              navigate("/profile");
            }}
          />
          {/* Modal de création d'annonce */}
          <CreatePostModal
            isOpen={showCreateForm}
            onClose={() => setShowCreateForm(false)}
            onSuccess={() => {
              setShowCreateForm(false);
              setActiveTab("accueil");
              setToastMessage("Annonce enregistrée avec succès");
              navigate("/profile");
            }}
            mode={postDetails ? "edit" : "create"}
            post={postDetails}
          />
          {/* Affichage conditionnel selon l'onglet actif */}
          {showProfileUpdate ? (
            <div className="profileUpdateContainer">
              <ProfileUpdatePage />
            </div>
          ) : activeTab === "post-detail" && postDetails ? (
            <div className="postDetailContainer">
              {/* Slider */}
              <div className="sliderSection">
                <Slider images={postDetails.images} />
              </div>

              {/* Contenu en deux colonnes */}
              <div className="contentSection">
                {/* Colonne gauche */}
                <div className="leftColumn">
                  {/* En-tête avec titre et prix */}
                  <div className="header">
                    <h1 className="title">{postDetails.title}</h1>
                    <div className="price">$ {postDetails.price}</div>
                  </div>

                  {/* Adresse */}
                  <div className="address">
                    <img src="/pin.png" alt="Adresse" />
                    <span>{postDetails.address}</span>
                  </div>

                  {/* Informations du propriétaire */}
                  <div className="userInfo">
                    <img src={postDetails.user.avatar || "/noavatar.jpg"} alt={postDetails.user.username} />
                    <div className="userDetails">
                      <span className="username">{postDetails.user.username}</span>
                      <span className="userLabel">Propriétaire</span>
                    </div>
                  </div>

                  {/* Caractéristiques générales */}
                  <div className="featuresSection">
                    <h3>Caractéristiques</h3>
                    <div className="featuresGrid">
                      <div className="featureItem">
                        <img src="/utility.png" alt="Services" />
                        <div className="featureContent">
                          <span className="featureLabel">Services</span>
                          <p className="featureValue">
                            {postDetails.postDetail.utilities === "owner" ? "Propriétaire responsable" : "Locataire responsable"}
                          </p>
                        </div>
                      </div>

                      <div className="featureItem">
                        <img src="/pet.png" alt="Animaux" />
                        <div className="featureContent">
                          <span className="featureLabel">Animaux</span>
                          <p className="featureValue">
                            {postDetails.postDetail.pet === "allowed" ? "Autorisés" : "Non autorisés"}
                          </p>
                        </div>
                      </div>

                      <div className="featureItem">
                        <img src="/fee.png" alt="Revenus" />
                        <div className="featureContent">
                          <span className="featureLabel">Revenus requis</span>
                          <p className="featureValue">{postDetails.postDetail.income}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Boutons d'action */}
                  <div className="actionButtons">
                    {isOwner ? (
                      <>
                        <button className="btn editBtn" onClick={handleEdit}>
                          <img src="/edit.png" alt="Modifier" />
                          Modifier
                        </button>
                        <button className="btn deleteBtn" onClick={handleDelete}>
                          <img src="/delete.png" alt="Supprimer" />
                          Supprimer
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="btn contactBtn" onClick={handleContact}>
                          <img src="/chat.png" alt="Contacter" />
                          Contacter
                        </button>
                        <button
                          className={`btn saveBtn ${saved ? 'saved' : ''}`}
                          onClick={handleSave}
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
                    <div
                      className="descriptionContent"
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(postDetails.postDetail.desc),
                      }}
                    />
                  </div>

                  {/* Dimensions */}
                  <div className="dimensionsSection">
                    <h3>Dimensions</h3>
                    <div className="dimensionsGrid">
                      <div className="dimensionItem">
                        <img src="/size.png" alt="Surface" />
                        <span>{postDetails.postDetail.size} m²</span>
                      </div>
                      <div className="dimensionItem">
                        <img src="/bed.png" alt="Chambres" />
                        <span>{postDetails.bedroom} chambres</span>
                      </div>
                      <div className="dimensionItem">
                        <img src="/bath.png" alt="Salles de bain" />
                        <span>{postDetails.bathroom} salles de bain</span>
                      </div>
                    </div>
                  </div>

                  {/* Lieux à proximité */}
                  <div className="nearbySection">
                    <h3>À proximité</h3>
                    <div className="nearbyGrid">
                      <div className="nearbyItem">
                        <img src="/school.png" alt="École" />
                        <div className="nearbyContent">
                          <span className="nearbyLabel">École</span>
                          <p className="nearbyValue">
                            {postDetails.postDetail.school > 999
                              ? `${postDetails.postDetail.school / 1000} km`
                              : `${postDetails.postDetail.school} m`}
                          </p>
                        </div>
                      </div>

                      <div className="nearbyItem">
                        <img src="/bus.png" alt="Transport" />
                        <div className="nearbyContent">
                          <span className="nearbyLabel">Transport</span>
                          <p className="nearbyValue">{postDetails.postDetail.bus} m</p>
                        </div>
                      </div>

                      <div className="nearbyItem">
                        <img src="/restaurant.png" alt="Restaurant" />
                        <div className="nearbyContent">
                          <span className="nearbyLabel">Restaurant</span>
                          <p className="nearbyValue">{postDetails.postDetail.restaurant} m</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Carte en pleine largeur */}
              <div className="mapSection">
                <h3>Localisation</h3>
                <div className="mapContainer">
                  <Map items={[postDetails]} />
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* ✅ Onglet Accueil */}
              {activeTab === "accueil" && (
                <div className="dashboardOverview">
                  <div className="welcomeSection">
                    <h2>Bienvenue, {currentUser?.username} ! 👋</h2>
                    <p>Voici un aperçu de votre activité immobilière</p>
                  </div>

                  <div className="statsGrid">
                    <Suspense fallback={<div className="loading">Chargement des stats...</div>}>
                      <Await resolve={Promise.all([data.postResponse, data.chatResponse])}>
                        {([postResponse, chatResponse]) => {
                          const myPosts = postResponse?.data?.userPosts || [];
                          const saved = postResponse?.data?.savedPosts || [];
                          const chats = chatResponse?.data || [];
                          return (
                            <>
                              <div className="statCard">
                                <div className="statIcon">
                                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                </div>
                                <div className="statContent">
                                  <div className="statNumber">{myPosts.length}</div>
                                  <div className="statLabel">Mes Annonces</div>
                                  <div className="statChange positive">&nbsp;</div>
                                </div>
                              </div>

                              <div className="statCard">
                                <div className="statIcon">
                                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                </div>
                                <div className="statContent">
                                  <div className="statNumber">{notifNumber}</div>
                                  <div className="statLabel">Messages non lus</div>
                                  <div className="statChange positive">&nbsp;</div>
                                </div>
                              </div>

                              <div className="statCard">
                                <div className="statIcon">
                                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M19 14C19 14.5304 18.7893 15.0391 18.4142 15.4142C18.0391 15.7893 17.5304 16 17 16H7C6.46957 16 5.96086 15.7893 5.58579 15.4142C5.21071 15.0391 5 14.5304 5 14V6C5 5.46957 5.21071 4.96086 5.58579 4.58579C5.96086 4.21071 6.46957 4 7 4H17C17.5304 4 18.0391 4.21071 18.4142 4.58579C18.7893 4.96086 19 5.46957 19 6V14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M9 8H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M9 12H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                </div>
                                <div className="statContent">
                                  <div className="statNumber">{saved.length}</div>
                                  <div className="statLabel">Annonces Sauvées</div>
                                  <div className="statChange positive">&nbsp;</div>
                                </div>
                              </div>
                            </>
                          );
                        }}
                      </Await>
                    </Suspense>
                  </div>

                  <div className="recentActivity">
                    <h3>Activité récente</h3>
                    <div className="activityList">
                      <div className="activityItem">
                        <div className="activityIcon">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <div className="activityContent">
                          <div className="activityText">Nouvelle annonce créée</div>
                          <div className="activityTime">Il y a 2 heures</div>
                        </div>
                      </div>
                      <div className="activityItem">
                        <div className="activityIcon">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <div className="activityContent">
                          <div className="activityText">Nouveau message reçu</div>
                          <div className="activityTime">Il y a 4 heures</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ✅ Mes Maisons Tab */}
              {activeTab === "mes-maisons" && !showCreateForm && (
                showBlankMes ? null : (
                  <Suspense fallback={<div className="loading">Chargement...</div>}>
                    <Await resolve={data.postResponse}>
                      {(postResponse) => <List posts={postResponse.data.userPosts} onPostClick={handlePostClick} />}
                    </Await>
                  </Suspense>
                )
              )}

              {/* ✅ Maisons Sauvées Tab */}
              {activeTab === "maisons-sauvees" && (
                showBlankSaved ? null : (
                  <Suspense fallback={<div className="loading">Chargement...</div>}>
                    <Await resolve={data.postResponse}>
                      {(postResponse) => (
                        <div className="savedPostsContainer">
                          {postResponse.data.savedPosts && postResponse.data.savedPosts.length > 0 ? (
                            <div className="list">
                              {postResponse.data.savedPosts.map((post) => (
                                <Card key={post.id} item={post} onClick={handlePostClick} />
                              ))}
                            </div>
                          ) : (
                            <div className="emptyState emptyState--pro">
                              <div className="emptyIllustration">
                                <div className="illustrationIcon">
                                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M19 14C19 14.5304 18.7893 15.0391 18.4142 15.4142C18.0391 15.7893 17.5304 16 17 16H7C6.46957 16 5.96086 15.7893 5.58579 15.4142C5.21071 15.0391 5 14.5304 5 14V6C5 5.46957 5.21071 4.96086 5.58579 4.58579C5.96086 4.21071 6.46957 4 7 4H17C17.5304 4 18.0391 4.21071 18.4142 4.58579C18.7893 4.96086 19 5.46957 19 6V14Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M9 8H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M9 12H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                </div>
                                <div className="floatingElements">
                                  <div className="floatingDot dot1"></div>
                                  <div className="floatingDot dot2"></div>
                                  <div className="floatingDot dot3"></div>
                                </div>
                              </div>
                              <div className="emptyContent">
                                <h2>Aucun favori pour le moment</h2>
                                <p>Commencez à explorer et sauvegardez vos annonces préférées pour les retrouver facilement ici.</p>
                                <Link to="/" className="exploreButton">
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                  Découvrir les annonces
                                </Link>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </Await>
                  </Suspense>
                )
              )}

              {/* ✅ Messages Tab */}
              {activeTab === "messages" && (
                <Suspense fallback={<div className="loading">Chargement...</div>}>
                  <Await resolve={data.chatResponse}>
                    {(chatResponse) => (
                      <Chat
                        chats={chatResponse.data}
                        openChatId={openChatId}
                        onChatOpen={setOpenChatId}
                      />
                    )}
                  </Await>
                </Suspense>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
