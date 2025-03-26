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

        // Enhance colors by increasing saturation
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // Convert RGB to HSL
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            let h, s, l = (max + min) / 2;

            if (max === min) {
                h = s = 0; // Achromatic (gray)
            } else {
                const d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                    case g: h = (b - r) / d + 2; break;
                    case b: h = (r - g) / d + 4; break;
                }
                h /= 6;
            }

            // Increase saturation
            s = Math.min(s * 1.5, 1);

            // Convert HSL back to RGB
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            data[i] = hueToRgb(p, q, h + 1 / 3) * 255;     // Red
            data[i + 1] = hueToRgb(p, q, h) * 255;         // Green
            data[i + 2] = hueToRgb(p, q, h - 1 / 3) * 255; // Blue
        }

        // Helper function for HSL to RGB conversion
        function hueToRgb(p, q, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
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
