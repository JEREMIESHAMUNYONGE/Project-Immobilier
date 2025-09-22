import "./layout.scss";
import Navbar from "../../components/navbar/Navbar";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

function Layout() {
  return (
    <div className="layout">
      <div className="navbar">
        <Navbar />
      </div>
      <div className="content">
        <Outlet />
      </div>
    </div>
  );
}

function RequireAuth() {
  const { currentUser } = useContext(AuthContext);
  const location = useLocation();

  if (!currentUser) return <Navigate to="/login" />;
  else {
    // Ne pas afficher la navbar sur la page de profil et sur le dashboard admin
    const isProfilePage = location.pathname === "/profile" || location.pathname.startsWith("/profile/");
    const isAdminPage = location.pathname === "/admin" || location.pathname.startsWith("/admin/");
    const hideNavbar = isProfilePage || isAdminPage;

    return (
      <div className="layout">
        {!hideNavbar && (
          <div className="navbar">
            <Navbar />
          </div>
        )}
        <div className={`content ${hideNavbar ? 'full-width' : ''}`}>
          <Outlet />
        </div>
      </div>
    );
  }
}

export { Layout, RequireAuth };
