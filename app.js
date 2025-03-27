// Global variables for the image editor
let canvas, imgInstance, originalImage;

window.addEventListener('DOMContentLoaded', () => {
  // Initialize Fabric.js canvas
  canvas = new fabric.Canvas('imageCanvas');
  document.getElementById('imageUpload').addEventListener('change', handleImageUpload);

  // Setup video upload event
  document.getElementById('videoUpload').addEventListener('change', handleVideoUpload);
});

// ----------------------
// Image Editor Functions
// ----------------------
function handleImageUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(f) {
    fabric.Image.fromURL(f.target.result, function(img) {
      canvas.clear();
      imgInstance = img;
      // Keep a copy of the original image for reset
      originalImage = img;
      // Scale image to fit the canvas width
      img.scaleToWidth(canvas.getWidth());
      canvas.add(img);
      canvas.renderAll();
    });
  }
  reader.readAsDataURL(file);
}

function applyFilter(filterType) {
  if (!imgInstance) return;
  let filter;
  switch(filterType) {
    case 'grayscale':
      filter = new fabric.Image.filters.Grayscale();
      break;
    case 'invert':
      filter = new fabric.Image.filters.Invert();
      break;
    default:
      return;
  }
  // Clear any existing filters and apply new filter
  imgInstance.filters = [];
  imgInstance.filters.push(filter);
  imgInstance.applyFilters();
  canvas.renderAll();
}

function resetImage() {
  if (!originalImage) return;
  canvas.clear();
  // Clone the original image so that we reset all changes
  originalImage.clone(function(cloned) {
    imgInstance = cloned;
    canvas.add(imgInstance);
    canvas.renderAll();
  });
}

// ----------------------
// Video Editor Functions
// ----------------------

// Import FFmpeg functions
const { createFFmpeg, fetchFile } = FFmpeg;
const ffmpeg = createFFmpeg({ log: true });

// Load FFmpeg.wasm
async function loadFFmpeg() {
  if (!ffmpeg.isLoaded()) {
    await ffmpeg.load();
  }
}

function handleVideoUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  const videoURL = URL.createObjectURL(file);
  const videoPlayer = document.getElementById('videoPlayer');
  videoPlayer.src = videoURL;
}

async function trimVideo() {
  const videoInput = document.getElementById('videoUpload').files[0];
  if (!videoInput) {
    alert('Please upload a video first.');
    return;
  }
  
  await loadFFmpeg();
  ffmpeg.FS('writeFile', 'input.mp4', await fetchFile(videoInput));
  // Example: trim the video to the first 5 seconds
  await ffmpeg.run('-i', 'input.mp4', '-ss', '00:00:00', '-t', '5', '-c', 'copy', 'output.mp4');
  const data = ffmpeg.FS('readFile', 'output.mp4');
  const videoURL = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
  const videoPlayer = document.getElementById('videoPlayer');
  videoPlayer.src = videoURL;
  alert('Video trimmed to the first 5 seconds.');
}

async function extractFrame() {
  const videoInput = document.getElementById('videoUpload').files[0];
  if (!videoInput) {
    alert('Please upload a video first.');
    return;
  }
  
  await loadFFmpeg();
  ffmpeg.FS('writeFile', 'input.mp4', await fetchFile(videoInput));
  // Extract a frame at 1 second
  await ffmpeg.run('-i', 'input.mp4', '-ss', '00:00:01', '-frames:v', '1', 'frame.png');
  const data = ffmpeg.FS('readFile', 'frame.png');
  const imgURL = URL.createObjectURL(new Blob([data.buffer], { type: 'image/png' }));
  
  // Display the extracted frame in a new window
  const imgWindow = window.open("");
  imgWindow.document.write(`<img src="${imgURL}" alt="Extracted Frame"/>`);
}
