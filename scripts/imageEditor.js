let canvas;
let imgInstance = null;
let originalImage = null;
let cropRect = null;
let isCropping = false;

// Filters global for quick references
const FILTERS = {
  grayscale: new fabric.Image.filters.Grayscale(),
  invert: new fabric.Image.filters.Invert(),
  sepia: new fabric.Image.filters.Sepia()
};

// We'll create dynamic filters for brightness, contrast, saturation, etc.
let brightnessFilter = new fabric.Image.filters.Brightness({ brightness: 0 });
let contrastFilter = new fabric.Image.filters.Contrast({ contrast: 0 });
let saturationFilter = new fabric.Image.filters.Saturation({ saturation: 0 });

window.addEventListener('DOMContentLoaded', () => {
  // Initialize Fabric.js canvas
  canvas = new fabric.Canvas('imageCanvas', {
    preserveObjectStacking: true
  });

  // Handle image upload
  document.getElementById('imageUpload').addEventListener('change', handleImageUpload);

  // Setup text styling watchers
  canvas.on('object:selected', function(e) {
    if (e.target && e.target.type === 'textbox') {
      updateUIForText(e.target);
    }
  });
  canvas.on('selection:cleared', function() {
    resetTextUI();
  });
});

// -------------------------------------
// 1. Image Upload and Rendering
// -------------------------------------
function handleImageUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(f) {
    fabric.Image.fromURL(f.target.result, function(img) {
      canvas.clear();
      imgInstance = img;
      originalImage = img;
      imgInstance.set({
        selectable: true
      });
      // Scale image to fit the canvas
      const canvasWidth = canvas.getWidth();
      imgInstance.scaleToWidth(canvasWidth * 0.8);
      canvas.add(imgInstance);
      canvas.renderAll();
    });
  };
  reader.readAsDataURL(file);
}

// -------------------------------------
// 2. Apply Filters
// -------------------------------------
function applyFilter(type) {
  if (!imgInstance) return;

  switch (type) {
    case 'grayscale':
    case 'invert':
    case 'sepia':
      // Clear other filters to ensure we only apply one main effect at a time
      resetMainFilters();
      imgInstance.filters.push(FILTERS[type]);
      break;
    case 'brightness':
      brightnessFilter = new fabric.Image.filters.Brightness({ brightness: brightnessFilter.brightness + 0.1 });
      imgInstance.filters.push(brightnessFilter);
      break;
    case 'contrast':
      contrastFilter = new fabric.Image.filters.Contrast({ contrast: contrastFilter.contrast + 0.1 });
      imgInstance.filters.push(contrastFilter);
      break;
    case 'saturation':
      saturationFilter = new fabric.Image.filters.Saturation({ saturation: saturationFilter.saturation + 0.1 });
      imgInstance.filters.push(saturationFilter);
      break;
    default:
      return;
  }

  imgInstance.applyFilters();
  canvas.renderAll();
}

function resetFilters() {
  if (!imgInstance) return;
  imgInstance.filters = [];
  brightnessFilter = new fabric.Image.filters.Brightness({ brightness: 0 });
  contrastFilter = new fabric.Image.filters.Contrast({ contrast: 0 });
  saturationFilter = new fabric.Image.filters.Saturation({ saturation: 0 });
  imgInstance.applyFilters();
  canvas.renderAll();
}

function resetMainFilters() {
  // Remove grayscale/invert/sepia if present
  imgInstance.filters = imgInstance.filters.filter((f) => {
    return !(f instanceof fabric.Image.filters.Grayscale ||
             f instanceof fabric.Image.filters.Invert ||
             f instanceof fabric.Image.filters.Sepia);
  });
  // Keep brightness, contrast, saturation
}

// -------------------------------------
// 3. Crop
// -------------------------------------
function startCrop() {
  if (!imgInstance) return;
  if (isCropping) return;

  // Create a semi-transparent overlay rect
  const { left, top, width, height } = imgInstance.getBoundingRect();
  cropRect = new fabric.Rect({
    left: left + 10,
    top: top + 10,
    width: width - 20,
    height: height - 20,
    fill: 'rgba(0,0,0,0.3)',
    stroke: 'red',
    strokeWidth: 2,
    selectable: true,
    hasRotatingPoint: false,
    lockRotation: true
  });

  canvas.add(cropRect);
  canvas.setActiveObject(cropRect);
  isCropping = true;
}

function applyCrop() {
  if (!cropRect || !imgInstance) return;

  const { left, top, width, height } = cropRect;
  // Convert canvas coords to image coords
  const croppedImage = new fabric.Image(imgInstance._originalElement, {
    left: 0,
    top: 0,
    angle: 0
  });

  // The scale factor we applied to the original image
  const scaleX = imgInstance.scaleX;
  const scaleY = imgInstance.scaleY;

  // Crop region in the original image's coordinates
  const cropX = (left - imgInstance.left) / scaleX;
  const cropY = (top - imgInstance.top) / scaleY;
  const cropW = width / scaleX;
  const cropH = height / scaleY;

  croppedImage.set({
    clipPath: new fabric.Rect({
      left: cropX,
      top: cropY,
      width: cropW,
      height: cropH
    })
  });

  canvas.remove(imgInstance);
  canvas.remove(cropRect);

  croppedImage.scaleToWidth(canvas.getWidth() * 0.8);
  canvas.add(croppedImage);
  imgInstance = croppedImage; // The new image is now our working image
  canvas.renderAll();

  cropRect = null;
  isCropping = false;
}

function cancelCrop() {
  if (cropRect) {
    canvas.remove(cropRect);
    cropRect = null;
    isCropping = false;
    canvas.renderAll();
  }
}

// -------------------------------------
// 4. Text Editing
// -------------------------------------
function addText() {
  const text = new fabric.Textbox('Your Text Here', {
    left: 50,
    top: 50,
    fontFamily: 'Arial',
    fontSize: 24,
    fill: '#000000'
  });
  canvas.add(text);
  canvas.setActiveObject(text);
}

function updateTextStyle() {
  const activeObject = canvas.getActiveObject();
  if (!activeObject || activeObject.type !== 'textbox') return;

  const fontFamily = document.getElementById('fontFamily').value;
  const fontSize = parseInt(document.getElementById('fontSize').value, 10);
  const fontColor = document.getElementById('fontColor').value;

  activeObject.set({
    fontFamily: fontFamily,
    fontSize: fontSize,
    fill: fontColor
  });
  canvas.renderAll();
}

function updateUIForText(textObject) {
  document.getElementById('fontFamily').value = textObject.fontFamily || 'Arial';
  document.getElementById('fontSize').value = textObject.fontSize || 24;
  document.getElementById('fontColor').value = textObject.fill || '#000000';
}

function resetTextUI() {
  document.getElementById('fontFamily').value = 'Arial';
  document.getElementById('fontSize').value = 24;
  document.getElementById('fontColor').value = '#000000';
}

// -------------------------------------
// 5. Background Removal (Demo Placeholder)
// -------------------------------------
async function removeBackground() {
  if (!imgInstance) return alert('Please upload an image first.');
  // In a real scenario, you'd either:
  // 1) Convert the image to a Blob, send to your server or remove.bg API, get back the processed image, and replace it in canvas.
  // 2) Use a client-side ML approach (e.g., TensorFlow.js body-pix, etc.).
  //
  // Below is just a placeholder for demonstration.

  alert('This is a demo placeholder for background removal.\nIntegrate an API or ML model here.');

  // Example remove.bg usage (Server-Side or via a Proxy):
  /*
  const apiKey = 'YOUR_REMOVE_BG_API_KEY';
  const dataURL = canvas.toDataURL('image/png');
  
  // Send dataURL (base64) to your backend to call remove.bg
  // Then load the returned image back into Fabric canvas.
  */
}

// -------------------------------------
// 6. Reset and Download
// -------------------------------------
function resetImage() {
  if (!originalImage) return;
  canvas.clear();
  originalImage.clone(function(cloned) {
    imgInstance = cloned;
    canvas.add(imgInstance);
    canvas.renderAll();
  });
}

function downloadImage() {
  if (!imgInstance) return alert('No image to download.');
  const dataURL = canvas.toDataURL({ format: 'png' });
  const link = document.createElement('a');
  link.href = dataURL;
  link.download = 'edited-image.png';
  link.click();
}
let canvas;
let imgInstance = null;
let originalImage = null;
let cropRect = null;
let isCropping = false;

// Filters global for quick references
const FILTERS = {
  grayscale: new fabric.Image.filters.Grayscale(),
  invert: new fabric.Image.filters.Invert(),
  sepia: new fabric.Image.filters.Sepia()
};

// We'll create dynamic filters for brightness, contrast, saturation, etc.
let brightnessFilter = new fabric.Image.filters.Brightness({ brightness: 0 });
let contrastFilter = new fabric.Image.filters.Contrast({ contrast: 0 });
let saturationFilter = new fabric.Image.filters.Saturation({ saturation: 0 });

window.addEventListener('DOMContentLoaded', () => {
  // Initialize Fabric.js canvas
  canvas = new fabric.Canvas('imageCanvas', {
    preserveObjectStacking: true
  });

  // Handle image upload
  document.getElementById('imageUpload').addEventListener('change', handleImageUpload);

  // Setup text styling watchers
  canvas.on('object:selected', function(e) {
    if (e.target && e.target.type === 'textbox') {
      updateUIForText(e.target);
    }
  });
  canvas.on('selection:cleared', function() {
    resetTextUI();
  });
});

// -------------------------------------
// 1. Image Upload and Rendering
// -------------------------------------
function handleImageUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(f) {
    fabric.Image.fromURL(f.target.result, function(img) {
      canvas.clear();
      imgInstance = img;
      originalImage = img;
      imgInstance.set({
        selectable: true
      });
      // Scale image to fit the canvas
      const canvasWidth = canvas.getWidth();
      imgInstance.scaleToWidth(canvasWidth * 0.8);
      canvas.add(imgInstance);
      canvas.renderAll();
    });
  };
  reader.readAsDataURL(file);
}

// -------------------------------------
// 2. Apply Filters
// -------------------------------------
function applyFilter(type) {
  if (!imgInstance) return;

  switch (type) {
    case 'grayscale':
    case 'invert':
    case 'sepia':
      // Clear other filters to ensure we only apply one main effect at a time
      resetMainFilters();
      imgInstance.filters.push(FILTERS[type]);
      break;
    case 'brightness':
      brightnessFilter = new fabric.Image.filters.Brightness({ brightness: brightnessFilter.brightness + 0.1 });
      imgInstance.filters.push(brightnessFilter);
      break;
    case 'contrast':
      contrastFilter = new fabric.Image.filters.Contrast({ contrast: contrastFilter.contrast + 0.1 });
      imgInstance.filters.push(contrastFilter);
      break;
    case 'saturation':
      saturationFilter = new fabric.Image.filters.Saturation({ saturation: saturationFilter.saturation + 0.1 });
      imgInstance.filters.push(saturationFilter);
      break;
    default:
      return;
  }

  imgInstance.applyFilters();
  canvas.renderAll();
}

function resetFilters() {
  if (!imgInstance) return;
  imgInstance.filters = [];
  brightnessFilter = new fabric.Image.filters.Brightness({ brightness: 0 });
  contrastFilter = new fabric.Image.filters.Contrast({ contrast: 0 });
  saturationFilter = new fabric.Image.filters.Saturation({ saturation: 0 });
  imgInstance.applyFilters();
  canvas.renderAll();
}

function resetMainFilters() {
  // Remove grayscale/invert/sepia if present
  imgInstance.filters = imgInstance.filters.filter((f) => {
    return !(f instanceof fabric.Image.filters.Grayscale ||
             f instanceof fabric.Image.filters.Invert ||
             f instanceof fabric.Image.filters.Sepia);
  });
  // Keep brightness, contrast, saturation
}

// -------------------------------------
// 3. Crop
// -------------------------------------
function startCrop() {
  if (!imgInstance) return;
  if (isCropping) return;

  // Create a semi-transparent overlay rect
  const { left, top, width, height } = imgInstance.getBoundingRect();
  cropRect = new fabric.Rect({
    left: left + 10,
    top: top + 10,
    width: width - 20,
    height: height - 20,
    fill: 'rgba(0,0,0,0.3)',
    stroke: 'red',
    strokeWidth: 2,
    selectable: true,
    hasRotatingPoint: false,
    lockRotation: true
  });

  canvas.add(cropRect);
  canvas.setActiveObject(cropRect);
  isCropping = true;
}

function applyCrop() {
  if (!cropRect || !imgInstance) return;

  const { left, top, width, height } = cropRect;
  // Convert canvas coords to image coords
  const croppedImage = new fabric.Image(imgInstance._originalElement, {
    left: 0,
    top: 0,
    angle: 0
  });

  // The scale factor we applied to the original image
  const scaleX = imgInstance.scaleX;
  const scaleY = imgInstance.scaleY;

  // Crop region in the original image's coordinates
  const cropX = (left - imgInstance.left) / scaleX;
  const cropY = (top - imgInstance.top) / scaleY;
  const cropW = width / scaleX;
  const cropH = height / scaleY;

  croppedImage.set({
    clipPath: new fabric.Rect({
      left: cropX,
      top: cropY,
      width: cropW,
      height: cropH
    })
  });

  canvas.remove(imgInstance);
  canvas.remove(cropRect);

  croppedImage.scaleToWidth(canvas.getWidth() * 0.8);
  canvas.add(croppedImage);
  imgInstance = croppedImage; // The new image is now our working image
  canvas.renderAll();

  cropRect = null;
  isCropping = false;
}

function cancelCrop() {
  if (cropRect) {
    canvas.remove(cropRect);
    cropRect = null;
    isCropping = false;
    canvas.renderAll();
  }
}

// -------------------------------------
// 4. Text Editing
// -------------------------------------
function addText() {
  const text = new fabric.Textbox('Your Text Here', {
    left: 50,
    top: 50,
    fontFamily: 'Arial',
    fontSize: 24,
    fill: '#000000'
  });
  canvas.add(text);
  canvas.setActiveObject(text);
}

function updateTextStyle() {
  const activeObject = canvas.getActiveObject();
  if (!activeObject || activeObject.type !== 'textbox') return;

  const fontFamily = document.getElementById('fontFamily').value;
  const fontSize = parseInt(document.getElementById('fontSize').value, 10);
  const fontColor = document.getElementById('fontColor').value;

  activeObject.set({
    fontFamily: fontFamily,
    fontSize: fontSize,
    fill: fontColor
  });
  canvas.renderAll();
}

function updateUIForText(textObject) {
  document.getElementById('fontFamily').value = textObject.fontFamily || 'Arial';
  document.getElementById('fontSize').value = textObject.fontSize || 24;
  document.getElementById('fontColor').value = textObject.fill || '#000000';
}

function resetTextUI() {
  document.getElementById('fontFamily').value = 'Arial';
  document.getElementById('fontSize').value = 24;
  document.getElementById('fontColor').value = '#000000';
}

// -------------------------------------
// 5. Background Removal (Demo Placeholder)
// -------------------------------------
async function removeBackground() {
  if (!imgInstance) return alert('Please upload an image first.');
  // In a real scenario, you'd either:
  // 1) Convert the image to a Blob, send to your server or remove.bg API, get back the processed image, and replace it in canvas.
  // 2) Use a client-side ML approach (e.g., TensorFlow.js body-pix, etc.).
  //
  // Below is just a placeholder for demonstration.

  alert('This is a demo placeholder for background removal.\nIntegrate an API or ML model here.');

  // Example remove.bg usage (Server-Side or via a Proxy):
  /*
  const apiKey = 'YOUR_REMOVE_BG_API_KEY';
  const dataURL = canvas.toDataURL('image/png');
  
  // Send dataURL (base64) to your backend to call remove.bg
  // Then load the returned image back into Fabric canvas.
  */
}

// -------------------------------------
// 6. Reset and Download
// -------------------------------------
function resetImage() {
  if (!originalImage) return;
  canvas.clear();
  originalImage.clone(function(cloned) {
    imgInstance = cloned;
    canvas.add(imgInstance);
    canvas.renderAll();
  });
}

function downloadImage() {
  if (!imgInstance) return alert('No image to download.');
  const dataURL = canvas.toDataURL({ format: 'png' });
  const link = document.createElement('a');
  link.href = dataURL;
  link.download = 'edited-image.png';
  link.click();
}
