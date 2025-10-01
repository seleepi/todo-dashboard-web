'use client';

import { useState, useEffect } from 'react';
import { Widget } from '@/types/widget';

interface ClockWeatherWidgetProps {
  widget: Widget;
  onUpdate: (updates: Partial<Widget>) => void;
}

export function ClockWeatherWidget({ widget, onUpdate }: ClockWeatherWidgetProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [location, setLocation] = useState(widget.data.location || 'Berlin');
  const [isEditingLocation, setIsEditingLocation] = useState(false);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const saveLocation = () => {
    onUpdate({
      data: {
        ...widget.data,
        location,
      },
    });
    setIsEditingLocation(false);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="p-4 h-full flex flex-col justify-center">
      {/* Clock */}
      <div className="text-center mb-4">
        <div className="text-3xl font-bold text-gray-900 mb-1">
          {formatTime(currentTime)}
        </div>
        <div className="text-sm text-gray-600">
          {formatDate(currentTime)}
        </div>
      </div>

      {/* Weather placeholder */}
      <div className="bg-blue-50 rounded-lg p-3">
        <div className="flex justify-between items-center mb-2">
          {isEditingLocation ? (
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="text-sm border rounded px-2 py-1 w-24"
                onKeyPress={(e) => e.key === 'Enter' && saveLocation()}
              />
              <button
                onClick={saveLocation}
                className="text-xs bg-blue-600 text-white px-2 py-1 rounded"
              >
                Save
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditingLocation(true)}
              className="text-sm font-medium text-gray-700 hover:text-blue-600"
            >
              {location}
            </button>
          )}
        </div>
        
        {/* Mock weather data */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-gray-800">22°C</div>
            <div className="text-xs text-gray-600">Partly Cloudy</div>
          </div>
          <div className="text-2xl">⛅</div>
        </div>
        
        <div className="text-xs text-gray-500 mt-2">
          💡 Weather API integration coming soon
        </div>
      </div>
    </div>
  );
}