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
import { decrypt, encrypt } from '../utils/encryption';
import { retry } from '../utils/retry';

export class VoucherVendor implements BaseVendor {
  private readonly BASE_URL = 'https://staging.joinelixir.club/api/v1/voucher';

  private async getDecryptedToken(): Promise<string> {
    const cached = getToken('voucher');
    if (cached) return cached;

    const response = await retry( () =>  axios.get(`${this.BASE_URL}/gettoken`, {
      headers: {
        'Content-Type': 'application/json',
        username: config.voucher.username,
        password: config.voucher.password
      }
    }), 3, 1000);

    const encrypted = response.data.data;
    const token = decrypt(encrypted);
    setToken('voucher', token, 15 * 60 * 1000);
    return token;
  }

  async getProducts(): Promise<Product[]> {
    const token = await this.getDecryptedToken();
  
    const res = await retry( () => axios.post(
      `${this.BASE_URL}/getbrands`,
      {}, // no query or filters needed
      {
        headers: {
          'Content-Type': 'application/json',
          token
        }
      }
    ), 3, 1000);
  
    const encryptedData = res.data.data;
    const decryptedData = decrypt(encryptedData);
    const brandList = JSON.parse(decryptedData);
  
    return brandList.map((brand: any) => ({
      id: brand.BrandProductCode,
      sku: brand.BrandProductCode,
      name: brand.BrandName,
      type: 'voucher',
      image: brand.BrandImage,
      label: brand.Category || 'Voucher',
      prices: {
        mrp: brand.denominationList?.split(',')[0] || 'N/A',
        discount: null,
        discounted_price: null
      },
      rx_required: false,
      available_quantity: brand.stockAvailable === 'true' ? 100 : 0,
      unit_price: parseFloat(brand.denominationList?.split(',')[0] || '0'),
      offered_price: parseFloat(brand.denominationList?.split(',')[0] || '0')
    }));
  }
  

  async validateInventory(req: InventoryRequest): Promise<InventoryValidationResponse> {
    const token = await this.getDecryptedToken();

    const validatedItems = await Promise.all(
      req.items.map(async (item) => {
        const payload = {
          BrandProductCode: item.sku,
          Denomination: item.quantity.toString()
        };

        const encryptedPayload = encrypt(payload);

        const res = await retry(()=>axios.post(
          `${this.BASE_URL}/getstock`,
          { payload: encryptedPayload },
          {
            headers: {
              'Content-Type': 'application/json',
              token
            }
          }
        ), 3, 1000);

        const decryptedData = decrypt(res.data.data);
        const parsed = JSON.parse(decryptedData);

        return {
          sku: item.sku,
          availableQty: parseInt(parsed.AvailableQuantity || '0', 10),
          price: item.quantity,
          discountedPrice: undefined
        };
      })
    );

    return {
      items: validatedItems,
      payableAmount: validatedItems.reduce((sum, item) => sum + item.price, 0),
      vasCharges: 0
    };
  }

  async placeOrder(order: OrderRequest): Promise<OrderResponse> {
    const token = await this.getDecryptedToken();
    const results = [];

    for (const item of order.items) {
      const payload = {
        BrandProductCode: item.sku,
        Denomination: item.quantity.toString(),
        Quantity: 1,
        ExternalOrderId: `voucher-${Date.now()}-${Math.floor(Math.random() * 1000)}`
      };

      const encrypted = encrypt(payload);

      const res = await retry(()=>axios.post(
        `${this.BASE_URL}/pullvoucher`,
        { payload: encrypted },
        {
          headers: {
            'Content-Type': 'application/json',
            token
          }
        }
      ), 3, 1000);

      const decrypted = decrypt(res.data.data);
      const parsed = JSON.parse(decrypted);
      const voucher = parsed?.PullVouchers?.[0]?.Vouchers?.[0];

      results.push({
        product: parsed?.PullVouchers?.[0]?.ProductName || '',
        voucherNumber: voucher?.VoucherNo || '',
        voucherCode: voucher?.VoucherGCcode || '',
        value: voucher?.Value || '',
        orderId: parsed?.ExternalOrderIdOut || '',
        status: parsed?.ResultType === 'SUCCESS' ? 'CONFIRMED' : 'FAILED'
      });
    }

    return {
        vendor_orderId: 'voucher-multi-' + Date.now(),
        vendor: 'voucher',
        status: results.every(r => r.status === 'CONFIRMED') ? 'CONFIRMED' : 'FAILED',
        meta: {
          items: results
        }
      };      
  }
}
