const http = require("http");
const socketIO = require("socket.io");
const crypto = require("crypto");
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const app = express();

const fs = require("fs");
const data = require("./data.json").data;

const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const PORT = 3001;

mongoose
  .connect(
    "mongodb+srv://soumyasri2245:Soumya22%4034@cluster0.u2ywt3o.mongodb.net/newtimeseriesdb?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

const dataSchema = new mongoose.Schema({
  name: String,
  origin: String,
  destination: String,
  secret_key: String,
  timestamp: { type: Date, default: Date.now },
});

const TimeSeriesModel = mongoose.model("TimeSeries", dataSchema);

app.use(cors());
const key = "89012347890123456789012340123456";

const iv = Buffer.from("89012347890123456789012340123456", "hex");

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("encryptedMessage", (encryptedMessage) => {
    if (encryptedMessage) {
      try {
        const decryptedMessage = decrypt(encryptedMessage, key, iv);
        if (decryptedMessage) {
          console.log("Decrypted message:", decryptedMessage);
          saveToMongoDB(decryptedMessage);
          io.emit("decryptedData", decryptedMessage);
        } else {
          console.error("Decrypted message is null");
        }
      } catch (error) {
        console.error("Error decrypting message:", error);
      }
    } else {
      console.error("Received undefined encrypted message");
    }
  });
});

const decryptMessageStream = (encryptedMessage, key, iv) => {
  console.log("Received encrypted message:", encryptedMessage);

  const messages = encryptedMessage.split("|");
  console.log("Split messages:", messages);

  const decryptedMessages = [];

  messages.forEach((message, index) => {
    const decryptedMessage = decrypt(message, key, iv);
    console.log(`Decrypted message at index ${index}:`, decryptedMessage);

    if (validateDataIntegrity(decryptedMessage)) {
      decryptedMessages.push(decryptedMessage);
      io.emit("decryptedData", decryptedMessage);
    }
  });

  return decryptedMessages;
};

const decrypt = (text, key, iv) => {
  try {
    const bufferText = Buffer.from(text, "base64"); // Parse the base64 encoded text
    const decipher = crypto.createDecipheriv("aes-256-ctr", key, iv);
    const decryptedText = Buffer.concat([
      decipher.update(bufferText),
      decipher.final(),
    ]);
    return decryptedText.toString("utf-8");
  } catch (error) {
    console.error("Error decrypting message:", error);
    return null;
  }
};

const validateDataIntegrity = (message) => {
  console.log("Original message before parsing:", message);

  if (!message) {
    console.error("Received undefined message");
    return false;
  }

  try {
    const { name, origin, destination, secret_key } = JSON.parse(message);
    const calculatedSecretKey = secret_key;

    console.log("Calculated secret key:", calculatedSecretKey);
    console.log("Received secret key:", secret_key);

    if (secret_key === calculatedSecretKey) {
      console.log("Data integrity check passed.");
      return true;
    } else {
      console.error("Data integrity check failed.");
      return false;
    }
  } catch (error) {
    console.error("Error parsing message as JSON:", error);
    console.log("Original message:", message);
    return false;
  }
};

const saveToMongoDB = async (message) => {
  try {
    console.log("Received message:", message);
    const messageObject = JSON.parse(message);
    console.log("Parsed message:", messageObject);

    const timeSeriesData = new TimeSeriesModel(messageObject);
    await timeSeriesData.save(); // Use await here

    console.log("Data saved to MongoDB:", messageObject);
  } catch (error) {
    console.error("Error parsing message as JSON:", error);
    console.log("Original message:", message);
  }
};

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
