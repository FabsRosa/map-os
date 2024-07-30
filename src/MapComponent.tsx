import React, { useEffect, useState } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import apiClient from './apiClient';

const mapContainerStyle = {
  width: '100vw',
  height: '100vh',
};

const initialMapCenter = {
  lat: -15.59163,
  lng: -56.08009,
};

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

interface Order {
  idOS: string;
  lat: number;
  lng: number;
  client: string;
  info: string;
  technician: string;
}

const MapComponent: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await apiClient.get<Order[]>('/orders');
        if (response.ok && response.data) {
          setOrders(response.data);
        } else {
          console.error('Error fetching orders:', response.problem);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, []);

  const getMarkerColor = (status: string) => {
    // Example logic to color markers based on status
    switch (status) {
      case 'pending':
        return 'yellow';
      case 'in-progress':
        return 'blue';
      case 'completed':
        return 'green';
      default:
        return 'red';
    }
  };

  return (
    <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={initialMapCenter}
        zoom={12}
      >
        {orders.map(order => (
          <Marker
            key={order.idOS}
            position={{ lat: order.lat, lng: order.lng }}
            icon={{
              url: `http://maps.google.com/mapfiles/ms/icons/${getMarkerColor(order.info)}-dot.png`
            }}
            onClick={() => setSelectedOrder(order)}
          />
        ))}
        
        {selectedOrder && (
          <InfoWindow
            position={{ lat: selectedOrder.lat, lng: selectedOrder.lng }}
            onCloseClick={() => setSelectedOrder(null)}
          >
            <div>
              <h2>Order ID: {selectedOrder.idOS}</h2>
              <p>Owner: {selectedOrder.technician}</p>
              <p>Status: {selectedOrder.info}</p>
              {/* Add more order details here */}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </LoadScript>
  );
};

export default MapComponent;
