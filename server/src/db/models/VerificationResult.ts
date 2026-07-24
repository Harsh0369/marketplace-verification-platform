import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database';

interface VerificationResultAttributes {
  id: string;
  productId: string;
  overallStatus: 'PASSED' | 'FAILED' | 'PENDING' | 'MANUAL_REVIEW';
  confidence: number;
  reasons?: string[];
  verifiedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface VerificationResultCreationAttributes extends Optional<VerificationResultAttributes, 'id' | 'verifiedAt'> {}
export class VerificationResult extends Model<VerificationResultAttributes, VerificationResultCreationAttributes> implements VerificationResultAttributes {
  declare id: string;
  declare productId: string;
  declare overallStatus: 'PASSED' | 'FAILED' | 'PENDING' | 'MANUAL_REVIEW';
  declare confidence: number;
  declare reasons?: string[];
  declare verifiedAt?: Date;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
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
    reasons: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
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
