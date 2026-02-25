// src/api/imageService.js
const CLOUD_NAME = "dfyrnocnr";
const UPLOAD_PRESET = "ml_default"; // ← Đảm bảo preset này tồn tại, unsigned

export const uploadImageToCloudinary = async (file) => {
  if (!file) throw new Error("No file");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, // ← PHẢI CÓ /image/
    {
      method: "POST",
      body: formData,
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || "Upload failed");
  }

  const data = await res.json();
  return data.secure_url; // ← BẮT BUỘC TRẢ VỀ URL
};

export default { uploadImageToCloudinary };