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

const roomCodeDisplay =
  document.getElementById("roomCodeDisplay");

const noteCount =
  document.getElementById("noteCount");

const todayNoteCount =
  document.getElementById("todayNoteCount");

const latestNote =
  document.getElementById("latestNote");

const notesGrid =
  document.getElementById("notesGrid");

const notesEmpty =
  document.getElementById("notesEmpty");

const openNoteModalBtn =
  document.getElementById("openNoteModalBtn");

const emptyAddNoteBtn =
  document.getElementById("emptyAddNoteBtn");

const noteModal =
  document.getElementById("noteModal");

const closeNoteModalBtn =
  document.getElementById("closeNoteModalBtn");

const noteForm =
  document.getElementById("noteForm");

const noteTitle =
  document.getElementById("noteTitle");

const noteContent =
  document.getElementById("noteContent");

const saveNoteBtn =
  document.getElementById("saveNoteBtn");

const clearNotesBtn =
  document.getElementById("clearNotesBtn");

const noteViewer =
  document.getElementById("noteViewer");

const noteViewerCard =
  document.getElementById("noteViewerCard");

const closeNoteViewerBtn =
  document.getElementById("closeNoteViewerBtn");

const colorButtons =
  document.querySelectorAll(".note-color");


/* =========================
   ROOM DISPLAY
========================= */

if (roomCodeDisplay) {
  roomCodeDisplay.textContent =
    `ROOM ${roomCode}`;
}


/* =========================
   STORAGE
========================= */

const notesStorageKey =
  `parallelNotes_${roomCode}`;

let notes =
  JSON.parse(
    localStorage.getItem(notesStorageKey)
  ) || [];


/* =========================
   STATE
========================= */

let selectedColor = "blue";

let editingNoteId = null;


/* =========================
   SAVE LOCAL
========================= */

function saveNotes() {

  localStorage.setItem(
    notesStorageKey,
    JSON.stringify(notes)
  );

}


/* =========================
   BROADCAST NOTES
========================= */

function broadcastNotes() {

  socket.emit("update-notes", {
    roomCode,
    notes
  });

}


/* =========================
   FORMAT DATE
========================= */

function formatDate(dateString) {

  const date = new Date(dateString);

  return date.toLocaleDateString(
    "en-US",
    {
      day: "numeric",
      month: "short",
      year: "numeric"
    }
  );

}


/* =========================
   OPEN MODAL
========================= */

function openNoteModal(note = null) {

  if (!noteModal) return;

  noteModal.classList.add("active");


  if (note) {

    editingNoteId = note.id;

    document.getElementById(
      "noteModalLabel"
    ).textContent = "EDIT NOTE";

    document.getElementById(
      "noteModalTitle"
    ).textContent =
      "Change something.";

    saveNoteBtn.textContent =
      "Update Note ✦";

    noteTitle.value =
      note.title;

    noteContent.value =
      note.content;

    selectedColor =
      note.color;

  } else {

    editingNoteId = null;

    document.getElementById(
      "noteModalLabel"
    ).textContent = "NEW NOTE";

    document.getElementById(
      "noteModalTitle"
    ).textContent =
      "Write something.";

    saveNoteBtn.textContent =
      "Save Note ✦";

    noteForm.reset();

    selectedColor = "blue";

  }


  colorButtons.forEach((button) => {

    button.classList.toggle(
      "active",
      button.dataset.color === selectedColor
    );

  });

}


/* =========================
   CLOSE MODAL
========================= */

function closeNoteModal() {

  if (!noteModal) return;

  noteModal.classList.remove(
    "active"
  );

  noteForm.reset();

  editingNoteId = null;

  selectedColor = "blue";

}


/* =========================
   COLOR SELECT
========================= */

colorButtons.forEach((button) => {

  button.addEventListener(
    "click",
    () => {

      selectedColor =
        button.dataset.color;

      colorButtons.forEach(
        (colorButton) => {

          colorButton.classList.remove(
            "active"
          );

        }
      );

      button.classList.add(
        "active"
      );

    }
  );

});


/* =========================
   UPDATE STATS
========================= */

function updateStats() {

  if (noteCount) {
    noteCount.textContent =
      notes.length;
  }


  const today =
    new Date().toDateString();

  const todayNotes =
    notes.filter((note) => {

      return (
        new Date(
          note.createdAt
        ).toDateString() === today
      );

    });


  if (todayNoteCount) {
    todayNoteCount.textContent =
      todayNotes.length;
  }


  if (notes.length === 0) {

    if (latestNote) {
      latestNote.textContent = "—";
    }

    return;

  }


  const newestNote =
    [...notes].sort(
      (a, b) =>
        new Date(
          b.updatedAt ||
          b.createdAt
        ) -
        new Date(
          a.updatedAt ||
          a.createdAt
        )
    )[0];


  if (latestNote) {

    latestNote.textContent =
      formatDate(
        newestNote.updatedAt ||
        newestNote.createdAt
      );

  }

}


/* =========================
   NOTE VIEWER
========================= */

function openNoteViewer(note) {

  if (!noteViewerCard || !noteViewer) {
    return;
  }

  noteViewerCard.innerHTML = `
    <span class="viewer-note-date">
      ${formatDate(
        note.updatedAt ||
        note.createdAt
      )}
    </span>

    <h2>${note.title}</h2>

    <div class="viewer-note-content">
      ${note.content}
    </div>
  `;

  noteViewer.classList.add(
    "active"
  );

}


/* =========================
   DELETE NOTE
========================= */

function deleteNote(id) {

  const confirmed =
    confirm("Delete this note?");

  if (!confirmed) return;


  notes =
    notes.filter(
      (note) =>
        note.id !== id
    );


  saveNotes();

  renderNotes();

  broadcastNotes();

}


/* =========================
   RENDER NOTES
========================= */

function renderNotes() {

  if (!notesGrid) return;

  notesGrid.innerHTML = "";


  if (notes.length === 0) {

    if (notesEmpty) {

      notesGrid.appendChild(
        notesEmpty
      );

    }

    updateStats();

    return;

  }


  const sortedNotes =
    [...notes].sort(
      (a, b) =>
        new Date(
          b.updatedAt ||
          b.createdAt
        ) -
        new Date(
          a.updatedAt ||
          a.createdAt
        )
    );


  sortedNotes.forEach((note) => {

    const noteItem =
      document.createElement("article");

    noteItem.className =
      `note-item ${note.color}`;


    const date =
      document.createElement("span");

    date.className =
      "note-date";

    date.textContent =
      formatDate(
        note.updatedAt ||
        note.createdAt
      );


    const title =
      document.createElement("h3");

    title.textContent =
      note.title;


    const preview =
      document.createElement("p");

    preview.className =
      "note-preview";

    preview.textContent =
      note.content;


    const footer =
      document.createElement("div");

    footer.className =
      "note-footer";


    const author =
      document.createElement("span");

    author.className =
      "note-author";

    author.textContent =
      `by ${note.author || "Guest"}`;


    const deleteButton =
      document.createElement("button");

    deleteButton.className =
      "note-delete";

    deleteButton.textContent =
      "Delete";


    deleteButton.addEventListener(
      "click",
      (event) => {

        event.stopPropagation();

        deleteNote(note.id);

      }
    );


    footer.appendChild(author);
    footer.appendChild(deleteButton);

    noteItem.appendChild(date);
    noteItem.appendChild(title);
    noteItem.appendChild(preview);
    noteItem.appendChild(footer);


    noteItem.addEventListener(
      "click",
      () => {

        openNoteViewer(note);

      }
    );


    noteItem.addEventListener(
      "dblclick",
      () => {

        openNoteModal(note);

      }
    );


    notesGrid.appendChild(
      noteItem
    );

  });


  updateStats();

}


/* =========================
   SAVE / UPDATE NOTE
========================= */

if (noteForm) {

  noteForm.addEventListener(
    "submit",
    (event) => {

      event.preventDefault();


      const title =
        noteTitle.value.trim();

      const content =
        noteContent.value.trim();


      if (!title || !content) {
        return;
      }


      if (editingNoteId) {

        const note =
          notes.find(
            (item) =>
              item.id === editingNoteId
          );


        if (note) {

          note.title = title;

          note.content = content;

          note.color =
            selectedColor;

          note.updatedAt =
            new Date().toISOString();

        }

      } else {

        notes.push({

          id:
            `${Date.now()}-${Math.random()}`,

          title,

          content,

          color:
            selectedColor,

          author:
            username,

          createdAt:
            new Date().toISOString()

        });

      }


      saveNotes();

      renderNotes();

      broadcastNotes();

      closeNoteModal();

    }
  );

}


/* =========================
   RECEIVE REAL-TIME NOTES
========================= */

socket.on(
  "notes-updated",
  (incomingNotes) => {

    if (
      !Array.isArray(
        incomingNotes
      )
    ) {
      return;
    }


    notes =
      incomingNotes;

    saveNotes();

    renderNotes();

  }
);


/* =========================
   BUTTON EVENTS
========================= */

if (openNoteModalBtn) {

  openNoteModalBtn.addEventListener(
    "click",
    () => openNoteModal()
  );

}


if (emptyAddNoteBtn) {

  emptyAddNoteBtn.addEventListener(
    "click",
    () => openNoteModal()
  );

}


if (closeNoteModalBtn) {

  closeNoteModalBtn.addEventListener(
    "click",
    closeNoteModal
  );

}


if (noteModal) {

  noteModal.addEventListener(
    "click",
    (event) => {

      if (
        event.target === noteModal
      ) {

        closeNoteModal();

      }

    }
  );

}


/* =========================
   CLOSE VIEWER
========================= */

if (closeNoteViewerBtn) {

  closeNoteViewerBtn.addEventListener(
    "click",
    () => {

      noteViewer.classList.remove(
        "active"
      );

    }
  );

}


if (noteViewer) {

  noteViewer.addEventListener(
    "click",
    (event) => {

      if (
        event.target === noteViewer
      ) {

        noteViewer.classList.remove(
          "active"
        );

      }

    }
  );

}


/* =========================
   CLEAR ALL
========================= */

if (clearNotesBtn) {

  clearNotesBtn.addEventListener(
    "click",
    () => {

      if (notes.length === 0) {
        return;
      }


      const confirmed =
        confirm(
          "Clear all notes from this Parallel room?"
        );

      if (!confirmed) return;


      notes = [];

      saveNotes();

      renderNotes();

      broadcastNotes();

    }
  );

}


/* =========================
   INITIAL RENDER
========================= */

renderNotes();