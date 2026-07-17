import React, { useState, useEffect, ChangeEvent } from "react";
import { 
  Shield, 
  Globe, 
  MapPin, 
  Server, 
  Terminal, 
  AlertTriangle, 
  FileJson, 
  BookOpen, 
  Copy, 
  Check, 
  Network, 
  Activity, 
  Cpu, 
  CheckCircle2, 
  HelpCircle,
  Code,
  Smartphone,
  CheckCircle,
  XCircle,
  Wifi,
  Database,
  ArrowRight,
  Map,
  Compass,
  Camera,
  FileImage,
  Eye,
  Scale,
  AlertCircle,
  Info,
  UploadCloud
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { DiagnosticResult, ServiceStatus, ReconResult, ForensicResult } from "./types";

export default function App() {
  // Navigation Module State: "recon" | "diagnostics" | "forensics"
  const [activeModule, setActiveModule] = useState<"recon" | "diagnostics" | "forensics">("recon");

  // --- Common Clipboard state ---
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // --- Core Persistent History, Map Toggle, and Keyboard Navigation States ---
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showGpsMap, setShowGpsMap] = useState(true); // default to true for interactive visual map
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  // ==========================================
  // MODULE 1: PASSIVE NETWORK RECON (OSINT) STATE
  // ==========================================
  const [reconDomain, setReconDomain] = useState("cloudflare.com");
  const [reconLoading, setReconLoading] = useState(false);
  const [reconData, setReconData] = useState<ReconResult | null>(null);
  const [reconError, setReconError] = useState<string | null>(null);
  const [activeReconTab, setActiveReconTab] = useState<"flask" | "json" | "educational" | "flutterflow">("flask");

  const reconPresets = [
    "cloudflare.com",
    "dns.google",
    "wikipedia.org",
    "nasa.gov"
  ];

  // Run the live OSINT reconnaissance lookup
  const runOSINTRecon = async (domainTarget: string) => {
    if (!domainTarget.trim()) return;
    setReconLoading(true);
    setReconError(null);
    setReconData(null);

    try {
      const response = await fetch("/api/recon", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ domain: domainTarget.trim() }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to complete OSINT lookup.");
      }

      setReconData(data);
      addToHistory("recon", domainTarget.trim(), "success", data);
    } catch (err: any) {
      setReconError(err.message || "An error occurred while connecting to recon API.");
    } finally {
      setReconLoading(false);
    }
  };

  // ==========================================
  // MODULE 2: SERVICE DIAGNOSTICS (TCP) STATE
  // ==========================================
  const [diagTarget, setDiagTarget] = useState("dns.google");
  const [diagLoading, setDiagLoading] = useState(false);
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult | null>(null);
  const [diagError, setDiagError] = useState<string | null>(null);
  const [activeDiagTab, setActiveDiagTab] = useState<"frontend" | "backend" | "json" | "educational">("frontend");

  const diagPresets = [
    "dns.google",
    "cloudflare.com",
    "wikipedia.org",
    "nasa.gov"
  ];

  // Perform the actual network verification check
  const runDiagnosticCheck = async (targetHost: string) => {
    if (!targetHost.trim()) return;
    setDiagLoading(true);
    setDiagError(null);
    setDiagnostics(null);

    try {
      const response = await fetch("/api/diagnostics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ target: targetHost.trim() }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to resolve target diagnostic suite.");
      }

      setDiagnostics(data);
      addToHistory("diagnostics", targetHost.trim(), "success", data);
    } catch (err: any) {
      setDiagError(err.message || "An error occurred while connecting to local diagnostics.");
    } finally {
      setDiagLoading(false);
    }
  };

  // ==========================================
  // MODULE 3: DIGITAL FORENSICS (EXIF) STATE
  // ==========================================
  const [forensicCaseId, setForensicCaseId] = useState<string>("dslr_original");
  const [forensicLoading, setForensicLoading] = useState(false);
  const [forensicData, setForensicData] = useState<ForensicResult | null>(null);
  const [forensicError, setForensicError] = useState<string | null>(null);
  const [activeForensicTab, setActiveForensicTab] = useState<"reactnative" | "flask" | "json" | "educational">("reactnative");

  const runForensicAudit = async (caseIdOrFile: string | File) => {
    setForensicLoading(true);
    setForensicError(null);
    setForensicData(null);

    try {
      let response;
      if (typeof caseIdOrFile === "string") {
        response = await fetch("/api/forensics", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ caseId: caseIdOrFile }),
        });
      } else {
        const formData = new FormData();
        formData.append("image", caseIdOrFile);
        response = await fetch("/api/forensics", {
          method: "POST",
          body: formData,
        });
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to process image file metadata.");
      }

      setForensicData(data as ForensicResult);
      const label = typeof caseIdOrFile === "string" ? `Case: ${caseIdOrFile.toUpperCase()}` : caseIdOrFile.name;
      addToHistory("forensics", label, data.heuristics.integrityScore >= 80 ? "success" : "warning", data);
    } catch (err: any) {
      setForensicError(err.message || "An error occurred during forensic image analysis.");
    } finally {
      setForensicLoading(false);
    }
  };

  const handleCustomFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    runForensicAudit(file);
  };

  // Common clipboard helper
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  // --- Dynamic History Log Manager ---
  const addToHistory = (type: "recon" | "diagnostics" | "forensics", target: string, status: "success" | "warning" | "error", data: any) => {
    const newItem = {
      id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      type,
      target,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      status,
      data
    };
    setHistory(prev => {
      const filtered = prev.filter(item => !(item.type === type && item.target.toLowerCase() === target.toLowerCase()));
      return [newItem, ...filtered].slice(0, 15); // keep last 15 queries
    });
  };

  const selectHistoryItem = (item: any) => {
    setActiveModule(item.type);
    if (item.type === "recon") {
      setReconData(item.data);
      setReconDomain(item.target);
    } else if (item.type === "diagnostics") {
      setDiagnostics(item.data);
      setDiagTarget(item.target);
    } else if (item.type === "forensics") {
      setForensicData(item.data);
      if (item.target.startsWith("Case: ")) {
        setForensicCaseId(item.target.replace("Case: ", "").toLowerCase());
      } else {
        setForensicCaseId("custom");
      }
    }
  };

  // --- Export Report Utilities (Educational/Defense Audit formats) ---
  const downloadTextReport = (moduleName: string, data: any) => {
    if (!data) return;
    let content = `# EDUCATIONAL PURPOSES ONLY. UNAUTHORIZED USE IS ILLEGAL.\n`;
    content += `======================================================================\n`;
    content += `  ETHICAL HACKING & OSINT SUITE - ${moduleName.toUpperCase()} RECON REPORT  \n`;
    content += `  Generated: ${new Date().toUTCString()}                                \n`;
    content += `======================================================================\n\n`;

    if (moduleName === "recon") {
      content += `[+] SCAN STATUS   : SUCCESS\n`;
      content += `[+] TARGET DOMAIN : ${data.domain || 'N/A'}\n`;
      content += `[+] RESOLVED IP   : ${data.ip || 'N/A'}\n`;
      content += `[+] ISP PROVIDER  : ${data.isp || 'N/A'}\n`;
      content += `[+] ASN           : ${data.asn || 'N/A'}\n`;
      content += `[+] LOCATION      : ${data.city || 'N/A'}, ${data.region || 'N/A'}, ${data.country || 'N/A'} (${data.country_code || 'N/A'})\n`;
      content += `[+] COORDINATES   : Lat: ${data.latitude || 'N/A'}, Lon: ${data.longitude || 'N/A'}\n\n`;
      content += `[=] DNS RESOLUTION DETAILS:\n`;
      if (data.dns) {
        Object.entries(data.dns).forEach(([recordType, records]: [string, any]) => {
          content += `\n  - ${recordType} Records:\n`;
          if (Array.isArray(records)) {
            records.forEach((rec: any) => {
              content += `    • ${typeof rec === 'string' ? rec : JSON.stringify(rec)}\n`;
            });
          } else {
            content += `    • ${JSON.stringify(records)}\n`;
          }
        });
      }
    } else if (moduleName === "diagnostics") {
      content += `[+] DIAGNOSTIC TARGET : ${data.target || 'N/A'}\n`;
      content += `[+] TARGET IP ADDRESS : ${data.ip || 'N/A'}\n`;
      content += `[+] DIAGNOSTIC TIME   : ${data.scanTime || 'N/A'}\n\n`;
      content += `[=] PORT AUDIT LOGS:\n`;
      if (data.services) {
        data.services.forEach((s: any) => {
          content += `  - Port ${s.port} (${s.service || s.name || 'Unknown'}):\n`;
          content += `    • Status : ${s.status}\n`;
          content += `    • Latency: ${s.latencyMs || s.rttMs || 'N/A'} ms\n`;
          content += `    • Banner : ${s.details || 'N/A'}\n\n`;
        });
      }
    } else if (moduleName === "forensics") {
      content += `[+] EVIDENCE FILE : ${data.stats?.filename || 'N/A'}\n`;
      content += `[+] FILE FORMAT   : ${data.stats?.format || 'N/A'}\n`;
      content += `[+] FILE SIZE     : ${data.stats?.fileSizeReadable || 'N/A'}\n`;
      content += `[+] RESOLUTION    : ${data.stats?.width} x ${data.stats?.height}\n`;
      content += `[+] COMPRESSION   : ${data.stats?.compression || 'N/A'}\n\n`;
      content += `[=] HARDWARE METADATA (EXIF):\n`;
      content += `  - Camera Make       : ${data.camera?.make || 'N/A'}\n`;
      content += `  - Camera Model      : ${data.camera?.model || 'N/A'}\n`;
      content += `  - Device Software   : ${data.camera?.software || 'N/A'}\n`;
      content += `  - Shutter speed     : ${data.camera?.exposureTime || 'N/A'}\n`;
      content += `  - Aperture Value    : ${data.camera?.fNumber || 'N/A'}\n`;
      content += `  - ISO speed rating  : ${data.camera?.isoSpeed || 'N/A'}\n`;
      content += `  - Focal Length      : ${data.camera?.focalLength || 'N/A'}\n`;
      content += `  - Exposure timestamp: ${data.camera?.timestamp || 'N/A'}\n\n`;
      content += `[=] GEOLOCATION DATA:\n`;
      content += `  - GPS Embedded      : ${data.gps?.hasGps ? 'YES' : 'NO'}\n`;
      if (data.gps?.hasGps) {
        content += `  - Latitude          : ${data.gps?.latitude}\n`;
        content += `  - Longitude         : ${data.gps?.longitude}\n`;
        content += `  - Altitude          : ${data.gps?.altitude || 'N/A'} m\n`;
      }
      content += `\n[=] INTEGRITY AUDIT:\n`;
      content += `  - Forensic Score    : ${data.heuristics?.integrityScore} / 100\n`;
      content += `  - Probable Editor   : ${data.heuristics?.probableEditor || 'None'}\n`;
      if (data.heuristics?.warningFlags && data.heuristics.warningFlags.length > 0) {
        content += `  - Warning Logs:\n`;
        data.heuristics.warningFlags.forEach((w: string) => {
          content += `    • ${w}\n`;
        });
      }
    }

    content += `\n======================================================================\n`;
    content += `               END OF REPORT - EDUCATIONAL ANALYSIS ONLY              \n`;
    content += `======================================================================\n`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${moduleName}_evidence_report_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadJsonReport = (moduleName: string, data: any) => {
    if (!data) return;
    const jsonStr = JSON.stringify({
      reportType: moduleName,
      exportedAt: new Date().toISOString(),
      educationDisclaimer: "EDUCATIONAL PURPOSES ONLY. UNAUTHORIZED USE IS ILLEGAL.",
      payload: data
    }, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${moduleName}_json_payload_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleActiveExport = () => {
    if (activeModule === "recon" && reconData) {
      downloadTextReport("recon", reconData);
    } else if (activeModule === "diagnostics" && diagnostics) {
      downloadTextReport("diagnostics", diagnostics);
    } else if (activeModule === "forensics" && forensicData) {
      downloadTextReport("forensics", forensicData);
    }
  };

  // --- Keyboard Shortcuts Listener ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return;
      }

      if (e.altKey && e.key === "1") {
        e.preventDefault();
        setActiveModule("recon");
      } else if (e.altKey && e.key === "2") {
        e.preventDefault();
        setActiveModule("diagnostics");
      } else if (e.altKey && e.key === "3") {
        e.preventDefault();
        setActiveModule("forensics");
      } else if (e.altKey && e.key?.toLowerCase() === "h") {
        e.preventDefault();
        setShowHistory(prev => !prev);
      } else if (e.altKey && e.key?.toLowerCase() === "e") {
        e.preventDefault();
        handleActiveExport();
      } else if (e.altKey && e.key?.toLowerCase() === "k") {
        e.preventDefault();
        setShowShortcutsModal(prev => !prev);
      } else if (e.altKey && e.key?.toLowerCase() === "m") {
        e.preventDefault();
        if (activeModule === "forensics") {
          setShowGpsMap(prev => !prev);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeModule, reconData, diagnostics, forensicData]);

  // Run initial scans on mount to pre-populate beautiful interfaces
  useEffect(() => {
    runOSINTRecon("cloudflare.com");
    runDiagnosticCheck("dns.google");
    runForensicAudit("dslr_original");
  }, []);

  // ==========================================
  // SOURCE CODES & ASSETS
  // ==========================================

  const pythonFlaskCode = `# EDUCATIONAL PURPOSES ONLY. UNAUTHORIZED USE IS ILLEGAL.
"""
Filename: app.py
Ethical Hacking Suite - OSINT Network Recon API Route
Language: Python (Flask)
Dependencies: pip install Flask requests
"""

from flask import Flask, request, jsonify
import socket
import requests

app = Flask(__name__)

@app.route('/api/recon', methods=['POST'])
def network_recon():
    """
    OSINT Passive Reconnaissance Endpoint.
    Resolves a target domain name to retrieve its active IP address,
    then queries standard geolocation tables and Autonomous System (ASN) records.
    """
    try:
      data = request.get_json() or {}
      domain = data.get('domain', '').strip()

      if not domain:
          return jsonify({
              'success': False,
              'error': 'Domain parameter is required and must be a string.'
          }), 400

      # Sanitize inputs: extract standard hostname structure
      clean_domain = domain.lower()
      for prefix in ['https://', 'http://', 'www.']:
          if clean_domain.startswith(prefix):
              clean_domain = clean_domain[len(prefix):]
      clean_domain = clean_domain.split('/')[0].split(':')[0]

      if not clean_domain:
          return jsonify({
              'success': False,
              'error': 'Invalid domain name structure provided.'
          }), 400

      # 1. DNS Resolution (Retrieve active A-Record IP)
      try:
          ip_address = socket.gethostbyname(clean_domain)
      except socket.gaierror as dns_err:
          return jsonify({
              'success': False,
              'error': f"Failed to resolve DNS record for '{clean_domain}': {str(dns_err)}"
          }), 404

      # 2. IP Geolocation Query (Retrieve Location & ISP details)
      try:
          # Querying standard ip-api table for routing registry analysis
          geo_url = f"http://ip-api.com/json/{ip_address}"
          response = requests.get(geo_url, timeout=5)
          geo_data = response.json()

          if geo_data.get('status') == 'fail':
              return jsonify({
                  'success': False,
                  'error': geo_data.get('message', 'Failed to fetch registry coordinates.')
              }), 400

          return jsonify({
              'success': True,
              'domain': clean_domain,
              'ip': ip_address,
              'country': geo_data.get('country', 'Unknown'),
              'country_code': geo_data.get('countryCode', 'N/A'),
              'city': geo_data.get('city', 'Unknown'),
              'region': geo_data.get('regionName', 'Unknown'),
              'latitude': geo_data.get('lat', 0.0),
              'longitude': geo_data.get('lon', 0.0),
              'isp': geo_data.get('isp', 'Unknown'),
              'asn': geo_data.get('as', 'Unknown')
          }), 200

      except requests.exceptions.RequestException as http_err:
          # Fallback: DNS succeeded, but public geodb was unreachable
          return jsonify({
              'success': True,
              'domain': clean_domain,
              'ip': ip_address,
              'country': 'Unknown',
              'country_code': 'N/A',
              'city': 'Unknown',
              'region': 'Unknown',
              'latitude': 0.0,
              'longitude': 0.0,
              'isp': 'Unknown',
              'asn': 'Unknown',
              'warning': f"DNS query completed, but GeoIP database lookup failed: {str(http_err)}"
          }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'error': f"An unexpected system exception occurred: {str(e)}"
        }), 500

if __name__ == '__main__':
    # Initialize the educational server on localhost
    print("Initializing Flask Hacking Suite Backend at http://127.0.0.1:5000")
    app.run(host='0.0.0.0', port=5000, debug=True)
`;

  const reconJsonSchemaCode = `{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "NetworkReconResponse",
  "type": "object",
  "description": "JSON Response schema for mapping Network Recon custom actions directly in FlutterFlow and Thunkable",
  "properties": {
    "success": {
      "type": "boolean",
      "example": true
    },
    "domain": {
      "type": "string",
      "example": "cloudflare.com"
    },
    "ip": {
      "type": "string",
      "example": "104.16.124.96"
    },
    "country": {
      "type": "string",
      "example": "United States"
    },
    "country_code": {
      "type": "string",
      "example": "US"
    },
    "city": {
      "type": "string",
      "example": "San Francisco"
    },
    "region": {
      "type": "string",
      "example": "California"
    },
    "latitude": {
      "type": "number",
      "example": 37.7749
    },
    "longitude": {
      "type": "number",
      "example": -122.4194
    },
    "isp": {
      "type": "string",
      "example": "Cloudflare, Inc."
    },
    "asn": {
      "type": "string",
      "example": "AS13335 Cloudflare, Inc."
    }
  },
  "required": [
    "success",
    "domain",
    "ip",
    "country",
    "city",
    "isp"
  ]
}`;

  const backendCode = `// EDUCATIONAL PURPOSES ONLY. UNAUTHORIZED USE IS ILLEGAL.
/**
 * file: backend/modules/network.js
 * Express Node.js Service Diagnostics module
 */

import net from "net";
import dns from "dns";

// Standard diagnostic service mappings to focus on troubleshooting service deployment
const SERVICE_TEMPLATES = [
  { name: "FTP File Transfer", port: 21, activeLabel: "FTP Service Active", inactiveLabel: "FTP Service Closed" },
  { name: "SSH Remote Access", port: 22, activeLabel: "SSH Service Configured", inactiveLabel: "SSH Service Closed" },
  { name: "SMTP Mail Relay", port: 25, activeLabel: "SMTP Server Configured", inactiveLabel: "SMTP Service Closed" },
  { name: "DNS Name Server", port: 53, activeLabel: "DNS Resolver Active", inactiveLabel: "DNS Resolver Offline" },
  { name: "HTTP Web Server", port: 80, activeLabel: "HTTP Service Active", inactiveLabel: "HTTP Service Inactive" },
  { name: "HTTPS Secure Web", port: 443, activeLabel: "HTTPS Secure Active", inactiveLabel: "HTTPS Secure Closed" },
  { name: "PostgreSQL Database", port: 5432, activeLabel: "PostgreSQL Engine Active", inactiveLabel: "PostgreSQL Database Closed" },
  { name: "MySQL Database", port: 3306, activeLabel: "MySQL Database Active", inactiveLabel: "MySQL Database Closed" }
];

/**
 * Checks service availability on a target port with a non-intrusive TCP handshake check.
 */
export function checkServiceAvailability(host, port, timeoutMs = 1500) {
  return new Promise((resolve) => {
    const start = Date.now();
    const socket = new net.Socket();
    
    socket.setTimeout(timeoutMs);
    
    socket.connect(port, host, () => {
      const latencyMs = Date.now() - start;
      socket.destroy();
      resolve({ available: true, latencyMs });
    });

    socket.on("error", () => {
      socket.destroy();
      resolve({ available: false });
    });

    socket.on("timeout", () => {
      socket.destroy();
      resolve({ available: false, timeout: true });
    });
  });
}

/**
 * Executes a full diagnostic suite run on a specified hostname/IP.
 */
export async function runNetworkDiagnostics(targetHost) {
  let cleanHost = targetHost
    .trim()
    .toLowerCase()
    .replace(/^(https?:\\/\\/)?(www\\.)?/, "")
    .split("/")[0]
    .split(":")[0];

  if (!cleanHost) {
    throw new Error("Invalid target hostname format.");
  }

  let ipAddress = cleanHost;
  try {
    const lookup = await dns.promises.lookup(cleanHost);
    ipAddress = lookup.address;
  } catch (err) {
    // Fallback if DNS resolution fails, attempt straight host connection
  }

  const results = [];

  for (const template of SERVICE_TEMPLATES) {
    const check = await checkServiceAvailability(ipAddress, template.port);
    
    results.push({
      service: template.name,
      port: template.port,
      status: check.available ? "Active" : "Inactive",
      latencyMs: check.available ? check.latencyMs : undefined,
      details: check.available ? template.activeLabel : template.inactiveLabel
    });
  }

  return {
    success: true,
    target: cleanHost,
    ip: ipAddress,
    scanTime: new Date().toISOString(),
    services: results
  };
}`;

  const frontendRNCode = `// EDUCATIONAL PURPOSES ONLY. UNAUTHORIZED USE IS ILLEGAL.
/**
 * file: NetworkTool.js
 * React Native / Expo Service Diagnostics Component
 */

import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  StatusBar,
  Alert
} from 'react-native';

export default function NetworkTool() {
  const [target, setTarget] = useState('127.0.0.1');
  const [isLoading, setIsLoading] = useState(false);
  const [diagnostics, setDiagnostics] = useState(null);

  const runServiceCheck = async () => {
    if (!target.trim()) {
      Alert.alert("Input Error", "Please provide a target hostname.");
      return;
    }

    setIsLoading(true);
    setDiagnostics(null);

    try {
      const response = await fetch('https://YOUR_API_GATEWAY/api/diagnostics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: target.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        setDiagnostics(data);
      } else {
        Alert.alert("Diagnostic Failure", data.error || "Lookup aborted.");
      }
    } catch (err) {
      Alert.alert("Connection Error", "Diagnostics gateway is currently offline.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderServiceCard = ({ item }) => {
    const isActive = item.status === "Active";
    return (
      <View style={[styles.card, isActive ? styles.cardActive : styles.cardInactive]}>
        <View style={styles.cardHeader}>
          <Text style={styles.serviceName}>{item.service}</Text>
          <Text style={styles.portLabel}>Port {item.port}</Text>
        </View>
        <View style={styles.statusRow}>
          <View style={[styles.statusIndicator, isActive ? styles.indicatorActive : styles.indicatorInactive]} />
          <Text style={[styles.statusText, isActive ? styles.textActive : styles.textInactive]}>
            {item.details}
          </Text>
        </View>
        {isActive && item.latencyMs && (
          <Text style={styles.latencyText}>Latency: {item.latencyMs}ms</Text>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SECURE NETWORK TOOL</Text>
        <Text style={styles.headerSubtitle}>Service Availability Auditor</Text>
      </View>

      <View style={styles.consoleCard}>
        <Text style={styles.inputLabel}>Diagnostic Host Target</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., local server IP, hostname"
          placeholderTextColor="#475569"
          value={target}
          onChangeText={setTarget}
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.button} onPress={runServiceCheck} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#020617" size="small" />
          ) : (
            <Text style={styles.buttonText}>VERIFY SERVICE HEALTH</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Results or Loading */}
      {/* List / Scroll indicators go here */}
    </SafeAreaView>
  );
}`;

  const jsonSchemaCode = `{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "NetworkDiagnosticResponse",
  "type": "object",
  "description": "Standardized schema for service availability checks used in FlutterFlow and Thunkable",
  "properties": {
    "success": {
      "type": "boolean",
      "example": true
    },
    "target": {
      "type": "string",
      "example": "dns.google"
    },
    "ip": {
      "type": "string",
      "example": "8.8.8.8"
    },
    "scanTime": {
      "type": "string",
      "format": "date-time"
    },
    "services": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "service": { "type": "string", "example": "HTTP Web Server" },
          "port": { "type": "integer", "example": 80 },
          "status": { "type": "string", "enum": ["Active", "Inactive"] },
          "latencyMs": { "type": "integer", "example": 15 },
          "details": { "type": "string", "example": "HTTP Service Active" }
        },
        "required": ["service", "port", "status", "details"]
      }
    }
  },
  "required": ["success", "target", "ip", "services"]
}`;

  const forensicsPythonFlaskCode = `# EDUCATIONAL PURPOSES ONLY. UNAUTHORIZED USE IS ILLEGAL.
"""
Filename: forensics_api.py
Ethical Hacking & Digital Forensics Suite - Metadata File Analysis
Language: Python (Flask)
Dependencies: pip install Flask exifread
"""

from flask import Flask, request, jsonify
import exifread
import os

app = Flask(__name__)

def parse_exif(file_stream):
    try:
        tags = exifread.process_file(file_stream, details=False)
        def safe_get(key):
            val = tags.get(key)
            return str(val) if val else None

        camera_details = {
            "make": safe_get("Image Make") or "Unknown Maker",
            "model": safe_get("Image Model") or "Unknown Model",
            "software": safe_get("Image Software") or "Original Firmware",
            "exposureTime": safe_get("EXIF ExposureTime") or "1/125s",
            "fNumber": safe_get("EXIF FNumber") or "f/2.8",
            "isoSpeed": safe_get("EXIF ISOSpeedRatings") or "ISO 200",
            "focalLength": safe_get("EXIF FocalLength") or "50mm",
            "timestamp": safe_get("EXIF DateTimeOriginal") or safe_get("Image DateTime") or "Unknown Capture Time"
        }
        
        lat = safe_get("GPS GPSLatitude")
        lon = safe_get("GPS GPSLongitude")
        
        gps_details = {
            "hasGps": lat is not None and lon is not None,
            "latitude": lat,
            "longitude": lon,
            "altitude": safe_get("GPS GPSAltitude")
        }
        return camera_details, gps_details, True
    except Exception:
        return {}, {}, False

@app.route('/api/forensics', methods=['POST'])
def analyze_image_file():
    if 'image' not in request.files:
        return jsonify({'success': False, 'error': 'No file payload provided under key "image".'}), 400
        
    image_file = request.files['image']
    if image_file.filename == '':
        return jsonify({'success': False, 'error': 'Empty filename uploaded.'}), 400

    try:
        image_file.seek(0, os.SEEK_END)
        size_bytes = image_file.tell()
        image_file.seek(0)
        
        filename = image_file.filename
        extension = filename.split('.')[-1].lower() if '.' in filename else ''
        
        camera_details, gps_details, has_exif = parse_exif(image_file)
        
        is_edited = False
        probable_editor = "None detected"
        warning_flags = []
        integrity_score = 100
        
        software_tag = camera_details.get("software", "")
        editors = ["photoshop", "gimp", "pixelmator", "lightroom", "paint.net", "canva"]
        for editor in editors:
            if editor in software_tag.lower() or editor in filename.lower():
                is_edited = True
                probable_editor = editor.capitalize()
                warning_flags.append(f"Software Signature Identified: '{editor.capitalize()}' logged in headers.")
                integrity_score -= 40
                
        if (extension in ['jpg', 'jpeg']) and not has_exif:
            is_edited = True
            probable_editor = "Unknown Editor (EXIF Stripped)"
            warning_flags.append("EXIF metadata completely stripped. Indicates web download or export.")
            integrity_score -= 35
            
        integrity_score = max(0, min(100, integrity_score))
        size_readable = f"{size_bytes / 1024:.1f} KB" if size_bytes < 1024 * 1024 else f"{size_bytes / (1024*1024):.2f} MB"
        
        return jsonify({
            'success': True,
            'hasExif': has_exif,
            'stats': {
                'filename': filename,
                'format': extension.upper() or "JPEG",
                'fileSizeBytes': size_bytes,
                'fileSizeReadable': size_readable,
                'width': 1200,
                'height': 800,
                'colorDepth': "24-bit RGB (Default)",
                'compression': 'Lossy (JPEG/DCT)'
            },
            'gps': gps_details,
            'camera': camera_details,
            'heuristics': {
                'isEdited': is_edited,
                'probableEditor': probable_editor,
                'integrityScore': integrity_score,
                'warningFlags': warning_flags
            },
            'scannedAt': "2026-07-17T03:00:00Z"
        }), 200
    except Exception as err:
        return jsonify({'success': False, 'error': str(err)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
`;

  const forensicsReactNativeCode = `// EDUCATIONAL PURPOSES ONLY. UNAUTHORIZED USE IS ILLEGAL.
/**
 * file: ForensicsTool.js
 * React Native / Expo Image Picker Metadata Audit Screen
 * Dependencies: expo-image-picker
 */

import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ActivityIndicator, ScrollView, Alert, SafeAreaView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function ForensicsTool() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [forensicData, setForensicData] = useState(null);

  const pickLocalImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "Gallery permissions required to audit image metadata!");
      return;
    }
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });
    if (pickerResult.canceled) return;

    const uri = pickerResult.assets[0].uri;
    setSelectedImage(uri);
    uploadAndAuditImage(uri);
  };

  const uploadAndAuditImage = async (fileUri) => {
    setLoading(true);
    setForensicData(null);
    const uriParts = fileUri.split('/');
    const fileName = uriParts[uriParts.length - 1];
    const fileType = fileName.split('.').pop();

    const formData = new FormData();
    formData.append('image', {
      uri: fileUri,
      name: fileName,
      type: \`image/\${fileType === 'png' ? 'png' : 'jpeg'}\`,
    });

    try {
      const response = await fetch('https://YOUR_API_GATEWAY/api/forensics', {
        method: 'POST',
        headers: { 'Content-Type': 'multipart/form-data' },
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        setForensicData(data);
      } else {
        Alert.alert("Analysis Failed", data.error || "The gateway refused this image.");
      }
    } catch (error) {
      Alert.alert("Gateway Offline", "Could not connect to the forensic analysis server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>FORENSIC META-AUDITOR</Text>
          <Text style={styles.headerSubtitle}>Evidence Header Verifier</Text>
        </View>

        <TouchableOpacity style={styles.pickerButton} onPress={pickLocalImage} disabled={loading}>
          {loading ? <ActivityIndicator color="#020617" size="small" /> : <Text style={styles.pickerButtonText}>SELECT EVIDENCE PHOTO</Text>}
        </TouchableOpacity>

        {selectedImage && <Image source={{ uri: selectedImage }} style={styles.imagePreview} />}

        {forensicData && (
          <View style={styles.forensicCard}>
            <View style={styles.integrityHeader}>
              <Text style={styles.cardSectionTitle}>FILE INTEGRITY REPORT</Text>
              <Text style={[styles.integrityBadge, forensicData.heuristics.integrityScore >= 80 ? styles.badgeHigh : styles.badgeLow]}>
                Score: {forensicData.heuristics.integrityScore}/100
              </Text>
            </View>

            <View style={styles.dataSection}>
              <Text style={styles.sectionHeading}>Basic File Statistics</Text>
              <View style={styles.dataRow}><Text style={styles.dataLabel}>File Name</Text><Text style={styles.dataValue}>{forensicData.stats.filename}</Text></View>
              <View style={styles.dataRow}><Text style={styles.dataLabel}>Dimensions</Text><Text style={styles.dataValue}>{forensicData.stats.width} x {forensicData.stats.height} px</Text></View>
              <View style={styles.dataRow}><Text style={styles.dataLabel}>File Size</Text><Text style={styles.dataValue}>{forensicData.stats.fileSizeReadable}</Text></View>
            </View>

            <View style={styles.dataSection}>
              <Text style={styles.sectionHeading}>Hardware EXIF Headers</Text>
              <View style={styles.dataRow}><Text style={styles.dataLabel}>Device Make</Text><Text style={styles.dataValue}>{forensicData.camera.make}</Text></View>
              <View style={styles.dataRow}><Text style={styles.dataLabel}>Device Model</Text><Text style={styles.dataValue}>{forensicData.camera.model}</Text></View>
              <View style={styles.dataRow}><Text style={styles.dataLabel}>Timestamp</Text><Text style={styles.dataValue}>{forensicData.camera.timestamp}</Text></View>
            </View>

            {forensicData.heuristics.warningFlags.length > 0 && (
              <View style={styles.warningsContainer}>
                <Text style={styles.warningsTitle}>⚠️ SUSPICIOUS ANOMALIES DETECTED</Text>
                {forensicData.heuristics.warningFlags.map((flag, idx) => (
                  <Text key={idx} style={styles.warningText}>• {flag}</Text>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  scrollContainer: { padding: 16 },
  header: { marginBottom: 20, alignItems: 'center' },
  headerTitle: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  headerSubtitle: { color: '#64748b', fontSize: 11, marginTop: 4 },
  pickerButton: { backgroundColor: '#10b981', padding: 12, borderRadius: 8, alignItems: 'center', marginVertical: 12 },
  pickerButtonText: { color: '#020617', fontWeight: 'bold' },
  imagePreview: { width: '100%', height: 200, borderRadius: 8, resizeMode: 'cover' },
  forensicCard: { backgroundColor: '#0f172a', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#334155' },
  integrityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#1e293b', paddingBottom: 10, marginBottom: 14 },
  cardSectionTitle: { color: '#94a3b8', fontSize: 12, fontWeight: 'bold' },
  integrityBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, fontSize: 11, fontWeight: 'bold' },
  badgeHigh: { backgroundColor: '#064e3b', color: '#34d399' },
  badgeLow: { backgroundColor: '#7f1d1d', color: '#f87171' },
  dataSection: { marginBottom: 16 },
  sectionHeading: { color: '#10b981', fontSize: 11, fontWeight: 'bold', marginBottom: 8 },
  dataRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  dataLabel: { color: '#64748b', fontSize: 11 },
  dataValue: { color: '#ffffff', fontSize: 11 },
  warningsContainer: { backgroundColor: '#451a03', borderColor: '#b45309', borderWidth: 1, borderRadius: 8, padding: 12 },
  warningsTitle: { color: '#f59e0b', fontSize: 11, fontWeight: 'bold' },
  warningText: { color: '#fef3c7', fontSize: 10 },
});
`;

  const forensicsJsonSchemaCode = `{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "DigitalForensicsResponse",
  "type": "object",
  "description": "Standardized schema for digital forensics metadata audit responses used in FlutterFlow and Thunkable",
  "properties": {
    "success": {
      "type": "boolean",
      "example": true
    },
    "hasExif": {
      "type": "boolean",
      "example": true
    },
    "stats": {
      "type": "object",
      "properties": {
        "filename": { "type": "string", "example": "IMG_4912.JPG" },
        "format": { "type": "string", "example": "JPEG" },
        "fileSizeBytes": { "type": "integer", "example": 4821034 },
        "fileSizeReadable": { "type": "string", "example": "4.60 MB" },
        "width": { "type": "integer", "example": 5184 },
        "height": { "type": "integer", "example": 3456 },
        "colorDepth": { "type": "string", "example": "24-bit RGB" },
        "compression": { "type": "string", "example": "Lossy (JPEG)" }
      }
    },
    "gps": {
      "type": "object",
      "properties": {
        "latitude": { "type": ["number", "null"], "example": 34.0522 },
        "longitude": { "type": ["number", "null"], "example": -118.2437 },
        "altitude": { "type": ["number", "null"], "example": 84.5 },
        "hasGps": { "type": "boolean", "example": true }
      }
    },
    "camera": {
      "type": "object",
      "properties": {
        "make": { "type": "string", "example": "Canon" },
        "model": { "type": "string", "example": "Canon EOS 5D Mark IV" },
        "software": { "type": "string", "example": "Firmware v1.2.1" },
        "exposureTime": { "type": "string", "example": "1/125s" },
        "fNumber": { "type": "string", "example": "f/2.8" },
        "isoSpeed": { "type": "string", "example": "ISO 400" },
        "focalLength": { "type": "string", "example": "50mm" },
        "timestamp": { "type": "string", "format": "date-time", "example": "2026-04-12T14:23:45.000Z" }
      }
    },
    "heuristics": {
      "type": "object",
      "properties": {
        "isEdited": { "type": "boolean", "example": false },
        "probableEditor": { "type": "string", "example": "None detected" },
        "integrityScore": { "type": "integer", "example": 100 },
        "warningFlags": {
          "type": "array",
          "items": { "type": "string" }
        }
      }
    }
  },
  "required": ["success", "hasExif", "stats", "gps", "camera", "heuristics"]
}`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Header premium cyber-hacking dynamic aesthetic band */}
      <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 w-full" />

      {/* Primary Navigation & Suite Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="bg-emerald-950/60 border border-emerald-500/30 p-2.5 rounded-lg text-emerald-400">
              <Shield className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold font-mono tracking-tight text-white uppercase">
                  Ethical Hacking & OSINT Suite
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-950/80 border border-emerald-500/40 text-emerald-400">
                  <Terminal className="w-3 h-3 mr-1" /> CORE v1.0
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Passive Open Source Intelligence (OSINT) and Active Network Troubleshooting Modules.
              </p>
            </div>
          </div>

          {/* Module Selector (Toggles between Passive Recon, Active Diagnostics, & Forensics) */}
          <div className="flex items-center w-full md:w-auto bg-slate-900 border border-slate-800 p-1 sm:p-1.5 rounded-xl gap-0.5 sm:gap-1">
            <button
              onClick={() => setActiveModule("recon")}
              className={`flex items-center justify-center gap-1.5 px-2.5 sm:px-4 py-2 rounded-lg text-xs font-mono font-bold transition cursor-pointer flex-1 md:flex-none ${
                activeModule === "recon"
                  ? "bg-emerald-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Globe className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">1. Passive Recon (OSINT)</span>
              <span className="inline sm:hidden">1. OSINT</span>
            </button>
            <button
              onClick={() => setActiveModule("diagnostics")}
              className={`flex items-center justify-center gap-1.5 px-2.5 sm:px-4 py-2 rounded-lg text-xs font-mono font-bold transition cursor-pointer flex-1 md:flex-none ${
                activeModule === "diagnostics"
                  ? "bg-emerald-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Network className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">2. Service Diagnostics</span>
              <span className="inline sm:hidden">2. Diagnostic</span>
            </button>
            <button
              onClick={() => setActiveModule("forensics")}
              className={`flex items-center justify-center gap-1.5 px-2.5 sm:px-4 py-2 rounded-lg text-xs font-mono font-bold transition cursor-pointer flex-1 md:flex-none ${
                activeModule === "forensics"
                  ? "bg-emerald-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Camera className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">3. Forensic Audit</span>
              <span className="inline sm:hidden">3. Forensics</span>
            </button>
          </div>

          {/* Educational Safety Banner */}
          <div className="hidden lg:flex items-center gap-2 bg-red-950/40 border border-red-500/20 px-4 py-2.5 rounded-lg text-red-200">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span className="text-[10px] font-mono font-medium tracking-wide">
              EDUCATIONAL PURPOSES ONLY. UNAUTHORIZED USE IS ILLEGAL.
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Global Action Commands Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-slate-900/60 border border-slate-900 rounded-2xl p-4 mb-6 backdrop-blur-sm shadow-lg">
          {/* Quick Info & Active State */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="relative block w-2.5 h-2.5 rounded-full bg-emerald-500" />
            </div>
            <div>
              <span className="text-[9px] font-mono text-slate-500 uppercase block tracking-wider font-bold">
                AUDITING SESSION ACTIVE
              </span>
              <span className="text-xs font-mono text-white font-semibold">
                Module: <span className="text-emerald-400 capitalize">{activeModule === "recon" ? "Passive OSINT" : activeModule === "diagnostics" ? "Service Diagnostics" : "Forensics Meta Auditor"}</span>
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* History Toggle Button */}
            <button
              onClick={() => setShowHistory(prev => !prev)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono font-semibold transition border cursor-pointer ${
                showHistory
                  ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow"
                  : "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Session Logs
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                showHistory ? "bg-slate-950 text-emerald-400" : "bg-slate-900 text-slate-400"
              }`}>
                {history.length}
              </span>
            </button>

            {/* Keyboard Shortcuts Trigger */}
            <button
              onClick={() => setShowShortcutsModal(true)}
              className="flex items-center gap-2 px-3 py-2 bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-700 hover:text-white rounded-xl text-xs font-mono font-semibold transition cursor-pointer"
            >
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              Shortcuts (Alt+K)
            </button>

            {/* Split Export Reports */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl overflow-hidden p-0.5">
              <span className="text-[9px] font-mono text-slate-500 uppercase font-bold px-2.5 hidden sm:inline">
                EXPORT REPORT:
              </span>
              
              <button
                onClick={handleActiveExport}
                disabled={!(activeModule === "recon" ? reconData : activeModule === "diagnostics" ? diagnostics : forensicData)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-850 disabled:opacity-40 disabled:cursor-not-allowed text-emerald-400 hover:text-emerald-300 rounded-lg text-xs font-mono font-bold transition cursor-pointer"
                title="Download report as plain-text readable formatted audit log"
              >
                <FileImage className="w-3.5 h-3.5" />
                TXT Log
              </button>

              <button
                onClick={() => {
                  if (activeModule === "recon") downloadJsonReport("recon", reconData);
                  else if (activeModule === "diagnostics") downloadJsonReport("diagnostics", diagnostics);
                  else if (activeModule === "forensics") downloadJsonReport("forensics", forensicData);
                }}
                disabled={!(activeModule === "recon" ? reconData : activeModule === "diagnostics" ? diagnostics : forensicData)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-850 disabled:opacity-40 disabled:cursor-not-allowed text-cyan-400 hover:text-cyan-300 rounded-lg text-xs font-mono font-bold transition cursor-pointer"
                title="Export raw JSON structured binding payload"
              >
                <FileJson className="w-3.5 h-3.5" />
                JSON Raw
              </button>
            </div>
          </div>
        </div>

        {/* Collapsible Operation History Panel */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ height: 0, opacity: 0, marginBottom: 0 }}
              animate={{ height: "auto", opacity: 1, marginBottom: 24 }}
              exit={{ height: 0, opacity: 0, marginBottom: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                    Operation History Log Drawer
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    (cached scans: {history.length})
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setHistory([])}
                    className="text-[10px] font-mono text-red-400 hover:text-red-300 transition uppercase cursor-pointer"
                  >
                    Clear History
                  </button>
                  <button
                    onClick={() => setShowHistory(false)}
                    className="text-[10px] font-mono text-slate-400 hover:text-white transition uppercase cursor-pointer"
                  >
                    Close [×]
                  </button>
                </div>
              </div>

              {history.length === 0 ? (
                <div className="text-center py-6 text-slate-500 font-mono text-xs leading-relaxed">
                  No active session traces found.<br />Perform lookups, port checks, or EXIF forensics to populate live logs.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[220px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 pr-1">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => selectHistoryItem(item)}
                      className="group relative bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/50 p-2.5 rounded-xl cursor-pointer transition flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                          item.type === "recon"
                            ? "bg-blue-950/80 text-blue-400 border border-blue-500/30"
                            : item.type === "diagnostics"
                            ? "bg-amber-950/80 text-amber-400 border border-amber-500/30"
                            : "bg-emerald-950/80 text-emerald-400 border border-emerald-500/30"
                        }`}>
                          {item.type}
                        </span>
                        <span className="text-[8px] font-mono text-slate-500">
                          {item.timestamp}
                        </span>
                      </div>
                      <div className="text-xs font-mono font-bold text-white truncate mb-1">
                        {item.target}
                      </div>
                      <div className="text-[9px] font-mono text-slate-400 flex items-center justify-between">
                        <span className="text-slate-500 group-hover:text-emerald-400 transition flex items-center gap-0.5">
                          Load Audit <ArrowRight className="w-2.5 h-2.5" />
                        </span>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          item.status === "success" ? "bg-emerald-400" : "bg-amber-400"
                        }`} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Keyboard Shortcuts Dialog Backdrop */}
        <AnimatePresence>
          {showShortcutsModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl relative"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider">
                      Suite Keyboard Shortcuts
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowShortcutsModal(false)}
                    className="text-slate-400 hover:text-white transition text-xs font-mono cursor-pointer"
                  >
                    [×] CLOSE
                  </button>
                </div>

                <p className="text-xs text-slate-400 mb-4 leading-relaxed font-mono">
                  Globally integrated hotkeys to accelerate digital forensics and network recon operations.
                </p>

                <div className="space-y-2.5">
                  {[
                    { keys: ["Alt", "1"], desc: "Switch to Passive OSINT Recon" },
                    { keys: ["Alt", "2"], desc: "Switch to Active Diagnostics" },
                    { keys: ["Alt", "3"], desc: "Switch to Digital Forensics" },
                    { keys: ["Alt", "H"], desc: "Toggle Session History Logs" },
                    { keys: ["Alt", "E"], desc: "Export Active Report (.TXT)" },
                    { keys: ["Alt", "M"], desc: "Toggle GPS Visual Map Radar" },
                    { keys: ["Alt", "K"], desc: "Toggle This Shortcuts Menu" },
                  ].map((shortcut, idx) => (
                    <div key={idx} className="flex items-center justify-between border-b border-slate-800/40 pb-2">
                      <span className="text-xs font-mono text-slate-300">{shortcut.desc}</span>
                      <div className="flex gap-1">
                        {shortcut.keys.map((k, kIdx) => (
                          <kbd key={kIdx} className="bg-slate-950 border border-slate-800 px-1.5 py-0.5 rounded text-[10px] font-mono text-emerald-400 font-bold uppercase shadow">
                            {k}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setShowShortcutsModal(false)}
                  className="mt-6 w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono text-xs rounded-xl transition cursor-pointer"
                >
                  ACKNOWLEDGE & CLOSE
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        
        {/* Module Content Switcher */}
        <AnimatePresence mode="wait">
          {activeModule === "recon" && (
            
            // =========================================================
            // MODULE 1: PASSIVE NETWORK RECON (OSINT) VIEW
            // =========================================================
            <motion.div
              key="recon"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
            >
              
              {/* LEFT: Phone Simulator with Result Card */}
              <section className="lg:col-span-5 flex flex-col items-center">
                <div className="w-full max-w-sm">
                  <div className="text-center mb-4">
                    <span className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1 rounded-full">
                      <Smartphone className="w-3.5 h-3.5" />
                      FlutterFlow UI Simulator
                    </span>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Rendered "Result Card" layout using the OSINT API payload.
                    </p>
                  </div>

                  {/* Physical Smartphone Frame */}
                  <div className="relative mx-auto bg-slate-900 border-4 sm:border-[8px] border-slate-800 rounded-[30px] sm:rounded-[40px] shadow-2xl p-2 sm:p-4 overflow-hidden aspect-[9/19] w-full max-w-sm flex flex-col justify-between" style={{ minHeight: "580px" }}>
                    
                    {/* Speaker Notch */}
                    <div className="hidden sm:flex absolute top-2 left-1/2 -translate-x-1/2 w-32 h-4 bg-slate-800 rounded-b-xl z-20 items-center justify-center">
                      <div className="w-12 h-1 bg-slate-700 rounded-full" />
                    </div>

                    {/* App Screen Interior */}
                    <div className="flex-1 flex flex-col bg-slate-950 pt-5 px-3 rounded-[24px] overflow-hidden justify-between relative border border-slate-900">
                      
                      {/* Top Bar Indicators */}
                      <div className="flex items-center justify-between px-2 pt-2 pb-1 text-[10px] text-slate-500 font-mono">
                        <span>SUITE MOBILE v1</span>
                        <div className="flex items-center gap-1.5">
                          <Wifi className="w-3 h-3 text-emerald-400" />
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                        </div>
                      </div>

                      {/* Screen Brand Title */}
                      <div className="text-center mt-2 mb-4">
                        <div className="flex items-center justify-center gap-1">
                          <Globe className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                          <span className="text-xs font-mono font-bold text-white tracking-widest uppercase">
                            OSINT FOOTPRINTER
                          </span>
                        </div>
                        <span className="text-[9px] text-slate-500 uppercase tracking-wider block mt-0.5">Passive DNS Location Registry</span>
                      </div>

                      {/* Domain input console */}
                      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 space-y-2">
                        <label className="block text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wide">
                          Domain Name to Fingerprint
                        </label>
                        <input
                          type="text"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-white font-mono text-xs placeholder-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                          placeholder="e.g. cloudflare.com, wikipedia.org"
                          value={reconDomain}
                          onChange={(e) => setReconDomain(e.target.value)}
                          disabled={reconLoading}
                        />

                        <button
                          onClick={() => runOSINTRecon(reconDomain)}
                          disabled={reconLoading}
                          className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold font-mono text-[10px] rounded-lg tracking-wider uppercase transition cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          {reconLoading ? (
                            <>
                              <div className="w-3 h-3 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                              RECONNING...
                            </>
                          ) : (
                            "RUN OSINT FOOTPRINT"
                          )}
                        </button>
                      </div>

                      {/* Inside Screen Content Panel: Result Card */}
                      <div className="flex-1 mt-4 overflow-y-auto pb-4 scrollbar-none">
                        {reconLoading ? (
                          <div className="flex flex-col items-center justify-center py-12 space-y-2.5">
                            <Compass className="w-8 h-8 text-emerald-400 animate-spin" />
                            <span className="text-[10px] font-mono text-emerald-400 text-center px-4">
                              Querying Domain Name Resolvers...
                            </span>
                            <span className="text-[8px] text-slate-500">Checking public routing and registrar records</span>
                          </div>
                        ) : reconError ? (
                          <div className="flex flex-col items-center justify-center py-10 text-center px-4 space-y-2">
                            <XCircle className="w-7 h-7 text-red-500" />
                            <span className="text-[10px] font-mono text-red-400 font-bold">RECON FAILURE</span>
                            <span className="text-[8px] text-slate-400 leading-normal">{reconError}</span>
                          </div>
                        ) : reconData ? (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-3"
                          >
                            {/* TARGET RESULT CARD */}
                            <div className="bg-slate-900 border border-emerald-500/20 rounded-xl p-3.5 space-y-3 shadow-lg">
                              
                              {/* Header Title inside mobile card */}
                              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                                <div className="flex items-center gap-1.5">
                                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                  <span className="text-[11px] font-bold font-mono text-white truncate max-w-[140px]">
                                    {reconData.domain}
                                  </span>
                                </div>
                                <span className="text-[9px] font-mono text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                                  OSINT PASSIVE
                                </span>
                              </div>

                              {/* Target properties list */}
                              <div className="space-y-2 text-[10px]">
                                <div className="flex justify-between items-center bg-slate-950 p-1.5 rounded border border-slate-900">
                                  <span className="text-slate-500 font-mono">Resolved IP</span>
                                  <span className="text-white font-mono font-bold text-right">{reconData.ip}</span>
                                </div>

                                <div className="flex justify-between items-center bg-slate-950 p-1.5 rounded border border-slate-900">
                                  <span className="text-slate-500 font-mono">Country</span>
                                  <span className="text-white font-bold text-right flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-red-400" />
                                    {reconData.country} ({reconData.country_code})
                                  </span>
                                </div>

                                <div className="flex justify-between items-center bg-slate-950 p-1.5 rounded border border-slate-900">
                                  <span className="text-slate-500 font-mono">City / Region</span>
                                  <span className="text-white font-bold text-right">{reconData.city}, {reconData.region}</span>
                                </div>

                                <div className="flex justify-between items-center bg-slate-950 p-1.5 rounded border border-slate-900">
                                  <span className="text-slate-500 font-mono">Coordinates</span>
                                  <span className="text-slate-300 font-mono text-right">{reconData.latitude.toFixed(4)}, {reconData.longitude.toFixed(4)}</span>
                                </div>

                                <div className="flex justify-between items-center bg-slate-950 p-1.5 rounded border border-slate-900">
                                  <span className="text-slate-500 font-mono">ISP</span>
                                  <span className="text-white font-bold text-right truncate max-w-[120px]">{reconData.isp}</span>
                                </div>

                                <div className="flex justify-between items-center bg-slate-950 p-1.5 rounded border border-slate-900">
                                  <span className="text-slate-500 font-mono">ASN Number</span>
                                  <span className="text-slate-400 font-mono text-right truncate max-w-[120px]">{reconData.asn}</span>
                                </div>
                              </div>

                              {/* Coordinates visual graphic */}
                              <div className="bg-slate-950 border border-slate-800 p-2 rounded-lg text-center font-mono">
                                <span className="text-[8px] text-slate-500 block mb-1">RADAR GRAPHIC GEO-REF</span>
                                <div className="h-10 border border-dashed border-emerald-500/20 bg-emerald-950/5 rounded flex items-center justify-center gap-1 text-[9px] text-emerald-400">
                                  <Compass className="w-3.5 h-3.5 animate-spin" />
                                  LOC: {reconData.latitude.toFixed(2)}N | {reconData.longitude.toFixed(2)}E
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-14 text-center px-4 space-y-2">
                            <HelpCircle className="w-8 h-8 text-slate-800 animate-bounce" />
                            <span className="text-[11px] text-slate-400 font-bold">No Footprint Selected</span>
                            <span className="text-[9px] text-slate-500 leading-normal">
                              Enter a target domain above and trigger passive lookup telemetry.
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Ethical Compliance Banner */}
                      <div className="border-t border-slate-900 py-2.5 text-center">
                        <span className="text-[8px] font-mono text-red-400 tracking-wider block">
                          EDUCATIONAL PURPOSES ONLY. ILLEGAL USE PROHIBITED.
                        </span>
                      </div>

                    </div>
                  </div>
                </div>
              </section>

              {/* RIGHT: OSINT Code Generator & Mobile Schema Integration Hub */}
              <section className="lg:col-span-7 space-y-6">
                
                {/* Live Geo Information Panel */}
                {reconData ? (
                  <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-5 shadow-xl backdrop-blur-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2 text-white font-mono font-bold text-sm">
                        <Globe className="w-4 h-4 text-emerald-400" />
                        OSINT RETRIEVED DATA: {reconData.domain}
                      </div>
                      <span className="text-xs font-mono text-slate-400">
                        Resolved IP: <strong className="text-emerald-400">{reconData.ip}</strong>
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {/* Live Data boxes */}
                      <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-center">
                        <span className="block text-[10px] font-mono text-slate-500 uppercase">Country</span>
                        <span className="text-sm font-bold font-mono text-emerald-400 mt-1.5 block truncate">
                          {reconData.country}
                        </span>
                      </div>
                      <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-center">
                        <span className="block text-[10px] font-mono text-slate-500 uppercase">City Location</span>
                        <span className="text-sm font-bold font-mono text-emerald-400 mt-1.5 block truncate">
                          {reconData.city}
                        </span>
                      </div>
                      <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-center">
                        <span className="block text-[10px] font-mono text-slate-500 uppercase">ISP Provider</span>
                        <span className="text-sm font-bold font-mono text-cyan-400 mt-1.5 block truncate">
                          {reconData.isp}
                        </span>
                      </div>
                      <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-center">
                        <span className="block text-[10px] font-mono text-slate-500 uppercase">Lookup Method</span>
                        <span className="text-[10px] font-bold font-mono text-amber-500 mt-2 block uppercase">
                          Passive OSINT
                        </span>
                      </div>
                    </div>

                    {/* Presets fast link */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-mono">
                      <span className="text-slate-400 font-semibold">Test Domains:</span>
                      {reconPresets.map((preset) => (
                        <button
                          key={preset}
                          onClick={() => {
                            setReconDomain(preset);
                            runOSINTRecon(preset);
                          }}
                          disabled={reconLoading}
                          className={`px-2.5 py-1 rounded border transition cursor-pointer ${
                            reconDomain === preset
                              ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/40"
                              : "bg-slate-950/40 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white"
                          }`}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-6 text-center space-y-2 text-slate-400">
                    <HelpCircle className="w-8 h-8 text-slate-800 mx-auto animate-pulse" />
                    <p className="font-mono text-sm text-white">OSINT Telemetry Offline</p>
                    <p className="text-xs max-w-md mx-auto leading-relaxed">
                      Select a test target domain above to populate live passive lookup data.
                    </p>
                  </div>
                )}

                {/* Integration Details Panel */}
                <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-5 shadow-xl backdrop-blur-sm space-y-6">
                  
                  {/* Tab Selector */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-3 gap-3">
                    <div>
                      <h3 className="text-sm font-bold font-mono text-white uppercase flex items-center gap-1.5">
                        <Code className="w-4 h-4 text-emerald-400" />
                        Network Recon Integration Hub
                      </h3>
                      <span className="text-[11px] text-slate-400">Fetch python API templates and mobile integration schemas.</span>
                    </div>

                    <div className="flex bg-slate-950 border border-slate-800 p-1 rounded-lg">
                      <button
                        onClick={() => setActiveReconTab("flask")}
                        className={`px-2.5 py-1.5 rounded font-mono text-[10px] transition cursor-pointer ${
                          activeReconTab === "flask" ? "bg-emerald-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Python Flask API
                      </button>
                      <button
                        onClick={() => setActiveReconTab("json")}
                        className={`px-2.5 py-1.5 rounded font-mono text-[10px] transition cursor-pointer ${
                          activeReconTab === "json" ? "bg-emerald-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
                        }`}
                      >
                        JSON Output Schema
                      </button>
                      <button
                        onClick={() => setActiveReconTab("educational")}
                        className={`px-2.5 py-1.5 rounded font-mono text-[10px] transition cursor-pointer ${
                          activeReconTab === "educational" ? "bg-emerald-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
                        }`}
                      >
                        How It Works
                      </button>
                      <button
                        onClick={() => setActiveReconTab("flutterflow")}
                        className={`px-2.5 py-1.5 rounded font-mono text-[10px] transition cursor-pointer ${
                          activeReconTab === "flutterflow" ? "bg-emerald-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
                        }`}
                      >
                        FlutterFlow Guide
                      </button>
                    </div>
                  </div>

                  {/* Tab Contents */}
                  <AnimatePresence mode="wait">
                    {activeReconTab === "flask" && (
                      <motion.div
                        key="flask"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="space-y-3"
                      >
                        <div className="flex items-center justify-between bg-slate-950 px-4 py-2 rounded-t-lg border border-slate-800 border-b-0">
                          <span className="text-[11px] font-mono text-slate-400">app.py (Flask OSINT Endpoint)</span>
                          <button
                            onClick={() => copyToClipboard(pythonFlaskCode, "flask")}
                            className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1.5 cursor-pointer"
                          >
                            {copiedType === "flask" ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-400">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy Python Code</span>
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="bg-slate-950 border border-slate-800 rounded-b-lg p-4 font-mono text-[11px] text-emerald-400/90 overflow-x-auto max-h-[300px] leading-relaxed scrollbar-thin scrollbar-thumb-slate-800">
                          {pythonFlaskCode}
                        </pre>
                      </motion.div>
                    )}

                    {activeReconTab === "json" && (
                      <motion.div
                        key="json"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="space-y-3"
                      >
                        <div className="flex items-center justify-between bg-slate-950 px-4 py-2 rounded-t-lg border border-slate-800 border-b-0">
                          <span className="text-[11px] font-mono text-slate-400">schema.json (Recon API Schema Binding)</span>
                          <button
                            onClick={() => copyToClipboard(reconJsonSchemaCode, "json_schema")}
                            className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1.5 cursor-pointer"
                          >
                            {copiedType === "json_schema" ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-400">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy JSON Schema</span>
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="bg-slate-950 border border-slate-800 rounded-b-lg p-4 font-mono text-[11px] text-emerald-400/90 overflow-x-auto max-h-[300px] leading-relaxed scrollbar-thin scrollbar-thumb-slate-800">
                          {reconJsonSchemaCode}
                        </pre>
                      </motion.div>
                    )}

                    {activeReconTab === "educational" && (
                      <motion.div
                        key="educational"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="bg-slate-950 border border-slate-800 rounded-lg p-5 font-mono text-xs text-slate-300 space-y-4 leading-relaxed"
                      >
                        <div className="flex items-center gap-2 text-white border-b border-slate-900 pb-2.5 font-bold text-xs">
                          <BookOpen className="w-4 h-4 text-emerald-400 font-bold" />
                          TECHNICAL SPECIFICATIONS: HOW THIS OSINT FOOTPRINTING TOOL WORKS
                        </div>
                        
                        <div className="font-sans text-xs space-y-3.5 text-slate-400 leading-relaxed">
                          <p>
                            Open-Source Intelligence (OSINT) focuses on harvesting public details about target hosts. Passive network footprinting determines server infrastructure information without triggering network security alerts.
                          </p>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-2">
                            <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-lg space-y-1">
                              <strong className="text-[11px] font-mono text-emerald-400 uppercase font-bold block">1. DNS Resolver (Socket)</strong>
                              <p className="text-[10px] text-slate-400 leading-normal">
                                Converts target hostnames (e.g. cloudflare.com) into IP addresses using system sockets. It asks name servers for A-records, tracing routing lines cleanly.
                              </p>
                            </div>
                            
                            <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-lg space-y-1">
                              <strong className="text-[11px] font-mono text-emerald-400 uppercase font-bold block">2. Geolocation Mapping</strong>
                              <p className="text-[10px] text-slate-400 leading-normal">
                                Cross-references resolved IP addresses against public routing tables managed by Regional Internet Registries (such as ARIN/RIPE) to locate server hardware.
                              </p>
                            </div>

                            <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-lg space-y-1">
                              <strong className="text-[11px] font-mono text-emerald-400 uppercase font-bold block">3. Autonomous System Info</strong>
                              <p className="text-[10px] text-slate-400 leading-normal">
                                Identifies the host's Autonomous System Number (ASN) and Internet Service Provider (ISP), yielding critical structural insight for defenders.
                              </p>
                            </div>
                          </div>

                          <div className="p-3 bg-red-950/25 border border-red-500/10 rounded-lg text-red-300/90 text-[11px] font-mono flex items-start gap-2.5 leading-relaxed">
                            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                            <div>
                              <strong className="text-red-400 uppercase block mb-1">Defense & Compliance Protocol</strong>
                              Passive reconnaissance is entirely non-intrusive. However, flooding geolocator APIs with millions of repeated bulk lookup requests violates API limits and can cause service blocks. Always throttle scanning scripts and preserve public API resources during educational audits.
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {activeReconTab === "flutterflow" && (
                      <motion.div
                        key="flutterflow"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="bg-slate-950 border border-slate-800 rounded-lg p-5 font-mono text-xs text-slate-300 space-y-4 leading-relaxed"
                      >
                        <div className="flex items-center gap-2 text-white border-b border-slate-900 pb-2.5 font-bold text-xs">
                          <Smartphone className="w-4 h-4 text-emerald-400" />
                          MOBILE INTEGRATION GUIDE (FLUTTERFLOW & THUNKABLE)
                        </div>

                        <div className="font-sans text-xs space-y-3 text-slate-400 leading-relaxed">
                          <p>
                            Mapping this backend Flask response to your FlutterFlow or Thunkable interface takes only four steps:
                          </p>

                          <ol className="list-decimal pl-5 space-y-2.5 font-mono text-[11px]">
                            <li>
                              <strong className="text-white">Configure API Call:</strong> Open FlutterFlow API Settings. Add a new API Call named <code className="text-emerald-400 bg-slate-900 px-1 py-0.5 rounded">NetworkRecon</code>, set Method to <code className="text-emerald-400 font-bold">POST</code>, and paste your backend server URL <code className="text-emerald-400">https://YOUR_FLASK_SERVER/api/recon</code>.
                            </li>
                            <li>
                              <strong className="text-white">Define Body Payload:</strong> Select <code className="text-emerald-400">JSON</code> format. Add a variable named <code className="text-emerald-400">domain</code>. Write the payload: <code className="text-slate-400 font-mono">{"{ \"domain\": \"#domain_variable#\" }"}</code>.
                            </li>
                            <li>
                              <strong className="text-white">Map JSON Outputs:</strong> In the API Response tab, copy-paste the <strong className="text-emerald-400 hover:underline cursor-pointer" onClick={() => setActiveReconTab("json")}>JSON Output Schema</strong>. Add dynamic JSON paths to bind fields like <code className="text-emerald-400">$.ip</code>, <code className="text-emerald-400">$.country</code>, and <code className="text-emerald-400">$.isp</code>.
                            </li>
                            <li>
                              <strong className="text-white">Bind to UI Cards:</strong> Create a Form with a text input. Bind the button's "On Tap" action to trigger the API call, and populate your Result Card text widgets with the output variables.
                            </li>
                          </ol>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>

              </section>

            </motion.div>
          )}

          {activeModule === "diagnostics" && (
            
            // =========================================================
            // MODULE 2: PORT SERVICE DIAGNOSTICS (TCP) VIEW
            // =========================================================
            <motion.div
              key="diagnostics"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
            >
              
              {/* LEFT: Phone Simulator for active TCP diagnostics */}
              <section className="lg:col-span-5 flex flex-col items-center">
                <div className="w-full max-w-sm">
                  <div className="text-center mb-4">
                    <span className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1 rounded-full">
                      <Smartphone className="w-3.5 h-3.5" />
                      React Native UI Simulator
                    </span>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Interact with the phone to test active port handshakes via Express backend.
                    </p>
                  </div>

                  {/* Physical Phone Frame Wrapper */}
                  <div className="relative mx-auto bg-slate-900 border-4 sm:border-[8px] border-slate-800 rounded-[30px] sm:rounded-[40px] shadow-2xl p-2 sm:p-4 overflow-hidden aspect-[9/19] w-full max-w-sm flex flex-col justify-between" style={{ minHeight: "580px" }}>
                    {/* Speaker Notch */}
                    <div className="hidden sm:flex absolute top-2 left-1/2 -translate-x-1/2 w-32 h-4 bg-slate-800 rounded-b-xl z-20 items-center justify-center">
                      <div className="w-12 h-1 bg-slate-700 rounded-full" />
                    </div>

                    {/* Simulated App Screen Container */}
                    <div className="flex-1 flex flex-col bg-slate-950 pt-5 px-3 rounded-[24px] overflow-hidden justify-between relative border border-slate-900">
                      
                      {/* Top bar */}
                      <div className="flex items-center justify-between px-2 pt-2 pb-1 text-[10px] text-slate-500 font-mono">
                        <span>LAN DIAGNOSTICS</span>
                        <Wifi className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                      </div>

                      {/* Internal Screen Header */}
                      <div className="text-center mt-2 mb-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <Network className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-[11px] font-mono font-bold text-white tracking-widest uppercase">
                            SERVICE DIAGNOSTIC
                          </span>
                        </div>
                        <span className="text-[9px] text-slate-500 uppercase tracking-wider block mt-0.5">Service Availability Auditor</span>
                      </div>

                      {/* Input form */}
                      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 space-y-2">
                        <span className="block text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wide">
                          Target LAN Hostname / IP
                        </span>
                        <input
                          type="text"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-white font-mono text-xs placeholder-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                          placeholder="e.g. dns.google, localhost"
                          value={diagTarget}
                          onChange={(e) => setDiagTarget(e.target.value)}
                          disabled={diagLoading}
                        />

                        <button
                          onClick={() => runDiagnosticCheck(diagTarget)}
                          disabled={diagLoading}
                          className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold font-mono text-[10px] rounded-lg tracking-wider uppercase transition cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          {diagLoading ? (
                            <>
                              <div className="w-3 h-3 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                              VERIFYING...
                            </>
                          ) : (
                            "VERIFY SERVICE HEALTH"
                          )}
                        </button>
                      </div>

                      {/* Results list view inside the phone */}
                      <div className="flex-1 mt-4 overflow-y-auto pb-4 scrollbar-none">
                        {diagLoading ? (
                          <div className="flex flex-col items-center justify-center py-10 space-y-2">
                            <Activity className="w-6 h-6 text-emerald-400 animate-spin" />
                            <span className="text-[10px] font-mono text-emerald-400 text-center px-4">
                              Initiating TCP handshake validation...
                            </span>
                            <span className="text-[8px] text-slate-500">Checking standard service deployment ports</span>
                          </div>
                        ) : diagError ? (
                          <div className="flex flex-col items-center justify-center py-10 text-center px-4 space-y-2">
                            <AlertTriangle className="w-6 h-6 text-red-500" />
                            <span className="text-[10px] font-mono text-red-400 font-bold">DIAGNOSTIC FAILURE</span>
                            <span className="text-[8px] text-slate-400 leading-normal">{diagError}</span>
                          </div>
                        ) : diagnostics ? (
                          <div className="space-y-2">
                            {/* Target header info inside app */}
                            <div className="bg-slate-900 border border-slate-800/80 rounded-lg p-2 flex justify-between items-center text-[10px] font-mono text-slate-400">
                              <div>
                                <span className="text-white block truncate max-w-[120px] font-bold">{diagnostics.target}</span>
                                <span className="text-[9px] text-emerald-500">{diagnostics.ip}</span>
                              </div>
                              <span>{new Date(diagnostics.scanTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>

                            {/* Flat list mapping */}
                            <div className="space-y-1.5">
                              {diagnostics.services.map((svc) => {
                                const isSvcActive = svc.status === "Active";
                                return (
                                  <div 
                                    key={svc.port} 
                                    className={`rounded-lg border p-2.5 transition flex flex-col justify-between gap-1 ${
                                      isSvcActive 
                                        ? "bg-emerald-950/20 border-emerald-500/25" 
                                        : "bg-slate-950 border-slate-900"
                                    }`}
                                  >
                                    <div className="flex justify-between items-center">
                                      <span className="text-[11px] font-bold text-white truncate max-w-[150px]">{svc.service}</span>
                                      <span className="text-[9px] font-mono text-slate-500">Port {svc.port}</span>
                                    </div>
                                    <div className="flex justify-between items-center mt-1">
                                      <div className="flex items-center gap-1">
                                        <div className={`w-1.5 h-1.5 rounded-full ${isSvcActive ? "bg-emerald-400 animate-pulse" : "bg-red-500"}`} />
                                        <span className={`text-[10px] font-mono font-medium ${isSvcActive ? "text-emerald-400" : "text-red-400"}`}>
                                          {svc.details}
                                        </span>
                                      </div>
                                      {isSvcActive && svc.latencyMs !== undefined && (
                                        <span className="text-[8px] text-slate-500 font-mono">
                                          Latency: {svc.latencyMs}ms
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-14 text-center px-4 space-y-2">
                            <HelpCircle className="w-8 h-8 text-slate-800 animate-bounce" />
                            <span className="text-[11px] text-slate-400 font-bold">No Diagnosed Host</span>
                            <span className="text-[9px] text-slate-500 leading-normal">
                              Type an IP or domain above and verify port connectivity health.
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Ethical Compliance Disclaimer inside App footer */}
                      <div className="border-t border-slate-900/80 py-2.5 text-center">
                        <span className="text-[8px] font-mono text-red-400 tracking-wider block">
                          EDUCATIONAL PURPOSES ONLY. ILLEGAL USE PROHIBITED.
                        </span>
                      </div>

                    </div>
                  </div>
                </div>
              </section>

              {/* RIGHT: Active Diagnostics details card */}
              <section className="lg:col-span-7 space-y-6">
                
                {/* Status board */}
                {diagnostics ? (
                  <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-5 shadow-xl backdrop-blur-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2 text-white font-mono font-bold text-sm">
                        <Server className="w-4 h-4 text-emerald-400" />
                        LIVE TELEMETRY: {diagnostics.target}
                      </div>
                      <span className="text-xs font-mono text-slate-400">
                        Resolved IP: <strong className="text-emerald-400">{diagnostics.ip}</strong>
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {/* Stats Cards */}
                      <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-center">
                        <span className="block text-[10px] font-mono text-slate-500 uppercase">Active Services</span>
                        <span className="text-xl font-bold font-mono text-emerald-400 mt-1 block">
                          {diagnostics.services.filter(s => s.status === "Active").length}
                        </span>
                      </div>
                      <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-center">
                        <span className="block text-[10px] font-mono text-slate-500 uppercase">Inactive Services</span>
                        <span className="text-xl font-bold font-mono text-red-400 mt-1 block">
                          {diagnostics.services.filter(s => s.status === "Inactive").length}
                        </span>
                      </div>
                      <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-center">
                        <span className="block text-[10px] font-mono text-slate-500 uppercase">Avg Response</span>
                        <span className="text-xl font-bold font-mono text-cyan-400 mt-1 block">
                          {Math.round(
                            diagnostics.services
                              .filter(s => s.latencyMs !== undefined)
                              .reduce((acc, curr) => acc + (curr.latencyMs || 0), 0) / 
                            (diagnostics.services.filter(s => s.latencyMs !== undefined).length || 1)
                          )} ms
                        </span>
                      </div>
                      <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-center">
                        <span className="block text-[10px] font-mono text-slate-500 uppercase">Audit Method</span>
                        <span className="text-[10px] font-bold font-mono text-amber-500 mt-1 block uppercase">
                          TCP Handshake
                        </span>
                      </div>
                    </div>

                    {/* Preset Fast Selector */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-mono">
                      <span className="text-slate-400 font-semibold">Test Nodes:</span>
                      {diagPresets.map((preset) => (
                        <button
                          key={preset}
                          onClick={() => {
                            setDiagTarget(preset);
                            runDiagnosticCheck(preset);
                          }}
                          disabled={diagLoading}
                          className={`px-2.5 py-1 rounded border transition cursor-pointer ${
                            diagTarget === preset 
                              ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/40"
                              : "bg-slate-950/40 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white"
                          }`}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-6 text-center space-y-2 text-slate-400">
                    <HelpCircle className="w-8 h-8 text-slate-800 mx-auto animate-pulse" />
                    <p className="font-mono text-sm text-white">Diagnostic Dashboard Offline</p>
                    <p className="text-xs max-w-md mx-auto leading-relaxed">
                      Select a preset node or type a hostname in the React Native simulator to query live port health status.
                    </p>
                  </div>
                )}

                {/* Hub tabs with full code references */}
                <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-5 shadow-xl backdrop-blur-sm space-y-6">
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-3 gap-3">
                    <div>
                      <h3 className="text-sm font-bold font-mono text-white uppercase flex items-center gap-1.5">
                        <Code className="w-4 h-4 text-emerald-400" />
                        Diagnostics & Troubleshooting Hub
                      </h3>
                      <span className="text-[11px] text-slate-400">Copy React Native source files and Node backend sockets middleware.</span>
                    </div>

                    <div className="flex bg-slate-950 border border-slate-800 p-1 rounded-lg">
                      <button
                        onClick={() => setActiveDiagTab("frontend")}
                        className={`px-2.5 py-1.5 rounded font-mono text-[10px] transition cursor-pointer ${
                          activeDiagTab === "frontend" ? "bg-emerald-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
                        }`}
                      >
                        React Native (NetworkTool.js)
                      </button>
                      <button
                        onClick={() => setActiveDiagTab("backend")}
                        className={`px-2.5 py-1.5 rounded font-mono text-[10px] transition cursor-pointer ${
                          activeDiagTab === "backend" ? "bg-emerald-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Node Backend (network.js)
                      </button>
                      <button
                        onClick={() => setActiveDiagTab("json")}
                        className={`px-2.5 py-1.5 rounded font-mono text-[10px] transition cursor-pointer ${
                          activeDiagTab === "json" ? "bg-emerald-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
                        }`}
                      >
                        JSON Schema
                      </button>
                      <button
                        onClick={() => setActiveDiagTab("educational")}
                        className={`px-2.5 py-1.5 rounded font-mono text-[10px] transition cursor-pointer ${
                          activeDiagTab === "educational" ? "bg-emerald-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Troubleshooting Guide
                      </button>
                    </div>
                  </div>

                  {/* Tab Display Panel */}
                  <AnimatePresence mode="wait">
                    {activeDiagTab === "frontend" && (
                      <motion.div
                        key="frontend"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="space-y-3"
                      >
                        <div className="flex items-center justify-between bg-slate-950 px-4 py-2 rounded-t-lg border border-slate-800 border-b-0">
                          <span className="text-[11px] font-mono text-slate-400">NetworkTool.js (React Native Mobile UI)</span>
                          <button
                            onClick={() => copyToClipboard(frontendRNCode, "frontend")}
                            className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1.5 cursor-pointer"
                          >
                            {copiedType === "frontend" ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-400">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy Frontend</span>
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="bg-slate-950 border border-slate-800 rounded-b-lg p-4 font-mono text-xs text-emerald-400/90 overflow-x-auto max-h-[300px] leading-relaxed scrollbar-thin scrollbar-thumb-slate-800">
                          {frontendRNCode}
                        </pre>
                      </motion.div>
                    )}

                    {activeDiagTab === "backend" && (
                      <motion.div
                        key="backend"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="space-y-3"
                      >
                        <div className="flex items-center justify-between bg-slate-950 px-4 py-2 rounded-t-lg border border-slate-800 border-b-0">
                          <span className="text-[11px] font-mono text-slate-400">backend/modules/network.js (Express Middleware)</span>
                          <button
                            onClick={() => copyToClipboard(backendCode, "backend")}
                            className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1.5 cursor-pointer"
                          >
                            {copiedType === "backend" ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-400">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy Backend</span>
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="bg-slate-950 border border-slate-800 rounded-b-lg p-4 font-mono text-xs text-emerald-400/90 overflow-x-auto max-h-[300px] leading-relaxed scrollbar-thin scrollbar-thumb-slate-800">
                          {backendCode}
                        </pre>
                      </motion.div>
                    )}

                    {activeDiagTab === "json" && (
                      <motion.div
                        key="json"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="space-y-3"
                      >
                        <div className="flex items-center justify-between bg-slate-950 px-4 py-2 rounded-t-lg border border-slate-800 border-b-0">
                          <span className="text-[11px] font-mono text-slate-400">response_schema.json (FF/Thunkable Diagnostic Bindings)</span>
                          <button
                            onClick={() => copyToClipboard(jsonSchemaCode, "json")}
                            className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1.5 cursor-pointer"
                          >
                            {copiedType === "json" ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-400">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy Schema</span>
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="bg-slate-950 border border-slate-800 rounded-b-lg p-4 font-mono text-xs text-emerald-400/90 overflow-x-auto max-h-[300px] leading-relaxed scrollbar-thin scrollbar-thumb-slate-800">
                          {jsonSchemaCode}
                        </pre>
                      </motion.div>
                    )}

                    {activeDiagTab === "educational" && (
                      <motion.div
                        key="educational"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="bg-slate-950 border border-slate-800 rounded-lg p-5 font-mono text-xs text-slate-300 space-y-4 leading-relaxed"
                      >
                        <div className="flex items-center gap-2 text-white border-b border-slate-900 pb-2.5 font-bold">
                          <BookOpen className="w-4 h-4 text-emerald-400" />
                          NETWORK ENGINEERING DEEP DIVE: TCP HANDSHAKES & LOCAL AUDITS
                        </div>
                        
                        <div className="font-sans text-sm space-y-3 leading-relaxed text-slate-400">
                          <p>
                            In professional network engineering, determining whether a server is active requires verifying that the target service can complete a basic connection handshake. 
                          </p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
                            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-lg space-y-2">
                              <strong className="text-xs font-mono text-emerald-400 uppercase font-bold block">Non-Intrusive Handshakes</strong>
                              <p className="text-xs text-slate-400 leading-relaxed">
                                Rather than performing aggressive port scanning that floods hosts with malicious probe packets, this diagnostic script uses node's standard TCP socket connect pipeline with brief connection timeouts (e.g. 1500ms). It establishes a standard, authorized connection attempt to see if a listener answers.
                              </p>
                            </div>
                            
                            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-lg space-y-2">
                              <strong className="text-xs font-mono text-emerald-400 uppercase font-bold block">Understanding Port Deployments</strong>
                              <p className="text-xs text-slate-400 leading-relaxed">
                                Services bind to specific ports at startup. For instance, Web Servers listen on port 80/443, databases like MySQL on 3306, and secure administration on 22. Checking connection feasibility provides a window into which parts of a software stack have finished initializing.
                              </p>
                            </div>
                          </div>

                          <div className="p-3.5 bg-red-950/25 border border-red-500/10 rounded-lg text-red-300/90 text-xs font-mono flex items-start gap-2.5">
                            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                            <div>
                              <strong className="text-red-400 uppercase block mb-1">Diagnostic Best Practices</strong>
                              Ensure your local firewalls allow internal socket loopback tests. Performing massive, unauthorized port scans across external enterprise networks can flag your traffic as hostile activity. Always verify with system owners prior to running connectivity suites.
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>

              </section>

            </motion.div>
          )}

          {activeModule === "forensics" && (
            // =========================================================
            // MODULE 3: DIGITAL FORENSICS (EXIF) VIEW
            // =========================================================
            <motion.div
              key="forensics"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
            >
              
              {/* LEFT: Phone Simulator for Digital Forensics Metadata Auditing */}
              <section className="lg:col-span-5 flex flex-col items-center">
                <div className="w-full max-w-sm">
                  <div className="text-center mb-4">
                    <span className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1 rounded-full">
                      <Smartphone className="w-3.5 h-3.5" />
                      React Native UI Simulator
                    </span>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Pick a case file or upload a custom image to audit headers in real-time.
                    </p>
                  </div>

                  {/* Physical Smartphone Frame */}
                  <div className="relative mx-auto bg-slate-900 border-4 sm:border-[8px] border-slate-800 rounded-[30px] sm:rounded-[40px] shadow-2xl p-2 sm:p-4 overflow-hidden aspect-[9/19] w-full max-w-sm flex flex-col justify-between" style={{ minHeight: "600px" }}>
                    
                    {/* Speaker Notch */}
                    <div className="hidden sm:flex absolute top-2 left-1/2 -translate-x-1/2 w-32 h-4 bg-slate-800 rounded-b-xl z-20 items-center justify-center">
                      <div className="w-12 h-1 bg-slate-700 rounded-full" />
                    </div>

                    {/* App Screen Interior */}
                    <div className="flex-1 flex flex-col bg-slate-950 pt-5 px-3 rounded-[24px] overflow-hidden justify-between relative border border-slate-900">
                      
                      {/* Top Bar Indicators */}
                      <div className="flex items-center justify-between px-2 pt-2 pb-1 text-[10px] text-slate-500 font-mono">
                        <span>FORENSICS v1</span>
                        <div className="flex items-center gap-1.5">
                          <Wifi className="w-3 h-3 text-emerald-400" />
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                        </div>
                      </div>

                      {/* Screen Brand Title */}
                      <div className="text-center mt-2 mb-3">
                        <div className="flex items-center justify-center gap-1">
                          <Camera className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                          <span className="text-xs font-mono font-bold text-white tracking-widest uppercase">
                            META AUDITOR
                          </span>
                        </div>
                        <span className="text-[9px] text-slate-500 uppercase tracking-wider block mt-0.5">EXIF File Evidence Integrity</span>
                      </div>

                      {/* Cases list and file picker inside the phone */}
                      <div className="space-y-2 bg-slate-900/80 border border-slate-800 rounded-xl p-2.5">
                        <label className="block text-[8px] font-mono font-bold text-slate-400 uppercase tracking-wide">
                          Select Educational Case Evidence
                        </label>
                        
                        <div className="grid grid-cols-3 gap-1">
                          <button
                            onClick={() => {
                              setForensicCaseId("dslr_original");
                              runForensicAudit("dslr_original");
                            }}
                            className={`py-1.5 px-1 rounded text-[9px] font-mono font-bold transition cursor-pointer text-center ${
                              forensicCaseId === "dslr_original"
                                ? "bg-emerald-500 text-slate-950 animate-pulse"
                                : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white"
                            }`}
                          >
                            DSLR
                          </button>
                          <button
                            onClick={() => {
                              setForensicCaseId("photoshop_tampered");
                              runForensicAudit("photoshop_tampered");
                            }}
                            className={`py-1.5 px-1 rounded text-[9px] font-mono font-bold transition cursor-pointer text-center ${
                              forensicCaseId === "photoshop_tampered"
                                ? "bg-emerald-500 text-slate-950 animate-pulse"
                                : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white"
                            }`}
                          >
                            PHOTOSHOP
                          </button>
                          <button
                            onClick={() => {
                              setForensicCaseId("gps_leak");
                              runForensicAudit("gps_leak");
                            }}
                            className={`py-1.5 px-1 rounded text-[9px] font-mono font-bold transition cursor-pointer text-center ${
                              forensicCaseId === "gps_leak"
                                ? "bg-emerald-500 text-slate-950 animate-pulse"
                                : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white"
                            }`}
                          >
                            GPS LEAK
                          </button>
                        </div>

                        {/* Custom Image Upload Drag Area Inside Phone */}
                        <div className="border border-dashed border-slate-800 hover:border-emerald-500/50 rounded-lg p-2 bg-slate-950 transition relative flex flex-col items-center justify-center cursor-pointer text-center group">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleCustomFileUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                          <UploadCloud className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition" />
                          <span className="text-[8px] text-slate-400 block mt-1 font-mono font-semibold">
                            OR UPLOAD EVIDENCE FILE
                          </span>
                          <span className="text-[7px] text-slate-600 block">JPEGs up to 10MB</span>
                        </div>
                      </div>

                      {/* Inside Screen Content Panel: Forensic Report Card */}
                      <div className="flex-1 mt-3 overflow-y-auto pb-3 scrollbar-none" style={{ maxHeight: "310px" }}>
                        {forensicLoading ? (
                          <div className="flex flex-col items-center justify-center py-12 space-y-2">
                            <Activity className="w-7 h-7 text-emerald-400 animate-spin" />
                            <span className="text-[10px] font-mono text-emerald-400 text-center">
                              Parsing Binary Headers...
                            </span>
                            <span className="text-[8px] text-slate-500">Extracting EXIF directory blocks</span>
                          </div>
                        ) : forensicError ? (
                          <div className="flex flex-col items-center justify-center py-10 text-center px-4 space-y-2">
                            <XCircle className="w-7 h-7 text-red-500" />
                            <span className="text-[10px] font-mono text-red-400 font-bold">PARSING ERROR</span>
                            <span className="text-[8px] text-slate-400 leading-normal">{forensicError}</span>
                          </div>
                        ) : forensicData ? (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-3"
                          >
                            {/* FORENSIC INTEGRITY HEADER CARD */}
                            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-3 shadow-lg">
                              
                              {/* Title block */}
                              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                                <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wide">
                                  INTEGRITY METRIC
                                </span>
                                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                                  forensicData.heuristics.integrityScore >= 80
                                    ? "bg-emerald-950/80 text-emerald-400 border border-emerald-500/30"
                                    : "bg-red-950/80 text-red-400 border border-red-500/30"
                                }`}>
                                  Score: {forensicData.heuristics.integrityScore}/100
                                </span>
                              </div>

                              {/* Progress bar representing integrity */}
                              <div className="space-y-1">
                                <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all duration-500 ${
                                      forensicData.heuristics.integrityScore >= 80 ? "bg-emerald-500" : "bg-red-500"
                                    }`}
                                    style={{ width: `${forensicData.heuristics.integrityScore}%` }}
                                  />
                                </div>
                                <div className="flex justify-between text-[7.5px] font-mono text-slate-500">
                                  <span>TAMPERED (0)</span>
                                  <span>AUTHENTIC (100)</span>
                                </div>
                              </div>

                              {/* File Basic Statistics (Dimensions, Format, Size, etc.) */}
                              <div className="space-y-1.5 text-[9px] border-t border-slate-800/60 pt-2">
                                <span className="text-[8px] font-mono font-bold text-slate-400 block uppercase tracking-wide text-left">
                                  Basic File Statistics
                                </span>
                                <div className="grid grid-cols-2 gap-1 font-mono">
                                  <div className="bg-slate-950 p-1 rounded border border-slate-950 text-slate-400 text-left">
                                    Name: <span className="text-white truncate block">{forensicData.stats.filename}</span>
                                  </div>
                                  <div className="bg-slate-950 p-1 rounded border border-slate-950 text-slate-400 text-left">
                                    Format: <span className="text-white block">{forensicData.stats.format}</span>
                                  </div>
                                  <div className="bg-slate-950 p-1 rounded border border-slate-950 text-slate-400 text-left">
                                    Size: <span className="text-white block">{forensicData.stats.fileSizeReadable}</span>
                                  </div>
                                  <div className="bg-slate-950 p-1 rounded border border-slate-950 text-slate-400 text-left">
                                    Resolution: <span className="text-white block">{forensicData.stats.width}x{forensicData.stats.height}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Camera / Metadata details */}
                              <div className="space-y-1.5 text-[9px] border-t border-slate-800/60 pt-2">
                                <span className="text-[8px] font-mono font-bold text-slate-400 block uppercase tracking-wide text-left">
                                  EXIF Hardware Headers
                                </span>
                                <div className="space-y-1 font-mono text-slate-400">
                                  <div className="flex justify-between border-b border-slate-800/30 py-0.5">
                                    <span>Make</span>
                                    <span className="text-white font-semibold">{forensicData.camera.make || "N/A"}</span>
                                  </div>
                                  <div className="flex justify-between border-b border-slate-800/30 py-0.5">
                                    <span>Model</span>
                                    <span className="text-white font-semibold">{forensicData.camera.model || "N/A"}</span>
                                  </div>
                                  <div className="flex justify-between border-b border-slate-800/30 py-0.5">
                                    <span>Software/Firmware</span>
                                    <span className="text-white font-semibold truncate max-w-[120px]">{forensicData.camera.software || "N/A"}</span>
                                  </div>
                                  <div className="flex justify-between border-b border-slate-800/30 py-0.5">
                                    <span>Exposure/F-Stop</span>
                                    <span className="text-white font-semibold">{forensicData.camera.exposureTime || "N/A"} @ {forensicData.camera.fNumber || "N/A"}</span>
                                  </div>
                                  <div className="flex justify-between py-0.5">
                                    <span>Capture Time</span>
                                    <span className="text-white font-semibold text-[8px]">{forensicData.camera.timestamp || "N/A"}</span>
                                  </div>
                                </div>
                              </div>

                              {/* GPS leakage */}
                              <div className="space-y-1.5 text-[9px] border-t border-slate-800/60 pt-2">
                                <span className="text-[8px] font-mono font-bold text-slate-400 block uppercase tracking-wide text-left">
                                  Geolocation (GPS Tags)
                                </span>
                                {forensicData.gps.hasGps ? (
                                  <div className="bg-emerald-950/40 border border-emerald-500/20 p-2 rounded-lg space-y-1.5">
                                    <div className="flex items-center justify-between text-emerald-400 font-bold text-[8px] border-b border-emerald-500/10 pb-1">
                                      <span className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                                        GPS TELEMETRY ACTIVE
                                      </span>
                                      <button
                                        onClick={() => setShowGpsMap(!showGpsMap)}
                                        className="text-[7.5px] font-mono px-1 py-0.2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded uppercase transition cursor-pointer"
                                        title="Toggle between telemetry stats and graphical radar coordinate mapping"
                                      >
                                        {showGpsMap ? "Stats" : "Radar Map"}
                                      </button>
                                    </div>

                                    {showGpsMap ? (
                                      <div className="relative h-24 bg-slate-950 border border-emerald-500/30 rounded-md overflow-hidden flex flex-col items-center justify-center">
                                        {/* Animated concentric scanning circles */}
                                        <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
                                          <span className="absolute w-16 h-16 rounded-full border border-emerald-500 animate-ping" />
                                          <span className="absolute w-8 h-8 rounded-full border border-emerald-500/60" />
                                          <span className="absolute w-24 h-24 rounded-full border border-emerald-500/20" />
                                          {/* Crosshairs */}
                                          <div className="absolute h-full w-[0.5px] bg-emerald-500/40" />
                                          <div className="absolute w-full h-[0.5px] bg-emerald-500/40" />
                                        </div>

                                        {/* Tactical HUD Overlay Text */}
                                        <div className="absolute top-1 left-1.5 text-[6px] font-mono text-emerald-400/80 uppercase tracking-widest pointer-events-none space-y-0.5 text-left">
                                          <div>SENS-LOCK: POSITION_ACQUIRED</div>
                                          <div>DATUM: WGS84 / CYBER-GRID</div>
                                        </div>

                                        <div className="absolute bottom-1 right-1.5 text-[6px] font-mono text-emerald-400/80 pointer-events-none text-right">
                                          <div>LAT: {forensicData.gps.latitude}</div>
                                          <div>LON: {forensicData.gps.longitude}</div>
                                        </div>

                                        {/* Central blinking locator dot */}
                                        <div className="relative z-10 flex flex-col items-center justify-center">
                                          <div className="relative">
                                            <span className="absolute -inset-1.5 bg-emerald-400 rounded-full animate-ping opacity-75" />
                                            <MapPin className="w-5 h-5 text-emerald-400 filter drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                                          </div>
                                          <span className="text-[6.5px] font-mono font-bold text-emerald-300 mt-1 uppercase bg-slate-950/95 px-1 rounded border border-emerald-500/20">
                                            SECURED TARGET
                                          </span>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="grid grid-cols-2 gap-1 text-[8px] font-mono text-slate-300 text-left">
                                        <div>Lat: {forensicData.gps.latitude}</div>
                                        <div>Lon: {forensicData.gps.longitude}</div>
                                        <div className="col-span-2">Alt: {forensicData.gps.altitude || "N/A"} meters</div>
                                      </div>
                                    )}

                                    <a
                                      href={`https://maps.google.com/?q=${forensicData.gps.latitude},${forensicData.gps.longitude}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center justify-center gap-1 px-2 py-1.5 w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono text-[8px] rounded uppercase transition"
                                    >
                                      Open Satellite Coordinates
                                    </a>
                                  </div>
                                ) : (
                                  <div className="bg-slate-950 p-2 rounded-lg text-center text-slate-500 font-mono text-[8px]">
                                    No GPS Coordinates embedded in file headers.
                                  </div>
                                )}
                              </div>

                              {/* Warnings & Heuristics anomaly report card */}
                              {forensicData.heuristics.warningFlags.length > 0 && (
                                <div className="space-y-1.5 text-[9px] border-t border-slate-800/60 pt-2">
                                  <span className="text-[8px] font-mono font-bold text-red-400 block uppercase tracking-wide text-left">
                                    ⚠️ Heuristics Warning Logs
                                  </span>
                                  <div className="space-y-1">
                                    {forensicData.heuristics.warningFlags.map((flag, index) => (
                                      <div key={index} className="bg-red-950/40 border border-red-500/20 p-1.5 rounded text-[8px] font-mono text-red-200 leading-normal text-left">
                                        • {flag}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                            </div>
                          </motion.div>
                        ) : null}
                      </div>

                      {/* Screen Navigation Strip */}
                      <div className="border-t border-slate-900 pt-2 pb-3 flex justify-around text-[10px] text-slate-500 font-mono">
                        <span className="text-emerald-400 font-bold">EXIF</span>
                        <span>HEX DATA</span>
                        <span>GPS</span>
                      </div>

                    </div>
                  </div>
                </div>
              </section>

              {/* RIGHT: Code & Educational Workspace */}
              <section className="lg:col-span-7 flex flex-col space-y-6">
                
                {/* Section title */}
                <div>
                  <h3 className="text-lg font-bold font-mono text-white uppercase flex items-center gap-2">
                    <Camera className="w-5 h-5 text-emerald-400" />
                    Digital Forensics & Metadata Analysis
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Examine binary image tags (EXIF), parse statistics, and audit hardware signatures for evidence integrity testing.
                  </p>
                </div>

                {/* Tab buttons */}
                <div className="flex border-b border-slate-900">
                  <button
                    onClick={() => setActiveForensicTab("reactnative")}
                    className={`px-4 py-2.5 text-xs font-mono font-bold cursor-pointer transition border-b-2 -mb-[2px] ${
                      activeForensicTab === "reactnative"
                        ? "border-emerald-500 text-white bg-slate-900/50"
                        : "border-transparent text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    React Native Client
                  </button>
                  <button
                    onClick={() => setActiveForensicTab("flask")}
                    className={`px-4 py-2.5 text-xs font-mono font-bold cursor-pointer transition border-b-2 -mb-[2px] ${
                      activeForensicTab === "flask"
                        ? "border-emerald-500 text-white bg-slate-900/50"
                        : "border-transparent text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Python Flask Route
                  </button>
                  <button
                    onClick={() => setActiveForensicTab("json")}
                    className={`px-4 py-2.5 text-xs font-mono font-bold cursor-pointer transition border-b-2 -mb-[2px] ${
                      activeForensicTab === "json"
                        ? "border-emerald-500 text-white bg-slate-900/50"
                        : "border-transparent text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    JSON Response Schema
                  </button>
                  <button
                    onClick={() => setActiveForensicTab("educational")}
                    className={`px-4 py-2.5 text-xs font-mono font-bold cursor-pointer transition border-b-2 -mb-[2px] ${
                      activeForensicTab === "educational"
                        ? "border-emerald-500 text-white bg-slate-900/50"
                        : "border-transparent text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Forensics Guide
                  </button>
                </div>

                {/* Tab content panel */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-inner">
                  <AnimatePresence mode="wait">
                    {activeForensicTab === "reactnative" && (
                      <motion.div
                        key="reactnative"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="space-y-4"
                      >
                        <div className="flex justify-between items-center bg-slate-950 px-4 py-2 rounded-lg border border-slate-900">
                          <span className="text-[10px] font-mono text-slate-500">Frontend/ForensicsTool.js</span>
                          <button
                            onClick={() => copyToClipboard(forensicsReactNativeCode, "forensics_rn")}
                            className="text-xs font-mono text-emerald-400 hover:text-emerald-300 transition flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded border border-slate-800 cursor-pointer"
                          >
                            {copiedType === "forensics_rn" ? (
                              <>
                                <Check className="w-3 h-3" /> Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" /> Copy Code
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="text-[10px] font-mono text-slate-300 overflow-x-auto p-4 bg-slate-950 rounded-lg max-h-[420px] scrollbar-thin text-left">
                          <code>{forensicsReactNativeCode}</code>
                        </pre>
                      </motion.div>
                    )}

                    {activeForensicTab === "flask" && (
                      <motion.div
                        key="flask"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="space-y-4"
                      >
                        <div className="flex justify-between items-center bg-slate-950 px-4 py-2 rounded-lg border border-slate-900">
                          <span className="text-[10px] font-mono text-slate-500">app_forensics.py (EXIF parser)</span>
                          <button
                            onClick={() => copyToClipboard(forensicsPythonFlaskCode, "forensics_flask")}
                            className="text-xs font-mono text-emerald-400 hover:text-emerald-300 transition flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded border border-slate-800 cursor-pointer"
                          >
                            {copiedType === "forensics_flask" ? (
                              <>
                                <Check className="w-3 h-3" /> Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" /> Copy Code
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="text-[10px] font-mono text-slate-300 overflow-x-auto p-4 bg-slate-950 rounded-lg max-h-[420px] scrollbar-thin text-left">
                          <code>{forensicsPythonFlaskCode}</code>
                        </pre>
                      </motion.div>
                    )}

                    {activeForensicTab === "json" && (
                      <motion.div
                        key="json"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="space-y-4"
                      >
                        <div className="flex justify-between items-center bg-slate-950 px-4 py-2 rounded-lg border border-slate-900">
                          <span className="text-[10px] font-mono text-slate-500">Forensics API response schema</span>
                          <button
                            onClick={() => copyToClipboard(forensicsJsonSchemaCode, "forensics_json")}
                            className="text-xs font-mono text-emerald-400 hover:text-emerald-300 transition flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded border border-slate-800 cursor-pointer"
                          >
                            {copiedType === "forensics_json" ? (
                              <>
                                <Check className="w-3 h-3" /> Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" /> Copy Schema
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="text-[10px] font-mono text-slate-300 overflow-x-auto p-4 bg-slate-950 rounded-lg max-h-[420px] scrollbar-thin text-left">
                          <code>{forensicsJsonSchemaCode}</code>
                        </pre>
                      </motion.div>
                    )}

                    {activeForensicTab === "educational" && (
                      <motion.div
                        key="educational"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="space-y-5"
                      >
                        <div className="flex items-center gap-2 text-white border-b border-slate-800 pb-2.5 font-bold font-mono text-xs uppercase">
                          <BookOpen className="w-4 h-4 text-emerald-400" />
                          Certified Forensic Instructor Guide
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-300">
                          <div className="bg-slate-950 border border-slate-900 p-4 rounded-lg space-y-2 text-left">
                            <strong className="text-xs font-mono text-emerald-400 uppercase font-bold block">1. EXIF Directory Layout</strong>
                            <p className="text-xs text-slate-400 leading-relaxed">
                              Exchangeable Image File Format (EXIF) is a standard specification for image file metadata. Device hardware writes directly into standard offset tags (JPEG markers <code className="text-slate-300 font-mono bg-slate-900 px-1 rounded">0xFFE1</code>) to capture lens aperture, camera models, shutter speed, and timestamp tags upon shutter actuation.
                            </p>
                          </div>

                          <div className="bg-slate-950 border border-slate-900 p-4 rounded-lg space-y-2 text-left">
                            <strong className="text-xs font-mono text-emerald-400 uppercase font-bold block">2. Tamper Signature Analysis</strong>
                            <p className="text-xs text-slate-400 leading-relaxed">
                              Original camera captures leave predictable, raw header profiles (firmware metadata, authentic compression values). Graphic editors like Adobe Photoshop or GIMP overwrite standard tags with editing software footprints, wipe raw hardware configurations, and append their brand names in the <code className="text-slate-300 font-mono bg-slate-900 px-1 rounded">Image Software</code> EXIF directory.
                            </p>
                          </div>

                          <div className="bg-slate-950 border border-slate-900 p-4 rounded-lg space-y-2 text-left">
                            <strong className="text-xs font-mono text-emerald-400 uppercase font-bold block">3. Geolocation Leaks</strong>
                            <p className="text-xs text-slate-400 leading-relaxed">
                              Modern mobile cameras automatically append active GPS coordinate attributes (Latitude, Longitude, and Altitude) in standard directory offsets if Location Services are active. Under Open Source Intelligence (OSINT) workflows, defenders extract these tags to immediately geolocate threat actors.
                            </p>
                          </div>

                          <div className="bg-slate-950 border border-slate-900 p-4 rounded-lg space-y-2 text-left">
                            <strong className="text-xs font-mono text-emerald-400 uppercase font-bold block">4. Integrity Scoring Heuristics</strong>
                            <p className="text-xs text-slate-400 leading-relaxed">
                              Our digital auditor computes an integrity score starting at 100. It deducts points if custom editor headers are detected (-40), if standard EXIF tables have been completely scrubbed from a JPEG file (-35), or if dates mismatch. High scores mean authentic evidence; low scores imply modification.
                            </p>
                          </div>
                        </div>

                        <div className="p-3.5 bg-red-950/25 border border-red-500/10 rounded-lg text-red-300/90 text-xs font-mono flex items-start gap-2.5 text-left">
                          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-red-400 uppercase block mb-1">Defense & Ethics Notice</strong>
                            Educating students on metadata analysis provides defenders with keys to analyze digital fraud and recover lost assets. However, uploading real personal photos to unverified cloud services can leak your home coordinates or identity to third parties. Instruct students to always sanitize files (EXIF Stripping) before web-publishing.
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

              </section>

            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* Footer Area */}
      <footer className="border-t border-slate-900 bg-slate-950 text-slate-500 py-8 mt-12 text-center text-xs font-mono">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>© 2026 Ethical Hacking & OSINT Suite. Built for Certified Security Analysts.</span>
          <div className="flex gap-4">
            <span className="text-slate-600">Secure Core API v1.0.4</span>
            <span className="text-emerald-500/80 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-ping" />
              Intelligence Node Operational
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
