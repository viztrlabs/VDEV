'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { homepageData } from '@/data/homepage';
import { useSiteSection } from '@/lib/use-site-section';
import { getTextField, getMediaUrls, getDefaultSection } from '@/lib/site-content';
import { sanitizeRichText } from '@/lib/sanitize-rich-text';
import EditableText from '@/components/admin/live-editor/in-context/EditableText';
import EditableMedia from '@/components/admin/live-editor/in-context/EditableMedia';
import { useEditMode } from '@/components/admin/live-editor/in-context/EditModeContext';
import { Play, Pause, Volume2, VolumeX, ArrowRight, Maximize2 } from 'lucide-react';

function CmsText({
 fieldId,
 value,
 as: Tag = 'span',
 className,
 rich,
}: {
 fieldId: string;
 value: string;
 as?: React.ElementType;
 className?: string;
 rich?: boolean;
}) {
 const { editMode } = useEditMode();
 if (editMode) return <EditableText fieldId={fieldId} as={Tag} className={className} />;
 if (rich) return <Tag className={className} dangerouslySetInnerHTML={{ __html: sanitizeRichText(value) }} />;
 return <Tag className={className}>{value}</Tag>;
}

export default function ShowreelSection() {
 const { showreel: fallback } = homepageData;
 const section = useSiteSection('showreel') ?? getDefaultSection('showreel');
 const mediaStyle = section.style.media ?? {};
 const showreel = {
  badge: getTextField(section, 'badge', ''),
  title: getTextField(section, 'title', fallback.title),
  subtitle: getTextField(section, 'subtitle', fallback.subtitle),
  ctaText: getTextField(section, 'ctaText', fallback.ctaText),
  ctaHref: getTextField(section, 'ctaHref', fallback.ctaHref),
  videoUrl: getMediaUrls(section, 'videoUrl', [fallback.videoUrl])[0],
  poster: getMediaUrls(section, 'poster', [fallback.poster])[0],
 };
 const [isPlaying, setIsPlaying] = useState(false);
 const [isMuted, setIsMuted] = useState(mediaStyle.muted ?? true);
 const videoRef = useRef<HTMLVideoElement>(null);

 const togglePlay = () => {
 if (videoRef.current) {
 if (isPlaying) {
 videoRef.current.pause();
 setIsPlaying(false);
 } else {
 videoRef.current.play();
 setIsPlaying(true);
 }
 }
 };

 const toggleMute = () => {
 if (videoRef.current) {
 videoRef.current.muted = !videoRef.current.muted;
 setIsMuted(videoRef.current.muted);
 }
 };

 return (
 <section
 id="showreel-section"
 className="relative w-full min-h-[65vh] flex items-center justify-center overflow-hidden bg-[#131314] text-[#e5e2e3] border-y border-[#3b494b]"
 >
 {/* BACKGROUND VIDEO / POSTER */}
 <EditableMedia fieldId="videoUrl" mediaType="video">
 <video
 ref={videoRef}
 src={showreel.videoUrl}
 poster={showreel.poster}
 playsInline
 loop={mediaStyle.loop ?? true}
 autoPlay={mediaStyle.autoplay ?? false}
 muted={isMuted}
 className="absolute inset-0 w-full h-full object-cover opacity-40 transition-opacity duration-700"
 onPlay={() => setIsPlaying(true)}
 onPause={() => setIsPlaying(false)}
 />
 </EditableMedia>

 {/* Dark Overlay */}
 <div className="absolute inset-0 bg-gradient-to-t from-[#131314] via-[#131314]/60 to-[#131314]/80 pointer-events-none"/>

 {/* Centered Controls & Title */}
 <div className="relative z-10 text-center max-w-2xl mx-auto px-4 sm:px-6 py-14 flex flex-col items-center">
 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#131314] border border-[#3b494b] text-[10px] font-mono text-[#54de99] font-bold uppercase tracking-widest mb-4">
 <span className="w-1.5 h-1.5 rounded-full bg-[#54de99] animate-pulse"/>
 <CmsText fieldId="badge" value={showreel.badge}/>
 </div>

 <CmsText fieldId="title" value={showreel.title} as="h2" className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#e5e2e3] mb-2 font-display"/>

 <CmsText fieldId="subtitle" value={showreel.subtitle} as="p" rich className="text-xs sm:text-sm text-[#B9CACB] mb-6 max-w-lg"/>

 {/* Play/Pause Button - Maximum pill roundedness */}
 <div className="flex items-center gap-3 mb-6">
 <button
 onClick={togglePlay}
 id="showreel-play-btn"
 className="w-16 h-16 rounded-full bg-[#00F0FF] hover:bg-[#33f3ff] text-black flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
 aria-label={isPlaying ? 'Pause Video' : 'Play Showreel'}
 >
 {isPlaying ? (
 <Pause className="w-6 h-6 fill-black"/>
 ) : (
 <Play className="w-6 h-6 fill-black ml-0.5"/>
 )}
 </button>
 
 <button
 onClick={toggleMute}
 className="p-3 rounded-full bg-[#131314] hover:bg-[#3b494b] text-[#e5e2e3] border border-[#3b494b] transition-colors cursor-pointer"
 title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
 >
 {isMuted ? <VolumeX className="w-4 h-4 text-[#00F0FF]"/> : <Volume2 className="w-4 h-4 text-[#e5e2e3]"/>}
 </button>
 </div>

 {/* View Portfolio Link */}
 <Link
 href={showreel.ctaHref}
 className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[#00F0FF] hover:underline uppercase tracking-wider"
 >
 <CmsText fieldId="ctaText" value={showreel.ctaText}/>
 <span aria-hidden="true">→</span>
 </Link>
 </div>
 </section>
 );
}
