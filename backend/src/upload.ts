// backend/src/upload.ts
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// ==========================
// 📁 ESM SAFE PATHS
// ==========================
const __filename =
  fileURLToPath(import.meta.url);

const __dirname =
  path.dirname(__filename);

// ==========================
// 📁 ROOT DIRECTORY
// ==========================
const ROOT_DIR =
  path.resolve(__dirname, "..");

// ==========================
// 📁 MAIN UPLOADS DIRECTORY
// ==========================
const UPLOADS_DIR =
  path.join(
    ROOT_DIR,
    "uploads"
  );

// ==========================
// 📁 SCHOOL IDS DIRECTORY
// ==========================
const SCHOOL_IDS_DIR =
  path.join(
    UPLOADS_DIR,
    "school-ids"
  );

// ==========================
// 📁 PROFILE PICTURES DIRECTORY
// ==========================
const PROFILE_PICTURES_DIR =
  path.join(
    UPLOADS_DIR,
    "profile-pictures"
  );

// ==========================
// 📁 ENSURE DIRECTORIES EXIST
// ==========================
[
  UPLOADS_DIR,
  SCHOOL_IDS_DIR,
  PROFILE_PICTURES_DIR,
].forEach((dir) => {

  if (!fs.existsSync(dir)) {

    fs.mkdirSync(dir, {
      recursive: true,
    });
  }
});

// ==========================
// 🧹 SANITIZE FILE NAME
// ==========================
function sanitizeStudentId(
  studentId: string
) {

  return String(studentId)
    .replace(
      /[^a-zA-Z0-9-_]/g,
      ""
    )
    .toLowerCase();
}

// ==========================
// 🖼 ALLOWED IMAGE TYPES
// ==========================
const allowedMimeTypes = [

  // JPG / JPEG
  "image/jpeg",
  "image/jpg",

  // PNG
  "image/png",

  // WEBP
  "image/webp",

  // HEIC / HEIF
  "image/heic",
  "image/heif",

  // BMP
  "image/bmp",

  // TIFF
  "image/tiff",

  // AVIF
  "image/avif",
];

// ==========================
// 📦 MULTER STORAGE
// ==========================
const storage =
  multer.diskStorage({

    // ==========================
    // 📁 DESTINATION
    // ==========================
    destination: (
      req,
      _file,
      cb
    ) => {

      try {

        // ==========================
        // 🧠 GET UPLOAD TYPE
        // ==========================
        const uploadType =
  req.body.uploadType ||
  "profile-picture";

        // ==========================
        // 🎓 SCHOOL ID
        // ==========================
        if (
          uploadType ===
          "school-id"
        ) {

          return cb(
            null,
            SCHOOL_IDS_DIR
          );
        }
          // backend/src/uploads/school-ids/(DITO)
          // backend/src/uploads/profile-pictures/(DITO)
        // ==========================
        // 👤 PROFILE PICTURE
        // ==========================
        if (
          uploadType ===
          "profile-picture"
        ) {

          return cb(
            null,
            PROFILE_PICTURES_DIR
          );
        }

        // ==========================
        // ❌ INVALID TYPE
        // ==========================
        return cb(
          new Error(
            "Invalid upload type"
          ),
          ""
        );

      } catch (err) {

        console.error(err);

        return cb(
          new Error(
            "Failed to determine upload destination"
          ),
          ""
        );
      }
    },

    // ==========================
    // 🏷 FILE NAME
    // ==========================
    filename: (
      req,
      file,
      cb
    ) => {

      try {

        // ==========================
        // 🎓 GET STUDENT ID
        // ==========================
        let studentId =
          req.body.studentId;

        // ==========================
        // ❌ FALLBACK
        // ==========================
        if (!studentId) {

          studentId =
            Date.now().toString();
        }

        // ==========================
        // 🧹 SAFE STUDENT ID
        // ==========================
        const safeStudentId =
          sanitizeStudentId(
            studentId
          );

        // ==========================
        // 🧠 GET UPLOAD TYPE
        // ==========================
        const uploadType =
  req.body.uploadType ||
  "profile-picture";

        // ==========================
        // 📸 FILE EXTENSION
        // ==========================
        const ext =
          path
            .extname(
              file.originalname
            )
            .toLowerCase();

        // ==========================
        // 🏷 FINAL FILE NAME
        // ==========================
        let finalFileName =
          "";

        // ==========================
        // 🎓 SCHOOL ID FILE NAME
        // ==========================
        if (
          uploadType ===
          "school-id"
        ) {

          finalFileName =
            `${safeStudentId}-school-id${ext}`;
        }

        // ==========================
        // 👤 PROFILE PICTURE FILE NAME
        // ==========================
        else if (
          uploadType ===
          "profile-picture"
        ) {

          finalFileName =
            `${safeStudentId}-profile-picture${ext}`;
        }

        // ==========================
        // ❌ INVALID TYPE
        // ==========================
        else {

          return cb(
            new Error(
              "Invalid upload type"
            ),
            ""
          );
        }

        console.log(
          "FINAL FILE:",
          finalFileName
        );

        cb(
          null,
          finalFileName
        );

      } catch (err) {

        console.error(err);

        cb(
          new Error(
            "Failed to process filename"
          ),
          ""
        );
      }
    },
  });

// ==========================
// ✅ FILE FILTER
// ==========================
const fileFilter:
  multer.Options["fileFilter"] = (
    _req,
    file,
    cb
  ) => {

    console.log(
  "UPLOAD MIME TYPE:",
  file.mimetype
);

    // ==========================
    // ✅ CHECK MIME TYPE
    // ==========================
    const isAllowed =
      allowedMimeTypes.includes(
        file.mimetype
      );

    // ==========================
    // ✅ ALLOW IMAGE FILES
    // ==========================
    if (isAllowed) {

      return cb(
        null,
        true
      );
    }

    // ==========================
    // ❌ BLOCK NON-IMAGE FILES
    // ==========================
    return cb(
      new Error(
        "Only image files are allowed (JPG, JPEG, PNG, WEBP, HEIC, AVIF, etc.)"
      )
    );
  };

// ==========================
// 🚀 EXPORT MULTER
// ==========================
export const upload =
  multer({

    storage,

    // ==========================
    // 📦 MAX FILE SIZE
    // ==========================
    limits: {

      // 5MB
      fileSize:
        5 * 1024 * 1024,
    },

    fileFilter,
  });