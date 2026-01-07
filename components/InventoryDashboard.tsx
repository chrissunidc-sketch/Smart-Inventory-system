
import React from 'react';
import { Product } from '../types';
import { translations, Language } from '../translations';

interface Props {
  products: Product[];
  lang: Language;
}

const InventoryDashboard: React.FC<Props> = ({ products, lang }) => {
  const t = translations[lang];
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-tight">{t.inventoryLevels}</h3>
        <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full font-bold border border-emerald-100 uppercase">{t.liveInventory}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => {
          const stockPercentage = (product.currentStock / product.initialStock) * 100;
          const isLowStock = product.currentStock <= product.reorderPoint;
          
          return (
            <div key={product.sku} className={`group p-4 rounded-xl border transition-all ${isLowStock ? 'border-red-100 bg-red-50/20' : 'border-slate-100 bg-slate-50/30 hover:bg-white hover:shadow-md'}`}>
              <div className="flex gap-4 mb-4">
                <div className="w-16 h-16 rounded-lg bg-slate-200 overflow-hidden flex-shrink-0 border border-slate-200 shadow-inner">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-100">
                      <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-bold text-slate-900 truncate">{product.name}</h4>
                    {isLowStock && (
                      <span className="flex-shrink-0 animate-pulse bg-red-500 text-white text-[8px] px-1 py-0.5 rounded font-bold ml-2">ALERT</span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 uppercase font-medium truncate">{product.category} • {product.sku}</p>
                  {product.description && (
                    <p className="text-[10px] text-slate-400 line-clamp-1 mt-1">{product.description}</p>
                  )}
                </div>
              </div>
              
              <div className="flex justify-between items-end mb-1.5">
                <p className="text-[10px] font-bold text-slate-500 uppercase">{t.availability}</p>
                <p className={`text-xs font-bold ${isLowStock ? 'text-red-600' : 'text-slate-900'}`}>
                  {product.currentStock} <span className="text-[10px] font-normal text-slate-400">/ {product.initialStock}</span>
                </p>
              </div>
              
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-700 ease-out ${isLowStock ? 'bg-red-500' : 'bg-indigo-500'}`}
                  style={{ width: `${Math.max(2, Math.min(100, stockPercentage))}%` }}
                />
              </div>
              
              <div className="mt-3 flex justify-between items-center text-[9px] font-medium text-slate-400 uppercase tracking-wider">
                <span>{t.min}: {product.reorderPoint}</span>
                <span className="text-slate-900 font-bold">${product.unitPrice}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InventoryDashboard;
