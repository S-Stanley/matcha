import "../CSS/Message.css";
import { useNavigate } from "react-router-dom";

const conversations = [
  {
    id: 1,
    name: "Emma",
    avatar: "https://i.pravatar.cc/150?img=32",
    lastMessage: "Salut 😄 ça va ?",
  },
  {
    id: 2,
    name: "Lucas",
    avatar: "https://i.pravatar.cc/150?img=12",
    lastMessage: "On se voit quand ?",
  },
  {
    id: 3,
    name: "Sarah",
    avatar: "https://i.pravatar.cc/150?img=47",
    lastMessage: "Haha trop drôle 😂",
  },
  {
    id: 4,
    name: "TEST",
    avatar: "https://i.pravatar.cc/150?img=47",
    lastMessage: "Haha trop drôle 😂",
  },
];

function Message() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/");
  };

  const openConversation = (id) => {
    navigate(`/messages/${id}`);
  };

  return (
    <div className="message-container">

        <div className="message-content">
            <div className="message">
            {conversations.map((conv) => (
                <div
                key={conv.id}
                className="conversation-item"
                onClick={() => openConversation(conv.id)}
                >
                <img
                    src={conv.avatar}
                    alt={conv.name}
                    className="conversation-avatar"
                />

                <div className="conversation-info">
                    <p className="conversation-name">{conv.name}</p>
                    <p className="conversation-last">{conv.lastMessage}</p>
                </div>
                </div>
            ))}
            </div>
        </div>
    </div>
  );
}

export default Message;
