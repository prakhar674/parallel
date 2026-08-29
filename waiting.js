const roomCode = localStorage.getItem("roomCode");
const username = localStorage.getItem("username") || "Guest";

const displayRoomCode = document.getElementById("displayRoomCode");
const hostName = document.getElementById("hostName");
const copyCodeBtn = document.getElementById("copyCodeBtn");
const shareBtn = document.getElementById("shareBtn");
const enterRoomBtn = document.getElementById("enterRoomBtn");

/* Display room information */
displayRoomCode.textContent = roomCode || "------";
hostName.textContent = username;

/* Copy room code */
copyCodeBtn.addEventListener("click", async () => {
if (!roomCode) return;

try {
await navigator.clipboard.writeText(roomCode);

copyCodeBtn.textContent = "Copied ✓";

setTimeout(() => {
  copyCodeBtn.textContent = "Copy";
}, 2000);

} catch (error) {
alert("Room code: " + roomCode);
}
});

/* Share room invite */
shareBtn.addEventListener("click", async () => {
if (!roomCode) return;

const inviteText =
"Join my Parallel room!\n\nRoom Code: ${roomCode}";

if (navigator.share) {
try {
await navigator.share({
title: "Join my Parallel Room",
text: inviteText
});
} catch (error) {
console.log("Share cancelled");
}
} else {
try {
await navigator.clipboard.writeText(inviteText);
alert("Invite copied to clipboard!");
} catch (error) {
alert(inviteText);
}
}
});

/* Enter main Parallel room */
enterRoomBtn.addEventListener("click", () => {
if (!roomCode) {
alert("No room code found. Please create or join a room.");
window.location.href = "index.html";
return;
}

window.location.href = "room.html";
});