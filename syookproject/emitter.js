const socket = require("socket.io-client");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");

const dataPath = path.join(__dirname, "data.json");
let data;

try {
  const rawData = fs.readFileSync(dataPath, "utf8");
  const jsonData = JSON.parse(rawData);
  data = jsonData.data;
  console.log("Loaded data:", data);
} catch (error) {
  console.error("Error loading data:", error);
}

const serverUrl = "http://localhost:3001";
const key = "89012347890123456789012340123456";

const iv = Buffer.from("89012347890123456789012340123456", "hex");

const generateRandomMessage = () => {
  const randomIndex = Math.floor(Math.random() * data.length);
  const { name, origin, destination, secret_key } = data[randomIndex];

  const originalMessage = { name, origin, destination };

  // Create SHA-256 hash of the originalMessage to generate secret_key
  const sha256 = crypto.createHash("sha256");
  sha256.update(JSON.stringify(originalMessage));
  const calculatedSecretKey = sha256.digest("hex");

  const sumCheckMessage = {
    ...originalMessage,
    secret_key: calculatedSecretKey,
  };

  try {
    const encryptedMessage = encrypt(
      Buffer.from(JSON.stringify(sumCheckMessage)),
      key,
      iv
    );
    console.log(
      "Generated Encrypted Message:",
      encryptedMessage.toString("base64")
    );

    return encryptedMessage;
  } catch (error) {
    console.error("Error during encryption:", error);
    return null;
  }
};

const encrypt = (buffer, key, iv) => {
  const cipher = crypto.createCipheriv("aes-256-ctr", key, iv);
  const encryptedBuffer = Buffer.concat([
    cipher.update(buffer),
    cipher.final(),
  ]);
  return encryptedBuffer;
};

const socketClient = socket(serverUrl);

socketClient.on("connect", () => {
  setInterval(() => {
    const message = generateRandomMessage();
    if (message) {
      socketClient.emit("encryptedMessage", message.toString("base64"));
    } else {
      console.error("Generated message is null");
    }
  }, 10000);
});

socketClient.on("disconnect", () => {
  console.log("Disconnected from server");
});
