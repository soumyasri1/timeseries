import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const FrontendApp = () => {
  const [data, setData] = useState([]);
  const [successRate, setSuccessRate] = useState(0);

  useEffect(() => {
    const socket = io("http://localhost:3001", { transports: ["websocket"] });

    socket.on("connect", () => {
      console.log("Connected to server");
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    socket.on("decryptedData", (decryptedData) => {
      try {
        const parsedData = JSON.parse(decryptedData);
        setData((prevData) => {
          const updatedData = [...prevData, parsedData];

          setSuccessRate((prevSuccessRate) => {
            const totalDataCount = updatedData.length;
            const successfulDataCount = updatedData.filter(
              (item) => item.success
            ).length;
            return ((successfulDataCount / totalDataCount) * 100).toFixed(2);
          });

          return updatedData;
        });
      } catch (error) {
        console.error("Error parsing decrypted data:", error);
        console.log("Original decrypted data:", decryptedData);
      }
    });

    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      <h1>Real-time Data Display</h1>
      <p>Success Rate: {successRate}%</p>
      <ul>
        {data.map((item, index) => (
          <li key={index}>
            {/* Log the entire item object for debugging */}
            {console.log("Received item:", item)}
            {/* Display data properties */}
            Name: {item.name}, Origin: {item.origin}, Destination:{" "}
            {item.destination}, Secret Key: {item.secret_key}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FrontendApp;
