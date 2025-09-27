import React from "react";

function DeleteUserModal({ open, user, isDeleting, onCancel, onConfirm }) {
  if (!open || !user) return null;
  return (
    <div
      className="deleteModal"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel?.(); }}
      aria-modal="true"
      role="dialog"
    >
      <div className="modalContent">
        <div className="modalHeader">
          <h3>
            <span style={{color:'#9b0000'}}>⚠</span>
            Confirmer la suppression
          </h3>
          <button className="closeButton" onClick={onCancel} title="Fermer">✕</button>
        </div>
        <div className="modalBody">
          <div className="userMini">
            <img src={user.avatar || '/default-avatar.png'} alt={user.username} />
            <div>
              <div style={{fontWeight:800}}>{user.username}</div>
              <div style={{color:'#666', fontSize:12}}>{user.email}</div>
            </div>
          </div>
          <p>Cette action supprimera définitivement:</p>
          <ul>
            <li>{user.postsCount || 0} annonces</li>
            <li>{user.savedPostsCount || 0} favoris</li>
            <li>{user.messagesCount || 0} messages</li>
          </ul>
          <div className="warning">Cette action est irréversible.</div>
        </div>
        <div className="modalFooter">
          <button className="cancelButton" onClick={onCancel} disabled={isDeleting}>Annuler</button>
          <button className="confirmDeleteButton" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? 'Suppression…' : 'Supprimer définitivement'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteUserModal;
