import React, { useEffect, useState } from 'react';
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import apiClient from './apiClient';

const mapContainerStyle = {
  width: '100vw',
  height: '100vh',
};

const initialMapCenter = {
  lat: -15.59163,
  lng: -56.08009,
};

interface Order {
  idOS: string;
  lat: number;
  lng: number;
  clientID: string;
  clientName: string;
  def: string;
  desc: string;
}

const getMarkerColor = (status: string) => {
  switch (status) {
    case 'RETORNO':
      return 'yellow';
    default:
      return 'red';
  }
};

const MapComponent: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await apiClient.get<{ maps: any[] }>('/maps/maps');
        if (response.ok && response.data) {
          const ordersData = response.data.maps.map(order => ({
            idOS: order.IDOS.toString(),
            lat: parseFloat(order.latitude),
            lng: parseFloat(order.longitude),
            clientID: order.SP,
            clientName: order.fantasia,
            def: order.DEFEITO,
            desc: order.descricao,
          }));
          setOrders(ordersData);
        } else {
          console.error('Error fetching orders:', response.problem);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, []);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  })

  return isLoaded ? (
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={initialMapCenter}
        zoom={12}
        options={{
          styles: [
            {
              featureType: 'poi',
              stylers: [{ visibility: 'off' }]
            }
          ],
          mapTypeControl: false,
        }}
      >
        {orders.map(order => (
          <Marker
            key={order.idOS}
            position={{ lat: order.lat, lng: order.lng }}
            icon={{
              url: `http://maps.google.com/mapfiles/ms/icons/${getMarkerColor(order.def)}-dot.png`
            }}
            onClick={() => setSelectedOrder(order)}
          />
        ))}
        
        {selectedOrder && (
          <InfoWindow
            position={{ lat: selectedOrder.lat, lng: selectedOrder.lng }}
            onCloseClick={() => setSelectedOrder(null)}
            options={{ pixelOffset: new window.google.maps.Size(0, -40) }}
          >
            <div style={{ backgroundColor: '#fff', color: '#000', padding: '0px 10px', margin: '5px', borderRadius: '5px' }}>
              <h2 style={{ margin: '5px', padding: '0px 5px' }}> OS {selectedOrder.idOS} - {selectedOrder.def}</h2>
              <h3 style={{ margin: '5px', padding: '0px 5px' }}>Local: {selectedOrder.clientID} · {selectedOrder.clientName}</h3>
              <p style={{ margin: '13px 5px 20px 5px', padding: '0px 5px', fontSize: '1.1em' }}> • {selectedOrder.desc}</p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
  ) : <></>;
};

export default MapComponent;