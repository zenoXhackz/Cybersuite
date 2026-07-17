import express from "express";
import path from "path";
import dns from "dns";
import multer from "multer";
import { createServer as createViteServer } from "vite";
import { runNetworkDiagnostics } from "./backend/modules/network.js";
import { auditImageMetadata } from "./backend/modules/forensics.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parser
  app.use(express.json());

  // API Route for Network Diagnostics & Troubleshooting
  app.post("/api/diagnostics", async (req, res) => {
    try {
      const { target } = req.body;

      if (!target || typeof target !== "string") {
        return res.status(400).json({
          success: false,
          error: "Target parameter is required and must be a string.",
        });
      }

      const report = await runNetworkDiagnostics(target);
      return res.json(report);
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: err.message || "Internal network diagnostics error.",
      });
    }
  });

  // API Route for Network Recon
  app.post("/api/recon", async (req, res) => {
    try {
      const { domain } = req.body;

      if (!domain || typeof domain !== "string") {
        return res.status(400).json({
          success: false,
          error: "Domain parameter is required and must be a string.",
        });
      }

      // Clean domain name: remove http://, https://, trailing paths, port numbers
      let cleanDomain = domain
        .trim()
        .toLowerCase()
        .replace(/^(https?:\/\/)?(www\.)?/, "") // remove http://, https://, www.
        .split("/")[0] // remove paths
        .split(":")[0]; // remove ports

      if (!cleanDomain) {
        return res.status(400).json({
          success: false,
          error: "Invalid domain name format.",
        });
      }

      // Resolve domain name to IP address
      let ipAddress: string;
      try {
        const lookup = await dns.promises.lookup(cleanDomain);
        ipAddress = lookup.address;
      } catch (dnsErr: any) {
        return res.status(404).json({
          success: false,
          error: `Failed to resolve domain name '${cleanDomain}': ${dnsErr.message || dnsErr.code}`,
        });
      }

      // Query public GeoIP API for country, city, and ISP
      try {
        const geoResponse = await fetch(`http://ip-api.com/json/${ipAddress}`);
        const geoData = await geoResponse.json() as any;

        if (geoData.status === "fail") {
          return res.status(400).json({
            success: false,
            error: geoData.message || "Failed to fetch geolocation data.",
          });
        }

        return res.json({
          success: true,
          domain: cleanDomain,
          ip: ipAddress,
          country: geoData.country || "Unknown",
          country_code: geoData.countryCode || "N/A",
          city: geoData.city || "Unknown",
          region: geoData.regionName || "Unknown",
          latitude: geoData.lat || 0,
          longitude: geoData.lon || 0,
          isp: geoData.isp || "Unknown",
          asn: geoData.as || "Unknown",
        });
      } catch (fetchErr: any) {
        // Fallback if the GeoIP lookup fails but DNS succeeded
        return res.json({
          success: true,
          domain: cleanDomain,
          ip: ipAddress,
          country: "Unknown",
          country_code: "N/A",
          city: "Unknown",
          region: "Unknown",
          latitude: 0,
          longitude: 0,
          isp: "Unknown",
          asn: "Unknown",
          warning: "DNS resolution succeeded, but geolocation service was unreachable.",
        });
      }
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: err.message || "Internal server error.",
      });
    }
  });

  // Configure Multer for in-memory upload buffering (safe & fast)
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  });

  // Pre-configured Forensic Case studies for student analysis
  const FORENSIC_CASES: Record<string, any> = {
    "dslr_original": {
      success: true,
      hasExif: true,
      stats: {
        filename: "IMG_4912.JPG",
        format: "JPEG",
        fileSizeBytes: 4821034,
        fileSizeReadable: "4.60 MB",
        width: 5184,
        height: 3456,
        colorDepth: "24-bit RGB (Default)",
        compression: "Lossy (JPEG/DCT)"
      },
      gps: {
        latitude: null,
        longitude: null,
        altitude: null,
        hasGps: false
      },
      camera: {
        make: "Canon",
        model: "Canon EOS 5D Mark IV",
        software: "Firmware v1.2.1",
        exposureTime: "1/125s",
        fNumber: "f/2.8",
        isoSpeed: "ISO 400",
        focalLength: "50mm",
        timestamp: "2026-04-12T14:23:45.000Z"
      },
      heuristics: {
        isEdited: false,
        probableEditor: "None detected",
        integrityScore: 100,
        warningFlags: []
      },
      scannedAt: new Date().toISOString()
    },
    "photoshop_tampered": {
      success: true,
      hasExif: true,
      stats: {
        filename: "Evidence_Receipt_Final.jpg",
        format: "JPEG",
        fileSizeBytes: 124045,
        fileSizeReadable: "121.1 KB",
        width: 1200,
        height: 800,
        colorDepth: "24-bit RGB (Default)",
        compression: "Lossy (JPEG/DCT)"
      },
      gps: {
        latitude: null,
        longitude: null,
        altitude: null,
        hasGps: false
      },
      camera: {
        make: "Apple",
        model: "iPhone 12",
        software: "Adobe Photoshop CC 2024 (Windows)",
        exposureTime: "1/60s",
        fNumber: "f/1.6",
        isoSpeed: "ISO 125",
        focalLength: "4.2mm",
        timestamp: "2026-03-01T09:12:00.000Z"
      },
      heuristics: {
        isEdited: true,
        probableEditor: "Adobe Photoshop CC",
        integrityScore: 45,
        warningFlags: [
          "Software Signature Identified: 'Adobe Photoshop' logged in headers.",
          "EXIF timestamps contain modification discrepancy (Created 2026-03-01 vs Modified 2026-03-05).",
          "Abnormally small file size for iPhone camera source. Indicates web-optimized export."
        ]
      },
      scannedAt: new Date().toISOString()
    },
    "gps_leak": {
      success: true,
      hasExif: true,
      stats: {
        filename: "Capture_Warehouse_Ransom.jpg",
        format: "JPEG",
        fileSizeBytes: 2940250,
        fileSizeReadable: "2.80 MB",
        width: 4032,
        height: 3024,
        colorDepth: "24-bit RGB (Default)",
        compression: "Lossy (JPEG/DCT)"
      },
      gps: {
        latitude: 34.0522,
        longitude: -118.2437,
        altitude: 84.5,
        hasGps: true
      },
      camera: {
        make: "Apple",
        model: "iPhone 13 Pro",
        software: "iOS 15.4",
        exposureTime: "1/220s",
        fNumber: "f/1.5",
        isoSpeed: "ISO 50",
        focalLength: "5.7mm",
        timestamp: "2026-06-18T22:15:30.000Z"
      },
      heuristics: {
        isEdited: false,
        probableEditor: "None detected",
        integrityScore: 95,
        warningFlags: [
          "Active GPS Coordinates found! Locations show exact capture geometry (Downtown LA Storage Area)."
        ]
      },
      scannedAt: new Date().toISOString()
    }
  };

  // API Route for Digital Forensics Metadata Auditing
  app.post("/api/forensics", upload.single("image"), async (req, res) => {
    try {
      const { caseId } = req.body || {};

      // If a specific student Case File was chosen, load its preconfigured audit
      if (caseId && FORENSIC_CASES[caseId]) {
        return res.json(FORENSIC_CASES[caseId]);
      }

      // If an actual custom file was uploaded, perform real-time binary parsing
      if (req.file) {
        const auditReport = auditImageMetadata(req.file.buffer, req.file.originalname, req.file.size);
        return res.json(auditReport);
      }

      return res.status(400).json({
        success: false,
        error: "Please upload an image file or provide a valid Case Study ID."
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: err.message || "Internal error during forensic image audit."
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
