import React from "react";
import "./chatList.css";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const ChatList = ({ selectedChatId, setSelectedChatId }) => {
  const queryClient = useQueryClient();

  const { data: chats, isLoading, error } = useQuery(["userchats"], () =>
    fetch(`${import.meta.env.VITE_API_URL}/api/userchats`, {
      credentials: "include",
    }).then((res) => res.json())
  );

  const deleteMutation = useMutation({
    mutationFn: (chatId) => {
      return fetch(`${import.meta.env.VITE_API_URL}/api/chats/${chatId}`, {
        method: "DELETE",
        credentials: "include",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["userchats"]);
    },
  });

  const handleDelete = (chatId) => {
    deleteMutation.mutate(chatId);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading chats</div>;

  return (
    <div className="chatList">
      {chats.map((chat) => (
        <div
          key={chat._id}
          className={`chatItem ${
            selectedChatId === chat._id ? "selected" : ""
          }`}
          onClick={() => setSelectedChatId(chat._id)}
        >
          <div className="chatTitle">{chat.title}</div>
          <button onClick={() => handleDelete(chat._id)}>Delete</button>
        </div>
      ))}
    </div>
  );
};

export default ChatList;
