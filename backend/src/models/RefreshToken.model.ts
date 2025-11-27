import mongoose, { Schema, Document, Types, Model } from "mongoose";

export interface IRefreshToken extends Document {
  _id: Types.ObjectId;
  token: string;
  userId: Types.ObjectId;
  expiresAt: Date;
  isRevoked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Define static methods interface
export interface IRefreshTokenModel extends Model<IRefreshToken> {
  revokeToken(token: string): Promise<any>;
  revokeAllUserTokens(userId: string | Types.ObjectId): Promise<any>;
  isValidToken(token: string): Promise<boolean>;
  cleanupExpiredTokens(): Promise<any>;
}

const refreshTokenSchema = new Schema<IRefreshToken, IRefreshTokenModel>(
  {
    token: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    isRevoked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

refreshTokenSchema.index({ userId: 1 });
// TTL index - MongoDB will automatically delete documents when expiresAt is reached
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Static method to revoke token
refreshTokenSchema.statics.revokeToken = function (token: string) {
  return this.updateOne({ token }, { isRevoked: true });
};

// Static method to revoke all user tokens
refreshTokenSchema.statics.revokeAllUserTokens = function (
  userId: string | Types.ObjectId
) {
  return this.updateMany({ userId }, { isRevoked: true });
};

// Static method to verify token is valid
refreshTokenSchema.statics.isValidToken = async function (token: string) {
  const refreshToken = await this.findOne({ token });

  if (!refreshToken) {
    return false;
  }

  if (refreshToken.isRevoked) {
    return false;
  }

  if (new Date() > refreshToken.expiresAt) {
    return false;
  }

  return true;
};

// Static method to cleanup expired tokens
refreshTokenSchema.statics.cleanupExpiredTokens = function () {
  return this.deleteMany({
    $or: [{ expiresAt: { $lt: new Date() } }, { isRevoked: true }],
  });
};

const RefreshToken = mongoose.model<IRefreshToken, IRefreshTokenModel>(
  "RefreshToken",
  refreshTokenSchema
);

export default RefreshToken;
