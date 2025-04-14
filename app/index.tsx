import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Index() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("token");

        if (token) {
          router.replace("/home"); // 👈 Redirect to home if token exists
        } else {
          router.replace("/login"); // 👈 Redirect to login if no token
        }
      } catch (error) {
        console.error("Error checking token:", error);
        router.replace("/login"); // 👈 Fallback to login on error
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
