import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../lib/api";
import Ionicons from "react-native-vector-icons/Ionicons";

export default function ProfileScreen(): JSX.Element {
  const [profile] = useState({
    name: "John Doe",
    phone: "9876543210",
    address: "123 Main St, City",
  });

  const handleLogout = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("❌ Not Authenticated", "Please login first.");
        return;
      }

      const response = await api.post(
        "/api/auth/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.message === "Successfully logged out") {
        await AsyncStorage.removeItem("token");
        Alert.alert("✅ Logged out", "You have been logged out.");
        router.replace("/login");
      } else {
        Alert.alert("❌ Logout Error", response.data.message || "Failed to log out.");
      }
    } catch (error) {
      console.error("Logout Error:", error);
      Alert.alert("❌ Logout Error", "Something went wrong while logging out.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.avatarContainer}>
        <Ionicons name="person-circle" size={100} color="#4f46e5" />
        <Text style={styles.name}>{profile.name}</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.boldLabel}>📱 Phone Number</Text>
        <Text style={styles.enhancedValue}>{profile.phone || "-"}</Text>

        <Text style={styles.boldLabel}>📍 Address</Text>
        <Text style={styles.enhancedValue}>{profile.address || "-"}</Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>🚪 Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: "#f8fafc", // Same background as the login screen
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1e293b",
    marginTop: 12,
  },
  infoCard: {
    backgroundColor: "#ffffff", // White background for the card
    padding: 24,
    borderRadius: 20,
    marginBottom: 40,
    shadowColor: "#000", // Light shadow for card
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    borderColor: "#4f46e5", // Light blue border color
    borderWidth: 1,
    marginHorizontal: 16,
  },
  boldLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4f46e5", // Light blue text for labels
    marginBottom: 8,
    marginTop: 20,
  },
  enhancedValue: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1e293b", // Dark text color for the values
    marginBottom: 12,
  },
  logoutButton: {
    backgroundColor: "#4f46e5", // Light blue button color
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginHorizontal: 16,
    shadowColor: "#4f46e5", // Light blue shadow for button
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
