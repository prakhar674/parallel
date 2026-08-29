const socket = io();

/* Elements */

const usernameInput = document.getElementById("username");
const roomCodeInput = document.getElementById("roomCode");

const createRoomBtn = document.getElementById("createRoomBtn");
const joinRoomBtn = document.getElementById("joinRoomBtn");

const avatarOptions =
  document.querySelectorAll(".avatar-option");


/* User data */

let selectedAvatar =
  localStorage.getItem("userAvatar") || "🌊";


/* Avatar selection */

avatarOptions.forEach((avatar) => {

  if (
    avatar.dataset.avatar === selectedAvatar
  ) {

    avatar.classList.add("active");

  }


  avatar.addEventListener(
    "click",
    () => {

      avatarOptions.forEach((item) => {

        item.classList.remove("active");

      });


      avatar.classList.add("active");

      selectedAvatar =
        avatar.dataset.avatar;

    }
  );

});


/* Generate room code */

function generateRoomCode() {

  const characters =
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let code = "";

  for (let i = 0; i < 6; i++) {

    code += characters.charAt(
      Math.floor(
        Math.random() *
        characters.length
      )
    );

  }

  return code;

}


/* Save user */

function saveUserData(
  username,
  roomCode
) {

  localStorage.setItem(
    "username",
    username
  );

  localStorage.setItem(
    "userAvatar",
    selectedAvatar
  );

  localStorage.setItem(
    "roomCode",
    roomCode
  );

}


/* Create room */

if (createRoomBtn) {

  createRoomBtn.addEventListener(
    "click",
    () => {

      const username =
        usernameInput.value.trim();

      if (!username) {

        alert(
          "Please enter your name first."
        );

        usernameInput.focus();

        return;

      }


      const roomCode =
        generateRoomCode();


      saveUserData(
        username,
        roomCode
      );


      window.location.href =
        "room.html";

    }
  );

}


/* Join room */

if (joinRoomBtn) {

  joinRoomBtn.addEventListener(
    "click",
    () => {

      const username =
        usernameInput.value.trim();

      const roomCode =
        roomCodeInput.value
          .trim()
          .toUpperCase();


      if (!username) {

        alert(
          "Please enter your name first."
        );

        usernameInput.focus();

        return;

      }


      if (!roomCode) {

        alert(
          "Enter a room code to join."
        );

        roomCodeInput.focus();

        return;

      }


      saveUserData(
        username,
        roomCode
      );


      window.location.href =
        "room.html";

    }
  );

}


/* Socket status */

socket.on(
  "connect",
  () => {

    console.log(
      "Connected to Parallel server"
    );

  }
);


socket.on(
  "connect_error",
  () => {

    console.log(
      "Parallel server is offline"
    );

  }
);