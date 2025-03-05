import express from 'express';
import productController from '../controllers/productController';

const router = express.Router();

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProduct);
router.post('/', productController.postProduct)
router.put('/:id', productController.changeProduct)
router.delete('/:id', productController.deleteProduct)

export default router;