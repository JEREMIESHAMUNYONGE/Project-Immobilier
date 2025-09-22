import { useContext, useState, useEffect } from "react";
import "./postDetailModal.scss";
import Slider from "../slider/Slider";
import DOMPurify from "dompurify";
import { AuthContext } from "../../context/AuthContext";
import apiRequest from "../../lib/apiRequest";

function PostDetailModal({ post, isOpen, onClose, onContact, onSave, onEdit, onDelete }) {
    const [saved, setSaved] = useState(post?.isSaved || false);
    const { currentUser } = useContext(AuthContext);
    const [deleting, setDeleting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        if (post) {
            setSaved(post.isSaved || false);
        }
    }, [post]);

    if (!isOpen || !post) return null;

    const handleSave = async () => {
        if (!currentUser) return;

        setSaved((prev) => !prev);
        try {
            await apiRequest.post("/users/save", { postId: post.id });
            onSave && onSave(post.id, !saved);
        } catch (err) {
            console.log(err);
            setSaved((prev) => !prev);
        }
    };

    const handleContact = async () => {
        if (!currentUser) return;

        if (currentUser.id === post.userId) {
            alert("Vous ne pouvez pas vous contacter vous-même !");
            return;
        }

        try {
            const response = await apiRequest.post("/chats", {
                receiverId: post.userId
            });

            onContact && onContact(response.data.id, post.user);
        } catch (err) {
            console.log(err);
            alert("Erreur lors de l'envoi du message. Veuillez réessayer.");
        }
    };

    const handleDelete = async () => {
        if (deleting) return;
        setDeleting(true);
        try {
            await apiRequest.delete(`/posts/${post.id}`);
            onDelete && onDelete(post.id);
            onClose();
        } catch (err) {
            console.log(err);
            alert("Erreur lors de la suppression de l'annonce. Veuillez réessayer.");
        } finally {
            setDeleting(false);
            setShowConfirm(false);
        }
    };

    const handleEdit = () => {
        onEdit && onEdit(post.id);
    };

    // Vérifier si l'utilisateur est le propriétaire
    const isOwner = currentUser && currentUser.id === post.userId;

    return (
        <div className="postDetailModal">
            <div className="modalOverlay" onClick={onClose}></div>
            <div className="modalContent">
                <button className="closeButton" onClick={onClose}>
                    ✕
                </button>

                {/* Contenu en deux colonnes: Image à gauche, texte à droite */}
                <div className="contentSection">
                    {/* Colonne gauche - Média (images) */}
                    <div className="leftColumn">
                        <div className="media">
                            <Slider images={post.images} />
                        </div>

                        {/* Sections sous l'image: Description et À proximité */}
                        <div className="mediaInfo">
                            {/* Résumé: Propriétaire + Commune/Prix */}
                            <div className="summaryRow">
                                {/* Propriétaire */}
                                <div className="ownerCard">
                                    <div className="userInfo">
                                        <img src={post.user.avatar || "/noavatar.jpg"} alt={post.user.username} />
                                        <div className="userDetails">
                                            <span className="username">{post.user.username}</span>
                                            <span className="userLabel">Propriétaire</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Commune (adresse) au-dessus et prix en bas */}
                                <div className="infoCard">
                                    <div className="commune">
                                        <img src="/pin.png" alt="Adresse" />
                                        <span>{post.address}</span>
                                    </div>
                                    <div className="price">$ {post.price}</div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="description">
                                <h3>Description</h3>
                                <div
                                    className="descriptionContent"
                                    dangerouslySetInnerHTML={{
                                        __html: DOMPurify.sanitize(post.postDetail.desc),
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Colonne droite - Texte */}
                    <div className="rightColumn">
                        {/* En-tête avec titre et prix */}
                        <div className="header">
                            <h1 className="title">{post.title}</h1>
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
                                            {post.postDetail.utilities === "owner" ? "Propriétaire responsable" : "Locataire responsable"}
                                        </p>
                                    </div>
                                </div>

                                <div className="featureItem">
                                    <img src="/pet.png" alt="Animaux" />
                                    <div className="featureContent">
                                        <span className="featureLabel">Animaux</span>
                                        <p className="featureValue">
                                            {post.postDetail.pet === "allowed" ? "Autorisés" : "Non autorisés"}
                                        </p>
                                    </div>
                                </div>

                                <div className="featureItem">
                                    <img src="/fee.png" alt="Revenus" />
                                    <div className="featureContent">
                                        <span className="featureLabel">Revenus requis</span>
                                        <p className="featureValue">{post.postDetail.income}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Dimensions */}
                        <div className="dimensionsSection">
                            <h3>Dimensions</h3>
                            <div className="dimensionsGrid">
                                <div className="dimensionItem">
                                    <img src="/size.png" alt="Surface" />
                                    <span>{post.postDetail.size} m²</span>
                                </div>
                                <div className="dimensionItem">
                                    <img src="/bed.png" alt="Chambres" />
                                    <span>{post.bedroom} chambres</span>
                                </div>
                                <div className="dimensionItem">
                                    <img src="/bath.png" alt="Salles de bain" />
                                    <span>{post.bathroom} salles de bain</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Localisation section removed as per request */}

                {/* Boutons d'action après la carte */}
                <div className="actionButtonsSection">
                    <div className="actionButtons">
                        {isOwner ? (
                            <>
                                <button className="btn editBtn" onClick={handleEdit} aria-label="Modifier l'annonce">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 20h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M16.5 3.5a2.121 2.121 0 013 3L8 18l-4 1 1-4 11.5-11.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    Modifier
                                </button>
                                <button className="btn deleteBtn" onClick={() => setShowConfirm(true)} aria-label="Supprimer l'annonce" disabled={deleting} aria-busy={deleting}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    {deleting ? "Suppression..." : "Supprimer"}
                                </button>
                            </>
                        ) : (
                            <>
                                <button className="btn contactBtn" onClick={handleContact} aria-label="Contacter le propriétaire">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    Contacter
                                </button>
                                <button
                                    className={`btn saveBtn ${saved ? 'saved' : ''}`}
                                    onClick={handleSave}
                                    aria-label={saved ? 'Retirer des favoris' : 'Sauvegarder'}
                                >
                                    {saved ? (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                                        </svg>
                                    ) : (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}
                                    {saved ? "Sauvegardé" : "Sauvegarder"}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {showConfirm && (
                <div className="confirmOverlay" role="dialog" aria-modal="true">
                    <div className="confirmCard">
                        <div className="confirmHeader">
                            <div className="confirmIcon">!</div>
                            <h3>Supprimer l'annonce ?</h3>
                        </div>
                        <p className="confirmText">Cette action est irréversible. Êtes-vous sûr de vouloir continuer ?</p>
                        <div className="confirmActions">
                            <button className="btn lightBtn" onClick={() => setShowConfirm(false)} disabled={deleting}>Annuler</button>
                            <button className="btn dangerBtn" onClick={handleDelete} disabled={deleting} aria-busy={deleting}>
                                {deleting ? "Suppression..." : "Supprimer"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PostDetailModal;
