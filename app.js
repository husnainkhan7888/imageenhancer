document.getElementById('enhanceButton').addEventListener('click', enhanceImage);

function enhanceImage() {
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
        // Resize the image
        canvas.width = img.width * 0.5; // Reduce size by 50%
        canvas.height = img.height * 0.5;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Convert to grayscale
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            data[i] = avg; // Red
            data[i + 1] = avg; // Green
            data[i + 2] = avg; // Blue
        }
        ctx.putImageData(imageData, 0, 0);

        // Display the enhanced image
        const enhancedImg = new Image();
        enhancedImg.src = canvas.toDataURL('image/jpeg');
        resultDiv.innerHTML = '';
        resultDiv.appendChild(enhancedImg);
    };
}
