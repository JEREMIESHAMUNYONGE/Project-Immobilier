import { useContext, useEffect, useRef, useState } from "react";
import "./chat.scss";
import { AuthContext } from "../../context/AuthContext";
import apiRequest from "../../lib/apiRequest";
import { format } from "timeago.js";
import { SocketContext } from "../../context/SocketContext";
import { useNotificationStore } from "../../lib/notificationStore";

function Chat({ chats, openChatId, onChatOpen }) {
  console.log(chats);
  
  const [chat, setChat] = useState(null);
  const { currentUser } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);

  const messageEndRef = useRef();
  const decrease = useNotificationStore((state) => state.decrease);

  // ✅ Ouvrir automatiquement un chat spécifique
  useEffect(() => {
    if (openChatId && chats) {
      const targetChat = chats.find(c => c.id === openChatId);
      if (targetChat) {
        handleOpenChat(targetChat.id, targetChat.receiver);
        onChatOpen && onChatOpen(null); // Reset l'ID après ouverture
      }
    }
  }, [openChatId, chats]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const handleOpenChat = async (id, receiver) => {
    try {
      const res = await apiRequest("/chats/" + id);
      if (!res.data.seenBy.includes(currentUser.id)) {
        decrease();
      }
      setChat({ ...res.data, receiver });
    } catch (err) {
      console.log(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const text = formData.get("text");

    if (!text) return;
    try {
      const res = await apiRequest.post("/messages/" + chat.id, { text });
      setChat((prev) => ({ ...prev, messages: [...prev.messages, res.data] }));
      e.target.reset();
      socket.emit("sendMessage", {
        receiverId: chat.receiver.id,
        data: res.data,
      });
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const read = async () => {
      try {
        await apiRequest.put("/chats/read/" + chat.id);
      } catch (err) {
        console.log(err);
      }
    };

    if (chat && socket) {
      socket.on("getMessage", (data) => {
        console.log("Message reçu via Socket:", data);
        if (chat.id === data.chatId) {
          // ✅ S'assurer que le message a la bonne structure
          const messageWithId = {
            ...data,
            id: data.id || Date.now(), // Fallback si pas d'ID
            userId: data.userId || data.senderId, // Fallback pour userId
            createdAt: data.createdAt || new Date().toISOString()
          };
          
          setChat((prev) => ({ 
            ...prev, 
            messages: [...prev.messages, messageWithId] 
          }));
          read();
        }
      });
    }
    return () => {
      socket.off("getMessage");
    };
  }, [socket, chat]);

  return (
    <div className="chat">
      <div className="messages">
        <h2 className="messagesTitle">Messages</h2>
        {chats?.map((c) => {
          const isActive = chat?.id === c.id;
          const isRead = c.seenBy.includes(currentUser.id);
          return (
            <div
              className={`message ${isActive ? "active" : ""} ${!isRead && !isActive ? "unread" : ""}`}
              key={c.id}
              onClick={() => handleOpenChat(c.id, c.receiver)}
            >
              <img src={c.receiver.avatar || "/noavatar.jpg"} alt="Avatar" />
              <div className="messageContent">
                <span className="username">{c.receiver.username}</span>
                <p className="lastMessage">{c.lastMessage}</p>
              </div>
            </div>
          );
        })}
      </div>
      {chat && (
        <div className="chatBox">
          <div className="top">
            <div className="user">
              <img src={chat.receiver.avatar || "/noavatar.jpg"} alt="Avatar" />
              <span className="username">{chat.receiver.username}</span>
            </div>
            <button className="close" onClick={() => setChat(null)} aria-label="Fermer la conversation">
              ✕
            </button>
          </div>
          <div className="center">
            {chat.messages.map((message) => {
              const isOwn = message.userId === currentUser.id;
              return (
                <div
                  className={`chatMessage ${isOwn ? "own" : ""}`}
                  key={message.id}
                >
                  <p className="bubble">{message.text}</p>
                  <span className="time">{format(message.createdAt)}</span>
                </div>
              );
            })}
            <div ref={messageEndRef}></div>
          </div>
          <form onSubmit={handleSubmit} className="bottom">
            <textarea name="text" placeholder="Tapez votre message..."></textarea>
            <button type="submit" className="sendButton">Envoyer</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Chat;
