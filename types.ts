
// Data structures for the application

export interface CategoryDef {
  name: string;
  description: string;
  parent?: string; // Name of the parent category if it's a subcategory
  color?: string;  // Hex color code, primarily for root categories
}

export interface AccountDef {
  name: string;
  currency: string; // e.g., "PLN", "EUR", "USD"
}

export interface ShopMap {
  rawName: string; // e.g., "CARREFOUR POLSKA"
  cleanName: string; // e.g., "Carrefour"
}

export interface AppSettings {
  categories: CategoryDef[];
  accounts: AccountDef[]; 
  shopMappings: ShopMap[];
}

export interface ReceiptItem {
  id: string;
  name: string;
  price: number; // The final price after discount
  originalPrice?: number; // The price before discount (optional)
  discount?: number; // The amount deducted (optional)
  category: string;
}

export interface ReceiptData {
  storeName: string;
  date: string; // YYYY-MM-DD
  total: number;
  detectedPaymentMethod: string;
  detectedCardLast4?: string;
  items: ReceiptItem[];
  isMathValid?: boolean;
}

export interface ProcessedReceipt extends ReceiptData {
  assignedAccount: string;
}

// Helper for currency formatting
export const formatCurrency = (amount: number, currency: string = 'PLN') => {
  return new Intl.NumberFormat('pl-PL', { 
    style: 'currency',
    currency: currency, 
  }).format(amount);
};
