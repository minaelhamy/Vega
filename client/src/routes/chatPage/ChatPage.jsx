import "./chatPage.css";
import NewPrompt from "../../components/newPrompt/NewPrompt";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import Markdown from "react-markdown";
import { IKImage } from "imagekitio-react";
import ChatList from '../../components/chatList/ChatList';
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

const ChatPage = () => {
  const { chatId } = useParams();
  const [chats, setChats] = useState([]);

  const handleDelete = async (id) => {
    await fetch(`${import.meta.env.VITE_API_URL}/api/chats/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    setChats(chats.filter(chat => chat._id !== id));
  };

  return (
    <div className="chatPage">
      <div className="wrapper">
        <div className="chat">
          <ChatList chats={chats} onDelete={handleDelete} />
          <NewPrompt chatId={chatId} />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;