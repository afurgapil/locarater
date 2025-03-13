import multer from "multer";
import { Request, Response, NextFunction } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";
import imageService from "../services/image.service";

type BucketType = "locations" | "users" | "reviews";

interface FileRequest extends Request {
  file?: Express.Multer.File;
  imagePath?: string;
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
    fileSize: 5 * 1024 * 1024,
  },
});

/**
 * Middleware for handling image uploads
 * @param {BucketType} type - The type of image upload (locations, users, reviews)
 * @returns {Array} Array of middleware functions
 */
const imageUpload = (type: BucketType) => {
  return [
    upload.single("image"),
    async (req: FileRequest, res: Response, next: NextFunction) => {
      try {
        if (!req.file) {
          return res.status(400).json({
            success: false,
            message: "Image is required",
          });
        }

        const imagePath = await imageService.uploadImage(req.file, type);

        req.imagePath = imagePath;

        next();
      } catch (error) {
        next(error);
      }
    },
  ];
};

export { BucketType };
export default imageUpload;
