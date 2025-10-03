import React from "react";

function UsersTable({ users, onView, onDelete }) {
  if (!Array.isArray(users)) return null;
  return (
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

      {users.length === 0 && (
        <div className="tableRow"><div className="muted">Aucun utilisateur trouvé…</div></div>
      )}

      {users.map((user) => (
        <div key={user.id} className="tableRow" title={`ID: ${user.id}`}>
          <div className="userCell">
            <img
              src={user.avatar || "noavatar.jpg"}
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
            <button className="btn view" onClick={() => onView(user)} title="Voir le profil">Voir</button>
            <button
              className="btn delete"
              onClick={() => onDelete(user)}
              disabled={user.isAdmin}
              title={user.isAdmin ? 'Impossible de supprimer un admin' : 'Supprimer cet utilisateur'}
            >Supprimer</button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default UsersTable;
