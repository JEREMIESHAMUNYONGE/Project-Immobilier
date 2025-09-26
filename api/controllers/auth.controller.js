import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";

export const register = async (req, res) => {
  const { username, email, password } = req.body;

  // Validation des données
  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters!" });
  }

  try {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ message: "Username or email already exists!" });
    }

    // HASH THE PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    // CREATE A NEW USER AND SAVE TO DB
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        isAdmin: false, // for public registration
        isProprietaire: false, // public signup -> locataire by default
      },
    });

    const { password: userPassword, ...userInfo } = newUser;

    res.status(201).json({ message: "User created successfully", user: userInfo });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to create user!" });
  }
};

export const login = async (req, res) => {
  console.log("Tentative de connexion avec:", req.body);
  // Supporter username OU email comme identifiant et nettoyer les espaces
  const identifierRaw = (req.body?.username ?? req.body?.email ?? "").toString();
  const username = identifierRaw.trim();
  const { password } = req.body;

  // Validation des données
  if (!username || !password) {
    console.log("Erreur: username ou password manquant", { username, password });
    return res.status(400).json({ message: "Username and password are required!" });
  }

  try {
    console.log("Recherche de l'utilisateur avec identifiant:", username);
    // CHECK IF THE USER EXISTS (by username OR email)
    const user = await prisma.user.findFirst({
      where: {
        OR: [ { username }, { email: username } ]
      },
      select: {
        id: true,
        username: true,
        email: true,
        password: true,
        isAdmin: true,
        isProprietaire: true,
        avatar: true,
        createdAt: true
      }
    });

    if (!user) {
      console.log("Login échoué: utilisateur introuvable pour =>", username);
      return res.status(400).json({ message: "Invalid Credentials!" });
    }

    // CHECK IF THE PASSWORD IS CORRECT
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log("Login échoué: mot de passe invalide pour utilisateur =>", user.username || user.email);
      return res.status(400).json({ message: "Invalid Credentials!" });
    }

    // GENERATE COOKIE TOKEN AND SEND TO THE USER
    const age = 1000 * 60 * 60 * 24 * 7; // 7 jours

    if (!process.env.JWT_SECRET_KEY) {
      console.error("JWT_SECRET_KEY is not defined. Please set it in your .env file.");
    }

    const token = jwt.sign(
      {
        id: user.id,
        isAdmin: user.isAdmin,
        isProprietaire: user.isProprietaire,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '7d' }
    );

    const { password: userPassword, ...userInfo } = user;

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: age,
      })
      .status(200)
      .json(userInfo);
  } catch (err) {
    console.log("Erreur serveur pendant le login:", err);
    res.status(500).json({ message: "Failed to login!" });
  }
};

export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax"
  }).status(200).json({ message: "Logout Successful" });
};
