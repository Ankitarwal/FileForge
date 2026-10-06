export interface FAQItem {
  question: string;
  answer: string;
  category: 'General' | 'Security' | 'Image Tools' | 'PDF Tools';
}

export const FAQ_DATA: FAQItem[] = [
  {
    question: "Is FileForge free to use?",
    answer: "Yes! FileForge offers completely free access to all our core image and PDF tools without watermarks, daily file caps for casual usage, or hidden fees. We also offer a Pro plan for heavy enterprise power users who need massive batch processing.",
    category: "General"
  },
  {
    question: "Are my files private and secure?",
    answer: "Your privacy is our highest priority. The vast majority of our tools process files 100% locally inside your web browser using HTML5 Canvas, WebAssembly, and PDF-Lib engines. Your files never leave your computer or touch our servers unless you explicitly use a cloud-assisted conversion. When server processing is used, files are encrypted in transit with HTTPS and permanently wiped immediately after processing.",
    category: "Security"
  },
  {
    question: "What file formats are supported?",
    answer: "We support a wide array of formats including PDF, JPG, JPEG, PNG, WebP, AVIF, BMP, GIF, SVG, DOCX, XLSX, and PPTX. You can seamlessly convert between raster and vector types, and merge or split multi-page documents.",
    category: "General"
  },
  {
    question: "How large can my files be?",
    answer: "For client-side processing, FileForge comfortably handles images up to 50MB and PDF files up to 200MB. Pro users can process batch archives up to 1GB at lightning speeds.",
    category: "General"
  },
  {
    question: "Can I use FileForge on mobile devices?",
    answer: "Yes, FileForge is fully responsive and optimized for all modern smartphones and tablets (iOS Safari, Android Chrome, etc.). You can easily capture photos with your camera and convert or compress them on the fly.",
    category: "General"
  },
  {
    question: "How long are uploaded files stored?",
    answer: "For all client-side tools, files are never stored on any server. For cloud-processed tasks, files are automatically and permanently purged within 60 minutes or immediately upon clicking 'Delete Now'.",
    category: "Security"
  },
  {
    question: "Can I convert scanned PDFs or images into searchable text?",
    answer: "Yes! Our PDF OCR tool uses intelligent optical character recognition to detect printed text in scanned documents in multiple languages (English, Hindi, Spanish, French, German, etc.) and generate a searchable PDF or text extract.",
    category: "PDF Tools"
  },
  {
    question: "Can I compress images without losing visual quality?",
    answer: "Yes. Our intelligent Image Compressor analyzes colors, metadata, and high-frequency noise using advanced perceptual quantization algorithms, allowing you to reduce file sizes by up to 80% with virtually imperceptible difference to the human eye.",
    category: "Image Tools"
  }
];
