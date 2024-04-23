let APP_ID = "YOUR_API_KEY";

let token = null;
let uid = String(Math.floor(Math.random() * 10000));

let client;
let channel;

let queryString = window.location.search;
let urlParams = new URLSearchParams(queryString);
let roomId = urlParams.get("room");

if (!roomId) {
  window.location = "lobby.html";
}

let localStream;
let remoteStream;
let peerConnection;

const servers = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
};

let constraints = {
  video: {
    width: { min: 640, ideal: 1920, max: 1920 },
    height: { min: 480, ideal: 1080, max: 1080 },
  },
  audio: true,
};

let init = async () => {
  // Agora RTM Client Initialization

  // Client and Channel Initialization
  // Initializes the Agora Real-Time Messaging client.
  client = await AgoraRTM.createInstance(APP_ID);
  // Logs the user into Agora's RTM service.
  await client.login({ uid, token });

  // Creates or joins an existing channel based on roomId.
  channel = client.createChannel(roomId);
  await channel.join();

  // Event Listeners for RTM
  channel.on("MemberJoined", handleUserJoined);
  channel.on("MemberLeft", handleUserLeft);
  client.on("MessageFromPeer", handleMessageFromPeer);

  // WebRTC Setup

  // Local Media Stream Setup
  // Requests access to the local video and audio devices based on specified constraints (like resolution).
  localStream = await navigator.mediaDevices.getUserMedia(constraints);
  //The local stream is then set to be displayed in a video element in the UI.
  document.getElementById("user-1").srcObject = localStream;
};

// Handles UI changes when a member leaves.
let handleUserLeft = (MemberId) => {
  document.getElementById("user-2").style.display = "none";
  document.getElementById("user-1").classList.remove("smallFrame");
};

// Handles incoming messages related to WebRTC offers, answers, and ICE candidates.
let handleMessageFromPeer = async (message, MemberId) => {
  message = JSON.parse(message.text);

  if (message.type === "offer") {
    createAnswer(MemberId, message.offer);
  }

  if (message.type === "answer") {
    addAnswer(message.answer);
  }

  if (message.type === "candidate") {
    if (peerConnection) {
      peerConnection.addIceCandidate(message.candidate);
    }
  }
};

// Triggered when a new member joins the channel. It initiates a WebRTC offer.
let handleUserJoined = async (MemberId) => {
  console.log("A new user joined the channel:", MemberId);
  createOffer(MemberId);
};

let createPeerConnection = async (MemberId) => {
  // WebRTC Setup

  // Peer Connection Initialization
  // Initializes a new peer connection object with specified STUN/TURN server configurations for handling NAT traversal.
  peerConnection = new RTCPeerConnection(servers);

  remoteStream = new MediaStream();
  document.getElementById("user-2").srcObject = remoteStream;
  document.getElementById("user-2").style.display = "block";

  document.getElementById("user-1").classList.add("smallFrame");

  if (!localStream) {
    localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });
    document.getElementById("user-1").srcObject = localStream;
  }

  // Handling Tracks and Stream

  // Local tracks are added to the peer connection.
  localStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStream);
  });

  // Remote tracks are received and added to the remote stream when the peer connection receives them.
  peerConnection.ontrack = (event) => {
    event.streams[0].getTracks().forEach((track) => {
      remoteStream.addTrack(track);
    });
  };

  peerConnection.onicecandidate = async (event) => {
    if (event.candidate) {
      client.sendMessageToPeer(
        {
          text: JSON.stringify({
            type: "candidate",
            candidate: event.candidate,
          }),
        },
        MemberId
      );
    }
  };
};
// WebRTC Signaling: Offers, Answers, and Candidates

// When a user joins, an offer is created and sent to other peers to initiate a connection.
let createOffer = async (MemberId) => {
  await createPeerConnection(MemberId);

  let offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);

  client.sendMessageToPeer(
    { text: JSON.stringify({ type: "offer", offer: offer }) },
    MemberId
  );
};


// When a peer receives an offer, it generates an answer and sends it back.
// This exchange sets up the local and remote descriptions necessary for establishing a peer-to-peer connection.
let createAnswer = async (MemberId, offer) => {
  await createPeerConnection(MemberId);

  await peerConnection.setRemoteDescription(offer);

  let answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);

  client.sendMessageToPeer(
    { text: JSON.stringify({ type: "answer", answer: answer }) },
    MemberId
  );
};

let addAnswer = async (answer) => {
  if (!peerConnection.currentRemoteDescription) {
    peerConnection.setRemoteDescription(answer);
  }
};

let leaveChannel = async () => {
  await channel.leave();
  await client.logout();
};

let toggleCamera = async () => {
  let videoTrack = localStream
    .getTracks()
    .find((track) => track.kind === "video");

  if (videoTrack.enabled) {
    videoTrack.enabled = false;
    document.getElementById("camera-btn").style.backgroundColor =
      "rgb(255, 80, 80)";
  } else {
    videoTrack.enabled = true;
    document.getElementById("camera-btn").style.backgroundColor =
      "rgb(179, 102, 249, .9)";
  }
};

let toggleMic = async () => {
  let audioTrack = localStream
    .getTracks()
    .find((track) => track.kind === "audio");

  if (audioTrack.enabled) {
    audioTrack.enabled = false;
    document.getElementById("mic-btn").style.backgroundColor =
      "rgb(255, 80, 80)";
  } else {
    audioTrack.enabled = true;
    document.getElementById("mic-btn").style.backgroundColor =
      "rgb(179, 102, 249, .9)";
  }
};

window.addEventListener("beforeunload", leaveChannel);

document.getElementById("camera-btn").addEventListener("click", toggleCamera);
document.getElementById("mic-btn").addEventListener("click", toggleMic);

init();
