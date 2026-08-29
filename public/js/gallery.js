const socket = io();

const roomCode =
  localStorage.getItem("roomCode");

const username =
  localStorage.getItem("username") || "Guest";

const avatar =
  localStorage.getItem("userAvatar") || "🌊";

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
   STORAGE
========================= */

const storageKey =
  `parallelGallery_${roomCode}`;

let photos =
  JSON.parse(
    localStorage.getItem(storageKey)
  ) || [];


/* =========================
   ELEMENTS
========================= */

const galleryGrid =
  document.getElementById("galleryGrid");

const galleryEmpty =
  document.getElementById("galleryEmpty");

const photoInput =
  document.getElementById("photoInput");

const uploadBtn =
  document.getElementById("uploadBtn");

const clearGalleryBtn =
  document.getElementById("clearGalleryBtn");

const photoCount =
  document.getElementById("photoCount");

const roomCodeDisplay =
  document.getElementById("roomCodeDisplay");


if (roomCodeDisplay) {
  roomCodeDisplay.textContent =
    `ROOM ${roomCode}`;
}


/* =========================
   SAVE LOCAL
========================= */

function savePhotos() {

  localStorage.setItem(
    storageKey,
    JSON.stringify(photos)
  );

}


/* =========================
   SEND TO ROOM
========================= */

function broadcastGallery() {

  socket.emit("update-gallery", {
    roomCode,
    photos
  });

}


/* =========================
   UPDATE COUNT
========================= */

function updateCount() {

  if (photoCount) {
    photoCount.textContent =
      photos.length;
  }

}


/* =========================
   RENDER
========================= */

function renderGallery() {

  if (!galleryGrid) return;

  galleryGrid.innerHTML = "";


  if (photos.length === 0) {

    if (galleryEmpty) {

      galleryGrid.appendChild(
        galleryEmpty
      );

    }

    updateCount();

    return;
  }


  photos.forEach((photo) => {

    const card =
      document.createElement("div");

    card.className =
      "gallery-item";


    const image =
      document.createElement("img");

    image.src =
      photo.data;

    image.alt =
      photo.name || "Parallel photo";


    const info =
      document.createElement("div");

    info.className =
      "gallery-photo-info";

    info.innerHTML = `
      <strong>
        ${photo.name || "Photo"}
      </strong>

      <small>
        by ${photo.username || "Guest"}
      </small>
    `;


    const deleteBtn =
      document.createElement("button");

    deleteBtn.className =
      "gallery-delete";

    deleteBtn.textContent =
      "Delete";


    deleteBtn.addEventListener(
      "click",
      (event) => {

        event.stopPropagation();

        deletePhoto(photo.id);

      }
    );


    card.appendChild(image);

    card.appendChild(info);

    card.appendChild(deleteBtn);


    card.addEventListener(
      "click",
      () => {

        openPhoto(photo);

      }
    );


    galleryGrid.appendChild(card);

  });


  updateCount();

}


/* =========================
   ADD PHOTOS
========================= */

function addPhotos(files) {

  if (!files || files.length === 0) {
    return;
  }


  Array.from(files).forEach(
    (file) => {

      if (!file.type.startsWith("image/")) {
        return;
      }


      const reader =
        new FileReader();


      reader.onload =
        (event) => {

          const photo = {

            id:
              `${Date.now()}-${Math.random()}`,

            data:
              event.target.result,

            name:
              file.name,

            username,

            avatar,

            createdAt:
              new Date().toISOString()

          };


          photos.unshift(photo);

          savePhotos();

          renderGallery();

          broadcastGallery();

        };


      reader.readAsDataURL(file);

    }
  );

}


/* =========================
   INPUT
========================= */

if (photoInput) {

  photoInput.addEventListener(
    "change",
    () => {

      addPhotos(
        photoInput.files
      );

    }
  );

}


/* =========================
   UPLOAD BUTTON
========================= */

if (uploadBtn) {

  uploadBtn.addEventListener(
    "click",
    () => {

      if (photoInput) {
        photoInput.click();
      }

    }
  );

}


/* =========================
   DELETE
========================= */

function deletePhoto(id) {

  const confirmed =
    confirm("Delete this photo?");

  if (!confirmed) return;


  photos =
    photos.filter(
      (photo) =>
        photo.id !== id
    );


  savePhotos();

  renderGallery();

  broadcastGallery();

}


/* =========================
   CLEAR
========================= */

if (clearGalleryBtn) {

  clearGalleryBtn.addEventListener(
    "click",
    () => {

      if (photos.length === 0) {
        return;
      }


      const confirmed =
        confirm(
          "Clear all photos from this room?"
        );


      if (!confirmed) return;


      photos = [];

      savePhotos();

      renderGallery();

      broadcastGallery();

    }
  );

}


/* =========================
   RECEIVE GALLERY
========================= */

socket.on(
  "gallery-updated",
  (incomingPhotos) => {

    if (!Array.isArray(incomingPhotos)) {
      return;
    }


    /*
      Replace local gallery with
      the shared room gallery.
    */

    photos =
      incomingPhotos;


    savePhotos();

    renderGallery();

  }
);


/* =========================
   PHOTO VIEWER
========================= */

function openPhoto(photo) {

  const viewer =
    document.createElement("div");

  viewer.className =
    "gallery-viewer";


  viewer.innerHTML = `
    <div class="gallery-viewer-content">

      <button class="gallery-viewer-close">
        ×
      </button>

      <img
        src="${photo.data}"
        alt="Parallel photo"
      >

      <div>
        <strong>
          ${photo.name || "Photo"}
        </strong>

        <small>
          by ${photo.username || "Guest"}
        </small>
      </div>

    </div>
  `;


  document.body.appendChild(
    viewer
  );


  viewer
    .querySelector(
      ".gallery-viewer-close"
    )
    .addEventListener(
      "click",
      () => {

        viewer.remove();

      }
    );


  viewer.addEventListener(
    "click",
    (event) => {

      if (event.target === viewer) {
        viewer.remove();
      }

    }
  );

}


/* =========================
   SOCKET STATUS
========================= */

socket.on(
  "connect",
  () => {

    console.log(
      "Gallery connected to Parallel"
    );

  }
);


/* =========================
   INITIAL RENDER
========================= */

renderGallery();