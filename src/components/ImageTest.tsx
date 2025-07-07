import React from 'react';
import { getImageUrl } from '../utils/imageUtils';

export function ImageTest() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Image Path Test</h1>

      <div className="grid grid-cols-1 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-2">Local Path with ./</h2>
          <img
            src={getImageUrl("./images/bucno olje/bucno olje 1.jpeg") || 'https://via.placeholder.com/150?text=Error'}
            alt="Test with ./"
            className="w-64 h-64 object-cover border border-gray-300"
            onError={(e) => {
              console.error("Error loading image with ./");
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Error';
            }}
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Local Path with /</h2>
          <img
            src={getImageUrl("/images/bucno olje/bucno olje 1.jpeg") || 'https://via.placeholder.com/150?text=Error'}
            alt="Test with /"
            className="w-64 h-64 object-cover border border-gray-300"
            onError={(e) => {
              console.error("Error loading image with /");
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Error';
            }}
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Import Method</h2>
          <div>
            <p className="text-sm text-gray-600 mb-2">
              This method uses direct import which Vite handles differently
            </p>
            <img
              src={getImageUrl("./images/bucno olje/bucno olje 1.jpeg") || 'https://via.placeholder.com/150?text=Error'}
              alt="Test with import.meta.url"
              className="w-64 h-64 object-cover border border-gray-300"
              onError={(e) => {
                console.error("Error loading image with import.meta.url");
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Error';
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
