import { Link } from "react-router-dom";
import "./chatList.css";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

const ChatList = () => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);
  const queryClient = useQueryClient();

  const { isPending, error, data } = useQuery({
    queryKey: ["userChats"],
    queryFn: () =>
      fetch(`${import.meta.env.VITE_API_URL}/api/userchats`, {
        credentials: "include",
      }).then((res) => res.json()),
  });

  const deleteMutation = useMutation({
    mutationFn: (chatId) =>
      fetch(`${import.meta.env.VITE_API_URL}/api/chats/${chatId}`, {
        method: "DELETE",
        credentials: "include",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["userChats"]);
      setShowConfirmation(false);
      setChatToDelete(null);
    },
  });

  const handleDelete = (e, chatId) => {
    e.preventDefault(); // Prevent the Link from being activated
    setChatToDelete(chatId);
    setShowConfirmation(true);
  };

  const confirmDelete = () => {
    if (chatToDelete) {
      deleteMutation.mutate(chatToDelete);
    }
  };

  const cancelDelete = () => {
    setShowConfirmation(false);
    setChatToDelete(null);
  };

  return (
    <div className="chatList">
      <span className="title">DASHBOARD</span>
      <Link to="/dashboard">Create a new Chat</Link>
      <Link to="/">Explore VEGA</Link>
      <Link to="/">Contact</Link>
      <hr />
      <span className="title">RECENT CHATS</span>
      <div className="list">
        {isPending
          ? "Loading..."
          : error
          ? "Something went wrong!"
          : data?.map((chat) => (
              <div key={chat._id} className="chat-item">
                <Link to={`/dashboard/chats/${chat._id}`}>
                  {chat.title}
                </Link>
                <button className="delete-btn" onClick={(e) => handleDelete(e, chat._id)}>
                  🗑️
                </button>
              </div>
            ))}
      </div>
      <hr />
      <div className="upgrade">
        <img src="/logo.png" alt="" />
        <div className="texts">
          <span>Upgrade to VEGA Pro</span>
          <span>Get unlimited access to all features</span>
        </div>
      </div>
      {showConfirmation && (
        <div className="confirmation-modal">
          <p>Are you sure you want to delete this chat?</p>
          <button onClick={confirmDelete}>Confirm</button>
          <button onClick={cancelDelete}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default ChatList;