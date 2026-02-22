import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';

interface ToolModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    files: any[]; // Will use IntegratedFile[] from universal hook
    activeIndex: number;
    setActiveIndex: (index: number) => void;
    onPrimaryAction: () => void;
    primaryActionText: React.ReactNode;
    isProcessing?: boolean;
    children: React.ReactNode; // Sidebar settings content
}

export function ToolModal({
    isOpen,
    onClose,
    title,
    files,
    activeIndex,
    setActiveIndex,
    onPrimaryAction,
    primaryActionText,
    isProcessing = false,
    children
}: ToolModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Locking Body Scroll
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen || !mounted) return null;

    const activeFile = files[activeIndex];
    const isBatch = files.length > 1;

    const handlePrevious = () => {
        setActiveIndex(activeIndex > 0 ? activeIndex - 1 : files.length - 1);
    };

    const handleNext = () => {
        setActiveIndex(activeIndex < files.length - 1 ? activeIndex + 1 : 0);
    };

    const modalContent = (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 md:p-6">
            <div className="flex flex-col w-full h-full md:h-[600px] md:max-h-[85vh] md:max-w-[1000px] md:rounded-xl overflow-hidden bg-white shadow-2xl relative">

                {/* Universal Top Header */}
                <div className="flex items-center justify-between p-4 px-6 border-b border-border bg-white shrink-0 z-20">
                    <h2 className="text-base font-bold text-slate-800">{title}</h2>
                    <button onClick={onClose} className="p-1.5 -mr-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors">
                        <Icon name="x" size={20} />
                    </button>
                </div>

                <div className="flex flex-col md:flex-row flex-1 overflow-hidden min-h-0">
                    {/* Left Stage: 55% Fixed Content */}
                    <div className="w-full md:w-[55%] h-[40vh] md:h-full bg-[#E8ECEF] relative flex flex-col border-b md:border-b-0 md:border-r border-border">
                        {/* Main Preview Center Stage */}
                        <div className="flex-1 relative p-4 md:p-8 flex items-center justify-center overflow-hidden min-h-0">
                            {activeFile?.previewUrl ? (
                                <img
                                    src={activeFile.previewUrl}
                                    alt="Preview"
                                    className="w-full h-full object-contain pointer-events-none drop-shadow-sm"
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center text-muted-foreground h-full border-2 border-dashed border-border/50 rounded-xl w-full">
                                    <Icon name="image" size={48} className="mb-4 opacity-20" />
                                    <p>No preview available</p>
                                </div>
                            )}
                        </div>

                        {/* AuraFile Carousel (Thumbnail Strip) */}
                        {isBatch && (
                            <div className="h-20 bg-white/50 border-t border-border/10 p-2 shrink-0 flex items-center">
                                <button onClick={handlePrevious} className="h-full px-2 text-slate-400 hover:text-slate-700 transition-colors shrink-0 outline-none">
                                    <Icon name="chevron-left" size={20} />
                                </button>

                                <div className="flex-1 flex gap-2 md:gap-3 overflow-x-auto hide-scrollbar px-2 snap-x snap-mandatory h-full pb-1 items-center justify-center">
                                    {files.map((file, idx) => {
                                        const isActive = idx === activeIndex;
                                        return (
                                            <button
                                                key={file.id}
                                                onClick={() => setActiveIndex(idx)}
                                                className={`relative h-12 w-12 rounded-lg overflow-hidden shrink-0 snap-start transition-all ${isActive ? 'ring-2 ring-primary ring-offset-1 scale-95 shadow-sm' : 'opacity-50 hover:opacity-100 hover:scale-95'}`}
                                            >
                                                <img src={file.previewUrl} alt="thumb" className="w-full h-full object-cover" />
                                            </button>
                                        );
                                    })}
                                </div>

                                <button onClick={handleNext} className="h-full px-2 text-slate-400 hover:text-slate-700 transition-colors shrink-0 outline-none">
                                    <Icon name="chevron-right" size={20} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Right Sidebar: 45% Scrollable */}
                    <div className="w-full md:w-[45%] h-full flex flex-col bg-white">

                        {/* Scrollable Tool Options */}
                        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                            {children}
                        </div>

                        {/* Sticky Footer Action */}
                        <div className="shrink-0 p-6 md:p-8 bg-white z-10 pt-2">
                            <Button
                                onClick={onPrimaryAction}
                                disabled={isProcessing}
                                style={{ backgroundColor: '#0081C9' }}
                                className="w-full h-12 text-base font-semibold text-white hover:opacity-90 shadow-md shadow-blue-500/10 rounded-lg transition-all"
                            >
                                {isProcessing ? (
                                    <>
                                        <Icon name="loader-2" size={20} className="animate-spin mr-2" />
                                        Processing...
                                    </>
                                ) : (
                                    primaryActionText
                                )}
                            </Button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}
