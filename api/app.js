import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv"; // Ajout de l'import de dotenv
import authRoute from "./routes/auth.route.js";
import postRoute from "./routes/post.route.js";
import testRoute from "./routes/test.route.js";
import userRoute from "./routes/user.route.js";
import chatRoute from "./routes/chat.route.js";
import messageRoute from "./routes/message.route.js";
import adminRoute from "./routes/admin.js"; // ← AJOUTER CETTE LIGNE

dotenv.config(); // Ajout de la configuration de dotenv au début

const app = express();

app.use(cors({ 
  origin: process.env.CLIENT_URL || "http://localhost:5173", 
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
})); 
console.log("CORS configuré pour:", process.env.CLIENT_URL || "http://localhost:5173");

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);
app.use("/api/test", testRoute);
app.use("/api/chats", chatRoute);
app.use("/api/messages", messageRoute);
app.use("/api/admin", adminRoute); // ← AJOUTER CETTE LIGNE

app.listen(8800, () => {
  console.log("Server is running!");
});