export interface Product {
    id: string;
    sku: string;
    name: string;
    type: 'drug' | 'otc';
    image: string;
    label: string;
    prices: {
      mrp: string; 
      discount: string | null;   
      discounted_price: string | null; 
    };
    rx_required: boolean;
    available_quantity: number;
    unit_price: number;
    offered_price: number;
  }
  
  export interface InventoryValidationResponse {
    items: {
      sku: string;
      availableQty: number;
      price: number;
      discountedPrice?: number;
    }[];
    payableAmount: number;
    vasCharges?: number;
  }  


  export interface InventoryRequest {
    items: {
      sku: string;
      quantity: number;
    }[];
  }
  
  export interface OrderRequest {
    address: {
      lat: number;
      lng: number;
    };
    items: {
      sku: string;
      quantity: number;
    }[];
    vendor: 'ecom' | 'voucher';
  }
  
  export interface OrderResponse {
    vendor_orderId: string;
    vendor: 'ecom' | 'voucher';
    status: 'CONFIRMED' | 'FAILED';
    meta?: {
      items: {
        product: string;
        voucherNumber: string;
        voucherCode: string;
        value: number;
        orderId: string;
        status: string;
      }[];
    };
  }
  