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
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { toast } from "sonner";

// --- Types ---
type AspectRatio = {
    label: string;
    value: number | undefined;
    icon?: string;
};

const ASPECT_RATIOS: AspectRatio[] = [
    { label: "Free", value: undefined, icon: "minimize" },
    { label: "Original", value: 0, icon: "image" }, // Value 0 as sentinel for original
    { label: "Square (1:1)", value: 1, icon: "square" },
    { label: "4:3", value: 4 / 3 },
    { label: "16:9", value: 16 / 9 },
    { label: "3:2", value: 3 / 2 },
    { label: "Story (9:16)", value: 9 / 16 },
    { label: "YouTube (16:9)", value: 16 / 9 },
    { label: "Portrait (4:5)", value: 4 / 5 },
];

export default function CropTool() {
    const [imgSrc, setImgSrc] = useState<string>('');
    const [originalFile, setOriginalFile] = useState<File | null>(null);
    const imgRef = useRef<HTMLImageElement>(null);

    // Crop State
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();

    // Settings
    const [aspect, setAspect] = useState<number | undefined>(undefined);
    const [selectedRatioLabel, setSelectedRatioLabel] = useState<string>("Free");

    // Scale for inputs (Natural / Displayed)
    const [scale, setScale] = useState({ x: 1, y: 1 });

    // Transforms
    const [rotate, setRotate] = useState(0); // Degrees
    const [flipH, setFlipH] = useState(false);
    const [flipV, setFlipV] = useState(false);

    // Tools
    const [isCircular, setIsCircular] = useState(false);
    const [showGrid, setShowGrid] = useState(true);

    // Result
    const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);

    // Clean up URLs
    useEffect(() => {
        return () => {
            // imgSrc is base64, no need to revoke
            if (croppedImageUrl) URL.revokeObjectURL(croppedImageUrl);
        };
    }, [croppedImageUrl]);

    // Local input state to prevent jumping/formatting issues while typing
    const [widthInput, setWidthInput] = useState("");
    const [heightInput, setHeightInput] = useState("");
    const [isInputActive, setIsInputActive] = useState(false);

    // Sync local inputs when crop changes externally (and user is not typing)
    useEffect(() => {
        if (!isInputActive && completedCrop && scale.x > 0 && scale.y > 0) {
            setWidthInput(Math.round(completedCrop.width * scale.x).toString());
            setHeightInput(Math.round(completedCrop.height * scale.y).toString());
        }
    }, [completedCrop, scale, isInputActive]);

    const onInputFocus = () => setIsInputActive(true);
    const onInputBlur = () => setIsInputActive(false);

    const handleManualInputChange = (type: 'width' | 'height', valueStr: string) => {
        if (type === 'width') setWidthInput(valueStr);
        else setHeightInput(valueStr);

        const val = parseFloat(valueStr);
        if (!isNaN(val)) {
            handleDimensionChange(type, val);
        }
    };

    // Toggle Aspect Lock
    const toggleAspectLock = () => {
        if (aspect) {
            // Unlock
            setAspect(undefined);
            setSelectedRatioLabel("Free");
        } else {
            // Lock to current
            if (completedCrop && completedCrop.height > 0) {
                const currentAspect = completedCrop.width / completedCrop.height;
                setAspect(currentAspect);
                setSelectedRatioLabel("Custom");
            }
        }
    };

    const onSelectFile = (files: File[]) => {
        if (files && files.length > 0) {
            setCrop(undefined);
            setCompletedCrop(undefined);
            setCroppedImageUrl(null);
            setRotate(0);
            setFlipH(false);
            setFlipV(false);
            setOriginalFile(files[0]);

            const reader = new FileReader();
            reader.addEventListener("load", () =>
                setImgSrc(reader.result?.toString() || "")
            );
            reader.readAsDataURL(files[0]);
        }
    };

    const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const { width, height, naturalWidth, naturalHeight } = e.currentTarget;

        // Calculate Scale
        const sX = naturalWidth / width;
        const sY = naturalHeight / height;
        setScale({ x: sX, y: sY });

        // Default to whole image or centered crop
        const initialCrop = centerCrop(
            makeAspectCrop(
                {
                    unit: 'px',
                    width: width * 0.9,
                },
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

            // For "Original", we want to reset to the full image coverage
            const newCrop: Crop = {
                unit: 'px',
                x: 0,
                y: 0,
                width: width,
                height: height,
            };
            setCrop(newCrop);
            setCompletedCrop(convertToPixelCrop(newCrop, width, height));
        } else {
            setAspect(ratio.value);
            if (ratio.value) updateCropForAspect(ratio.value);
        }
    };

    const updateCropForAspect = (newAspect: number) => {
        if (imgRef.current && completedCrop) {
            const { width, height } = imgRef.current;
            const newCrop = centerCrop(
                makeAspectCrop(
                    { unit: 'px', width: completedCrop.width || width * 0.9 },
                    newAspect,
                    width,
                    height
                ),
                width,
                height
            );
            setCrop(newCrop);
            setCompletedCrop(newCrop);
        }
    };

    // Manual Input Handlers
    const handleDimensionChange = (type: 'width' | 'height', value: number) => {
        if (!imgRef.current || !crop) return;

        // "value" is the desired NATURAL size.
        // We need to convert this to DISPLAY size.
        const displayValue = type === 'width' ? value / scale.x : value / scale.y;

        // We need to update the crop state.
        // Let's create a new crop object.
        const newCrop = { ...crop, unit: 'px' as const };

        if (type === 'width') {
            newCrop.width = displayValue;
            if (aspect) {
                newCrop.height = newCrop.width / aspect;
            }
        } else {
            newCrop.height = displayValue;
            if (aspect) {
                newCrop.width = newCrop.height * aspect;
            }
        }

        // Optional: Re-center if it goes out of bounds? 
        // Or properly constrain it? ReactCrop might autosnap if we pass invalid.
        // Ideally we should center it around the current center.

        const { width: imgW, height: imgH } = imgRef.current;
        const currentCenter = {
            x: crop.x + crop.width / 2,
            y: crop.y + crop.height / 2
        };

        newCrop.x = currentCenter.x - newCrop.width / 2;
        newCrop.y = currentCenter.y - newCrop.height / 2;

        // Constraints
        if (newCrop.x < 0) newCrop.x = 0;
        if (newCrop.y < 0) newCrop.y = 0;
        if (newCrop.x + newCrop.width > imgW) newCrop.x = imgW - newCrop.width;
        if (newCrop.y + newCrop.height > imgH) newCrop.y = imgH - newCrop.height;

        setCrop(newCrop);
        setCompletedCrop(convertToPixelCrop(newCrop, imgW, imgH));
    };

    // Advanced Transform Helper
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

        // Move origin to center of crop
        ctx.translate(-cropX, -cropY);

        // Move origin to center of image
        ctx.translate(image.naturalWidth / 2, image.naturalHeight / 2);

        // Rotate
        ctx.rotate(radians);

        // Flip
        ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);

        // Draw image centered
        ctx.translate(-image.naturalWidth / 2, -image.naturalHeight / 2);

        ctx.drawImage(image, 0, 0);

        ctx.restore();

        if (isCircular) {
            // Reset transform to work in canvas pixel space (physical pixels)
            ctx.setTransform(1, 0, 0, 1, 0, 0);

            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            const tCtx = tempCanvas.getContext('2d');

            if (tCtx) {
                // Draw current canvas content to temp (already scaled)
                tCtx.drawImage(canvas, 0, 0);

                // Clear and mask
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.beginPath();
                // canvas.width/height include pixelRatio, so this is correct for physical pixels
                // Use ellipse instead of arc to support non-square (oval) shapes
                ctx.ellipse(
                    canvas.width / 2,
                    canvas.height / 2,
                    canvas.width / 2,
                    canvas.height / 2,
                    0,
                    0,
                    2 * Math.PI
                );
                ctx.closePath();
                ctx.clip();

                // Draw back at 1:1 since we reset transform
                ctx.drawImage(tempCanvas, 0, 0);
            }
        }

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                if (!blob) resolve(null);
                else resolve(URL.createObjectURL(blob));
            }, originalFile?.type || 'image/jpeg');
        });
    }

    const performCrop = async () => {
        if (completedCrop && imgRef.current) {
            const url = await canvasUtils(
                imgRef.current,
                completedCrop,
                rotate,
                { horizontal: flipH, vertical: flipV }
            );
            if (url) {
                if (croppedImageUrl) URL.revokeObjectURL(croppedImageUrl);
                setCroppedImageUrl(url);
                toast.success("Image cropped!");
            } else {
                toast.error("Failed to crop.");
            }
        }
    };

    const reset = () => {
        setRotate(0);
        setFlipH(false);
        setFlipV(false);
        setAspect(undefined);
        setSelectedRatioLabel("Free");
        setIsCircular(false);
        if (imgRef.current) {
            onImageLoad({ currentTarget: imgRef.current } as any);
        }
    };

    const download = () => {
        if (croppedImageUrl) {
            const link = document.createElement("a");
            link.href = croppedImageUrl;
            link.download = `cropped-${originalFile?.name || 'edited.jpg'}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const removeImage = () => {
        setImgSrc('');
        setOriginalFile(null);
        setCrop(undefined);
        setCompletedCrop(undefined);
        setCroppedImageUrl(null);
        setRotate(0);
        setFlipH(false);
        setFlipV(false);
        setAspect(undefined);
        setSelectedRatioLabel("Free");
        setIsCircular(false);
        if (croppedImageUrl) URL.revokeObjectURL(croppedImageUrl);
    };

    return (
        <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto">
            {!imgSrc ? (
                <div className="mx-auto max-w-3xl w-full">
                    <ImageUploader onUpload={onSelectFile} />
                </div>
            ) : (
                <div className="grid gap-5 md:grid-cols-[1fr,300px] lg:gap-8 lg:grid-cols-[1fr,340px] w-full">
                    {/* Left: Editor Canvas */}
                    <div className="flex flex-col gap-4 min-w-0 h-full">
                        <div className="bg-surface/50 border border-border rounded-xl p-4 md:p-8 flex items-center justify-center min-h-[40vh] md:min-h-[500px] overflow-hidden relative group h-full">
                            <div className="relative shadow-2xl shadow-black/5">
                                <ReactCrop
                                    crop={crop}
                                    onChange={(_, percentCrop) => setCrop(percentCrop)}
                                    onComplete={(c) => setCompletedCrop(c)}
                                    aspect={aspect}
                                    circularCrop={isCircular}
                                    ruleOfThirds={showGrid}
                                    className="max-h-[70vh]"
                                >
                                    <img
                                        ref={imgRef}
                                        src={imgSrc}
                                        alt="Edit"
                                        onLoad={onImageLoad}
                                        style={{
                                            transform: `rotate(${rotate}deg) scale(${flipH ? -1 : 1}, ${flipV ? -1 : 1})`,
                                            maxWidth: '100%',
                                            maxHeight: '70vh',
                                            transition: 'transform 0.3s ease'
                                        }}
                                        className="bg-white/5"
                                    />
                                </ReactCrop>
                            </div>
                        </div>

                        {/* Quick View Controls */}
                        <div className="flex items-center justify-between px-4 py-2 bg-card border border-border rounded-lg text-sm text-muted-foreground">
                            <div className="flex items-center gap-4">
                                <span>{completedCrop ? `${Math.round(completedCrop.width * scale.x)} x ${Math.round(completedCrop.height * scale.y)} px` : ''}</span>
                                <span className="w-px h-4 bg-border" />
                                <span>{rotate}°</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setShowGrid(!showGrid)} className={`p-1.5 rounded hover:bg-secondary ${showGrid ? 'text-primary' : 'text-muted-foreground'}`}>
                                    <Icon name="grid" size={18} />
                                </button>
                                <div className="w-px h-4 bg-border mx-1" />
                                <button
                                    onClick={removeImage}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-red-50 hover:text-red-500 text-muted-foreground transition-colors"
                                    title="Remove Image"
                                >
                                    <Icon name="trash-2" size={16} />
                                    <span className="text-xs font-medium">Remove</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right: Tools & Settings */}
                    <div className="space-y-6 flex flex-col h-full">
                        <div className="bg-card border border-border rounded-xl shadow-sm flex-1 flex flex-col min-h-0">
                            {/* Header */}
                            <div className="p-4 border-b border-border flex items-center justify-between bg-card z-10 rounded-t-xl shrink-0">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <Icon name="settings" size={18} className="text-primary" />
                                    Settings
                                </h3>
                                <div className="flex items-center gap-1">
                                    <Button variant="ghost" onClick={reset} className="h-8 text-xs text-muted-foreground hover:text-red-500">
                                        Reset
                                    </Button>
                                </div>
                            </div>

                            <div className="p-5 space-y-6 flex-1">

                                {/* 0. Dimensions */}
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Dimensions</label>
                                        <button
                                            onClick={toggleAspectLock}
                                            className={`text-xs flex items-center gap-1 transition-colors ${aspect ? "text-primary font-medium" : "text-muted-foreground"}`}
                                            title={aspect ? "Unlock Aspect Ratio" : "Lock Aspect Ratio"}
                                        >
                                            <Icon name={aspect ? "lock" : "unlock"} size={12} />
                                            {aspect ? "Locked" : "Unlocked"}
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-[1fr,auto,1fr] gap-2 items-end">
                                        <div className="space-y-1">
                                            <span className="text-[10px] text-muted-foreground uppercase">Width (px)</span>
                                            <input
                                                type="number"
                                                value={widthInput}
                                                onFocus={onInputFocus}
                                                onBlur={onInputBlur}
                                                onChange={(e) => handleManualInputChange('width', e.target.value)}
                                                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-mono"
                                            />
                                        </div>

                                        <div className="pb-2 text-muted-foreground/50">
                                            <Icon name={aspect ? "link" : "minus"} size={14} className={aspect ? "" : "rotate-90"} />
                                        </div>

                                        <div className="space-y-1">
                                            <span className="text-[10px] text-muted-foreground uppercase">Height (px)</span>
                                            <input
                                                type="number"
                                                value={heightInput}
                                                onFocus={onInputFocus}
                                                onBlur={onInputBlur}
                                                onChange={(e) => handleManualInputChange('height', e.target.value)}
                                                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-mono"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="h-px bg-border my-2" />

                                {/* 1. Aspect Ratio */}
                                <div className="space-y-3">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Aspect Ratio</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {ASPECT_RATIOS.map((ratio) => (
                                            <button
                                                key={ratio.label}
                                                onClick={() => handleAspectRatioChange(ratio)}
                                                className={`flex flex-col items-center justify-center p-2.5 rounded-lg border transition-all gap-1.5 ${selectedRatioLabel === ratio.label
                                                    ? "bg-primary/10 border-primary text-primary"
                                                    : "bg-background border-border text-foreground hover:bg-secondary hover:text-primary hover:border-border/80"
                                                    }`}
                                            >
                                                <div className="opacity-70">
                                                    {ratio.icon === 'square' && <div className="w-4 h-4 border-2 border-current rounded-sm" />}
                                                    {ratio.icon === 'minimize' && <Icon name="minimize" size={16} />}
                                                    {ratio.icon === 'image' && <Icon name="image" size={16} />}
                                                    {!ratio.icon && (
                                                        <div
                                                            className="border-2 border-current rounded-sm"
                                                            style={{
                                                                width: ratio.value && ratio.value > 1 ? '18px' : '12px',
                                                                height: ratio.value && ratio.value > 1 ? '12px' : '18px'
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                                <span className="text-[10px] sm:text-xs font-medium truncate w-full text-center">{ratio.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="h-px bg-border my-2" />

                                {/* 2. Transform */}
                                <div className="space-y-3">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Transform</label>

                                    {/* Rotate Slider */}
                                    <div className="bg-secondary/30 p-3 rounded-lg border border-border/50 space-y-3">
                                        <div className="flex justify-between items-center text-xs">
                                            <span>Straighten</span>
                                            <span className="font-mono text-muted-foreground">{rotate}°</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="-45"
                                            max="45"
                                            value={rotate > 45 || rotate < -45 ? 0 : rotate}
                                            onChange={(e) => setRotate(Number(e.target.value))}
                                            className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                                        />
                                        <div className="flex gap-2 justify-center pt-1">
                                            <button onClick={() => setRotate(r => r - 90)} className="p-2 rounded hover:bg-secondary text-muted-foreground hover:text-foreground" title="Rotate Left">
                                                <Icon name="rotate-ccw" size={18} />
                                            </button>
                                            <button onClick={() => setRotate(r => r + 90)} className="p-2 rounded hover:bg-secondary text-muted-foreground hover:text-foreground" title="Rotate Right">
                                                <Icon name="rotate-cw" size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Flip */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => setFlipH(!flipH)}
                                            className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${flipH ? "bg-primary/10 border-primary text-primary" : "bg-background border-border hover:bg-secondary hover:text-primary"
                                                }`}
                                        >
                                            <Icon name="flip-horizontal" size={18} />
                                            <span className="text-xs font-medium">Flip H</span>
                                        </button>
                                        <button
                                            onClick={() => setFlipV(!flipV)}
                                            className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${flipV ? "bg-primary/10 border-primary text-primary" : "bg-background border-border hover:bg-secondary hover:text-primary"
                                                }`}
                                        >
                                            <Icon name="flip-vertical" size={18} />
                                            <span className="text-xs font-medium">Flip V</span>
                                        </button>
                                    </div>
                                </div>

                                {/* 3. Shape */}
                                <div className="space-y-3">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Shape</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => {
                                                setIsCircular(false);
                                                // Optional: Reset to free or keep current aspect?
                                                // Common behavior: Switch to Free
                                                setAspect(undefined);
                                                setSelectedRatioLabel("Free");
                                            }}
                                            className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${!isCircular ? "bg-primary/10 border-primary text-primary" : "bg-background border-border hover:bg-secondary hover:text-primary"
                                                }`}
                                        >
                                            <div className="w-4 h-4 border-2 border-current rounded-sm" />
                                            <span className="text-xs font-medium">Rectangle</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsCircular(true);
                                            }}
                                            className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${isCircular ? "bg-primary/10 border-primary text-primary" : "bg-background border-border hover:bg-secondary hover:text-primary"
                                                }`}
                                        >
                                            <div className="w-4 h-4 border-2 border-current rounded-full" />
                                            <span className="text-xs font-medium">Oval</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="p-4 border-t border-border bg-card rounded-b-xl space-y-3">
                                {croppedImageUrl ? (
                                    <>
                                        <Button variant="primary" className="w-full h-12 text-base shadow-xl shadow-primary/20" onClick={download}>
                                            <Icon name="download" size={18} className="mr-2" />
                                            Download
                                        </Button>
                                        <Button variant="secondary" className="w-full" onClick={() => setCroppedImageUrl(null)}>
                                            Back to Editing
                                        </Button>
                                    </>
                                ) : (
                                    <Button variant="primary" className="w-full h-12 text-base shadow-xl shadow-primary/20" onClick={performCrop}>
                                        <Icon name="check" size={18} className="mr-2" />
                                        Apply Crop
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )
            }
            {/* Result Modal Overlay (Optional - currently using in-place state) */}
        </div >
    );
}
