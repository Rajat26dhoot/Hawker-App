import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useEffect } from "react";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../lib/api"; // Make sure this is the correct path

export default function HomeScreen() {
  useEffect(() => {
    let locationInterval: NodeJS.Timeout;

    const sendLocationToServer = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.warn("Permission to access location was denied");
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const {
          coords: { latitude, longitude, accuracy, speed, heading },
          timestamp,
        } = location;

        const token = await AsyncStorage.getItem("token");
        if (!token) {
          console.warn("No token found in AsyncStorage");
          return;
        }

        const response = await api.put(
          "/api/hawker/location",
          {
            latitude,
            longitude,
            accuracy,
            speed,
            heading,
            timestamp: new Date(timestamp).toISOString(),
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Location sent:", response.data);
      } catch (error) {
        console.error("Error sending location:", error);
      }
    };

    // Send immediately once
    sendLocationToServer();

    // Then set interval to send every 60 seconds (60000 ms)
    locationInterval = setInterval(sendLocationToServer, 60000);

    // Cleanup on unmount
    return () => {
      if (locationInterval) clearInterval(locationInterval);
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Welcome to Home!</Text>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push("/addproduct")}>
          <Ionicons name="add-circle-outline" size={24} color="#4f46e5" />
          <Text style={styles.navText}>Add</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.push("/maps")}>
          <Ionicons name="map-outline" size={24} color="#4f46e5" />
          <Text style={styles.navText}>Map</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.push("/sellproductdetail")}>
          <Ionicons name="stats-chart-outline" size={24} color="#22c55e" />
          <Text style={styles.navText}>Sell</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.push("/profile")}>
          <Ionicons name="person-outline" size={24} color="#22c55e" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 80,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 20,
    color: "#1e293b",
  },
  bottomNav: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#ffffff",
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 14,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 10,
  },
  navItem: {
    alignItems: "center",
  },
  navText: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "500",
  },
});
