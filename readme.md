# Real-time Data Encryption and Transmission

This project shows a simple real-time data transmission system using Node.js, Socket.IO, MongoDB, and React. The system encrypts data on the server-side, transmits it to the client-side, decrypts it, and stores it in a MongoDB database.

## Prerequisites

Make sure you have the following installed on your machine:

- Node.js: [Download and Install Node.js](https://nodejs.org/)
- MongoDB: [Download and Install MongoDB](https://www.mongodb.com/try/download/community)
- React: Install globally using `npm install -g create-react-app` (if not already installed)

## Installation

1. Unzip the github Code:

2. Navigate to project directory
cd syook
cd syookproject
3. Install backend dependencies

npm install

3.Install frontend dependencies
cd ../frontend
cd syookfrontend
npm install

# How to run code

4. Open 3 terminals
a) terminal 1: i)cd backend ii) nodemon listener.js
b) terminal 2: i)cd backend ii) nodemon emitter.js
a) terminal 3: i)cd frontend ii) npm start


Open your browser and go to http://localhost:3000 to see the real-time data display.

# Project Structure
backend/: Node.js server using Express and Socket.IO.

listener.js: Listens for encrypted messages, decrypts, and saves them to MongoDB.
emitter.js: Emits random encrypted messages at regular intervals.
frontend/: React application for real-time data display.

src/App.js: React component to display real-time data.
data.json: Sample data used for encryption.