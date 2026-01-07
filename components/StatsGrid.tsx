
import React from 'react';
import { InventoryStats } from '../types';
import { translations, Language } from '../translations';

interface Props {
  stats: InventoryStats;
  lang: Language;
}

const StatsGrid: React.FC<Props> = ({ stats, lang }) => {
  const t = translations[lang];
  const cards = [
    { label: t.totalSales, value: `$${stats.totalSales.toLocaleString()}`, color: 'bg-blue-50 text-blue-600', border: 'border-blue-100' },
    { label: t.grossProfit, value: `$${stats.totalProfit.toLocaleString()}`, color: 'bg-emerald-50 text-emerald-600', border: 'border-emerald-100' },
    { label: t.avgGPRate, value: `${(stats.avgGrossProfitRate * 100).toFixed(1)}%`, color: 'bg-purple-50 text-purple-600', border: 'border-purple-100' },
    { label: t.unitsSold, value: stats.totalVolume.toLocaleString(), color: 'bg-amber-50 text-amber-600', border: 'border-amber-100' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, idx) => (
        <div key={idx} className={`p-5 rounded-xl border ${card.border} ${card.color} shadow-sm bg-white`}>
          <p className="text-xs font-semibold uppercase tracking-wider opacity-70 mb-1">{card.label}</p>
          <p className="text-2xl font-bold text-slate-800">{card.value}</p>
        </div>
      ))}
    </div>
  );
};

export default StatsGrid;
