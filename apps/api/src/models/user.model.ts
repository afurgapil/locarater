import mongoose, { Document } from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },

    imageUrl: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Lütfen geçerli bir email adresi girin",
      ],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["USER", "ADMIN", "BUSINESS_OWNER"],
      default: "USER",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
    },
    verificationTokenExpires: {
      type: Date,
    },
    refreshToken: {
      type: String,
    },
    refreshTokenExpires: {
      type: Date,
    },
    lastLogin: {
      type: Date,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    stats: {
      totalLikes: { type: Number, default: 0 },
      totalComments: { type: Number, default: 0 },
      totalReviews: { type: Number, default: 0 },
      totalLocations: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  name: string;
  imageUrl?: string;
  role: "USER" | "ADMIN" | "BUSINESS_OWNER";
  isActive: boolean;
  isVerified: boolean;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  refreshToken?: string;
  refreshTokenExpires?: Date;
  lastLogin?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  following: mongoose.Types.ObjectId[];
  followers: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  stats?: {
    totalLikes: number;
    totalComments: number;
    totalReviews: number;
    totalLocations: number;
  };
}

export const User = mongoose.model<IUser>("User", UserSchema);
