const cloudinary = require("../config/cloudinary");

// Upload product image
const uploadProductImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file selected"
      });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "enterprise-ecommerce/products",
        resource_type: "image"
      },
      (error, result) => {
        if (error) {
          console.error(
            "Cloudinary upload error:",
            error
          );

          return res.status(500).json({
            success: false,
            message: "Failed to upload image"
          });
        }

        // Generate an optimized delivery URL.
        // The original image remains stored in Cloudinary.
        const optimizedUrl = cloudinary.url(
          result.public_id,
          {
            secure: true,
            transformation: [
              {
                width: 1000,
                crop: "limit"
              },
              {
                quality: "auto"
              },
              {
                fetch_format: "auto"
              }
            ]
          }
        );

        return res.status(200).json({
          success: true,
          message: "Image uploaded successfully",
          image_url: optimizedUrl
        });
      }
    );

    uploadStream.end(req.file.buffer);

  } catch (error) {
    console.error(
      "Upload image error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while uploading image"
    });
  }
};

module.exports = {
  uploadProductImage
};