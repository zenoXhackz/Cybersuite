// EDUCATIONAL PURPOSES ONLY. UNAUTHORIZED USE IS ILLEGAL.
/**
 * Digital Forensics - Metadata & File Analysis Audit Module
 * Extract EXIF metadata, identify image edits, and analyze file characteristics for forensic training.
 */

import ExifParser from "exif-parser";

/**
 * Audit image metadata and check for indications of editing/tampering.
 * @param {Buffer} buffer - The image file buffer.
 * @param {string} filename - Name of the file.
 * @param {number} sizeBytes - Size of the file in bytes.
 * @returns {object} Audited metadata report.
 */
export function auditImageMetadata(buffer, filename, sizeBytes) {
  const extension = filename.split(".").pop().toLowerCase();
  
  // Default values
  let hasExif = false;
  let tags = {};
  let imageSize = { width: null, height: null };
  let format = extension.toUpperCase();
  let warningFlags = [];
  let integrityScore = 100; // Deducted based on suspicious signs

  // Attempt EXIF Parsing (mainly supported for JPEGs)
  if (extension === "jpg" || extension === "jpeg") {
    try {
      const parser = ExifParser.create(buffer);
      const result = parser.parse();
      
      if (result && result.tags) {
        tags = result.tags;
        hasExif = Object.keys(tags).length > 0;
        
        if (result.imageSize) {
          imageSize = result.imageSize;
        }
      }
    } catch (err) {
      warningFlags.push(`EXIF parsing error: ${err.message || "Invalid EXIF header structure"}`);
      integrityScore -= 15;
    }
  } else {
    warningFlags.push(`Format ${format} does not use standard JPEG EXIF headers.`);
  }

  // Forensic Analysis heuristics: Identify original vs. edited files
  const software = tags.Software || tags.software || "";
  const make = tags.Make || tags.make || "";
  const model = tags.Model || tags.model || "";
  const dateTimeOriginal = tags.DateTimeOriginal || tags.dateTimeOriginal || null;
  const modifyDate = tags.ModifyDate || tags.modifyDate || null;

  let editedDetect = false;
  let editorUsed = "None detected";

  // Rule 1: Check for known editing software signatures
  const editorSignatures = [
    { pattern: /photoshop/i, name: "Adobe Photoshop" },
    { pattern: /gimp/i, name: "GIMP (GNU Image Manipulation Program)" },
    { pattern: /pixelmator/i, name: "Pixelmator" },
    { pattern: /lightroom/i, name: "Adobe Lightroom" },
    { pattern: /paint\.net/i, name: "Paint.NET" },
    { pattern: /canva/i, name: "Canva" },
    { pattern: /snapseed/i, name: "Snapseed" }
  ];

  for (const sig of editorSignatures) {
    if (sig.pattern.test(software) || sig.pattern.test(filename)) {
      editedDetect = true;
      editorUsed = sig.name;
      warningFlags.push(`Software Signature Identified: '${sig.name}' logged in headers.`);
      integrityScore -= 40;
    }
  }

  // Rule 2: Missing Camera EXIF headers in JPG
  if ((extension === "jpg" || extension === "jpeg") && !hasExif) {
    editedDetect = true;
    editorUsed = "Unknown Editor (EXIF Stripped)";
    warningFlags.push("EXIF metadata completely stripped. Highly indicative of web download or editor export.");
    integrityScore -= 35;
  }

  // Rule 3: Missing camera hardware details
  if (hasExif && !make && !model) {
    warningFlags.push("No camera hardware manufacturer or model listed in EXIF tags.");
    integrityScore -= 10;
  }

  // Rule 4: Timestamp discrepancy (Created vs Modified)
  let timeDifferenceSec = 0;
  if (dateTimeOriginal && modifyDate) {
    timeDifferenceSec = Math.abs(dateTimeOriginal - modifyDate);
    if (timeDifferenceSec > 60) { // More than 1 minute difference
      warningFlags.push(`Timestamp Discrepancy: Image modification timestamp differs from original capture time by ${Math.round(timeDifferenceSec / 60)} minutes.`);
      integrityScore -= 15;
    }
  }

  // Ensure integrity score stays within [0, 100]
  integrityScore = Math.max(0, Math.min(100, integrityScore));

  // Structure GPS parameters if available
  const gps = {
    latitude: tags.GPSLatitude || null,
    longitude: tags.GPSLongitude || null,
    altitude: tags.GPSAltitude || null,
    hasGps: tags.GPSLatitude !== undefined && tags.GPSLongitude !== undefined
  };

  // Human-readable file sizes
  const sizeReadable = sizeBytes < 1024 * 1024 
    ? `${(sizeBytes / 1024).toFixed(1)} KB` 
    : `${(sizeBytes / (1024 * 1024)).toFixed(2)} MB`;

  // General statistics
  const stats = {
    filename,
    format,
    fileSizeBytes: sizeBytes,
    fileSizeReadable: sizeReadable,
    width: imageSize.width || tags.ExifImageWidth || "Unknown",
    height: imageSize.height || tags.ExifImageHeight || "Unknown",
    colorDepth: "24-bit RGB (Default)", // standard RGB color depth representation
    compression: extension === "png" ? "Lossless (DEFLATE)" : "Lossy (JPEG/DCT)"
  };

  return {
    success: true,
    hasExif,
    stats,
    gps,
    camera: {
      make: make || "Unknown Manufacturer",
      model: model || "Unknown Model",
      software: software || "Not recorded",
      exposureTime: tags.ExposureTime ? `1/${Math.round(1 / tags.ExposureTime)}s` : "Unknown",
      fNumber: tags.FNumber ? `f/${tags.FNumber}` : "Unknown",
      isoSpeed: tags.ISO ? `ISO ${tags.ISO}` : "Unknown",
      focalLength: tags.FocalLength ? `${tags.FocalLength}mm` : "Unknown",
      timestamp: dateTimeOriginal ? new Date(dateTimeOriginal * 1000).toISOString() : "Unknown"
    },
    heuristics: {
      isEdited: editedDetect,
      probableEditor: editorUsed,
      integrityScore,
      warningFlags
    },
    scannedAt: new Date().toISOString()
  };
}
