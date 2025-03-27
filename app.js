// Global variables
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let img = new Image();
let originalImageData = null;
let isCropping = false;
let cropStart = { x: 0, y: 0 };
let croppingRect = null;
let isDrawingText = false;

// Load image when file is selected
function loadImage(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

img.onload = function() {
  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);
  originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
};

// --- Crop Functionality ---
function cropImage() {
  if (!img.src) {
    alert("Please load an image first.");
    return;
  }
  isCropping = true;
  alert("Crop mode enabled: click and drag on the image.");
}

canvas.addEventListener('mousedown', function(e) {
  if (!isCropping) return;
  const rect = canvas.getBoundingClientRect();
  cropStart.x = e.clientX - rect.left;
  cropStart.y = e.clientY - rect.top;
  croppingRect = null;
  canvas.style.cursor = 'crosshair';
});

canvas.addEventListener('mousemove', function(e) {
  if (!isCropping) return;
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  const width = mouseX - cropStart.x;
  const height = mouseY - cropStart.y;
  croppingRect = { x: cropStart.x, y: cropStart.y, width, height };
  // Redraw original image and the cropping rectangle
  ctx.putImageData(originalImageData, 0, 0);
  ctx.strokeStyle = 'red';
  ctx.lineWidth = 2;
  ctx.strokeRect(cropStart.x, cropStart.y, width, height);
});

canvas.addEventListener('mouseup', function(e) {
  if (!isCropping || !croppingRect) return;
  // Perform crop
  const { x, y, width, height } = croppingRect;
  const croppedData = ctx.getImageData(x, y, Math.abs(width), Math.abs(height));
  canvas.width = Math.abs(width);
  canvas.height = Math.abs(height);
  ctx.putImageData(croppedData, 0, 0);
  // Update image and original data\n  img.src = canvas.toDataURL();\n  img.onload = function(){\n    originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);\n  };\n  isCropping = false;\n  canvas.style.cursor = 'default';\n});

// --- Resize Functionality ---
function resizeImage() {
  if (!img.src) {
    alert("Please load an image first.");
    return;
  }
  let newWidth = prompt("Enter new width:", canvas.width);
  let newHeight = prompt("Enter new height:", canvas.height);
  newWidth = parseInt(newWidth);
  newHeight = parseInt(newHeight);
  if (!newWidth || !newHeight) {
    alert("Invalid dimensions.");
    return;
  }
  // Create temporary canvas and redraw image
  let tempCanvas = document.createElement('canvas');
  let tempCtx = tempCanvas.getContext('2d');
  tempCanvas.width = newWidth;
  tempCanvas.height = newHeight;
  tempCtx.drawImage(img, 0, 0, newWidth, newHeight);
  canvas.width = newWidth;
  canvas.height = newHeight;
  ctx.drawImage(tempCanvas, 0, 0);
  // Update image and original data
  img.src = canvas.toDataURL();
  img.onload = function() {
    originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  }
}

// --- Rotate Functionality (90° Clockwise) ---
function rotateImage() {
  if (!img.src) {
    alert("Please load an image first.");
    return;
  }
  let tempCanvas = document.createElement('canvas');
  let tempCtx = tempCanvas.getContext('2d');
  tempCanvas.width = canvas.height;
  tempCanvas.height = canvas.width;
  tempCtx.translate(tempCanvas.width / 2, tempCanvas.height / 2);
  tempCtx.rotate(90 * Math.PI / 180);
  tempCtx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
  canvas.width = tempCanvas.width;
  canvas.height = tempCanvas.height;
  ctx.drawImage(tempCanvas, 0, 0);
  img.src = canvas.toDataURL();
  img.onload = function() {
    originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  }
}

// --- Flip Functionality (Horizontal) ---
function flipImage() {
  if (!img.src) {
    alert("Please load an image first.");
    return;
  }
  ctx.save();
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  ctx.restore();
  img.src = canvas.toDataURL();
  img.onload = function() {
    originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  }
}

// --- Filter Functions ---
// For grayscale and invert, we modify the image data.
function applyFilter(filter) {
  if (!img.src) {
    alert("Please load an image first.");
    return;
  }
  let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let data = imageData.data;
  if (filter === 'grayscale') {
    for (let i = 0; i < data.length; i += 4) {
      let avg = (data[i] + data[i+1] + data[i+2]) / 3;
      data[i] = data[i+1] = data[i+2] = avg;
    }
  } else if (filter === 'invert') {
    for (let i = 0; i < data.length; i += 4) {
      data[i]     = 255 - data[i];     // R\n      data[i+1]   = 255 - data[i+1]; // G\n      data[i+2]   = 255 - data[i+2]; // B\n    }\n  } else if (filter === 'blur') {\n    // Use canvas context filter for blur\n    ctx.filter = 'blur(3px)';\n    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);\n    ctx.filter = 'none';\n  } else if (filter === 'sharpen') {\n    // A simple sharpen using convolution can be implemented here\n    // For demo, we'll alert that this feature is under development\n    alert('Sharpen filter is under development.');\n    return;\n  }\n  ctx.putImageData(imageData, 0, 0);\n  img.src = canvas.toDataURL();\n  img.onload = function() {\n    originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);\n  }\n}\n\n// --- Add Text Functionality ---\nfunction addText() {\n  if (!img.src) {\n    alert('Please load an image first.');\n    return;\n  }\n  let text = prompt('Enter text to add:');\n  if (!text) return;\n  // For simplicity, we add text at the center\n  ctx.font = '40px Arial';\n  ctx.fillStyle = 'rgba(255,255,255,0.8)';\n  ctx.textAlign = 'center';\n  ctx.fillText(text, canvas.width / 2, canvas.height / 2);\n  img.src = canvas.toDataURL();\n  img.onload = function() {\n    originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);\n  }\n}\n\n// --- Download Image ---\nfunction downloadImage() {\n  if (!img.src) {\n    alert('No image to save.');\n    return;\n  }\n  let link = document.createElement('a');\n  link.download = 'edited-image.png';\n  link.href = canvas.toDataURL();\n  link.click();\n}\n\n// Expose loadImage function for file input\nwindow.loadImage = loadImage;\n</script>\n```

---

## Instructions

1. **Place Files Together:**  
   Save the HTML (with the updated `<script src=\"script.js\"></script>` reference), **styles.css**, and **script.js** files in the same folder.

2. **Logo File:**  
   Replace `"logo.png"` in the header with your actual logo image file (or update the path).

3. **Usage:**  
   - Use the file input (or associated label if you prefer) to load an image.
   - Click the various toolbar buttons to perform crop, resize, rotate, flip, apply filters (grayscale, invert, blur), add text, and finally save your image.

This professional, modular setup uses modern CSS and JavaScript practices. You can further extend individual functions (like implementing a proper sharpen filter) as needed. Enjoy your fully functional image editing tool!
