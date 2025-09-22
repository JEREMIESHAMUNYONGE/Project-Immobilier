import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { verifyAdmin } from "../middleware/verifyAdmin.js";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// Middleware pour vérifier que l'utilisateur est admin
router.use(verifyToken);
router.use(verifyAdmin);

// Récupérer tous les utilisateurs avec leurs statistiques
router.get("/users", async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                username: true,
                avatar: true,
                isAdmin: true,
                createdAt: true,
                _count: {
                    select: {
                        posts: true,
                        savedPosts: true,
                        chats: true
                    }
                }
            }
        });

        // Transformer les données pour correspondre au frontend
        const usersWithStats = users.map(user => ({
            id: user.id,
            email: user.email,
            username: user.username,
            avatar: user.avatar,
            isAdmin: user.isAdmin,
            createdAt: user.createdAt,
            postsCount: user._count.posts,
            savedPostsCount: user._count.savedPosts,
            messagesCount: user._count.chats
        }));

        res.status(200).json(usersWithStats);
    } catch (error) {
        console.error("Erreur:", error);
        res.status(500).json({ message: "Erreur lors de la récupération des utilisateurs" });
    }
});

// Supprimer un utilisateur et toutes ses données
router.delete("/users/:id", async (req, res) => {
    try {
        const { id } = req.params;

        // Vérifier que l'utilisateur existe
        const user = await prisma.user.findUnique({
            where: { id: id }
        });

        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        // Vérifier qu'on ne supprime pas un autre admin
        if (user.isAdmin) {
            return res.status(403).json({ message: "Impossible de supprimer un administrateur" });
        }

            // Supprimer toutes les données liées à l'utilisateur (séquentiellement pour compatibilité Mongo sans transactions)
        await prisma.message.deleteMany({
            where: {
                OR: [
                    { userId: id },
                    { chat: { userIDs: { has: id } } }
                ]
            }
        });

        await prisma.chat.deleteMany({
            where: { userIDs: { has: id } }
        });

        await prisma.savedPost.deleteMany({
            where: { userId: id }
        });

        await prisma.post.deleteMany({
            where: { userId: id }
        });

        await prisma.user.delete({
            where: { id: id }
        });

        res.status(200).json({ message: "Utilisateur supprimé avec succès" });
    } catch (error) {
        console.error("Erreur lors de la suppression de l'utilisateur:", {
            message: error?.message,
            code: error?.code,
            meta: error?.meta,
            stack: error?.stack
        });
        res.status(500).json({ message: "Erreur lors de la suppression de l'utilisateur" });
    }
});

// Obtenir les détails d'un utilisateur
router.get("/users/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const user = await prisma.user.findUnique({
            where: { id: id },
            select: {
                id: true,
                email: true,
                username: true,
                avatar: true,
                isAdmin: true,
                createdAt: true,
                _count: {
                    select: {
                        posts: true,
                        savedPosts: true,
                        chats: true
                    }
                }
            }
        });

        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        const userWithStats = {
            ...user,
            postsCount: user._count.posts,
            savedPostsCount: user._count.savedPosts,
            messagesCount: user._count.chats
        };

        res.status(200).json(userWithStats);
    } catch (error) {
        console.error("Erreur:", error);
        res.status(500).json({ message: "Erreur lors de la récupération des détails de l'utilisateur" });
    }
});

export default router;
