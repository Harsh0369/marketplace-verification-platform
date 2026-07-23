import { User } from './User';
import { Product } from './Product';
import { ProductImage } from './ProductImage';
import { VerificationResult } from './VerificationResult';
import { VerificationLog } from './VerificationLog';

// User -> Products (1:N)
User.hasMany(Product, { foreignKey: 'userId', as: 'products' });
Product.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Product -> ProductImages (1:N)
Product.hasMany(ProductImage, { foreignKey: 'productId', as: 'images' });
ProductImage.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// Product -> VerificationResult (1:1)
Product.hasOne(VerificationResult, { foreignKey: 'productId', as: 'verificationResult' });
VerificationResult.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// VerificationResult -> VerificationLogs (1:N)
VerificationResult.hasMany(VerificationLog, { foreignKey: 'verificationId', as: 'logs' });
VerificationLog.belongsTo(VerificationResult, { foreignKey: 'verificationId', as: 'verificationResult' });

export { User, Product, ProductImage, VerificationResult, VerificationLog };
