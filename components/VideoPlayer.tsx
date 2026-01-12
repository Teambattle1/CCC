import React, { useState } from 'react';
import { Play, ChevronRight } from 'lucide-react';

interface VideoIndexItem {
  title: string;
  index: number;
}

interface VideoPlayerProps {
  title: string;
  videoId?: string;
  playlistId?: string;
  videoIndex?: VideoIndexItem[];
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ title, videoId, playlistId, videoIndex }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Build the embed URL based on whether it's a video or playlist
  // YouTube uses 1-based indexing for playlists
  const getEmbedUrl = (index: number = 0) => {
    if (playlistId) {
      return `https://www.youtube.com/embed/videoseries?list=${playlistId}&index=${index + 1}&rel=0&modestbranding=1`;
    }
    return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
  };

  const handleVideoSelect = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-battle-grey/20 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Play className="w-8 h-8 text-battle-orange" />
          <h2 className="text-xl font-bold text-white uppercase tracking-wider">{title}</h2>
        </div>

        {/* Video Container */}
        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-battle-black border border-white/10">
          <iframe
            key={currentIndex}
            className="absolute inset-0 w-full h-full"
            src={getEmbedUrl(currentIndex)}
            title={title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>

        {/* Video Index */}
        {videoIndex && videoIndex.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Videoindeks</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {videoIndex.map((video) => (
                <button
                  key={video.index}
                  onClick={() => handleVideoSelect(video.index)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                    currentIndex === video.index
                      ? 'bg-battle-orange/20 border border-battle-orange/50 text-battle-orange'
                      : 'bg-battle-black/50 border border-white/5 text-gray-300 hover:bg-battle-grey/30 hover:text-white hover:border-white/10'
                  }`}
                >
                  <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    currentIndex === video.index
                      ? 'bg-battle-orange text-white'
                      : 'bg-battle-grey/50 text-gray-400'
                  }`}>
                    {video.index + 1}
                  </span>
                  <span className="flex-1 text-sm font-medium truncate">{video.title}</span>
                  <ChevronRight className={`w-4 h-4 flex-shrink-0 ${
                    currentIndex === video.index ? 'text-battle-orange' : 'text-gray-600'
                  }`} />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;
