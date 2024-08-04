import { useState, useEffect } from "react";
import "./newPrompt.css";
import Upload from "../upload/Upload";
import { IKImage } from "imagekitio-react";
import chat from "../../lib/gemini";
import Markdown from "react-markdown";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import ChatSession from "../ChatSession";

const NewPrompt = ({ data }) => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [img, setImg] = useState({
    isLoading: false,
    error: "",
    dbData: {},
    aiData: {},
  });

  const { data: chatSession } = useQuery({
    queryKey: ['chatSession'],
    queryFn: () =>
      fetch(`${import.meta.env.VITE_API_URL}/api/chat-session`, {
        credentials: 'include',
      }).then((res) => res.json()),
  });

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => {
      return fetch(`${import.meta.env.VITE_API_URL}/api/chats/${data._id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: question.length ? question : undefined,
          answer,
          img: img.dbData?.filePath || undefined,
        }),
      }).then((res) => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat", data._id] });
      queryClient.invalidateQueries({ queryKey: ['chatSession'] });
    },
  });

  const add = async (text) => {
    setQuestion(text);

    try {
      const context = `Company: ${chatSession?.companyName}\nBrief: ${chatSession?.companyBrief}\n\nPrevious conversation:\n${data.history.map(m => `${m.role}: ${m.parts[0].text}`).join('\n')}\n\nCurrent question: ${text}`;
      
      const result = await chat.sendMessageStream([context]);
      let accumulatedText = "";
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        accumulatedText += chunkText;
        setAnswer(accumulatedText);
      }

      mutation.mutate();
    } catch (err) {
      console.error("Error in AI consultation:", err);
      setAnswer("I apologize, but I encountered an error. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = e.target.text.value;
    if (!text) return;
    add(text);
  };

  return (
    <>
      <ChatSession />
      {img.isLoading && <div className="">Loading...</div>}
      {img.dbData?.filePath && (
        <IKImage
          urlEndpoint={import.meta.env.VITE_IMAGE_KIT_ENDPOINT}
          path={img.dbData?.filePath}
          width="380"
          transformation={[{ width: 380 }]}
        />
      )}
      {question && <div className="message user">{question}</div>}
      {answer && (
        <div className="message">
          <Markdown>{answer}</Markdown>
        </div>
      )}
      <form className="newForm" onSubmit={handleSubmit}>
        <Upload setImg={setImg} />
        <input id="file" type="file" multiple={false} hidden />
        <input type="text" name="text" placeholder="Ask for business advice..." />
        <button type="submit">
          <img src="/arrow.png" alt="" />
        </button>
      </form>
    </>
  );
};

export default NewPrompt;