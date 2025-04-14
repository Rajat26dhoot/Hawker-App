import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="home" options={{headerShown: false}} />
      <Stack.Screen name="login" options={{ headerShown: false }} />



      <Stack.Screen name="singup" options={{headerShown: false  }} />

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

      <Stack.Screen
        name="sellproductdetail"
        options={{
          presentation: "modal",  
          title: "Sell Product Detail",
        }}
      />

      {/* Profile screen */}
      <Stack.Screen
        name="profile"
        options={{
          title: "Profile",
        }}
      />
    </Stack>
  );
}
