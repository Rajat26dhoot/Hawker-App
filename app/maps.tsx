import React, { useEffect, useState } from 'react';
import { View, Modal, StyleSheet, TouchableOpacity, Text } from 'react-native';
import MapView, { Marker, Polyline, LatLng } from 'react-native-maps';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import api from '../lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

// 🔧 Distance calculation helper
function getDistance(p1: LatLng, p2: LatLng): number {
  const dx = p1.latitude - p2.latitude;
  const dy = p1.longitude - p2.longitude;
  return Math.sqrt(dx * dx + dy * dy);
}

// 🔄 Trim route based on current location
function trimRoute(route: LatLng[], current: LatLng): LatLng[] {
  let closestIndex = 0;
  let minDist = Infinity;

  for (let i = 0; i < route.length; i++) {
    const dist = getDistance(route[i], current);
    if (dist < minDist) {
      minDist = dist;
      closestIndex = i;
    }
  }

  return route.slice(closestIndex);
}

const MapScreen = () => {
  const [deliveryData, setDeliveryData] = useState<any | null>(null);
  const [currentLocation, setCurrentLocation] = useState<LatLng | null>(null);
  const [routeCoords, setRouteCoords] = useState<LatLng[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<{
    name: string;
    phone: string;
    address: string;
    coords: [number, number];
    products: string[];
  } | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  // Fetch delivery points
  useEffect(() => {
    const fetchDeliveryPoints = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const date = '2025-04-14';
        const response = await api.get('/api/hawker/delivery-points', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: { date },
        });
        console.log(response.data);
        setDeliveryData(response.data);
      } catch (error) {
        console.error('Error fetching delivery points:', error);
      }
    };
    fetchDeliveryPoints();
  }, []);

  // Track current location and update route when location changes
  useEffect(() => {
    const updateLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Permission to access location was denied');
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      setCurrentLocation({ latitude, longitude });
    };
  
    // Start location tracking
    const locationListener = Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, timeInterval: 10000, distanceInterval: 1 },
      updateLocation
    );
  
    // Ensure cleanup using the correct method
    return () => {
      if (locationListener?.remove) {
        locationListener.remove(); // Proper cleanup
      }
    };
  }, []);
  

  // Update route whenever the location or delivery data changes
  useEffect(() => {
    if (currentLocation && deliveryData) {
      const coordinates = [
        [currentLocation.longitude, currentLocation.latitude],
        ...deliveryData.delivery_points.map((point: any) => [point.lng, point.lat]),
      ];
      fetch('https://api.openrouteservice.org/v2/directions/foot-walking/geojson', {
        method: 'POST',
        headers: {
          Authorization: '5b3ce3597851110001cf6248b9df1fc24bb946f98baf13d6ab7febea',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ coordinates }),
      })
        .then((response) => response.json())
        .then((data) => {
          const rawCoords: [number, number][] = data.features[0].geometry.coordinates;
          const formattedCoords: LatLng[] = rawCoords.map(([lng, lat]) => ({
            latitude: lat,
            longitude: lng,
          }));
          setRouteCoords(trimRoute(formattedCoords, currentLocation));
        })
        .catch((error) => console.error('Error fetching route:', error));
    }
  }, [currentLocation, deliveryData]);

  const closeModal = () => {
    setIsVisible(false);
    router.back();
  };

  return (
    <Modal visible={isVisible} onRequestClose={closeModal} transparent animationType="slide">
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.modalContainer}>
          {/* Full-screen Map */}
          <MapView
            style={StyleSheet.absoluteFillObject}
            showsUserLocation={true}
            followsUserLocation={true}
            initialRegion={{
              latitude: currentLocation?.latitude || 23.1,
              longitude: currentLocation?.longitude || 72.6,
              latitudeDelta: 0.2,
              longitudeDelta: 0.2,
            }}
          >
            {deliveryData?.delivery_points.map((point: any, index: number) => (
              <Marker
                key={index}
                coordinate={{ latitude: point.lat, longitude: point.lng }}
                onPress={() =>
                  setSelectedLocation({
                    name: point.customers[0].name,
                    phone: point.customers[0].phone,
                    address: point.address,
                    coords: [point.lng, point.lat],
                    products: point.customers[0].products.map((p: any) => p.name),
                  })
                }
              />
            ))}

            {routeCoords.length > 0 && (
              <Polyline coordinates={routeCoords} strokeColor="green" strokeWidth={4} />
            )}
          </MapView>

          {/* Info Box */}
          {selectedLocation && (
            <View style={styles.infoBox}>
              <Text style={styles.infoBoxTitle}>{selectedLocation.name}</Text>
              <Text style={styles.infoBoxText}>📞 {selectedLocation.phone}</Text>
              <Text style={styles.infoBoxText}>📍 {selectedLocation.address}</Text>
              <Text style={styles.infoBoxText}>🛒 {selectedLocation.products.join(', ')}</Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedLocation(null)}>
                <Text style={styles.closeButtonText}>Close Info</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Close Map Button */}
          <View style={styles.bottomButtonContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
            <Text style={styles.closeButtonText}>Close Map</Text>
          </TouchableOpacity>
        </View>

        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  closeButton: {
    backgroundColor: '#10b981',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 14,
    width: '90%',
    alignSelf: 'center',
    marginBottom: 11,
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  infoBox: {
    position: 'absolute',
    bottom: 120,
    alignSelf: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 10,
  },
  infoBoxTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  infoBoxText: {
    fontSize: 16,
    color: '#334155',
    marginBottom: 4,
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 15,
  },
});

export default MapScreen;