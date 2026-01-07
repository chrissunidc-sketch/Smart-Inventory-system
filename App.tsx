
import React, { useState, useMemo, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { MOCK_SALES_RECORDS, INITIAL_PRODUCTS } from './constants';
import { SaleRecord, InventoryStats, SortConfig, Product } from './types';
import { translations, Language } from './translations';
import StatsGrid from './components/StatsGrid';
import InventoryTable from './components/InventoryTable';
import Visualizations from './components/Visualizations';
import AIAnalyst from './components/AIAnalyst';
import InventoryDashboard from './components/InventoryDashboard';
import AddSaleForm from './components/AddSaleForm';
import AddProductForm from './components/AddProductForm';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('app_language') as Language) || 'en';
  });
  const t = translations[lang];

  const [activeTab, setActiveTab] = useState<'dashboard' | 'catalog'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [monthFilter, setMonthFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  // Using v2 keys to ensure a clean slate for the user
  const [sales, setSales] = useState<SaleRecord[]>(() => {
    const saved = localStorage.getItem('inventory_sales_v2');
    return saved ? JSON.parse(saved) : MOCK_SALES_RECORDS;
  });
  
  const [inventory, setInventory] = useState<Product[]>(() => {
    const saved = localStorage.getItem('inventory_stock_v2');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  useEffect(() => {
    localStorage.setItem('app_language', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('inventory_sales_v2', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('inventory_stock_v2', JSON.stringify(inventory));
  }, [inventory]);

  const handleAddSale = (newSale: SaleRecord) => {
    setSales(prev => [newSale, ...prev]);
    setInventory(prev => prev.map(product => {
      if (product.name === newSale.productName) {
        return {
          ...product,
          currentStock: product.currentStock - newSale.saleVolume
        };
      }
      return product;
    }));
  };

  const handleAddProduct = (newProduct: Product) => {
    setInventory(prev => [...prev, newProduct]);
    setActiveTab('dashboard');
  };

  const handleDeleteProduct = (sku: string) => {
    if (confirm(lang === 'zh' ? "确定要删除此产品吗？" : "Are you sure you want to delete this product?")) {
      setInventory(prev => prev.filter(p => p.sku !== sku));
    }
  };

  const handleReset = () => {
    if (confirm(lang === 'zh' ? "确定要重置所有数据吗？此操作不可逆。" : "Are you sure you want to reset all data? This cannot be undone.")) {
      setSales(MOCK_SALES_RECORDS);
      setInventory(INITIAL_PRODUCTS);
      localStorage.removeItem('inventory_sales_v2');
      localStorage.removeItem('inventory_stock_v2');
      window.location.reload();
    }
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Date', 'Product', 'Category', 'Client', 'Channel', 'Volume', 'Price', 'Revenue', 'COGS', 'Profit', 'Rep'];
    const rows = processedSales.map(s => [
      s.id, s.saleDate, s.productName, s.productCategory, s.clientName, s.clientChannel, 
      s.saleVolume, s.unitPrice, s.totalSaleValue, s.costOfGoodsSold, s.grossProfit, s.salePerson
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sales_${monthFilter}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = () => {
    const data = processedSales.map(s => ({
      ID: s.id,
      Date: s.saleDate,
      Product: s.productName,
      Category: s.productCategory,
      Client: s.clientName,
      Channel: s.clientChannel,
      Volume: s.saleVolume,
      'Unit Price': s.unitPrice,
      'Total Revenue': s.totalSaleValue,
      COGS: s.costOfGoodsSold,
      'Gross Profit': s.grossProfit,
      'GP Rate': (s.grossProfitRate * 100).toFixed(2) + '%',
      Salesperson: s.salePerson
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sales Records");
    XLSX.writeFile(workbook, `Monthly_Sales_Report_${monthFilter}_${lang}.xlsx`);
  };

  const exportToPDF = async () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    doc.setFontSize(18);
    doc.text(`Monthly Sales Report: ${monthFilter}`, 15, 20);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 15, 28);

    doc.setFontSize(12);
    doc.text('Performance Summary:', 15, 40);
    doc.setFontSize(10);
    doc.text(`Total Sales: $${stats.totalSales.toLocaleString()}`, 20, 48);
    doc.text(`Gross Profit: $${stats.totalProfit.toLocaleString()}`, 20, 54);
    doc.text(`Units Sold: ${stats.totalVolume}`, 20, 60);

    if (chartContainerRef.current) {
      const canvas = await html2canvas(chartContainerRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 180;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      doc.addImage(imgData, 'PNG', 15, 70, imgWidth, imgHeight);
    }

    doc.addPage();
    doc.setFontSize(14);
    doc.text('Detailed Monthly Sales Records', 15, 20);
    
    let y = 30;
    doc.setFontSize(8);
    doc.text('Date', 15, y);
    doc.text('Product', 40, y);
    doc.text('Qty', 100, y);
    doc.text('Revenue', 120, y);
    doc.text('Profit', 150, y);
    y += 5;
    doc.line(15, y, 190, y);
    y += 5;

    processedSales.slice(0, 40).forEach(s => {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      doc.text(s.saleDate, 15, y);
      doc.text(s.productName.substring(0, 30), 40, y);
      doc.text(s.saleVolume.toString(), 100, y);
      doc.text(`$${s.totalSaleValue.toFixed(2)}`, 120, y);
      doc.text(`$${s.grossProfit.toFixed(2)}`, 150, y);
      y += 5;
    });

    doc.save(`Monthly_Report_${monthFilter}.pdf`);
  };

  const stats: InventoryStats = useMemo(() => {
    if (sales.length === 0) return { totalSales: 0, totalProfit: 0, avgGrossProfitRate: 0, totalVolume: 0, topCategory: 'N/A' };
    
    const dataForStats = sales.filter(item => {
      if (monthFilter === 'All') return true;
      return item.saleDate.startsWith(monthFilter);
    });

    if (dataForStats.length === 0) return { totalSales: 0, totalProfit: 0, avgGrossProfitRate: 0, totalVolume: 0, topCategory: 'N/A' };

    const totalSales = dataForStats.reduce((acc, curr) => acc + curr.totalSaleValue, 0);
    const totalProfit = dataForStats.reduce((acc, curr) => acc + curr.grossProfit, 0);
    const avgGP = dataForStats.reduce((acc, curr) => acc + curr.grossProfitRate, 0) / dataForStats.length;
    const totalVolume = dataForStats.reduce((acc, curr) => acc + curr.saleVolume, 0);
    
    const catMap = dataForStats.reduce((acc: Record<string, number>, curr) => {
      acc[curr.productCategory] = (acc[curr.productCategory] || 0) + curr.totalSaleValue;
      return acc;
    }, {} as Record<string, number>);
    const topCategory = Object.entries(catMap).sort((a, b) => (b[1] as number) - (a[1] as number))[0]?.[0] || 'N/A';

    return { totalSales, totalProfit, avgGrossProfitRate: avgGP, totalVolume, topCategory };
  }, [sales, monthFilter]);

  const processedSales = useMemo(() => {
    let filtered = sales.filter(item => {
      const matchesSearch = item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === t.all || item.productCategory === categoryFilter;
      const matchesMonth = monthFilter === 'All' || item.saleDate.startsWith(monthFilter);
      return matchesSearch && matchesCategory && matchesMonth;
    });

    if (sortConfig) {
      filtered.sort((a, b) => {
        const aVal = a[sortConfig.key] as any;
        const bVal = b[sortConfig.key] as any;
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [sales, searchTerm, categoryFilter, monthFilter, sortConfig, t.all]);

  const handleSort = (key: keyof SaleRecord) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const categories = [t.all, ...new Set(inventory.map(p => p.category))];
  const months = ['All', '2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09', '2026-10', '2026-11', '2026-12'];

  return (
    <div className="min-h-screen bg-slate-50 pb-12 font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">{t.appTitle}</h1>
              <p className="text-[10px] text-slate-500 font-medium italic mt-1">{t.appSubtitle}</p>
            </div>
            <nav className="flex bg-slate-100 p-1 rounded-lg">
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'dashboard' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {t.dashboard}
              </button>
              <button 
                onClick={() => setActiveTab('catalog')}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'catalog' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {t.catalog}
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {activeTab === 'dashboard' && (
              <>
                <select 
                  value={monthFilter}
                  onChange={(e) => setMonthFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {months.map(m => <option key={m} value={m}>{m === 'All' ? t.selectMonth : m}</option>)}
                </select>
                <select 
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <div className="relative w-full md:w-48">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    placeholder={t.searchPlaceholder}
                    className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </>
            )}
            <button 
              onClick={handleReset}
              className="px-2 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors group"
              title={lang === 'zh' ? "重置系统" : "Reset System"}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button onClick={() => setLang('en')} className={`px-2 py-1 rounded text-[10px] font-bold ${lang === 'en' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>EN</button>
              <button onClick={() => setLang('zh')} className={`px-2 py-1 rounded text-[10px] font-bold ${lang === 'zh' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>中文</button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {activeTab === 'dashboard' ? (
          <>
            <StatsGrid stats={stats} lang={lang} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <AddSaleForm products={inventory} onSaleAdded={handleAddSale} lang={lang} />
                <InventoryDashboard products={inventory} lang={lang} />
                
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
                  <div className="flex items-center justify-between mb-4 no-print">
                    <div>
                      <h3 className="text-sm font-bold text-slate-700 uppercase tracking-tight">{t.saleHistory} ({monthFilter})</h3>
                      <p className="text-[10px] text-slate-400">{t.filteredView}: {processedSales.length}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <button onClick={exportToCSV} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 hover:text-slate-800 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        CSV
                      </button>
                      <button onClick={exportToExcel} className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 hover:text-emerald-800 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        {t.exportExcel}
                      </button>
                      <button onClick={exportToPDF} className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg border border-indigo-100 flex items-center gap-1.5 text-[10px] font-bold hover:bg-indigo-100 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                        {t.exportPDF}
                      </button>
                    </div>
                  </div>
                  <div ref={tableRef}>
                    <InventoryTable data={processedSales} sortConfig={sortConfig} onSort={handleSort} lang={lang} />
                  </div>
                </div>
              </div>
              
              <div className="lg:col-span-1">
                <AIAnalyst data={processedSales} lang={lang} />
                <div className="mb-6" ref={chartContainerRef}>
                  <Visualizations data={processedSales} />
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h4 className="text-sm font-bold text-slate-800 mb-4 tracking-tight">{t.financialHealth}</h4>
                  <div className="space-y-4">
                    {[{ name: t.stockTurnRate, val: 0, color: 'bg-indigo-500' }, { name: t.customerLTV, val: 0, color: 'bg-emerald-500' }, { name: t.operatingMargin, val: 0, color: 'bg-blue-400' }].map((kpi, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase mb-1">
                          <span>{kpi.name}</span>
                          <span className="text-slate-900">{kpi.val}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div className={`${kpi.color} h-full transition-all duration-1000`} style={{ width: `${kpi.val}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="max-w-4xl mx-auto">
            <AddProductForm onProductAdded={handleAddProduct} lang={lang} />
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-6">{t.productCatalog}</h3>
              {inventory.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <p className="text-slate-400 font-medium">{lang === 'zh' ? "目录中暂无产品" : "No products in catalog yet"}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {inventory.map(product => (
                    <div key={product.sku} className="border border-slate-100 rounded-xl overflow-hidden hover:shadow-lg transition-all group relative bg-white">
                      <button 
                        onClick={() => handleDeleteProduct(product.sku)}
                        className="absolute top-2 left-2 z-10 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                        title={lang === 'zh' ? "删除产品" : "Delete Product"}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                      <div className="aspect-video bg-slate-50 relative">
                        {product.image ? <img src={product.image} alt={product.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-200 uppercase font-black text-2xl tracking-tighter opacity-50">{product.category}</div>}
                        <div className="absolute top-2 right-2"><span className="bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold text-slate-700 shadow-sm">{product.sku}</span></div>
                      </div>
                      <div className="p-4">
                        <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{product.name}</h4>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1 mb-3 h-8">{product.description || t.noDescription}</p>
                        <div className="flex items-center justify-between border-t border-slate-50 pt-3">
                          <div><p className="text-[10px] text-slate-400 uppercase font-bold">{t.category}</p><p className="text-xs text-slate-700">{product.category}</p></div>
                          <div className="text-right"><p className="text-[10px] text-slate-400 uppercase font-bold">{t.price}</p><p className="text-sm font-bold text-emerald-600">${product.unitPrice}</p></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
