const socket = io();

const roomCode = localStorage.getItem("roomCode");
const username = localStorage.getItem("username") || "Guest";
const avatar = localStorage.getItem("userAvatar") || "🌊";

if (!roomCode) {
  window.location.href = "index.html";
}


/* -------------------- ROOM JOIN -------------------- */

socket.emit("join-room", {
  roomCode,
  username,
  avatar
});


/* -------------------- WEBRTC -------------------- */

let localStream = null;
let peerConnection = null;
let remoteUserId = null;

const rtcConfig = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302"
    }
  ]
};


/* -------------------- ELEMENTS -------------------- */

const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");

const roomCodeDisplay =
  document.getElementById("roomCodeDisplay");

const membersContainer =
  document.getElementById("membersContainer");

const messagesContainer =
  document.getElementById("messagesContainer");

const messageInput =
  document.getElementById("messageInput");

const sendMessageBtn =
  document.getElementById("sendMessageBtn");

const micBtn =
  document.getElementById("micBtn");

const cameraBtn =
  document.getElementById("cameraBtn");

const callBtn =
  document.getElementById("callBtn");

const leaveBtn =
  document.getElementById("leaveBtn");


if (roomCodeDisplay) {
  roomCodeDisplay.textContent = `ROOM ${roomCode}`;
}


/* -------------------- CAMERA + MIC -------------------- */

async function startLocalMedia() {
  try {
    localStream =
      await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

    if (localVideo) {
      localVideo.srcObject = localStream;
    }

  } catch (error) {

    console.error(
      "Camera/Microphone error:",
      error
    );

    alert(
      "Camera or microphone permission was denied."
    );
  }
}

startLocalMedia();


/* -------------------- CREATE PEER -------------------- */

function createPeerConnection() {

  peerConnection =
    new RTCPeerConnection(rtcConfig);


  if (localStream) {

    localStream.getTracks().forEach(
      (track) => {

        peerConnection.addTrack(
          track,
          localStream
        );

      }
    );

  }


  peerConnection.ontrack =
    (event) => {

      if (remoteVideo) {
        remoteVideo.srcObject =
          event.streams[0];
      }

    };


  peerConnection.onicecandidate =
    (event) => {

      if (
        event.candidate &&
        remoteUserId
      ) {

        socket.emit("ice-candidate", {
          candidate: event.candidate,
          target: remoteUserId
        });

      }

    };


  peerConnection.onconnectionstatechange =
    () => {

      console.log(
        "Connection:",
        peerConnection.connectionState
      );

    };

}


/* -------------------- ROOM MEMBERS -------------------- */

socket.on(
  "room-members",
  (members) => {

    if (!membersContainer) return;

    membersContainer.innerHTML = "";

    members.forEach((member) => {

      const memberElement =
        document.createElement("div");

      memberElement.className =
        "room-member";

      memberElement.innerHTML = `
        <span>${member.avatar}</span>
        <small>
          ${member.username}
        </small>
      `;

      membersContainer.appendChild(
        memberElement
      );


      if (
        member.id !== socket.id
      ) {

        remoteUserId = member.id;

      }

    });

  }
);


/* -------------------- USER JOINED -------------------- */

socket.on(
  "user-joined",
  (user) => {

    remoteUserId = user.id;

    console.log(
      "User joined:",
      user.username
    );

  }
);


/* -------------------- LIVE CHAT -------------------- */

function sendMessage() {

  const message =
    messageInput.value.trim();

  if (!message) return;


  socket.emit("send-message", {
    roomCode,
    message,
    username,
    avatar
  });


  messageInput.value = "";

}


function displayMessage(data) {

  if (!messagesContainer) return;

  const messageElement =
    document.createElement("div");

  const isMine =
    data.senderId === socket.id;

  messageElement.className =
    isMine
      ? "chat-message mine"
      : "chat-message";


  messageElement.innerHTML = `
    <span class="message-avatar">
      ${data.avatar}
    </span>

    <div>
      <strong>
        ${isMine ? "You" : data.username}
      </strong>

      <p>
        ${data.message}
      </p>
    </div>
  `;


  messagesContainer.appendChild(
    messageElement
  );

  messagesContainer.scrollTop =
    messagesContainer.scrollHeight;

}


socket.on(
  "receive-message",
  displayMessage
);


if (sendMessageBtn) {

  sendMessageBtn.addEventListener(
    "click",
    sendMessage
  );

}


if (messageInput) {

  messageInput.addEventListener(
    "keydown",
    (event) => {

      if (event.key === "Enter") {
        sendMessage();
      }

    }
  );

}


/* -------------------- START CALL -------------------- */

if (callBtn) {

  callBtn.addEventListener(
    "click",
    async () => {

      if (!remoteUserId) {

        alert(
          "Waiting for someone else to join the room."
        );

        return;

      }


      if (!localStream) {

        alert(
          "Camera is not ready yet."
        );

        return;

      }


      createPeerConnection();


      const offer =
        await peerConnection.createOffer();

      await peerConnection.setLocalDescription(
        offer
      );


      socket.emit("webrtc-offer", {
        roomCode,
        offer,
        target: remoteUserId
      });

    }
  );

}


/* -------------------- RECEIVE OFFER -------------------- */

socket.on(
  "webrtc-offer",
  async ({
    offer,
    sender
  }) => {

    remoteUserId = sender;

    createPeerConnection();

    await peerConnection.setRemoteDescription(
      new RTCSessionDescription(offer)
    );


    const answer =
      await peerConnection.createAnswer();

    await peerConnection.setLocalDescription(
      answer
    );


    socket.emit("webrtc-answer", {
      answer,
      target: sender
    });

  }
);


/* -------------------- RECEIVE ANSWER -------------------- */

socket.on(
  "webrtc-answer",
  async ({
    answer
  }) => {

    if (!peerConnection) return;

    await peerConnection.setRemoteDescription(
      new RTCSessionDescription(answer)
    );

  }
);


/* -------------------- RECEIVE ICE -------------------- */

socket.on(
  "ice-candidate",
  async ({
    candidate
  }) => {

    if (
      peerConnection &&
      candidate
    ) {

      try {

        await peerConnection.addIceCandidate(
          new RTCIceCandidate(candidate)
        );

      } catch (error) {

        console.error(
          "ICE candidate error:",
          error
        );

      }

    }

  }
);


/* -------------------- MIC TOGGLE -------------------- */

if (micBtn) {

  micBtn.addEventListener(
    "click",
    () => {

      if (!localStream) return;

      const audioTrack =
        localStream.getAudioTracks()[0];

      if (!audioTrack) return;

      audioTrack.enabled =
        !audioTrack.enabled;

      micBtn.classList.toggle(
        "active",
        !audioTrack.enabled
      );

    }
  );

}


/* -------------------- CAMERA TOGGLE -------------------- */

if (cameraBtn) {

  cameraBtn.addEventListener(
    "click",
    () => {

      if (!localStream) return;

      const videoTrack =
        localStream.getVideoTracks()[0];

      if (!videoTrack) return;

      videoTrack.enabled =
        !videoTrack.enabled;

      cameraBtn.classList.toggle(
        "active",
        !videoTrack.enabled
      );

    }
  );

}


/* -------------------- USER LEFT -------------------- */

socket.on(
  "user-left",
  (userId) => {

    if (remoteUserId === userId) {

      remoteUserId = null;

    }


    if (peerConnection) {

      peerConnection.close();

      peerConnection = null;

    }


    if (remoteVideo) {

      remoteVideo.srcObject = null;

    }

  }
);


/* -------------------- LEAVE ROOM -------------------- */

if (leaveBtn) {

  leaveBtn.addEventListener(
    "click",
    () => {

      if (localStream) {

        localStream
          .getTracks()
          .forEach(
            (track) =>
              track.stop()
          );

      }


      if (peerConnection) {

        peerConnection.close();

      }


      socket.disconnect();

      window.location.href =
        "dashboard.html";

    }
  );

}