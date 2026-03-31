import { WebView } from "@/components/shared/webview";

export default function WaysOfWorkingPage() {
  return (
    <div className="h-full animate-in fade-in duration-500">
      <WebView url="/wow/index.html" title="Venice | Ways of Working" />
    </div>
  );
}
