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

const canvas = document.getElementById("drawingCanvas");
const ctx = canvas.getContext("2d");

const drawingArea = document.querySelector(".drawing-area");
const canvasEmpty = document.getElementById("canvasEmpty");

const colorPicker = document.getElementById("colorPicker");
const brushSize = document.getElementById("brushSize");
const brushSizeValue = document.getElementById("brushSizeValue");

const eraserBtn = document.getElementById("eraserBtn");
const clearCanvasBtn = document.getElementById("clearCanvasBtn");
const undoBtn = document.getElementById("undoBtn");
const saveCanvasBtn = document.getElementById("saveCanvasBtn");

const canvasStatus = document.getElementById("canvasStatus");


/* Display room and user data */

roomCodeDisplay.textContent = `ROOM ${roomCode}`;
usernameDisplay.textContent = username;
userAvatarDisplay.textContent = userAvatar;


/* Canvas storage */

const canvasStorageKey = `parallelCanvas_${roomCode}`;

let drawing = false;
let hasDrawn = false;
let isEraser = false;

let brushColor = colorPicker.value;
let brushWidth = Number(brushSize.value);

let history = [];


/* Resize canvas */

function setupCanvas() {

  const savedDrawing =
    localStorage.getItem(canvasStorageKey);

  const rect = drawingArea.getBoundingClientRect();

  canvas.width = rect.width;
  canvas.height = rect.height;

  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (savedDrawing) {

    const image = new Image();

    image.onload = () => {

      ctx.drawImage(
        image,
        0,
        0,
        canvas.width,
        canvas.height
      );

      hasDrawn = true;

      canvasEmpty.style.display = "none";

    };

    image.src = savedDrawing;
  }

}


/* Save history */

function saveHistory() {

  if (history.length >= 30) {
    history.shift();
  }

  history.push(
    canvas.toDataURL("image/png")
  );

}


/* Get pointer position */

function getPosition(event) {

  const rect =
    canvas.getBoundingClientRect();

  return {

    x:
      (event.clientX - rect.left) *
      (canvas.width / rect.width),

    y:
      (event.clientY - rect.top) *
      (canvas.height / rect.height)

  };

}


/* Start drawing */

function startDrawing(event) {

  event.preventDefault();

  drawing = true;

  const position =
    getPosition(event);

  ctx.beginPath();

  ctx.moveTo(
    position.x,
    position.y
  );

  saveHistory();

}


/* Draw */

function draw(event) {

  if (!drawing) return;

  event.preventDefault();

  const position =
    getPosition(event);

  ctx.lineWidth = brushWidth;

  ctx.strokeStyle =
    isEraser
      ? "#06101e"
      : brushColor;

  ctx.lineTo(
    position.x,
    position.y
  );

  ctx.stroke();

  hasDrawn = true;

  canvasEmpty.style.display = "none";

}


/* Stop drawing */

function stopDrawing() {

  if (!drawing) return;

  drawing = false;

  ctx.closePath();

  localStorage.setItem(
    canvasStorageKey,
    canvas.toDataURL("image/png")
  );

  canvasStatus.textContent =
    "Drawing saved";

}


/* Pointer events */

canvas.addEventListener(
  "pointerdown",
  startDrawing
);

canvas.addEventListener(
  "pointermove",
  draw
);

canvas.addEventListener(
  "pointerup",
  stopDrawing
);

canvas.addEventListener(
  "pointerleave",
  stopDrawing
);


/* Change color */

colorPicker.addEventListener(
  "input",
  () => {

    brushColor = colorPicker.value;

    isEraser = false;

    eraserBtn.classList.remove(
      "active"
    );

  }
);


/* Change brush size */

brushSize.addEventListener(
  "input",
  () => {

    brushWidth =
      Number(brushSize.value);

    brushSizeValue.textContent =
      `${brushWidth}px`;

  }
);


/* Eraser */

eraserBtn.addEventListener(
  "click",
  () => {

    isEraser = !isEraser;

    eraserBtn.classList.toggle(
      "active",
      isEraser
    );

    canvasStatus.textContent =
      isEraser
        ? "Eraser active"
        : "Brush active";

  }
);


/* Clear canvas */

clearCanvasBtn.addEventListener(
  "click",
  () => {

    const confirmed = confirm(
      "Clear the entire canvas?"
    );

    if (!confirmed) return;

    saveHistory();

    ctx.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    hasDrawn = false;

    canvasEmpty.style.display =
      "grid";

    localStorage.removeItem(
      canvasStorageKey
    );

    canvasStatus.textContent =
      "Canvas cleared";

  }
);


/* Undo */

undoBtn.addEventListener(
  "click",
  () => {

    if (history.length === 0) return;

    const previousState =
      history.pop();

    ctx.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    const image = new Image();

    image.onload = () => {

      ctx.drawImage(
        image,
        0,
        0,
        canvas.width,
        canvas.height
      );

      localStorage.setItem(
        canvasStorageKey,
        canvas.toDataURL("image/png")
      );

      canvasStatus.textContent =
        "Last stroke undone";

    };

    image.src = previousState;

    hasDrawn = true;

    canvasEmpty.style.display =
      "none";

  }
);


/* Save drawing as image */

saveCanvasBtn.addEventListener(
  "click",
  () => {

    if (!hasDrawn) {

      alert(
        "Draw something first!"
      );

      return;

    }

    const link =
      document.createElement("a");

    link.download =
      `parallel-${roomCode}-drawing.png`;

    link.href =
      canvas.toDataURL("image/png");

    link.click();

    canvasStatus.textContent =
      "Drawing saved ✓";

  }
);


/* Handle resizing */

window.addEventListener(
  "resize",
  () => {

    const currentDrawing =
      canvas.toDataURL("image/png");

    const rect =
      drawingArea.getBoundingClientRect();

    canvas.width = rect.width;
    canvas.height = rect.height;

    const image = new Image();

    image.onload = () => {

      ctx.drawImage(
        image,
        0,
        0,
        canvas.width,
        canvas.height
      );

    };

    image.src = currentDrawing;

  }
);


/* Initial setup */

setupCanvas();

brushSizeValue.textContent =
  `${brushWidth}px`;