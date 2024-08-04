import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';

const ChatSession = () => {
  const [message, setMessage] = useState('');
  const [stage, setStage] = useState('initial');

  const { data: chatSession, isLoading, error } = useQuery({
    queryKey: ['chatSession'],
    queryFn: () =>
      fetch(`${import.meta.env.VITE_API_URL}/api/chat-session`, {
        credentials: 'include',
      }).then((res) => res.json()),
  });

  const mutation = useMutation({
    mutationFn: (updatedSession) =>
      fetch(`${import.meta.env.VITE_API_URL}/api/chat-session`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedSession),
      }).then((res) => res.json()),
  });

  useEffect(() => {
    if (chatSession) {
      if (!chatSession.companyName) {
        setStage('askName');
      } else if (!chatSession.companyBrief) {
        setStage('askBrief');
      } else {
        setStage('mainMenu');
      }
    }
  }, [chatSession]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (stage === 'askName') {
      mutation.mutate({ companyName: message });
      setStage('askBrief');
    } else if (stage === 'askBrief') {
      mutation.mutate({ companyBrief: message });
      setStage('mainMenu');
    }
    setMessage('');
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>An error occurred: {error.message}</div>;

  return (
    <div>
      {stage === 'askName' && <h2>Hello, what is the name of your company?</h2>}
      {stage === 'askBrief' && <h2>Please write a brief about your company, its business model, and how it operates.</h2>}
      {stage === 'mainMenu' && (
        <div>
          <h2>How can I assist you today?</h2>
          <ul>
            <li>a) Create an irresistible offer/sales funnel</li>
            <li>b) Price optimization for your products</li>
            <li>c) Data analytics for your uploaded CSV file</li>
          </ul>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message here"
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default ChatSession;