import { Request, Response } from "express";
import { Location } from "../models/location.model";
import { getCoordinates } from "../services/geocoding.service";
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
    location: {
      type: "Point";
      coordinates: [number, number];
    };
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

    // Koordinatları otomatik olarak al
    const geocodeResult = await getCoordinates(
      locationData.address.city,
      locationData.address.district
    );

    if (geocodeResult.coordinates) {
      locationData.address.coordinates = geocodeResult.coordinates;
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

    // Check if user has permission to update
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

    // Eğer adres güncellendiyse koordinatları da güncelle
    if (locationData.address?.city && locationData.address?.district) {
      const geocodeResult = await getCoordinates(
        locationData.address.city,
        locationData.address.district
      );

      if (geocodeResult.coordinates) {
        locationData.address.coordinates = geocodeResult.coordinates;
      }
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

    // Only ADMIN or the creator can delete
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

export const addReview = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const locationId = req.params.id;
    const reviewData = req.body;
    reviewData.user = req.user?._id;

    const location = await Location.findById(locationId);
    if (!location) {
      res.status(404).json({ message: "Location not found" });
      return;
    }

    // Check if user has already reviewed
    const existingReview = location.reviews.find(
      (review) => review.user.toString() === req.user?._id
    );

    if (existingReview) {
      res
        .status(400)
        .json({ message: "Bu mekan için zaten bir değerlendirmeniz var" });
      return;
    }

    location.reviews.push({
      user: reviewData.user,
      rating: {
        overall: reviewData.rating.overall,
        taste: reviewData.rating.taste,
        service: reviewData.rating.service,
        ambiance: reviewData.rating.ambiance,
        pricePerformance: reviewData.rating.pricePerformance,
      },
      comment: reviewData.comment,
      visitDate: reviewData.visitDate
        ? new Date(reviewData.visitDate)
        : new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await location.save();

    const updatedLocation = await Location.findById(locationId).populate(
      "reviews.user",
      "username name"
    );

    res.status(201).json({
      message: "Review added successfully",
      review: updatedLocation?.reviews[updatedLocation.reviews.length - 1],
      ratings: updatedLocation?.ratings,
    });
  } catch (error: any) {
    console.error("Error adding review:", error);
    res
      .status(500)
      .json({ message: "Error adding review", error: error.message });
  }
};

export const getReviews = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const locationId = req.params.id;
    const location = await Location.findById(locationId).populate(
      "reviews.user",
      "username name"
    );

    if (!location) {
      res.status(404).json({ message: "Location not found" });
      return;
    }

    res.json({
      reviews: location.reviews,
      ratings: location.ratings,
    });
  } catch (error: any) {
    console.error("Error getting reviews:", error);
    res
      .status(500)
      .json({ message: "Error getting reviews", error: error.message });
  }
};
