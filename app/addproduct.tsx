import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  StyleSheet,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import api from "../lib/api"; // import your API instance
import AsyncStorage from "@react-native-async-storage/async-storage"; // import AsyncStorage

export default function AddProductModal(): JSX.Element {
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isAvailable] = useState<boolean>(true); // default true

  // Pick image from gallery
  const handlePickImage = async (): Promise<void> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "We need access to your gallery to pick an image.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  // Handle submit product form
  const handleSubmit = async (): Promise<void> => {
    if (!name || !description || !price || !imageUri) {
      Alert.alert("⚠️ Missing Fields", "Please fill all fields and upload an image.");
      return;
    }

    try {
      // Get the token from AsyncStorage
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert("❌ Not Authenticated", "Please login first.");
        return;
      }

      const productData = {
        name,
        description,
        price: parseFloat(price),
        image_url: imageUri, // Assuming the image URL is passed as a string (you may need to upload the image first)
        is_available: true,
      };

      // Send the product data to the backend
      const response = await api.post("/api/products", productData, {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token for authentication
        },
      });

      // Handle success
      Alert.alert("✅ Product Added", response.data.message || "Product added successfully!");
      router.back(); // Go back to the previous screen after submission
    } catch (error) {
      console.error("Add product error:", error);
      Alert.alert(
        "❌ Failed to Add Product",
        error.response?.data?.message || "Something went wrong."
      );
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Add New Product</Text>

      <View style={styles.form}>
        {/* Image Picker */}
        <TouchableOpacity onPress={handlePickImage} style={styles.imagePicker}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} />
          ) : (
            <Text style={styles.imageText}>📸 Tap to upload image</Text>
          )}
        </TouchableOpacity>

        {/* Product Name */}
        <TextInput
          placeholder="Product Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />

        {/* Product Description */}
        <TextInput
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          multiline
          style={[styles.input, styles.textArea]}
        />

        {/* Product Price */}
        <TextInput
          placeholder="Price"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
          style={styles.input}
        />

        {/* Save Product Button */}
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Save Product</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#f8fafc",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
    color: "#1e293b",
  },
  form: {
    backgroundColor: "#ffffff",
    padding: 24,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  input: {
    marginBottom: 15,
    padding: 16,
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    fontSize: 16,
    color: "#0f172a",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  button: {
    marginTop: 20,
    backgroundColor: "#10b981",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  imagePicker: {
    height: 180,
    backgroundColor: "#f1f5f9",
    borderRadius: 14,
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
    borderStyle: "dashed",
    borderWidth: 2,
    borderColor: "#94a3b8",
  },
  imageText: {
    color: "#64748b",
    fontSize: 14,
  },
  image: {
    height: "100%",
    width: "100%",
    borderRadius: 12,
  },
});
