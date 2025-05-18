import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 3000,

  ecom: {
    merchantId: process.env.ECOM_MERCHANT_ID || 'demo_merchant'
  },

  voucher: {
    username: process.env.VOUCHER_USERNAME || 'vgUser',
    password: process.env.VOUCHER_PASSWORD || 'vgPass123'
  }
};
