"use strict";

// Variables
const notesContainer = document.querySelector(".notes-container");
const createBtn = document.querySelector(".btn");
const toggleViewBtn = document.querySelector(".toggle-view");
let isBoardView = true;

// Crear una nota
createBtn.addEventListener("click", () => {
  const noteData = {
    title: "New Note",
    text: "",
    createdAt: new Date().toISOString(),
  };
  const noteElement = createNoteElement(noteData);
  notesContainer.appendChild(noteElement);
  saveStorage();
});

// Alternar vista entre lista y tablero
toggleViewBtn.addEventListener("click", () => {
  isBoardView = !isBoardView;
  notesContainer.classList.toggle("list-view", !isBoardView);
  notesContainer.classList.toggle("board-view", isBoardView);

  // Cambiar texto del botón según la vista
  toggleViewBtn.textContent = isBoardView
    ? "Switch to List View"
    : "Switch to Board View";
});

// Crear un elemento de nota
function createNoteElement(noteData) {
  const note = document.createElement("div");
  note.classList.add("notes");
  note.setAttribute("draggable", "true");

  note.innerHTML = `
    <input type="text" class="note-title" value="${noteData.title}" style="font-size: 1.2rem; padding: 5px;" />
    <textarea class="note-text" style="font-size: 1rem; width: 100%; height: 150px; resize: none;" placeholder="Write your note here...">${noteData.text}</textarea>
    <button class="edit-btn" style="margin: 10px 0; padding: 5px 10px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">Edit Note</button>
    <p class="note-time">${getElapsedTime(noteData.createdAt)}</p>
    <img src="images/delbtn.png" class="delete-btn" alt="Delete" />
  `;

  // Eventos para la eliminación y edición
  note.querySelector(".delete-btn").addEventListener("click", () => {
    note.remove();
    saveStorage();
  });

  // Limpiar el título al hacer clic por primera vez
  const titleInput = note.querySelector(".note-title");
  titleInput.addEventListener("focus", () => {
    if (titleInput.value === "New Note") {
      titleInput.value = "";
    }
  });

  // Editar la nota
  const editBtn = note.querySelector(".edit-btn");
  const noteText = note.querySelector(".note-text");
  editBtn.addEventListener("click", () => {
    const newText = prompt("Edit your note:", "");
    if (newText) {
      noteText.value += `\n${newText}`;
      saveStorage();
    }
  });

  // Guardar cambios al escribir en el título
  titleInput.addEventListener("input", saveStorage);

  // Actualizar el tiempo transcurrido
  setInterval(() => {
    note.querySelector(".note-time").textContent = getElapsedTime(noteData.createdAt);
  }, 60000);

  // Funcionalidad de drag & drop
  note.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", note.outerHTML);
    note.classList.add("dragging");
  });

  note.addEventListener("dragend", () => {
    note.classList.remove("dragging");
  });

  return note;
}

// Obtener el tiempo transcurrido
function getElapsedTime(createdAt) {
  const createdDate = new Date(createdAt);
  const now = new Date();
  const minutes = Math.floor((now - createdDate) / 60000);
  return `${minutes} minute(s) ago`;
}

// Guardar las notas en localStorage
function saveStorage() {
  const notesData = Array.from(notesContainer.children).map((note) => ({
    title: note.querySelector(".note-title").value,
    text: note.querySelector(".note-text").value,
    createdAt: note.querySelector(".note-time").textContent || new Date().toISOString(),
  }));

  localStorage.setItem("notes", JSON.stringify(notesData));
}

// Mostrar las notas desde localStorage
function displayStorage() {
  const savedNotes = localStorage.getItem("notes");
  let notesData = [];

  if (savedNotes) {
    try {
      notesData = JSON.parse(savedNotes);
    } catch (e) {
      console.error("Error al parsear los datos del localStorage:", e);
    }
  }

  notesContainer.innerHTML = "";
  notesData.forEach((noteData) => {
    const noteElement = createNoteElement(noteData);
    notesContainer.appendChild(noteElement);
  });
}

// Reordenar las notas usando drag & drop
notesContainer.addEventListener("dragover", (e) => {
  e.preventDefault();
  const afterElement = getDragAfterElement(notesContainer, e.clientY);
  const dragging = document.querySelector(".dragging");
  if (afterElement) {
    notesContainer.insertBefore(dragging, afterElement);
  } else {
    notesContainer.appendChild(dragging);
  }
  saveStorage();
});

// Obtener el elemento después del cual insertar
function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll(".notes:not(.dragging)")];
  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}

displayStorage();
