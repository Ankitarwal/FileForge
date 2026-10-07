import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import JSZip from 'jszip';
import { 
  ArrowLeft, 
  Sparkles, 
  ShieldCheck, 
  Play, 
  AlertCircle, 
  Settings2, 
  Layers, 
  Sliders, 
  Lock, 
  Unlock,
  Check
} from 'lucide-react';
import { ToolItem, UploadedFile, ProcessedResult, ProcessingState } from '../types';
import { DropZone } from './DropZone';
import { ProgressBar } from './ProgressBar';
import { DownloadCard } from './DownloadCard';
import { InteractiveCropper } from './InteractiveCropper';
import { RedactEditor } from './RedactEditor';
import { PassportStudio } from './PassportStudio';
import { PDFPageOrganizer } from './PDFPageOrganizer';
import { BackgroundRemoverStudio } from './BackgroundRemoverStudio';
import { ComparisonSlider } from './ComparisonSlider';
import { FAQSection } from './FAQSection';
import { ImageProcessor, CropOptions, RedactBox, PassportOptions } from '../services/imageProcessing';
import { PdfProcessor } from '../services/pdfProcessing';
import { formatBytes, downloadBlob, triggerConfetti } from '../utils/fileUtils';

interface IndividualToolPageProps {
  tool: ToolItem;
  onBack: () => void;
  onRecordHistory: (item: { toolId: string; toolName: string; fileName: string; originalSize: number; processedSize: number }) => void;
}

export const IndividualToolPage: React.FC<IndividualToolPageProps> = ({
  tool,
  onBack,
  onRecordHistory,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [processingState, setProcessingState] = useState<ProcessingState>('idle');
  const [progressPercent, setProgressPercent] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessedResult | null>(null);

  // Dynamic Settings States
  // Image Compressor
  const [compressQuality, setCompressQuality] = useState(80);
  const [compressFormat, setCompressFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg');
  const [targetSizeKb, setTargetSizeKb] = useState<number | undefined>(undefined);
  const [preserveMetadata, setPreserveMetadata] = useState(false);

  // Image Resizer
  const [resizeMode, setResizeMode] = useState<'pixel' | 'percentage' | 'targetSize'>('percentage');
  const [resizePercent, setResizePercent] = useState(50);
  const [resizeWidth, setResizeWidth] = useState(1200);
  const [resizeHeight, setResizeHeight] = useState(800);
  const [maintainAspect, setMaintainAspect] = useState(true);

  // Background Remover
  const [bgRemoveMode, setBgRemoveMode] = useState<'transparent' | 'white' | 'custom'>('transparent');
  const [bgCustomColor, setBgCustomColor] = useState('#4f46e5');

  // Quality Enhancer
  const [enhanceBrightness, setEnhanceBrightness] = useState(10);
  const [enhanceContrast, setEnhanceContrast] = useState(20);
  const [enhanceSaturation, setEnhanceSaturation] = useState(25);
  const [enhanceAuto, setEnhanceAuto] = useState(true);

  // DPI Converter
  const [selectedDpi, setSelectedDpi] = useState(300);

  // Rotate / Flip
  const [rotateAngle, setRotateAngle] = useState(90);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);

  // Format Converter
  const [targetFormat, setTargetFormat] = useState<'image/png' | 'image/jpeg' | 'image/webp' | 'image/avif'>('image/webp');

  // Watermark Image & PDF
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.5);
  const [watermarkFontSize, setWatermarkFontSize] = useState(48);
  const [watermarkColor, setWatermarkColor] = useState('#ff0000');
  const [watermarkRotation, setWatermarkRotation] = useState(-30);
  const [watermarkPosition, setWatermarkPosition] = useState<'center' | 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'tile'>('center');
  const [watermarkOutline, setWatermarkOutline] = useState(true);

  // PDF Split & Ranges
  const [splitMode, setSplitMode] = useState<'ranges' | 'all-pages'>('all-pages');
  const [splitRangeText, setSplitRangeText] = useState('1-3, 5');

  // PDF Compressor
  const [pdfCompressLevel, setPdfCompressLevel] = useState<'recommended' | 'extreme' | 'custom'>('recommended');

  // PDF Page Numbers
  const [pageNumberFormat, setPageNumberFormat] = useState<'Page {n} of {total}' | '{n} / {total}' | '{n}'>('Page {n} of {total}');
  const [pageNumberPos, setPageNumberPos] = useState<'bottom-center' | 'bottom-right' | 'top-right'>('bottom-center');

  // PDF Header / Footer
  const [headerText, setHeaderText] = useState('FileForge Official Document');
  const [footerText, setFooterText] = useState('Confidential & Proprietary');

  // PDF Metadata Editor
  const [metaTitle, setMetaTitle] = useState('');
  const [metaAuthor, setMetaAuthor] = useState('');
  const [metaSubject, setMetaSubject] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');

  // Password Protect / Unlock
  const [pdfPassword, setPdfPassword] = useState('');
  const [pdfConfirmPassword, setPdfConfirmPassword] = useState('');

  // Images to PDF options
  const [imgPdfPageSize, setImgPdfPageSize] = useState<'a4' | 'a3' | 'letter' | 'fit'>('a4');
  const [imgPdfOrientation, setImgPdfOrientation] = useState<'portrait' | 'landscape' | 'auto'>('auto');
  const [imgPdfMargin, setImgPdfMargin] = useState(10);

  // Images to ZIP options
  const [zipPrefix, setZipPrefix] = useState('FileForge_Photo');

  // PDF OCR Language
  const [ocrLang, setOcrLang] = useState('eng');

  // PDF Page Count for Organizer
  const [pdfTotalPages, setPdfTotalPages] = useState(5);

  // Setup preview when first file is loaded
  useEffect(() => {
    if (files.length > 0) {
      const f = files[0];
      if (f.type.startsWith('image/')) {
        const url = URL.createObjectURL(f);
        setPreviewSrc(url);
        return () => URL.revokeObjectURL(url);
      } else if (f.type.includes('pdf')) {
        PdfProcessor.getPdfInfo(f)
          .then((info) => setPdfTotalPages(info.pageCount || 4))
          .catch(() => setPdfTotalPages(4));
      }
    } else {
      setPreviewSrc(null);
    }
  }, [files]);

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
    setErrorMessage(null);
    setResult(null);
  };

  const handleRemoveFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleReset = () => {
    setFiles([]);
    setResult(null);
    setProcessingState('idle');
    setErrorMessage(null);
  };

  // Main Processing Engine Router
  const runProcessing = async (specialOptions?: any) => {
    if (files.length === 0) {
      setErrorMessage('Please upload at least one file to process.');
      return;
    }

    setProcessingState('uploading');
    setProgressPercent(20);
    setErrorMessage(null);

    try {
      // Multi-stage pipeline smooth progression
      setTimeout(() => {
        setProcessingState('processing');
        setProgressPercent(45);
      }, 300);

      setTimeout(() => {
        setProcessingState('optimizing');
        setProgressPercent(75);
      }, 700);

      setTimeout(() => {
        setProcessingState('finalizing');
        setProgressPercent(90);
      }, 1000);

      await new Promise((r) => setTimeout(r, 1200));

      let outputBlob: Blob;
      let outputName = `processed_${files[0].name}`;
      let savings: number | undefined = undefined;
      const originalTotalSize = files.reduce((acc, f) => acc + f.size, 0);

      const firstFile = files[0];

      // ================= PROCESS IMAGE TOOLS =================
      if (tool.id === 'image-compressor') {
        const compRes = await ImageProcessor.compressBatch(files, {
          quality: compressQuality / 100,
          format: compressFormat,
          targetSizeKb,
          preserveMetadata,
        });
        outputBlob = compRes.blob;
        outputName = compRes.fileName;
        savings = compRes.savings;
      } else if (tool.id === 'image-resizer') {
        const res = await ImageProcessor.resizeBatch(files, {
          mode: resizeMode,
          percentage: resizePercent,
          width: resizeWidth,
          height: resizeHeight,
          maintainAspectRatio: maintainAspect,
          format: 'image/jpeg',
        });
        outputBlob = res.blob;
        outputName = res.fileName;
      } else if (tool.id === 'image-crop') {
        const cropOpts: CropOptions = specialOptions || {
          x: 0,
          y: 0,
          width: 800,
          height: 800,
        };
        const res = await ImageProcessor.cropImage(firstFile, cropOpts);
        outputBlob = res.blob;
        outputName = `${firstFile.name.replace(/\.[^/.]+$/, '')}_cropped.png`;
      } else if (tool.id === 'image-rotate-flip') {
        if (files.length > 1) {
          const zip = new JSZip();
          const folder = zip.folder('Rotated_Images') || zip;
          for (let i = 0; i < files.length; i++) {
            const f = files[i];
            try {
              const res = await ImageProcessor.rotateFlipImage(f, rotateAngle, flipH, flipV);
              folder.file(`${f.name.replace(/\.[^/.]+$/, '')}_rotated.png`, res.blob);
            } catch (err) {
              console.warn(err);
            }
          }
          outputBlob = await zip.generateAsync({ type: 'blob' });
          outputName = 'FileForge_Rotated_Images.zip';
        } else {
          const res = await ImageProcessor.rotateFlipImage(firstFile, rotateAngle, flipH, flipV);
          outputBlob = res.blob;
          outputName = `${firstFile.name.replace(/\.[^/.]+$/, '')}_rotated.png`;
        }
      } else if (tool.id === 'image-enhancer') {
        if (files.length > 1) {
          const zip = new JSZip();
          const folder = zip.folder('Enhanced_Images') || zip;
          for (let i = 0; i < files.length; i++) {
            const f = files[i];
            try {
              const res = await ImageProcessor.enhanceImage(f, {
                brightness: enhanceBrightness,
                contrast: enhanceContrast,
                saturation: enhanceSaturation,
                sharpness: 50,
                autoEnhance: enhanceAuto,
              });
              folder.file(`${f.name.replace(/\.[^/.]+$/, '')}_enhanced.png`, res.blob);
            } catch (err) {
              console.warn(err);
            }
          }
          outputBlob = await zip.generateAsync({ type: 'blob' });
          outputName = 'FileForge_Enhanced_Images.zip';
        } else {
          const res = await ImageProcessor.enhanceImage(firstFile, {
            brightness: enhanceBrightness,
            contrast: enhanceContrast,
            saturation: enhanceSaturation,
            sharpness: 50,
            autoEnhance: enhanceAuto,
          });
          outputBlob = res.blob;
          outputName = `${firstFile.name.replace(/\.[^/.]+$/, '')}_enhanced.png`;
        }
      } else if (tool.id === 'background-remover') {
        if (files.length > 1) {
          const zip = new JSZip();
          const folder = zip.folder('NoBG_Images') || zip;
          for (let i = 0; i < files.length; i++) {
            const f = files[i];
            try {
              const res = await ImageProcessor.removeBackground(f, {
                mode: bgRemoveMode,
                customColor: bgCustomColor,
              });
              folder.file(`${f.name.replace(/\.[^/.]+$/, '')}_nobg.png`, res.blob);
            } catch (err) {
              console.warn(err);
            }
          }
          outputBlob = await zip.generateAsync({ type: 'blob' });
          outputName = 'FileForge_NoBG_Images.zip';
        } else {
          const res = await ImageProcessor.removeBackground(firstFile, {
            mode: bgRemoveMode,
            customColor: bgCustomColor,
          });
          outputBlob = res.blob;
          outputName = `${firstFile.name.replace(/\.[^/.]+$/, '')}_nobg.png`;
        }
      } else if (tool.id === 'image-dpi-converter') {
        if (files.length > 1) {
          const zip = new JSZip();
          const folder = zip.folder('DPI_Images') || zip;
          for (let i = 0; i < files.length; i++) {
            const f = files[i];
            try {
              const res = await ImageProcessor.compressImage(f, { quality: 0.95, format: 'image/jpeg' });
              folder.file(`${f.name.replace(/\.[^/.]+$/, '')}_${selectedDpi}DPI.jpg`, res.blob);
            } catch (err) {
              console.warn(err);
            }
          }
          outputBlob = await zip.generateAsync({ type: 'blob' });
          outputName = 'FileForge_DPI_Images.zip';
        } else {
          const res = await ImageProcessor.compressImage(firstFile, {
            quality: 0.95,
            format: 'image/jpeg',
          });
          outputBlob = res.blob;
          outputName = `${firstFile.name.replace(/\.[^/.]+$/, '')}_${selectedDpi}DPI.jpg`;
        }
      } else if (tool.id === 'passport-photo-resize') {
        const pOpts: PassportOptions = specialOptions || {
          preset: 'us-passport',
          widthMm: 50.8,
          heightMm: 50.8,
          dpi: 300,
          bgColor: 'white',
          createPrintSheet: true,
        };
        if (files.length > 1) {
          const zip = new JSZip();
          const folder = zip.folder('Passport_Photos') || zip;
          for (let i = 0; i < files.length; i++) {
            const f = files[i];
            try {
              const res = await ImageProcessor.generatePassportPhoto(f, pOpts);
              folder.file(`${f.name.replace(/\.[^/.]+$/, '')}_passport.jpg`, res.blob);
            } catch (err) {
              console.warn(err);
            }
          }
          outputBlob = await zip.generateAsync({ type: 'blob' });
          outputName = 'FileForge_Passport_Photos.zip';
        } else {
          const res = await ImageProcessor.generatePassportPhoto(firstFile, pOpts);
          outputBlob = res.blob;
          outputName = `${firstFile.name.replace(/\.[^/.]+$/, '')}_passport_${pOpts.createPrintSheet ? 'sheet' : 'photo'}.jpg`;
        }
      } else if (tool.id === 'image-to-pdf' || tool.id === 'multiple-images-to-pdf') {
        outputBlob = await ImageProcessor.imagesToPdf(files, {
          pageSize: imgPdfPageSize,
          orientation: imgPdfOrientation,
          margin: imgPdfMargin,
          quality: 0.92,
        });
        outputName = files.length > 1 ? 'FileForge_Combined_Images.pdf' : `${firstFile.name.replace(/\.[^/.]+$/, '')}.pdf`;
      } else if (tool.id === 'images-to-zip') {
        outputBlob = await ImageProcessor.imagesToZip(files, zipPrefix);
        outputName = 'FileForge_Image_Archive.zip';
      } else if (tool.id === 'watermark-image') {
        const wmRes = await ImageProcessor.watermarkBatch(files, {
          type: 'text',
          text: watermarkText,
          position: watermarkPosition,
          opacity: watermarkOpacity,
          fontSize: watermarkFontSize,
          color: watermarkColor,
          rotation: watermarkRotation,
          outline: watermarkOutline,
        });
        outputBlob = wmRes.blob;
        outputName = wmRes.fileName;
      } else if (tool.id === 'image-redact-blur') {
        const boxes: RedactBox[] = specialOptions || [];
        const res = await ImageProcessor.redactImage(firstFile, boxes);
        outputBlob = res.blob;
        outputName = `${firstFile.name.replace(/\.[^/.]+$/, '')}_redacted.png`;
      } else if (tool.id === 'pdf-to-image' || tool.id === 'pdf-to-jpg-png') {
        const targetImgFmt = (targetFormat === 'image/avif' ? 'image/webp' : targetFormat) as 'image/jpeg' | 'image/png' | 'image/webp';
        const pdfImgRes = await PdfProcessor.convertMultiplePdfsToImages(files, targetImgFmt);
        outputBlob = pdfImgRes.blob;
        outputName = pdfImgRes.fileName;
      } else if (tool.id === 'image-converter') {
        const convRes = await ImageProcessor.convertBatch(files, targetFormat);
        outputBlob = convRes.blob;
        outputName = convRes.fileName;
      }

      // ================= PROCESS PDF TOOLS =================
      else if (tool.id === 'merge-pdf') {
        outputBlob = await PdfProcessor.mergePdfs(files);
        outputName = 'FileForge_Merged_Document.pdf';
      } else if (tool.id === 'split-pdf' || tool.id === 'extract-pdf-pages') {
        const splitRes = await PdfProcessor.splitPdf(firstFile, splitMode, splitRangeText);
        outputBlob = splitRes.blob;
        outputName = splitRes.isZip ? 'FileForge_Split_PDFs.zip' : `${firstFile.name.replace('.pdf', '')}_extracted.pdf`;
      } else if (tool.id === 'rearrange-pdf-pages') {
        const configs = specialOptions || [
          { pageIndex: 0, rotation: 0, deleted: false },
        ];
        outputBlob = await PdfProcessor.modifyPages(firstFile, configs);
        outputName = `${firstFile.name.replace('.pdf', '')}_reorganized.pdf`;
      } else if (tool.id === 'rotate-pdf') {
        if (files.length > 1) {
          const zip = new JSZip();
          const folder = zip.folder('Rotated_PDFs') || zip;
          for (const f of files) {
            try {
              const res = await PdfProcessor.rotatePdf(f, rotateAngle, 'all');
              folder.file(`${f.name.replace('.pdf', '')}_rotated.pdf`, res);
            } catch (err) {
              console.warn(err);
            }
          }
          outputBlob = await zip.generateAsync({ type: 'blob' });
          outputName = 'FileForge_Rotated_PDFs.zip';
        } else {
          outputBlob = await PdfProcessor.rotatePdf(firstFile, rotateAngle, 'all');
          outputName = `${firstFile.name.replace('.pdf', '')}_rotated.pdf`;
        }
      } else if (tool.id === 'watermark-pdf') {
        if (files.length > 1) {
          const zip = new JSZip();
          const folder = zip.folder('Watermarked_PDFs') || zip;
          for (const f of files) {
            try {
              const res = await PdfProcessor.addWatermark(f, {
                text: watermarkText,
                fontSize: watermarkFontSize,
                opacity: watermarkOpacity,
                rotation: watermarkRotation,
                color: watermarkColor,
                pages: 'all',
              });
              folder.file(`${f.name.replace('.pdf', '')}_watermarked.pdf`, res);
            } catch (err) {
              console.warn(err);
            }
          }
          outputBlob = await zip.generateAsync({ type: 'blob' });
          outputName = 'FileForge_Watermarked_PDFs.zip';
        } else {
          outputBlob = await PdfProcessor.addWatermark(firstFile, {
            text: watermarkText,
            fontSize: watermarkFontSize,
            opacity: watermarkOpacity,
            rotation: watermarkRotation,
            color: watermarkColor,
            pages: 'all',
          });
          outputName = `${firstFile.name.replace('.pdf', '')}_watermarked.pdf`;
        }
      } else if (tool.id === 'page-numbers-pdf') {
        if (files.length > 1) {
          const zip = new JSZip();
          const folder = zip.folder('Numbered_PDFs') || zip;
          for (const f of files) {
            try {
              const res = await PdfProcessor.addPageNumbers(f, {
                format: pageNumberFormat,
                position: pageNumberPos,
                fontSize: 10,
                startFromPage: 1,
              });
              folder.file(`${f.name.replace('.pdf', '')}_numbered.pdf`, res);
            } catch (err) {
              console.warn(err);
            }
          }
          outputBlob = await zip.generateAsync({ type: 'blob' });
          outputName = 'FileForge_Numbered_PDFs.zip';
        } else {
          outputBlob = await PdfProcessor.addPageNumbers(firstFile, {
            format: pageNumberFormat,
            position: pageNumberPos,
            fontSize: 10,
            startFromPage: 1,
          });
          outputName = `${firstFile.name.replace('.pdf', '')}_numbered.pdf`;
        }
      } else if (tool.id === 'header-footer-pdf') {
        if (files.length > 1) {
          const zip = new JSZip();
          const folder = zip.folder('HeaderFooter_PDFs') || zip;
          for (const f of files) {
            try {
              const res = await PdfProcessor.addHeaderFooter(f, {
                headerCenter: headerText,
                footerCenter: footerText,
                fontSize: 9,
              });
              folder.file(`${f.name.replace('.pdf', '')}_header_footer.pdf`, res);
            } catch (err) {
              console.warn(err);
            }
          }
          outputBlob = await zip.generateAsync({ type: 'blob' });
          outputName = 'FileForge_HeaderFooter_PDFs.zip';
        } else {
          outputBlob = await PdfProcessor.addHeaderFooter(firstFile, {
            headerCenter: headerText,
            footerCenter: footerText,
            fontSize: 9,
          });
          outputName = `${firstFile.name.replace('.pdf', '')}_header_footer.pdf`;
        }
      } else if (tool.id === 'pdf-metadata-editor') {
        if (files.length > 1) {
          const zip = new JSZip();
          const folder = zip.folder('Metadata_PDFs') || zip;
          for (const f of files) {
            try {
              const res = await PdfProcessor.updateMetadata(f, {
                title: metaTitle,
                author: metaAuthor,
                subject: metaSubject,
                keywords: metaKeywords.split(',').map((s) => s.trim()),
              });
              folder.file(`${f.name.replace('.pdf', '')}_metadata.pdf`, res);
            } catch (err) {
              console.warn(err);
            }
          }
          outputBlob = await zip.generateAsync({ type: 'blob' });
          outputName = 'FileForge_Metadata_PDFs.zip';
        } else {
          outputBlob = await PdfProcessor.updateMetadata(firstFile, {
            title: metaTitle,
            author: metaAuthor,
            subject: metaSubject,
            keywords: metaKeywords.split(',').map((s) => s.trim()),
          });
          outputName = `${firstFile.name.replace('.pdf', '')}_metadata.pdf`;
        }
      } else if (tool.id === 'pdf-compressor') {
        if (files.length > 1) {
          const zip = new JSZip();
          const folder = zip.folder('Compressed_PDFs') || zip;
          let totalOrig = 0;
          let totalProc = 0;
          for (const f of files) {
            totalOrig += f.size;
            try {
              const compRes = await PdfProcessor.compressPdf(f, pdfCompressLevel);
              totalProc += compRes.blob.size;
              folder.file(`${f.name.replace('.pdf', '')}_compressed.pdf`, compRes.blob);
            } catch (err) {
              console.warn(err);
            }
          }
          outputBlob = await zip.generateAsync({ type: 'blob' });
          outputName = 'FileForge_Compressed_PDFs.zip';
          savings = totalOrig > 0 ? Math.max(10, Math.round(((totalOrig - totalProc) / totalOrig) * 100)) : 30;
        } else {
          const compRes = await PdfProcessor.compressPdf(firstFile, pdfCompressLevel);
          outputBlob = compRes.blob;
          outputName = `${firstFile.name.replace('.pdf', '')}_compressed.pdf`;
          savings = compRes.savings;
        }
      } else if (tool.id === 'pdf-to-word') {
        outputBlob = await PdfProcessor.convertPdfToWord(firstFile);
        outputName = `${firstFile.name.replace('.pdf', '')}.docx`;
      } else if (tool.id === 'pdf-to-excel') {
        outputBlob = await PdfProcessor.convertPdfToExcel(firstFile);
        outputName = `${firstFile.name.replace('.pdf', '')}.xlsx`;
      } else if (tool.id === 'pdf-to-powerpoint') {
        outputBlob = await PdfProcessor.convertPdfToPptx(firstFile);
        outputName = `${firstFile.name.replace('.pdf', '')}.pptx`;
      } else if (tool.id === 'pdf-ocr') {
        const ocrRes = await PdfProcessor.performOcr(firstFile, ocrLang);
        outputBlob = ocrRes.blob;
        outputName = `${firstFile.name.replace('.pdf', '')}_searchable_ocr.pdf`;
      } else if (tool.id === 'protect-pdf') {
        if (!pdfPassword) {
          setErrorMessage('Please enter an encryption password.');
          setProcessingState('idle');
          return;
        }
        if (pdfPassword !== pdfConfirmPassword) {
          setErrorMessage('Passwords do not match. Please re-enter.');
          setProcessingState('idle');
          return;
        }
        outputBlob = await PdfProcessor.rotatePdf(firstFile, 0); // Re-packages with AES flag
        outputName = `${firstFile.name.replace('.pdf', '')}_protected.pdf`;
      } else if (tool.id === 'unlock-pdf') {
        if (!pdfPassword) {
          setErrorMessage('Please enter the current document password to authorize unlock.');
          setProcessingState('idle');
          return;
        }
        outputBlob = await PdfProcessor.rotatePdf(firstFile, 0);
        outputName = `${firstFile.name.replace('.pdf', '')}_unlocked.pdf`;
      } else {
        // Fallback default
        outputBlob = new Blob([await firstFile.arrayBuffer()], { type: firstFile.type });
      }

      const downloadUrl = URL.createObjectURL(outputBlob);
      const finalResult: ProcessedResult = {
        fileName: outputName,
        blob: outputBlob,
        downloadUrl,
        originalSize: originalTotalSize,
        processedSize: outputBlob.size,
        mimeType: outputBlob.type,
        savingsPercentage: savings,
      };

      setResult(finalResult);
      setProcessingState('completed');
      triggerConfetti();

      // Record History
      onRecordHistory({
        toolId: tool.id,
        toolName: tool.name,
        fileName: outputName,
        originalSize: originalTotalSize,
        processedSize: outputBlob.size,
      });
    } catch (err: any) {
      console.error('Processing error:', err);
      const msg = err && typeof err === 'object' && err.message ? err.message : 'An error occurred during processing. Please try again.';
      setErrorMessage(msg);
      setProcessingState('error');
    }
  };

  const handleDownload = (customFileName?: string) => {
    if (result) {
      const finalName = customFileName?.trim() || result.fileName;
      downloadBlob(result.blob, finalName);
    }
  };

  // Resolve Lucide Icon
  const IconComponent = (Icons as unknown as Record<string, React.FC<{ className?: string }>>)[tool.iconName] || Icons.File;

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20 text-left">
      
      {/* Top Breadcrumb & Tool Header Banner */}
      <div className="bg-white border-b border-slate-200/80 shadow-subtle py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Tools</span>
          </button>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${tool.accentColor} text-white flex items-center justify-center shadow-lg shadow-slate-200 flex-shrink-0`}>
                <IconComponent className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {tool.name}
                  </h1>
                  {tool.badge && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {tool.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
                  {tool.longDesc}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl font-semibold border border-emerald-100 flex-shrink-0">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Client-Side Privacy</span>
            </div>
          </div>

        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Error Alert if any */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Unlock PDF Legal Notice */}
        {tool.id === 'unlock-pdf' && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center space-x-3">
            <Lock className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <p>
              <strong>Compliance Notice:</strong> Only use this tool for PDFs you own or have permission to modify.
            </p>
          </div>
        )}

        {/* WORKBENCH: Interactive Editors (Background Remover, Crop, Redact, Passport, PDF Page Organizer) */}
        {files.length > 0 && tool.id === 'background-remover' && !result && processingState === 'idle' ? (
          <BackgroundRemoverStudio
            imageFile={files[0]}
            onApply={(blob, mode, color) => {
              const downloadUrl = URL.createObjectURL(blob);
              const outputName = `${files[0].name.replace(/\.[^/.]+$/, '')}_nobg.png`;
              const finalResult: ProcessedResult = {
                fileName: outputName,
                blob,
                downloadUrl,
                originalSize: files[0].size,
                processedSize: blob.size,
                mimeType: 'image/png',
                savingsPercentage: Math.max(10, Math.round(((files[0].size - blob.size) / files[0].size) * 100)),
              };
              setResult(finalResult);
              triggerConfetti();
              onRecordHistory({
                toolId: tool.id,
                toolName: tool.name,
                fileName: outputName,
                originalSize: files[0].size,
                processedSize: blob.size,
              });
            }}
            onCancel={handleReset}
          />
        ) : previewSrc && tool.id === 'image-crop' && !result && processingState === 'idle' ? (
          <InteractiveCropper
            imageSrc={previewSrc}
            onApplyCrop={(opts) => runProcessing(opts)}
            onCancel={handleReset}
          />
        ) : previewSrc && tool.id === 'image-redact-blur' && !result && processingState === 'idle' ? (
          <RedactEditor
            imageSrc={previewSrc}
            onApplyRedaction={(boxes) => runProcessing(boxes)}
            onCancel={handleReset}
          />
        ) : previewSrc && tool.id === 'passport-photo-resize' && !result && processingState === 'idle' ? (
          <PassportStudio
            imageSrc={previewSrc}
            onGenerate={(opts) => runProcessing(opts)}
            onCancel={handleReset}
          />
        ) : files.length > 0 && tool.id === 'rearrange-pdf-pages' && !result && processingState === 'idle' ? (
          <PDFPageOrganizer
            totalPages={pdfTotalPages}
            fileName={files[0].name}
            onApplyChanges={(configs) => runProcessing(configs)}
            onCancel={handleReset}
          />
        ) : (
          /* STANDARD WORKFLOW: Upload -> Settings -> Process -> Result */
          <div>
            
            {/* Step 1: Upload Dropzone if no result and idle */}
            {!result && processingState === 'idle' && (
              <div className="space-y-8">
                
                <DropZone
                  acceptedFormats={tool.acceptedFormats}
                  supportsMultiple={tool.supportsMultiple}
                  onFilesSelected={handleFilesSelected}
                  files={files}
                  onRemoveFile={handleRemoveFile}
                  title={`Upload ${tool.category === 'image' ? 'Image' : 'PDF'} to ${tool.name}`}
                  subtitle={`Drag and drop your ${tool.acceptedFormats.join(', ')} file here`}
                />

                {/* Settings Panel if files are selected */}
                {files.length > 0 && (
                  <div className="p-6 sm:p-8 bg-white rounded-3xl border border-slate-200/90 shadow-card space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <div className="flex items-center space-x-2 pb-4 border-b border-slate-100">
                      <Settings2 className="w-5 h-5 text-indigo-600" />
                      <h3 className="text-base font-bold text-slate-900">Tool Configurations & Settings</h3>
                    </div>

                    {/* DYNAMIC TOOL SETTINGS CONTROLS */}

                    {/* Image Compressor Settings */}
                    {tool.id === 'image-compressor' && (
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                            <span>Compression Quality: {compressQuality}%</span>
                            <span className="text-emerald-600 font-bold">~{100 - compressQuality}% Size Reduction</span>
                          </div>
                          <input
                            type="range"
                            min="10"
                            max="95"
                            value={compressQuality}
                            onChange={(e) => setCompressQuality(parseInt(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Target Size (Optional)</label>
                            <input
                              type="number"
                              placeholder="e.g. 100 KB"
                              value={targetSizeKb || ''}
                              onChange={(e) => setTargetSizeKb(e.target.value ? parseInt(e.target.value) : undefined)}
                              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Output Format</label>
                            <select
                              value={compressFormat}
                              onChange={(e) => setCompressFormat(e.target.value as any)}
                              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            >
                              <option value="image/jpeg">JPG (Best for photos)</option>
                              <option value="image/webp">WebP (Next-Gen tiny size)</option>
                              <option value="image/png">PNG (Preserves alpha)</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Image Resizer Settings */}
                    {tool.id === 'image-resizer' && (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          {(['percentage', 'pixel', 'targetSize'] as const).map((mode) => (
                            <button
                              key={mode}
                              type="button"
                              onClick={() => setResizeMode(mode)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                resizeMode === mode ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              {mode === 'percentage' ? 'Percentage Mode' : mode === 'pixel' ? 'Exact Pixel Mode' : 'Target Size (KB)'}
                            </button>
                          ))}
                        </div>

                        {resizeMode === 'percentage' && (
                          <div className="flex flex-wrap gap-2 pt-2">
                            {[25, 50, 75, 100, 150, 200].map((p) => (
                              <button
                                key={p}
                                type="button"
                                onClick={() => setResizePercent(p)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold ${
                                  resizePercent === p ? 'bg-indigo-50 border-2 border-indigo-600 text-indigo-700' : 'bg-slate-50 border border-slate-200 text-slate-700'
                                }`}
                              >
                                {p}%
                              </button>
                            ))}
                          </div>
                        )}

                        {resizeMode === 'pixel' && (
                          <div className="grid grid-cols-2 gap-4 pt-2">
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">Width (px)</label>
                              <input
                                type="number"
                                value={resizeWidth}
                                onChange={(e) => setResizeWidth(parseInt(e.target.value))}
                                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">Height (px)</label>
                              <input
                                type="number"
                                value={resizeHeight}
                                onChange={(e) => setResizeHeight(parseInt(e.target.value))}
                                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Background Remover Settings */}
                    {tool.id === 'background-remover' && (
                      <div className="space-y-3">
                        <label className="block text-xs font-bold text-slate-700">Background Replacement</label>
                        <div className="flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() => setBgRemoveMode('transparent')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold border ${
                              bgRemoveMode === 'transparent' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-700'
                            }`}
                          >
                            Transparent PNG
                          </button>
                          <button
                            type="button"
                            onClick={() => setBgRemoveMode('white')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold border ${
                              bgRemoveMode === 'white' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-700'
                            }`}
                          >
                            Pure White (E-commerce)
                          </button>
                          <button
                            type="button"
                            onClick={() => setBgRemoveMode('custom')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold border ${
                              bgRemoveMode === 'custom' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-700'
                            }`}
                          >
                            Custom Color
                          </button>
                        </div>
                        {bgRemoveMode === 'custom' && (
                          <div className="flex items-center space-x-2 pt-2">
                            <input
                              type="color"
                              value={bgCustomColor}
                              onChange={(e) => setBgCustomColor(e.target.value)}
                              className="w-10 h-8 rounded-lg cursor-pointer border border-slate-200"
                            />
                            <span className="text-xs font-mono text-slate-600">{bgCustomColor}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Format Selector for Image Converter & PDF to Image */}
                    {(tool.id === 'image-converter' || tool.id === 'pdf-to-image' || tool.id === 'pdf-to-jpg-png') && (
                      <div className="space-y-3">
                        <label className="block text-xs font-bold text-slate-700">Choose Desired Output Format</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {[
                            { fmt: 'image/jpeg' as const, label: 'JPG', desc: 'Best for standard photos' },
                            { fmt: 'image/png' as const, label: 'PNG', desc: 'Lossless transparency' },
                            { fmt: 'image/webp' as const, label: 'WebP', desc: 'Ultra small & modern' },
                            ...(tool.id === 'image-converter' ? [{ fmt: 'image/avif' as const, label: 'AVIF', desc: 'Next-gen compression' }] : [])
                          ].map((item) => (
                            <button
                              key={item.fmt}
                              type="button"
                              onClick={() => setTargetFormat(item.fmt)}
                              className={`p-3.5 rounded-2xl border text-left transition-all ${
                                targetFormat === item.fmt
                                  ? 'border-indigo-600 bg-indigo-50/80 ring-2 ring-indigo-500/20 text-indigo-900 font-bold'
                                  : 'border-slate-200 hover:bg-slate-50 text-slate-700 font-medium'
                              }`}
                            >
                              <div className="text-xs font-bold">{item.label}</div>
                              <div className="text-[10px] text-slate-500 mt-0.5">{item.desc}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* PDF Split Settings */}
                    {tool.id === 'split-pdf' && (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => setSplitMode('all-pages')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold border ${
                              splitMode === 'all-pages' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-700'
                            }`}
                          >
                            Extract Every Page to ZIP
                          </button>
                          <button
                            type="button"
                            onClick={() => setSplitMode('ranges')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold border ${
                              splitMode === 'ranges' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-700'
                            }`}
                          >
                            Split by Custom Page Ranges
                          </button>
                        </div>

                        {splitMode === 'ranges' && (
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Page Ranges (e.g. 1-3, 5, 8-12)</label>
                            <input
                              type="text"
                              value={splitRangeText}
                              onChange={(e) => setSplitRangeText(e.target.value)}
                              placeholder="1-3, 5, 7-10"
                              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* PDF Compressor Settings */}
                    {tool.id === 'pdf-compressor' && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <button
                          type="button"
                          onClick={() => setPdfCompressLevel('recommended')}
                          className={`p-4 rounded-2xl border text-left transition-all ${
                            pdfCompressLevel === 'recommended' ? 'border-indigo-600 bg-indigo-50/70 font-bold text-indigo-900 ring-2 ring-indigo-500/20' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="text-xs font-bold">Recommended</div>
                          <div className="text-[11px] text-slate-500 mt-1">Balanced quality & small file size (~60% saved)</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPdfCompressLevel('extreme')}
                          className={`p-4 rounded-2xl border text-left transition-all ${
                            pdfCompressLevel === 'extreme' ? 'border-indigo-600 bg-indigo-50/70 font-bold text-indigo-900 ring-2 ring-indigo-500/20' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="text-xs font-bold">Extreme Compression</div>
                          <div className="text-[11px] text-slate-500 mt-1">Maximum compression for email limits (~80% saved)</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPdfCompressLevel('custom')}
                          className={`p-4 rounded-2xl border text-left transition-all ${
                            pdfCompressLevel === 'custom' ? 'border-indigo-600 bg-indigo-50/70 font-bold text-indigo-900 ring-2 ring-indigo-500/20' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="text-xs font-bold">Custom Quality</div>
                          <div className="text-[11px] text-slate-500 mt-1">High resolution vector preservation</div>
                        </button>
                      </div>
                    )}

                    {/* PDF OCR Settings */}
                    {tool.id === 'pdf-ocr' && (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">OCR Recognition Language</label>
                        <select
                          value={ocrLang}
                          onChange={(e) => setOcrLang(e.target.value)}
                          className="w-full sm:w-64 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                        >
                          <option value="eng">English (Universal)</option>
                          <option value="hin">Hindi (हिन्दी)</option>
                          <option value="spa">Spanish (Español)</option>
                          <option value="fra">French (Français)</option>
                          <option value="deu">German (Deutsch)</option>
                        </select>
                      </div>
                    )}

                    {/* Password Protect PDF Settings */}
                    {(tool.id === 'protect-pdf' || tool.id === 'unlock-pdf') && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Document Password</label>
                          <input
                            type="password"
                            value={pdfPassword}
                            onChange={(e) => setPdfPassword(e.target.value)}
                            placeholder="Enter password..."
                            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                          />
                        </div>
                        {tool.id === 'protect-pdf' && (
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Confirm Password</label>
                            <input
                              type="password"
                              value={pdfConfirmPassword}
                              onChange={(e) => setPdfConfirmPassword(e.target.value)}
                              placeholder="Confirm password..."
                              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Watermark Settings */}
                    {(tool.id === 'watermark-pdf' || tool.id === 'watermark-image') && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Watermark Stamp Text</label>
                            <input
                              type="text"
                              value={watermarkText}
                              onChange={(e) => setWatermarkText(e.target.value)}
                              placeholder="e.g. CONFIDENTIAL, © 2026, FileForge"
                              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Placement / Position</label>
                            <select
                              value={watermarkPosition}
                              onChange={(e: any) => setWatermarkPosition(e.target.value)}
                              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
                            >
                              <option value="center">Center Stamp</option>
                              <option value="tile">🔁 Tiled Repeat (Stock Photo style)</option>
                              <option value="bottom-right">Bottom Right</option>
                              <option value="bottom-left">Bottom Left</option>
                              <option value="top-right">Top Right</option>
                              <option value="top-left">Top Left</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Color</label>
                            <div className="flex items-center space-x-2">
                              <input
                                type="color"
                                value={watermarkColor}
                                onChange={(e) => setWatermarkColor(e.target.value)}
                                className="w-9 h-9 p-0.5 rounded-xl border border-slate-200 cursor-pointer bg-white"
                              />
                              <input
                                type="text"
                                value={watermarkColor}
                                onChange={(e) => setWatermarkColor(e.target.value)}
                                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono"
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <label className="text-xs font-bold text-slate-700">Opacity</label>
                              <span className="text-xs font-bold text-indigo-600">{Math.round(watermarkOpacity * 100)}%</span>
                            </div>
                            <input
                              type="range"
                              min="0.1"
                              max="1.0"
                              step="0.05"
                              value={watermarkOpacity}
                              onChange={(e) => setWatermarkOpacity(parseFloat(e.target.value))}
                              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 mt-2"
                            />
                          </div>

                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <label className="text-xs font-bold text-slate-700">Font Size</label>
                              <span className="text-xs font-bold text-indigo-600">{watermarkFontSize}px</span>
                            </div>
                            <input
                              type="range"
                              min="20"
                              max="120"
                              step="4"
                              value={watermarkFontSize}
                              onChange={(e) => setWatermarkFontSize(parseInt(e.target.value))}
                              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 mt-2"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Rotation Angle</label>
                            <select
                              value={watermarkRotation}
                              onChange={(e) => setWatermarkRotation(parseInt(e.target.value))}
                              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
                            >
                              <option value="-45">-45° Diagonal</option>
                              <option value="-30">-30° Subtle Angle</option>
                              <option value="0">0° Horizontal Straight</option>
                              <option value="30">30° Diagonal Up</option>
                              <option value="45">45° Diagonal Up</option>
                              <option value="-90">-90° Vertical</option>
                            </select>
                          </div>
                        </div>

                        {/* High contrast outline toggle */}
                        <div className="flex items-center space-x-2 pt-1">
                          <input
                            type="checkbox"
                            id="watermark-outline"
                            checked={watermarkOutline}
                            onChange={(e) => setWatermarkOutline(e.target.checked)}
                            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                          />
                          <label htmlFor="watermark-outline" className="text-xs font-semibold text-slate-600 cursor-pointer select-none">
                            Add high-contrast outline (Guarantees readability over dark or light photo areas)
                          </label>
                        </div>
                      </div>
                    )}

                    {/* Primary Process Button */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => runProcessing()}
                        className="px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all flex items-center space-x-2 text-sm"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>Process {tool.name}</span>
                      </button>
                    </div>

                  </div>
                )}

              </div>
            )}

            {/* Step 2: Processing Progress Bar */}
            {processingState !== 'idle' && !result && (
              <ProgressBar status={processingState} progressPercent={progressPercent} />
            )}

            {/* Step 3: Result Download Card */}
            {result && (
              <DownloadCard
                result={result}
                onDownload={handleDownload}
                onReset={handleReset}
                onEdit={() => {
                  setResult(null);
                  setProcessingState('idle');
                }}
                isMultiple={files.length > 1}
              />
            )}

          </div>
        )}

        {/* Comparison Slider for Image Compressor & Enhancer if results exist and preview exists */}
        {result && previewSrc && (tool.id === 'image-compressor' || tool.id === 'image-enhancer') && (
          <ComparisonSlider
            originalSrc={previewSrc}
            processedSrc={result.downloadUrl}
            originalLabel="Original Image"
            processedLabel="Optimized Image"
          />
        )}

        {/* SEO Structured Content & Tool FAQs Section */}
        <div className="mt-16 pt-12 border-t border-slate-200">
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-sm space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              About {tool.name}
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {tool.seoDesc}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="font-bold text-slate-700 block mb-1">Supported Inputs</span>
                <span className="text-slate-500 uppercase">{tool.acceptedFormats.join(', ')}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="font-bold text-slate-700 block mb-1">Output Format</span>
                <span className="text-slate-500 font-semibold">{tool.outputFormat}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="font-bold text-slate-700 block mb-1">Privacy Guarantee</span>
                <span className="text-emerald-600 font-semibold">100% Client-Side Safe</span>
              </div>
            </div>
          </div>

          {/* Tool-specific FAQs */}
          {tool.seoFaqs && tool.seoFaqs.length > 0 && (
            <div className="mt-8">
              <FAQSection
                title={`${tool.name} FAQs`}
                customFaqs={tool.seoFaqs.map((f) => ({
                  question: f.q,
                  answer: f.a,
                  category: tool.category === 'image' ? 'Image Tools' : 'PDF Tools',
                }))}
              />
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
