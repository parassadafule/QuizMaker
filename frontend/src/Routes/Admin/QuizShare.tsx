import { useSearchParams } from 'react-router-dom';

export default function QuizShare() {
  const [searchParams] = useSearchParams();
  const shareCode = searchParams.get('shareCode');
  
  if (!shareCode) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <h1 className="text-2xl font-semibold text-red-900 mb-2">Error</h1>
          <p className="text-red-700">Invalid or missing share code.</p>
        </div>
      </div>
    );
  }

  const shareLink = `${window.location.origin}/quiz/${shareCode}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900 mb-6">Share Quiz</h1>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Share Link</label>
              <div className="flex gap-2">
                <input type="text" value={shareLink} readOnly className="flex-1 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50"/>
                <button onClick={() => copyToClipboard(shareLink)} className="rounded-xl bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700">
                  Copy
                </button>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-medium text-slate-900 mb-2">Share Options</h2>
              <div className="space-y-2">
                <button className="w-full text-left rounded-xl border border-slate-200 bg-white p-4 hover:bg-slate-50">
                  Share on WhatsApp
                </button>
                <button className="w-full text-left rounded-xl border border-slate-200 bg-white p-4 hover:bg-slate-50">
                  Share via Email
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}