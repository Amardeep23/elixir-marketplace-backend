import {
    Product,
    InventoryRequest,
    InventoryValidationResponse,
    OrderRequest,
    OrderResponse
  } from '../types/common.types';
  
  export interface BaseVendor {
    getProducts(query?: string, filters?: Record<string, any>): Promise<Product[]>;
    validateInventory(items: InventoryRequest): Promise<InventoryValidationResponse>;
    placeOrder(order: OrderRequest): Promise<OrderResponse>;
  }
  