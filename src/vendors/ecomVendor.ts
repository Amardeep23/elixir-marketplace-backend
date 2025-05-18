import axios from 'axios';
import { BaseVendor } from './baseVendor.interface';
import {
  Product,
  InventoryRequest,
  InventoryValidationResponse,
  OrderRequest,
  OrderResponse
} from '../types/common.types';
import { getToken, setToken } from '../utils/tokenCache';
import { config } from '../config';
import { retry } from '../utils/retry';

export class EcomVendor implements BaseVendor {
  private readonly BASE_URL = 'https://staging.joinelixir.club/api/v1/marketplace';
  private readonly MERCHANT_ID = config.ecom.merchantId;

  private async getJwtToken(): Promise<string> {
    const cached = getToken('ecom');
    if (cached) return cached;

    const res = await retry(() => axios.get(`${this.BASE_URL}/generate-jwt/${this.MERCHANT_ID}`), 3, 1000);
    const jwt = res.data.data.token;

    setToken('ecom', jwt, 15 * 60 * 1000); // Cache for 15 min
    return jwt;
  }

  async getProducts(query = '', filters = {}): Promise<Product[]> {
    const jwt = await this.getJwtToken();
  
    const res = await retry(() => axios.post(
      `${this.BASE_URL}/search`,
      { query, filters },
      {
        headers: {
          Authorization: `Bearer ${jwt}`,
          'Content-Type': 'application/json'
        }
      }
    ), 3, 1000);
  
    const products = res.data?.data?.products || [];
  
    return products.map((p: any) => ({
      id: p.id,
      sku: p.sku,
      name: p.name,
      type: p.type,
      image: p.image,
      label: p.label,
      prices: {
        mrp: p.prices.mrp,
        discount: p.prices.discount,
        discounted_price: p.prices.discounted_price
      },
      rx_required: p.rx_required,
      available_quantity: p.available_quantity,
      unit_price: p.unit_price,
      offered_price: p.offered_price
    }));
  }
  

  async validateInventory(req: InventoryRequest): Promise<InventoryValidationResponse> {
    const jwt = await this.getJwtToken();
  
    const res = await retry( () =>  axios.post(
      `${this.BASE_URL}/validate-inventory`,
      { items: req.items },
      {
        headers: {
          Authorization: `Bearer ${jwt}`,
          'Content-Type': 'application/json'
        }
      }
    ), 3, 1000);
  
    const data = res.data?.data;
    if (!data || !data.items) {
      throw new Error('Invalid inventory response from ecom API');
    }
  
    const items = data.items.map((item: any) => ({
      sku: item.sku,
      availableQty: item.available_quantity || 0,
      price: item.unit_price || item.price || 0,
      discountedPrice: item.discounted_price ?? undefined
    }));
  
    return {
      items,
      payableAmount: data.payable_amount ?? 0,
      vasCharges: data.vas_charges?.total_amount ?? 0
    };
  }
  
  

  async placeOrder(order: OrderRequest): Promise<OrderResponse> {
    const jwt = await this.getJwtToken();
    const mockOrderId = 'mock-ecom-order-' + Date.now();
    const transactionId = 'txn_' + Date.now();
  
    const res = await  retry( () => axios.post(
      `${this.BASE_URL}/orders/${mockOrderId}/confirm`,
      { transaction_id: transactionId },
      {
        headers: {
          Authorization: `Bearer ${jwt}`,
          'Content-Type': 'application/json'
        }
      }
    ), 3, 1000);
  
    const data = res.data?.data;
  
    return {
        vendor_orderId: data?.order_id || mockOrderId,
        vendor: 'ecom',
        status: data?.status || 'CONFIRMED',
        meta: {
          items: order.items.map((item, index) => ({
            product: item.sku,
            voucherNumber: `MOCK_VOUCHER_NO_${index}`,
            voucherCode: `MOCK_CODE_${index}`,
            value: item.quantity * 1,
            orderId: mockOrderId,
            status: 'CONFIRMED'
          }))
        }
      };      
  }  
}
