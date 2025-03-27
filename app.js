document.addEventListener('DOMContentLoaded', function() {
  const openImageBtn = document.getElementById('openImageBtn');
  const imageInput = document.getElementById('imageInput');
  const canvas = document.getElementById('imageCanvas');
  const ctx = canvas.getContext('2d');
  
  // Open image button click triggers the file input
  openImageBtn.addEventListener('click', function() {
    imageInput.click();
  });
  
  // Handle file input change to load and display the image
  imageInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
      const img = new Image();
      img.onload = function() {
        // Set canvas dimensions to image dimensions and draw the image
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });

  // Basic event listeners for additional functionality
  document.getElementById('cropBtn').addEventListener('click', function() {
    alert('Crop functionality coming soon!');
    // Implement cropping logic here
  });

  document.getElementById('resizeBtn').addEventListener('click', function() {
    alert('Resize functionality coming soon!');
    // Implement resizing logic here
  });

  document.getElementById('filtersBtn').addEventListener('click', function() {
    alert('Filters functionality coming soon!');
    // Implement filter application logic here
  });

  document.getElementById('saveBtn').addEventListener('click', function() {
    // Create a download link for the edited image
    const link = document.createElement('a');
    link.download = 'edited-image.png';
    link.href = canvas.toDataURL();
    link.click();
  });

  document.getElementById('homeBtn').addEventListener('click', function() {
    // Reset the canvas and return to the home view
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = canvas.height = 0;
    alert('Returned to Home!');
  });
});
