import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database';

interface VerificationLogAttributes {
  id: string;
  verificationId: string;
  module: string;
  status: 'PASSED' | 'FAILED' | 'ERROR';
  confidence: number;
  reason?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface VerificationLogCreationAttributes extends Optional<VerificationLogAttributes, 'id' | 'reason'> {}

export class VerificationLog extends Model<VerificationLogAttributes, VerificationLogCreationAttributes> implements VerificationLogAttributes {
  public id!: string;
  public verificationId!: string;
  public module!: string;
  public status!: 'PASSED' | 'FAILED' | 'ERROR';
  public confidence!: number;
  public reason?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

VerificationLog.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    verificationId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    module: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('PASSED', 'FAILED', 'ERROR'),
      allowNull: false,
    },
    confidence: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'VerificationLog',
    tableName: 'verification_logs',
    timestamps: true,
  }
);
