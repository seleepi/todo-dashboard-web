'use client';

import { useState } from 'react';
import { Widget } from '@/types/widget';

interface YouTubeWidgetProps {
  widget: Widget;
  onUpdate: (updates: Partial<Widget>) => void;
}

export function YouTubeWidget({ widget, onUpdate }: YouTubeWidgetProps) {
  const [youtubeUrl, setYoutubeUrl] = useState(widget.data.youtubeUrl || '');
  const [inputUrl, setInputUrl] = useState('');

  const extractVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const addVideo = () => {
    if (!inputUrl.trim()) return;
    
    const videoId = extractVideoId(inputUrl);
    if (!videoId) {
      alert('Please enter a valid YouTube URL');
      return;
    }

    onUpdate({
      data: {
        ...widget.data,
        youtubeUrl: inputUrl.trim(),
      },
    });
    setYoutubeUrl(inputUrl.trim());
    setInputUrl('');
  };

  const removeVideo = () => {
    onUpdate({
      data: {
        ...widget.data,
        youtubeUrl: '',
      },
    });
    setYoutubeUrl('');
  };

  const videoId = youtubeUrl ? extractVideoId(youtubeUrl) : null;

  return (
    <div className="p-4 h-full flex flex-col">
      {!videoId ? (
        <div className="h-full flex flex-col justify-center">
          <div className="text-center mb-4">
            <div className="text-gray-500 mb-2">
              🎥 Add a YouTube video
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Paste a YouTube URL to embed the video
            </p>
          </div>
          
          <div className="space-y-2">
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              onKeyPress={(e) => e.key === 'Enter' && addVideo()}
            />
            <button
              onClick={addVideo}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
            >
              Add Video
            </button>
          </div>
        </div>
      ) : (
        <div className="h-full flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600 truncate flex-1 mr-2">
              YouTube Video
            </span>
            <button
              onClick={removeVideo}
              className="text-red-500 hover:text-red-700"
              title="Remove video"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          <div className="flex-1 bg-black rounded overflow-hidden">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </div>
      )}
    </div>
  );
}