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
    imagePath?: string;
    imageUrl?: string;
    createdBy?: string;
  };
  imagePath?: string;
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

    if (req.imagePath) {
      const imageUrl = imageService.getPublicUrl(req.imagePath, "locations");
      locationData.imagePath = req.imagePath;
      locationData.imageUrl = imageUrl;
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

    if (req.imagePath) {
      if (location.imagePath) {
        try {
          await imageService.deleteImage(location.imagePath, "locations");
        } catch (error) {
          console.error("Error deleting old image:", error);
        }
      }

      const imageUrl = imageService.getPublicUrl(req.imagePath, "locations");
      locationData.imagePath = req.imagePath;
      locationData.imageUrl = imageUrl;
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

    if (location.imagePath) {
      try {
        await imageService.deleteImage(location.imagePath, "locations");
      } catch (error) {
        console.error("Error deleting image:", error);
      }
    }

    await Location.findByIdAndDelete(req.params.id);
    res.json({ message: "Location deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
