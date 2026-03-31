import { WebView } from "@/components/shared/webview";

export default function ConeLocaviaPage() {
  return (
    <div className="h-full animate-in fade-in duration-500">
      <WebView url="https://locavia-dashboard.vercel.app" title="Venice | Cone Locavia" />
    </div>
  );
}
