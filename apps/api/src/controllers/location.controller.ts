import { Request, Response } from "express";
import { Location } from "../models/location.model";

interface LocationRequest extends Request {
  body: {
    name: string;
    category: string;
    location: {
      type: "Point";
      coordinates: [number, number];
    };
    rating?: number;
  };
}

export const createLocation = async (
  req: LocationRequest,
  res: Response
): Promise<void> => {
  try {
    const location = new Location(req.body);
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
    const locations = await Location.find();
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
    const location = await Location.findById(req.params.id);
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
    const location = await Location.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    if (!location) {
      res.status(404).json({ message: "Location not found" });
      return;
    }
    res.json(location);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteLocation = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const location = await Location.findByIdAndDelete(req.params.id);
    if (!location) {
      res.status(404).json({ message: "Location not found" });
      return;
    }
    res.json({ message: "Location deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
