// FFmpeg references
const { createFFmpeg, fetchFile } = FFmpeg;
const ffmpeg = createFFmpeg({ log: true });

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('videoUpload').addEventListener('change', handleVideoUpload);
});

async function loadFFmpeg() {
  if (!ffmpeg.isLoaded()) {
    await ffmpeg.load();
  }
}

function handleVideoUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  const videoURL = URL.createObjectURL(file);
  document.getElementById('videoPlayer').src = videoURL;
}

async function trimVideo() {
  const videoInput = document.getElementById('videoUpload').files[0];
  if (!videoInput) {
    alert('Please upload a video first.');
    return;
  }

  try {
    await loadFFmpeg();
    ffmpeg.FS('writeFile', 'input.mp4', await fetchFile(videoInput));

    // Example: Trim first 5 seconds
    await ffmpeg.run('-i', 'input.mp4', '-ss', '0', '-t', '5', '-c', 'copy', 'output.mp4');
    const data = ffmpeg.FS('readFile', 'output.mp4');
    const videoURL = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
    document.getElementById('videoPlayer').src = videoURL;
    alert('Video trimmed to the first 5 seconds.');
  } catch (error) {
    console.error(error);
    alert('Error trimming video. Check console for details.');
  }
}

async function extractFrame() {
  const videoInput = document.getElementById('videoUpload').files[0];
  if (!videoInput) {
    alert('Please upload a video first.');
    return;
  }

  try {
    await loadFFmpeg();
    ffmpeg.FS('writeFile', 'input.mp4', await fetchFile(videoInput));

    // Extract a frame at 1 second
    await ffmpeg.run('-i', 'input.mp4', '-ss', '1', '-frames:v', '1', 'frame.png');
    const data = ffmpeg.FS('readFile', 'frame.png');
    const imgURL = URL.createObjectURL(new Blob([data.buffer], { type: 'image/png' }));

    // Open extracted frame in a new tab
    window.open(imgURL, '_blank');
  } catch (error) {
    console.error(error);
    alert('Error extracting frame. Check console for details.');
  }
}
// FFmpeg references
const { createFFmpeg, fetchFile } = FFmpeg;
const ffmpeg = createFFmpeg({ log: true });

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('videoUpload').addEventListener('change', handleVideoUpload);
});

async function loadFFmpeg() {
  if (!ffmpeg.isLoaded()) {
    await ffmpeg.load();
  }
}

function handleVideoUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  const videoURL = URL.createObjectURL(file);
  document.getElementById('videoPlayer').src = videoURL;
}

async function trimVideo() {
  const videoInput = document.getElementById('videoUpload').files[0];
  if (!videoInput) {
    alert('Please upload a video first.');
    return;
  }

  try {
    await loadFFmpeg();
    ffmpeg.FS('writeFile', 'input.mp4', await fetchFile(videoInput));

    // Example: Trim first 5 seconds
    await ffmpeg.run('-i', 'input.mp4', '-ss', '0', '-t', '5', '-c', 'copy', 'output.mp4');
    const data = ffmpeg.FS('readFile', 'output.mp4');
    const videoURL = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
    document.getElementById('videoPlayer').src = videoURL;
    alert('Video trimmed to the first 5 seconds.');
  } catch (error) {
    console.error(error);
    alert('Error trimming video. Check console for details.');
  }
}

async function extractFrame() {
  const videoInput = document.getElementById('videoUpload').files[0];
  if (!videoInput) {
    alert('Please upload a video first.');
    return;
  }

  try {
    await loadFFmpeg();
    ffmpeg.FS('writeFile', 'input.mp4', await fetchFile(videoInput));

    // Extract a frame at 1 second
    await ffmpeg.run('-i', 'input.mp4', '-ss', '1', '-frames:v', '1', 'frame.png');
    const data = ffmpeg.FS('readFile', 'frame.png');
    const imgURL = URL.createObjectURL(new Blob([data.buffer], { type: 'image/png' }));

    // Open extracted frame in a new tab
    window.open(imgURL, '_blank');
  } catch (error) {
    console.error(error);
    alert('Error extracting frame. Check console for details.');
  }
}
