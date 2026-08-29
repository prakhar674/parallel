const avatarOptions = document.querySelectorAll(".avatar-option");
const displayNameInput = document.getElementById("displayName");
const continueBtn = document.getElementById("continueBtn");

const roomCodeDisplay = document.getElementById("roomCodeDisplay");
const roomRoleDisplay = document.getElementById("roomRoleDisplay");

const roomCode = localStorage.getItem("roomCode");
const roomRole = localStorage.getItem("roomRole");

let selectedAvatar = "🌊";

/* Check room */

if (!roomCode || !roomRole) {
  window.location.href = "index.html";
}

/* Display room code */

roomCodeDisplay.textContent = roomCode;

/* Display role */

if (roomRole === "host") {
  roomRoleDisplay.textContent = "CREATOR";
} else {
  roomRoleDisplay.textContent = "JOINING";
}

/* Avatar selection */

avatarOptions.forEach((avatar) => {
  avatar.addEventListener("click", () => {

    avatarOptions.forEach((item) => {
      item.classList.remove("selected");
    });

    avatar.classList.add("selected");

    selectedAvatar = avatar.dataset.avatar;

  });
});

/* Continue into Parallel */

continueBtn.addEventListener("click", () => {

  const username = displayNameInput.value.trim();

  if (!username) {
    alert("Please enter your name.");
    displayNameInput.focus();
    return;
  }

  localStorage.setItem("username", username);
  localStorage.setItem("userAvatar", selectedAvatar);

  window.location.href = "home.html";

});

/* Allow Enter key */

displayNameInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    continueBtn.click();
  }
});