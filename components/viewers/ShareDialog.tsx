'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Share2, Compass, Copy, Twitter, Facebook, Linkedin, MessageCircle } from 'lucide-react';
import type { TourRoom } from '@/components/viewers/PanoramaViewer';

export interface ShareDialogProps {
  currentRoom: TourRoom;
  showShareDialog: boolean;
  shareCopied: boolean;
  onClose: () => void;
  onCopy: () => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export default function ShareDialog({
  currentRoom,
  showShareDialog,
  shareCopied,
  onClose,
  onCopy,
  showToast,
}: ShareDialogProps) {
  const getShareUrl = () => {
    if (typeof window === 'undefined') return '';
    const url = new URL(window.location.href);
    url.searchParams.set('scene', currentRoom.id);
    return url.toString();
  };

  const handleSocialShare = (platform: 'twitter' | 'facebook' | 'linkedin' | 'whatsapp') => {
    const url = encodeURIComponent(getShareUrl());
    const text = encodeURIComponent(`Check out ${currentRoom.name} on the VizTR Virtual Tour`);
    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${text}%20${url}`;
        break;
    }
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <AnimatePresence>
      {showShareDialog && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-display font-bold text-white flex items-center gap-2">
                <Share2 className="w-5 h-5 text-[#3ECF8E]" />
                Share This Room
              </h3>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-[#27272A] text-[#A1A1AA] hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm text-[#A1A1AA] mb-4">
              Share <span className="text-[#3ECF8E] font-medium">{currentRoom.name}</span> with others. The link includes the exact room and view.
            </p>

            <div className="flex items-center gap-2 mb-4">
              <input
                type="text"
                readOnly
                value={getShareUrl()}
                className="flex-1 px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-xs text-white font-mono focus:outline-none focus:border-[#3ECF8E]"
              />
              <button
                onClick={onCopy}
                className={`px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors shrink-0 ${
                  shareCopied
                    ? 'bg-emerald-500 text-white'
                    : 'bg-[#3ECF8E] hover:bg-[#34b27b] text-black'
                }`}
              >
                {shareCopied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            {/* Social share buttons */}
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => handleSocialShare('twitter')}
                className="w-9 h-9 rounded-full bg-[#18181B] hover:bg-[#27272A] text-[#1DA1F2] border border-[#27272A] flex items-center justify-center transition-colors"
                aria-label="Share on Twitter"
                title="Share on Twitter"
              >
                <Twitter className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleSocialShare('facebook')}
                className="w-9 h-9 rounded-full bg-[#18181B] hover:bg-[#27272A] text-[#1877F3] border border-[#27272A] flex items-center justify-center transition-colors"
                aria-label="Share on Facebook"
                title="Share on Facebook"
              >
                <Facebook className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleSocialShare('linkedin')}
                className="w-9 h-9 rounded-full bg-[#18181B] hover:bg-[#27272A] text-[#0A66C2] border border-[#27272A] flex items-center justify-center transition-colors"
                aria-label="Share on LinkedIn"
                title="Share on LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleSocialShare('whatsapp')}
                className="w-9 h-9 rounded-full bg-[#18181B] hover:bg-[#27272A] text-[#25D366] border border-[#27272A] flex items-center justify-center transition-colors"
                aria-label="Share on WhatsApp"
                title="Share on WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-[#71717A] font-mono">
              <Compass className="w-3 h-3" />
              <span>{currentRoom.subtitle}</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
