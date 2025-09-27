import React from "react";
import { Link } from "react-router-dom";

function AdminDashboard({ totalUsers, totalPosts, totalMessages, newUsers7d, onExportCSV }) {
  return (
    <>
      <div className="adminWelcome">
        <div className="text">
          <h2>Tableau de bord</h2>
          <p>Vue d’ensemble de l’activité de la plateforme</p>
        </div>
        <div className="actions">
          <button className="btn" onClick={onExportCSV}>Exporter les utilisateurs (CSV)</button>
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
  );
}

export default AdminDashboard;
