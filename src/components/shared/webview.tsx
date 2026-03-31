"use client";

import { useState, useEffect } from "react";
import { Loader2, ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WebViewProps {
  url: string;
  title: string;
}

export function WebView({ url, title }: WebViewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const fullUrl = url.startsWith('/') ? `${baseUrl}${url}` : url;

  useEffect(() => {
    setIsLoading(true);
  }, [url]);

  return (
    <div className="flex flex-col h-full bg-slate-50/30 overflow-hidden relative">
      <div className="absolute top-4 right-4 z-20 flex gap-2">
        <Button 
          variant="secondary" 
          size="sm" 
          className="h-8 px-3 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200 shadow-sm text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-emerald-600 hover:bg-white"
          onClick={() => {
            const iframe = document.getElementById('web-frame') as HTMLIFrameElement;
            if (iframe) iframe.src = fullUrl;
          }}
        >
          <RefreshCw className="w-3 h-3 mr-2" />
          Recarregar
        </Button>
      </div>

      <div className="flex-1 relative">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-50/80 backdrop-blur-sm animate-in fade-in duration-500">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-xl flex items-center justify-center border border-slate-100">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              </div>
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 animate-pulse">
                  Conectando ao sistema...
                </p>
              </div>
            </div>
          </div>
        )}
        
        <iframe 
          id="web-frame"
          src={fullUrl} 
          className="w-full h-full border-0 bg-white shadow-inner"
          onLoad={() => setIsLoading(false)}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        />
      </div>
    </div>
  );
}
