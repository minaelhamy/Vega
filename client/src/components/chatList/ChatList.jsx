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

  const handleDelete = (chatId) => {
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
      {/* ... existing code ... */}
      <div className="list">
        {isPending
          ? "Loading..."
          : error
          ? "Something went wrong!"
          : data?.map((chat) => (
              <div key={chat._id} className="chat-item">
                <Link to={`/dashboard/chats/${chat._id}`}>{chat.title}</Link>
                <button className="delete-btn" onClick={() => handleDelete(chat._id)}>
                  🗑️
                </button>
              </div>
            ))}
      </div>
      {showConfirmation && (
        <div className="confirmation-modal">
          <p>Are you sure you want to delete this chat?</p>
          <button onClick={confirmDelete}>Confirm</button>
          <button onClick={cancelDelete}>Cancel</button>
        </div>
      )}
      {/* ... existing code ... */}
    </div>
  );
};

export default ChatList;