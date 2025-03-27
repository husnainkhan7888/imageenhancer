// Initialize Fabric.js canvas
const canvas = new fabric.Canvas('canvas', {
    backgroundColor: '#ffffff',
    preserveObjectStacking: true,
});

let undoStack = [];
let redoStack = [];

// Upload Image
document.getElementById('uploadBtn').addEventListener('click', () => {
    document.getElementById('imageInput').click();
});

document.getElementById('imageInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        fabric.Image.fromURL(event.target.result, (img) => {
            canvas.clear();
            img.scaleToWidth(canvas.getWidth() * 0.8);
            canvas.add(img);
            canvas.centerObject(img);
            canvas.renderAll();
            saveState();
        });
    };
    reader.readAsDataURL(file);
});

// Undo/Redo
document.getElementById('undoBtn').addEventListener('click', () => {
    if (undoStack.length > 0) {
        const state = undoStack.pop();
        redoStack.push(state);
        canvas.loadFromJSON(state, () => canvas.renderAll());
    }
});

document.getElementById('redoBtn').addEventListener('click', () => {
    if (redoStack.length > 0) {
        const state = redoStack.pop();
        undoStack.push(state);
        canvas.loadFromJSON(state, () => canvas.renderAll());
    }
});

function saveState() {
    undoStack.push(JSON.stringify(canvas));
    redoStack = [];
}

// Crop (Improved)
document.getElementById('cropBtn').addEventListener('click', () => {
    const activeObj = canvas.getActiveObject();
    if (!activeObj || !(activeObj instanceof fabric.Image)) {
        alert('Select an image to crop.');
        return;
    }

    const rect = new fabric.Rect({
        left: activeObj.left,
        top: activeObj.top,
        width: activeObj.width * 0.5,
        height: activeObj.height * 0.5,
        fill: 'transparent',
        stroke: '#e74c3c',
        strokeWidth: 2,
        selectable: true,
    });

    canvas.add(rect);
    canvas.setActiveObject(rect);
    canvas.renderAll();

    setTimeout(() => {
        const cropRect = canvas.getActiveObject();
        if (cropRect && cropRect.type === 'rect') {
            const croppedImg = new fabric.Image(activeObj.getElement(), {
                left: cropRect.left,
                top: cropRect.top,
                width: cropRect.width,
                height: cropRect.height,
                clipPath: cropRect,
            });
            canvas.remove(activeObj);
            canvas.remove(cropRect);
            canvas.add(croppedImg);
            canvas.renderAll();
            saveState();
        }
    }, 100);
});

// Filters
document.getElementById('grayscaleBtn').addEventListener('click', () => applyFilter('Grayscale'));
document.getElementById('sepiaBtn').addEventListener('click', () => applyFilter('Sepia'));
document.getElementById('vintageBtn').addEventListener('click', () => applyFilter('Vintage'));
document.getElementById('clarendonBtn').addEventListener('click', () => applyFilter('Clarendon'));

function applyFilter(filterName) {
    const activeObj = canvas.getActiveObject();
    if (!activeObj || !(activeObj instanceof fabric.Image)) {
        alert('Select an image to apply the filter.');
        return;
    }

    activeObj.filters = [];
    switch (filterName) {
        case 'Grayscale':
            activeObj.filters.push(new fabric.Image.filters.Grayscale());
            break;
        case 'Sepia':
            activeObj.filters.push(new fabric.Image.filters.Sepia());
            break;
        case 'Vintage':
            activeObj.filters.push(new fabric.Image.filters.Vintage());
            break;
        case 'Clarendon':
            activeObj.filters.push(new fabric.Image.filters.Clarendon());
            break;
    }
    activeObj.applyFilters();
    canvas.renderAll();
    saveState();
}

// Adjustments
document.getElementById('brightnessSlider').addEventListener('input', (e) => applyAdjustment('brightness', e.target.value));
document.getElementById('contrastSlider').addEventListener('input', (e) => applyAdjustment('contrast', e.target.value));
document.getElementById('saturationSlider').addEventListener('input', (e) => applyAdjustment('saturation', e.target.value));

function applyAdjustment(type, value) {
    const activeObj = canvas.getActiveObject();
    if (!activeObj || !(activeObj instanceof fabric.Image)) {
        alert('Select an image to adjust.');
        return;
    }

    activeObj.filters = activeObj.filters || [];
    switch (type) {
        case 'brightness':
            activeObj.filters.push(new fabric.Image.filters.Brightness({ brightness: value / 100 }));
            break;
        case 'contrast':
            activeObj.filters.push(new fabric.Image.filters.Contrast({ contrast: value / 100 }));
            break;
        case 'saturation':
            activeObj.filters.push(new fabric.Image.filters.Saturation({ saturation: value / 100 }));
            break;
    }
    activeObj.applyFilters();
    canvas.renderAll();
    saveState();
}

// Text and Shapes
document.getElementById('addTextBtn').addEventListener('click', () => {
    const text = new fabric.Textbox('Type here...', {
        left: 50,
        top: 50,
        fontSize: 24,
        fill: '#333',
        fontFamily: 'Arial',
        editable: true,
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
    saveState();
});

document.getElementById('addShapeBtn').addEventListener('click', () => {
    const shape = new fabric.Rect({
        left: 50,
        top: 50,
        width: 100,
        height: 100,
        fill: '#3498db',
        stroke: '#2c3e50',
        strokeWidth: 2,
        selectable: true,
    });
    canvas.add(shape);
    canvas.renderAll();
    saveState();
});

// Zoom/Pan
document.getElementById('zoomInBtn').addEventListener('click', () => canvas.setZoom(canvas.getZoom() * 1.1));
document.getElementById('zoomOutBtn').addEventListener('click', () => canvas.setZoom(canvas.getZoom() * 0.9));

// Save Image
document.getElementById('saveBtn').addEventListener('click', () => {
    const dataURL = canvas.toDataURL({ format: 'jpeg', quality: 0.9 });
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'HKTools_Edited_Image.jpg';
    link.click();
});

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
