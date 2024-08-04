import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import chat from '../lib/gemini';

const ChatSession = () => {
  const [message, setMessage] = useState('');
  const [stage, setStage] = useState('initial');
  const [botResponse, setBotResponse] = useState('');
  const queryClient = useQueryClient();

  const { data: chatSession, isLoading, error } = useQuery({
    queryKey: ['chatSession'],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chat-session`, {
        credentials: 'include',
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} ${response.statusText}. Details: ${errorText}`);
      }
      return response.json();
    },
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
    onSuccess: () => {
      queryClient.invalidateQueries(['chatSession']);
    },
  });

  useEffect(() => {
    if (chatSession) {
      if (!chatSession.companyName) {
        setStage('askName');
        setBotResponse("Hello, what is the name of your company?");
      } else if (!chatSession.companyBrief) {
        setStage('askBrief');
        setBotResponse("Please write a brief about your company, its business model, and how it operates.");
      } else {
        setStage('mainMenu');
        setBotResponse("How can I assist you today?\na) Create an irresistible offer/sales funnel\nb) Price optimization for your products\nc) Data analytics for your uploaded CSV file");
      }
    }
  }, [chatSession]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (stage === 'askName') {
      mutation.mutate({ companyName: message });
      setStage('askBrief');
    } else if (stage === 'askBrief') {
      mutation.mutate({ companyBrief: message });
      setStage('mainMenu');
    } else {
      // Use Gemini to generate a response based on the conversation history
      const history = chatSession.history || [];
      const newHistory = [...history, { role: 'user', parts: [{ text: message }] }];
      
      try {
        const result = await chat.sendMessageStream(newHistory);
        let accumulatedText = '';
        for await (const chunk of result.stream) {
          accumulatedText += chunk.text();
        }
        setBotResponse(accumulatedText);
        
        // Update the conversation history
        mutation.mutate({ history: newHistory });
      } catch (error) {
        console.error('Error generating response:', error);
        setBotResponse('I apologize, but I encountered an error. Please try again.');
      }
    }
    setMessage('');
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>An error occurred: {error.message}</div>;

  return (
    <div>
      <div>{botResponse}</div>
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