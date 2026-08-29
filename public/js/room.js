const roomCode = localStorage.getItem("roomCode");
const username = localStorage.getItem("username") || "You";
const userAvatar = localStorage.getItem("userAvatar") || "🌊";

/* Protect page */

if (!roomCode) {
  window.location.href = "index.html";
}

/* Elements */

const localVideo = document.getElementById("localVideo");
const localPlaceholder = document.getElementById("localPlaceholder");

const startCameraBtn = document.getElementById("startCameraBtn");
const toggleMicBtn = document.getElementById("toggleMicBtn");
const toggleCameraBtn = document.getElementById("toggleCameraBtn");
const leaveRoomBtn = document.getElementById("leaveRoomBtn");

const roomCodeDisplay = document.getElementById("roomCodeDisplay");
const usernameDisplay = document.getElementById("usernameDisplay");
const userAvatarDisplay = document.getElementById("userAvatar");

const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const messages = document.getElementById("messages");

const snapInput = document.getElementById("snapInput");
const snapPreview = document.getElementById("snapPreview");
const captureSnapBtn = document.getElementById("captureSnapBtn");

let localStream = null;
let micEnabled = true;
let cameraEnabled = true;

/* Display user data */

roomCodeDisplay.textContent = `ROOM ${roomCode}`;
usernameDisplay.textContent = username;
userAvatarDisplay.textContent = userAvatar;


/* Start Camera */

startCameraBtn.addEventListener("click", async () => {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });

    localVideo.srcObject = localStream;

    localPlaceholder.style.display = "none";

    startCameraBtn.textContent = "Camera On ✓";

  } catch (error) {
    alert("Camera or microphone permission was not granted.");
  }
});


/* Toggle microphone */

toggleMicBtn.addEventListener("click", () => {
  if (!localStream) return;

  micEnabled = !micEnabled;

  localStream.getAudioTracks().forEach((track) => {
    track.enabled = micEnabled;
  });

  toggleMicBtn.textContent = micEnabled ? "🎙️" : "🔇";
});


/* Toggle camera */

toggleCameraBtn.addEventListener("click", () => {
  if (!localStream) return;

  cameraEnabled = !cameraEnabled;

  localStream.getVideoTracks().forEach((track) => {
    track.enabled = cameraEnabled;
  });

  toggleCameraBtn.textContent = cameraEnabled ? "📹" : "🚫";
});


/* Leave Room */

leaveRoomBtn.addEventListener("click", () => {

  if (localStream) {
    localStream.getTracks().forEach((track) => {
      track.stop();
    });
  }

  window.location.href = "dashboard.html";

});


/* Local Chat */

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const message = chatInput.value.trim();

  if (!message) return;

  const emptyChat = document.querySelector(".empty-chat");

  if (emptyChat) {
    emptyChat.remove();
  }

  const messageElement = document.createElement("div");

  messageElement.className = "message own-message";

  messageElement.textContent = message;

  messages.appendChild(messageElement);

  chatInput.value = "";

  messages.scrollTop = messages.scrollHeight;
});


/* Upload Snap */

snapInput.addEventListener("change", () => {
  const file = snapInput.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = (event) => {
    snapPreview.innerHTML = `
      <img src="${event.target.result}" alt="Shared snap">
    `;
  };

  reader.readAsDataURL(file);
});


/* Capture Snap */

captureSnapBtn.addEventListener("click", () => {

  if (!localStream) {
    alert("Start your camera first.");
    return;
  }

  const canvas = document.createElement("canvas");

  canvas.width = localVideo.videoWidth;
  canvas.height = localVideo.videoHeight;

  const context = canvas.getContext("2d");

  context.drawImage(
    localVideo,
    0,
    0,
    canvas.width,
    canvas.height
  );

  const imageData = canvas.toDataURL("image/png");

  snapPreview.innerHTML = `
    <img src="${imageData}" alt="Captured snap">
  `;

});