import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function createAdmin() {
    try {
        // Vérifier si un admin existe déjà
        const existingAdmin = await prisma.user.findFirst({
            where: { isAdmin: true }
        });

        if (existingAdmin) {
            console.log("✅ Un administrateur existe déjà:", existingAdmin.email);
            return;
        }

        // Créer l'utilisateur admin
        const hashedPassword = await bcrypt.hash("admin123", 10);

        // Créer l'utilisateur admin
        const admin = await prisma.user.create({
            data: {
                email: "admin@estate.com",
                username: "admin",
                password: hashedPassword, // ← CHANGER ICI
                isAdmin: true,
                avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
            }
        });

        console.log("✅ Administrateur créé avec succès!");
        console.log("📧 Email:", admin.email);
        console.log("👤 Nom d'utilisateur:", admin.username);
        console.log("🔑 Mot de passe: admin123");
        console.log("🔗 URL de connexion: http://localhost:3000/login");

    } catch (error) {
        console.error("❌ Erreur lors de la création de l'admin:", error);
    } finally {
        await prisma.$disconnect();
    }
}

createAdmin();
