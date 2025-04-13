import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Switch,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useState } from "react";
import * as Location from "expo-location";
import { router } from "expo-router";
import api from "../lib/api"; // Make sure this has http:// in baseURL!

export default function SignupScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);

  const handleToggleLocation = async () => {
    const newValue = !isLocationEnabled;
    setIsLocationEnabled(newValue);

    if (newValue) {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "Location permission is required.");
        setIsLocationEnabled(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setLatitude(location.coords.latitude);
      setLongitude(location.coords.longitude);
      Alert.alert("✅ Location Sent Successfully");
    } else {
      setLatitude(null);
      setLongitude(null);
    }
  };

  const handleSignUp = async () => {
    if (
      !name ||
      !email ||
      !password ||
      !phone ||
      !businessName ||
      !businessAddress ||
      !latitude ||
      !longitude
    ) {
      Alert.alert("⚠️ Incomplete", "Please fill all fields and enable location.");
      return;
    }

    try {
      const response = await api.post("/api/auth/register", {
        name,
        email,
        password,
        phone,
        business_name: businessName,
        business_address: businessAddress,
        latitude,
        longitude,
        role: "hawker", // default role
      });

      Alert.alert("✅ Success", "Registered successfully!");
      router.push("/login");
    } catch (error) {
      console.error("Registration error:", error);
      Alert.alert(
        "❌ Error",
        error.response?.data?.message || "Something went wrong. Try again!"
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#f8fafc" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={{
          padding: 24,
          paddingBottom: 40,
          flexGrow: 1,
          justifyContent: "center",
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Text
          style={{
            fontSize: 34,
            fontWeight: "700",
            marginBottom: 40,
            textAlign: "center",
            color: "#1e293b",
          }}
        >
          Create Account 📝
        </Text>

        <View
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 20,
            padding: 24,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 10,
            elevation: 5,
          }}
        >
          <TextInput
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
            style={inputStyle}
          />
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={inputStyle}
          />
          <TextInput
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={inputStyle}
          />
          <TextInput
            placeholder="Phone Number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            style={inputStyle}
          />
          <TextInput
            placeholder="Business Name"
            value={businessName}
            onChangeText={setBusinessName}
            style={inputStyle}
          />
          <TextInput
            placeholder="Business Address"
            value={businessAddress}
            onChangeText={setBusinessAddress}
            style={inputStyle}
          />

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginVertical: 20,
              justifyContent: "space-between",
            }}
          >
            <Text style={{ fontSize: 16, color: "#1e293b" }}>
              Allow Location Access
            </Text>
            <Switch
              value={isLocationEnabled}
              onValueChange={handleToggleLocation}
              trackColor={{ false: "#ccc", true: "#3b82f6" }}
              thumbColor={isLocationEnabled ? "#ffffff" : "#f4f3f4"}
            />
          </View>

          <TouchableOpacity
            onPress={handleSignUp}
            style={{
              marginTop: 8,
              backgroundColor: "#4f46e5",
              paddingVertical: 16,
              borderRadius: 14,
              alignItems: "center",
              shadowColor: "#4f46e5",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 10,
              elevation: 6,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => router.push("/login")}
          style={{ marginTop: 30 }}
        >
          <Text
            style={{
              color: "#6366f1",
              textAlign: "center",
              fontSize: 14,
            }}
          >
            Already have an account?{" "}
            <Text style={{ fontWeight: "600" }}>Log In</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const inputStyle = {
  marginBottom: 15,
  padding: 16,
  backgroundColor: "#f1f5f9",
  borderRadius: 12,
  fontSize: 16,
  color: "#0f172a",
};
