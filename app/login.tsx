import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import api from "../lib/api";
import AsyncStorage from "@react-native-async-storage/async-storage"; // ✅ import this

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("⚠️ Missing Fields", "Please enter email and password.");
      return;
    }

    try {
      const response = await api.post("/api/auth/login", {
        email,
        password,
      });

      const token = response.data.access_token; // 🔐 make sure your backend sends a token
      if (token) {
        await AsyncStorage.setItem("token", token); // ✅ store token
        console.log("Token:", token);
        Alert.alert("✅ Login Success", "Welcome back!");
        router.push("/"); // or navigate to your home screen
      } else {
        Alert.alert("⚠️ Error", "No token received.");
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert(
        "❌ Login Failed",
        error.response?.data?.message || "Invalid email or password."
      );
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        padding: 24,
        backgroundColor: "#f8fafc",
      }}
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
        Welcome Back 👋
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

        <TouchableOpacity
          onPress={() => console.log("Forgot password")}
          style={{ alignSelf: "flex-end" }}
        >
          <Text style={{ color: "#64748b", fontSize: 14 }}>
            Forgot password?
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleLogin}
          style={{
            marginTop: 24,
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
            Login
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={() => router.push("/singup")}
        style={{ marginTop: 30 }}
      >
        <Text style={{ color: "#6366f1", textAlign: "center", fontSize: 14 }}>
          Don't have an account?{" "}
          <Text style={{ fontWeight: "600" }}>Sign Up</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const inputStyle = {
  marginBottom: 20,
  padding: 16,
  backgroundColor: "#f1f5f9",
  borderRadius: 12,
  fontSize: 16,
  color: "#0f172a",
};
