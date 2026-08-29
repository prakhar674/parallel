const username = localStorage.getItem("username") || "You";
const userAvatar = localStorage.getItem("userAvatar") || "🌊";
const roomCode = localStorage.getItem("roomCode") || "------";

/* Display user information */

document.getElementById("usernameDisplay").textContent = username;
document.getElementById("memberName").textContent = username;

document.getElementById("userAvatar").textContent = userAvatar;
document.getElementById("memberAvatar").textContent = userAvatar;

/* Display room code */

document.getElementById(
  "roomCodeDisplay"
).textContent = `ROOM ${roomCode}`;

document.getElementById(
  "inviteCode"
).textContent = roomCode;

/* Copy invite code */

const copyInviteBtn = document.getElementById("copyInviteBtn");

copyInviteBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(roomCode);

    const originalText = copyInviteBtn.textContent;

    copyInviteBtn.textContent = "Copied ✓";

    setTimeout(() => {
      copyInviteBtn.textContent = originalText;
    }, 2000);

  } catch (error) {

    alert(`Room Code: ${roomCode}`);

  }
});

/* Protect page if no room exists */

if (!localStorage.getItem("roomCode")) {
  window.location.href = "index.html";
}