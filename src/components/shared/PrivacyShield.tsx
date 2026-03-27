import React from 'react';
import { Icon } from '@/components/ui/Icon';

export function PrivacyShield() {
    return (
        <div className="flex items-center justify-between text-[11px] bg-slate-50 border border-slate-200 rounded-md px-3 py-2 w-full shadow-sm">
            <div className="flex items-center gap-1.5" title="Secure & Live">
                <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </div>
            </div>
            
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-slate-500" title="Data Uploaded: 0 KB">
                    <Icon name="upload-cloud" size={12} className="text-slate-400" />
                    <span className="font-bold font-mono text-slate-700">0 KB</span>
                </div>
                <div className="w-px h-3 bg-slate-300"></div>
                <div className="flex items-center gap-1.5 text-slate-500" title="Processing in Local Browser RAM">
                    <Icon name="cpu" size={12} className="text-[#0081C9]" />
                    <span className="font-bold text-[#0081C9]">Local RAM</span>
                </div>
            </div>
            
            <div className="group relative flex items-center justify-center cursor-help">
                <Icon name="info" size={14} className="text-slate-400 hover:text-slate-800 transition-colors" />
                
                <div className="absolute bottom-full mb-2 right-0 w-60 bg-slate-800 text-white text-xs rounded-xl p-3 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none shadow-xl z-50 transform scale-95 group-hover:scale-100 origin-bottom-right">
                    <div className="font-semibold mb-1.5 flex items-center gap-2">
                        <Icon name="shield" size={14} className="text-green-400" />
                        100% Client-Side
                    </div>
                    <p className="text-slate-300 leading-relaxed text-[10px]">
                        AuraFile uses WebAssembly to process files entirely on your device. Your original files never reach our servers, guaranteeing absolute privacy.
                    </p>
                    <div className="absolute top-full right-1 -mt-px border-[6px] border-transparent border-t-slate-800"></div>
                </div>
            </div>
        </div>
    );
}
