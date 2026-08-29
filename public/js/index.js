const createBtn = document.getElementById("createBtn");
const joinBtn = document.getElementById("joinBtn");
const joinPanel = document.getElementById("joinPanel");
const roomCodeInput = document.getElementById("roomCode");
const confirmJoinBtn = document.getElementById("confirmJoinBtn");

/* Generate a unique room code */
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

/* Create a new Parallel */
createBtn.addEventListener("click", () => {
  const roomCode = generateRoomCode();

  localStorage.setItem("roomCode", roomCode);
  localStorage.setItem("roomRole", "host");

  window.location.href = "profile-setup.html";
});

/* Show join panel */
joinBtn.addEventListener("click", () => {
  joinPanel.classList.toggle("show");

  if (joinPanel.classList.contains("show")) {
    roomCodeInput.focus();
  }
});

/* Join an existing Parallel */
function joinParallel() {
  const roomCode = roomCodeInput.value
    .trim()
    .toUpperCase();

  if (roomCode.length !== 6) {
    alert("Please enter a valid 6-character room code.");
    roomCodeInput.focus();
    return;
  }

  localStorage.setItem("roomCode", roomCode);
  localStorage.setItem("roomRole", "guest");

  window.location.href = "profile-setup.html";
}

confirmJoinBtn.addEventListener("click", joinParallel);

/* Allow Enter key */
roomCodeInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    joinParallel();
  }
});