// EDUCATIONAL PURPOSES ONLY. UNAUTHORIZED USE IS ILLEGAL.
/**
 * Network Diagnostics & Service Availability Module
 * Designed for educational analysis of local/remote network service status.
 */

import net from "net";
import dns from "dns";

// Standard diagnostic service mappings to focus on troubleshooting service deployment
const SERVICE_TEMPLATES = [
  { name: "FTP File Transfer", port: 21, activeLabel: "FTP Service Active", inactiveLabel: "FTP Service Closed" },
  { name: "SSH Remote Access", port: 22, activeLabel: "SSH Service Configured", inactiveLabel: "SSH Service Closed" },
  { name: "Telnet Legacy Login", port: 23, activeLabel: "Telnet Configured (Insecure)", inactiveLabel: "Telnet Service Inactive" },
  { name: "SMTP Mail Relay", port: 25, activeLabel: "SMTP Server Configured", inactiveLabel: "SMTP Service Closed" },
  { name: "DNS Name Server", port: 53, activeLabel: "DNS Resolver Active", inactiveLabel: "DNS Resolver Offline" },
  { name: "HTTP Web Server", port: 80, activeLabel: "HTTP Service Active", inactiveLabel: "HTTP Service Inactive" },
  { name: "HTTPS Secure Web", port: 443, activeLabel: "HTTPS Secure Active", inactiveLabel: "HTTPS Secure Closed" },
  { name: "PostgreSQL Database", port: 5432, activeLabel: "PostgreSQL Engine Active", inactiveLabel: "PostgreSQL Database Closed" },
  { name: "MySQL Database", port: 3306, activeLabel: "MySQL Database Active", inactiveLabel: "MySQL Database Closed" },
  { name: "Alternative HTTP", port: 8080, activeLabel: "HTTP Port 8080 Active", inactiveLabel: "HTTP Port 8080 Closed" }
];

/**
 * Checks service availability on a target port with a non-intrusive TCP handshake check.
 * Strictly checks connection availability, avoiding aggressive port probing.
 */
export function checkServiceAvailability(host, port, timeoutMs = 1500) {
  return new Promise((resolve) => {
    const start = Date.now();
    const socket = new net.Socket();
    
    // Configure socket options
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
  // Validate target input
  let cleanHost = targetHost
    .trim()
    .toLowerCase()
    .replace(/^(https?:\/\/)?(www\.)?/, "") // remove http://, https://, www.
    .split("/")[0] // remove paths
    .split(":")[0]; // remove ports

  if (!cleanHost) {
    throw new Error("Invalid target hostname format.");
  }

  // Resolve hostname first to ensure network path is reachable
  let ipAddress = cleanHost;
  try {
    const lookup = await dns.promises.lookup(cleanHost);
    ipAddress = lookup.address;
  } catch (err) {
    // If resolution fails, we attempt connecting to raw IP or host directly (if it's already an IP)
  }

  const results = [];

  // Check services in sequence to prevent heavy congestion
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
}
