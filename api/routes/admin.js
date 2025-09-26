import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { verifyAdmin } from "../middleware/verifyAdmin.js";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

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
                isProprietaire: true,
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

export default router;

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

        const userPosts = await prisma.post.findMany({ where: { userId: id }, select: { id: true } });
        const postIds = userPosts.map(p => p.id);
        if (postIds.length > 0) {
            await prisma.postDetail.deleteMany({ where: { postId: { in: postIds } } });
        }
        await prisma.post.deleteMany({ where: { id: { in: postIds } } });

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
                isProprietaire: true,
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

// Obtenir TOUTES les infos d'un utilisateur (profil, annonces, favoris, discussions + messages)
router.get("/users/:id/full", async (req, res) => {
    try {
        const { id } = req.params;

        // Profil utilisateur de base + stats
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                username: true,
                avatar: true,
                isAdmin: true,
                isProprietaire: true,
                createdAt: true,
                _count: {
                    select: {
                        posts: true,
                        savedPosts: true,
                        chats: true,
                    },
                },
            },
        });

        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        // Annonces de l'utilisateur
        const posts = await prisma.post.findMany({
            where: { userId: id },
            include: {
                postDetail: true,
            },
            orderBy: { createdAt: "desc" },
        });

        // Favoris (maisons sauvegardées)
        const saved = await prisma.savedPost.findMany({
            where: { userId: id },
            include: {
                post: {
                    include: { postDetail: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });
        const savedPosts = saved.map((s) => s.post);

        // Discussions + messages
        const chats = await prisma.chat.findMany({
            where: { userIDs: { hasSome: [id] } },
            include: {
                messages: {
                    orderBy: { createdAt: "asc" },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        // Ajouter info du correspondant pour chaque chat
        for (const chat of chats) {
            const otherId = chat.userIDs.find((uid) => uid !== id);
            if (otherId) {
                const other = await prisma.user.findUnique({
                    where: { id: otherId },
                    select: { id: true, username: true, avatar: true, email: true },
                });
                chat.receiver = other;
            }
        }

        res.status(200).json({
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                avatar: user.avatar,
                isAdmin: user.isAdmin,
                isProprietaire: user.isProprietaire,
                createdAt: user.createdAt,
                postsCount: user._count.posts,
                savedPostsCount: user._count.savedPosts,
                messagesCount: user._count.chats,
            },
            posts,
            savedPosts,
            chats,
        });
    } catch (error) {
        console.error("Erreur lors de la récupération complète de l'utilisateur:", error);
        res.status(500).json({ message: "Erreur lors de la récupération des données complètes de l'utilisateur" });
    }
});

// Créer un compte propriétaire (réservé à l'admin)
router.post("/users", async (req, res) => {
  try {
    const { username, email, password, isProprietaire } = req.body || {};

    if (!username || !email || !password) {
      return res.status(400).json({ message: "username, email et password sont requis" });
    }

    // Vérifier si l'utilisateur existe déjà
    const existing = await prisma.user.findFirst({
      where: { OR: [{ username }, { email }] },
      select: { id: true }
    });
    if (existing) {
      return res.status(400).json({ message: "Nom d'utilisateur ou email déjà utilisé" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const created = await prisma.user.create({
      data: {
        username,
        email,
        password: hashed,
        isAdmin: false,
        isProprietaire: isProprietaire === true ? true : true // par défaut: propriétaire
      },
      select: { id: true, username: true, email: true, isAdmin: true, isProprietaire: true, createdAt: true }
    });

    res.status(201).json({ message: "Compte propriétaire créé", user: created });
  } catch (error) {
    console.error("Erreur création compte propriétaire:", error);
    res.status(500).json({ message: "Erreur lors de la création du compte propriétaire" });
  }
});
