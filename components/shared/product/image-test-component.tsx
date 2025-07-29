"use client";

import Image from 'next/image';
import React from 'react';

interface ImageTestProps {
  src: string;
  alt: string;
}

export const ImageTestComponent: React.FC<ImageTestProps> = ({ src, alt }) => {
  return (
    <div className="border border-red-500 p-4 mb-4">
      <h3 className="text-lg font-bold mb-2">Regular img tag:</h3>
      <div style={{ position: 'relative', width: '300px', height: '300px' }}>
        <img 
          src={src}
          alt={`${alt} (regular img)`}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          className="bg-gray-100"
        />
      </div>

      <h3 className="text-lg font-bold mb-2 mt-4">Next.js Image component:</h3>
      <div style={{ position: 'relative', width: '300px', height: '300px' }}>
        <Image
          src={src}
          alt={`${alt} (Next Image)`}
          fill
          style={{ objectFit: 'contain' }}
          className="bg-gray-100"
        />
      </div>
    </div>
  );
};