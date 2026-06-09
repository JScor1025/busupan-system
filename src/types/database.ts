export type ProductStatus = 'purchasing' | 'in_stock' | 'ems_registered' | 'shipped' | 'delivered' | 'sold' | 'cancelled' | 'defective'
export type ProductLocation = 'japan' | 'india' | 'customer'
export type EmsStatus = 'packing' | 'shipped' | 'in_transit' | 'delivered'

export interface Customer {
  id: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  country: string
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  product_code: string
  name: string
  image_url: string | null
  description: string | null
  supplier: string
  purchase_price: number
  domestic_shipping: number
  selling_price: number
  weight: number
  purchase_date: string | null
  storage_location: string | null
  status: ProductStatus
  location: ProductLocation
  created_at: string
  updated_at: string
}

export interface Ems {
  id: string
  box_number: number | null
  ems_number: string | null
  customer_id: string | null
  status: EmsStatus
  shipping_date: string | null
  estimated_arrival: string | null
  note: string | null
  total_weight: number
  shipping_cost: number
  exchange_rate: number   // 1円 = 何ルピー
  tariff: number          // 関税 (円)
  india_shipping: number  // インド国内送料 (円)
  created_at: string
  updated_at: string
}

export interface EmsItem {
  id: string
  ems_id: string
  product_id: string
  quantity: number
  created_at: string
}

// Joined types
export interface EmsWithCustomer extends Ems {
  customer: Customer | null
}

export interface EmsWithItems extends EmsWithCustomer {
  ems_items: (EmsItem & { product: Product })[]
}

export interface ProductWithEms extends Product {
  ems_items: (EmsItem & { ems: Ems })[]
}

// 利益計算結果
export interface ProfitSummary {
  total_selling_jpy: number
  total_purchase_jpy: number  // 仕入 + 国内送料
  ems_cost_jpy: number        // EMS送料 + 関税 + インド国内送料
  profit_jpy: number
  profit_inr: number
  exchange_rate: number
}

// Form types
export type ProductFormData = Omit<Product, 'id' | 'product_code' | 'created_at' | 'updated_at'>
export type EmsFormData = Omit<Ems, 'id' | 'created_at' | 'updated_at'>
export type CustomerFormData = Omit<Customer, 'id' | 'created_at' | 'updated_at'>

// Dashboard
export interface DashboardStats {
  total_revenue: number
  total_profit: number
  monthly_profit: number
  total_shipments: number
  in_transit_count: number
  in_stock_count: number
}
