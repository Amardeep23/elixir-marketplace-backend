import { Request, Response, NextFunction } from 'express';
import { getVendorInstance } from '../services/vendor.factory';
import { logger } from '../utils/logger';
import { OrderRequest } from '../types/common.types';


export const getProductsController = async (req: Request, res: Response, next: NextFunction) => {
    const vendor = req.query.vendor as string;
    const { query = '', filters = {} } = req.body || {};
  
    try {
      if (!vendor) {
        return res.status(400).json({ success: false, message: 'Vendor is required' });
      }
  
      logger.info(`Fetching products for vendor: ${vendor}`);
  
      const vendorInstance = getVendorInstance(vendor);
      const products = await vendorInstance.getProducts(query, filters);
  
      return res.status(200).json({
        success: true,
        data: products,
        message: `Products fetched from ${vendor}`
      });
    } catch (err) {
      logger.error(`Error in getProductsController: ${err}`);
      next(err);
    }
  };
  
  

export const validateInventoryController = async (req: Request, res: Response, next: NextFunction) => {
    const { vendor, items } = req.body;
  
    if (!vendor || !items || !Array.isArray(items)) {
      return res.status(400).json({ success: false, message: 'vendor and items[] required' });
    }
  
    try {
      logger.info(`Validating inventory for vendor: ${vendor}`);
      const vendorInstance = getVendorInstance(vendor);
      const result = await vendorInstance.validateInventory({ items });
  
      res.status(200).json({
        success: true,
        data: result,
        message: `Inventory validated with ${vendor}`
      });
    } catch (err) {
      logger.error(`Error in validateInventoryController: ${err}`);
      next(err);
    }
  };

  export const placeOrderController = async (req: Request, res: Response, next: NextFunction) => {
    const { items, address } = req.body;
  
    // Basic request validation
    if (!items || !Array.isArray(items) || items.length === 0 || !address?.lat || !address?.lng) {
      return res.status(400).json({ success: false, message: 'Invalid request: missing items or address' });
    }
  
    try {
      logger.info('[ORDER] Grouping items by vendor');
  
      // Group items by vendor
      const vendorMap: Record<string, OrderRequest['items']> = {};
      for (const item of items) {
        if (!item.vendor || !item.sku || !item.quantity) continue;
        if (!vendorMap[item.vendor]) vendorMap[item.vendor] = [];
        vendorMap[item.vendor].push({
          sku: item.sku,
          quantity: item.quantity
        });
      }
  
      logger.info(`[ORDER] Vendors involved: ${Object.keys(vendorMap).join(', ')}`);
  
      // Call placeOrder for each vendor
      const results = await Promise.all(
        Object.entries(vendorMap).map(async ([vendor, vendorItems]) => {
          const vendorInstance = getVendorInstance(vendor as 'ecom' | 'voucher');
  
          const vendorOrder: OrderRequest = {
            items: vendorItems,
            vendor: vendor as 'ecom' | 'voucher',
            address
          };
  
          const result = await vendorInstance.placeOrder(vendorOrder);
          return result;
        })
      );
      const finalOrderId = `order-${Date.now()}`;
      res.status(200).json({
        success: true,
        data: {  orderId: finalOrderId, orders: results }
      });
    } catch (err: any) {
      logger.error('[ERROR] Order processing failed');
      console.error(err);
      res.status(500).json({
        success: false,
        message: 'Something went wrong while placing the order.'
      });
    }
  };
  