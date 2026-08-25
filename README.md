<img width="1207" height="639" alt="Screenshot 2026-08-23 094454" src="https://github.com/user-attachments/assets/92b19485-7e71-4b4b-9631-7fe59863aa52" />
<img width="1348" height="637" alt="edfcndf" src="https://github.com/user-attachments/assets/dadc264d-0a01-4ad9-8709-fc1ba0415682" />
<img width="1366" height="636" alt="dzvcx v" src="https://github.com/user-attachments/assets/4e16f360-bb5f-4d99-a1f6-b85fce99e7d7" />



# Real-Time Chat Application

A full-stack real-time communication application built with Node.js, Express.js, EJS, MySQL, Socket.IO, and WebRTC.

## Overview

This application provides real-time private messaging, friend management, group conversations, and audio/video calling. It combines a traditional web application architecture with real-time communication technologies.

## Features
<img width="1351" height="637" alt="dvxfv " src="https://github.com/user-attachments/assets/371ad9c9-e74d-41c5-8c75-315a5d1213a9" />


The application supports user authentication, friend management, private messaging, group conversations, and real-time audio and video calling.

Messages are associated with the appropriate users and stored in MySQL for persistent conversation history.

## Technology Stack

The backend is built with Node.js and Express.js, with EJS used for server-side rendered views. MySQL is used for persistent data storage.

Socket.IO provides real-time communication and is also used for WebRTC signaling. WebRTC handles peer-to-peer audio and video communication.

## Architecture

The application follows a client-server architecture. The frontend communicates with the Node.js and Express.js backend, while MySQL handles persistent data.

Socket.IO manages real-time events between connected users. For calling, Socket.IO exchanges WebRTC signaling data, while WebRTC establishes the peer-to-peer media connection.

## WebRTC Calling
<img width="1366" height="642" alt="fbg " src="https://github.com/user-attachments/assets/81819a0e-12a7-4c4f-88ba-56531768f08e" />
<img width="1351" height="635" alt="dfjdkl" src="https://github.com/user-attachments/assets/0b311078-dddb-432c-b27d-7c24c35ef5e6" />

The calling system uses `RTCPeerConnection`, `getUserMedia()`, offer/answer negotiation, ICE candidate exchange, and a STUN server to establish audio and video communication between users.

## Project Structure

```text id="2gk6hr"
controllers/
middleware/
routes/
views/
public/
server.js
db.js
package.json
```

## Installation

```bash id="1k6u1b"
git clone https://github.com/parmarpriya970-spec/Realtime_app.git
cd Realtime_app
npm install
```

Configure the database connection and required environment variables before running the application.

## Running the Application

```bash id="kz2pqa"
node server.js
```

## Demo

The project is being documented through a video series covering the application architecture, real-time messaging, Socket.IO, and WebRTC implementation.

## Future Development

Planned improvements include additional real-time communication features, media sharing, notifications, and improved scalability.

## License

This project is intended for learning and demonstration purposes.
