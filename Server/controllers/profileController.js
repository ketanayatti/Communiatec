const User = require("../models/UserModel");
const { renameSync, unlinkSync } = require("fs");
const path = require("path");
const cloudinary = require("../config/cloudinary");
const { updateProfileSchema } = require("../lib/validators/profileValidators");
const logger = require("../utils/logger");

const updateProfile = async (req, res) => {
  try {
    const { id } = req;

    // Log the incoming request body for debugging
    console.log("📝 Update Profile Request Body:", req.body);

    // Validate input using Joi
    const { error } = updateProfileSchema.validate(req.body);
    if (error) {
      console.log("❌ Validation Error:", error.details[0].message);
      return res.status(400).json({ error: error.details[0].message });
    }

    const { firstName, lastName } = req.body;

    const userData = await User.findByIdAndUpdate(
      id,
      {
        firstName,
        lastName,
        profileSetup: true,
      },
      { new: true, runValidators: true }
    );

    logger.info(`Profile updated for user: ${userData.email}`);

    return res.status(200).json({
      id: userData._id,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      profileSetup: userData.profileSetup,
      image: userData.image,
    });
  } catch (err) {
    logger.error("Error updating profile:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Please provide an image" });
    }

    const userId = req.id;
    const user = await User.findById(userId);

    //if already have a profile pic then we will first delete that
    if (user.cloudinary_id) {
      await cloudinary.uploader.destroy(user.cloudinary_id);
    }

    //upload new image to cloudinary
    const cloudinaryResponse = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "profile-images",
          public_id: userId,
          overwrite: true,
        },
        (error, result) => {
          if (error) {
            reject(error);
          }
          resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    user.image = cloudinaryResponse.secure_url;
    await user.save();
    logger.info(`Profile image uploaded for user: ${user.email}`);
    return res.status(200).json({
      image: user.image,
    });
  } catch (err) {
    logger.error("Error uploading image:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteImage = async (req, res) => {
  try {
    const userId = req.id;
    const user = await User.findById(userId);
    if (!user.image) {
      logger.warn(
        `Delete image attempt failed: No image found for user ${userId}`
      );
      return res.status(400).json({ error: "No image found" });
    }

    await cloudinary.uploader.destroy(`profile-images/${userId}`);

    user.image = null;
    await user.save();

    logger.info(`Profile image deleted for user: ${user.email}`);
    return res.status(200).send("Profile image deleted");
  } catch (err) {
    logger.error("Error deleting image:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { updateProfile, uploadImage, deleteImage };
