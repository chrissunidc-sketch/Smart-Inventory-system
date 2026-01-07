
export interface SaleRecord {
  id: string;
  saleDate: string;
  salePerson: string;
  saleOrganization: string;
  clientName: string;
  clientCode: string;
  clientChannel: 'Retail' | 'Wholesale' | 'Online' | 'Direct';
  productCategory: string;
  productName: string;
  saleVolume: number;
  unitPrice: number;
  totalSaleValue: number;
  costOfGoodsSold: number;
  grossProfit: number;
  grossProfitRate: number;
}

export interface Product {
  name: string;
  description?: string;
  image?: string; // Base64 or URL
  category: string;
  sku: string;
  initialStock: number;
  currentStock: number;
  reorderPoint: number;
  unitCost: number;
  unitPrice: number;
}

export interface InventoryStats {
  totalSales: number;
  totalProfit: number;
  avgGrossProfitRate: number;
  totalVolume: number;
  topCategory: string;
}

export type SortConfig = {
  key: keyof SaleRecord;
  direction: 'asc' | 'desc';
} | null;
