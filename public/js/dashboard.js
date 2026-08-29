/* Get saved Parallel data */

const username = localStorage.getItem("username") || "You";
const userAvatar = localStorage.getItem("userAvatar") || "🌊";
const roomCode = localStorage.getItem("roomCode");

/* Protect dashboard */

if (!roomCode) {
  window.location.href = "index.html";
}

/* Display username */

const usernameDisplay = document.getElementById("usernameDisplay");

if (usernameDisplay) {
  usernameDisplay.textContent = username;
}

/* Display avatar */

const userAvatarDisplay = document.getElementById("userAvatar");

if (userAvatarDisplay) {
  userAvatarDisplay.textContent = userAvatar;
}

/* Display room code in navbar */

const roomCodeDisplay = document.getElementById("roomCodeDisplay");

if (roomCodeDisplay) {
  roomCodeDisplay.textContent = `ROOM ${roomCode}`;
}

/* Display room code in status section */

const statusRoomCode = document.getElementById("statusRoomCode");

if (statusRoomCode) {
  statusRoomCode.textContent = roomCode;
}