const roomCode = localStorage.getItem("roomCode");
const username = localStorage.getItem("username") || "You";
const userAvatar = localStorage.getItem("userAvatar") || "🌊";

/* Protect page */

if (!roomCode) {
  window.location.href = "index.html";
}

/* Elements */

const roomCodeDisplay = document.getElementById("roomCodeDisplay");
const usernameDisplay = document.getElementById("usernameDisplay");
const userAvatarDisplay = document.getElementById("userAvatar");

const cinemaVideo = document.getElementById("cinemaVideo");
const cinemaPlaceholder = document.getElementById("cinemaPlaceholder");
const videoInput = document.getElementById("videoInput");

const videoTitle = document.getElementById("videoTitle");
const playPauseBtn = document.getElementById("playPauseBtn");
const restartBtn = document.getElementById("restartBtn");

const cinemaChatForm = document.getElementById("cinemaChatForm");
const cinemaChatInput = document.getElementById("cinemaChatInput");
const cinemaMessages = document.getElementById("cinemaMessages");

/* Display saved data */

roomCodeDisplay.textContent = `ROOM ${roomCode}`;
usernameDisplay.textContent = username;
userAvatarDisplay.textContent = userAvatar;


/* Choose video */

videoInput.addEventListener("change", () => {
  const file = videoInput.files[0];

  if (!file) return;

  const videoURL = URL.createObjectURL(file);

  cinemaVideo.src = videoURL;
  cinemaVideo.load();

  cinemaPlaceholder.style.display = "none";

  videoTitle.textContent = file.name;

  cinemaVideo.play()
    .then(() => {
      playPauseBtn.textContent = "❚❚";
    })
    .catch(() => {
      playPauseBtn.textContent = "▶";
    });
});


/* Play / Pause */

playPauseBtn.addEventListener("click", () => {

  if (!cinemaVideo.src) return;

  if (cinemaVideo.paused) {

    cinemaVideo.play();
    playPauseBtn.textContent = "❚❚";

  } else {

    cinemaVideo.pause();
    playPauseBtn.textContent = "▶";

  }

});


/* Restart video */

restartBtn.addEventListener("click", () => {

  if (!cinemaVideo.src) return;

  cinemaVideo.currentTime = 0;

  cinemaVideo.play();

  playPauseBtn.textContent = "❚❚";

});


/* Keep button synced */

cinemaVideo.addEventListener("play", () => {
  playPauseBtn.textContent = "❚❚";
});

cinemaVideo.addEventListener("pause", () => {
  playPauseBtn.textContent = "▶";
});

cinemaVideo.addEventListener("ended", () => {
  playPauseBtn.textContent = "▶";
});


/* Cinema chat */

cinemaChatForm.addEventListener("submit", (event) => {

  event.preventDefault();

  const message = cinemaChatInput.value.trim();

  if (!message) return;


  /* Remove empty state */

  const emptyChat = document.querySelector(".empty-cinema-chat");

  if (emptyChat) {
    emptyChat.remove();
  }


  /* Create message */

  const messageElement = document.createElement("div");

  messageElement.className = "cinema-message own-cinema-message";

  messageElement.textContent = message;

  cinemaMessages.appendChild(messageElement);


  /* Clear input */

  cinemaChatInput.value = "";

  cinemaMessages.scrollTop = cinemaMessages.scrollHeight;

});