import { createClient } from "@supabase/supabase-js";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

type BucketType = "locations" | "users" | "reviews";

interface ImageBuckets {
  [key: string]: string;
}

interface UploadImageOptions {
  contentType: string;
  cacheControl: string;
  upsert: boolean;
}

interface MulterFile {
  originalname: string;
  buffer: Buffer;
  mimetype: string;
  size: number;
}

const supabaseUrl = process.env.SUPABASE_PROJECT_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Supabase credentials are not configured");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      Authorization: `Bearer ${supabaseServiceKey}`,
    },
  },
});

class ImageService {
  private readonly buckets: ImageBuckets;

  constructor() {
    this.buckets = {
      locations: "location-images",
      users: "user-images",
      reviews: "review-images",
    };
  }

  /**
   * Upload an image to Supabase Storage
   * @param {MulterFile} file - The uploaded file
   * @param {BucketType} type - The type of image (locations, users, reviews)
   * @returns {Promise<string>} The public URL of the uploaded image
   */
  async uploadImage(file: MulterFile, type: BucketType): Promise<string> {
    if (!this.buckets[type]) {
      throw new Error(`Invalid image type: ${type}`);
    }

    try {
      const fileExt = path.extname(file.originalname);
      const fileName = `${Date.now()}${fileExt}`;
      const filePath = `public/${fileName}`;

      const uploadOptions: UploadImageOptions = {
        contentType: file.mimetype,
        cacheControl: "3600",
        upsert: true,
      };

      const { error } = await supabase.storage
        .from(this.buckets[type])
        .upload(filePath, file.buffer, uploadOptions);

      if (error) {
        console.error("Supabase upload error:", error);
        throw error;
      }

      return this.getPublicUrl(filePath, type);
    } catch (error) {
      console.error("Error uploading image:", error);
      throw new Error("Failed to upload image");
    }
  }

  /**
   * Delete an image from Supabase Storage using its public URL
   * @param {string} imageUrl - The public URL of the image
   * @param {BucketType} type - The type of image (locations, users, reviews)
   */
  async deleteImage(imageUrl: string, type: BucketType): Promise<void> {
    if (!this.buckets[type]) {
      throw new Error(`Invalid image type: ${type}`);
    }

    if (!imageUrl) {
      console.log("No image URL provided, skipping deletion");
      return;
    }

    try {
      // Extract the file path from the public URL
      const urlParts = imageUrl.split("/");
      const filePath = `public/${urlParts[urlParts.length - 1]}`;

      const { error } = await supabase.storage
        .from(this.buckets[type])
        .remove([filePath]);

      if (error) {
        console.error("Supabase delete error:", error);
        throw error;
      }

      console.log(`Successfully deleted file: ${filePath}`);
    } catch (error) {
      console.error("Error deleting image:", error);
      throw new Error("Failed to delete image");
    }
  }

  /**
   * Get public URL for an image
   * @param {string} filePath - The file path in storage
   * @param {BucketType} type - The type of image (locations, users, reviews)
   * @returns {string} The public URL of the image
   */
  getPublicUrl(filePath: string, type: BucketType): string {
    if (!this.buckets[type]) {
      throw new Error(`Invalid image type: ${type}`);
    }

    const { data } = supabase.storage
      .from(this.buckets[type])
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  /**
   * Validate image file
   * @param {MulterFile} file - The file to validate
   */
  validateImage(file: MulterFile): void {
    if (!file) {
      throw new Error("No image file provided");
    }

    if (!file.mimetype.startsWith("image/")) {
      throw new Error("File must be an image");
    }

    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new Error("File size must be less than 5MB");
    }
  }
}

export default new ImageService();
