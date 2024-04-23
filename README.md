# WebRTC Video Chat Application

This project implements a real-time video chat application using WebRTC and Agora's Real-Time Messaging (RTM) SDK. It allows users to join video chat rooms where they can communicate via video and audio streams directly from their browsers.

## Features

- Real-time video and audio communication.
- Room-based communications where users can join specific rooms using a unique room ID.
- Toggles for video and audio streams.
- Automatic redirection to room creation/joining page if no room ID is provided.

## Prerequisites

Before running this project, you will need:
- An Agora.io developer account and an App ID (Get it from [Agora.io](https://www.agora.io/)).
- A modern web browser that supports WebRTC (e.g., Google Chrome, Mozilla Firefox).

## Setup and Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/alexaungmyooo/peerchat
   cd peerchat

2. **Configure the Application**
- Open the main.js file.
- Replace APP_ID with your Agora App ID.
- If using token-based authentication, update the token variable accordingly.

## Usage

1. **Access the Application**
- Open your browser and go to http://localhost:8000/lobby.html.
- Create or join a room by entering a room ID.

2 **Navigating the Application**
- Once inside a room, your video will be displayed on the screen.
- Use the camera and microphone icons to toggle your video and audio.

3. **Joining a Room**
- Other users can join the same room by entering the same room ID on their devices.

## Files and Directories
- main.js: Contains all the logic for setting up and managing WebRTC and Agora RTM functionalities.
- main.html: The main HTML file for the video chat interface.
- lobby.html: HTML file for the initial room joining or creation interface.
- main.css, lobby.css: CSS files for styling the respective HTML pages.
- icons/: Directory containing UI icons for the application controls.

## Technologies Used
- WebRTC: For peer-to-peer real-time communication.
- Agora Real-Time Messaging SDK: For signaling to coordinate the WebRTC communications.
- HTML/CSS/JavaScript: For the frontend presentation and interaction logic.