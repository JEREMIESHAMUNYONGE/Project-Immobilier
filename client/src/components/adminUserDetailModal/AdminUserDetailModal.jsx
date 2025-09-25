import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import apiRequest from "../../lib/apiRequest";
import "./adminUserDetailModal.scss";

export default function AdminUserDetailModal({ open, user, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("profil");

  // Pagination & recherche
  const [postsPage, setPostsPage] = useState(1);
  const postsPageSize = 6;
  const [favsPage, setFavsPage] = useState(1);
  const favsPageSize = 6;
  const [chatsPage, setChatsPage] = useState(1);
  const chatsPageSize = 5;
  const [msgSearch, setMsgSearch] = useState("");

  useEffect(() => {
    if (!open || !user?.id) return;
    setActiveTab("profil");
    setPostsPage(1); setFavsPage(1); setChatsPage(1); setMsgSearch("");
    setData(null);
    setError("");
    setLoading(true);
    apiRequest.get(`/admin/users/${user.id}/full`)
      .then(res => setData(res.data))
      .catch(e => {
        const msg = e?.response?.data?.message || "Impossible de charger les détails";
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [open, user?.id]);

  useEffect(() => {
    // reset pagination on tab change
    setPostsPage(1); setFavsPage(1); setChatsPage(1);
  }, [activeTab]);

  const filteredChats = useMemo(() => {
    const q = msgSearch.trim().toLowerCase();
    if (!data?.chats) return [];
    if (!q) return data.chats;
    return data.chats.filter(c => {
      const receiverName = (c.receiver?.username || '').toLowerCase();
      const inReceiver = receiverName.includes(q);
      const inMessages = (c.messages || []).some(m => (m.text || '').toLowerCase().includes(q));
      return inReceiver || inMessages;
    });
  }, [data, msgSearch]);

  if (!open) return null;

  const userInfo = data?.user || user || {};

  return (
    <div className="audm-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}>
      <div className="audm-modal" role="dialog" aria-modal="true">
        <div className="audm-header">
          <div className="audm-title">
            <img src={userInfo?.avatar || "/noavatar.jpg"} alt={userInfo?.username} />
            <div>
              <h3>{userInfo?.username || "Utilisateur"}</h3>
              <p>{userInfo?.email || ""}</p>
            </div>
          </div>
          <button className="audm-close" onClick={onClose} aria-label="Fermer">✕</button>
        </div>

        <div className="audm-body">
          <aside className="audm-aside">
            <div className="audm-kpis">
              <div className="kpi"><span>Annonces</span><strong>{userInfo?.postsCount ?? 0}</strong></div>
              <div className="kpi"><span>Favoris</span><strong>{userInfo?.savedPostsCount ?? 0}</strong></div>
              <div className="kpi"><span>Messages</span><strong>{userInfo?.messagesCount ?? 0}</strong></div>
            </div>
            <div className="audm-meta">
              <div><span>Inscription</span><strong>{userInfo?.createdAt ? new Date(userInfo.createdAt).toLocaleDateString('fr-FR') : '-'}</strong></div>
              <div><span>Rôle</span><strong>{userInfo?.isAdmin ? 'Admin' : 'Utilisateur'}</strong></div>
              <div><span>ID</span><code className="audm-id">{userInfo?.id || '-'}</code></div>
            </div>
          </aside>

          <main className="audm-content">
            <div className="audm-tabs">
              {['profil','annonces','favoris','messages'].map(t => (
                <button key={t} className={`tab ${activeTab===t ? 'active':''}`} onClick={()=>setActiveTab(t)}>
                  {t[0].toUpperCase()+t.slice(1)}
                </button>
              ))}
            </div>

            {loading && (
              <div className="audm-loading">Chargement…</div>
            )}

            {!loading && error && (
              <div className="audm-error">Erreur: {error}</div>
            )}

            {!loading && !error && activeTab === 'profil' && (
              <div className="audm-panel">
                <div className="audm-profile-grid">
                  <div>
                    <h4>Informations</h4>
                    <ul className="audm-list">
                      <li><span>Nom d'utilisateur</span><strong>{userInfo?.username || '-'}</strong></li>
                      <li><span>Email</span><strong>{userInfo?.email || '-'}</strong></li>
                      <li><span>Rôle</span><strong>{userInfo?.isAdmin ? 'Admin' : 'Utilisateur'}</strong></li>
                      <li><span>Inscription</span><strong>{userInfo?.createdAt ? new Date(userInfo.createdAt).toLocaleString('fr-FR') : '-'}</strong></li>
                    </ul>
                  </div>
                  <div>
                    <h4>Statistiques</h4>
                    <ul className="audm-list">
                      <li><span>Annonces</span><strong>{userInfo?.postsCount ?? 0}</strong></li>
                      <li><span>Favoris</span><strong>{userInfo?.savedPostsCount ?? 0}</strong></li>
                      <li><span>Messages</span><strong>{userInfo?.messagesCount ?? 0}</strong></li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {!loading && !error && activeTab === 'annonces' && (
              <div className="audm-panel">
                {(!data?.posts || data.posts.length===0) && <div className="audm-empty">Aucune annonce</div>}
                <div className="audm-cards">
                  {data?.posts?.slice((postsPage-1)*postsPageSize, postsPage*postsPageSize).map(p => (
                    <div key={p.id} className="audm-card">
                      <div className="title">{p.title}</div>
                      <div className="sub">{p.city} • {p.price} €</div>
                      <div className="desc">{p?.postDetail?.desc?.slice(0,160) || ''}{(p?.postDetail?.desc?.length||0) > 160 ? '…' : ''}</div>
                      <div className="meta">Créée le {new Date(p.createdAt).toLocaleDateString('fr-FR')}</div>
                      <Link to={`/post/${p.id}`} className="link">Ouvrir</Link>
                    </div>
                  ))}
                </div>
                {data?.posts && data.posts.length > postsPageSize && (
                  <div className="audm-pagination">
                    <button disabled={postsPage===1} onClick={()=>setPostsPage(p=>Math.max(1,p-1))}>Précédent</button>
                    <span>Page {postsPage} / {Math.ceil(data.posts.length/postsPageSize)}</span>
                    <button disabled={postsPage>=Math.ceil(data.posts.length/postsPageSize)} onClick={()=>setPostsPage(p=>p+1)}>Suivant</button>
                  </div>
                )}
              </div>
            )}

            {!loading && !error && activeTab === 'favoris' && (
              <div className="audm-panel">
                {(!data?.savedPosts || data.savedPosts.length===0) && <div className="audm-empty">Aucun favori</div>}
                <div className="audm-cards">
                  {data?.savedPosts?.slice((favsPage-1)*favsPageSize, favsPage*favsPageSize).map(p => (
                    <div key={p.id} className="audm-card">
                      <div className="title">{p.title}</div>
                      <div className="sub">{p.city} • {p.price} €</div>
                      <div className="desc">{p?.postDetail?.desc?.slice(0,160) || ''}{(p?.postDetail?.desc?.length||0) > 160 ? '…' : ''}</div>
                      <Link to={`/post/${p.id}`} className="link">Ouvrir</Link>
                    </div>
                  ))}
                </div>
                {data?.savedPosts && data.savedPosts.length > favsPageSize && (
                  <div className="audm-pagination">
                    <button disabled={favsPage===1} onClick={()=>setFavsPage(p=>Math.max(1,p-1))}>Précédent</button>
                    <span>Page {favsPage} / {Math.ceil(data.savedPosts.length/favsPageSize)}</span>
                    <button disabled={favsPage>=Math.ceil(data.savedPosts.length/favsPageSize)} onClick={()=>setFavsPage(p=>p+1)}>Suivant</button>
                  </div>
                )}
              </div>
            )}

            {!loading && !error && activeTab === 'messages' && (
              <div className="audm-panel">
                <div className="audm-toolbar">
                  <div className="title">Discussions</div>
                  <input
                    type="text"
                    placeholder="Rechercher (contact ou texte du message)"
                    value={msgSearch}
                    onChange={(e)=>{ setMsgSearch(e.target.value); setChatsPage(1); }}
                  />
                </div>
                {filteredChats.length === 0 && <div className="audm-empty">Aucun message</div>}
                <div className="audm-chats">
                  {filteredChats.slice((chatsPage-1)*chatsPageSize, chatsPage*chatsPageSize).map(c => (
                    <div key={c.id} className="audm-chat">
                      <div className="head">
                        <img src={c.receiver?.avatar || '/noavatar.jpg'} alt={c.receiver?.username} />
                        <div className="name">{c.receiver?.username || 'Utilisateur'}</div>
                        <div className="last">{c.lastMessage ? `Dernier: ${c.lastMessage}` : ''}</div>
                      </div>
                      <div className="messages">
                        {c.messages?.map(m => (
                          <div key={m.id} className="msg">
                            <span className="from">{m.userId === (userInfo?.id) ? (userInfo?.username || 'Moi') : (c.receiver?.username || 'Autre')}:</span>
                            <span className="text">{m.text}</span>
                            <span className="time">{new Date(m.createdAt).toLocaleString('fr-FR')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                {filteredChats.length > chatsPageSize && (
                  <div className="audm-pagination">
                    <button disabled={chatsPage===1} onClick={()=>setChatsPage(p=>Math.max(1,p-1))}>Précédent</button>
                    <span>Page {chatsPage} / {Math.ceil(filteredChats.length/chatsPageSize)}</span>
                    <button disabled={chatsPage>=Math.ceil(filteredChats.length/chatsPageSize)} onClick={()=>setChatsPage(p=>p+1)}>Suivant</button>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
