export interface RevenueData {
  label: string
  revenue: number
}

export interface RevenueResponse {
  period: 'day' | 'month'
  year: number
  month: number | null
  totalRevenue: number
  data: RevenueData[]
}