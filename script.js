const grid = document.getElementById("grid");
const colorPicker = document.getElementById("colorPicker");

function createGrid(size = 16) {
  grid.innerHTML = "";
  grid.style.gridTemplateColumns = `repeat(${size}, 20px)`;
  grid.style.gridTemplateRows = `repeat(${size}, 20px)`;

  for (let i = 0; i < size * size; i++) {
    const pixel = document.createElement("div");
    pixel.classList.add("pixel");
    pixel.addEventListener("click", () => {
      pixel.style.backgroundColor = colorPicker.value;
    });
    grid.appendChild(pixel);
  }
}

function clearGrid() {
  document.querySelectorAll(".pixel").forEach(p => p.style.backgroundColor = "white");
}

function setGrid() {
  const size = parseInt(document.getElementById("gridSize").value);
  createGrid(size);
}

function exportImage() {
  html2canvas(grid).then(canvas => {
    const link = document.createElement("a");
    link.download = "pixel-art.png";
    link.href = canvas.toDataURL();
    link.click();
  });
}

// buat default grid saat load
createGrid(16);
