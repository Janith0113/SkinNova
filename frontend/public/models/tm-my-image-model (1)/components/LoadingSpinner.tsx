"use client";

export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative w-16 h-16 mb-4">
        <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
        <div
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 animate-spin"
        ></div>
      </div>
      <p className="text-gray-600 font-medium">Analyzing image...</p>
      <p className="text-gray-500 text-sm mt-2">This may take a few seconds</p>
    </div>
  );
}
