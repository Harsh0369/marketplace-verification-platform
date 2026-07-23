import { Product, ProductImage, VerificationResult, VerificationLog, User } from '../db/models';
import { CreateProductInput, UpdateProductInput } from '../types/product.types';

export class ProductService {
  async getAllProducts(page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;
    return await Product.findAndCountAll({
      limit,
      offset,
      include: [
        { model: ProductImage, as: 'images' },
        { model: VerificationResult, as: 'verificationResult' }
      ],
      order: [['createdAt', 'DESC']]
    });
  }

  async getProductById(id: string) {
    return await Product.findByPk(id, {
      include: [
        { model: ProductImage, as: 'images' },
        {
          model: VerificationResult,
          as: 'verificationResult',
          include: [{ model: VerificationLog, as: 'logs' }]
        },
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] }
      ]
    });
  }

  async createProduct(userId: string, input: CreateProductInput) {
    const product = await Product.create({
      title: input.title,
      description: input.description,
      category: input.category,
      userId,
      status: 'DRAFT', 
    });
    return product;
  }

  async updateProduct(id: string, userId: string, input: UpdateProductInput) {
    const product = await Product.findOne({ where: { id, userId } });
    if (!product) {
      throw new Error('Product not found or unauthorized');
    }
    const updateData = Object.fromEntries(Object.entries(input).filter(([_, v]) => v !== undefined));
    await product.update(updateData);
    return product;
  }

  async deleteProduct(id: string, userId: string) {
    const product = await Product.findOne({ where: { id, userId } });
    if (!product) {
      throw new Error('Product not found or unauthorized');
    }
    await product.destroy();
    return true;
  }

  async addImageToProduct(productId: string, imageUrl: string) {
    return await ProductImage.create({
      productId,
      imageUrl
    });
  }
}

export const productService = new ProductService();
