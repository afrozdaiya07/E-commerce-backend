const cloudinary = require("../config/cloudinary");

// Upload Image
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No Image Selected",
      });
    }

    const file = req.file;

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "ecommerce-products",
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        )
        .end(file.buffer);
    });

    res.status(200).json({
      success: true,
      message: "Image Uploaded Successfully",
      imageUrl: result.secure_url,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  uploadImage,
};