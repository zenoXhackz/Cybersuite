export interface ReconResult {
  success: boolean;
  domain: string;
  ip: string;
  country: string;
  country_code: string;
  city: string;
  region: string;
  latitude: number;
  longitude: number;
  isp: string;
  asn: string;
  warning?: string;
}

export interface ServiceStatus {
  service: string;
  port: number;
  status: "Active" | "Configured" | "Inactive" | "Unreachable";
  latencyMs?: number;
  details: string;
}

export interface DiagnosticResult {
  success: boolean;
  target: string;
  ip: string;
  scanTime: string;
  services: ServiceStatus[];
}

export interface ForensicResult {
  success: boolean;
  hasExif: boolean;
  stats: {
    filename: string;
    format: string;
    fileSizeBytes: number;
    fileSizeReadable: string;
    width: number | string;
    height: number | string;
    colorDepth: string;
    compression: string;
  };
  gps: {
    latitude: number | null;
    longitude: number | null;
    altitude: number | null;
    hasGps: boolean;
  };
  camera: {
    make: string;
    model: string;
    software: string;
    exposureTime: string;
    fNumber: string;
    isoSpeed: string;
    focalLength: string;
    timestamp: string;
  };
  heuristics: {
    isEdited: boolean;
    probableEditor: string;
    integrityScore: number;
    warningFlags: string[];
  };
  scannedAt: string;
}

