import { WebView } from "@/components/shared/webview";

export const dynamic = "force-dynamic";

export default function WaysOfWorkingPage() {
  return (
    <div className="h-full w-full flex flex-col p-6 animate-in fade-in duration-700">
      <div className="mb-8">
        <h1 className="text-3xl font-black italic tracking-tighter text-slate-800 uppercase">
          Ways of Working
        </h1>
        <p className="text-sm text-slate-500 font-medium tracking-tight">
          Portal de processos e diretrizes internas da Venice.
        </p>
      </div>
      
      <div className="flex-1 min-h-[600px] rounded-3xl overflow-hidden border border-slate-200 shadow-2xl shadow-slate-200/50 bg-white">
        <WebView 
          url="https://1d39751b-e457-4f9a-bec5-fd922682dcf7.lovable.app" 
          title="Ways of Working" 
        />
      </div>
    </div>
  );
}
