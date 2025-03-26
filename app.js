// Initialize Fabric.js canvas
const canvas = new fabric.Canvas('canvas', { backgroundColor: '#fff' });

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
    canvas.setActiveObject(canvas.getActiveObject());
    canvas.clipPath = new fabric.Rect({
        left: 50,
        top: 50,
        width: 200,
        height: 200,
        fill: 'transparent',
        stroke: 'red',
    });
    canvas.renderAll();
});

// Rotate
document.getElementById('rotateBtn').addEventListener('click', () => {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
        activeObject.rotate(activeObject.angle + 90);
        canvas.renderAll();
    }
});

// Brightness and Contrast
document.getElementById('brightnessSlider').addEventListener('input', (e) => {
    const brightness = parseInt(e.target.value);
    applyBrightnessContrast(brightness, parseInt(document.getElementById('contrastSlider').value));
});

document.getElementById('contrastSlider').addEventListener('input', (e) => {
    const contrast = parseInt(e.target.value);
    applyBrightnessContrast(parseInt(document.getElementById('brightnessSlider').value), contrast);
});

function applyBrightnessContrast(brightness, contrast) {
    canvas.forEachObject((obj) => {
        obj.filters.push(new fabric.Image.filters.Brightness({ brightness: brightness / 100 }));
        obj.filters.push(new fabric.Image.filters.Contrast({ contrast: contrast / 100 }));
        obj.applyFilters();
    });
    canvas.renderAll();
}

// Sepia Filter
document.getElementById('sepiaBtn').addEventListener('click', () => {
    canvas.forEachObject((obj) => {
        obj.filters.push(new fabric.Image.filters.Sepia());
        obj.applyFilters();
    });
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
