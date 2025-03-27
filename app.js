document.addEventListener('DOMContentLoaded', function() {
  // Global elements and state variables
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

  let image = new Image();
  let originalImageData = null;
  let cropMode = false;
  let drawMode = false;
  let cropping = {
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
    dragging: false
  };

  // Open image
  openImageBtn.addEventListener('click', () => {
    imageInput.click();
  });
  imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
      image = new Image();
      image.onload = function() {
        canvas.width = image.width;
        canvas.height = image.height;
        ctx.drawImage(image, 0, 0);
        // Save original image data
        originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      };
      image.src = evt.target.result;
    };
    reader.readAsDataURL(file);
  });

  // Home button: reset canvas
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
    alert("Returned to Home!");
  });

  // Crop functionality: enable crop mode and allow user to draw rectangle
  cropBtn.addEventListener('click', () => {
    cropMode = true;
    drawMode = false;
    canvas.style.cursor = "crosshair";
    alert("Crop mode enabled. Click and drag on the image to select area.");
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
      // Redraw the image then overlay the cropping rectangle
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
      cropping.endX = e.clientX - rect.left;
      cropping.endY = e.clientY - rect.top;
      cropping.dragging = false;
      // Calculate crop dimensions
      let cropX = Math.min(cropping.startX, cropping.endX);
      let cropY = Math.min(cropping.startY, cropping.endY);
      let cropWidth = Math.abs(cropping.endX - cropping.startX);
      let cropHeight = Math.abs(cropping.endY - cropping.startY);
      // Get the cropped image data and update canvas
      const croppedData = ctx.getImageData(cropX, cropY, cropWidth, cropHeight);
      canvas.width = cropWidth;
      canvas.height = cropHeight;
      ctx.putImageData(croppedData, 0, 0);
      // Update the image object to the cropped image
      const croppedImg = new Image();
      croppedImg.src = canvas.toDataURL();
      croppedImg.onload = function() {
        image = croppedImg;
        originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      };
      cropMode = false;
      canvas.style.cursor = "default";
    }
    if (drawMode && canvas.isDrawing) {
      canvas.isDrawing = false;
    }
  });

  // Resize functionality: open modal for new dimensions
  resizeBtn.addEventListener('click', () => {
    if (!image.src) {
      alert("Please load an image first.");
      return;
    }
    resizeModal.style.display = "block";
  });
  closeModal.addEventListener('click', () => {
    resizeModal.style.display = "none";
  });
  applyResize.addEventListener('click', () => {
    const newWidth = parseInt(newWidthInput.value);
    const newHeight = parseInt(newHeightInput.value);
    if (isNaN(newWidth) || isNaN(newHeight) || newWidth <= 0 || newHeight <= 0) {
      alert("Please enter valid dimensions.");
      return;
    }
    // Create a temporary canvas to draw the resized image
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = newWidth;
    tempCanvas.height = newHeight;
    tempCtx.drawImage(image, 0, 0, newWidth, newHeight);
    // Update main canvas
    canvas.width = newWidth;
    canvas.height = newHeight;
    ctx.drawImage(tempCanvas, 0, 0);
    // Update image and original data
    image.src = canvas.toDataURL();
    image.onload = () => {
      originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    };
    resizeModal.style.display = "none";
  });

  // Filters functionality: apply chosen filter
  filterOptions.forEach(btn => {
    btn.addEventListener('click', () => {
      if (!image.src) {
        alert("Please load an image first.");
        return;
      }
      const filter = btn.dataset.filter;
      applyFilter(filter);
    });
  });

  function applyFilter(filter) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    if (filter === "grayscale") {
      for (let i = 0; i < data.length; i += 4) {
        let avg = (data[i] + data[i+1] + data[i+2]) / 3;
        data[i] = data[i+1] = data[i+2] = avg;
      }
    } else if (filter === "invert") {
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i];       // red
        data[i+1] = 255 - data[i+1];   // green
        data[i+2] = 255 - data[i+2];   // blue
      }
    }
    ctx.putImageData(imageData, 0, 0);
    // Update the image and original data
    image.src = canvas.toDataURL();
    image.onload = () => {
      originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    };
  }

  // Rotate functionality: rotate image 90° clockwise
  rotateBtn.addEventListener('click', () => {
    if (!image.src) {
      alert("Please load an image first.");
      return;
    }
    // Create a temporary canvas with swapped dimensions
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = canvas.height;
    tempCanvas.height = canvas.width;
    tempCtx.translate(tempCanvas.width/2, tempCanvas.height/2);
    tempCtx.rotate(90 * Math.PI/180);
    tempCtx.drawImage(canvas, -canvas.width/2, -canvas.height/2);
    // Update main canvas dimensions and content
    canvas.width = tempCanvas.width;
    canvas.height = tempCanvas.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(tempCanvas, 0, 0);
    // Update image and original data
    image.src = canvas.toDataURL();
    image.onload = () => {
      originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    };
  });

  // Draw functionality: toggle free drawing mode
  drawBtn.addEventListener('click', () => {
    if (!image.src) {
      alert("Please load an image first.");
      return;
    }
    drawMode = !drawMode;
    cropMode = false;
    canvas.style.cursor = drawMode ? "crosshair" : "default";
    drawBtn.classList.toggle('active', drawMode);
    alert(drawMode ? "Draw mode enabled. Draw on the image with your mouse." : "Draw mode disabled.");
  });

  // Save functionality: download canvas as image
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

  // Close modal if clicking outside content
  window.addEventListener('click', (e) => {
    if (e.target == resizeModal) {
      resizeModal.style.display = "none";
    }
  });
});
