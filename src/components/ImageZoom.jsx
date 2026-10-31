'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { PLACEHOLDER_IMAGE } from './ui/imageFallback';

/**
 * ImageZoom Component for E-Commerce Buyers
 * Next.js 15 Client Component
 * 
 * Features:
 * 1. Smooth Inner Pan & Zoom on Mouse Hover with configurable zoom factor.
 * 2. Lens cursor with interactive coordinate tracking.
 * 3. Mobile / Touch friendly fullscreen Lightbox modal with zoom in / out controls.
 * 4. Smooth CSS transitions and accessibility keyboard support (Escape key to exit lightbox).
 */
export default function ImageZoom({
    src,
    alt = "Product Image",
    zoomScale = 2.2,
    className = "",
    showHint = true,
    enableLightbox = true
}) {
    const containerRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [lightboxZoom, setLightboxZoom] = useState(1);
    const [lightboxPos, setLightboxPos] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    // Track load/failure per src so switching images shows the shimmer again and a broken URL doesn't shimmer forever
    const [loadedSrc, setLoadedSrc] = useState(null);
    const [failedSrc, setFailedSrc] = useState(null);
    const displaySrc = !src || failedSrc === src ? PLACEHOLDER_IMAGE : src;
    const imageLoaded = !src || loadedSrc === src || failedSrc === src;

    // Track mouse coordinates relative to container
    const handleMouseMove = (e) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        
        // Calculate percentage position
        const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
        const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

        setMousePos({ x, y });
    };

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        setMousePos({ x: 50, y: 50 });
    };

    // Close lightbox on Escape key
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape' && isLightboxOpen) {
            setIsLightboxOpen(false);
            setLightboxZoom(1);
            setLightboxPos({ x: 0, y: 0 });
        }
    }, [isLightboxOpen]);

    useEffect(() => {
        if (isLightboxOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleKeyDown);
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isLightboxOpen, handleKeyDown]);

    // Lightbox drag to pan
    const handleLightboxMouseDown = (e) => {
        if (lightboxZoom > 1) {
            setIsDragging(true);
            setDragStart({ x: e.clientX - lightboxPos.x, y: e.clientY - lightboxPos.y });
        }
    };

    const handleLightboxMouseMove = (e) => {
        if (isDragging && lightboxZoom > 1) {
            setLightboxPos({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        }
    };

    const handleLightboxMouseUp = () => {
        setIsDragging(false);
    };

    const handleZoomIn = () => {
        setLightboxZoom((prev) => Math.min(prev + 0.5, 4));
    };

    const handleZoomOut = () => {
        setLightboxZoom((prev) => {
            const next = Math.max(prev - 0.5, 1);
            if (next === 1) setLightboxPos({ x: 0, y: 0 });
            return next;
        });
    };

    const handleResetZoom = () => {
        setLightboxZoom(1);
        setLightboxPos({ x: 0, y: 0 });
    };

    return (
        <>
            {/* Main Interactive Zoomable Image Frame */}
            <div
                ref={containerRef}
                onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={() => enableLightbox && setIsLightboxOpen(true)}
                className={`relative overflow-hidden cursor-crosshair rounded-lg bg-gray-50 border border-gray-100 select-none group ${className}`}
                style={{ touchAction: 'pan-y' }}
            >
                {/* Skeleton shimmer while image loads */}
                {!imageLoaded && (
                    <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                )}

                {/* Base & Zoomed Image */}
                <img
                    src={displaySrc}
                    alt={alt}
                    onLoad={() => setLoadedSrc(src)}
                    onError={() => setFailedSrc(src)}
                    className="w-full h-auto object-cover block will-change-transform"
                    style={{
                        transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
                        transform: isHovered ? `scale(${zoomScale})` : 'scale(1)',
                        transition: isHovered
                            ? 'transform 0.08s cubic-bezier(0.2, 0, 0.2, 1)'
                            : 'transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)'
                    }}
                />

                {/* Hover to Zoom Badge Hint */}
                {showHint && (
                    <div
                        className={`absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1.5 pointer-events-none transition-opacity duration-300 ${
                            isHovered ? 'opacity-0' : 'opacity-90 group-hover:opacity-100'
                        }`}
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                        </svg>
                        <span>Hover to zoom</span>
                    </div>
                )}

                {/* Lightbox Expand Button */}
                {enableLightbox && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsLightboxOpen(true);
                        }}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-gray-700 hover:text-black shadow-sm flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                        title="View Fullscreen"
                        aria-label="View Fullscreen"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                    </button>
                )}
            </div>

            {/* High-Resolution Fullscreen Lightbox Modal */}
            {isLightboxOpen && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 transition-opacity animate-in fade-in duration-200"
                    onClick={() => {
                        if (lightboxZoom === 1) {
                            setIsLightboxOpen(false);
                        }
                    }}
                >
                    {/* Top Control Bar */}
                    <div className="flex items-center justify-between text-white z-10 w-full max-w-7xl mx-auto">
                        <div className="flex items-center gap-2 text-xs text-gray-300">
                            <span className="font-medium text-white">{alt}</span>
                            <span>•</span>
                            <span>Zoom: {Math.round(lightboxZoom * 100)}%</span>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Zoom In Button */}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleZoomIn();
                                }}
                                disabled={lightboxZoom >= 4}
                                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition disabled:opacity-40 cursor-pointer"
                                title="Zoom In"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                            </button>

                            {/* Zoom Out Button */}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleZoomOut();
                                }}
                                disabled={lightboxZoom <= 1}
                                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition disabled:opacity-40 cursor-pointer"
                                title="Zoom Out"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                                </svg>
                            </button>

                            {/* Reset Zoom Button */}
                            {lightboxZoom > 1 && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleResetZoom();
                                    }}
                                    className="px-3 h-9 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-white flex items-center justify-center transition cursor-pointer"
                                    title="Reset Zoom"
                                >
                                    Reset
                                </button>
                            )}

                            {/* Close Modal Button */}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsLightboxOpen(false);
                                    handleResetZoom();
                                }}
                                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-red-500/80 text-white flex items-center justify-center transition cursor-pointer ml-2"
                                title="Close (Esc)"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Image Stage Container */}
                    <div
                        className="flex-1 flex items-center justify-center overflow-hidden w-full relative my-4"
                        onMouseDown={handleLightboxMouseDown}
                        onMouseMove={handleLightboxMouseMove}
                        onMouseUp={handleLightboxMouseUp}
                    >
                        <img
                            src={displaySrc}
                            alt={alt}
                            draggable={false}
                            className={`max-w-full max-h-[80vh] object-contain select-none transition-transform duration-150 ${
                                lightboxZoom > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'
                            }`}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (lightboxZoom === 1) {
                                    handleZoomIn();
                                }
                            }}
                            style={{
                                transform: `scale(${lightboxZoom}) translate(${lightboxPos.x / lightboxZoom}px, ${lightboxPos.y / lightboxZoom}px)`,
                                willChange: 'transform'
                            }}
                        />
                    </div>

                    {/* Bottom Instructions Footer */}
                    <div className="text-center text-xs text-gray-400 py-1">
                        {lightboxZoom > 1 ? (
                            <span>Drag with mouse to pan across image • Press <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[11px] text-gray-200">Esc</kbd> to exit</span>
                        ) : (
                            <span>Click image or use <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[11px] text-gray-200">+</kbd> to zoom in • Press <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[11px] text-gray-200">Esc</kbd> to exit</span>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
