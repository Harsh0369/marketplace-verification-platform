import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database';

interface VerificationResultAttributes {
  id: string;
  productId: string;
  overallStatus: 'PASSED' | 'FAILED' | 'PENDING' | 'MANUAL_REVIEW';
  confidence: number;
  verifiedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface VerificationResultCreationAttributes extends Optional<VerificationResultAttributes, 'id' | 'verifiedAt'> {}

export class VerificationResult extends Model<VerificationResultAttributes, VerificationResultCreationAttributes> implements VerificationResultAttributes {
  public id!: string;
  public productId!: string;
  public overallStatus!: 'PASSED' | 'FAILED' | 'PENDING' | 'MANUAL_REVIEW';
  public confidence!: number;
  public verifiedAt?: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

VerificationResult.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
    },
    overallStatus: {
      type: DataTypes.ENUM('PASSED', 'FAILED', 'PENDING', 'MANUAL_REVIEW'),
      defaultValue: 'PENDING',
      allowNull: false,
    },
    confidence: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    verifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'VerificationResult',
    tableName: 'verification_results',
    timestamps: true,
  }
);
