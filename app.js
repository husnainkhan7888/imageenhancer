// Initialize Fabric.js canvas with fixed dimensions
const canvas = new fabric.Canvas('canvas', {
    backgroundColor: '#ffffff',
    width: 800,      // Match CSS variable --canvas-width
    height: 600,     // Match CSS variable --canvas-height
    preserveObjectStacking: true,
});

// Upload Image
document.getElementById('imageInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        fabric.Image.fromURL(event.target.result, (img) => {
            canvas.clear();

            // Scale image to fit canvas while maintaining aspect ratio
            const maxWidth = canvas.getWidth();
            const maxHeight = canvas.getHeight();
            let scale = 1;

            if (img.width > maxWidth || img.height > maxHeight) {
                scale = Math.min(maxWidth / img.width, maxHeight / img.height);
            }

            img.scale(scale);
            canvas.add(img);
            canvas.centerObject(img); // Center the image
            canvas.renderAll();
        });
    };
    reader.readAsDataURL(file);
});
