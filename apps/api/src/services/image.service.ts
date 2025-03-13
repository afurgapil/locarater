import { createClient } from "@supabase/supabase-js";
import path from "path";

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
const supabaseKey = process.env.SUPABASE_API_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase credentials are not configured");
}

const supabase = createClient(supabaseUrl, supabaseKey);

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
   * @returns {Promise<string>} The file path in storage
   */
  async uploadImage(file: MulterFile, type: BucketType): Promise<string> {
    if (!this.buckets[type]) {
      throw new Error(`Invalid image type: ${type}`);
    }

    try {
      const fileExt = path.extname(file.originalname);
      const fileName = `${Date.now()}${fileExt}`;

      const filePath = `${type}/${fileName}`;

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

      return filePath;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw new Error("Failed to upload image");
    }
  }

  /**
   * Delete an image from Supabase Storage
   * @param {string} filePath - The file path in storage
   * @param {BucketType} type - The type of image (locations, users, reviews)
   */
  async deleteImage(filePath: string, type: BucketType): Promise<void> {
    if (!this.buckets[type]) {
      throw new Error(`Invalid image type: ${type}`);
    }

    if (!filePath) {
      console.log("No file path provided, skipping deletion");
      return;
    }

    try {
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
