import { useState, useEffect, useContext } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import AdminUserDetailModal from "../../components/adminUserDetailModal/AdminUserDetailModal.jsx";
import "./admin.scss";
import apiRequest from "../../lib/apiRequest";
import { AuthContext } from "../../context/AuthContext";
import { format } from "timeago.js";

function Admin() {
  const { currentUser, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("accueil");
  const [showViewModal, setShowViewModal] = useState(false);
  const [userFull, setUserFull] = useState(null);
  const [loadingFull, setLoadingFull] = useState(false);
  const [activeUserTab, setActiveUserTab] = useState("profil"); // profil | annonces | favoris | messages
  // Pagination & recherche pour la modale
  const [postsPage, setPostsPage] = useState(1);
  const [postsPageSize] = useState(6);
  const [favsPage, setFavsPage] = useState(1);
  const [favsPageSize] = useState(6);
  const [chatsPage, setChatsPage] = useState(1);
  const [chatsPageSize] = useState(5);
  const [msgSearch, setMsgSearch] = useState("");

  // Guard: only admins can access this page
  if (currentUser && !currentUser.isAdmin) {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiRequest.get("/admin/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs:", error);
    } finally {
      setLoading(false);
    }
  };

  // Gestion clavier pour la modale: Echap pour fermer, Entrée pour confirmer
  useEffect(() => {
    if (!showDeleteModal) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setShowDeleteModal(false);
      if (e.key === 'Enter' && selectedUser && !isDeleting) {
        confirmDelete();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showDeleteModal, selectedUser, isDeleting]);

  const confirmDelete = async () => {
    if (!selectedUser) return;
    try {
      setIsDeleting(true);
      await handleDeleteUser(selectedUser.id);
    } finally {
      setIsDeleting(false);
    }
  };

  const openViewModal = async (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
    setActiveUserTab("profil");
    setUserFull(null);
    setPostsPage(1);
    setFavsPage(1);
    setChatsPage(1);
    setMsgSearch("");
    try {
      setLoadingFull(true);
      const res = await apiRequest.get(`/admin/users/${user.id}/full`);
      setUserFull(res.data);
    } catch (e) {
      console.error("Erreur chargement détails utilisateur:", e);
      const msg = e?.response?.data?.message || "Impossible de charger les détails";
      showToast(msg, "error");
      // Ne pas fermer la modale; afficher l'erreur dans la modale
      setUserFull({ error: msg });
    } finally {
      setLoadingFull(false);
    }
  };

  // Reset pagination à chaque changement d'onglet
  useEffect(() => {
    setPostsPage(1);
    setFavsPage(1);
    setChatsPage(1);
  }, [activeUserTab]);

  const handleLogout = async () => {
    try {
      await apiRequest.post("/auth/logout");
      updateUser(null);
      navigate("/");
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const url = `/admin/users/${userId}`;
      await apiRequest.delete(url);
      setUsers((prev) => prev.filter((user) => user.id !== userId));
      setShowDeleteModal(false);
      setSelectedUser(null);
      const deletedName = selectedUser?.username || "Utilisateur";
      showToast(`${deletedName} supprimé avec succès`, "success", 4000);
    } catch (error) {
      console.error("Erreur lors de la suppression:", {
        status: error?.response?.status,
        data: error?.response?.data,
        message: error?.message,
      });
      const msg = error?.response?.data?.message || error?.response?.data?.error || error?.message || "Erreur inconnue";
      showToast(msg, "error", 4000);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedUsers = filteredUsers.sort((a, b) => {
    if (sortOrder === "asc") {
      return a[sortBy] > b[sortBy] ? 1 : -1;
    } else {
      return a[sortBy] < b[sortBy] ? 1 : -1;
    }
  });

  // KPIs
  const totalUsers = users.length;
  const totalAdmins = users.filter((u) => u.isAdmin).length;
  const totalPosts = users.reduce((acc, u) => acc + (u.postsCount || 0), 0);
  const totalMessages = users.reduce(
    (acc, u) => acc + (u.messagesCount || 0),
    0
  );
  const newUsers7d = users.filter((u) => {
    try {
      const d = new Date(u.createdAt);
      return Date.now() - d.getTime() < 7 * 24 * 60 * 60 * 1000;
    } catch {
      return false;
    }
  }).length;

  const recentUsers = [...users]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6);

  const handleExportCSV = () => {
    try {
      const headers = [
        "id",
        "username",
        "email",
        "isAdmin",
        "createdAt",
        "postsCount",
        "savedPostsCount",
        "messagesCount",
      ];
      const rows = users.map((u) =>
        [
          u.id,
          JSON.stringify(u.username || ""),
          JSON.stringify(u.email || ""),
          u.isAdmin,
          u.createdAt,
          u.postsCount || 0,
          u.savedPostsCount || 0,
          u.messagesCount || 0,
        ].join(",")
      );
      const csv = [headers.join(","), ...rows].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `users_export_${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Export CSV échoué", e);
      showToast("Export CSV échoué", "error");
    }
  };

  const showToast = (message, type = "success", duration = 4000) => {
    setToast({ visible: true, message, type });
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast({ visible: false, message: "", type }), duration);
  };

  if (loading) {
    return (
      <div className="adminPage">
        <div className="adminLoading">
          <div className="loadingSpinner"></div>
          <p>Chargement des utilisateurs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="adminPage">
      {/* Sidebar */}
      <div className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
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
              className={`navItem ${
                activeTab === "accueil" ? "active" : ""
              }`}
              onClick={() => setActiveTab("accueil")}
            >
              Accueil
            </button>
            <button
              className={`navItem ${
                activeTab === "utilisateurs" ? "active" : ""
              }`}
              onClick={() => setActiveTab("utilisateurs")}
            >
              Utilisateurs
            </button>
            <button
              className={`navItem ${
                activeTab === "annonces" ? "active" : ""
              }`}
              onClick={() => setActiveTab("annonces")}
            >
              Annonces
            </button>
            <button
              className={`navItem ${
                activeTab === "messages" ? "active" : ""
              }`}
              onClick={() => setActiveTab("messages")}
            >
              Messages
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
              <span className="userRole">Admin</span>
            </div>
          </div>
          <div className="userActions">
            <Link to="/profile/update" className="updateButton">
              Modifier le profil
            </Link>
            <button className="logoutButton" onClick={handleLogout}>
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      {/* Overlay mobile */}
      <div
        className={`sidebarOverlay ${isSidebarOpen ? "active" : ""}`}
        onClick={() => setIsSidebarOpen(false)}
        aria-hidden={!isSidebarOpen}
      />

      {/* Contenu principal */}
      <div className="mainContent">
        {/* Styles inline pour embellir la page d’accueil */}
        <style>{`
          /* Layout overrides: sidebar plein écran sans marges/arrondis */
          .adminPage { display: block !important; padding: 0 !important; margin: 0 !important; }
          .adminPage .sidebar {
            position: fixed !important; left: 0 !important; top: 0 !important; bottom: 0 !important;
            width: 280px !important; height: 100vh !important; margin: 0 !important;
            border-radius: 0 !important; box-shadow: none !important;
          }
          .adminPage .mainContent { margin-left: 280px !important; padding: 16px 24px; }

          .mainContent { display: flex; flex-direction: column; gap: 16px; }
          .adminWelcome {
            display: flex; align-items: center; justify-content: space-between; gap: 12px;
            padding: 16px 20px; background: #fff; border: 1px solid #eaeaea; border-radius: 0;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05); margin: 0;
          }
          .adminWelcome .text h2 { margin: 0 0 6px 0; font-size: 20px; font-weight: 700; color: #111; }
          .adminWelcome .text p { margin: 0; color: #666; }
          .adminWelcome .actions { display: flex; gap: 8px; flex-wrap: wrap; }
          .adminWelcome .actions .btn {
            display: inline-flex; align-items: center; gap: 8px; padding: 10px 12px; border-radius: 0;
            border: 1px solid #111; background: #111; color: #fff; cursor: pointer; font-weight: 600;
            transition: all .18s ease;
          }
          .adminWelcome .actions .btn.secondary { background: #fff; color: #111; }
          .adminWelcome .actions .btn:hover { transform: translateY(-1px); }
          .adminWelcome .actions .btn.secondary:hover { background: #f5f5f5; }

          .adminStats {
            display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px;
          }
          .adminStats .statCard {
            background: #fff; border: 1px solid #eaeaea; border-radius: 0; padding: 16px;
            display: flex; align-items: center; gap: 12px; transition: box-shadow .18s ease, transform .18s ease; margin: 0;
          }
          .adminStats .statCard:hover { box-shadow: 0 10px 24px rgba(0,0,0,0.08); transform: translateY(-2px); }
          .adminStats .statIcon {
            width: 44px; height: 44px; border-radius: 0; background: #f5f5f5; display: grid; place-items: center; color: #111;
          }
          .adminStats .statContent h3 { margin: 0 0 4px 0; font-size: 24px; font-weight: 700; color: #111; }
          .adminStats .statContent p { margin: 0; color: #666; font-size: 13px; }
          
          /* ---- Styles tableau utilisateurs ---- */
          .adminContent { background: #fff; border: 1px solid #eaeaea; padding: 12px; }
          .adminFilters { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 8px 8px 16px; border-bottom: 1px solid #f0f0f0; }
          .adminFilters input[type="text"] { flex: 1; min-width: 240px; background: #f7f7f7; border: 1px solid #eaeaea; padding: 10px 12px; outline: none; }
          .adminFilters input[type="text"]:focus { border-color: #111; background: #fff; }
          
          .usersTable { width: 100%; }
          .usersTable .tableHeader { 
            display: grid; grid-template-columns: 1.6fr 1.4fr 1fr 0.8fr 0.8fr 0.8fr 1fr; 
            gap: 12px; padding: 12px; background: #fafafa; border: 1px solid #f0f0f0; font-weight: 700; color: #333; 
            position: sticky; top: 0; z-index: 1;
          }
          .usersTable .tableRow { 
            display: grid; grid-template-columns: 1.6fr 1.4fr 1fr 0.8fr 0.8fr 0.8fr 1fr; gap: 12px; padding: 14px 12px; 
            border-bottom: 1px solid #f5f5f5; align-items: center; transition: background .18s ease; 
          }
          .usersTable .tableRow:hover { background: #fafafa; }
          .usersTable .tableRow:nth-child(even) { background: #fcfcfc; }
          .usersTable .tableRow > div { color: #222; font-size: 14px; }
          .usersTable .tableRow .muted { color: #666; }

          /* cellule utilisateur enrichie */
          .usersTable .userCell { display: flex; align-items: center; gap: 10px; }
          .usersTable .userCell .avatar { width: 32px; height: 32px; background: #e9e9e9; display: block; border-radius: 50%; }
          .usersTable .userCell .name { font-weight: 700; color: #111; }
          .usersTable .userCell .role { font-size: 12px; color: #555; padding: 2px 6px; border: 1px solid #ddd; }
          
          .usersTable .actions { display: flex; gap: 8px; justify-content: flex-start; }
          .usersTable .actions .btn { 
            display: inline-flex; align-items: center; justify-content: center; height: 32px; padding: 0 10px; 
            border: 1px solid #e0e0e0; background: #fff; color: #111; cursor: pointer; transition: all .18s ease; border-radius: 0; font-weight: 600; font-size: 12px;
          }
          .usersTable .actions .btn:hover { background: #f5f5f5; }
          .usersTable .actions .btn.view { color: #333; }
          .usersTable .actions .btn.delete { color: #d40000; border-color: #ffd6d6; }
          .usersTable .actions .btn.delete:hover { background: #ffecec; }
          .usersTable .actions .btn:disabled { opacity: .5; cursor: not-allowed; }
          
          /* Modal suppression (amélioration visuelle légère) */
          .deleteModal { position: fixed; inset: 0; background: rgba(0,0,0,.45); display: flex; align-items: center; justify-content: center; z-index: 9999; }
          .deleteModal .modalContent { background: #fff; width: 92%; max-width: 520px; border: 1px solid #eaeaea; padding: 16px; }
          .deleteModal .modalHeader { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
          .deleteModal .modalHeader h3 { margin: 0; font-size: 18px; font-weight: 800; color: #111; display: inline-flex; align-items: center; gap: 8px; }
          .deleteModal .modalHeader .closeButton { border: 1px solid #e0e0e0; background: #fff; width: 32px; height: 32px; display: grid; place-items: center; cursor: pointer; }
          .deleteModal .modalBody { color: #333; }
          .deleteModal .userMini { display: flex; align-items: center; gap: 10px; padding: 10px; background: #fafafa; border: 1px solid #f0f0f0; }
          .deleteModal .userMini img { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; border: 1px solid #e0e0e0; }
          .deleteModal .warning { margin-top: 10px; color: #9b0000; background: #fff5f5; border: 1px solid #ffd6d6; padding: 10px; font-weight: 700; }
          .deleteModal .modalFooter { display: flex; gap: 8px; justify-content: flex-end; margin-top: 12px; }
          .deleteModal .modalFooter .cancelButton { border: 1px solid #e0e0e0; background: #fff; padding: 8px 12px; font-weight: 700; cursor: pointer; }
          .deleteModal .modalFooter .confirmDeleteButton { border: 1px solid #ffd6d6; background: #ffeded; color: #9b0000; padding: 8px 12px; font-weight: 800; cursor: pointer; }
          .deleteModal .modalFooter .confirmDeleteButton[disabled] { opacity: .6; cursor: not-allowed; }
        `}</style>

        {activeTab === "accueil" && (
          <>
            <div className="adminWelcome">
              <div className="text">
                <h2>Tableau de bord</h2>
                <p>Vue d’ensemble de l’activité de la plateforme</p>
              </div>
              <div className="actions">
                <button className="btn" onClick={handleExportCSV}>Exporter les utilisateurs (CSV)</button>
                <Link to="/profile" className="btn secondary">Mon profil</Link>
              </div>
            </div>

            <div className="adminStats">
              <div className="statCard">
                <div className="statIcon">👥</div>
                <div className="statContent">
                  <h3>{totalUsers}</h3>
                  <p>Utilisateurs</p>
                </div>
              </div>
              <div className="statCard">
                <div className="statIcon">🏠</div>
                <div className="statContent">
                  <h3>{totalPosts}</h3>
                  <p>Annonces</p>
                </div>
              </div>
              <div className="statCard">
                <div className="statIcon">💬</div>
                <div className="statContent">
                  <h3>{totalMessages}</h3>
                  <p>Messages</p>
                </div>
              </div>
              <div className="statCard">
                <div className="statIcon">✨</div>
                <div className="statContent">
                  <h3>{newUsers7d}</h3>
                  <p>Nouveaux (7j)</p>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === "utilisateurs" && (
          <>
            <div className="adminHero">
              <h2>Bienvenue, {currentUser?.username} !</h2>
              <button onClick={handleExportCSV}>Exporter CSV</button>
            </div>

            <div className="adminContent">
              <div className="adminFilters">
                <input
                  type="text"
                  placeholder="Rechercher un utilisateur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="usersTable" id="usersTable">
                <div className="tableHeader">
                  <div>Utilisateur</div>
                  <div>Email</div>
                  <div>Inscription</div>
                  <div>Annonces</div>
                  <div>Favoris</div>
                  <div>Messages</div>
                  <div>Actions</div>
                </div>

                {sortedUsers.length === 0 && (
                  <div className="tableRow"><div className="muted">Aucun utilisateur trouvé…</div></div>
                )}
                {sortedUsers.map((user) => (
                  <div key={user.id} className="tableRow" title={`ID: ${user.id}`}>
                    <div className="userCell">
                      <img
                        src={user.avatar || "/default-avatar.png"}
                        alt={user.username}
                        className="avatar"
                        style={{ border: '1px solid #e0e0e0', objectFit: 'cover' }}
                      />
                      <div>
                        <div className="name">{user.username}</div>
                        <span className="role">{user.isAdmin ? 'Admin' : 'Utilisateur'}</span>
                      </div>
                    </div>
                    <div className="muted">{user.email}</div>
                    <div className="muted">{new Date(user.createdAt).toLocaleDateString("fr-FR")}</div>
                    <div>{user.postsCount || 0}</div>
                    <div>{user.savedPostsCount || 0}</div>
                    <div>{user.messagesCount || 0}</div>
                    <div className="actions">
                      <button className="btn view" onClick={() => openViewModal(user)} title="Voir le profil">Voir</button>
                      <button
                        className="btn delete"
                        onClick={() => { setSelectedUser(user); setShowDeleteModal(true); }}
                        disabled={user.isAdmin}
                        title={user.isAdmin ? 'Impossible de supprimer un admin' : 'Supprimer cet utilisateur'}
                      >Supprimer</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal de suppression améliorée */}
      {showDeleteModal && selectedUser && (
        <div
          className="deleteModal"
          onClick={(e) => { if (e.target === e.currentTarget) setShowDeleteModal(false); }}
          aria-modal="true"
          role="dialog"
        >
          <div className="modalContent">
            <div className="modalHeader">
              <h3>
                <span style={{color:'#9b0000'}}>⚠</span>
                Confirmer la suppression
              </h3>
              <button className="closeButton" onClick={() => setShowDeleteModal(false)} title="Fermer">✕</button>
            </div>
            <div className="modalBody">
              <div className="userMini">
                <img src={selectedUser.avatar || '/default-avatar.png'} alt={selectedUser.username} />
                <div>
                  <div style={{fontWeight:800}}>{selectedUser.username}</div>
                  <div style={{color:'#666', fontSize:12}}>{selectedUser.email}</div>
                </div>
              </div>
              <p>Cette action supprimera définitivement:</p>
              <ul>
                <li>{selectedUser.postsCount || 0} annonces</li>
                <li>{selectedUser.savedPostsCount || 0} favoris</li>
                <li>{selectedUser.messagesCount || 0} messages</li>
              </ul>
              <div className="warning">Cette action est irréversible.</div>
            </div>
            <div className="modalFooter">
              <button className="cancelButton" onClick={() => setShowDeleteModal(false)} disabled={isDeleting}>Annuler</button>
              <button className="confirmDeleteButton" onClick={confirmDelete} disabled={isDeleting}>
                {isDeleting ? 'Suppression…' : 'Supprimer définitivement'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de vue détaillée utilisateur (nouveau composant) */}
      <AdminUserDetailModal
        open={!!showViewModal && !!selectedUser}
        user={selectedUser}
        onClose={() => setShowViewModal(false)}
      />
    </div>
  );
}

export default Admin;
