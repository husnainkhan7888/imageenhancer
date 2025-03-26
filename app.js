document.getElementById('enhanceButton').addEventListener('click', enhanceColors);

// Track slider values
const brightnessSlider = document.getElementById('brightnessSlider');
const contrastSlider = document.getElementById('contrastSlider');

function enhanceColors() {
    const input = document.getElementById('imageInput');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const resultDiv = document.getElementById('result');

    if (!input.files.length) {
        alert('Please upload an image.');
        return;
    }

    const img = new Image();
    img.src = URL.createObjectURL(input.files[0]);
    img.onload = () => {
        // Draw the image onto the canvas
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Get pixel data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Apply brightness and contrast adjustments
        const brightness = parseInt(brightnessSlider.value);
        const contrast = parseInt(contrastSlider.value);

        for (let i = 0; i < data.length; i += 4) {
            // Brightness adjustment
            data[i] += brightness;     // Red
            data[i + 1] += brightness; // Green
            data[i + 2] += brightness; // Blue

            // Contrast adjustment
            data[i] = ((data[i] - 128) * (contrast / 100 + 1)) + 128;     // Red
            data[i + 1] = ((data[i + 1] - 128) * (contrast / 100 + 1)) + 128; // Green
            data[i + 2] = ((data[i + 2] - 128) * (contrast / 100 + 1)) + 128; // Blue
        }

        // Put the modified image data back onto the canvas
        ctx.putImageData(imageData, 0, 0);

        // Display the enhanced image
        const enhancedImg = new Image();
        enhancedImg.src = canvas.toDataURL('image/jpeg');
        resultDiv.innerHTML = '';
        resultDiv.appendChild(enhancedImg);
    };
}
