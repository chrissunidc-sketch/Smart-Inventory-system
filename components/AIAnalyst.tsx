
import React, { useState } from 'react';
import { analyzeSalesData } from '../services/geminiService';
import { SaleRecord } from '../types';
import { translations, Language } from '../translations';

interface Props {
  data: SaleRecord[];
  lang: Language;
}

const AIAnalyst: React.FC<Props> = ({ data, lang }) => {
  const t = translations[lang];
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    const result = await analyzeSalesData(data, lang);
    setInsight(result || (lang === 'zh' ? "没有数据。" : "No data available."));
    setLoading(false);
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-xl shadow-lg mb-6 text-white border border-slate-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <span className="text-2xl">✨</span> {t.aiAnalyst}
          </h3>
          <p className="text-slate-400 text-sm">{t.aiSubtitle}</p>
        </div>
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-600 px-6 py-2 rounded-lg font-semibold transition-all shadow-md flex items-center gap-2 text-sm"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t.thinking}
            </>
          ) : t.generateInsights}
        </button>
      </div>

      {insight && (
        <div className="bg-slate-800/50 p-5 rounded-lg border border-slate-700 prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
          {insight}
        </div>
      )}

      {!insight && !loading && (
        <div className="text-center py-6 text-slate-500 text-sm border border-dashed border-slate-700 rounded-lg bg-slate-800/30">
          {t.aiPlaceholder}
        </div>
      )}
    </div>
  );
};

export default AIAnalyst;
