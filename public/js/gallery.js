const roomCode = localStorage.getItem("roomCode");
const username = localStorage.getItem("username") || "You";

/* Protect page */

if (!roomCode) {
  window.location.href = "index.html";
}

/* Elements */

const roomCodeDisplay = document.getElementById("roomCodeDisplay");
const galleryInput = document.getElementById("galleryInput");
const photoGrid = document.getElementById("photoGrid");
const galleryEmpty = document.getElementById("galleryEmpty");

const photoCount = document.getElementById("photoCount");
const todayCount = document.getElementById("todayCount");

const clearGalleryBtn = document.getElementById("clearGalleryBtn");

const photoModal = document.getElementById("photoModal");
const modalImage = document.getElementById("modalImage");
const closeModalBtn = document.getElementById("closeModalBtn");


/* Display room code */

roomCodeDisplay.textContent = `ROOM ${roomCode}`;


/* Storage key for this room */

const galleryStorageKey = `parallelGallery_${roomCode}`;


/* Get saved photos */

let photos = JSON.parse(
  localStorage.getItem(galleryStorageKey)
) || [];


/* Save photos */

function savePhotos() {
  localStorage.setItem(
    galleryStorageKey,
    JSON.stringify(photos)
  );
}


/* Update stats */

function updateStats() {

  photoCount.textContent = photos.length;

  const today = new Date().toDateString();

  const todayPhotos = photos.filter((photo) => {
    return new Date(photo.date).toDateString() === today;
  });

  todayCount.textContent = todayPhotos.length;
}


/* Open photo */

function openPhoto(imageSrc) {

  modalImage.src = imageSrc;

  photoModal.classList.add("active");
}


/* Render gallery */

function renderGallery() {

  photoGrid.innerHTML = "";

  if (photos.length === 0) {

    photoGrid.appendChild(galleryEmpty);

    updateStats();

    return;
  }

  photos.forEach((photo, index) => {

    const photoItem = document.createElement("div");

    photoItem.className = "photo-item";

    const image = document.createElement("img");

    image.src = photo.data;
    image.alt = `Parallel memory ${index + 1}`;

    photoItem.appendChild(image);

    photoItem.addEventListener("click", () => {
      openPhoto(photo.data);
    });

    photoGrid.appendChild(photoItem);

  });

  updateStats();
}


/* Add photos */

galleryInput.addEventListener("change", () => {

  const files = Array.from(galleryInput.files);

  if (!files.length) return;

  let processed = 0;

  files.forEach((file) => {

    const reader = new FileReader();

    reader.onload = (event) => {

      photos.push({
        data: event.target.result,
        date: new Date().toISOString(),
        addedBy: username
      });

      processed++;

      if (processed === files.length) {

        savePhotos();

        renderGallery();

      }

    };

    reader.readAsDataURL(file);

  });

  galleryInput.value = "";

});


/* Clear gallery */

clearGalleryBtn.addEventListener("click", () => {

  if (photos.length === 0) return;

  const confirmed = confirm(
    "Clear all photos from this Parallel gallery?"
  );

  if (!confirmed) return;

  photos = [];

  savePhotos();

  renderGallery();

});


/* Close modal */

closeModalBtn.addEventListener("click", () => {

  photoModal.classList.remove("active");

});


/* Close when clicking outside image */

photoModal.addEventListener("click", (event) => {

  if (event.target === photoModal) {
    photoModal.classList.remove("active");
  }

});


/* Initial render */

renderGallery();