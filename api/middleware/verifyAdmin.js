import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const verifyAdmin = async (req, res, next) => {
    try {
        // Si l'information isAdmin est déjà dans la requête (ajoutée par verifyToken)
        if (req.isAdmin === true) {
            return next();
        }
        
        // Sinon, vérifier dans la base de données
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            select: { isAdmin: true }
        });

        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        if (!user.isAdmin) {
            return res.status(403).json({ message: "Accès refusé. Droits administrateur requis." });
        }

        next();
    } catch (error) {
        console.error("Erreur:", error);
        res.status(500).json({ message: "Erreur lors de la vérification des droits administrateur" });
    }
};
