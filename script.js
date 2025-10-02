// script.js — all features: draw, drag paint, palette, undo/redo (snapshot-based), save/load, upload->pixelate, export PNG
// controls
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
// push current into redo
const current = Array.from(grid.children).map(p => p.style.backgroundColor || 'rgba(0,0,0,0)');
redoStack.push(current);
restoreSnapshot(last);
updateUndoRedoButtons();
});


redoBtn.addEventListener('click', ()=>{
if(redoStack.length === 0) return;
const next = redoStack.pop();
// push current to history
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


// upload image and pixelate
uploadBtn.addEventListener('click', ()=> imageInput.click());
imageInput.addEventListener('change', (ev)=>{
const f = ev.target.files[0];
if(!f) return;


const reader = new Fi
