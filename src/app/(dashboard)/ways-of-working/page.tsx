import { WebView } from "@/components/shared/webview";

export const dynamic = "force-dynamic";

export default function WaysOfWorkingPage() {
  return (
    <div className="h-full w-full flex flex-col p-4 animate-in fade-in duration-700">
      <div className="flex-1 rounded-3xl overflow-hidden border border-slate-200 shadow-2xl shadow-slate-200/50 bg-white">
        <WebView 
          url="https://portal-my-way.lovable.app" 
          title="Ways of Working" 
        />
      </div>
    </div>
  );
}
