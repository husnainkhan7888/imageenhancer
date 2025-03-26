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
            img.scaleToWidth(canvas.getWidth() * 0.8); // Scale image to fit canvas
            canvas.add(img);
            canvas.centerObject(img); // Center the image
            canvas.renderAll(); // Render the canvas
        });
    };
    reader.readAsDataURL(file);
});
