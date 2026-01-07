
import React, { useState, useEffect } from 'react';
import { Product, SaleRecord } from '../types';
import { translations, Language } from '../translations';

interface Props {
  products: Product[];
  onSaleAdded: (sale: SaleRecord) => void;
  lang: Language;
}

const AddSaleForm: React.FC<Props> = ({ products, onSaleAdded, lang }) => {
  const t = translations[lang];
  const [sku, setSku] = useState('');
  const [volume, setVolume] = useState(1);
  const [saleAmount, setSaleAmount] = useState<number>(0);
  const [client, setClient] = useState('');
  const [saleDate, setSaleDate] = useState('2026-01-01');
  const [channel, setChannel] = useState<SaleRecord['clientChannel']>('Online');

  useEffect(() => {
    const product = products.find(p => p.sku === sku);
    if (product) {
      setSaleAmount((product.unitPrice || 0) * volume);
    }
  }, [sku, volume, products]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find(p => p.sku === sku);
    if (!product) return;
    if (product.currentStock < volume) {
      alert(lang === 'zh' ? "库存不足！" : "Insufficient stock available!");
      return;
    }

    const totalSaleValue = saleAmount;
    const costOfGoodsSold = product.unitCost * volume;
    const grossProfit = totalSaleValue - costOfGoodsSold;
    const unitPrice = totalSaleValue / volume;

    const newSale: SaleRecord = {
      id: `SL-${Math.floor(Math.random() * 9000) + 1000}`,
      saleDate: saleDate,
      salePerson: lang === 'zh' ? '当前用户' : 'Active User',
      saleOrganization: lang === 'zh' ? '主办公室' : 'Main Office',
      clientName: client || (lang === 'zh' ? '散客' : 'Walk-in Customer'),
      clientCode: 'C-NEW',
      clientChannel: channel,
      productCategory: product.category,
      productName: product.name,
      saleVolume: volume,
      unitPrice: unitPrice,
      totalSaleValue,
      costOfGoodsSold,
      grossProfit,
      grossProfitRate: totalSaleValue !== 0 ? grossProfit / totalSaleValue : 0
    };

    onSaleAdded(newSale);
    setSku('');
    setVolume(1);
    setSaleAmount(0);
    setClient('');
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
      <h3 className="text-sm font-bold text-slate-700 uppercase tracking-tight mb-4">{t.recordNewSale} (2026)</h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="lg:col-span-1">
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">{t.date}</label>
          <input 
            type="date"
            required
            min="2026-01-01"
            max="2026-12-31"
            value={saleDate}
            onChange={e => setSaleDate(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="lg:col-span-1">
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">{t.product}</label>
          <select 
            required
            value={sku} 
            onChange={e => setSku(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">{lang === 'zh' ? '选择项目' : 'Select Item'}</option>
            {products.map(p => (
              <option key={p.sku} value={p.sku} disabled={p.currentStock <= 0}>
                {p.name} ({p.currentStock} {lang === 'zh' ? '剩余' : 'left'})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">{t.qty}</label>
          <input 
            type="number" 
            min="1" 
            required
            value={volume} 
            onChange={e => setVolume(parseInt(e.target.value) || 0)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">{t.totalSaleAmount} ($)</label>
          <input 
            type="number" 
            step="0.01"
            required
            value={saleAmount} 
            onChange={e => setSaleAmount(parseFloat(e.target.value) || 0)}
            className="w-full bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-2 text-sm font-bold text-indigo-700 focus:ring-2 focus:ring-indigo-500"
            placeholder="0.00"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">{t.client} / {t.channel}</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder={t.client} 
              value={client} 
              onChange={e => setClient(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
            />
            <select 
              value={channel} 
              onChange={e => setChannel(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-2 text-xs focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Online">Online</option>
              <option value="Retail">Retail</option>
              <option value="Wholesale">Wholesale</option>
              <option value="Direct">Direct</option>
            </select>
          </div>
        </div>
        <div className="flex items-end">
          <button 
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm shadow-sm"
          >
            {t.recordSale}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddSaleForm;
