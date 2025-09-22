import { Server } from "socket.io";

const io = new Server({
  cors: {
    origin: "http://localhost:5173",
  },
});

let onlineUser = [];

const addUser = (userId, socketId) => {
  const userExits = onlineUser.find((user) => user.userId === userId);
  if (!userExits) {
    onlineUser.push({ userId, socketId });
  }
};

const removeUser = (socketId) => {
  onlineUser = onlineUser.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return onlineUser.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  
  socket.on("newUser", (userId) => {
    console.log("New user online:", userId);
    addUser(userId, socket.id);
    console.log("Online users:", onlineUser);
  });

  socket.on("sendMessage", ({ receiverId, data }) => {
    console.log("Sending message to:", receiverId);
    console.log("Message data:", data);
    
    const receiver = getUser(receiverId);
    
    if (receiver) {
      console.log("Receiver found:", receiver);
      // ✅ Envoyer les données complètes du message
      io.to(receiver.socketId).emit("getMessage", {
        ...data,
        chatId: data.chatId || data.chat?.id, // S'assurer que chatId est présent
        userId: data.userId, // S'assurer que userId est présent
        text: data.text,
        createdAt: data.createdAt
      });
    } else {
      console.log("Receiver not found or not online:", receiverId);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    removeUser(socket.id);
    console.log("Remaining users:", onlineUser);
  });
});

const PORT = process.env.PORT || 4000;

io.listen(PORT, () => {
  console.log(`Socket server is running on port ${PORT}!`);
});
