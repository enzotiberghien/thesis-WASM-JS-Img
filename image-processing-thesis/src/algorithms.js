export const toGrayscaleJS = (imageData) => {
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    data[i] = avg; // Red
    data[i + 1] = avg; // Green
    data[i + 2] = avg; // Blue
  }
  return imageData;
};


export const applyGaussianBlurJS = (imageData) => {
  const pixels = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  const kernel = [1, 2, 1, 2, 4, 2, 1, 2, 1];
  const kernelSum = 16;

  // Create a copy of the pixels to avoid modifying the original imageData
  const output = new Uint8ClampedArray(pixels.length);

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let totalRed = 0, totalGreen = 0, totalBlue = 0;

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const pixelIndex = ((y + ky) * width + (x + kx)) * 4;
          totalRed += pixels[pixelIndex] * kernel[(ky + 1) * 3 + (kx + 1)];
          totalGreen += pixels[pixelIndex + 1] * kernel[(ky + 1) * 3 + (kx + 1)];
          totalBlue += pixels[pixelIndex + 2] * kernel[(ky + 1) * 3 + (kx + 1)];
        }
      }

      const idx = (y * width + x) * 4;
      output[idx] = totalRed / kernelSum;
      output[idx + 1] = totalGreen / kernelSum;
      output[idx + 2] = totalBlue / kernelSum;
      output[idx + 3] = pixels[idx + 3]; // Alpha channel remains unchanged
    }
  }

  return new ImageData(output, width, height);
};


// JavaScript: Sobel Edge Detection
export function sobelEdgeDetectionJS(imageData) {
  const width = imageData.width;
  const height = imageData.height;
  const src = imageData.data;
  const dst = new Uint8ClampedArray(src.length);
  const sobelX = [
      [-1, 0, 1],
      [-2, 0, 2],
      [-1, 0, 1]
  ];
  const sobelY = [
      [-1, -2, -1],
      [0, 0, 0],
      [1, 2, 1]
  ];

  for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
          let pixelX = 0, pixelY = 0;
          for (let row = -1; row <= 1; row++) {
              for (let col = -1; col <= 1; col++) {
                  const srcIdx = ((y + row) * width + (x + col)) * 4;
                  const weightX = sobelX[row + 1][col + 1];
                  const weightY = sobelY[row + 1][col + 1];
                  pixelX += src[srcIdx] * weightX;
                  pixelY += src[srcIdx] * weightY;
              }
          }
          const magnitude = Math.sqrt(pixelX * pixelX + pixelY * pixelY) >>> 0;
          const dstIdx = (y * width + x) * 4;
          dst[dstIdx] = dst[dstIdx + 1] = dst[dstIdx + 2] = magnitude;
          dst[dstIdx + 3] = 255; // Alpha channel
      }
  }

  return new ImageData(dst, width, height);
}
