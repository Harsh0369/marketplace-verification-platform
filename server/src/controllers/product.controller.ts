import type { Request, Response } from 'express';
import { productService } from '../services/product.service';
import { createProductSchema, updateProductSchema } from '../types/product.types';
import { azureBlobProvider } from '../providers/azure-blob.provider';
import { sendSuccess } from '../utils/response.util';
import { handleError, AppError } from '../utils/error.util';

export class ProductController {
  async getAllProducts(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const products = await productService.getAllProducts(page, limit);
      return sendSuccess(res, 200, 'Products fetched successfully', products);
    } catch (error: any) {
      return handleError(res, error);
    }
  }

  async getProductById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const product = await productService.getProductById(id);
      if (!product) {
        throw new AppError('Product not found', 404);
      }
      return sendSuccess(res, 200, 'Product fetched successfully', product);
    } catch (error: any) {
      return handleError(res, error);
    }
  }

  async createProduct(req: Request, res: Response) {
    try {
      const validatedData = createProductSchema.parse(req.body);
      // @ts-ignore - req.user injected by requireAuth middleware
      const userId = req.user.userId;
      
      const product = await productService.createProduct(userId, validatedData);
      return sendSuccess(res, 201, 'Product created', product);
    } catch (error: any) {
      return handleError(res, error);
    }
  }

  async updateProduct(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const validatedData = updateProductSchema.parse(req.body);
      // @ts-ignore
      const userId = req.user.userId;

      const product = await productService.updateProduct(id, userId, validatedData);
      return sendSuccess(res, 200, 'Product updated', product);
    } catch (error: any) {
      return handleError(res, error);
    }
  }

  async deleteProduct(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      // @ts-ignore
      const userId = req.user.userId;
      
      await productService.deleteProduct(id, userId);
      return sendSuccess(res, 200, 'Product deleted');
    } catch (error: any) {
      return handleError(res, error);
    }
  }

  async uploadImage(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      // @ts-ignore
      const userId = req.user.userId;

      // Verify product exists and belongs to user
      const product = await productService.getProductById(id);
      if (!product || product.userId !== userId) {
        throw new AppError('Product not found or unauthorized', 404);
      }

      const file = req.file;
      if (!file) {
        throw new AppError('No image uploaded', 400);
      }

      // Upload to Azure
      const imageUrl = await azureBlobProvider.uploadImage(file.buffer, file.originalname, file.mimetype);

      // Save to database
      const productImage = await productService.addImageToProduct(id, imageUrl);

      // Note: Verification Engine triggers will be added here in Phase 2

      return sendSuccess(res, 201, 'Image uploaded successfully', productImage);
    } catch (error: any) {
      return handleError(res, error);
    }
  }
}

export const productController = new ProductController();
