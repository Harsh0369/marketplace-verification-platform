import type { Request, Response } from 'express';
import { productService } from '../services/product.service';
import { createProductSchema, updateProductSchema } from '../types/product.types';
import { cloudinaryProvider } from '../providers/cloudinary.provider';
import { verificationEngine } from '../verification/verification-engine';
import { sendSuccess } from '../utils/response.util';
import { handleError, AppError } from '../utils/error.util';
import sharp from 'sharp';

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
      // Parse price from string to number if it comes from FormData
      if (req.body.price && typeof req.body.price === 'string') {
        req.body.price = parseFloat(req.body.price);
      }

      const validatedData = createProductSchema.parse(req.body);
      // @ts-ignore - req.user injected by requireAuth middleware
      const userId = req.user.userId;

      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        throw new AppError('At least 1 image is required', 400);
      }
      
      // Create product as DRAFT initially
      const product = await productService.createProduct(userId, validatedData);
      
      // Upload and verify all images concurrently
      let allPassed = true;
      const failureReasons: string[] = [];

      const imagePromises = files.map(async (file) => {
        // Optimize the image before uploading to save massive network latency
        const optimizedBuffer = await sharp(file.buffer)
          .resize({ width: 1200, withoutEnlargement: true })
          .jpeg({ quality: 85 })
          .toBuffer();

        // Pre-create the DB record so the Verification Engine has an ID to attach results to
        const productImage = await productService.addImageToProduct(product.id, 'pending-upload');

        // Run Cloudinary Upload and AI Verification CONCURRENTLY!
        const [imageUrl, verificationDecision] = await Promise.all([
          cloudinaryProvider.uploadImage(optimizedBuffer),
          verificationEngine.executeVerification({
            productId: product.id,
            productImageId: productImage.id,
            userId: userId,
            imageUrl: 'pending-upload', // Handled locally via imageBuffer
            imageBuffer: optimizedBuffer
          })
        ]);
        
        // Update DB with the real URL now that upload is complete
        await productImage.update({ imageUrl });

        return verificationDecision;
      });

      const verificationResults = await Promise.all(imagePromises);

      for (const decision of verificationResults) {
        if (decision.overallStatus === 'FAILED') {
          allPassed = false;
          failureReasons.push(...(decision.reasons || []));
        }
      }

      if (!allPassed) {
        // Rollback: delete the product if verification fails
        await productService.deleteProduct(product.id, userId);
        throw new AppError(`Submission rejected: ${failureReasons.join(', ')}`, 400);
      }

      // If all passed, we could update status to PUBLISHED, but keeping DRAFT/ACTIVE is fine.
      // Let's refetch product to include the results
      const finalProduct = await productService.getProductById(product.id);

      return sendSuccess(res, 201, 'Product created and verified successfully', finalProduct);
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

      // Upload to Cloudinary
      const imageUrl = await cloudinaryProvider.uploadImage(file.buffer);

      // Save to database
      const productImage = await productService.addImageToProduct(id, imageUrl);

      // Trigger Verification Engine
      const verificationDecision = await verificationEngine.executeVerification({
        productId: id,
        productImageId: productImage.id,
        userId: userId,
        imageUrl,
        imageBuffer: file.buffer
      });

      return sendSuccess(res, 201, 'Image uploaded and verification completed', {
        image: productImage,
        verification: verificationDecision
      });
    } catch (error: any) {
      return handleError(res, error);
    }
  }
}

export const productController = new ProductController();
