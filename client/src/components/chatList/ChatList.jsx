import React from 'react';
import { Link } from 'react-router-dom';
import './chatList.css';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const ChatList = ({ chats }) => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (chatId) => {
      console.log(`Deleting chat with ID: ${chatId}`);
      return fetch(`${import.meta.env.VITE_API_URL}/api/chats/${chatId}`, {
        method: 'DELETE',
        credentials: 'include',
      }).then((res) => res.json());
    },
    onSuccess: () => {
      console.log('Chat deleted successfully');
      queryClient.invalidateQueries('chats');
    },
    onError: (err) => {
      console.error('Error deleting chat:', err);
    },
  });

  const handleDelete = (chatId) => {
    console.log(`Handling delete for chat ID: ${chatId}`);
    deleteMutation.mutate(chatId);
  };

  return (
    <div className="chatList">
      <hr />
      <div className="title">RECENT CHATS</div>
      <div className="list">
        {chats.map((chat) => (
          <div key={chat._id} className="chatItem">
            <Link to={`/chat/${chat._id}`}>{chat.title}</Link>
            <span className="deleteIcon" onClick={() => handleDelete(chat._id)}>🗑️</span>
          </div>
        ))}
      </div>
      <div className="upgrade">
        <img src="/logo.png" alt="Upgrade" />
        <div className="texts">
          <span>Upgrade to VEGA Pro</span>
          <span>Get unlimited access to all features</span>
        </div>
      </div>
    </div>
  );
};

export default ChatList;
