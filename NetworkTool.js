// EDUCATIONAL PURPOSES ONLY. UNAUTHORIZED USE IS ILLEGAL.
/**
 * React Native Network Diagnostic & Service Status Verification Tool
 * Built for educational analysis of local network services, connectivity, and deployment issues.
 * Designed to integrate seamlessly with FlutterFlow, Thunkable, or standard React Native apps.
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

  // Trigger network verification diagnostics
  const runServiceCheck = async () => {
    if (!target.trim()) {
      Alert.alert("Input Error", "Please provide a target hostname or IP address.");
      return;
    }

    setIsLoading(true);
    setDiagnostics(null);

    try {
      // Connect to your hosted Flask/Express backend API endpoint
      const response = await fetch('https://YOUR_BACKEND_SERVER_URL/api/diagnostics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ target: target.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        setDiagnostics(data);
      } else {
        Alert.alert("Diagnostic Aborted", data.error || "Failed to complete service checks.");
      }
    } catch (err) {
      Alert.alert(
        "Connectivity Error",
        "Unable to connect to the diagnostics server. Please check your network."
      );
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

        {isActive && item.latencyMs !== undefined && (
          <Text style={styles.latencyText}>Handshake Latency: {item.latencyMs}ms</Text>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#020617" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SECURE NETWORK TOOL</Text>
        <Text style={styles.headerSubtitle}>Service Status Verification & Local Auditing</Text>
      </View>

      {/* Target Input Console */}
      <View style={styles.consoleCard}>
        <Text style={styles.inputLabel}>Enter Diagnostic Target</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., localhost, 127.0.0.1"
          placeholderTextColor="#475569"
          value={target}
          onChangeText={setTarget}
          autoCapitalize="none"
          autoCorrect={false}
        />
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={runServiceCheck}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#020617" size="small" />
          ) : (
            <Text style={styles.buttonText}>VERIFY SERVICE HEALTH</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Diagnostic Feed */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#10b981" size="large" />
          <Text style={styles.loadingText}>Executing local connection handshakes...</Text>
          <Text style={styles.loadingSubtext}>Querying standard ports with connection timeouts</Text>
        </View>
      ) : diagnostics ? (
        <View style={styles.resultsContainer}>
          <View style={styles.resultsHeader}>
            <View>
              <Text style={styles.resultsHost}>{diagnostics.target}</Text>
              <Text style={styles.resultsIp}>Resolved IP: {diagnostics.ip}</Text>
            </View>
            <Text style={styles.resultsTime}>
              {new Date(diagnostics.scanTime).toLocaleTimeString()}
            </Text>
          </View>

          <FlatList
            data={diagnostics.services}
            keyExtractor={(item) => item.port.toString()}
            renderItem={renderServiceCard}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No Active Diagnostics Run</Text>
          <Text style={styles.emptySubtext}>
            Enter an internal IP address or domain above and initialize connection handshakes to audit local services.
          </Text>
        </View>
      )}

      {/* Ethical Education Banner */}
      <View style={styles.ethicalBanner}>
        <Text style={styles.ethicalText}>
          EDUCATIONAL PURPOSES ONLY. UNAUTHORIZED USE IS ILLEGAL.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    paddingHorizontal: 16,
  },
  header: {
    marginTop: 24,
    marginBottom: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 2,
    fontFamily: 'monospace',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  consoleCard: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 11,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    color: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: 'monospace',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#10b981',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#020617',
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 16,
  },
  loadingSubtext: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 60,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptySubtext: {
    color: '#475569',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  resultsContainer: {
    flex: 1,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  resultsHost: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  resultsIp: {
    color: '#10b981',
    fontSize: 11,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  resultsTime: {
    color: '#64748b',
    fontSize: 11,
  },
  listContent: {
    paddingBottom: 24,
  },
  card: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  cardActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  cardInactive: {
    backgroundColor: '#020617',
    borderColor: '#1e293b',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  serviceName: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  portLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontFamily: 'monospace',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  indicatorActive: {
    backgroundColor: '#10b981',
  },
  indicatorInactive: {
    backgroundColor: '#ef4444',
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  textActive: {
    color: '#10b981',
  },
  textInactive: {
    color: '#ef4444',
  },
  latencyText: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 4,
    fontFamily: 'monospace',
  },
  ethicalBanner: {
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  ethicalText: {
    color: '#f87171',
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  }
});
