import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

// Charge les variables d'environnement depuis .env
dotenv.config();

const prisma = new PrismaClient();

async function resetAdminPassword() {
  const NEW_PASSWORD = "admin123";
  try {
    console.log("🔐 Réinitialisation du mot de passe pour l'utilisateur admin...");

    const admin = await prisma.user.findFirst({
      where: { OR: [{ username: "admin" }, { email: "admin@estate.com" }] },
      select: { id: true, username: true, email: true }
    });

    if (!admin) {
      console.log("❌ Utilisateur admin introuvable. Assurez-vous qu'il existe dans la base pointée par DATABASE_URL.");
      process.exit(1);
    }

    const hashed = await bcrypt.hash(NEW_PASSWORD, 10);

    await prisma.user.update({
      where: { id: admin.id },
      data: { password: hashed }
    });

    console.log("✅ Mot de passe réinitialisé avec succès pour:", admin.username || admin.email);
    console.log("➡️  Nouveau mot de passe:", NEW_PASSWORD);
  } catch (err) {
    console.error("❌ Erreur lors de la réinitialisation:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminPassword();
