import React, { useEffect, useState } from 'react';
import { View, Modal, StyleSheet, TouchableOpacity, Text } from 'react-native';
import MapView, { Marker, Polyline, LatLng } from 'react-native-maps';
import * as Location from 'expo-location';
import { router } from 'expo-router';

type LocationType = {
  name: string;
  phone: string;
  address: string;
  coords: [number, number]; // [longitude, latitude]
};

const locations: LocationType[] = [
  {
    name: 'Aarav Patel',
    phone: '+91 98765 43210',
    address: '23, Shyam Nagar, Satellite, Ahmedabad',
    coords: [72.6256, 23.2237]
  },
  {
    name: 'Neha Sharma',
    phone: '+91 91234 56789',
    address: '12, Airport Road, Hansol, Ahmedabad',
    coords: [72.6266, 23.0738]
  },
  {
    name: 'Rohan Desai',
    phone: '+91 99887 76655',
    address: '45, Relief Road, Kalupur, Ahmedabad',
    coords: [72.6014, 23.0266]
  }
];

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

export default function MapScreen() {
  const [routeCoords, setRouteCoords] = useState<LatLng[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<LocationType | null>(null);
  const [currentLocation, setCurrentLocation] = useState<LatLng | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Permission to access location was denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      const initialLocation = { latitude, longitude };
      setCurrentLocation(initialLocation);

      const watchSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (loc) => {
          const updatedLocation = {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          };
          setCurrentLocation(updatedLocation);

          // 🧠 Trim the route as user moves
          setRouteCoords((prev) => trimRoute(prev, updatedLocation));
        }
      );
    })();
  }, []);

  useEffect(() => {
    if (!currentLocation) return;

    const fetchRoute = async () => {
      try {
        const coordinates = [
          [currentLocation.longitude, currentLocation.latitude],
          ...locations.map(loc => loc.coords)
        ];

        const response = await fetch('https://api.openrouteservice.org/v2/directions/foot-walking/geojson', {
          method: 'POST',
          headers: {
            Authorization: '5b3ce3597851110001cf6248b9df1fc24bb946f98baf13d6ab7febea', // Replace with your actual key
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ coordinates })
        });

        const data = await response.json();
        const rawCoords: [number, number][] = data.features[0].geometry.coordinates;
        const formattedCoords: LatLng[] = rawCoords.map(([lng, lat]) => ({
          latitude: lat,
          longitude: lng
        }));
        setRouteCoords(formattedCoords);
      } catch (error) {
        console.error('Error fetching route:', error);
      }
    };

    fetchRoute();
  }, [currentLocation]);

  const closeModal = () => {
    setIsVisible(false);
    router.back();
  };

  return (
    <Modal visible={isVisible} onRequestClose={closeModal} transparent animationType="slide">
      <View style={styles.modalContainer}>
        <MapView
          style={{ flex: 1 }}
          showsUserLocation={true}
          followsUserLocation={true}
          initialRegion={{
            latitude: currentLocation?.latitude || 23.1,
            longitude: currentLocation?.longitude || 72.6,
            latitudeDelta: 0.2,
            longitudeDelta: 0.2
          }}
        >
          {locations.map((loc, index) => (
            <Marker
              key={index}
              coordinate={{ latitude: loc.coords[1], longitude: loc.coords[0] }}
              onPress={() => setSelectedLocation(loc)}
            />
          ))}

          {routeCoords.length > 0 && (
            <Polyline coordinates={routeCoords} strokeColor="green" strokeWidth={4} />
          )}
        </MapView>

        {selectedLocation && (
          <View style={styles.infoBox}>
            <Text style={styles.infoBoxTitle}>{selectedLocation.name}</Text>
            <Text style={styles.infoBoxText}>Phone: {selectedLocation.phone}</Text>
            <Text style={styles.infoBoxText}>Address: {selectedLocation.address}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedLocation(null)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
          <Text style={styles.closeButtonText}>Close Map</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  closeButton: {
    backgroundColor: '#ff4d4d',
    paddingVertical: 15,
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  closeButtonText: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 18,
  },
  infoBox: {
    position: 'absolute',
    top: 20,
    left: '50%',
    transform: [{ translateX: -150 }],
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    width: 300,
    elevation: 5,
    zIndex: 1000,
  },
  infoBoxTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  infoBoxText: {
    fontSize: 14,
    marginBottom: 5,
  },
});
