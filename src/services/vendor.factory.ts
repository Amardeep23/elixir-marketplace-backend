import { BaseVendor } from '../vendors/baseVendor.interface';
import { EcomVendor } from '../vendors/ecomVendor';
import { VoucherVendor } from '../vendors/voucherVendor';

export function getVendorInstance(vendorType: string): BaseVendor {
  switch (vendorType.toLowerCase()) {
    case 'ecom':
      return new EcomVendor();
    case 'voucher':
      return new VoucherVendor();
    default:
      throw new Error(`Unsupported vendor: ${vendorType}`);
  }
}
