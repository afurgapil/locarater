import multer from "multer";
import { Request, Response, NextFunction } from "express";
import imageService from "../services/image.service";

type BucketType = "locations" | "users" | "reviews";

interface FileRequest extends Request {
  file?: Express.Multer.File;
  imageUrl?: string;
}

const storage = multer.memoryStorage();

const fileFilter: multer.Options["fileFilter"] = (
  _req,
  file,
  callback
): void => {
  try {
    imageService.validateImage(file);
    callback(null, true);
  } catch (error) {
    if (error instanceof Error) {
      callback(error);
    } else {
      callback(new Error("Unknown error during file validation"));
    }
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

/**
 * Middleware for handling image uploads
 * @param {BucketType} type - The type of image upload (locations, users, reviews)
 * @returns {Array} Array of middleware functions
 */
const imageUpload = (type: BucketType): any[] => {
  return [
    upload.single("image"),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const fileReq = req as FileRequest;
        if (!fileReq.file) {
          res.status(400).json({
            success: false,
            message: "Image is required",
          });
          return;
        }

        const imageUrl = await imageService.uploadImage(fileReq.file, type);
        fileReq.imageUrl = imageUrl;

        next();
      } catch (error) {
        next(error);
      }
    },
  ];
};

export { BucketType, FileRequest };
export default imageUpload;
