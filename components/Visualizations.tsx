
import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import { SaleRecord } from '../types';

interface Props {
  data: SaleRecord[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

const Visualizations: React.FC<Props> = ({ data }) => {
  // Aggregate data for charts
  const categoryData = data.reduce((acc: any[], curr) => {
    const existing = acc.find(item => item.name === curr.productCategory);
    if (existing) {
      existing.value += curr.totalSaleValue;
    } else {
      acc.push({ name: curr.productCategory, value: curr.totalSaleValue });
    }
    return acc;
  }, []);

  const channelProfit = data.reduce((acc: any[], curr) => {
    const existing = acc.find(item => item.name === curr.clientChannel);
    if (existing) {
      existing.profit += curr.grossProfit;
    } else {
      acc.push({ name: curr.clientChannel, profit: curr.grossProfit });
    }
    return acc;
  }, []);

  const dateTrends = [...data].sort((a, b) => new Date(a.saleDate).getTime() - new Date(b.saleDate).getTime()).map(d => ({
    date: d.saleDate,
    sales: d.totalSaleValue,
    profit: d.grossProfit
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-700 uppercase mb-4 tracking-tight">Sales Trends</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dateTrends}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" fontSize={10} />
              <YAxis fontSize={10} />
              <Tooltip />
              <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-700 uppercase mb-4 tracking-tight">Revenue by Category</h3>
        <div className="h-64 flex justify-center items-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {categoryData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
        <h3 className="text-sm font-bold text-slate-700 uppercase mb-4 tracking-tight">Profit by Channel</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={channelProfit} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" fontSize={10} />
              <YAxis dataKey="name" type="category" fontSize={10} />
              <Tooltip />
              <Bar dataKey="profit" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Visualizations;
