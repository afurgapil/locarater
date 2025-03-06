import { Request, Response } from "express";
import { Location } from "../models/location.model";
import { RequestHandler } from "express";

interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    username: string;
    role: string;
  };
}

interface LocationRequest extends Request {
  body: {
    name: string;
    category: string;
    rating?: number;
    address: {
      city: string;
      district: string;
    };
  };
}

export const createLocation = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const locationData = req.body;
    locationData.createdBy = req.user?._id;

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
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?._id;
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
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const locationData = req.body;

    const location = await Location.findById(req.params.id);
    if (!location) {
      res.status(404).json({ message: "Location not found" });
      return;
    }

    if (
      location.createdBy.toString() !== req.user?._id &&
      req.user?.role !== "ADMIN"
    ) {
      res.status(403).json({ message: "Bu işlem için yetkiniz yok" });
      return;
    }

    const updatedLocation = await Location.findByIdAndUpdate(
      req.params.id,
      { ...locationData, updatedAt: new Date() },
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
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const location = await Location.findById(req.params.id);
    if (!location) {
      res.status(404).json({ message: "Location not found" });
      return;
    }

    if (
      location.createdBy.toString() !== req.user?._id &&
      req.user?.role !== "ADMIN"
    ) {
      res.status(403).json({ message: "Bu işlem için yetkiniz yok" });
      return;
    }

    await Location.findByIdAndDelete(req.params.id);
    res.json({ message: "Location deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
