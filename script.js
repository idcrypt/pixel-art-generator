document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("grid");
  const colorPicker = document.getElementById("colorPicker");
  const fileInput = document.getElementById("fileInput");

  let history = [];
  let redoStack = [];

  function createGrid(size = 16) {
    grid.innerHTML = "";
    grid.style.gridTemplateColumns = `repeat(${size}, 20px)`;
    grid.style.gridTemplateRows = `repeat(${size}, 20px)`;

    for (let i = 0; i < size * size; i++) {
      const pixel = document.createElement("div");
      pixel.classList.add("pixel");
      pixel.dataset.index = i;
      pixel.style.backgroundColor = "white";

      pixel.addEventListener("click", () => {
        const oldColor = pixel.style.backgroundColor;
        const newColor = colorPicker.value;
        pixel.style.backgroundColor = newColor;

        // simpan ke history
        history.push({ index: i, oldColor, newColor });
        redoStack = []; // reset redo stack
      });

      grid.appendChild(pixel);
    }
  }

  function clearGrid() {
    document.querySelectorAll(".pixel").forEach(p => p.style.backgroundColor = "white");
    history = [];
    redoStack = [];
  }

  function setGrid() {
    const size = parseInt(document.getElementById("gridSize").value);
    createGrid(size);
    history = [];
    redoStack = [];
  }

  function exportImage() {
    html2canvas(grid).then(canvas => {
      const link = document.createElement("a");
      link.download = "pixel-art.png";
      link.href = canvas.toDataURL();
      link.click();
    });
  }

  function undo() {
    if (history.length > 0) {
      const lastAction = history.pop();
      const pixel = grid.children[lastAction.index];
      pixel.style.backgroundColor = lastAction.oldColor;
      redoStack.push(lastAction);
    }
  }

  function redo() {
    if (redoStack.length > 0) {
      const action = redoStack.pop();
      const pixel = grid.children[action.index];
      pixel.style.backgroundColor = action.newColor;
      history.push(action);
    }
  }

  function saveJSON() {
    const pixels = Array.from(document.querySelectorAll(".pixel")).map(p => p.style.backgroundColor);
    const data = {
      size: parseInt(document.getElementById("gridSize").value),
      pixels
    };
    const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "pixel-art.json";
    link.click();
  }

  function loadJSON() {
    fileInput.click();
  }

  fileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = JSON.parse(e.target.result);
      createGrid(data.size);
      document.getElementById("gridSize").value = data.size;
      data.pixels.forEach((color, i) => {
        grid.children[i].style.backgroundColor = color;
      });
    };
    reader.readAsText(file);
  });

  // palet warna cepat
  document.querySelectorAll(".swatch").forEach(swatch => {
    swatch.addEventListener("click", () => {
      const color = swatch.getAttribute("data-color");
      colorPicker.value = color;
    });
  });

  // buat default grid saat load
  createGrid(16);

  // expose biar bisa dipanggil dari HTML
  window.clearGrid = clearGrid;
  window.setGrid = setGrid;
  window.exportImage = exportImage;
  window.undo = undo;
  window.redo = redo;
  window.saveJSON = saveJSON;
  window.loadJSON = loadJSON;
});
