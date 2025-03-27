// Initialize Fabric.js canvas
const canvas = new fabric.Canvas('canvas', { 
    backgroundColor: '#fff',
    selection: true,
});

let activeObject = null;

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
        });
    };
    reader.readAsDataURL(file);
});

// Crop
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
        stroke: 'red',
        strokeWidth: 2,
        selectable: true,
    });

    canvas.add(rect);
    canvas.setActiveObject(rect);
    canvas.renderAll();

    // Actual crop logic
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
        }
    }, 100);
});

// Rotate
document.getElementById('rotateBtn').addEventListener('click', () => {
    const activeObj = canvas.getActiveObject();
    if (!activeObj) {
        alert('Select an object to rotate.');
        return;
    }
    activeObj.rotate(activeObj.angle + 90);
    canvas.renderAll();
});

// Resize
document.getElementById('resizeBtn').addEventListener('click', () => {
    const activeObj = canvas.getActiveObject();
    if (!activeObj) {
        alert('Select an object to resize.');
        return;
    }
    activeObj.scale(1.2);
    canvas.renderAll();
});

// Brightness/Contrast
document.getElementById('brightnessSlider').addEventListener('input', (e) => {
    applyFilter('brightness', parseInt(e.target.value));
});

document.getElementById('contrastSlider').addEventListener('input', (e) => {
    applyFilter('contrast', parseInt(e.target.value));
});

function applyFilter(filterType, value) {
    const activeObj = canvas.getActiveObject();
    if (!activeObj || !(activeObj instanceof fabric.Image)) {
        alert('Select an image to adjust.');
        return;
    }

    activeObj.filters = activeObj.filters || [];

    if (filterType === 'brightness') {
        const brightnessFilter = new fabric.Image.filters.Brightness({ brightness: value / 100 });
        activeObj.filters.push(brightnessFilter);
    } else if (filterType === 'contrast') {
        const contrastFilter = new fabric.Image.filters.Contrast({ contrast: value / 100 });
        activeObj.filters.push(contrastFilter);
    }

    activeObj.applyFilters();
    canvas.renderAll();
}

// Sepia Filter
document.getElementById('sepiaBtn').addEventListener('click', () => {
    applyFilter('sepia');
});

// Grayscale Filter
document.getElementById('grayscaleBtn').addEventListener('click', () => {
    applyFilter('grayscale');
});

function applyFilter(filterType) {
    const activeObj = canvas.getActiveObject();
    if (!activeObj || !(activeObj instanceof fabric.Image)) {
        alert('Select an image to apply the filter.');
        return;
    }

    activeObj.filters = activeObj.filters || [];

    if (filterType === 'sepia') {
        activeObj.filters.push(new fabric.Image.filters.Sepia());
    } else if (filterType === 'grayscale') {
        activeObj.filters.push(new fabric.Image.filters.Grayscale());
    }

    activeObj.applyFilters();
    canvas.renderAll();
}

// Add Text
document.getElementById('addTextBtn').addEventListener('click', () => {
    const text = new fabric.Textbox('Type here...', {
        left: 50,
        top: 50,
        fontSize: 24,
        fill: 'black',
        borderColor: '#000',
        cornerColor: '#000',
        cornerSize: 10,
        transparentCorners: false,
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
});

// Save Image
document.getElementById('saveBtn').addEventListener('click', () => {
    const dataURL = canvas.toDataURL({
        format: 'jpeg',
        quality: 0.9,
    });
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'edited-image.jpg';
    link.click();
});
// app.js (add this at the bottom)
function resizeCanvas() {
    const canvasElement = document.getElementById('canvas');
    canvas.setWidth(canvasElement.parentElement.offsetWidth - 40); // Adjust for padding
    canvas.setHeight(window.innerHeight - 40); // Adjust for padding
    canvas.renderAll();
}

// Initial resize
resizeCanvas();

// Resize on window changes
window.addEventListener('resize', resizeCanvas);
