// Initialize Fabric.js canvas
const canvas = new fabric.Canvas('canvas', { backgroundColor: '#fff' });

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
            img.scaleToWidth(canvas.getWidth() * 0.8); // Scale image to fit canvas
            canvas.add(img);
            canvas.centerObject(img); // Center the image
            canvas.renderAll(); // Render the canvas
        });
    };
    reader.readAsDataURL(file);
});

// Crop
document.getElementById('cropBtn').addEventListener('click', () => {
    const activeObject = canvas.getActiveObject();
    if (!activeObject || !(activeObject instanceof fabric.Image)) {
        alert('Please select an image to crop.');
        return;
    }

    const rect = new fabric.Rect({
        left: activeObject.left,
        top: activeObject.top,
        width: activeObject.width * 0.5,
        height: activeObject.height * 0.5,
        fill: 'transparent',
        stroke: 'red',
        strokeWidth: 2,
        selectable: true,
    });

    canvas.add(rect);
    canvas.setActiveObject(rect);
    canvas.renderAll();
});

// Rotate
document.getElementById('rotateBtn').addEventListener('click', () => {
    const activeObject = canvas.getActiveObject();
    if (!activeObject) {
        alert('Please select an object to rotate.');
        return;
    }
    activeObject.rotate(activeObject.angle + 90);
    canvas.renderAll();
});

// Resize
document.getElementById('resizeBtn').addEventListener('click', () => {
    const activeObject = canvas.getActiveObject();
    if (!activeObject) {
        alert('Please select an object to resize.');
        return;
    }
    activeObject.scaleX *= 1.2;
    activeObject.scaleY *= 1.2;
    canvas.renderAll();
});

// Brightness and Contrast
document.getElementById('brightnessSlider').addEventListener('input', (e) => {
    applyBrightnessContrast(parseInt(e.target.value), parseInt(document.getElementById('contrastSlider').value));
});

document.getElementById('contrastSlider').addEventListener('input', (e) => {
    applyBrightnessContrast(parseInt(document.getElementById('brightnessSlider').value), parseInt(e.target.value));
});

function applyBrightnessContrast(brightness, contrast) {
    const activeObject = canvas.getActiveObject();
    if (!activeObject || !(activeObject instanceof fabric.Image)) {
        alert('Please select an image to adjust brightness/contrast.');
        return;
    }

    activeObject.filters = [];
    if (brightness !== 0) {
        activeObject.filters.push(new fabric.Image.filters.Brightness({ brightness: brightness / 100 }));
    }
    if (contrast !== 0) {
        activeObject.filters.push(new fabric.Image.filters.Contrast({ contrast: contrast / 100 }));
    }
    activeObject.applyFilters();
    canvas.renderAll();
}

// Sepia Filter
document.getElementById('sepiaBtn').addEventListener('click', () => {
    const activeObject = canvas.getActiveObject();
    if (!activeObject || !(activeObject instanceof fabric.Image)) {
        alert('Please select an image to apply sepia.');
        return;
    }

    activeObject.filters.push(new fabric.Image.filters.Sepia());
    activeObject.applyFilters();
    canvas.renderAll();
});

// Grayscale Filter
document.getElementById('grayscaleBtn').addEventListener('click', () => {
    const activeObject = canvas.getActiveObject();
    if (!activeObject || !(activeObject instanceof fabric.Image)) {
        alert('Please select an image to apply grayscale.');
        return;
    }

    activeObject.filters.push(new fabric.Image.filters.Grayscale());
    activeObject.applyFilters();
    canvas.renderAll();
});

// Add Text
document.getElementById('addTextBtn').addEventListener('click', () => {
    const text = new fabric.Textbox('Enter text here', {
        left: 50,
        top: 50,
        fontSize: 30,
        fill: 'black',
        borderColor: 'red',
        cornerColor: 'green',
        cornerSize: 10,
        transparentCorners: false,
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
});

// Save Image
document.getElementById('saveBtn').addEventListener('click', () => {
    const dataURL = canvas.toDataURL({ format: 'jpeg', quality: 0.8 });
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'edited-image.jpeg';
    link.click();
});
