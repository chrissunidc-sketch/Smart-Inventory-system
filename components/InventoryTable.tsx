
import React from 'react';
import { SaleRecord, SortConfig } from '../types';
import { translations, Language } from '../translations';

interface Props {
  data: SaleRecord[];
  sortConfig: SortConfig;
  onSort: (key: keyof SaleRecord) => void;
  lang: Language;
}

const InventoryTable: React.FC<Props> = ({ data, sortConfig, onSort, lang }) => {
  const t = translations[lang];
  const columns: { label: string; key: keyof SaleRecord }[] = [
    { label: 'ID', key: 'id' },
    { label: t.date, key: 'saleDate' },
    { label: t.product, key: 'productName' },
    { label: t.category, key: 'productCategory' },
    { label: t.client, key: 'clientName' },
    { label: t.channel, key: 'clientChannel' },
    { label: t.qty, key: 'saleVolume' },
    { label: lang === 'zh' ? '销售额 ($)' : 'Sales ($)', key: 'totalSaleValue' },
    { label: lang === 'zh' ? '成本 ($)' : 'COGS ($)', key: 'costOfGoodsSold' },
    { label: lang === 'zh' ? '利润 ($)' : 'Profit ($)', key: 'grossProfit' },
    { label: t.avgGPRate, key: 'grossProfitRate' },
    { label: lang === 'zh' ? '人员' : 'Rep', key: 'salePerson' },
  ];

  const getSortIcon = (key: keyof SaleRecord) => {
    if (sortConfig?.key !== key) return '⇅';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-sm">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50 sticky top-0">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => onSort(col.key)}
                className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-1">
                  {col.label}
                  <span className="text-slate-400">{getSortIcon(col.key)}</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-100">
          {data.map((record) => (
            <tr key={record.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-900">{record.id}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">{record.saleDate}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900 font-medium">{record.productName}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">{record.productCategory}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">{record.clientName}</td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase ${
                  record.clientChannel === 'Online' ? 'bg-blue-100 text-blue-700' :
                  record.clientChannel === 'Wholesale' ? 'bg-emerald-100 text-emerald-700' :
                  record.clientChannel === 'Retail' ? 'bg-amber-100 text-amber-700' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {record.clientChannel}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">{record.saleVolume}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900 font-semibold">${record.totalSaleValue.toLocaleString()}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">${record.costOfGoodsSold.toLocaleString()}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-emerald-600 font-semibold">${record.grossProfit.toLocaleString()}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">{(record.grossProfitRate * 100).toFixed(1)}%</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500 italic">{record.salePerson}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryTable;
