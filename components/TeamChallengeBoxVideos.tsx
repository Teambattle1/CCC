import React, { useState } from 'react';
import { Play, ArrowLeft, X, PlayCircle, PauseCircle, SkipForward, SkipBack } from 'lucide-react';

interface BoxVideo {
  boxNumber: number;
  title: string;
  id: string;
  length: string;
}

// Parse and sort the box videos by box number
const BOX_VIDEOS: BoxVideo[] = [
  { boxNumber: 1, title: 'Circus', id: '1qPOQFu4tIY', length: '0:13' },
  { boxNumber: 2, title: 'Etch a sketch', id: 'zIwSL7rBmQQ', length: '0:40' },
  { boxNumber: 3, title: 'Rubic', id: '8VtWOJvQ7BM', length: '0:18' },
  { boxNumber: 4, title: 'Play that funky music', id: 'J68mDdG9SRs', length: '0:37' },
  { boxNumber: 5, title: 'Logik!', id: 'KpbT8D45L94', length: '0:18' },
  { boxNumber: 6, title: 'Klodshans', id: '2Sg5MKun1wM', length: '0:36' },
  { boxNumber: 7, title: 'Målbart', id: 'mZ0j6aboVlA', length: '0:16' },
  { boxNumber: 8, title: 'ÆG-stra', id: 'hkoGkR4JacQ', length: '0:41' },
  { boxNumber: 9, title: 'Jorden Rundt', id: 'f6kLgX_ptOI', length: '0:23' },
  { boxNumber: 10, title: 'Bandcamp', id: 'aEMwF6tHcD8', length: '0:51' },
  { boxNumber: 11, title: 'Helt Roligt', id: 'PT9LMSr32Jo', length: '0:34' },
  { boxNumber: 12, title: 'Pinfight', id: '0FdjbpkFn_Y', length: '1:03' },
  { boxNumber: 13, title: 'TEQUILA!', id: 'Wjd5BD3OnZU', length: '0:21' },
  { boxNumber: 14, title: 'I Balance', id: '1NUu-azTbjs', length: '0:59' },
  { boxNumber: 15, title: 'The T Task', id: 'FyaO_lVVRC4', length: '0:24' },
  { boxNumber: 16, title: '4350', id: 'y2SuwxShXeI', length: '1:02' },
  { boxNumber: 17, title: 'Små numre', id: '686elFeg1m4', length: '0:32' },
  { boxNumber: 18, title: 'Præcis!', id: 'yFhhhUMHYaA', length: '0:36' },
  { boxNumber: 19, title: 'MÅL!', id: '-phNmL-52ho', length: '0:35' },
  { boxNumber: 20, title: 'Oppustet', id: 'l4NEZb6jAwQ', length: '0:23' },
  { boxNumber: 21, title: 'Box 21', id: '', length: '' }, // No video in CSV
  { boxNumber: 22, title: 'Box 22', id: 'IkR0cJ4N5Yw', length: '0:21' },
  { boxNumber: 23, title: 'Knuden', id: '0sppIvVui-w', length: '0:25' },
  { boxNumber: 24, title: 'Holey Moley!', id: '326MmwpH_N0', length: '0:32' },
  { boxNumber: 25, title: 'Slingshot', id: 'UNktC_knd7Q', length: '0:37' },
  { boxNumber: 26, title: 'Snake', id: 'd-YR5w4C-9A', length: '0:23' },
  { boxNumber: 27, title: 'Simon', id: 'LT0ExdbBnuE', length: '1:04' },
  { boxNumber: 28, title: 'Spice Girls', id: '30ISFLhciSQ', length: '0:32' },
  { boxNumber: 29, title: 'Box 29', id: '', length: '' }, // No video in CSV
  { boxNumber: 30, title: 'Var der andet?', id: 'HMfvBD06nt8', length: '0:19' },
  { boxNumber: 31, title: 'Top100', id: 'jkO60ivQsPs', length: '0:32' },
].filter(v => v.id !== ''); // Remove boxes without videos

interface TeamChallengeBoxVideosProps {
  onBack?: () => void;
}

const TeamChallengeBoxVideos: React.FC<TeamChallengeBoxVideosProps> = ({ onBack }) => {
  const [selectedVideo, setSelectedVideo] = useState<BoxVideo | null>(null);
  const [playAllMode, setPlayAllMode] = useState(false);
  const [currentPlayIndex, setCurrentPlayIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const videosWithContent = BOX_VIDEOS.filter(v => v.id !== '');

  const handleVideoClick = (video: BoxVideo) => {
    setSelectedVideo(video);
    setPlayAllMode(false);
  };

  const handlePlayAll = () => {
    setPlayAllMode(true);
    setCurrentPlayIndex(0);
    setSelectedVideo(videosWithContent[0]);
    setIsPlaying(true);
  };

  const handleNext = () => {
    if (currentPlayIndex < videosWithContent.length - 1) {
      const nextIndex = currentPlayIndex + 1;
      setCurrentPlayIndex(nextIndex);
      setSelectedVideo(videosWithContent[nextIndex]);
    }
  };

  const handlePrevious = () => {
    if (currentPlayIndex > 0) {
      const prevIndex = currentPlayIndex - 1;
      setCurrentPlayIndex(prevIndex);
      setSelectedVideo(videosWithContent[prevIndex]);
    }
  };

  const handleCloseModal = () => {
    setSelectedVideo(null);
    setPlayAllMode(false);
    setIsPlaying(false);
  };

  // Handle video end in play all mode
  const handleVideoEnd = () => {
    if (playAllMode && currentPlayIndex < videosWithContent.length - 1) {
      handleNext();
    } else if (playAllMode) {
      setIsPlaying(false);
    }
  };

  return (
    <div className="h-screen bg-battle-black flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-4 pt-3 pb-2 tablet-landscape:pt-2 tablet-landscape:pb-1">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <Play className="w-6 h-6 text-pink-500" />
            <h1 className="text-lg tablet-landscape:text-xl font-bold text-white uppercase tracking-wider">
              TeamChallenge Bokse
            </h1>
          </div>

          {/* Play All Button */}
          <button
            onClick={handlePlayAll}
            className="flex items-center gap-2 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium transition-colors"
          >
            <PlayCircle className="w-5 h-5" />
            <span className="hidden mobile-landscape:inline">Afspil Alle</span>
          </button>
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 px-4 pb-4 overflow-y-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-4 mobile-landscape:grid-cols-6 tablet-portrait:grid-cols-6 tablet-landscape:grid-cols-8 desktop:grid-cols-10 gap-2 tablet-landscape:gap-3">
          {BOX_VIDEOS.map((video) => (
            <button
              key={video.boxNumber}
              onClick={() => video.id && handleVideoClick(video)}
              disabled={!video.id}
              className={`
                aspect-square rounded-lg flex flex-col items-center justify-center gap-1 transition-all
                ${video.id
                  ? 'bg-pink-500/20 border border-pink-500/30 hover:bg-pink-500/30 hover:border-pink-500/50 hover:scale-105 cursor-pointer'
                  : 'bg-gray-800/50 border border-gray-700/30 opacity-50 cursor-not-allowed'}
              `}
            >
              <span className="text-2xl tablet-landscape:text-3xl font-bold text-white">
                {video.boxNumber}
              </span>
              <span className="text-[10px] tablet-landscape:text-xs text-gray-300 text-center px-1 line-clamp-2">
                {video.title}
              </span>
              {video.length && (
                <span className="text-[9px] tablet-landscape:text-[10px] text-pink-400">
                  {video.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl">
            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="absolute -top-12 right-0 text-white hover:text-pink-400 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>

            {/* Video Title */}
            <div className="mb-4 text-center">
              <h2 className="text-xl tablet-landscape:text-2xl font-bold text-white">
                Box {selectedVideo.boxNumber} - {selectedVideo.title}
              </h2>
              {playAllMode && (
                <p className="text-pink-400 text-sm mt-1">
                  Video {currentPlayIndex + 1} af {videosWithContent.length}
                </p>
              )}
            </div>

            {/* Video Player */}
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <iframe
                key={selectedVideo.id} // Force re-render on video change
                src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1&enablejsapi=1`}
                title={selectedVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
                onEnded={handleVideoEnd}
              />
            </div>

            {/* Play All Controls */}
            {playAllMode && (
              <div className="mt-4 flex items-center justify-center gap-4">
                <button
                  onClick={handlePrevious}
                  disabled={currentPlayIndex === 0}
                  className={`p-3 rounded-full transition-colors ${
                    currentPlayIndex === 0
                      ? 'text-gray-600 cursor-not-allowed'
                      : 'text-white hover:bg-pink-500/20'
                  }`}
                >
                  <SkipBack className="w-8 h-8" />
                </button>

                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-4 bg-pink-500 hover:bg-pink-600 rounded-full text-white transition-colors"
                >
                  {isPlaying ? (
                    <PauseCircle className="w-10 h-10" />
                  ) : (
                    <PlayCircle className="w-10 h-10" />
                  )}
                </button>

                <button
                  onClick={handleNext}
                  disabled={currentPlayIndex === videosWithContent.length - 1}
                  className={`p-3 rounded-full transition-colors ${
                    currentPlayIndex === videosWithContent.length - 1
                      ? 'text-gray-600 cursor-not-allowed'
                      : 'text-white hover:bg-pink-500/20'
                  }`}
                >
                  <SkipForward className="w-8 h-8" />
                </button>
              </div>
            )}

            {/* Video List in Play All Mode */}
            {playAllMode && (
              <div className="mt-4 max-h-32 overflow-y-auto bg-gray-900/50 rounded-lg p-2">
                <div className="flex flex-wrap gap-2">
                  {videosWithContent.map((video, index) => (
                    <button
                      key={video.boxNumber}
                      onClick={() => {
                        setCurrentPlayIndex(index);
                        setSelectedVideo(video);
                      }}
                      className={`px-3 py-1 rounded text-sm transition-colors ${
                        index === currentPlayIndex
                          ? 'bg-pink-500 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {video.boxNumber}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamChallengeBoxVideos;
