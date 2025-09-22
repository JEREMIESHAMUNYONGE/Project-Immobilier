import { useRouteError, isRouteErrorResponse, Link } from "react-router-dom";

export default function ErrorPage() {
  const error = useRouteError();
  let title = "Une erreur est survenue";
  let message = "Veuillez réessayer plus tard.";
  let status = 500;

  if (isRouteErrorResponse(error)) {
    status = error.status;
    try {
      const data = typeof error.data === 'string' ? JSON.parse(error.data) : error.data;
      title = data?.title || (status === 404 ? "Ressource introuvable" : title);
      message = data?.message || message;
    } catch {
      // ignore parse error
    }
  } else if (error && typeof error === 'object') {
    message = error.message || message;
  }

  return (
    <div style={{
      minHeight: '70vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: 560,
        background: '#fff',
        border: '1px solid #eaeaea',
        borderRadius: 12,
        padding: 24,
        boxShadow: '0 10px 30px rgba(0,0,0,0.06)'
      }}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10}}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, background: '#fee2e2',
            display: 'grid', placeItems: 'center', color: '#b91c1c', fontWeight: 700
          }}>!</div>
          <h1 style={{margin: 0, fontSize: 20}}>{title}</h1>
        </div>
        <div style={{ color: '#6b7280', marginBottom: 16 }}>
          {message} {status ? `(code ${status})` : null}
        </div>
        <div style={{display: 'flex', gap: 10}}>
          <button onClick={() => window.location.reload()} style={{
            padding: '10px 14px', borderRadius: 10, border: '1px solid #eaeaea', background: '#fff', cursor: 'pointer', fontWeight: 600
          }}>Réessayer</button>
          <Link to="/" style={{
            padding: '10px 14px', borderRadius: 10, border: '1px solid #000', background: '#000', color: '#fff', textDecoration: 'none', fontWeight: 600
          }}>Accueil</Link>
          <Link to="/profile" style={{
            padding: '10px 14px', borderRadius: 10, border: '1px solid #eaeaea', background: '#fff', textDecoration: 'none', color: '#111', fontWeight: 600
          }}>Tableau de bord</Link>
        </div>
      </div>
    </div>
  );
}
