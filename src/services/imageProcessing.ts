import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import { removeBackground as imglyRemoveBackground } from '@imgly/background-removal';
import { loadImage, readFileAsArrayBuffer } from '../utils/fileUtils';

export interface CompressOptions {
  quality: number; // 0.1 to 1.0
  format: 'image/jpeg' | 'image/png' | 'image/webp';
  targetSizeKb?: number;
  preserveMetadata?: boolean;
}

export interface ResizeOptions {
  mode: 'pixel' | 'percentage' | 'targetSize';
  width?: number;
  height?: number;
  percentage?: number;
  targetSizeKb?: number;
  maintainAspectRatio: boolean;
  format: 'image/jpeg' | 'image/png' | 'image/webp';
}

export interface CropOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  zoom?: number;
  format?: 'image/jpeg' | 'image/png' | 'image/webp';
}

export interface EnhanceOptions {
  brightness: number; // -100 to 100
  contrast: number; // -100 to 100
  saturation: number; // -100 to 100
  sharpness: number; // 0 to 100
  autoEnhance?: boolean;
}

export interface BackgroundRemoveOptions {
  mode: 'transparent' | 'white' | 'custom';
  customColor?: string;
  threshold?: number; // 1 to 100
  feather?: number;
}

export interface PassportOptions {
  preset: 'us-passport' | 'eu-visa' | 'id-card' | 'custom';
  widthMm: number;
  heightMm: number;
  dpi: number;
  bgColor: 'original' | 'white' | 'offwhite' | 'blue' | 'transparent';
  createPrintSheet: boolean; // 4x6 inch 6-photo sheet
}

export interface WatermarkImageOptions {
  type: 'text' | 'image';
  text?: string;
  imageSrc?: string;
  position: 'top-left' | 'top-center' | 'top-right' | 'center' | 'bottom-left' | 'bottom-center' | 'bottom-right' | 'tile';
  opacity: number; // 0.1 to 1.0
  fontSize: number;
  color: string;
  rotation: number;
  outline?: boolean;
}

export interface RedactBox {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'blur' | 'pixelate' | 'black';
}

export interface ImageToPdfOptions {
  pageSize: 'a4' | 'a3' | 'letter' | 'fit';
  orientation: 'portrait' | 'landscape' | 'auto';
  margin: number; // mm
  quality: number;
}

export class ImageProcessor {
  /**
   * Compress an image with quality control and optional target file size iteration
   */
  static async compressImage(file: File, options: CompressOptions): Promise<{ blob: Blob; width: number; height: number }> {
    const img = await loadImage(URL.createObjectURL(file));
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;

    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);

    let quality = options.quality;
    let blob: Blob = await new Promise((resolve) => canvas.toBlob((b) => resolve(b!), options.format, quality));

    // If target size is specified, binary search / iterative reduction
    if (options.targetSizeKb && options.targetSizeKb > 0) {
      const targetBytes = options.targetSizeKb * 1024;
      if (blob.size > targetBytes) {
        let minQ = 0.05;
        let maxQ = quality;
        for (let i = 0; i < 5; i++) {
          const midQ = (minQ + maxQ) / 2;
          const testBlob: Blob = await new Promise((resolve) => canvas.toBlob((b) => resolve(b!), options.format, midQ));
          if (testBlob.size > targetBytes) {
            maxQ = midQ;
          } else {
            minQ = midQ;
            blob = testBlob;
          }
        }
      }
    }

    return { blob, width: canvas.width, height: canvas.height };
  }

  /**
   * Resize image by pixels, percentage, or target size
   */
  static async resizeImage(file: File, options: ResizeOptions): Promise<{ blob: Blob; width: number; height: number }> {
    const img = await loadImage(URL.createObjectURL(file));
    let targetW = img.naturalWidth || img.width;
    let targetH = img.naturalHeight || img.height;

    if (options.mode === 'percentage' && options.percentage) {
      const scale = options.percentage / 100;
      targetW = Math.round(targetW * scale);
      targetH = Math.round(targetH * scale);
    } else if (options.mode === 'pixel') {
      if (options.width && options.height) {
        targetW = options.width;
        targetH = options.height;
      } else if (options.width) {
        const ratio = targetH / targetW;
        targetW = options.width;
        targetH = Math.round(options.width * ratio);
      } else if (options.height) {
        const ratio = targetW / targetH;
        targetH = options.height;
        targetW = Math.round(options.height * ratio);
      }
    } else if (options.mode === 'targetSize' && options.targetSizeKb) {
      // Scale down dimension estimate to match target size
      const targetBytes = options.targetSizeKb * 1024;
      if (file.size > targetBytes) {
        const scale = Math.sqrt(targetBytes / file.size) * 0.95;
        targetW = Math.max(50, Math.round(targetW * scale));
        targetH = Math.max(50, Math.round(targetH * scale));
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, targetW);
    canvas.height = Math.max(1, targetH);

    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, targetW, targetH);

    const blob: Blob = await new Promise((resolve) => canvas.toBlob((b) => resolve(b!), options.format, 0.92));
    return { blob, width: targetW, height: targetH };
  }

  /**
   * Crop image with rotation & zoom
   */
  static async cropImage(file: File, options: CropOptions): Promise<{ blob: Blob; width: number; height: number }> {
    const img = await loadImage(URL.createObjectURL(file));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(options.width));
    canvas.height = Math.max(1, Math.round(options.height));

    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.save();
    if (options.rotation) {
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((options.rotation * Math.PI) / 180);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
    }

    ctx.drawImage(
      img,
      options.x,
      options.y,
      options.width,
      options.height,
      0,
      0,
      canvas.width,
      canvas.height
    );
    ctx.restore();

    const format = options.format || 'image/png';
    const blob: Blob = await new Promise((resolve) => canvas.toBlob((b) => resolve(b!), format, 0.95));
    return { blob, width: canvas.width, height: canvas.height };
  }

  /**
   * Rotate and flip image
   */
  static async rotateFlipImage(
    file: File,
    angle: number, // 90, 180, 270
    flipH: boolean = false,
    flipV: boolean = false
  ): Promise<{ blob: Blob; width: number; height: number }> {
    const img = await loadImage(URL.createObjectURL(file));
    const rad = (angle * Math.PI) / 180;
    const sin = Math.abs(Math.sin(rad));
    const cos = Math.abs(Math.cos(rad));

    const originalW = img.naturalWidth || img.width;
    const originalH = img.naturalHeight || img.height;

    const newW = Math.round(originalW * cos + originalH * sin);
    const newH = Math.round(originalW * sin + originalH * cos);

    const canvas = document.createElement('canvas');
    canvas.width = newW;
    canvas.height = newH;
    const ctx = canvas.getContext('2d')!;

    ctx.translate(newW / 2, newH / 2);
    ctx.rotate(rad);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    ctx.drawImage(img, -originalW / 2, -originalH / 2);

    const blob: Blob = await new Promise((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png'));
    return { blob, width: newW, height: newH };
  }

  /**
   * Auto & manual image quality enhancer
   */
  static async enhanceImage(file: File, options: EnhanceOptions): Promise<{ blob: Blob; width: number; height: number }> {
    const img = await loadImage(URL.createObjectURL(file));
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;

    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    let b = options.brightness;
    let c = options.contrast;
    let s = options.saturation;

    if (options.autoEnhance) {
      b = 10;
      c = 18;
      s = 22;
    }

    const contrastFactor = (259 * (c + 255)) / (255 * (259 - c));
    const satFactor = 1 + s / 100;

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let bl = data[i + 2];

      // Brightness
      r += (b * 255) / 100;
      g += (b * 255) / 100;
      bl += (b * 255) / 100;

      // Contrast
      r = contrastFactor * (r - 128) + 128;
      g = contrastFactor * (g - 128) + 128;
      bl = contrastFactor * (bl - 128) + 128;

      // Saturation
      const gray = 0.2989 * r + 0.587 * g + 0.114 * bl;
      r = gray + satFactor * (r - gray);
      g = gray + satFactor * (g - gray);
      bl = gray + satFactor * (bl - gray);

      data[i] = Math.min(255, Math.max(0, r));
      data[i + 1] = Math.min(255, Math.max(0, g));
      data[i + 2] = Math.min(255, Math.max(0, bl));
    }

    ctx.putImageData(imgData, 0, 0);

    const blob: Blob = await new Promise((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png'));
    return { blob, width: canvas.width, height: canvas.height };
  }

  /**
   * Background Remover with Neural AI segmentation and custom background composition
   */
  static async removeBackground(file: File, options: BackgroundRemoveOptions): Promise<{ blob: Blob; width: number; height: number }> {
    const originalImg = await loadImage(URL.createObjectURL(file));
    const w = originalImg.naturalWidth || originalImg.width;
    const h = originalImg.naturalHeight || originalImg.height;

    let transparentBlob: Blob;

    try {
      // 1. Primary AI Neural Segmentation
      transparentBlob = await imglyRemoveBackground(file, {
        model: 'isnet_quint8',
      });
    } catch (aiErr) {
      console.warn('AI segmentation fallback to perimeter algorithm:', aiErr);
      // High precision perimeter color distance fallback
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = w;
      tempCanvas.height = h;
      const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true })!;
      tempCtx.drawImage(originalImg, 0, 0);

      const imgData = tempCtx.getImageData(0, 0, w, h);
      const data = imgData.data;

      // Sample perimeter border pixels
      let avgR = 0, avgG = 0, avgB = 0;
      let count = 0;
      const step = Math.max(1, Math.floor((w + h) / 80));

      for (let x = 0; x < w; x += step) {
        const topIdx = (x) * 4;
        const botIdx = ((h - 1) * w + x) * 4;
        avgR += data[topIdx] + data[botIdx];
        avgG += data[topIdx + 1] + data[botIdx + 1];
        avgB += data[topIdx + 2] + data[botIdx + 2];
        count += 2;
      }
      for (let y = 0; y < h; y += step) {
        const leftIdx = (y * w) * 4;
        const rightIdx = (y * w + (w - 1)) * 4;
        avgR += data[leftIdx] + data[rightIdx];
        avgG += data[leftIdx + 1] + data[rightIdx + 1];
        avgB += data[leftIdx + 2] + data[rightIdx + 2];
        count += 2;
      }

      avgR /= count;
      avgG /= count;
      avgB /= count;

      const threshold = (options.threshold || 35) * 2.5;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const dist = Math.sqrt(
          Math.pow(r - avgR, 2) +
          Math.pow(g - avgG, 2) +
          Math.pow(b - avgB, 2)
        );

        if (dist < threshold) {
          const alpha = Math.min(255, Math.max(0, Math.round(((dist / threshold) ** 2) * 255)));
          data[i + 3] = alpha;
        }
      }

      tempCtx.putImageData(imgData, 0, 0);
      transparentBlob = await new Promise((resolve) => tempCanvas.toBlob((b) => resolve(b!), 'image/png'));
    }

    // If transparent output was requested, return directly
    if (options.mode === 'transparent') {
      return { blob: transparentBlob, width: w, height: h };
    }

    // Otherwise, composite onto the requested solid background
    const transparentImg = await loadImage(URL.createObjectURL(transparentBlob));
    const compCanvas = document.createElement('canvas');
    compCanvas.width = w;
    compCanvas.height = h;
    const compCtx = compCanvas.getContext('2d')!;

    if (options.mode === 'white') {
      compCtx.fillStyle = '#FFFFFF';
      compCtx.fillRect(0, 0, w, h);
    } else if (options.mode === 'custom' && options.customColor) {
      compCtx.fillStyle = options.customColor;
      compCtx.fillRect(0, 0, w, h);
    }

    compCtx.drawImage(transparentImg, 0, 0);

    const finalBlob: Blob = await new Promise((resolve) => compCanvas.toBlob((b) => resolve(b!), 'image/png'));
    return { blob: finalBlob, width: w, height: h };
  }

  /**
   * Passport / Photo Maker (2x2 inch, Schengen 35x45mm, ID card, 6-photo print sheet)
   */
  static async generatePassportPhoto(file: File, options: PassportOptions): Promise<{ blob: Blob; width: number; height: number }> {
    const img = await loadImage(URL.createObjectURL(file));

    // Convert mm to pixels at specified DPI
    const mmToInch = 1 / 25.4;
    const photoWidthPx = Math.round(options.widthMm * mmToInch * options.dpi);
    const photoHeightPx = Math.round(options.heightMm * mmToInch * options.dpi);

    // Single photo canvas
    const singleCanvas = document.createElement('canvas');
    singleCanvas.width = photoWidthPx;
    singleCanvas.height = photoHeightPx;
    const sCtx = singleCanvas.getContext('2d')!;

    // Background fill if requested
    if (options.bgColor === 'white') {
      sCtx.fillStyle = '#FFFFFF';
      sCtx.fillRect(0, 0, photoWidthPx, photoHeightPx);
    } else if (options.bgColor === 'offwhite') {
      sCtx.fillStyle = '#F8FAFC';
      sCtx.fillRect(0, 0, photoWidthPx, photoHeightPx);
    } else if (options.bgColor === 'blue') {
      sCtx.fillStyle = '#38BDF8';
      sCtx.fillRect(0, 0, photoWidthPx, photoHeightPx);
    }

    // Cover-fit image centered
    const imgW = img.naturalWidth || img.width;
    const imgH = img.naturalHeight || img.height;
    const imgRatio = imgW / imgH;
    const targetRatio = photoWidthPx / photoHeightPx;

    let srcW = imgW;
    let srcH = imgH;
    let srcX = 0;
    let srcY = 0;

    if (imgRatio > targetRatio) {
      srcW = imgH * targetRatio;
      srcX = (imgW - srcW) / 2;
    } else {
      srcH = imgW / targetRatio;
      srcY = (imgH - srcH) / 4; // Biometric headroom bias
    }

    sCtx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, photoWidthPx, photoHeightPx);

    // Border line for passport cutting
    sCtx.strokeStyle = '#E2E8F0';
    sCtx.lineWidth = 1;
    sCtx.strokeRect(0, 0, photoWidthPx, photoHeightPx);

    if (!options.createPrintSheet) {
      const blob: Blob = await new Promise((resolve) => singleCanvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.98));
      return { blob, width: photoWidthPx, height: photoHeightPx };
    }

    // Generate 4x6 inch (102x152 mm) print sheet with 6 photos grid
    const sheetWidthPx = Math.round(152.4 * mmToInch * options.dpi);
    const sheetHeightPx = Math.round(101.6 * mmToInch * options.dpi);

    const sheetCanvas = document.createElement('canvas');
    sheetCanvas.width = sheetWidthPx;
    sheetCanvas.height = sheetHeightPx;
    const sheetCtx = sheetCanvas.getContext('2d')!;

    sheetCtx.fillStyle = '#FFFFFF';
    sheetCtx.fillRect(0, 0, sheetWidthPx, sheetHeightPx);

    // 2 rows of 3 photos
    const cols = 3;
    const rows = 2;
    const gapX = (sheetWidthPx - cols * photoWidthPx) / (cols + 1);
    const gapY = (sheetHeightPx - rows * photoHeightPx) / (rows + 1);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const posX = Math.round(gapX + c * (photoWidthPx + gapX));
        const posY = Math.round(gapY + r * (photoHeightPx + gapY));
        sheetCtx.drawImage(singleCanvas, posX, posY);

        // Cutting crosshairs
        sheetCtx.strokeStyle = '#CBD5E1';
        sheetCtx.lineWidth = 1;
        sheetCtx.strokeRect(posX, posY, photoWidthPx, photoHeightPx);
      }
    }

    const blob: Blob = await new Promise((resolve) => sheetCanvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.98));
    return { blob, width: sheetWidthPx, height: sheetHeightPx };
  }

  /**
   * Watermark an image with high-res auto-scaling, tiling, and crisp rendering
   */
  static async watermarkImage(file: File, options: WatermarkImageOptions): Promise<{ blob: Blob; width: number; height: number }> {
    const img = await loadImage(URL.createObjectURL(file));
    const canvas = document.createElement('canvas');
    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);

    // Proportional font sizing based on image resolution (e.g., 4000px photo scales nicely)
    const scaleFactor = Math.max(0.6, Math.min(w, h) / 800);
    const effectiveFontSize = Math.max(16, Math.round(options.fontSize * scaleFactor));

    ctx.save();
    ctx.globalAlpha = Math.max(0.05, Math.min(1.0, options.opacity));

    if (options.position === 'tile') {
      // Tiled repeating diagonal watermark across entire image
      if (options.type === 'text' && options.text) {
        ctx.font = `bold ${effectiveFontSize}px Inter, -apple-system, BlinkMacSystemFont, sans-serif`;
        ctx.fillStyle = options.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const stepX = Math.max(180, effectiveFontSize * options.text.length * 1.2);
        const stepY = Math.max(120, effectiveFontSize * 4.5);

        for (let y = -h; y < h * 2.5; y += stepY) {
          for (let x = -w; x < w * 2.5; x += stepX) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate((options.rotation * Math.PI) / 180);
            if (options.outline) {
              ctx.strokeStyle = options.color.toLowerCase() === '#ffffff' || options.color.toLowerCase() === 'white' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.7)';
              ctx.lineWidth = Math.max(2, Math.round(effectiveFontSize * 0.08));
              ctx.strokeText(options.text, 0, 0);
            }
            ctx.fillText(options.text, 0, 0);
            ctx.restore();
          }
        }
      }
    } else {
      // Single placement watermark
      const padding = Math.max(20, Math.round(40 * scaleFactor));
      let x = w / 2;
      let y = h / 2;

      switch (options.position) {
        case 'top-left':
          x = padding + (effectiveFontSize * (options.text?.length || 6)) / 3;
          y = padding + effectiveFontSize;
          break;
        case 'top-center':
          x = w / 2;
          y = padding + effectiveFontSize;
          break;
        case 'top-right':
          x = w - padding - (effectiveFontSize * (options.text?.length || 6)) / 3;
          y = padding + effectiveFontSize;
          break;
        case 'center':
          x = w / 2;
          y = h / 2;
          break;
        case 'bottom-left':
          x = padding + (effectiveFontSize * (options.text?.length || 6)) / 3;
          y = h - padding - effectiveFontSize;
          break;
        case 'bottom-center':
          x = w / 2;
          y = h - padding - effectiveFontSize;
          break;
        case 'bottom-right':
          x = w - padding - (effectiveFontSize * (options.text?.length || 6)) / 3;
          y = h - padding - effectiveFontSize;
          break;
      }

      if (options.type === 'text' && options.text) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((options.rotation * Math.PI) / 180);
        ctx.font = `bold ${effectiveFontSize}px Inter, -apple-system, BlinkMacSystemFont, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (options.outline) {
          ctx.strokeStyle = options.color.toLowerCase() === '#ffffff' || options.color.toLowerCase() === 'white' ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.85)';
          ctx.lineWidth = Math.max(3, Math.round(effectiveFontSize * 0.1));
          ctx.strokeText(options.text, 0, 0);
        }

        ctx.fillStyle = options.color;
        ctx.fillText(options.text, 0, 0);
        ctx.restore();
      } else if (options.type === 'image' && options.imageSrc) {
        const logo = await loadImage(options.imageSrc);
        const logoW = Math.min(w * 0.3, logo.width * scaleFactor);
        const logoH = (logoW / logo.width) * logo.height;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((options.rotation * Math.PI) / 180);
        ctx.drawImage(logo, -logoW / 2, -logoH / 2, logoW, logoH);
        ctx.restore();
      }
    }

    ctx.restore();

    const blob: Blob = await new Promise((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png'));
    return { blob, width: canvas.width, height: canvas.height };
  }

  /**
   * Redact sensitive information on image (Blur, Pixelate, Blackout)
   */
  static async redactImage(file: File, boxes: RedactBox[]): Promise<{ blob: Blob; width: number; height: number }> {
    const img = await loadImage(URL.createObjectURL(file));
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;

    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);

    boxes.forEach(box => {
      const bx = Math.max(0, Math.round(box.x));
      const by = Math.max(0, Math.round(box.y));
      const bw = Math.min(canvas.width - bx, Math.round(box.width));
      const bh = Math.min(canvas.height - by, Math.round(box.height));

      if (bw <= 0 || bh <= 0) return;

      if (box.type === 'black') {
        ctx.fillStyle = '#000000';
        ctx.fillRect(bx, by, bw, bh);
      } else if (box.type === 'pixelate') {
        const pixelSize = Math.max(8, Math.round(bw / 12));
        const subCanvas = document.createElement('canvas');
        subCanvas.width = Math.max(1, Math.round(bw / pixelSize));
        subCanvas.height = Math.max(1, Math.round(bh / pixelSize));
        const subCtx = subCanvas.getContext('2d')!;
        subCtx.drawImage(canvas, bx, by, bw, bh, 0, 0, subCanvas.width, subCanvas.height);

        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(subCanvas, 0, 0, subCanvas.width, subCanvas.height, bx, by, bw, bh);
        ctx.imageSmoothingEnabled = true;
      } else if (box.type === 'blur') {
        // Multi-pass blur sampling
        ctx.filter = 'blur(12px)';
        ctx.drawImage(canvas, bx, by, bw, bh, bx, by, bw, bh);
        ctx.filter = 'none';
      }
    });

    const blob: Blob = await new Promise((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png'));
    return { blob, width: canvas.width, height: canvas.height };
  }

  /**
   * Convert multiple images into a unified PDF
   */
  static async imagesToPdf(files: File[], options: ImageToPdfOptions): Promise<Blob> {
    const pdfDoc = await PDFDocument.create();

    // Dimensions in points (72 points per inch)
    const pageDimensions: Record<string, [number, number]> = {
      a4: [595.28, 841.89],
      a3: [841.89, 1190.55],
      letter: [612.0, 792.0],
      fit: [595.28, 841.89] // dynamically adjusted
    };

    const marginPt = (options.margin / 25.4) * 72;

    for (const file of files) {
      const buffer = await readFileAsArrayBuffer(file);
      const isPng = file.type === 'image/png' || file.name.endsWith('.png');
      let pdfImage;
      if (isPng) {
        pdfImage = await pdfDoc.embedPng(buffer);
      } else {
        pdfImage = await pdfDoc.embedJpg(buffer);
      }

      let [pWidth, pHeight] = pageDimensions[options.pageSize] || pageDimensions.a4;

      if (options.pageSize === 'fit') {
        pWidth = pdfImage.width + marginPt * 2;
        pHeight = pdfImage.height + marginPt * 2;
      } else if (options.orientation === 'landscape' || (options.orientation === 'auto' && pdfImage.width > pdfImage.height)) {
        if (pWidth < pHeight) {
          const temp = pWidth;
          pWidth = pHeight;
          pHeight = temp;
        }
      }

      const page = pdfDoc.addPage([pWidth, pHeight]);

      const availWidth = pWidth - marginPt * 2;
      const availHeight = pHeight - marginPt * 2;
      const scale = Math.min(availWidth / pdfImage.width, availHeight / pdfImage.height, 1);

      const drawWidth = pdfImage.width * scale;
      const drawHeight = pdfImage.height * scale;
      const drawX = marginPt + (availWidth - drawWidth) / 2;
      const drawY = marginPt + (availHeight - drawHeight) / 2;

      page.drawImage(pdfImage, {
        x: drawX,
        y: drawY,
        width: drawWidth,
        height: drawHeight,
      });
    }

    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
  }

  /**
   * Bundle multiple images into an organized ZIP archive
   */
  static async imagesToZip(files: File[], prefix: string = 'image', compressionLevel: number = 6): Promise<Blob> {
    const zip = new JSZip();
    const folder = zip.folder('FileForge_Images') || zip;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.substring(file.name.lastIndexOf('.')) || '.jpg';
      const safeName = prefix ? `${prefix}_${i + 1}${ext}` : file.name;
      folder.file(safeName, file);
    }

    return await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: compressionLevel }
    });
  }
}
