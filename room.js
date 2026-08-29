const username = localStorage.getItem("username") || "You";
const roomCode = localStorage.getItem("roomCode") || "------";

const localVideo = document.getElementById("localVideo");
const localPlaceholder = document.getElementById("localPlaceholder");
const localName = document.getElementById("localName");
const roomCodeDisplay = document.getElementById("roomCodeDisplay");
const connectionText = document.getElementById("connectionText");

const micBtn = document.getElementById("micBtn");
const cameraBtn = document.getElementById("cameraBtn");
const snapCameraBtn = document.getElementById("snapCameraBtn");
const leaveBtn = document.getElementById("leaveBtn");
const cinemaBtn = document.getElementById("cinemaBtn");

const uploadSnapBtn = document.getElementById("uploadSnapBtn");
const snapInput = document.getElementById("snapInput");
const snapFeed = document.getElementById("snapFeed");

const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const chatMessages = document.getElementById("chatMessages");

let localStream = null;

/* Display user and room information */
localName.textContent = username;
roomCodeDisplay.textContent = "ROOM ${roomCode}";

/* Start camera */
async function startCamera() {
try {
localStream = await navigator.mediaDevices.getUserMedia({
video: true,
audio: true
});

localVideo.srcObject = localStream;

localVideo.onloadedmetadata = () => {
  localVideo.play();
  localPlaceholder.style.display = "none";
};

connectionText.textContent = "Waiting for friend...";

} catch (error) {
console.error("Camera error:", error);

localPlaceholder.innerHTML = `
  <span>📷</span>
  <p>Camera permission needed</p>
`;

connectionText.textContent = "Camera unavailable";

}
}

startCamera();

/* Toggle microphone */
micBtn.addEventListener("click", () => {
if (!localStream) return;

const audioTrack = localStream.getAudioTracks()[0];

if (!audioTrack) return;

audioTrack.enabled = !audioTrack.enabled;

micBtn.textContent = audioTrack.enabled ? "🎤" : "🔇";
micBtn.classList.toggle("active", !audioTrack.enabled);
});

/* Toggle camera */
cameraBtn.addEventListener("click", () => {
if (!localStream) return;

const videoTrack = localStream.getVideoTracks()[0];

if (!videoTrack) return;

videoTrack.enabled = !videoTrack.enabled;

cameraBtn.textContent = videoTrack.enabled ? "📹" : "🚫";
cameraBtn.classList.toggle("active", !videoTrack.enabled);

localPlaceholder.style.display =
videoTrack.enabled ? "none" : "flex";
});

/* Take snap from camera */
snapCameraBtn.addEventListener("click", () => {
if (!localStream) {
alert("Camera is not available.");
return;
}

const canvas = document.createElement("canvas");

canvas.width = localVideo.videoWidth || 640;
canvas.height = localVideo.videoHeight || 480;

const context = canvas.getContext("2d");

context.translate(canvas.width, 0);
context.scale(-1, 1);

context.drawImage(
localVideo,
0,
0,
canvas.width,
canvas.height
);

const image = canvas.toDataURL("image/png");

addSnap(image);
});

/* Upload snap */
uploadSnapBtn.addEventListener("click", () => {
snapInput.click();
});

snapInput.addEventListener("change", () => {
const file = snapInput.files[0];

if (!file) return;

const reader = new FileReader();

reader.onload = () => {
addSnap(reader.result);
};

reader.readAsDataURL(file);

snapInput.value = "";
});

/* Add snap to feed */
function addSnap(imageSource) {
const emptyState = snapFeed.querySelector(".empty-snaps");

if (emptyState) {
emptyState.remove();
}

const snapItem = document.createElement("div");
snapItem.className = "snap-item";

const image = document.createElement("img");
image.src = imageSource;
image.alt = "Shared snap";

snapItem.appendChild(image);
snapFeed.prepend(snapItem);
}

/* Local chat for now */
chatForm.addEventListener("submit", (event) => {
event.preventDefault();

const message = chatInput.value.trim();

if (!message) return;

const messageElement = document.createElement("div");

messageElement.className = "message mine";
messageElement.textContent = message;

chatMessages.appendChild(messageElement);

chatInput.value = "";

chatMessages.scrollTop = chatMessages.scrollHeight;
});

/* Cinema mode */
cinemaBtn.addEventListener("click", () => {
window.location.href = "cinema.html";
});

/* Leave room */
leaveBtn.addEventListener("click", () => {
const confirmed = confirm("Leave this Parallel room?");

if (!confirmed) return;

if (localStream) {
localStream.getTracks().forEach(track => track.stop());
}

localStorage.removeItem("roomCode");
localStorage.removeItem("roomRole");

window.location.href = "index.html";
});

/* Stop camera when leaving page */
window.addEventListener("beforeunload", () => {
if (localStream) {
localStream.getTracks().forEach(track => track.stop());
}
});