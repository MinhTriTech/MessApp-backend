import multer from "multer";
import path from "path";
import fs from "fs";

const sanitizeFileName = (originalName = "file") => {
    return originalName.trim().replace(/\s+/g, "-");
};

const createStorage = (folderName) => {
    return multer.diskStorage({
        destination: (req, file, cb) => {
            const uploadDir = path.join("uploads", folderName);
            fs.mkdirSync(uploadDir, { recursive: true });
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            const uniqueName = `${Date.now()}-${sanitizeFileName(file.originalname)}`;
            cb(null, uniqueName);
        },
    });
};

export const uploadMessageFile = multer({ storage: createStorage("messages") });
export const uploadAvatarFile = multer({ storage: createStorage("avatars") });