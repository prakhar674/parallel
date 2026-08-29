const roomCode = localStorage.getItem("roomCode");
const username = localStorage.getItem("username") || "You";

/* Protect page */

if (!roomCode) {
  window.location.href = "index.html";
}


/* Elements */

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


/* Display room */

roomCodeDisplay.textContent =
  `ROOM ${roomCode}`;


/* Storage */

const notesStorageKey =
  `parallelNotes_${roomCode}`;

let notes = JSON.parse(
  localStorage.getItem(notesStorageKey)
) || [];


/* Current state */

let selectedColor = "blue";
let editingNoteId = null;


/* Save notes */

function saveNotes() {
  localStorage.setItem(
    notesStorageKey,
    JSON.stringify(notes)
  );
}


/* Format date */

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


/* Open modal */

function openNoteModal(note = null) {

  noteModal.classList.add("active");


  if (note) {

    editingNoteId = note.id;

    document.getElementById(
      "noteModalLabel"
    ).textContent = "EDIT NOTE";

    document.getElementById(
      "noteModalTitle"
    ).textContent = "Change something.";

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
    ).textContent = "Write something.";

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


/* Close modal */

function closeNoteModal() {

  noteModal.classList.remove("active");

  noteForm.reset();

  editingNoteId = null;

  selectedColor = "blue";

}


/* Select note color */

colorButtons.forEach((button) => {

  button.addEventListener(
    "click",
    () => {

      selectedColor =
        button.dataset.color;

      colorButtons.forEach((colorButton) => {

        colorButton.classList.remove(
          "active"
        );

      });

      button.classList.add(
        "active"
      );

    }
  );

});


/* Update stats */

function updateStats() {

  noteCount.textContent =
    notes.length;


  const today =
    new Date().toDateString();

  const todayNotes =
    notes.filter((note) => {

      return (
        new Date(note.createdAt)
          .toDateString() === today
      );

    });

  todayNoteCount.textContent =
    todayNotes.length;


  if (notes.length === 0) {

    latestNote.textContent = "—";

    return;

  }


  const newestNote =
    [...notes].sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt) -
        new Date(a.updatedAt || a.createdAt)
    )[0];


  latestNote.textContent =
    formatDate(
      newestNote.updatedAt ||
      newestNote.createdAt
    );

}


/* Open note viewer */

function openNoteViewer(note) {

  noteViewerCard.innerHTML = `
    <span class="viewer-note-date">
      ${formatDate(
        note.updatedAt ||
        note.createdAt
      )}
    </span>

    <h2>
      ${note.title}
    </h2>

    <div class="viewer-note-content">
      ${note.content}
    </div>
  `;


  noteViewer.classList.add("active");

}


/* Delete note */

function deleteNote(id) {

  const confirmed =
    confirm("Delete this note?");

  if (!confirmed) return;


  notes =
    notes.filter(
      (note) => note.id !== id
    );


  saveNotes();

  renderNotes();

}


/* Render notes */

function renderNotes() {

  notesGrid.innerHTML = "";


  if (notes.length === 0) {

    notesGrid.appendChild(
      notesEmpty
    );

    updateStats();

    return;

  }


  const sortedNotes =
    [...notes].sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt) -
        new Date(a.updatedAt || a.createdAt)
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
      `by ${note.author}`;


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


    /* Click note → viewer */

    noteItem.addEventListener(
      "click",
      () => {

        openNoteViewer(note);

      }
    );


    /* Double click → edit */

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


/* Save or update note */

noteForm.addEventListener(
  "submit",
  (event) => {

    event.preventDefault();


    const title =
      noteTitle.value.trim();

    const content =
      noteContent.value.trim();


    if (!title || !content) return;


    if (editingNoteId) {

      const note =
        notes.find(
          (item) =>
            item.id === editingNoteId
        );


      if (note) {

        note.title = title;

        note.content = content;

        note.color = selectedColor;

        note.updatedAt =
          new Date().toISOString();

      }

    } else {

      notes.push({

        id: Date.now(),

        title: title,

        content: content,

        color: selectedColor,

        author: username,

        createdAt:
          new Date().toISOString()

      });

    }


    saveNotes();

    renderNotes();

    closeNoteModal();

  }
);


/* Open buttons */

openNoteModalBtn.addEventListener(
  "click",
  () => openNoteModal()
);

emptyAddNoteBtn.addEventListener(
  "click",
  () => openNoteModal()
);


/* Close modal */

closeNoteModalBtn.addEventListener(
  "click",
  closeNoteModal
);


noteModal.addEventListener(
  "click",
  (event) => {

    if (event.target === noteModal) {

      closeNoteModal();

    }

  }
);


/* Close viewer */

closeNoteViewerBtn.addEventListener(
  "click",
  () => {

    noteViewer.classList.remove(
      "active"
    );

  }
);


noteViewer.addEventListener(
  "click",
  (event) => {

    if (event.target === noteViewer) {

      noteViewer.classList.remove(
        "active"
      );

    }

  }
);


/* Clear all */

clearNotesBtn.addEventListener(
  "click",
  () => {

    if (notes.length === 0) return;


    const confirmed =
      confirm(
        "Clear all notes from this Parallel room?"
      );

    if (!confirmed) return;


    notes = [];

    saveNotes();

    renderNotes();

  }
);


/* Initial render */

renderNotes();