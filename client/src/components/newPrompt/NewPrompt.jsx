import { useEffect, useRef, useState } from "react";
import "./newPrompt.css";
import Upload from "../upload/Upload";
import { IKImage } from "imagekitio-react";
import chat from "../../lib/gemini";
import Markdown from "react-markdown";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const NewPrompt = ({ data }) => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [img, setImg] = useState({
    isLoading: false,
    error: "",
    dbData: {},
    aiData: {},
  });

  const initialHistory = [
    {
      role: "model",
      parts: [{ text: "Welcome! What is your company name?" }],
    },
    {
      role: "model",
      parts: [{ text: "Can you provide a brief about your company?" }],
    },
    {
      role: "model",
      parts: [{ text: "How can I assist you today? (a) Create an irresistible offer/sales funnel, (b) Price optimization for your products, (c) Data analytics for your uploaded CSV file" }],
    },
  ];

  const chatHistory = data && data.history ? data.history : initialHistory;

  const chat = model.startChat({
    history: chatHistory,
    generationConfig: {
      temperature: 0.7, // Adjusted for more creative yet focused responses
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024,
    },
  });

  const endRef = useRef(null);
  const formRef = useRef(null);

  useEffect(() => {
    endRef.current.scrollIntoView({ behavior: "smooth" });
  }, [data, question, answer, img.dbData]);

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
      queryClient
        .invalidateQueries({ queryKey: ["chat", data._id] })
        .then(() => {
          formRef.current.reset();
          setQuestion("");
          setAnswer("");
          setImg({
            isLoading: false,
            error: "",
            dbData: {},
            aiData: {},
          });
        });
    },
    onError: (err) => {
      console.error(err);
    },
  });

  const add = async (text, isInitial) => {
    if (!isInitial) setQuestion(text);

    try {
      const csvData = chatHistory.find(msg => msg.csvData)?.csvData;
      const messageWithCSV = csvData ? 
        `${text}\n\nCSV Data: ${JSON.stringify(csvData)}` : 
        text;

      const result = await chat.sendMessageStream(
        Object.entries(img.aiData).length ? [img.aiData, messageWithCSV] : [messageWithCSV]
      );
      let accumulatedText = "";
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        console.log(chunkText);
        accumulatedText += chunkText;
        setAnswer(accumulatedText);
      }

      // Ask for feedback after providing the answer
      setAnswer(accumulatedText + "\n\nHow would you rate this advice on a scale of 1-10? Your feedback helps me improve.");

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

    add(text, false);
    e.target.text.value = ""; // Clear the input box
  };

  // Initial message handler
  const hasRun = useRef(false);

  useEffect(() => {
    if (!hasRun.current && data?.history?.length === 1) {
      add(data.history[0].parts[0].text, true);
    }
    hasRun.current = true;
  }, []);

  const handleFileUpload = async (e) => {
    e.preventDefault();
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/upload-csv`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const result = await response.json();
      console.log(result);
      // Handle the result from the CSV analysis
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
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
      <div className="endChat" ref={endRef}></div>
      {uploadStatus.filename && (
        <div className="uploadStatus">
          {uploadStatus.success ? `Uploaded: ${uploadStatus.filename}` : "Upload failed!"}
        </div>
      )}
      <form className="newForm" onSubmit={handleSubmit} ref={formRef}>
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
