import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MediaCarousel = ({ media, height }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!media || media.length === 0) return null;

    const next = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % media.length);
    };

    const prev = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
    };

    const currentMedia = media[currentIndex];
    const isVideo = currentMedia.type === 'video';

    return (
        <div style={{ position: 'relative', width: '100%', height: height || '350px', overflow: 'hidden', borderRadius: 'var(--radius-lg)', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {media.length > 1 && (
                <>
                    <button
                        onClick={prev}
                        style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', zIndex: 10, background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', padding: '0.6rem', borderRadius: '50%', cursor: 'pointer', backdropFilter: 'blur(10px)', transition: 'all 0.2s' }}
                    >
                        <ChevronLeft size={22} />
                    </button>
                    <button
                        onClick={next}
                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', zIndex: 10, background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', padding: '0.6rem', borderRadius: '50%', cursor: 'pointer', backdropFilter: 'blur(10px)', transition: 'all 0.2s' }}
                    >
                        <ChevronRight size={22} />
                    </button>
                    <div style={{ position: 'absolute', bottom: '15px', left: '50%', transform: 'translateX(-50%)', zIndex: 10, display: 'flex', gap: '6px' }}>
                        {media.map((_, i) => (
                            <div key={i} style={{ width: i === currentIndex ? '20px' : '6px', height: '6px', borderRadius: '10px', background: i === currentIndex ? 'white' : 'rgba(255,255,255,0.4)', transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }} />
                        ))}
                    </div>
                </>
            )}

            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: isVideo ? '0' : '0' }}>
                {isVideo ? (
                    <video
                        src={currentMedia.url.startsWith('http') ? currentMedia.url : `http://localhost:8000/${currentMedia.url}`}
                        controls
                        style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000' }}
                    />
                ) : (
                    <img
                        src={currentMedia.url.startsWith('http') ? currentMedia.url : `http://localhost:8000/${currentMedia.url}`}
                        alt="Gallery Item"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                )}
            </div>
        </div>
    );
};

export default MediaCarousel;
