document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const openImageBtn = document.getElementById('openImageBtn');
  const imageInput = document.getElementById('imageInput');
  const canvas = document.getElementById('imageCanvas');
  const ctx = canvas.getContext('2d');
  const cropBtn = document.getElementById('cropBtn');
  const resizeBtn = document.getElementById('resizeBtn');
  const rotateBtn = document.getElementById('rotateBtn');
  const saveBtn = document.getElementById('saveBtn');
  const homeBtn = document.getElementById('homeBtn');
  const drawBtn = document.getElementById('drawBtn');
  const filterOptions = document.querySelectorAll('.filter-option');
  const resizeModal = document.getElementById('resizeModal');
  const closeModal = document.querySelector('.modal .close');
  const applyResize = document.getElementById('applyResize');
  const newWidthInput = document.getElementById('newWidth');
  const newHeightInput = document.getElementById('newHeight');

  // State variables
  let image = new Image();
  let originalImageData = null;
  let cropMode = false;
  let drawMode = false;
  let cropping = { startX: 0, startY: 0, dragging: false };

  // --- Open Image ---
  openImageBtn.addEventListener('click', () => {
    imageInput.click();
  });
  imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      image = new Image();
      image.onload = () => {
        canvas.width = image.width;
        canvas.height = image.height;
        ctx.drawImage(image, 0, 0);
        originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      };
      image.src = evt.target.result;
    };
    reader.readAsDataURL(file);
  });

  // --- Home Button: Reset to Original ---
  homeBtn.addEventListener('click', () => {
    if (originalImageData) {
      canvas.width = originalImageData.width;
      canvas.height = originalImageData.height;
      ctx.putImageData(originalImageData, 0, 0);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    cropMode = false;
    drawMode = false;
    canvas.style.cursor = "default";
  });

  // --- Crop Functionality ---
  cropBtn.addEventListener('click', () => {
    if (!image.src) {
      alert("Load an image first.");
      return;
    }
    cropMode = true;
    drawMode = false;
    canvas.style.cursor = "crosshair";
    alert("Crop mode enabled: click and drag to select the area to crop.");
  });

  canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (cropMode) {
      cropping.startX = x;
      cropping.startY = y;
      cropping.dragging = true;
    }
    if (drawMode) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      canvas.isDrawing = true;
    }
  });

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (cropMode && cropping.dragging) {
      // Redraw original image then draw crop rectangle
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0);
      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      const width = x - cropping.startX;
      const height = y - cropping.startY;
      ctx.strokeRect(cropping.startX, cropping.startY, width, height);
    }
    if (drawMode && canvas.isDrawing) {
      ctx.lineTo(x, y);
      ctx.strokeStyle = "blue";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  });

  canvas.addEventListener('mouseup', (e) => {
    if (cropMode && cropping.dragging) {
      const rect = canvas.getBoundingClientRect();
      const endX = e.clientX - rect.left;
      const endY = e.clientY - rect.top;
      cropping.dragging = false;
      // Determine crop rectangle dimensions
      const cropX = Math.min(cropping.startX, endX);
      const cropY = Math.min(cropping.startY, endY);
      const cropWidth = Math.abs(endX - cropping.startX);
      const cropHeight = Math.abs(endY - cropping.startY);
      if(cropWidth && cropHeight){
        // Get the cropped image and update canvas
        const croppedData = ctx.getImageData(cropX, cropY, cropWidth, cropHeight);
        canvas.width = cropWidth;
        canvas.height = cropHeight;
        ctx.putImageData(croppedData, 0, 0);
        // Update image object with new cropped image
        const croppedImg = new Image();
        croppedImg.onload = () => {
          image = croppedImg;
          originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        };
        croppedImg.src = canvas.toDataURL();
      }
      cropMode = false;
      canvas.style.cursor = "default";
    }
    if (drawMode && canvas.isDrawing) {
      canvas.isDrawing = false;
    }
  });

  // --- Resize Functionality ---
  resizeBtn.addEventListener('click', () => {
    if (!image.src) {
      alert("Load an image first.");
      return;
    }
    newWidthInput.value = canvas.width;
    newHeightInput.value = canvas.height;
    resizeModal.style.display = "block";
  });
  closeModal.addEventListener('click', () => {
    resizeModal.style.display = "none";
  });
  applyResize.addEventListener('click', () => {
    const newWidth = parseInt(newWidthInput.value);
    const newHeight = parseInt(newHeightInput.value);
    if (isNaN(newWidth) || isNaN(newHeight) || newWidth <= 0 || newHeight <= 0) {
      alert("Enter valid dimensions.");
      return;
    }
    // Create a temporary canvas to perform resizing
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = newWidth;
    tempCanvas.height = newHeight;
    tempCtx.drawImage(image, 0, 0, newWidth, newHeight);
    canvas.width = newWidth;
    canvas.height = newHeight;
    ctx.drawImage(tempCanvas, 0, 0);
    image.src = canvas.toDataURL();
    image.onload = () => {
      originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    };
    resizeModal.style.display = "none";
  });

  // --- Filters ---
  filterOptions.forEach(btn => {
    btn.addEventListener('click', () => {
      if (!image.src) {
        alert("Load an image first.");
        return;
      }
      applyFilter(btn.dataset.filter);
    });
  });

  function applyFilter(filter) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    if (filter === "grayscale") {
      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i+1] + data[i+2]) / 3;
        data[i] = data[i+1] = data[i+2] = avg;
      }
    } else if (filter === "invert") {
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i];
        data[i+1] = 255 - data[i+1];
        data[i+2] = 255 - data[i+2];
      }
    }
    ctx.putImageData(imageData, 0, 0);
    image.src = canvas.toDataURL();
    image.onload = () => {
      originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    };
  }

  // --- Rotate (90° Clockwise) ---
  rotateBtn.addEventListener('click', () => {
    if (!image.src) {
      alert("Load an image first.");
      return;
    }
    // Create a temporary canvas with swapped dimensions
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = canvas.height;
    tempCanvas.height = canvas.width;
    tempCtx.translate(tempCanvas.width / 2, tempCanvas.height / 2);
    tempCtx.rotate(90 * Math.PI / 180);
    tempCtx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
    canvas.width = tempCanvas.width;
    canvas.height = tempCanvas.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(tempCanvas, 0, 0);
    image.src = canvas.toDataURL();
    image.onload = () => {
      originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    };
  });

  // --- Draw Mode ---
  drawBtn.addEventListener('click', () => {
    if (!image.src) {
      alert("Load an image first.");
      return;
    }
    drawMode = !drawMode;
    cropMode = false;
    canvas.style.cursor = drawMode ? "crosshair" : "default";
    drawBtn.classList.toggle('active', drawMode);
    alert(drawMode ? "Draw mode enabled." : "Draw mode disabled.");
  });

  // --- Save Image ---
  saveBtn.addEventListener('click', () => {
    if (!image.src) {
      alert("No image to save.");
      return;
    }
    const link = document.createElement('a');
    link.download = 'edited-image.png';
    link.href = canvas.toDataURL();
    link.click();
  });

  // Close modal when clicking outside the modal content
  window.addEventListener('click', (e) => {
    if (e.target === resizeModal) {
      resizeModal.style.display = "none";
    }
  });
});
