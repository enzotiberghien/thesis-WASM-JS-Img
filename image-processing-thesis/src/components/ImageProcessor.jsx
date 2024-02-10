import React, { useEffect, useRef, useState } from 'react';
import { sobelEdgeDetectionJS, applyGaussianBlurJS, toGrayscaleJS } from '../algorithms';
import init, { apply_gaussian_blur as wasmGausianBlur, apply_sobel_edge_detection as wasmSobelEdgeDetection } from '../rust_wasm/pkg/rust_wasm'; // Adjust the import path

const ImageProcessor = () => {
  const canvasRef = useRef(null);
  const [performanceJS, setPerformanceJS] = useState(null);
  const [performanceWASM, setPerformanceWASM] = useState(null);
  const [originalImage, setOriginalImage] = useState(null); // Store the original image
  const [isWasmLoaded, setIsWasmLoaded] = useState(false);

  useEffect(() => {
      init()
          .then(() => {
              setIsWasmLoaded(true);
          })
          .catch(err => console.error("Error loading WASM:", err));
  }, []);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setOriginalImage(img);
        drawImage(img);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const drawImage = (img) => {
    const canvas = canvasRef.current;
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
  };

  
  const processWithJS = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const startTime = performance.now();
    const processedData = sobelEdgeDetectionJS(imageData);
    setPerformanceJS(performance.now() - startTime);
    ctx.putImageData(processedData, 0, 0);
  };

  const processWithWASM = () => {
    if (!isWasmLoaded) return null
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = new Uint8ClampedArray(imageData.data.buffer);
  
    const startTime = performance.now();
    wasmSobelEdgeDetection(pixels, imageData.width, imageData.height);
    const endTime = performance.now();
  
    setPerformanceWASM(endTime - startTime);
  
    ctx.putImageData(new ImageData(pixels, imageData.width, imageData.height), 0, 0);
  };
  

  const resetImage = () => {
    if (originalImage) {
      drawImage(originalImage);
      setPerformanceJS(null);
      setPerformanceWASM(null);
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      <button onClick={processWithJS}>Process with JS</button>
      <button onClick={processWithWASM}>Process with WASM</button>
      <button onClick={resetImage}>Reset Image</button> {/* Reset button */}
      <div>JS Processing Time: {performanceJS ? `${performanceJS.toFixed(2)}ms` : 'N/A'}</div>
      <div>WASM Processing Time: {performanceWASM ? `${performanceWASM.toFixed(2)}ms` : 'N/A'}</div>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
};

export default ImageProcessor;
