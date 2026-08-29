const roomCode = localStorage.getItem("roomCode");
const username = localStorage.getItem("username") || "You";

/* Protect page */

if (!roomCode) {
  window.location.href = "index.html";
}

/* Elements */

const roomCodeDisplay = document.getElementById("roomCodeDisplay");

const memoryCount = document.getElementById("memoryCount");
const thisMonthCount = document.getElementById("thisMonthCount");
const latestMemoryDate = document.getElementById("latestMemoryDate");

const memoriesGrid = document.getElementById("memoriesGrid");
const memoriesEmpty = document.getElementById("memoriesEmpty");

const openMemoryModalBtn =
  document.getElementById("openMemoryModalBtn");

const emptyAddMemoryBtn =
  document.getElementById("emptyAddMemoryBtn");

const memoryModal =
  document.getElementById("memoryModal");

const closeMemoryModalBtn =
  document.getElementById("closeMemoryModalBtn");

const memoryForm =
  document.getElementById("memoryForm");

const memoryPhotoInput =
  document.getElementById("memoryPhotoInput");

const memoryPhotoPreview =
  document.getElementById("memoryPhotoPreview");

const memoryTitle =
  document.getElementById("memoryTitle");

const memoryDate =
  document.getElementById("memoryDate");

const memoryDescription =
  document.getElementById("memoryDescription");

const clearMemoriesBtn =
  document.getElementById("clearMemoriesBtn");

const memoryViewer =
  document.getElementById("memoryViewer");

const memoryViewerContent =
  document.getElementById("memoryViewerContent");

const closeMemoryViewerBtn =
  document.getElementById("closeMemoryViewerBtn");


/* Display room code */

roomCodeDisplay.textContent = `ROOM ${roomCode}`;


/* Storage */

const memoryStorageKey = `parallelMemories_${roomCode}`;

let memories = JSON.parse(
  localStorage.getItem(memoryStorageKey)
) || [];

let selectedPhoto = null;


/* Save memories */

function saveMemories() {
  localStorage.setItem(
    memoryStorageKey,
    JSON.stringify(memories)
  );
}


/* Set today's date by default */

function setTodayDate() {
  const today = new Date();

  const formattedDate =
    today.getFullYear() +
    "-" +
    String(today.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(today.getDate()).padStart(2, "0");

  memoryDate.value = formattedDate;
}


/* Open modal */

function openMemoryModal() {
  memoryModal.classList.add("active");
}


/* Close modal */

function closeMemoryModal() {
  memoryModal.classList.remove("active");

  memoryForm.reset();

  selectedPhoto = null;

  memoryPhotoPreview.innerHTML = `
    <span>📸</span>
    <p>Add a photo</p>
  `;

  setTodayDate();
}


/* Photo preview */

memoryPhotoInput.addEventListener("change", () => {

  const file = memoryPhotoInput.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = (event) => {

    selectedPhoto = event.target.result;

    memoryPhotoPreview.innerHTML = `
      <img
        src="${selectedPhoto}"
        alt="Memory preview"
      >
    `;
  };

  reader.readAsDataURL(file);

});


/* Format date */

function formatDate(dateString) {

  const date = new Date(
    dateString + "T00:00:00"
  );

  return date.toLocaleDateString(
    "en-US",
    {
      day: "numeric",
      month: "short",
      year: "numeric"
    }
  );

}


/* Update stats */

function updateStats() {

  memoryCount.textContent = memories.length;

  const now = new Date();

  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthMemories = memories.filter((memory) => {

    const date = new Date(
      memory.date + "T00:00:00"
    );

    return (
      date.getMonth() === currentMonth &&
      date.getFullYear() === currentYear
    );

  });

  thisMonthCount.textContent =
    monthMemories.length;


  if (memories.length === 0) {

    latestMemoryDate.textContent = "—";

    return;
  }


  const sortedMemories = [...memories].sort(
    (a, b) => {

      return new Date(
        b.date
      ) - new Date(
        a.date
      );

    }
  );

  latestMemoryDate.textContent =
    formatDate(sortedMemories[0].date);

}


/* Open memory viewer */

function openMemoryViewer(memory) {

  memoryViewerContent.innerHTML = `
    ${
      memory.photo
        ? `
          <img
            class="viewer-image"
            src="${memory.photo}"
            alt="${memory.title}"
          >
        `
        : ""
    }

    <div class="viewer-content">

      <span class="viewer-date">
        ${formatDate(memory.date)}
      </span>

      <h2>
        ${memory.title}
      </h2>

      ${
        memory.description
          ? `
            <p>
              ${memory.description}
            </p>
          `
          : ""
      }

    </div>
  `;

  memoryViewer.classList.add("active");

}


/* Render memories */

function renderMemories() {

  memoriesGrid.innerHTML = "";

  if (memories.length === 0) {

    memoriesGrid.appendChild(
      memoriesEmpty
    );

    updateStats();

    return;
  }


  const sortedMemories = [...memories].sort(
    (a, b) => {

      return new Date(
        b.date
      ) - new Date(
        a.date
      );

    }
  );


  sortedMemories.forEach((memory) => {

    const memoryItem =
      document.createElement("article");

    memoryItem.className =
      "memory-item";


    if (memory.photo) {

      const imageContainer =
        document.createElement("div");

      imageContainer.className =
        "memory-image";

      const image =
        document.createElement("img");

      image.src = memory.photo;

      image.alt = memory.title;

      imageContainer.appendChild(image);

      memoryItem.appendChild(
        imageContainer
      );

    }


    const content =
      document.createElement("div");

    content.className =
      "memory-content";


    const date =
      document.createElement("span");

    date.className =
      "memory-date";

    date.textContent =
      formatDate(memory.date);


    const title =
      document.createElement("h3");

    title.textContent =
      memory.title;


    const description =
      document.createElement("p");

    description.textContent =
      memory.description ||
      "A moment saved in Parallel.";


    content.appendChild(date);
    content.appendChild(title);
    content.appendChild(description);

    memoryItem.appendChild(content);


    memoryItem.addEventListener(
      "click",
      () => {

        openMemoryViewer(memory);

      }
    );


    memoriesGrid.appendChild(
      memoryItem
    );

  });


  updateStats();

}


/* Save new memory */

memoryForm.addEventListener(
  "submit",
  (event) => {

    event.preventDefault();


    const newMemory = {

      id: Date.now(),

      title:
        memoryTitle.value.trim(),

      date:
        memoryDate.value,

      description:
        memoryDescription.value.trim(),

      photo:
        selectedPhoto,

      addedBy:
        username,

      createdAt:
        new Date().toISOString()

    };


    memories.push(newMemory);

    saveMemories();

    renderMemories();

    closeMemoryModal();

  }
);


/* Open buttons */

openMemoryModalBtn.addEventListener(
  "click",
  openMemoryModal
);

emptyAddMemoryBtn.addEventListener(
  "click",
  openMemoryModal
);


/* Close modal */

closeMemoryModalBtn.addEventListener(
  "click",
  closeMemoryModal
);


/* Close modal when clicking outside */

memoryModal.addEventListener(
  "click",
  (event) => {

    if (event.target === memoryModal) {

      closeMemoryModal();

    }

  }
);


/* Close viewer */

closeMemoryViewerBtn.addEventListener(
  "click",
  () => {

    memoryViewer.classList.remove(
      "active"
    );

  }
);


memoryViewer.addEventListener(
  "click",
  (event) => {

    if (event.target === memoryViewer) {

      memoryViewer.classList.remove(
        "active"
      );

    }

  }
);


/* Clear all memories */

clearMemoriesBtn.addEventListener(
  "click",
  () => {

    if (memories.length === 0) return;

    const confirmed = confirm(
      "Clear all memories from this Parallel room?"
    );

    if (!confirmed) return;


    memories = [];

    saveMemories();

    renderMemories();

  }
);


/* Initial setup */

setTodayDate();

renderMemories();