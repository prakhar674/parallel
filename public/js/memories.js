const socket = io();

const roomCode =
  localStorage.getItem("roomCode");

const username =
  localStorage.getItem("username") || "Guest";

const avatar =
  localStorage.getItem("userAvatar") || "🌊";


/* =========================
   ROOM CHECK
========================= */

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
  `parallelMemories_${roomCode}`;

let memories =
  JSON.parse(
    localStorage.getItem(storageKey)
  ) || [];


/* =========================
   ELEMENTS
========================= */

const roomCodeDisplay =
  document.getElementById("roomCodeDisplay");

const memoriesGrid =
  document.getElementById("memoriesGrid");

const memoriesEmpty =
  document.getElementById("memoriesEmpty");

const addMemoryBtn =
  document.getElementById("addMemoryBtn");

const emptyAddMemoryBtn =
  document.getElementById("emptyAddMemoryBtn");

const memoryModal =
  document.getElementById("memoryModal");

const closeMemoryModalBtn =
  document.getElementById("closeMemoryModalBtn");

const memoryForm =
  document.getElementById("memoryForm");

const memoryTitle =
  document.getElementById("memoryTitle");

const memoryDate =
  document.getElementById("memoryDate");

const memoryDescription =
  document.getElementById("memoryDescription");

const memoryImage =
  document.getElementById("memoryImage");

const memoryCount =
  document.getElementById("memoryCount");

const clearMemoriesBtn =
  document.getElementById("clearMemoriesBtn");


if (roomCodeDisplay) {
  roomCodeDisplay.textContent =
    `ROOM ${roomCode}`;
}


/* =========================
   SAVE LOCAL
========================= */

function saveMemories() {

  localStorage.setItem(
    storageKey,
    JSON.stringify(memories)
  );

}


/* =========================
   REAL-TIME BROADCAST
========================= */

function broadcastMemories() {

  socket.emit("update-memories", {
    roomCode,
    memories
  });

}


/* =========================
   FORMAT DATE
========================= */

function formatDate(dateValue) {

  if (!dateValue) {
    return "No date";
  }

  return new Date(
    `${dateValue}T00:00:00`
  ).toLocaleDateString(
    "en-US",
    {
      day: "numeric",
      month: "long",
      year: "numeric"
    }
  );

}


/* =========================
   UPDATE COUNT
========================= */

function updateMemoryCount() {

  if (memoryCount) {

    memoryCount.textContent =
      memories.length;

  }

}


/* =========================
   OPEN MODAL
========================= */

function openMemoryModal() {

  if (!memoryModal) return;

  memoryForm.reset();

  memoryModal.classList.add(
    "active"
  );

}


/* =========================
   CLOSE MODAL
========================= */

function closeMemoryModal() {

  if (!memoryModal) return;

  memoryModal.classList.remove(
    "active"
  );

  memoryForm.reset();

}


/* =========================
   RENDER MEMORIES
========================= */

function renderMemories() {

  if (!memoriesGrid) return;

  memoriesGrid.innerHTML = "";


  if (memories.length === 0) {

    if (memoriesEmpty) {

      memoriesGrid.appendChild(
        memoriesEmpty
      );

    }

    updateMemoryCount();

    return;

  }


  const sortedMemories =
    [...memories].sort(
      (a, b) =>
        new Date(b.createdAt) -
        new Date(a.createdAt)
    );


  sortedMemories.forEach(
    (memory) => {

      const card =
        document.createElement("article");

      card.className =
        "memory-card";


      if (memory.image) {

        const image =
          document.createElement("img");

        image.src =
          memory.image;

        image.alt =
          memory.title;

        image.className =
          "memory-image";

        card.appendChild(image);

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

      description.className =
        "memory-description";

      description.textContent =
        memory.description;


      const author =
        document.createElement("small");

      author.className =
        "memory-author";

      author.textContent =
        `Added by ${
          memory.username || "Guest"
        }`;


      const deleteBtn =
        document.createElement("button");

      deleteBtn.className =
        "memory-delete";

      deleteBtn.textContent =
        "Delete";


      deleteBtn.addEventListener(
        "click",
        (event) => {

          event.stopPropagation();

          deleteMemory(
            memory.id
          );

        }
      );


      content.appendChild(date);
      content.appendChild(title);
      content.appendChild(description);
      content.appendChild(author);
      content.appendChild(deleteBtn);

      card.appendChild(content);


      memoriesGrid.appendChild(
        card
      );

    }
  );


  updateMemoryCount();

}


/* =========================
   ADD MEMORY
========================= */

if (memoryForm) {

  memoryForm.addEventListener(
    "submit",
    (event) => {

      event.preventDefault();


      const title =
        memoryTitle.value.trim();

      const description =
        memoryDescription.value.trim();

      const date =
        memoryDate.value;


      if (!title) {
        alert(
          "Give this memory a title."
        );

        return;
      }


      const createMemory =
        (imageData = "") => {

          const memory = {

            id:
              `${Date.now()}-${Math.random()}`,

            title,

            description,

            date,

            image: imageData,

            username,

            avatar,

            createdAt:
              new Date().toISOString()

          };


          memories.unshift(
            memory
          );


          saveMemories();

          renderMemories();

          broadcastMemories();

          closeMemoryModal();

        };


      const file =
        memoryImage &&
        memoryImage.files
          ? memoryImage.files[0]
          : null;


      if (file) {

        if (
          !file.type.startsWith(
            "image/"
          )
        ) {

          alert(
            "Please select an image file."
          );

          return;

        }


        const reader =
          new FileReader();


        reader.onload =
          (loadEvent) => {

            createMemory(
              loadEvent.target.result
            );

          };


        reader.readAsDataURL(
          file
        );

      } else {

        createMemory();

      }

    }
  );

}


/* =========================
   DELETE MEMORY
========================= */

function deleteMemory(id) {

  const confirmed =
    confirm(
      "Delete this memory?"
    );

  if (!confirmed) return;


  memories =
    memories.filter(
      (memory) =>
        memory.id !== id
    );


  saveMemories();

  renderMemories();

  broadcastMemories();

}


/* =========================
   CLEAR ALL
========================= */

if (clearMemoriesBtn) {

  clearMemoriesBtn.addEventListener(
    "click",
    () => {

      if (memories.length === 0) {
        return;
      }


      const confirmed =
        confirm(
          "Clear all memories from this room?"
        );

      if (!confirmed) return;


      memories = [];

      saveMemories();

      renderMemories();

      broadcastMemories();

    }
  );

}


/* =========================
   RECEIVE REAL-TIME UPDATE
========================= */

socket.on(
  "memories-updated",
  (incomingMemories) => {

    if (
      !Array.isArray(
        incomingMemories
      )
    ) {
      return;
    }


    memories =
      incomingMemories;


    saveMemories();

    renderMemories();

  }
);


/* =========================
   MODAL BUTTONS
========================= */

if (addMemoryBtn) {

  addMemoryBtn.addEventListener(
    "click",
    openMemoryModal
  );

}


if (emptyAddMemoryBtn) {

  emptyAddMemoryBtn.addEventListener(
    "click",
    openMemoryModal
  );

}


if (closeMemoryModalBtn) {

  closeMemoryModalBtn.addEventListener(
    "click",
    closeMemoryModal
  );

}


if (memoryModal) {

  memoryModal.addEventListener(
    "click",
    (event) => {

      if (
        event.target === memoryModal
      ) {

        closeMemoryModal();

      }

    }
  );

}


/* =========================
   INITIAL RENDER
========================= */

renderMemories();