const socket = io();

const roomCode = localStorage.getItem("roomCode");
const username = localStorage.getItem("username") || "Guest";
const avatar = localStorage.getItem("userAvatar") || "🌊";

if (!roomCode) {
  window.location.href = "index.html";
}


/* =========================
   JOIN ROOM
========================= */

socket.emit("join-room", {
  roomCode,
  username,
  avatar
});


/* =========================
   ELEMENTS
========================= */

const canvas = document.getElementById("drawingCanvas");
const ctx = canvas ? canvas.getContext("2d") : null;

const roomCodeDisplay =
  document.getElementById("roomCodeDisplay");

const clearCanvasBtn =
  document.getElementById("clearCanvasBtn");

const colorButtons =
  document.querySelectorAll(".color-btn");

const brushSizeInput =
  document.getElementById("brushSize");


if (roomCodeDisplay) {
  roomCodeDisplay.textContent = `ROOM ${roomCode}`;
}


/* =========================
   DRAWING STATE
========================= */

let isDrawing = false;

let currentColor = "#66e3ff";

let brushSize = 5;

let lastX = 0;

let lastY = 0;


/* =========================
   CANVAS SETUP
========================= */

function setupCanvas() {

  if (!canvas || !ctx) return;

  const rect =
    canvas.getBoundingClientRect();

  const savedImage =
    ctx.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    );

  canvas.width =
    rect.width;

  canvas.height =
    rect.height;

  ctx.putImageData(
    savedImage,
    0,
    0
  );

  ctx.lineCap = "round";
  ctx.lineJoin = "round";

}

setupCanvas();

window.addEventListener(
  "resize",
  setupCanvas
);


/* =========================
   DRAW LINE
========================= */

function drawLine(
  startX,
  startY,
  endX,
  endY,
  color,
  size
) {

  if (!ctx) return;

  ctx.beginPath();

  ctx.moveTo(
    startX,
    startY
  );

  ctx.lineTo(
    endX,
    endY
  );

  ctx.strokeStyle =
    color;

  ctx.lineWidth =
    size;

  ctx.stroke();

}


/* =========================
   GET POSITION
========================= */

function getCanvasPosition(event) {

  const rect =
    canvas.getBoundingClientRect();

  let clientX;
  let clientY;


  if (event.touches) {

    clientX =
      event.touches[0].clientX;

    clientY =
      event.touches[0].clientY;

  } else {

    clientX =
      event.clientX;

    clientY =
      event.clientY;

  }


  return {

    x:
      clientX - rect.left,

    y:
      clientY - rect.top

  };

}


/* =========================
   START DRAWING
========================= */

function startDrawing(event) {

  if (!canvas) return;

  event.preventDefault();

  const position =
    getCanvasPosition(event);


  isDrawing = true;

  lastX =
    position.x;

  lastY =
    position.y;

}


/* =========================
   DRAW
========================= */

function draw(event) {

  if (
    !isDrawing ||
    !canvas
  ) return;

  event.preventDefault();

  const position =
    getCanvasPosition(event);


  drawLine(
    lastX,
    lastY,
    position.x,
    position.y,
    currentColor,
    brushSize
  );


  socket.emit(
    "canvas-draw",
    {
      roomCode,

      drawing: {

        startX: lastX,
        startY: lastY,

        endX: position.x,
        endY: position.y,

        color: currentColor,

        size: brushSize,

        canvasWidth:
          canvas.width,

        canvasHeight:
          canvas.height

      }

    }
  );


  lastX =
    position.x;

  lastY =
    position.y;

}


/* =========================
   STOP DRAWING
========================= */

function stopDrawing() {

  isDrawing = false;

}


/* =========================
   MOUSE EVENTS
========================= */

canvas.addEventListener(
  "mousedown",
  startDrawing
);

canvas.addEventListener(
  "mousemove",
  draw
);

canvas.addEventListener(
  "mouseup",
  stopDrawing
);

canvas.addEventListener(
  "mouseleave",
  stopDrawing
);


/* =========================
   TOUCH EVENTS
========================= */

canvas.addEventListener(
  "touchstart",
  startDrawing,
  { passive: false }
);

canvas.addEventListener(
  "touchmove",
  draw,
  { passive: false }
);

canvas.addEventListener(
  "touchend",
  stopDrawing
);


/* =========================
   RECEIVE DRAWING
========================= */

socket.on(
  "canvas-draw",
  (drawing) => {

    if (
      !drawing ||
      !canvas
    ) return;


    const scaleX =
      canvas.width /
      drawing.canvasWidth;

    const scaleY =
      canvas.height /
      drawing.canvasHeight;


    drawLine(

      drawing.startX * scaleX,
      drawing.startY * scaleY,

      drawing.endX * scaleX,
      drawing.endY * scaleY,

      drawing.color,

      drawing.size *
      ((scaleX + scaleY) / 2)

    );

  }
);


/* =========================
   COLOR PICKER
========================= */

colorButtons.forEach(
  (button) => {

    button.addEventListener(
      "click",
      () => {

        currentColor =
          button.dataset.color;

        colorButtons.forEach(
          (item) => {

            item.classList.remove(
              "active"
            );

          }
        );

        button.classList.add(
          "active"
        );

      }
    );

  }
);


/* =========================
   BRUSH SIZE
========================= */

if (brushSizeInput) {

  brushSizeInput.addEventListener(
    "input",
    () => {

      brushSize =
        Number(
          brushSizeInput.value
        );

    }
  );

}


/* =========================
   CLEAR CANVAS
========================= */

function clearCanvas() {

  if (!canvas || !ctx) return;

  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

}


if (clearCanvasBtn) {

  clearCanvasBtn.addEventListener(
    "click",
    () => {

      const confirmed =
        confirm(
          "Clear the shared canvas?"
        );

      if (!confirmed) return;


      clearCanvas();


      socket.emit(
        "canvas-clear",
        {
          roomCode
        }
      );

    }
  );

}


/* =========================
   RECEIVE CLEAR
========================= */

socket.on(
  "canvas-clear",
  () => {

    clearCanvas();

  }
);


/* =========================
   CONNECTION
========================= */

socket.on(
  "connect",
  () => {

    console.log(
      "Canvas connected to Parallel"
    );

  }
);