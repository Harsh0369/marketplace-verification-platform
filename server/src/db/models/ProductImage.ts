import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database';

interface ProductImageAttributes {
  id: string;
  productId: string;
  imageUrl: string;
  thumbnailUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProductImageCreationAttributes extends Optional<ProductImageAttributes, 'id'> {}

export class ProductImage extends Model<ProductImageAttributes, ProductImageCreationAttributes> implements ProductImageAttributes {
  public id!: string;
  public productId!: string;
  public imageUrl!: string;
  public thumbnailUrl?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ProductImage.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    thumbnailUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'ProductImage',
    tableName: 'product_images',
    timestamps: true,
  }
);
