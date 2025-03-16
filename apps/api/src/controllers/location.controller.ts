import { Request, Response } from "express";
import { Location } from "../models/location.model";
import { AuthRequest } from "../types/auth";
import imageService from "../services/image.service";

interface LocationRequest extends AuthRequest {
  body: {
    name: string;
    category: string;
    description?: string;
    address: {
      city: string;
      district: string;
    };
    imageUrl?: string;
    createdBy?: string;
  };
  imageUrl?: string;
}

export const createLocation = async (
  req: LocationRequest,
  res: Response
): Promise<void> => {
  try {
    const locationData = {
      ...req.body,
      createdBy: req.user?.id,
    };

    if (req.imageUrl) {
      locationData.imageUrl = req.imageUrl;
    }

    const location = new Location(locationData);
    await location.save();
    res.status(201).json(location);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getLocations = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const locations = await Location.find()
      .populate("createdBy", "username name")
      .populate("reviews.user", "username name");
    res.json(locations);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getLocationByUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const locations = await Location.find({ createdBy: userId });
    res.json(locations);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getLocationById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const location = await Location.findById(req.params.id)
      .populate("createdBy", "username name")
      .populate("reviews.user", "username name");
    if (!location) {
      res.status(404).json({ message: "Location not found" });
      return;
    }
    res.json(location);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateLocation = async (
  req: LocationRequest,
  res: Response
): Promise<void> => {
  try {
    const locationData = {
      ...req.body,
      updatedAt: new Date(),
    };

    const location = await Location.findById(req.params.id);
    if (!location) {
      res.status(404).json({ message: "Location not found" });
      return;
    }

    if (
      location.createdBy.toString() !== req.user?.id &&
      req.user?.role !== "ADMIN"
    ) {
      res.status(403).json({ message: "Bu işlem için yetkiniz yok" });
      return;
    }

    if (req.imageUrl) {
      if (location.imageUrl) {
        try {
          await imageService.deleteImage(location.imageUrl, "locations");
        } catch (error) {
          console.error("Error deleting old image:", error);
        }
      }
      locationData.imageUrl = req.imageUrl;
    }

    const updatedLocation = await Location.findByIdAndUpdate(
      req.params.id,
      locationData,
      { new: true }
    )
      .populate("createdBy", "username name")
      .populate("reviews.user", "username name");

    if (!updatedLocation) {
      res.status(404).json({ message: "Location not found" });
      return;
    }
    res.json(updatedLocation);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteLocation = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const location = await Location.findById(req.params.id);
    if (!location) {
      res.status(404).json({ message: "Location not found" });
      return;
    }

    if (
      location.createdBy.toString() !== req.user?.id &&
      req.user?.role !== "ADMIN"
    ) {
      res.status(403).json({ message: "Bu işlem için yetkiniz yok" });
      return;
    }

    if (location.imageUrl) {
      try {
        await imageService.deleteImage(location.imageUrl, "locations");
      } catch (error) {
        console.error("Error deleting image:", error);
      }
    }

    // Delete review images if they exist
    for (const review of location.reviews) {
      if (review.imageUrl) {
        try {
          await imageService.deleteImage(review.imageUrl, "reviews");
        } catch (error) {
          console.error("Error deleting review image:", error);
        }
      }
    }

    await Location.findByIdAndDelete(req.params.id);
    res.json({ message: "Location deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateLocationImageFromReview = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { locationId } = req.params;
    const { imageUrl } = req.body;

    if (!req.user?.role || req.user.role !== "ADMIN") {
      res
        .status(403)
        .json({ message: "Bu işlem için admin yetkisi gereklidir" });
      return;
    }

    if (!imageUrl) {
      res.status(400).json({ message: "Görsel URL'i gereklidir" });
      return;
    }

    const location = await Location.findById(locationId);
    if (!location) {
      res.status(404).json({ message: "Mekan bulunamadı" });
      return;
    }

    location.imageUrl = imageUrl;
    await location.save();

    res.json({ message: "Mekan görseli başarıyla güncellendi", location });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
