import multer from "multer";
import { Request, Response, NextFunction } from "express";
import imageService from "../services/image.service";

type BucketType = "locations" | "users" | "reviews";

interface FileRequest extends Request {
  file?: Express.Multer.File;
  imageUrl?: string;
}

const storage = multer.memoryStorage();

const fileFilter = (
  _req: any,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback
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
    fileSize: 5 * 1024 * 1024,
  },
});

/**
 * Middleware for handling image uploads
 * @param {BucketType} type - The type of image upload (locations, users, reviews)
 * @returns Express middleware function
 */
const imageUpload = (type: BucketType) => {
  const uploadMiddleware = upload.single("image");

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await new Promise<void>((resolve, reject) => {
        // @ts-ignore
        uploadMiddleware(req, res, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      const fileReq = req as FileRequest;
      if (fileReq.file) {
        const imageUrl = await imageService.uploadImage(fileReq.file, type);
        fileReq.imageUrl = imageUrl;
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

export { BucketType, FileRequest };
export default imageUpload;
