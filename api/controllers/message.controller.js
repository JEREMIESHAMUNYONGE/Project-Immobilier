import prisma from "../lib/prisma.js";

export const addMessage = async (req, res) => {
  const tokenUserId = req.userId;
  const chatId = req.params.chatId;
  const text = req.body.text;

  if (!text || text.trim() === "") {
    return res.status(400).json({ message: "Message text is required!" });
  }

  try {
    const chat = await prisma.chat.findUnique({
      where: {
        id: chatId,
        userIDs: {
          hasSome: [tokenUserId],
        },
      },
    });

    if (!chat) return res.status(404).json({ message: "Chat not found!" });

    const message = await prisma.message.create({
      data: {
        text: text.trim(),
        chatId,
        userId: tokenUserId,
      },
    });

    await prisma.chat.update({
      where: {
        id: chatId,
      },
      data: {
        seenBy: {
          set: [tokenUserId],
        },
        lastMessage: text.trim(),
      },
    });

    // ✅ Inclure chatId dans la réponse pour Socket
    res.status(200).json({
      ...message,
      chatId: chatId // Ajouter chatId pour Socket
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to add message!" });
  }
};
