// Initialize Fabric.js canvas
const canvas = new fabric.Canvas('canvas', {
    backgroundColor: '#ffffff',
    width: 800,
    height: 600,
    preserveObjectStacking: true,
});

// Home Button
document.getElementById('homeBtn').addEventListener('click', () => {
    if (confirm('Reset the editor?')) {
        canvas.clear();
    }
});

// Upload Image
document.getElementById('imageInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        fabric.Image.fromURL(event.target.result, (img) => {
            canvas.clear();
            img.scaleToWidth(800);
            canvas.add(img);
            canvas.centerObject(img);
            canvas.renderAll();
        });
    };
    reader.readAsDataURL(file);
});

// Zoom Controls
document.getElementById('zoomInBtn').addEventListener('click', () => canvas.setZoom(canvas.getZoom() * 1.1));
document.getElementById('zoomOutBtn').addEventListener('click', () => canvas.setZoom(canvas.getZoom() * 0.9));

// Layers Panel
function updateLayers() {
    const layersList = document.getElementById('layersList');
    layersList.innerHTML = '';
    canvas.getObjects().forEach((obj, index) => {
        const layerDiv = document.createElement('div');
        layerDiv.className = 'layer-item';
        layerDiv.textContent = `Layer ${index + 1}`;
        layerDiv.onclick = () => canvas.setActiveObject(obj);
        layersList.appendChild(layerDiv);
    });
}

canvas.on('object:added', updateLayers);
canvas.on('object:removed', updateLayers);

// Status Bar
function updateStatusBar() {
    document.getElementById('zoomLevel').textContent = `${Math.round(canvas.getZoom() * 100)}%`;
    document.getElementById('canvasSize').textContent = `${canvas.getWidth()}x${canvas.getHeight()}px`;
}

canvas.on('mouse:wheel', updateStatusBar);
setInterval(updateStatusBar, 1000);
