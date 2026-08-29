const socket = io();

const roomCode = localStorage.getItem("roomCode");
const username = localStorage.getItem("username") || "Guest";

if (!roomCode) {
  window.location.href = "index.html";
}


/* =========================
   JOIN PARALLEL ROOM
========================= */

socket.emit("join-room", {
  roomCode,
  username,
  avatar: localStorage.getItem("userAvatar") || "🌊"
});


/* =========================
   ELEMENTS
========================= */

const roomCodeDisplay =
  document.getElementById("roomCodeDisplay");

const cinemaVideo =
  document.getElementById("cinemaVideo");

const videoInput =
  document.getElementById("videoInput");

const videoTitle =
  document.getElementById("videoTitle");

const playBtn =
  document.getElementById("playBtn");

const pauseBtn =
  document.getElementById("pauseBtn");

const restartBtn =
  document.getElementById("restartBtn");

const cinemaStatus =
  document.getElementById("cinemaStatus");


/* =========================
   DISPLAY ROOM
========================= */

if (roomCodeDisplay) {
  roomCodeDisplay.textContent =
    `ROOM ${roomCode}`;
}


/* =========================
   PREVENT SYNC LOOP
========================= */

let syncingFromRemote = false;


/* =========================
   UPDATE STATUS
========================= */

function updateStatus(text) {

  if (cinemaStatus) {
    cinemaStatus.textContent = text;
  }

}


/* =========================
   SEND SYNC EVENT
========================= */

function sendCinemaSync(
  action,
  currentTime,
  videoName
) {

  socket.emit("cinema-sync", {

    roomCode,

    action,

    currentTime,

    videoName

  });

}


/* =========================
   VIDEO SELECT
========================= */

if (videoInput) {

  videoInput.addEventListener(
    "change",
    () => {

      const file =
        videoInput.files[0];

      if (!file) return;


      const videoURL =
        URL.createObjectURL(file);

      cinemaVideo.src =
        videoURL;


      if (videoTitle) {
        videoTitle.textContent =
          file.name;
      }


      updateStatus(
        "Video selected"
      );


      /*
        IMPORTANT:
        Only the name is synced.
        Each user must have access
        to the same video locally.
      */

      sendCinemaSync(
        "video-selected",
        0,
        file.name
      );

    }
  );

}


/* =========================
   PLAY
========================= */

if (playBtn) {

  playBtn.addEventListener(
    "click",
    async () => {

      try {

        await cinemaVideo.play();

        updateStatus(
          "Playing together"
        );


        if (!syncingFromRemote) {

          sendCinemaSync(
            "play",
            cinemaVideo.currentTime,
            videoTitle
              ? videoTitle.textContent
              : ""
          );

        }

      } catch (error) {

        console.error(
          "Video play error:",
          error
        );

      }

    }
  );

}


/* =========================
   PAUSE
========================= */

if (pauseBtn) {

  pauseBtn.addEventListener(
    "click",
    () => {

      cinemaVideo.pause();

      updateStatus(
        "Paused"
      );


      if (!syncingFromRemote) {

        sendCinemaSync(
          "pause",
          cinemaVideo.currentTime,
          videoTitle
            ? videoTitle.textContent
            : ""
        );

      }

    }
  );

}


/* =========================
   RESTART
========================= */

if (restartBtn) {

  restartBtn.addEventListener(
    "click",
    async () => {

      cinemaVideo.currentTime = 0;

      try {
        await cinemaVideo.play();
      } catch (error) {
        console.error(error);
      }


      updateStatus(
        "Restarted"
      );


      if (!syncingFromRemote) {

        sendCinemaSync(
          "restart",
          0,
          videoTitle
            ? videoTitle.textContent
            : ""
        );

      }

    }
  );

}


/* =========================
   SEEK SYNC
========================= */

cinemaVideo.addEventListener(
  "seeked",
  () => {

    if (syncingFromRemote) return;


    sendCinemaSync(
      "seek",
      cinemaVideo.currentTime,
      videoTitle
        ? videoTitle.textContent
        : ""
    );

  }
);


/* =========================
   RECEIVE REAL-TIME SYNC
========================= */

socket.on(
  "cinema-sync",
  async ({
    action,
    currentTime,
    videoName
  }) => {

    if (!cinemaVideo) return;


    syncingFromRemote = true;


    try {

      if (
        typeof currentTime === "number"
      ) {

        cinemaVideo.currentTime =
          currentTime;

      }


      switch (action) {

        case "play":

          await cinemaVideo.play();

          updateStatus(
            "Playing together"
          );

          break;


        case "pause":

          cinemaVideo.pause();

          updateStatus(
            "Paused by your friend"
          );

          break;


        case "restart":

          cinemaVideo.currentTime = 0;

          await cinemaVideo.play();

          updateStatus(
            "Restarted together"
          );

          break;


        case "seek":

          updateStatus(
            "Synced"
          );

          break;


        case "video-selected":

          /*
            Remote user cannot receive
            the actual local video file.
          */

          if (videoTitle) {

            videoTitle.textContent =
              `${videoName} — select this video`;

          }

          updateStatus(
            "Friend selected a video"
          );

          break;

      }

    } catch (error) {

      console.error(
        "Cinema sync error:",
        error
      );

    }


    setTimeout(
      () => {

        syncingFromRemote = false;

      },
      100
    );

  }
);


/* =========================
   VIDEO ENDED
========================= */

if (cinemaVideo) {

  cinemaVideo.addEventListener(
    "ended",
    () => {

      updateStatus(
        "Movie ended"
      );

    }
  );

}


/* =========================
   CONNECTION STATUS
========================= */

socket.on(
  "connect",
  () => {

    console.log(
      "Cinema connected to Parallel"
    );

  }
);


socket.on(
  "user-joined",
  (user) => {

    updateStatus(
      `${user.username} joined`
    );

  }
);