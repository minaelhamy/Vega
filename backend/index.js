import express from "express";
import cors from "cors";
import path from "path";
import url, { fileURLToPath } from "url";
import ImageKit from "imagekit";
import mongoose from "mongoose";
import multer from "multer";
import csv from "csv-parser";
import fs from "fs";
import Chat from "./models/chat.js";
import UserChats from "./models/userChats.js";
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const port = process.env.PORT || 3000;
const host = '0.0.0.0'; // Ensure it listens on all interfaces
const app = express();


app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());

const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.log(err);
  }
};

const imagekit = new ImageKit({
  urlEndpoint: process.env.IMAGE_KIT_ENDPOINT,
  publicKey: process.env.IMAGE_KIT_PUBLIC_KEY,
  privateKey: process.env.IMAGE_KIT_PRIVATE_KEY,
});

const upload = multer({ dest: "uploads/" });

app.get("/api/upload", (req, res) => {
  const result = imagekit.getAuthenticationParameters();
  res.send(result);
});

app.post("/api/chats", ClerkExpressRequireAuth(), async (req, res) => {
  const userId = req.auth.userId;
  const { text } = req.body;

  try {
    const userChats = await UserChats.findOne({ userId: userId });

    if (!userChats) {
      // First time chat, start with initial questions
      const initialChat = new Chat({
        userId: userId,
        history: [
          { role: "model", parts: [{ text: "Welcome! What is your company name?" }] },
          { role: "model", parts: [{ text: "Can you provide a brief about your company?" }] },
          { role: "model", parts: [{ text: "How can I assist you today? (a) Create an irresistible offer/sales funnel, (b) Price optimization for your products, (c) Data analytics for your uploaded CSV file" }] },
        ],
      });

      const savedChat = await initialChat.save();

      const newUserChats = new UserChats({
        userId: userId,
        chats: [
          {
            _id: savedChat._id,
            title: "Initial Chat",
          },
        ],
      });

      await newUserChats.save();

      return res.status(201).send(savedChat._id);
    }

    // Subsequent chats
    const newChat = new Chat({
      userId: userId,
      history: [{ role: "user", parts: [{ text }] }],
    });

    const savedChat = await newChat.save();

    await UserChats.updateOne(
      { userId: userId },
      {
        $push: {
          chats: {
            _id: savedChat._id,
            title: text.substring(0, 40),
          },
        },
      }
    );

    res.status(201).send(savedChat._id);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error creating chat!");
  }
});

app.post("/api/upload-csv", ClerkExpressRequireAuth(), upload.single("file"), (req, res) => {
  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", async () => {
      fs.unlinkSync(req.file.path); // Remove the file after processing
      try {
        // Save CSV data to MongoDB
        const chat = await Chat.findById(req.body.chatId);
        chat.history.push({
          role: "model",
          parts: [{ text: "CSV data uploaded and analyzed" }],
          csvData: results,
        });
        await chat.save();
        res.status(200).json({ success: true, filename: req.file.originalname });
      } catch (err) {
        console.log(err);
        res.status(500).send("Error processing CSV data!");
      }
    });
});

app.get("/api/userchats", ClerkExpressRequireAuth(), async (req, res) => {
  const userId = req.auth.userId;

  try {
    const userChats = await UserChats.find({ userId });
    if (userChats.length === 0) {
      return res.status(200).send([]);
    }

    res.status(200).send(userChats[0].chats);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error fetching userchats!");
  }
});

app.get("/api/chats/:id", ClerkExpressRequireAuth(), async (req, res) => {
  const userId = req.auth.userId;

  try {
    const chat = await Chat.findOne({ _id: req.params.id, userId });

    res.status(200).send(chat);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error fetching chat!");
  }
});

app.put("/api/chats/:id", ClerkExpressRequireAuth(), async (req, res) => {
  const userId = req.auth.userId;

  const { question, answer, img } = req.body;

  const newItems = [
    ...(question
      ? [{ role: "user", parts: [{ text: question }], ...(img && { img }) }]
      : []),
    { role: "model", parts: [{ text: answer }] },
  ];

  try {
    const updatedChat = await Chat.updateOne(
      { _id: req.params.id, userId },
      {
        $push: {
          history: {
            $each: newItems,
          },
        },
      }
    );
    res.status(200).send(updatedChat);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error adding conversation!");
  }
});

app.delete("/api/chats/:id", ClerkExpressRequireAuth(), async (req, res) => {
  const userId = req.auth.userId;
  
  try {
    await Chat.deleteOne({ _id: req.params.id, userId });
    await UserChats.updateOne(
      { userId: userId },
      {
        $pull: {
          chats: { _id: req.params.id },
        },
      }
    );
    res.status(200).send("Chat deleted!");
  } catch (err) {
    console.log(err);
    res.status(500).send("Error deleting chat!");
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(401).send("Unauthenticated!");
});

// PRODUCTION
app.use(express.static(path.join(__dirname, "../client/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist", "index.html"));
});

app.listen(port, host, () => {
  connect();
  console.log(`Server running on ${host}:${port}`);
});