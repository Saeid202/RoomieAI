import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, MapPin, DollarSign, Home } from 'lucide-react';

// ... (imports remain same)

interface PropertyVideoPlayerProps {
    images: string[];
    audioUrl?: string; // Voiceover
    musicUrl?: string; // Background Music
    address: string;
    price: string;
    amenities: string[];
    autoPlay?: boolean;
}

export const PropertyVideoPlayer: React.FC<PropertyVideoPlayerProps> = ({
    images,
    audioUrl,
    musicUrl,
    address,
    price,
    amenities,
    autoPlay = false
}) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(autoPlay);
    const [isMuted, setIsMuted] = useState(false);
    const [progress, setProgress] = useState(0);
    const audioRef = useRef<HTMLAudioElement>(null);
    const musicRef = useRef<HTMLAudioElement>(null);
    const duration = 4000;

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isPlaying && images.length > 0) {
            // Play Voiceover
            if (audioRef.current && audioUrl && audioRef.current.paused) {
                audioRef.current.play().catch(e => console.log("Audio play error:", e));
            }
            // Play Background Music
            if (musicRef.current && musicUrl && musicRef.current.paused) {
                musicRef.current.volume = 0.2; // Background volume
                musicRef.current.play().catch(e => console.log("Music play error:", e));
            }

            interval = setInterval(() => {
                setCurrentImageIndex((prev) => (prev + 1) % images.length);
                setProgress(0);
            }, duration);
        } else {
            if (audioRef.current) audioRef.current.pause();
            if (musicRef.current) musicRef.current.pause();
        }

        return () => clearInterval(interval);
    }, [isPlaying, images.length, audioUrl, musicUrl]);

    // Sync mute state
    useEffect(() => {
        if (musicRef.current) musicRef.current.muted = isMuted;
        if (audioRef.current) audioRef.current.muted = isMuted;
    }, [isMuted]);

    // ... (rest of animation logic same) 

    // Progress Bar Animation (keeping existing logic)
    useEffect(() => {
        let animationFrame: number;
        let startTime: number;

        const animate = (time: number) => {
            if (!startTime) startTime = time;
            const elapsed = time - startTime;
            const newProgress = (elapsed / duration) * 100;

            if (newProgress <= 100) {
                setProgress(newProgress);
                if (isPlaying) {
                    animationFrame = requestAnimationFrame(animate);
                }
            }
        };

        if (isPlaying) {
            animationFrame = requestAnimationFrame(animate);
        }

        return () => cancelAnimationFrame(animationFrame);
    }, [currentImageIndex, isPlaying]);

    const togglePlay = () => setIsPlaying(!isPlaying);
    const toggleMute = () => setIsMuted(!isMuted);

    if (!images || images.length === 0) {
        return <div className="h-64 bg-slate-100 flex items-center justify-center text-slate-400">No images available for video</div>;
    }

    return (
        <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden shadow-lg group">
            {/* Background Image with Ken Burns Effect - SAME AS BEFORE */}
            <div className="absolute inset-0 overflow-hidden">
                {images.map((img, index) => (
                    <div
                        key={img}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                            }`}
                    >
                        <img
                            src={img}
                            alt={`Slide ${index}`}
                            className={`w-full h-full object-cover transition-transform duration-[10000ms] ease-linear ${index === currentImageIndex && isPlaying ? 'scale-110' : 'scale-100'
                                }`}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
                    </div>
                ))}
            </div>

            {/* Info Overlays - SAME AS BEFORE */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
                <div className="bg-black/40 backdrop-blur-sm p-2 rounded-lg text-white">
                    <h3 className="text-sm font-bold flex items-center gap-2">
                        <Home className="w-4 h-4 text-blue-400" />
                        Waitlist Property
                    </h3>
                </div>
                <div className="bg-green-600/90 backdrop-blur-sm px-3 py-1 rounded-full text-white font-bold flex items-center gap-1 shadow-lg">
                    <DollarSign className="w-3 h-3" />
                    {price}/mo
                </div>
            </div>

            <div className="absolute bottom-12 left-4 right-4 z-10 text-white">
                <div className="flex items-center gap-2 mb-2 text-blue-200 text-sm font-medium">
                    <MapPin className="w-4 h-4" />
                    {address}
                </div>

                <div className="flex gap-2 overflow-hidden flex-wrap max-h-12">
                    {amenities.slice(0, 4).map((amenity, i) => (
                        <span key={i} className="text-xs bg-white/20 backdrop-blur-md px-2 py-1 rounded border border-white/30">
                            {amenity}
                        </span>
                    ))}
                    {amenities.length > 4 && (
                        <span className="text-xs bg-white/20 backdrop-blur-md px-2 py-1 rounded border border-white/30">
                            +{amenities.length - 4} more
                        </span>
                    )}
                </div>
            </div>

            {/* Progress Bar - SAME AS BEFORE */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                <div
                    className="h-full bg-blue-500 transition-all duration-100 ease-linear"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Controls Overlay - SAME AS BEFORE */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                <button
                    onClick={togglePlay}
                    className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all transform hover:scale-105"
                >
                    {isPlaying ? (
                        <Pause className="w-8 h-8 text-white fill-current" />
                    ) : (
                        <Play className="w-8 h-8 text-white fill-current ml-1" />
                    )}
                </button>
            </div>

            {/* Audio Control - UPDATED FOR DUAL TRACKS */}
            <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-2">
                {/* Voice Audio */}
                {audioUrl && (
                    <audio
                        ref={audioRef}
                        src={audioUrl}
                        loop={false}
                        muted={isMuted}
                        onEnded={() => {
                            if (!musicUrl) setIsPlaying(false); // Only stop if no music, otherwise keep looping video? Or stop anyway? Let's loop video.
                        }}
                    />
                )}
                {/* Background Music */}
                {musicUrl && (
                    <audio
                        ref={musicRef}
                        src={musicUrl}
                        loop={true}
                        muted={isMuted}
                    />
                )}

                <button
                    onClick={toggleMute}
                    className="p-2 bg-black/40 backdrop-blur-sm rounded-full hover:bg-black/60 text-white"
                >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
            </div>
        </div>
    );
};
