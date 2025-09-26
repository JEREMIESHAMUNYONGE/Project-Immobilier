import jwt from "jsonwebtoken";

export const verifyToken = async (req, res, next) => {
  try {
    // Vérifier d'abord dans les cookies
    const cookieToken = req.cookies?.token;
    
    // Vérifier ensuite dans les en-têtes (pour la compatibilité avec les API)
    const headerToken = req.header("Authorization")?.replace("Bearer ", "");
    
    // Utiliser le token du cookie ou de l'en-tête
    const token = cookieToken || headerToken;

    if (!token) {
      return res.status(401).json({ message: "Token d'accès requis" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.userId = decoded.id;
    req.isAdmin = decoded.isAdmin; // Ajouter l'information isAdmin à la requête
    req.isProprietaire = decoded.isProprietaire === true; // Propager le rôle propriétaire
    next();
  } catch (error) {
    console.error("Erreur de vérification du token:", error);
    res.status(401).json({ message: "Token invalide" });
  }
};