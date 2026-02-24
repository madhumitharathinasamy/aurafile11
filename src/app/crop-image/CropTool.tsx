"use client";

import React, { useState, useRef, useEffect } from "react";
import ReactCrop, {
    centerCrop,
    makeAspectCrop,
    Crop,
    PixelCrop,
    convertToPixelCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { ImageUploader } from "@/components/tools/ImageUploader";
import { ToolModal } from "@/components/modal/ToolModal";
import { Icon } from "@/components/ui/Icon";
import { toast } from "sonner";
import { useFileUpload } from "@/hooks/useFileUpload";

type AspectRatio = {
    label: string;
    value: number | undefined;
    icon?: string;
};

const ASPECT_RATIOS: AspectRatio[] = [
    { label: "Free", value: undefined, icon: "minimize" },
    { label: "Original", value: 0, icon: "image" },
    { label: "Square (1:1)", value: 1, icon: "square" },
    { label: "4:3", value: 4 / 3 },
    { label: "16:9", value: 16 / 9 },
    { label: "3:2", value: 3 / 2 },
    { label: "Story", value: 9 / 16 },
    { label: "Portrait", value: 4 / 5 },
];

export default function CropTool() {
    const {
        files,
        activeIndex,
        setActiveIndex,
        activeFile,
        addFiles,
        clearAll,
    } = useFileUpload([]);

    const imgRef = useRef<HTMLImageElement>(null);

    // Crop State
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();

    // Settings
    const [aspect, setAspect] = useState<number | undefined>(undefined);
    const [selectedRatioLabel, setSelectedRatioLabel] = useState<string>("Free");
    const [scale, setScale] = useState({ x: 1, y: 1 });
    const [rotate, setRotate] = useState(0);
    const [flipH, setFlipH] = useState(false);
    const [flipV, setFlipV] = useState(false);
    const [isCircular, setIsCircular] = useState(false);
    const [showGrid, setShowGrid] = useState(true);

    const [isProcessing, setIsProcessing] = useState(false);

    // Local inputs mapping
    const [widthInput, setWidthInput] = useState("");
    const [heightInput, setHeightInput] = useState("");
    const [isInputActive, setIsInputActive] = useState(false);

    useEffect(() => {
        if (!isInputActive && completedCrop && scale.x > 0 && scale.y > 0) {
            setWidthInput(Math.round(completedCrop.width * scale.x).toString());
            setHeightInput(Math.round(completedCrop.height * scale.y).toString());
        }
    }, [completedCrop, scale, isInputActive]);

    const handleUpload = (uploadedFiles: File[]) => {
        if (files.length > 0) {
            toast.error("Crop tool only supports one image at a time.");
            return;
        }
        addFiles([uploadedFiles[0]]);

        // Reset crop settings on new upload
        setCrop(undefined);
        setCompletedCrop(undefined);
        setRotate(0);
        setFlipH(false);
        setFlipV(false);
        setAspect(undefined);
        setSelectedRatioLabel("Free");
    };

    const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const { width, height, naturalWidth, naturalHeight } = e.currentTarget;
        const sX = naturalWidth / width;
        const sY = naturalHeight / height;
        setScale({ x: sX, y: sY });

        const initialCrop = centerCrop(
            makeAspectCrop(
                { unit: 'px', width: width * 0.9 },
                aspect || naturalWidth / naturalHeight,
                width,
                height
            ),
            width,
            height
        );
        setCrop(initialCrop);
        setCompletedCrop(initialCrop);
    };

    const handleAspectRatioChange = (ratio: AspectRatio) => {
        setSelectedRatioLabel(ratio.label);
        if (ratio.label === "Original" && imgRef.current) {
            const { width, height, naturalWidth, naturalHeight } = imgRef.current;
            const val = naturalWidth / naturalHeight;
            setAspect(val);
            const newCrop: Crop = { unit: 'px', x: 0, y: 0, width, height };
            setCrop(newCrop);
            setCompletedCrop(convertToPixelCrop(newCrop, width, height));
        } else {
            setAspect(ratio.value);
            if (ratio.value && imgRef.current && completedCrop) {
                const { width, height } = imgRef.current;
                const newCrop = centerCrop(
                    makeAspectCrop(
                        { unit: 'px', width: completedCrop.width || width * 0.9 },
                        ratio.value,
                        width,
                        height
                    ),
                    width,
                    height
                );
                setCrop(newCrop);
                setCompletedCrop(newCrop);
            }
        }
    };

    const handleDimensionChange = (type: 'width' | 'height', valueStr: string) => {
        if (type === 'width') setWidthInput(valueStr);
        else setHeightInput(valueStr);

        const value = parseFloat(valueStr);
        if (isNaN(value) || !imgRef.current || !crop) return;

        const displayValue = type === 'width' ? value / scale.x : value / scale.y;
        const newCrop = { ...crop, unit: 'px' as const };

        if (type === 'width') {
            newCrop.width = displayValue;
            if (aspect) newCrop.height = newCrop.width / aspect;
        } else {
            newCrop.height = displayValue;
            if (aspect) newCrop.width = newCrop.height * aspect;
        }

        const { width: imgW, height: imgH } = imgRef.current;
        const currentCenter = { x: crop.x + crop.width / 2, y: crop.y + crop.height / 2 };

        newCrop.x = Math.max(0, Math.min(currentCenter.x - newCrop.width / 2, imgW - newCrop.width));
        newCrop.y = Math.max(0, Math.min(currentCenter.y - newCrop.height / 2, imgH - newCrop.height));

        setCrop(newCrop);
        setCompletedCrop(convertToPixelCrop(newCrop, imgW, imgH));
    };

    const canvasUtils = async (
        image: HTMLImageElement,
        crop: PixelCrop,
        rotation = 0,
        flip = { horizontal: false, vertical: false }
    ): Promise<string | null> => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        const radians = (rotation * Math.PI) / 180;
        const pixelRatio = window.devicePixelRatio || 1;

        canvas.width = Math.floor(crop.width * scaleX * pixelRatio);
        canvas.height = Math.floor(crop.height * scaleY * pixelRatio);

        ctx.scale(pixelRatio, pixelRatio);
        ctx.imageSmoothingQuality = 'high';
        ctx.save();

        const cropX = crop.x * scaleX;
        const cropY = crop.y * scaleY;

        ctx.translate(-cropX, -cropY);
        ctx.translate(image.naturalWidth / 2, image.naturalHeight / 2);
        ctx.rotate(radians);
        ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
        ctx.translate(-image.naturalWidth / 2, -image.naturalHeight / 2);
        ctx.drawImage(image, 0, 0);
        ctx.restore();

        if (isCircular) {
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            const tCtx = tempCanvas.getContext('2d');

            if (tCtx) {
                tCtx.drawImage(canvas, 0, 0);
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.beginPath();
                ctx.ellipse(
                    canvas.width / 2, canvas.height / 2,
                    canvas.width / 2, canvas.height / 2,
                    0, 0, 2 * Math.PI
                );
                ctx.closePath();
                ctx.clip();
                ctx.drawImage(tempCanvas, 0, 0);
            }
        }

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                if (!blob) resolve(null);
                else resolve(URL.createObjectURL(blob));
            }, activeFile?.file.type || 'image/jpeg');
        });
    };

    const performCrop = async () => {
        if (!completedCrop || !imgRef.current || !activeFile) return;
        setIsProcessing(true);

        try {
            const url = await canvasUtils(imgRef.current, completedCrop, rotate, { horizontal: flipH, vertical: flipV });
            if (url) {
                const link = document.createElement("a");
                link.href = url;
                link.download = `cropped-${activeFile.file.name}`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                toast.success("Image cropped and downloaded!");

                setTimeout(() => URL.revokeObjectURL(url), 1000);
            } else {
                throw new Error("Canvas generation failed");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to crop image.");
        } finally {
            setIsProcessing(false);
        }
    };

    // Override the custom Left Stage preview to use ReactCrop directly
    const customPreview = activeFile ? (
        <div className="w-full h-full flex flex-col items-center justify-center p-4">
            <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspect}
                circularCrop={isCircular}
                ruleOfThirds={showGrid}
                className="max-h-[60vh] md:max-h-[80%]"
            >
                <img
                    ref={imgRef}
                    src={activeFile.previewUrl}
                    alt="Edit"
                    onLoad={onImageLoad}
                    style={{
                        transform: `rotate(${rotate}deg) scale(${flipH ? -1 : 1}, ${flipV ? -1 : 1})`,
                        maxWidth: '100%',
                        maxHeight: '60vh',
                        transition: 'transform 0.3s ease',
                        objectFit: 'contain'
                    }}
                    className="drop-shadow-sm pointer-events-none"
                />
            </ReactCrop>

            {/* Quick Stats Overlay */}
            <div className="absolute bottom-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm text-xs font-semibold text-slate-700 flex items-center gap-3 z-10">
                <span>{completedCrop ? `${Math.round(completedCrop.width * scale.x)} x ${Math.round(completedCrop.height * scale.y)} px` : ''}</span>
                <span className="w-px h-3 bg-slate-300" />
                <span><Icon name="rotate-cw" size={12} className="inline mr-1" />{rotate}°</span>
                <span className="w-px h-3 bg-slate-300" />
                <button onClick={() => setShowGrid(!showGrid)} className={`hover:text-[#0081C9] transition-colors ${showGrid ? 'text-[#0081C9]' : ''}`}>
                    <Icon name="grid" size={14} />
                </button>
            </div>
        </div>
    ) : null;

    return (
        <div className="w-full space-y-8">
            {files.length === 0 && (
                <div className="mt-6 w-full max-w-7xl mx-auto">
                    <div className="rounded-xl border border-border bg-white shadow-xl p-4 md:p-8">
                        <ImageUploader onUpload={handleUpload} />
                    </div>
                </div>
            )}

            <ToolModal
                isOpen={files.length > 0}
                onClose={clearAll}
                title="Crop Image"
                files={files}
                activeIndex={activeIndex}
                setActiveIndex={setActiveIndex}
                onPrimaryAction={performCrop}
                primaryActionText={
                    <span className="flex items-center justify-center gap-2">
                        <Icon name="crop" size={18} />
                        Apply Crop
                    </span>
                }
                isProcessing={isProcessing}
                customPreview={customPreview}
            >
                {/* TOOL SPECIFIC SIDEBAR CONTENT */}
                {activeFile && (
                    <div className="space-y-8">
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-slate-800 font-sans">Crop Options</h2>
                                <button onClick={() => { setRotate(0); setFlipH(false); setFlipV(false); setAspect(undefined); setSelectedRatioLabel("Free"); setIsCircular(false); if (imgRef.current) onImageLoad({ currentTarget: imgRef.current } as any); }} className="text-xs font-semibold text-[#0081C9] hover:underline">
                                    Reset
                                </button>
                            </div>

                            {/* Dimensions */}
                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 block mb-1">Dimensions</label>
                                    <button
                                        onClick={() => {
                                            if (aspect) { setAspect(undefined); setSelectedRatioLabel("Free"); }
                                            else if (completedCrop && completedCrop.height > 0) { setAspect(completedCrop.width / completedCrop.height); setSelectedRatioLabel("Custom"); }
                                        }}
                                        className={`text-xs flex items-center gap-1 transition-colors ${aspect ? "text-[#0081C9] font-medium" : "text-slate-500"}`}
                                    >
                                        <Icon name={aspect ? "lock" : "unlock"} size={12} />
                                        {aspect ? "Locked" : "Unlocked"}
                                    </button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 space-y-1 bg-[#E8ECEF] p-3 rounded-xl border border-transparent focus-within:border-[#0081C9] focus-within:bg-white transition-all">
                                        <span className="text-[10px] text-slate-500 uppercase font-semibold">Width (px)</span>
                                        <input
                                            type="number"
                                            value={widthInput}
                                            onFocus={() => setIsInputActive(true)}
                                            onBlur={() => setIsInputActive(false)}
                                            onChange={(e) => handleDimensionChange('width', e.target.value)}
                                            className="w-full bg-transparent text-sm font-semibold text-slate-800 outline-none"
                                        />
                                    </div>
                                    <div className="text-slate-300">
                                        <Icon name="x" size={16} />
                                    </div>
                                    <div className="flex-1 space-y-1 bg-[#E8ECEF] p-3 rounded-xl border border-transparent focus-within:border-[#0081C9] focus-within:bg-white transition-all">
                                        <span className="text-[10px] text-slate-500 uppercase font-semibold">Height (px)</span>
                                        <input
                                            type="number"
                                            value={heightInput}
                                            onFocus={() => setIsInputActive(true)}
                                            onBlur={() => setIsInputActive(false)}
                                            onChange={(e) => handleDimensionChange('height', e.target.value)}
                                            className="w-full bg-transparent text-sm font-semibold text-slate-800 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Aspect Ratios Grid */}
                            <div className="space-y-3 mb-6">
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 block mb-1">Aspect Ratio</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {ASPECT_RATIOS.map((ratio) => (
                                        <button
                                            key={ratio.label}
                                            onClick={() => handleAspectRatioChange(ratio)}
                                            className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all gap-1 h-16 ${selectedRatioLabel === ratio.label
                                                ? "bg-[#0081C9]/5 border-[#0081C9] text-[#0081C9] ring-1 ring-[#0081C9]/20 shadow-sm"
                                                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                                                }`}
                                        >
                                            <div className="opacity-70 mt-1">
                                                {ratio.icon === 'square' && <div className="w-4 h-4 border-2 border-current rounded-sm" />}
                                                {ratio.icon === 'minimize' && <Icon name="minimize" size={16} />}
                                                {ratio.icon === 'image' && <Icon name="image" size={16} />}
                                                {!ratio.icon && (
                                                    <div
                                                        className="border-2 border-current rounded-sm"
                                                        style={{
                                                            width: ratio.value && ratio.value > 1 ? '16px' : '10px',
                                                            height: ratio.value && ratio.value > 1 ? '10px' : '16px'
                                                        }}
                                                    />
                                                )}
                                            </div>
                                            <span className="text-[10px] font-semibold truncate w-full text-center tracking-tight">{ratio.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Rotation & Transforms */}
                            <div className="space-y-3 mb-6">
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 block mb-1">Rotation & Flip</label>

                                <div className="bg-[#E8ECEF] p-4 rounded-xl space-y-4 shadow-sm border border-slate-200/50">
                                    <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                                        <span>Straighten</span>
                                        <span>{rotate}°</span>
                                    </div>

                                    <div className="relative w-full h-2 rounded-full cursor-pointer bg-slate-300">
                                        <div
                                            className="absolute top-0 left-1/2 h-full bg-[#0081C9] pointer-events-none"
                                            style={{
                                                width: `${Math.abs(rotate / 45 * 50)}%`,
                                                transform: rotate < 0 ? 'translateX(-100%)' : 'none',
                                                borderRadius: rotate < 0 ? '9999px 0 0 9999px' : '0 9999px 9999px 0'
                                            }}
                                        ></div>
                                        <input
                                            type="range"
                                            min="-45"
                                            max="45"
                                            value={rotate > 45 || rotate < -45 ? 0 : rotate}
                                            onChange={(e) => setRotate(Number(e.target.value))}
                                            className="absolute top-0 left-0 w-full opacity-0 cursor-pointer z-10 h-full"
                                        />
                                        {/* Center tick */}
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-3 bg-white/50 z-0"></div>
                                    </div>

                                    <div className="flex gap-2 justify-center pt-2 border-t border-slate-300/50">
                                        <button onClick={() => setRotate(r => r - 90)} className="flex-1 flex items-center justify-center py-1.5 rounded-lg hover:bg-white/50 text-slate-600 transition-colors" title="Rotate Left">
                                            <Icon name="rotate-ccw" size={16} />
                                        </button>
                                        <div className="w-px h-6 bg-slate-300 mx-1 self-center" />
                                        <button onClick={() => setRotate(r => r + 90)} className="flex-1 flex items-center justify-center py-1.5 rounded-lg hover:bg-white/50 text-slate-600 transition-colors" title="Rotate Right">
                                            <Icon name="rotate-cw" size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    <button
                                        onClick={() => setFlipH(!flipH)}
                                        className={`flex items-center justify-center gap-2 h-11 rounded-lg border transition-all ${flipH ? "bg-[#0081C9]/5 border-[#0081C9]/50 text-[#0081C9] ring-1 ring-[#0081C9]/20" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                                    >
                                        <Icon name="flip-horizontal" size={16} />
                                        <span className="text-sm font-semibold">Flip H</span>
                                    </button>
                                    <button
                                        onClick={() => setFlipV(!flipV)}
                                        className={`flex items-center justify-center gap-2 h-11 rounded-lg border transition-all ${flipV ? "bg-[#0081C9]/5 border-[#0081C9]/50 text-[#0081C9] ring-1 ring-[#0081C9]/20" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                                    >
                                        <Icon name="flip-vertical" size={16} />
                                        <span className="text-sm font-semibold">Flip V</span>
                                    </button>
                                </div>
                            </div>

                            {/* Shape */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 block mb-1">Shape Mask</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => { setIsCircular(false); setAspect(undefined); setSelectedRatioLabel("Free"); }}
                                        className={`flex items-center justify-center gap-2 h-11 rounded-lg border transition-all ${!isCircular ? "bg-[#0081C9]/5 border-[#0081C9]/50 text-[#0081C9] ring-1 ring-[#0081C9]/20 shadow-sm" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                                    >
                                        <div className="w-3 h-3 border-2 border-current rounded-[2px]" />
                                        <span className="text-sm font-semibold">Rectangle</span>
                                    </button>
                                    <button
                                        onClick={() => setIsCircular(true)}
                                        className={`flex items-center justify-center gap-2 h-11 rounded-lg border transition-all ${isCircular ? "bg-[#0081C9]/5 border-[#0081C9]/50 text-[#0081C9] ring-1 ring-[#0081C9]/20 shadow-sm" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                                    >
                                        <div className="w-3.5 h-3.5 border-2 border-current rounded-full" />
                                        <span className="text-sm font-semibold">Oval</span>
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                )}
            </ToolModal>
        </div>
    );
}
