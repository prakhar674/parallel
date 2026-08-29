const usernameInput = document.getElementById("username");
const roomCodeInput = document.getElementById("roomCode");
const createRoomBtn = document.getElementById("createRoomBtn");
const joinRoomBtn = document.getElementById("joinRoomBtn");

/* Generate room code */
function generateRoomCode() {
const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
let code = "";

for (let i = 0; i < 6; i++) {
code += characters.charAt(
Math.floor(Math.random() * characters.length)
);
}

return code;
}

/* Create Room */
createRoomBtn.addEventListener("click", () => {
const username = usernameInput.value.trim();

if (!username) {
alert("Please enter your name first!");
usernameInput.focus();
return;
}

const roomCode = generateRoomCode();

localStorage.setItem("username", username);
localStorage.setItem("roomCode", roomCode);
localStorage.setItem("roomRole", "host");

window.location.href = "waiting.html";
});

/* Join Room */
joinRoomBtn.addEventListener("click", () => {
const username = usernameInput.value.trim();
const roomCode = roomCodeInput.value
.trim()
.toUpperCase();

if (!username) {
alert("Please enter your name first!");
usernameInput.focus();
return;
}

if (!roomCode) {
alert("Please enter a room code!");
roomCodeInput.focus();
return;
}

localStorage.setItem("username", username);
localStorage.setItem("roomCode", roomCode);
localStorage.setItem("roomRole", "guest");

window.location.href = "waiting.html";
});

/* Enter key support */
usernameInput.addEventListener("keydown", (event) => {
if (event.key === "Enter") {
createRoomBtn.click();
}
});

roomCodeInput.addEventListener("keydown", (event) => {
if (event.key === "Enter") {
joinRoomBtn.click();
}
});