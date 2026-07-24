import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database';

interface ProductAttributes {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  condition: string;
  status: 'DRAFT' | 'ACTIVE' | 'REJECTED' | 'NEEDS_REVIEW';
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProductCreationAttributes extends Optional<ProductAttributes, 'id' | 'status'> {}

export class Product extends Model<ProductAttributes, ProductCreationAttributes> implements ProductAttributes {
  declare id: string;
  declare title: string;
  declare description: string;
  declare category: string;
  declare price: number;
  declare condition: string;
  declare status: 'DRAFT' | 'ACTIVE' | 'REJECTED' | 'NEEDS_REVIEW';
  declare userId: string;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Product.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    condition: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('DRAFT', 'ACTIVE', 'REJECTED', 'NEEDS_REVIEW'),
      defaultValue: 'DRAFT',
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Product',
    tableName: 'products',
    timestamps: true,
  }
);
