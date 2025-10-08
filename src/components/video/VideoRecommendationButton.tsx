import { useState } from 'react';
import { Play, Loader, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { getVideoRecommendations } from '../../services/openai.service';

interface VideoRecommendation {
  id: string;
  title: string;
  channel: string;
  url: string;
  thumbnail: string;
  duration: string;
  relevanceScore?: number;
}

interface VideoRecommendationButtonProps {
  topic: string;
  context?: string;
  className?: string;
  maxVideos?: number;
}

const VideoRecommendationButton = ({ 
  topic, 
  context, 
  className = '', 
  maxVideos = 3
}: VideoRecommendationButtonProps) => {
  const [videos, setVideos] = useState<VideoRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showVideos, setShowVideos] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const generateVideoData = async (queries: string[]): Promise<VideoRecommendation[]> => {
    const mockVideos: VideoRecommendation[] = [];
    
    const educationalChannels = [
      'Khan Academy', 'CrashCourse', '3Blue1Brown', 'Veritasium', 'MinutePhysics',
      'Physics Girl', 'SciShow', 'TED-Ed', 'MIT OpenCourseWare', 'The Organic Chemistry Tutor',
      'Professor Dave Explains', 'Bozeman Science'
    ];
    
    const durations = ['5:30', '8:45', '12:20', '15:10', '6:55', '9:15', '11:40', '7:25', '18:30', '22:15'];
    
    queries.forEach((query, index) => {
      if (index >= maxVideos) return;
      
      const channel = educationalChannels[index % educationalChannels.length];
      const duration = durations[index % durations.length];
      
      const titleVariations = [
        `${query} Explained Simply`,
        `Understanding ${query}`,
        `${query} - Complete Guide`,
        `${query} Tutorial`,
        `Learn ${query} Step by Step`,
        `${query} Fundamentals`,
        `${query} for Beginners`,
        `Advanced ${query} Concepts`
      ];
      
      const title = titleVariations[index % titleVariations.length];
      
      mockVideos.push({
        id: `video-${index + 1}`,
        title,
        channel: channel,
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
        thumbnail: `https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg`,
        duration,
        relevanceScore: Math.max(0.75, 1 - (index * 0.08))
      });
    });
    
    return mockVideos;
  };

  const loadRecommendations = async () => {
    if (!topic.trim() || loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const queries = await getVideoRecommendations(topic, context);
      
      if (queries.length > 0) {
        const videoData = await generateVideoData(queries);
        setVideos(videoData);
        setShowVideos(true);
        setHasGenerated(true);
      } else {
        setError('No video recommendations found for this topic');
      }
    } catch (err) {
      console.error('Error loading video recommendations:', err);
      setError('Failed to load video recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleVideoClick = (video: VideoRecommendation) => {
    window.open(video.url, '_blank', 'noopener,noreferrer');
  };

  const toggleVideos = () => {
    setShowVideos(!showVideos);
  };

  return (
    <div className={className}>
      {/* Button to generate recommendations */}
      {!hasGenerated && (
        <Button
          onClick={loadRecommendations}
          disabled={loading}
          variant="outline"
          size="sm"
          className="border-red-200 hover:bg-red-50 hover:border-red-300 text-red-700 hover:text-red-800 transition-all duration-300"
        >
          {loading ? (
            <>
              <Loader className="h-4 w-4 mr-2 animate-spin" />
              Finding Videos...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Watch Related Videos
            </>
          )}
        </Button>
      )}

      {/* Error state */}
      {error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
          <Button
            onClick={loadRecommendations}
            variant="outline"
            size="sm"
            className="mt-2 border-red-200 hover:bg-red-100 text-red-700"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Video recommendations */}
      {hasGenerated && videos.length > 0 && (
        <Card className="mt-3 shadow-lg border-0">
          <CardContent className="p-4">
            <div 
              className="flex items-center gap-2 cursor-pointer mb-3 text-slate-600"
              onClick={toggleVideos}
            >
              <Play className="h-4 w-4" />
              <p className="text-sm font-semibold">
                Related Videos ({videos.length})
              </p>
              {showVideos ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </div>
            
            {showVideos && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {videos.map((video) => (
                  <div
                    key={video.id}
                    className="group/video bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-3 border border-slate-200 hover:border-red-300 hover:shadow-md transition-all duration-300 cursor-pointer"
                    onClick={() => handleVideoClick(video)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative aspect-video w-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg overflow-hidden flex-shrink-0">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                            <Play className="h-3 w-3 text-white ml-0.5" />
                          </div>
                        </div>
                        <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 py-0.5 rounded text-[10px]">
                          {video.duration}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-800 text-sm leading-tight line-clamp-2 group-hover/video:text-red-600 transition-colors">
                          {video.title}
                        </h4>
                        <p className="text-xs text-slate-600 mt-1 truncate">
                          {video.channel}
                        </p>
                        {video.relevanceScore && (
                          <div className="mt-1">
                            <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded">
                              {Math.round(video.relevanceScore * 100)}% match
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VideoRecommendationButton;
