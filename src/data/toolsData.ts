import { ToolItem } from '../types';

export const TOOLS_DATA: ToolItem[] = [
  // ==================== IMAGE TOOLS (15) ====================
  {
    id: 'image-to-pdf',
    name: 'Image → PDF',
    slug: 'image-to-pdf',
    category: 'image',
    type: 'convert',
    shortDesc: 'Convert JPG, PNG, WebP and other image formats into high-quality PDF documents.',
    longDesc: 'Transform single or multiple images into a professional, printable PDF document with custom page sizes, margins, orientation, and quality control.',
    iconName: 'FileImage',
    accentColor: 'from-blue-500 to-indigo-600',
    badge: 'Popular',
    acceptedFormats: ['.jpg', '.jpeg', '.png', '.webp', '.bmp', '.gif'],
    outputFormat: 'PDF',
    supportsMultiple: true,
    popular: true,
    seoTitle: 'Convert Image to PDF Online - Free & Fast | FileForge',
    seoDesc: 'Convert JPG, PNG, and WebP images to PDF in seconds. Adjust page orientation, margins, and size without losing quality.',
    seoFaqs: [
      { q: 'Can I convert multiple images into one PDF?', a: 'Yes! Upload multiple images, arrange them in your preferred sequence, and generate a single merged PDF.' },
      { q: 'Will my image resolution be preserved?', a: 'Yes, FileForge keeps original high-resolution DPI settings with clean vector page bounding.' }
    ]
  },
  {
    id: 'pdf-to-image',
    name: 'PDF → JPG / PNG / WebP',
    slug: 'pdf-to-image',
    category: 'image',
    type: 'convert',
    shortDesc: 'Extract pages from your PDF documents and save them as ultra-sharp image files.',
    longDesc: 'Convert each page of a PDF into crisp JPG, PNG, or WebP images with high DPI rendering, selectable color depth, and instant ZIP download.',
    iconName: 'ImageDown',
    accentColor: 'from-amber-500 to-orange-600',
    badge: 'Fast',
    acceptedFormats: ['.pdf'],
    outputFormat: 'JPG/PNG/WebP',
    supportsMultiple: false,
    popular: true,
    seoTitle: 'Convert PDF to JPG, PNG, or WebP Images | FileForge',
    seoDesc: 'Extract and render PDF pages into high-resolution JPG or PNG pictures directly in your browser with zero upload lag.',
    seoFaqs: [
      { q: 'Can I extract all pages into a ZIP?', a: 'Yes, all rendered pages are automatically bundled into an organized ZIP archive.' },
      { q: 'What resolution are the images exported in?', a: 'You can choose between Standard (150 DPI), High (300 DPI), and Ultra (600 DPI).' }
    ]
  },
  {
    id: 'image-converter',
    name: 'JPG ↔ PNG ↔ WebP ↔ AVIF',
    slug: 'image-converter',
    category: 'image',
    type: 'convert',
    shortDesc: 'Instantly convert between any image format: JPG, PNG, WebP, AVIF, BMP, and GIF.',
    longDesc: 'Cross-convert photos and graphics across modern formats like next-gen WebP, high-efficiency AVIF, lossy JPG, and transparent PNG.',
    iconName: 'RefreshCw',
    accentColor: 'from-indigo-500 to-purple-600',
    badge: 'Universal',
    acceptedFormats: ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.bmp', '.gif'],
    outputFormat: 'Configurable',
    supportsMultiple: true,
    popular: true,
    seoTitle: 'Image Format Converter - JPG, PNG, WebP, AVIF | FileForge',
    seoDesc: 'Convert images to modern formats with custom quality presets. Fast, client-side, and free batch conversion.',
    seoFaqs: [
      { q: 'Does converting to WebP or AVIF save file size?', a: 'Yes! WebP and AVIF compress up to 30-50% smaller than standard JPG/PNG with equal visual fidelity.' },
      { q: 'Is transparent background preserved when converting to PNG or WebP?', a: 'Yes, alpha transparency channels are completely preserved.' }
    ]
  },
  {
    id: 'image-compressor',
    name: 'Image Compressor',
    slug: 'image-compressor',
    category: 'image',
    type: 'compress',
    shortDesc: 'Drastically reduce image file sizes while preserving stunning visual clarity.',
    longDesc: 'Intelligently compress JPG, PNG, and WebP images. Customize quality percentage, choose target file size (e.g. under 100 KB), and strip unwanted metadata.',
    iconName: 'Minimize2',
    accentColor: 'from-emerald-500 to-teal-600',
    badge: 'Popular',
    acceptedFormats: ['.jpg', '.jpeg', '.png', '.webp', '.avif'],
    outputFormat: 'Optimized Image',
    supportsMultiple: true,
    popular: true,
    seoTitle: 'Compress Image Size Online - Shrink JPG, PNG, WebP | FileForge',
    seoDesc: 'Reduce image file size without losing quality. Set target file size in KB or tweak quality sliders with before/after visual comparison.',
    seoFaqs: [
      { q: 'How much file size can I save?', a: 'You can typically save 40% to 85% of the file size with zero visible degradation.' },
      { q: 'Can I set an exact target file size?', a: 'Yes, switch to "Target Size" mode and enter your desired limit (e.g. 100 KB).' }
    ]
  },
  {
    id: 'image-resizer',
    name: 'Image Resizer',
    slug: 'image-resizer',
    category: 'image',
    type: 'edit',
    shortDesc: 'Resize images by exact pixel dimensions, scaling percentage, or target file size.',
    longDesc: 'Precise dimensional scaling for social media, print, or web assets. Maintain aspect ratio, upscale/downscale, and export in your chosen format.',
    iconName: 'Maximize2',
    accentColor: 'from-sky-500 to-blue-600',
    acceptedFormats: ['.jpg', '.jpeg', '.png', '.webp', '.bmp'],
    outputFormat: 'Resized Image',
    supportsMultiple: true,
    seoTitle: 'Resize Image Dimensions Online - Pixel & Percentage | FileForge',
    seoDesc: 'Quickly change image width and height in pixels or percentages. Lock aspect ratio or scale to target file size in KB.',
    seoFaqs: [
      { q: 'Can I resize by percentage?', a: 'Yes, presets for 25%, 50%, 75%, 150%, and 200% are available with one click.' },
      { q: 'How do I keep my image from distorting?', a: 'Keep the "Maintain Aspect Ratio" checkbox checked.' }
    ]
  },
  {
    id: 'image-crop',
    name: 'Image Crop',
    slug: 'image-crop',
    category: 'image',
    type: 'edit',
    shortDesc: 'Interactive canvas cropper with aspect ratio presets (1:1, 4:3, 16:9, Passport).',
    longDesc: 'Crop, frame, zoom, and align photos with freehand dragging or strict aspect ratios for Instagram, YouTube thumbnails, passports, and banner headers.',
    iconName: 'Crop',
    accentColor: 'from-rose-500 to-red-600',
    acceptedFormats: ['.jpg', '.jpeg', '.png', '.webp', '.bmp'],
    outputFormat: 'Cropped Image',
    supportsMultiple: false,
    popular: true,
    seoTitle: 'Crop Images Online - Free Aspect Ratio Cropping Tool | FileForge',
    seoDesc: 'Easy-to-use image cropping with live preview, zoom, rotation, and presets for 1:1 square, 16:9 widescreen, and 4:3.',
    seoFaqs: [
      { q: 'Can I rotate or zoom while cropping?', a: 'Yes, interactive zoom and angle sliders allow granular framing.' },
      { q: 'Is there a preset for social media banners?', a: 'Yes, we provide 1:1, 4:3, 16:9, and custom dimension cropping.' }
    ]
  },
  {
    id: 'image-rotate-flip',
    name: 'Image Rotate / Flip',
    slug: 'image-rotate-flip',
    category: 'image',
    type: 'edit',
    shortDesc: 'Rotate photos 90°, 180°, 270° or mirror-flip horizontally and vertically.',
    longDesc: 'Fix orientation on phone photos and scans with rapid 90-degree rotations, mirror flips, and orientation corrections.',
    iconName: 'RotateCw',
    accentColor: 'from-cyan-500 to-blue-600',
    acceptedFormats: ['.jpg', '.jpeg', '.png', '.webp', '.bmp'],
    outputFormat: 'Rotated Image',
    supportsMultiple: true,
    seoTitle: 'Rotate and Flip Images Online - 90, 180, Mirror Flip | FileForge',
    seoDesc: 'Easily rotate and flip pictures horizontally or vertically with instant lossless processing.',
    seoFaqs: [
      { q: 'Does rotating reduce quality?', a: 'No, FileForge preserves full pixel quality when rotating or mirroring.' }
    ]
  },
  {
    id: 'image-enhancer',
    name: 'Image Quality Enhancer',
    slug: 'image-enhancer',
    category: 'image',
    type: 'edit',
    shortDesc: 'Auto-enhance contrast, sharpness, dynamic range, and color vibrancy in one click.',
    longDesc: 'Enhance dark, washed out, or blurry photos with intelligent tone curves, unsharp masking, saturation tuning, and noise reduction filters.',
    iconName: 'Sparkles',
    accentColor: 'from-violet-500 to-purple-600',
    badge: 'AI Powered',
    acceptedFormats: ['.jpg', '.jpeg', '.png', '.webp'],
    outputFormat: 'Enhanced Image',
    supportsMultiple: false,
    popular: true,
    seoTitle: 'Image Quality Enhancer - Auto Enhance & Sharpen Photos | FileForge',
    seoDesc: 'Boost brightness, contrast, sharpness, and vibrant colors with smart client-side photo enhancement.',
    seoFaqs: [
      { q: 'How does the enhancement work?', a: 'It applies perceptual dynamic range expansion and unsharp mask filtering to restore details.' }
    ]
  },
  {
    id: 'background-remover',
    name: 'Background Remover',
    slug: 'background-remover',
    category: 'image',
    type: 'edit',
    shortDesc: 'Remove image backgrounds to transparent PNG or replace with custom studio colors.',
    longDesc: 'Isolate subjects and eliminate unwanted backgrounds. Export crisp transparent PNGs or replace the background with clean white, solid branding colors, or custom shades.',
    iconName: 'Layers',
    accentColor: 'from-fuchsia-500 to-pink-600',
    badge: 'Smart AI',
    acceptedFormats: ['.jpg', '.jpeg', '.png', '.webp'],
    outputFormat: 'PNG (Transparent / Custom)',
    supportsMultiple: false,
    popular: true,
    seoTitle: 'Remove Image Background Online - Transparent PNG Generator | FileForge',
    seoDesc: 'Instantly remove backgrounds from portraits, product photos, and signatures. Replace with transparent or solid background colors.',
    seoFaqs: [
      { q: 'Can I replace the background with white for e-commerce?', a: 'Yes! Simply select "White Background" or pick any custom brand hex code.' },
      { q: 'Is it completely free?', a: 'Yes, with no watermarks or download limits.' }
    ]
  },
  {
    id: 'image-dpi-converter',
    name: 'Image Converter with Custom DPI',
    slug: 'image-dpi-converter',
    category: 'image',
    type: 'convert',
    shortDesc: 'Change image DPI (72, 150, 300, 600 DPI) for high-resolution printing.',
    longDesc: 'Prepare digital artwork and scans for commercial printing by adjusting physical DPI/PPI metadata and physical dimension ratios without distorting pixels.',
    iconName: 'Sliders',
    accentColor: 'from-amber-500 to-yellow-600',
    acceptedFormats: ['.jpg', '.jpeg', '.png', '.webp', '.tiff'],
    outputFormat: 'Print-Ready Image',
    supportsMultiple: true,
    seoTitle: 'Change Image DPI Online - 300 DPI Converter for Print | FileForge',
    seoDesc: 'Convert images to 300 DPI, 600 DPI or custom print density for magazines, banners, and brochures.',
    seoFaqs: [
      { q: 'Why is 300 DPI recommended for printing?', a: '300 DPI is the international standard resolution for crisp, sharp physical paper printing.' }
    ]
  },
  {
    id: 'passport-photo-resize',
    name: 'Passport / Photo Resize',
    slug: 'passport-photo-resize',
    category: 'image',
    type: 'edit',
    shortDesc: 'Create compliant US Passport, Visa, ID, and Stamp photos with printable sheets.',
    longDesc: 'Crop portrait photos to standard official specifications (2x2 inch US Passport, 35x45mm Schengen/UK/India Visa, 30x40mm ID). Includes biometrics face positioning guide and 6-photo printable sheets.',
    iconName: 'UserCheck',
    accentColor: 'from-emerald-500 to-green-600',
    badge: 'Official Presets',
    acceptedFormats: ['.jpg', '.jpeg', '.png', '.webp'],
    outputFormat: 'Passport Photo / Print Sheet',
    supportsMultiple: false,
    popular: true,
    seoTitle: 'Passport & Visa Photo Maker Online - 2x2 & 35x45mm | FileForge',
    seoDesc: 'Generate official passport, visa, and ID card photos with biometrics face alignment guides and 4x6 inch printable 6-photo sheets.',
    seoFaqs: [
      { q: 'Does it support printable 4x6 photo sheets?', a: 'Yes, you can generate a single photo or a ready-to-print 6-photo grid.' },
      { q: 'Are background colors customizable?', a: 'Yes, select white, off-white, light blue, or transparent.' }
    ]
  },
  {
    id: 'multiple-images-to-pdf',
    name: 'Multiple Images → Single PDF',
    slug: 'multiple-images-to-pdf',
    category: 'image',
    type: 'convert',
    shortDesc: 'Combine multiple photos and document scans into a single, organized PDF file.',
    longDesc: 'Batch combine photos with drag-and-drop reordering, page dimensions (A4, A3, Letter, Legal), landscape/portrait orientation, and border margin controls.',
    iconName: 'Files',
    accentColor: 'from-blue-600 to-indigo-700',
    acceptedFormats: ['.jpg', '.jpeg', '.png', '.webp', '.bmp'],
    outputFormat: 'PDF Document',
    supportsMultiple: true,
    seoTitle: 'Combine Multiple Images into One PDF Online | FileForge',
    seoDesc: 'Convert a batch of JPG or PNG pictures into a single organized PDF document. Reorder pages and set custom margins.',
    seoFaqs: [
      { q: 'How many images can I combine?', a: 'You can upload and merge dozens of images in one seamless session.' }
    ]
  },
  {
    id: 'images-to-zip',
    name: 'Multiple Images → ZIP',
    slug: 'images-to-zip',
    category: 'image',
    type: 'compress',
    shortDesc: 'Batch bundle, rename, and compress multiple images into a clean ZIP archive.',
    longDesc: 'Upload a folder or gallery of images, apply custom prefix naming rules, adjust compression levels, and download an organized ZIP archive.',
    iconName: 'Archive',
    accentColor: 'from-violet-600 to-indigo-700',
    acceptedFormats: ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'],
    outputFormat: 'ZIP Archive',
    supportsMultiple: true,
    seoTitle: 'Bundle Multiple Images into ZIP Archive Online | FileForge',
    seoDesc: 'Compress and bundle batches of images into a single downloadable ZIP file with automatic renaming options.',
    seoFaqs: [
      { q: 'Can I rename the files inside the ZIP?', a: 'Yes, you can specify custom file prefixes and sequential numbering.' }
    ]
  },
  {
    id: 'watermark-image',
    name: 'Watermark Image',
    slug: 'watermark-image',
    category: 'image',
    type: 'edit',
    shortDesc: 'Stamp custom text or logo graphics over photos with opacity and 9-point grid layout.',
    longDesc: 'Protect your creative photography and assets. Add customizable copyright text or brand logos with rotation, transparency, font styles, and live positioning.',
    iconName: 'Stamp',
    accentColor: 'from-teal-500 to-emerald-600',
    acceptedFormats: ['.jpg', '.jpeg', '.png', '.webp'],
    outputFormat: 'Watermarked Image',
    supportsMultiple: false,
    seoTitle: 'Watermark Images Online - Add Text or Logo Stamps | FileForge',
    seoDesc: 'Add copyright watermarks and brand logos to pictures. Adjust opacity, font size, rotation angle, and placement.',
    seoFaqs: [
      { q: 'Can I use an image logo watermark?', a: 'Yes, you can upload transparent PNG logos or enter text stamps.' }
    ]
  },
  {
    id: 'image-redact-blur',
    name: 'Blur / Redact Sensitive Area',
    slug: 'image-redact-blur',
    category: 'image',
    type: 'edit',
    shortDesc: 'Censor private details, faces, and credentials with pixelation, blur, or solid black bars.',
    longDesc: 'Draw bounding boxes directly over private info like credit cards, phone numbers, faces, or addresses with irreversible pixelation, gaussian blur, or permanent black redaction.',
    iconName: 'EyeOff',
    accentColor: 'from-slate-700 to-slate-900',
    badge: 'Security',
    acceptedFormats: ['.jpg', '.jpeg', '.png', '.webp', '.pdf'],
    outputFormat: 'Redacted Image',
    supportsMultiple: false,
    popular: true,
    seoTitle: 'Blur and Redact Sensitive Info in Images Online | FileForge',
    seoDesc: 'Draw redaction boxes over sensitive numbers, IDs, and faces. Supports pixelate, gaussian blur, and black block redaction.',
    seoFaqs: [
      { q: 'Is the underlying text completely erased?', a: 'Yes! The pixel data is overwritten in canvas memory so the redacted content cannot be recovered.' }
    ]
  },

  // ==================== PDF TOOLS (18) ====================
  {
    id: 'pdf-to-word',
    name: 'PDF → Word',
    slug: 'pdf-to-word',
    category: 'pdf',
    type: 'convert',
    shortDesc: 'Convert PDF files into fully editable Microsoft Word (.docx) documents.',
    longDesc: 'Transform read-only PDFs into clean, editable Word files preserving paragraphs, font styles, bullet points, headers, and embedded image assets.',
    iconName: 'FileText',
    accentColor: 'from-blue-600 to-blue-800',
    badge: 'Popular',
    acceptedFormats: ['.pdf'],
    outputFormat: 'DOCX Document',
    supportsMultiple: false,
    popular: true,
    seoTitle: 'Convert PDF to Word Online Free - Editable DOCX | FileForge',
    seoDesc: 'Extract and convert PDF files into editable Microsoft Word documents with high layout preservation.',
    seoFaqs: [
      { q: 'Will the generated Word document be editable?', a: 'Yes, you can open and edit all text, headings, and images in Microsoft Word or Google Docs.' }
    ]
  },
  {
    id: 'pdf-to-excel',
    name: 'PDF → Excel',
    slug: 'pdf-to-excel',
    category: 'pdf',
    type: 'convert',
    shortDesc: 'Extract tables, spreadsheets, and tabular data into Microsoft Excel (.xlsx).',
    longDesc: 'Detect data grids and tables inside invoices, bank statements, and reports. Export organized rows and columns into ready-to-calculate Excel workbooks.',
    iconName: 'Table',
    accentColor: 'from-emerald-600 to-green-700',
    acceptedFormats: ['.pdf'],
    outputFormat: 'XLSX Spreadsheet',
    supportsMultiple: false,
    popular: true,
    seoTitle: 'Convert PDF to Excel Online - Extract Tables to XLSX | FileForge',
    seoDesc: 'Pull data tables and numbers from PDF statements into structured Microsoft Excel spreadsheets.',
    seoFaqs: [
      { q: 'Does it detect multi-page tables?', a: 'Yes, sequential table pages are linked into continuous spreadsheet sheets.' }
    ]
  },
  {
    id: 'pdf-to-powerpoint',
    name: 'PDF → PowerPoint',
    slug: 'pdf-to-powerpoint',
    category: 'pdf',
    type: 'convert',
    shortDesc: 'Turn PDF slides and brochures into editable PowerPoint (.pptx) presentation decks.',
    longDesc: 'Convert PDF presentation handouts back into native PowerPoint slides with formatted slide layouts and editable media placeholders.',
    iconName: 'Presentation',
    accentColor: 'from-orange-500 to-red-600',
    acceptedFormats: ['.pdf'],
    outputFormat: 'PPTX Presentation',
    supportsMultiple: false,
    seoTitle: 'Convert PDF to PowerPoint Online - Editable PPTX Slides | FileForge',
    seoDesc: 'Rebuild PDF decks into editable Microsoft PowerPoint presentation slides.',
    seoFaqs: [
      { q: 'Can I edit the slides in PowerPoint?', a: 'Yes, slide titles, body text, and slide backgrounds remain customizable.' }
    ]
  },
  {
    id: 'pdf-to-jpg-png',
    name: 'PDF → JPG / PNG',
    slug: 'pdf-to-jpg-png',
    category: 'pdf',
    type: 'convert',
    shortDesc: 'Convert PDF pages into high-definition JPG or PNG raster graphics.',
    longDesc: 'Extract all pages or select specific pages from a PDF to export as standalone crisp images or a packaged ZIP file.',
    iconName: 'FileImage',
    accentColor: 'from-indigo-500 to-blue-600',
    badge: 'Popular',
    acceptedFormats: ['.pdf'],
    outputFormat: 'Images (ZIP)',
    supportsMultiple: false,
    popular: true,
    seoTitle: 'Convert PDF to JPG or PNG Online | FileForge',
    seoDesc: 'Save PDF pages as standalone high-quality pictures in seconds.',
    seoFaqs: [
      { q: 'Can I select specific pages to convert?', a: 'Yes, pick single pages or batch convert the whole document.' }
    ]
  },
  {
    id: 'pdf-compressor',
    name: 'PDF Compressor',
    slug: 'pdf-compressor',
    category: 'pdf',
    type: 'compress',
    shortDesc: 'Shrink PDF file sizes for email sharing while maintaining crisp reading quality.',
    longDesc: 'Choose between Recommended (balanced quality/size), Extreme (maximum compression), or Custom compression presets with live size reduction calculations.',
    iconName: 'Minimize',
    accentColor: 'from-teal-600 to-emerald-700',
    badge: 'Essential',
    acceptedFormats: ['.pdf'],
    outputFormat: 'Optimized PDF',
    supportsMultiple: true,
    popular: true,
    seoTitle: 'Compress PDF Online - Reduce PDF File Size | FileForge',
    seoDesc: 'Reduce large PDF files for email attachment limits without blurring text or charts.',
    seoFaqs: [
      { q: 'What is the Recommended mode?', a: 'Recommended mode compresses background images to 150 DPI and removes redundant object trees, saving up to 60%.' }
    ]
  },
  {
    id: 'merge-pdf',
    name: 'Merge PDF',
    slug: 'merge-pdf',
    category: 'pdf',
    type: 'edit',
    shortDesc: 'Combine multiple PDF documents into a single organized file in seconds.',
    longDesc: 'Upload multiple PDF files, reorder pages and documents with drag and drop, and combine them into one seamless unified PDF document.',
    iconName: 'Combine',
    accentColor: 'from-indigo-600 to-violet-700',
    badge: 'Popular',
    acceptedFormats: ['.pdf'],
    outputFormat: 'Merged PDF',
    supportsMultiple: true,
    popular: true,
    seoTitle: 'Merge PDF Online - Combine PDF Files Free | FileForge',
    seoDesc: 'Combine and merge multiple PDF documents into one in your chosen order with instant drag-and-drop.',
    seoFaqs: [
      { q: 'How many PDFs can I merge at once?', a: 'You can combine as many PDF files as your device memory allows with no hard limit.' }
    ]
  },
  {
    id: 'split-pdf',
    name: 'Split PDF',
    slug: 'split-pdf',
    category: 'pdf',
    type: 'edit',
    shortDesc: 'Extract separate page ranges or split a large PDF into individual page files.',
    longDesc: 'Split PDFs by individual pages, custom page ranges (e.g. 1-3, 5, 8-12), or extract single pages into an organized ZIP archive.',
    iconName: 'Scissors',
    accentColor: 'from-rose-500 to-red-600',
    badge: 'Popular',
    acceptedFormats: ['.pdf'],
    outputFormat: 'Split PDFs / ZIP',
    supportsMultiple: false,
    popular: true,
    seoTitle: 'Split PDF Online - Extract Pages and Page Ranges | FileForge',
    seoDesc: 'Split a PDF document by page ranges, every single page, or specific selections.',
    seoFaqs: [
      { q: 'Can I split by custom range syntax like 1-5, 8, 11-14?', a: 'Yes! Simply type your desired comma-separated page ranges.' }
    ]
  },
  {
    id: 'extract-pdf-pages',
    name: 'Extract Pages',
    slug: 'extract-pdf-pages',
    category: 'pdf',
    type: 'edit',
    shortDesc: 'Select and export only the specific pages you need into a fresh PDF file.',
    longDesc: 'Click on page thumbnails or enter page numbers to extract exactly what you need while leaving the rest of the document untouched.',
    iconName: 'Copy',
    accentColor: 'from-sky-600 to-cyan-700',
    acceptedFormats: ['.pdf'],
    outputFormat: 'Extracted PDF',
    supportsMultiple: false,
    seoTitle: 'Extract PDF Pages Online - Select & Save Specific Pages | FileForge',
    seoDesc: 'Extract only the necessary pages from your multi-page PDF into a brand new document.',
    seoFaqs: [
      { q: 'Is the original document altered?', a: 'No, your original file is left intact and a new PDF is generated with your selected pages.' }
    ]
  },
  {
    id: 'rearrange-pdf-pages',
    name: 'Delete / Rearrange Pages',
    slug: 'rearrange-pdf-pages',
    category: 'pdf',
    type: 'edit',
    shortDesc: 'Visual page manager: drag to reorder, delete unwanted pages, or rotate individual pages.',
    longDesc: 'Organize your PDF in a visual thumbnail gallery. Drag pages to resequence, trash blank or unwanted pages, and rotate sideways pages.',
    iconName: 'LayoutGrid',
    accentColor: 'from-purple-600 to-indigo-700',
    badge: 'Visual Editor',
    acceptedFormats: ['.pdf'],
    outputFormat: 'Reorganized PDF',
    supportsMultiple: false,
    popular: true,
    seoTitle: 'Rearrange and Delete PDF Pages Online - Visual Page Organizer | FileForge',
    seoDesc: 'Reorder, delete, and rotate PDF pages in an interactive visual grid organizer.',
    seoFaqs: [
      { q: 'Can I rotate individual pages without rotating the entire document?', a: 'Yes, each thumbnail card features its own 90-degree rotate button.' }
    ]
  },
  {
    id: 'rotate-pdf',
    name: 'Rotate PDF',
    slug: 'rotate-pdf',
    category: 'pdf',
    type: 'edit',
    shortDesc: 'Permanently rotate PDF pages 90°, 180°, or 270° clockwise or counter-clockwise.',
    longDesc: 'Correct upside-down or sideways PDF scans across all pages or specific odd/even page intervals.',
    iconName: 'RotateCw',
    accentColor: 'from-amber-600 to-orange-700',
    acceptedFormats: ['.pdf'],
    outputFormat: 'Rotated PDF',
    supportsMultiple: true,
    seoTitle: 'Rotate PDF Online - Fix Document Orientation | FileForge',
    seoDesc: 'Permanently rotate PDF document orientation clockwise or counter-clockwise.',
    seoFaqs: [
      { q: 'Can I rotate only portrait or only landscape pages?', a: 'Yes, select All Pages, Odd Pages, or Even Pages.' }
    ]
  },
  {
    id: 'pdf-to-pdfa',
    name: 'PDF → PDF/A',
    slug: 'pdf-to-pdfa',
    category: 'pdf',
    type: 'convert',
    shortDesc: 'Convert standard PDF documents into ISO-standard PDF/A for long-term archiving.',
    longDesc: 'Standardize electronic documents for legal, governmental, and institutional archiving with PDF/A compliance, font embedding, and color profile validation.',
    iconName: 'FileCheck',
    accentColor: 'from-emerald-700 to-teal-800',
    badge: 'Archival',
    acceptedFormats: ['.pdf'],
    outputFormat: 'PDF/A Document',
    supportsMultiple: true,
    seoTitle: 'Convert PDF to PDF/A Online - ISO Archival Standard | FileForge',
    seoDesc: 'Convert PDF files to ISO compliant PDF/A for long-term digital preservation and legal compliance.',
    seoFaqs: [
      { q: 'What is PDF/A?', a: 'PDF/A is an ISO-standardized version of the Portable Document Format specialized for long-term archiving.' }
    ]
  },
  {
    id: 'pdf-ocr',
    name: 'PDF OCR',
    slug: 'pdf-ocr',
    category: 'pdf',
    type: 'convert',
    shortDesc: 'Optical Character Recognition: turn scanned PDFs into searchable, selectable text.',
    longDesc: 'Extract text from scanned contracts, receipts, and book pages with multi-language OCR (English, Hindi, Spanish, French, German) and download searchable PDFs.',
    iconName: 'ScanText',
    accentColor: 'from-cyan-600 to-blue-700',
    badge: 'Multi-Language',
    acceptedFormats: ['.pdf', '.jpg', '.png'],
    outputFormat: 'Searchable PDF / TXT',
    supportsMultiple: false,
    popular: true,
    seoTitle: 'PDF OCR Online - Optical Character Recognition for Scans | FileForge',
    seoDesc: 'Make scanned PDFs selectable and searchable with multi-language OCR text recognition.',
    seoFaqs: [
      { q: 'What languages are supported?', a: 'English, Hindi, Spanish, French, German, and over 20+ additional languages.' }
    ]
  },
  {
    id: 'protect-pdf',
    name: 'Password Protect PDF',
    slug: 'protect-pdf',
    category: 'pdf',
    type: 'edit',
    shortDesc: 'Encrypt your PDF documents with secure passwords and access restrictions.',
    longDesc: 'Add high-grade AES-256 password protection to confidential agreements, financial records, and medical files to prevent unauthorized viewing or printing.',
    iconName: 'Lock',
    accentColor: 'from-red-600 to-rose-700',
    badge: 'Security',
    acceptedFormats: ['.pdf'],
    outputFormat: 'Encrypted PDF',
    supportsMultiple: false,
    seoTitle: 'Password Protect PDF Online - Encrypt PDF Documents | FileForge',
    seoDesc: 'Add strong password encryption to confidential PDF files right inside your browser.',
    seoFaqs: [
      { q: 'Are passwords logged or sent to servers?', a: 'No, encryption takes place client-side. We never store or transmit your passwords.' }
    ]
  },
  {
    id: 'unlock-pdf',
    name: 'Unlock PDF',
    slug: 'unlock-pdf',
    category: 'pdf',
    type: 'edit',
    shortDesc: 'Remove password protection from your authorized PDF files for unrestricted access.',
    longDesc: 'Remove owner passwords from PDFs you own or have permission to modify so you can read, print, and edit without re-entering credentials.',
    iconName: 'Unlock',
    accentColor: 'from-amber-500 to-yellow-600',
    badge: 'Authorized Only',
    acceptedFormats: ['.pdf'],
    outputFormat: 'Unlocked PDF',
    supportsMultiple: false,
    seoTitle: 'Unlock PDF Online - Remove Password from Authorized PDF | FileForge',
    seoDesc: 'Remove password restrictions from PDFs you own. Safe, fast, and compliant unlock workflow.',
    seoFaqs: [
      { q: 'Do I need to know the password?', a: 'Yes, you must enter the valid password once to authenticate ownership before removing the lock.' }
    ]
  },
  {
    id: 'watermark-pdf',
    name: 'Add Watermark to PDF',
    slug: 'watermark-pdf',
    category: 'pdf',
    type: 'edit',
    shortDesc: 'Stamp text (CONFIDENTIAL, DRAFT, COPY) or custom images across PDF pages.',
    longDesc: 'Apply custom diagonal or horizontal watermark stamps across all pages with customizable opacity, font size, angle, and text color.',
    iconName: 'Stamp',
    accentColor: 'from-teal-600 to-cyan-700',
    acceptedFormats: ['.pdf'],
    outputFormat: 'Watermarked PDF',
    supportsMultiple: false,
    popular: true,
    seoTitle: 'Add Watermark to PDF Online - Text & Image Stamps | FileForge',
    seoDesc: 'Stamp confidential, draft, or branded copyright watermarks on your PDF pages with live preview.',
    seoFaqs: [
      { q: 'Can I customize the opacity and rotation angle?', a: 'Yes, adjust opacity from 10% to 100% and rotation from 0° to 360°.' }
    ]
  },
  {
    id: 'page-numbers-pdf',
    name: 'Add Page Numbers',
    slug: 'page-numbers-pdf',
    category: 'pdf',
    type: 'edit',
    shortDesc: 'Insert clean page numbers (Page X of Y) into headers or footers.',
    longDesc: 'Number multi-page reports with customizable numbering format ("Page 1 of 10", "1/10", or "1"), placement position (bottom center, top right, etc.), and font styles.',
    iconName: 'ListOrdered',
    accentColor: 'from-indigo-600 to-blue-700',
    acceptedFormats: ['.pdf'],
    outputFormat: 'Numbered PDF',
    supportsMultiple: false,
    seoTitle: 'Add Page Numbers to PDF Online | FileForge',
    seoDesc: 'Insert sequential page numbers into headers or footers with customizable formatting and fonts.',
    seoFaqs: [
      { q: 'Can I start numbering from a specific page?', a: 'Yes, you can specify start page offset and ignore cover pages.' }
    ]
  },
  {
    id: 'header-footer-pdf',
    name: 'Add Header / Footer',
    slug: 'header-footer-pdf',
    category: 'pdf',
    type: 'edit',
    shortDesc: 'Add custom document titles, author names, dates, or disclaimers to page margins.',
    longDesc: 'Insert professional running headers and footers with company name, date stamps, copyright disclaimers, and margin offset controls.',
    iconName: 'PanelTop',
    accentColor: 'from-violet-600 to-purple-700',
    acceptedFormats: ['.pdf'],
    outputFormat: 'Updated PDF',
    supportsMultiple: false,
    seoTitle: 'Add Header and Footer to PDF Online | FileForge',
    seoDesc: 'Insert company titles, date stamps, and disclaimers into top and bottom PDF margins.',
    seoFaqs: [
      { q: 'Can I set different text on left, center, and right?', a: 'Yes, three separate alignment fields are supported for both header and footer.' }
    ]
  },
  {
    id: 'pdf-metadata-editor',
    name: 'PDF Metadata Editor',
    slug: 'pdf-metadata-editor',
    category: 'pdf',
    type: 'edit',
    shortDesc: 'View and edit document Title, Author, Subject, Keywords, Creator, and Producer tags.',
    longDesc: 'Optimize PDF SEO and corporate compliance by editing document metadata fields or stripping tracking information before publishing.',
    iconName: 'FileCode',
    accentColor: 'from-slate-700 to-indigo-900',
    acceptedFormats: ['.pdf'],
    outputFormat: 'Updated PDF',
    supportsMultiple: false,
    seoTitle: 'Edit PDF Metadata Online - Title, Author, Keywords | FileForge',
    seoDesc: 'Inspect, edit, or clean metadata properties in PDF documents for SEO and privacy compliance.',
    seoFaqs: [
      { q: 'Can I wipe all metadata for privacy?', a: 'Yes, one-click "Clear All Metadata" wipes author tags and creation dates.' }
    ]
  }
];
