import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import api from "../lib/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Product = {
  id: string;
  name: string;
  quantity: number;
  price: number;
};

export default function SellProductDetail() {
  const [products, setProducts] = useState<Product[]>([]);
  const [totalDistance, setTotalDistance] = useState<number>(0);
  const [totalStops, setTotalStops] = useState<number>(0);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const date = "2025-04-14";
        const response = await api.get('/api/hawker/delivery-points', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: { date },
        });

        const data = response.data;
        setTotalDistance(data.total_distance);
        setTotalStops(data.total_stops);

        const allProducts: Product[] = [];
        data.delivery_points.forEach((point: any) => {
          point.customers.forEach((customer: any) => {
            customer.products.forEach((product: any) => {
              allProducts.push({
                id: String(product.product_id),
                name: product.name,
                quantity: product.quantity,
                price: product.price,
              });
            });
          });
        });

        setProducts(allProducts);
      } catch (error) {
        console.error('Error fetching delivery points:', error);
      }
    };

    fetchDetails();
  }, []);

  const totalMoney = products.reduce((sum, item) => sum + item.price, 0);

  const renderItem = ({ item }: { item: Product }) => (
    <View style={styles.productRow}>
      <Text style={styles.productName}>{item.name}</Text>
      <Text style={styles.productDetail}>Qty: {item.quantity}</Text>
      <Text style={styles.productDetail}>₹{item.price}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.screen}>
      <FlatList
        data={products}
        keyExtractor={(item, index) => `${item.id}-${index}`} // Unique key fix
        renderItem={renderItem}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <Text style={styles.heading}>Sell Product Detail</Text>

            <View style={styles.card}>
              <Text style={styles.label}>Total Distance Traveled:</Text>
              <Text style={styles.value}>{totalDistance.toFixed(2)} km</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.label}>Total Stops:</Text>
              <Text style={styles.value}>{totalStops}</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.label}>Total Money Earned:</Text>
              <Text style={styles.value}>₹{totalMoney}</Text>
            </View>

            <View style={[styles.card, { marginBottom: 0 }]}>
              <Text style={styles.label}>Products Sold:</Text>
            </View>
          </View>
        }
        contentContainerStyle={styles.container}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  container: {
    padding: 20,
  },
  headerContainer: {
    marginBottom: 10,
  },
  heading: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
    color: "#1e293b",
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 4,
    borderColor: "#4f46e5",
    borderWidth: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4f46e5",
  },
  value: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginTop: 8,
  },
  productRow: {
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  productName: {
    fontWeight: "600",
    color: "#0f172a",
  },
  productDetail: {
    color: "#334155",
  },
});
