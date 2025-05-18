import { Router } from 'express';
import { getProductsController } from '../controllers/marketplace.controller';
import { validateInventoryController } from '../controllers/marketplace.controller';
import { placeOrderController } from '../controllers/marketplace.controller';


const router = Router();

router.post('/products', getProductsController);

router.post('/validate-inventory', validateInventoryController);

router.post('/order', placeOrderController);


export default router;
