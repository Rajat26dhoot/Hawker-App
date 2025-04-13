import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="home" options={{ title: "Home" }} />
      <Stack.Screen name="login" options={{ title: "Login" }} />
      <Stack.Screen name="singup" options={{ title: "Sign Up" }} />
    

      {/* Modal screen for Add Product */}
      <Stack.Screen
        name="addproduct"
        options={{
          presentation: "modal",
          title: "Add Product",
        }}
      />

            <Stack.Screen
              name="maps"
              options={{
                presentation: "modal",  // Treat maps as a modal
                title: "Maps",
              }}
            />

    </Stack>
  );
}
