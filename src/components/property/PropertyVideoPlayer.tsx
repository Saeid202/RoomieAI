import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, MapPin, DollarSign, Home } from 'lucide-react';

// ... (imports remain same)

interface PropertyVideoPlayerProps {
    images: string[];
    audioUrl?: string; // Voiceover (MP3 URL)
    script?: string;   // Voiceover Script (Fallback for TTS)
    musicUrl?: string; // Background Music
    address: string;
    price: string;
    amenities: string[];
    autoPlay?: boolean;
}

export const PropertyVideoPlayer: React.FC<PropertyVideoPlayerProps> = ({
    images,
    audioUrl,
    script,
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

    // TTS State
    const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null);

    // Initialize TTS Utterance
    useEffect(() => {
        if (script && !audioUrl) {
            const u = new SpeechSynthesisUtterance(script);
            u.rate = 1.0;
            u.pitch = 1.0;
            u.volume = isMuted ? 0 : 1;

            // Try to find a good English voice
            const voices = window.speechSynthesis.getVoices();
            const preferred = voices.find(v => v.name.includes('Google US English')) ||
                voices.find(v => v.lang.startsWith('en-US')) ||
                voices[0];
            if (preferred) u.voice = preferred;

            setUtterance(u);
        }
    }, [script, audioUrl]);

    // Handle Mute for TTS
    useEffect(() => {
        if (utterance) {
            utterance.volume = isMuted ? 0 : 1;
        }
        if (musicRef.current) musicRef.current.muted = isMuted;
        if (audioRef.current) audioRef.current.muted = isMuted;
    }, [isMuted, utterance]);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isPlaying && images.length > 0) {
            // Play Voiceover (Audio File)
            if (audioRef.current && audioUrl && audioRef.current.paused) {
                audioRef.current.play().catch(e => console.log("Audio play error:", e));
            }
            // Play Voiceover (TTS)
            else if (script && !audioUrl && utterance) {
                window.speechSynthesis.cancel(); // Stop any previous
                window.speechSynthesis.speak(utterance);
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
            window.speechSynthesis.cancel();
        }

        return () => {
            clearInterval(interval);
            window.speechSynthesis.cancel(); // Cleanup on unmount/change
        };
    }, [isPlaying, images.length, audioUrl, musicUrl, script, utterance]);

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
    const stopVideo = () => {
        setIsPlaying(false);
        setCurrentImageIndex(0);
        setProgress(0);
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        if (musicRef.current) {
            musicRef.current.pause();
            musicRef.current.currentTime = 0;
        }
        window.speechSynthesis.cancel();
    };
    const toggleMute = () => setIsMuted(!isMuted);

    if (!images || images.length === 0) {
        return <div className="h-64 bg-slate-100 flex items-center justify-center text-slate-400">No images available for video</div>;
    }

    return (
        <div
            className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl group ring-1 ring-white/10 cursor-pointer"
            onClick={togglePlay}
        >
            {/* Background Image with Ken Burns Effect */}
            <div className="absolute inset-0 overflow-hidden">
                {images.map((img, index) => (
                    <div
                        key={img}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}
                    >
                        <img
                            src={img}
                            alt={`Slide ${index}`}
                            className={`w-full h-full object-cover transition-transform duration-[10000ms] ease-linear ${index === currentImageIndex && isPlaying ? 'scale-110' : 'scale-100'}`}
                        />
                        {/* Cinematic Vignette */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/30" />
                    </div>
                ))}
            </div>

            {/* Top Info Bar */}
            <div className="absolute top-0 left-0 right-0 p-2 flex justify-between items-start z-20 bg-gradient-to-b from-black/60 to-transparent">
                <div className="flex flex-col gap-0.5 w-full">
                    <h3 className="text-white font-semibold text-xs leading-tight drop-shadow-md flex items-center gap-2 w-full max-w-[90%] truncate">
                        {address}
                    </h3>
                    <div className="flex items-center gap-2 text-white/90 text-[10px] font-medium">
                        <span className="bg-blue-600/90 px-1.5 py-0.5 rounded-[2px]">FOR RENT</span>
                        <span className="flex items-center gap-0.5"><DollarSign className="w-2.5 h-2.5" />{price}/mo</span>
                    </div>
                </div>
            </div>

            {/* Center Play Button Overlay (Visible when paused) */}
            {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/40 shadow-xl animate-in fade-in zoom-in duration-300">
                        <Play className="w-8 h-8 text-white fill-white ml-1" />
                    </div>
                </div>
            )}

            {/* Subtitles / Amenities (Lower Left) */}
            <div className="absolute bottom-16 left-4 z-20 max-w-[70%]">
                <div className="flex flex-wrap gap-2">
                    {amenities.slice(0, 4).map((amenity, i) => (
                        <span key={i} className="text-xs font-semibold bg-black/40 backdrop-blur-md text-white px-2 py-1 rounded border border-white/10 shadow-sm">
                            {amenity}
                        </span>
                    ))}
                </div>
            </div>

            {/* Bottom Control Bar */}
            <div
                className="absolute bottom-0 left-0 right-0 z-40 bg-black/60 backdrop-blur-md border-t border-white/10 p-3 flex flex-col gap-2 transition-transform duration-300 translate-y-0"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Progress Bar */}
                <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden cursor-pointer group/progress">
                    <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-100 ease-linear relative"
                        style={{ width: `${progress}%` }}
                    >
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100" />
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={togglePlay}
                            className="text-white hover:text-blue-400 transition-colors focus:outline-none"
                            title={isPlaying ? "Pause" : "Play"}
                        >
                            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                        </button>

                        <button
                            onClick={stopVideo}
                            className="text-white hover:text-red-400 transition-colors focus:outline-none"
                            title="Stop"
                        >
                            <div className="w-4 h-4 bg-current rounded-sm" />
                        </button>

                        <span className="text-xs text-white/50 font-mono ml-2 border-l border-white/20 pl-3">
                            Slide {currentImageIndex + 1} / {images.length}
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Audio Indicators */}
                        {(audioUrl || musicUrl) && (
                            <div className="flex items-center gap-1">
                                <div className={`h-1 w-1 rounded-full ${isPlaying ? 'bg-green-400 animate-pulse' : 'bg-white/30'}`} />
                                <div className={`h-2 w-1 rounded-full ${isPlaying ? 'bg-green-400 animate-pulse delay-75' : 'bg-white/30'}`} />
                                <div className={`h-3 w-1 rounded-full ${isPlaying ? 'bg-green-400 animate-pulse delay-150' : 'bg-white/30'}`} />
                            </div>
                        )}

                        <button
                            onClick={toggleMute}
                            className="text-white hover:text-slate-300 transition-colors focus:outline-none"
                            title={isMuted ? "Unmute" : "Mute"}
                        >
                            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Hidden Audio Elements */}
            <div className="hidden">
                {audioUrl && (
                    <audio
                        ref={audioRef}
                        src={audioUrl}
                        muted={isMuted}
                        onEnded={() => {
                            // Optional: loop audio or stop
                        }}
                    />
                )}
                {musicUrl && (
                    <audio
                        ref={musicRef}
                        src={musicUrl}
                        loop
                        muted={isMuted}
                    />
                )}
            </div>
        </div>
    );
};
