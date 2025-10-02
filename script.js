// script.js — full features: draw, drag paint, palette, undo/redo, save/load, upload->pixelate, export PNG

const grid = document.getElementById('grid');
const gridSizeSelect = document.getElementById('gridSize');
const setGridBtn = document.getElementById('setGridBtn');
const clearBtn = document.getElementById('clearBtn');
const undoBtn = document.getElementById('undoBtn');
const redoBtn = document.getElementById('redoBtn');
const saveBtn = document.getElementById('saveBtn');
const loadBtn = document.getElementById('loadBtn');
const downloadBtn = document.getElementById('downloadBtn');
const uploadBtn = document.getElementById('uploadBtn');
const fileInput = document.getElementById('fileInput');
const imageInput = document.getElementById('imageInput');
const colorPicker = document.getElementById('colorPicker');
const palette = document.getElementById('palette');
const zoomRange = document.getElementById('zoomRange');
const zoomVal = document.getElementById('zoomVal');

let currentColor = colorPicker.value;
let mouseDown = false;
let currentSize = 16;
let history = [];
let redoStack = [];

// Create grid
function createGrid(size) {
  currentSize = size;
  grid.innerHTML = '';
  grid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
  grid.style.gridTemplateRows = `repeat(${size}, 1fr)`;
  for (let i = 0; i < size * size; i++) {
    const pixel = document.createElement('div');
    pixel.className = 'pixel';
    pixel.addEventListener('mousedown', paintPixel);
    pixel.addEventListener('mouseover', e => {
      if (mouseDown) paintPixel(e);
    });
    grid.appendChild(pixel);
  }
  snapshot();
}
createGrid(currentSize);

// Painting
function paintPixel(e) {
  e.target.style.backgroundColor = currentColor;
}

// Color Picker + Palette
colorPicker.addEventListener('input', e => {
  currentColor = e.target.value;
});
palette.addEventListener('click', e => {
  if (e.target.classList.contains('swatch')) {
    currentColor = e.target.dataset.color;
    colorPicker.value = currentColor;
  }
});

// Snapshot for undo
function snapshot() {
  const pixels = Array.from(grid.children).map(p => p.style.backgroundColor || 'white');
  history.push(pixels);
  redoStack = [];
  updateUndoRedoButtons();
}
function restoreSnapshot(data) {
  data.forEach((color, i) => {
    if (grid.children[i]) grid.children[i].style.backgroundColor = color;
  });
}
function updateUndoRedoButtons() {
  undoBtn.disabled = history.length === 0;
  redoBtn.disabled = redoStack.length === 0;
}

// Mouse tracking
document.body.addEventListener('mousedown', ()=> mouseDown = true);
document.body.addEventListener('mouseup', ()=> mouseDown = false);

// Controls
setGridBtn.addEventListener('click', ()=>{
  const size = parseInt(gridSizeSelect.value,10);
  createGrid(size);
});

clearBtn.addEventListener('click', ()=>{
  snapshot();
  document.querySelectorAll('.pixel').forEach(p=> p.style.backgroundColor = 'white');
});

undoBtn.addEventListener('click', ()=>{
  if(history.length === 0) return;
  const last = history.pop();
  const current = Array.from(grid.children).map(p => p.style.backgroundColor || 'rgba(0,0,0,0)');
  redoStack.push(current);
  restoreSnapshot(last);
  updateUndoRedoButtons();
});

redoBtn.addEventListener('click', ()=>{
  if(redoStack.length === 0) return;
  const next = redoStack.pop();
  const current = Array.from(grid.children).map(p => p.style.backgroundColor || 'rgba(0,0,0,0)');
  history.push(current);
  restoreSnapshot(next);
  updateUndoRedoButtons();
});

saveBtn.addEventListener('click', ()=>{
  const pixels = Array.from(grid.children).map(p => p.style.backgroundColor || 'white');
  const data = { size: currentSize, pixels };
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'pixel-art.json';
  link.click();
});

loadBtn.addEventListener('click', ()=> fileInput.click());
fileInput.addEventListener('change', (ev)=>{
  const f = ev.target.files[0];
  if(!f) return;
  const r = new FileReader();
  r.onload = (e)=>{
    try{
      const data = JSON.parse(e.target.result);
      if(!data.size || !data.pixels) return alert('Invalid file');
      createGrid(data.size);
      document.getElementById('gridSize').value = data.size;
      data.pixels.forEach((color,i)=>{
        if(grid.children[i]) grid.children[i].style.backgroundColor = color;
      });
    }catch(err){
      alert('Failed to load JSON');
    }
  };
  r.readAsText(f);
});

// Upload image and pixelate
uploadBtn.addEventListener('click', ()=> imageInput.click());
imageInput.addEventListener('change', (ev)=>{
  const f = ev.target.files[0];
  if(!f) return;
  const reader = new FileReader();
  reader.onload = (e)=>{
    const img = new Image();
    img.onload = ()=>{
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = currentSize;
      canvas.height = currentSize;
      ctx.drawImage(img, 0, 0, currentSize, currentSize);
      const data = ctx.getImageData(0,0,currentSize,currentSize).data;
      Array.from(grid.children).forEach((pixel,i)=>{
        const idx = i*4;
        const r = data[idx], g = data[idx+1], b = data[idx+2], a = data[idx+3];
        pixel.style.backgroundColor = `rgba(${r},${g},${b},${a/255})`;
      });
      snapshot();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(f);
});

// Download PNG
downloadBtn.addEventListener('click', ()=>{
  html2canvas(grid).then(canvas=>{
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'pixel-art.png';
    link.click();
  });
});

// Zoom
zoomRange.addEventListener('input', e=>{
  const val = e.target.value;
  document.querySelectorAll('.pixel').forEach(p=>{
    p.style.width = val+'px';
    p.style.height = val+'px';
  });
  zoomVal.textContent = val+'px';
});
