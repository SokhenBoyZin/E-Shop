export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPING = 'SHIPPING',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export enum DeliveryMethod {
  MOTOR = 'MOTOR',
  PICKUP = 'PICKUP'
}

export interface DeliveryLocationResponse {
  deliveryLocationId: number;
  contactName: string;
  phoneNumber: string;
  city: string;
  district: string;
  address: string;
}

export interface OrderItemResponse {
  orderItemId: number;
  productVariantId: number;
  quantity: number;
  unitPrice: number;
  productName: string;
  color: string;
  capacity: string;
  connectivity: string;
}

export interface OrderResponse {
  orderId: number;
  userId: number;
  deliveryLocation: DeliveryLocationResponse;
  subtotal: number;
  deliveryMethod: DeliveryMethod;
  deliveryFee: number;
  totalAmount: number;
  orderStatus: OrderStatus;
  createdAt: string;
  orderItems: OrderItemResponse[];
}