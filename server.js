const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});


/* =========================
   SERVE FRONTEND
========================= */

app.use(
  express.static("public")
);


/* =========================
   ROOM STORAGE
========================= */

const rooms = {};


/* =========================
   SOCKET CONNECTION
========================= */

io.on(
  "connection",
  (socket) => {

    console.log(
      "User connected:",
      socket.id
    );


    /* =========================
       JOIN ROOM
    ========================= */

    socket.on(
      "join-room",
      ({
        roomCode,
        username,
        avatar
      }) => {

        if (!roomCode) return;


        /*
          Leave previous room
        */

        if (
          socket.roomCode &&
          socket.roomCode !== roomCode
        ) {

          socket.leave(
            socket.roomCode
          );

        }


        socket.join(roomCode);

        socket.roomCode =
          roomCode;


        /*
          Create room if needed
        */

        if (!rooms[roomCode]) {

          rooms[roomCode] = {
            members: []
          };

        }


        /*
          Prevent duplicate member
        */

        const existingMemberIndex =
          rooms[roomCode].members.findIndex(
            (member) =>
              member.id === socket.id
          );


        const user = {

          id: socket.id,

          username:
            username || "Guest",

          avatar:
            avatar || "🌊"

        };


        if (
          existingMemberIndex === -1
        ) {

          rooms[roomCode]
            .members
            .push(user);

        } else {

          rooms[roomCode]
            .members[
              existingMemberIndex
            ] = user;

        }


        /*
          Send current members
        */

        io.to(roomCode).emit(
          "room-members",
          rooms[roomCode].members
        );


        /*
          Notify others
        */

        socket.to(roomCode).emit(
          "user-joined",
          user
        );


        console.log(
          `${user.username} joined room ${roomCode}`
        );

      }
    );


    /* =========================
       LIVE CHAT
    ========================= */

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

            senderId:
              socket.id,

            message,

            username:
              username || "Guest",

            avatar:
              avatar || "🌊",

            createdAt:
              new Date().toISOString()

          }
        );

      }
    );


    /* =========================
       WEBRTC OFFER
    ========================= */

    socket.on(
      "webrtc-offer",
      ({
        offer,
        target
      }) => {

        if (!target || !offer) {
          return;
        }


        io.to(target).emit(
          "webrtc-offer",
          {

            offer,

            sender:
              socket.id

          }
        );

      }
    );


    /* =========================
       WEBRTC ANSWER
    ========================= */

    socket.on(
      "webrtc-answer",
      ({
        answer,
        target
      }) => {

        if (!target || !answer) {
          return;
        }


        io.to(target).emit(
          "webrtc-answer",
          {

            answer,

            sender:
              socket.id

          }
        );

      }
    );


    /* =========================
       ICE CANDIDATE
    ========================= */

    socket.on(
      "ice-candidate",
      ({
        candidate,
        target
      }) => {

        if (
          !target ||
          !candidate
        ) {
          return;
        }


        io.to(target).emit(
          "ice-candidate",
          {

            candidate,

            sender:
              socket.id

          }
        );

      }
    );


    /* =========================
       CINEMA SYNC
    ========================= */

    socket.on(
      "cinema-sync",
      ({
        roomCode,
        action,
        currentTime,
        videoName
      }) => {

        if (!roomCode) return;


        socket.to(roomCode).emit(
          "cinema-sync",
          {

            action,

            currentTime,

            videoName,

            sender:
              socket.id

          }
        );

      }
    );


    /* =========================
       GALLERY SYNC
    ========================= */

    socket.on(
      "update-gallery",
      ({
        roomCode,
        photos
      }) => {

        if (
          !roomCode ||
          !Array.isArray(photos)
        ) {
          return;
        }


        socket.to(roomCode).emit(
          "gallery-updated",
          photos
        );

      }
    );


    /* =========================
       MEMORIES SYNC
    ========================= */

    socket.on(
      "update-memories",
      ({
        roomCode,
        memories
      }) => {

        if (
          !roomCode ||
          !Array.isArray(memories)
        ) {
          return;
        }


        socket.to(roomCode).emit(
          "memories-updated",
          memories
        );

      }
    );


    /* =========================
       CANVAS DRAW
    ========================= */

    socket.on(
      "canvas-draw",
      ({
        roomCode,
        drawing
      }) => {

        if (
          !roomCode ||
          !drawing
        ) {
          return;
        }


        socket.to(roomCode).emit(
          "canvas-draw",
          drawing
        );

      }
    );


    /* =========================
       CANVAS CLEAR
    ========================= */

    socket.on(
      "canvas-clear",
      ({
        roomCode
      }) => {

        if (!roomCode) return;


        socket.to(roomCode).emit(
          "canvas-clear"
        );

      }
    );


    /* =========================
       NOTES SYNC
    ========================= */

    socket.on(
      "update-notes",
      ({
        roomCode,
        notes
      }) => {

        if (
          !roomCode ||
          !Array.isArray(notes)
        ) {
          return;
        }


        socket.to(roomCode).emit(
          "notes-updated",
          notes
        );

      }
    );


    /* =========================
       DISCONNECT
    ========================= */

    socket.on(
      "disconnect",
      () => {

        const roomCode =
          socket.roomCode;


        if (
          roomCode &&
          rooms[roomCode]
        ) {

          rooms[roomCode].members =
            rooms[
              roomCode
            ].members.filter(
              (member) =>
                member.id !== socket.id
            );


          /*
            Notify room
          */

          io.to(roomCode).emit(
            "user-left",
            socket.id
          );


          /*
            Update members
          */

          io.to(roomCode).emit(
            "room-members",
            rooms[roomCode].members
          );


          /*
            Delete empty room
          */

          if (
            rooms[roomCode]
              .members.length === 0
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

  }
);


/* =========================
   START SERVER
========================= */

const PORT =
  process.env.PORT || 3000;


server.listen(
  PORT,
  () => {

    console.log(
      `Parallel is running on port ${PORT}`
    );

  }
);