/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { Upload, Camera, FileText, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

interface DropzoneProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

export default function Dropzone({ onFileSelect, isProcessing }: DropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      onFileSelect(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative group cursor-pointer h-64 flex flex-col items-center justify-center border border-zinc-800 rounded-sm transition-all duration-300 ${
        isDragging 
          ? 'border-gold bg-gold/5' 
          : 'bg-[#080809] hover:bg-zinc-900 hover:border-gold/30'
      } ${isProcessing ? 'pointer-events-none opacity-60' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      id="dropzone-container"
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      
      {isProcessing ? (
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-gold animate-spin" />
          <p className="text-white font-light font-serif italic text-lg tracking-wide">Analyzing document...</p>
          <p className="text-muted text-[10px] uppercase tracking-widest">Precision OCR in progress</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 text-center px-6">
          <div className="p-4 bg-zinc-950 rounded-full group-hover:scale-110 transition-transform duration-300 border border-zinc-800">
            <Upload className="w-8 h-8 text-gold" />
          </div>
          <div>
            <p className="text-white font-serif text-xl italic font-light">Deposit document here</p>
            <p className="text-muted text-[10px] uppercase tracking-[0.2em] mt-2 font-sans">or browse local secure files</p>
          </div>
          <div className="flex gap-4 mt-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 border border-zinc-800 rounded-none text-[10px] uppercase tracking-[0.1em] text-muted">
              <Camera className="w-3 h-3" /> Photographic
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 border border-zinc-800 rounded-none text-[10px] uppercase tracking-[0.1em] text-muted">
              <FileText className="w-3 h-3" /> Digital Invoice
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
