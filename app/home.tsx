import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f8fafc" }}>
      <Text style={{ fontSize: 24, fontWeight: "600", marginBottom: 20, color: "#1e293b" }}>Welcome to Home!</Text>

      <TouchableOpacity
        onPress={() => router.push("/addproduct")}
        style={{
          backgroundColor: "#4f46e5",
          paddingVertical: 14,
          paddingHorizontal: 24,
          borderRadius: 12,
          shadowColor: "#4f46e5",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 5,
        }}
      >
        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>Add Product</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push("/maps")}
        style={{
          backgroundColor: "#4f46e5",
          paddingVertical: 14,
          paddingHorizontal: 24,
          borderRadius: 12,
          shadowColor: "#4f46e5",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 5,
        }}
      >
        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>Maps</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => router.push("/login")}
        style={{
          backgroundColor: "#4f46e5",
          paddingVertical: 14,
          paddingHorizontal: 24,
          borderRadius: 12,
          shadowColor: "#4f46e5",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 5,
        }}
      >
        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>Login</Text>
      </TouchableOpacity>
    </View>
  );
}
