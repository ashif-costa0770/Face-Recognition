"use client";

import Image from "next/image";

export default function ImagePreview({ src, alt, onRemove, ringClassName = "" }) {
  if (!src) return null;

  return (
    <div className="mb-4 flex justify-center">
      <div className="relative h-[120px] w-[120px]">
        {onRemove ? (
          <button
            type="button"
            onClick={onRemove}
            className="absolute -right-1 -top-1 z-10 inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-xs text-white shadow-md transition-all duration-300 hover:bg-black"
            aria-label="Remove image"
          >
            ×
          </button>
        ) : null}
        <Image
          src={src}
          alt={alt}
          width={120}
          height={120}
          unoptimized
          className={`h-[120px] w-[120px] rounded-full object-cover ring-2 ring-gray-200 transition-all duration-300 ${ringClassName}`}
        />
      </div>
    </div>
  );
}
