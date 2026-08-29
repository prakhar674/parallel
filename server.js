const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();

const server = http.createServer(app);

const io = new Server(server);


/* Serve frontend */

app.use(
  express.static(
    path.join(__dirname, "public")
  )
);


/* Store rooms */

const rooms = {};


/* Socket connection */

io.on("connection", (socket) => {

  console.log(
    "User connected:",
    socket.id
  );


  /* Join room */

  socket.on(
    "join-room",
    ({
      roomCode,
      username,
      avatar
    }) => {

      if (!roomCode) return;


      socket.join(roomCode);


      /* Create room if needed */

      if (!rooms[roomCode]) {

        rooms[roomCode] = [];

      }


      /* Add user */

      const user = {
        id: socket.id,
        username:
          username || "Guest",
        avatar:
          avatar || "🌊"
      };


      /* Prevent duplicate */

      const alreadyExists =
        rooms[roomCode].some(
          (member) =>
            member.id === socket.id
        );


      if (!alreadyExists) {

        rooms[roomCode].push(user);

      }


      /* Save room on socket */

      socket.roomCode = roomCode;


      /* Send existing members */

      socket.emit(
        "room-members",
        rooms[roomCode]
      );


      /* Notify everyone */

      io.to(roomCode).emit(
        "room-members",
        rooms[roomCode]
      );


      /* Notify others */

      socket.to(roomCode).emit(
        "user-joined",
        user
      );


      console.log(
        `${username} joined room ${roomCode}`
      );

    }
  );


  /* Real-time chat */

  socket.on(
    "send-message",
    ({
      roomCode,
      message,
      username,
      avatar
    }) => {

      if (
        !roomCode ||
        !message
      ) return;


      io.to(roomCode).emit(
        "receive-message",
        {
          id: Date.now(),

          message,

          username:
            username || "Guest",

          avatar:
            avatar || "🌊",

          senderId:
            socket.id,

          time:
            new Date()
              .toISOString()
        }
      );

    }
  );


  /* WebRTC offer */

  socket.on(
    "webrtc-offer",
    ({
      roomCode,
      offer,
      target
    }) => {

      io.to(target).emit(
        "webrtc-offer",
        {
          offer,
          sender: socket.id
        }
      );

    }
  );


  /* WebRTC answer */

  socket.on(
    "webrtc-answer",
    ({
      answer,
      target
    }) => {

      io.to(target).emit(
        "webrtc-answer",
        {
          answer,
          sender: socket.id
        }
      );

    }
  );


  /* WebRTC ICE candidate */

  socket.on(
    "ice-candidate",
    ({
      candidate,
      target
    }) => {

      io.to(target).emit(
        "ice-candidate",
        {
          candidate,
          sender: socket.id
        }
      );

    }
  );


  /* Shared notes */

  socket.on(
    "update-notes",
    ({
      roomCode,
      notes
    }) => {

      socket.to(roomCode).emit(
        "notes-updated",
        notes
      );

    }
  );


  /* Shared canvas */

  socket.on(
    "canvas-draw",
    ({
      roomCode,
      drawing
    }) => {

      socket.to(roomCode).emit(
        "canvas-draw",
        drawing
      );

    }
  );


  /* Shared canvas clear */

  socket.on(
    "canvas-clear",
    ({
      roomCode
    }) => {

      socket.to(roomCode).emit(
        "canvas-clear"
      );

    }
  );


  /* Shared memories */

  socket.on(
    "update-memories",
    ({
      roomCode,
      memories
    }) => {

      socket.to(roomCode).emit(
        "memories-updated",
        memories
      );

    }
  );


  /* Shared gallery */

  socket.on(
    "update-gallery",
    ({
      roomCode,
      photos
    }) => {

      socket.to(roomCode).emit(
        "gallery-updated",
        photos
      );

    }
  );


  /* Cinema sync */

  socket.on(
    "cinema-sync",
    ({
      roomCode,
      action,
      currentTime,
      videoName
    }) => {

      socket.to(roomCode).emit(
        "cinema-sync",
        {
          action,
          currentTime,
          videoName
        }
      );

    }
  );


  /* User disconnect */

  socket.on(
    "disconnect",
    () => {

      const roomCode =
        socket.roomCode;


      if (
        roomCode &&
        rooms[roomCode]
      ) {

        rooms[roomCode] =
          rooms[roomCode].filter(
            (user) =>
              user.id !== socket.id
          );


        socket.to(roomCode).emit(
          "user-left",
          socket.id
        );


        io.to(roomCode).emit(
          "room-members",
          rooms[roomCode]
        );


        /* Delete empty room */

        if (
          rooms[roomCode]
            .length === 0
        ) {

          delete rooms[roomCode];

        }

      }


      console.log(
        "User disconnected:",
        socket.id
      );

    }
  );

});


/* Start server */

const PORT =
  process.env.PORT || 3000;


server.listen(
  PORT