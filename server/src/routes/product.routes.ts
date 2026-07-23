import { Router } from 'express';
import multer from 'multer';
import { productController } from '../controllers/product.controller';
import { requireAuth } from '../middleware/auth.middleware';

// Configure multer for memory storage (Azure Blob needs buffer)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit
  },
});

const router = Router();

// Public routes
router.get('/', productController.getAllProducts.bind(productController));
router.get('/:id', productController.getProductById.bind(productController));

// Protected routes
router.use(requireAuth as any);
router.post('/', productController.createProduct.bind(productController));
router.put('/:id', productController.updateProduct.bind(productController));
router.delete('/:id', productController.deleteProduct.bind(productController));
router.post('/:id/images', upload.single('image'), productController.uploadImage.bind(productController));

export default router;
