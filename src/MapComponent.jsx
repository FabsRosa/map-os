import React, { useEffect, useState, useCallback } from 'react';
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import apiClient from './utils/apiClient';

const mapContainerStyle = {
  width: '100vw',
  height: '100vh',
};

const initialMapCenter = {
  lat: -15.59163,
  lng: -56.08009,
};

const pinColors = ['red', 'blue', 'green', 'lightblue', 'pink', 'purple', 'yellow', 'orange'];

const getMarkerIcon = (isHighlighted, color, tec) => `/pin/${color}${isHighlighted ? '-dot' : `${tec ? `-${tec.charAt(0).toLowerCase()}` : ''}`}.png`;

const InfoWindowContentOrder = ({ order }) => (
  <div style={{ backgroundColor: '#fff', color: '#000', padding: '5px', borderRadius: '5px' }}>
    <h3 style={{ margin: '0', padding: '0', fontSize: '1.3em' }}>
      {order.clientID} · {order.clientName}
    </h3>
    <p style={{ margin: '0', paddingTop: '3px', fontSize: '1.2em' }}>Técnico: <b>{order.tec}</b></p>
    <p style={{ margin: '0', paddingTop: '3px', fontSize: '1.2em' }}>Defeito: {order.def}</p>
    <p style={{ margin: '0', paddingTop: '3px', fontSize: '1.2em' }}>OS: {order.id}</p>
    <p style={{ margin: '0', paddingTop: '4px', fontSize: '1.1em' }}> • {order.desc}</p>
  </div>
);

const InfoWindowContentMoto = ({ moto }) => (
  <div style={{ backgroundColor: '#fff', color: '#000', padding: '5px', borderRadius: '5px' }}>
    <h3 style={{ margin: '0', padding: '0', fontSize: '1.3em' }}>
      Placa: {moto.id}
    </h3>
  </div>
);

const fetchOrdersData = async () => {
  try {
    const responseOS = await apiClient.get('/maps/maps');
    const responseTec = await apiClient.get('/maps/dataTecs');

    if (responseOS.ok && responseOS.data && responseTec.ok && responseTec.data) {
      let colorIndex = 0;
      const techData = responseTec.data.map(tec => ({
        ...tec,
        imageUrl: pinColors[colorIndex++ % pinColors.length],
      }));

      const ordersData = responseOS.data.maps.map(order => {
        const foundTec = techData.find(tec => tec.metrics == order.metric);
        return {
          id: order.IDOS.toString(),
          lat: parseFloat(order.latitude),
          lng: parseFloat(order.longitude),
          clientID: order.SP,
          clientName: order.fantasia,
          def: order.DEFEITO,
          desc: order.descricao,
          tec: foundTec ? foundTec.name : '',
          color: foundTec ? foundTec.imageUrl : 'red',
        };
      });

      return ordersData;
    } else {
      console.error('Error fetching orders:', responseOS.problem);
    }
  } catch (error) {
    console.error('Error fetching orders:', error);
  }
  return [];
};

const fetchMotosData = async () => {
  try {
    const responseMoto = await apiClient.get('/maps/vehicles');

    if (responseMoto.ok && responseMoto.data) {
      const motosData = responseMoto.data.map(moto => {
        return {
          id: moto.placa,
          lat:parseFloat(moto.latitude),
          lng:parseFloat(moto.longitude),
        };
      });

      return motosData;
    } else {
      console.error('Error fetching orders:', responseMoto.problem);
    }
  } catch (error) {
    console.error('Error fetching orders:', error);
  }

  return [];
};

const MapComponent = () => {
  const [orders, setOrders] = useState([]);
  const [highlightedOrder, setHighlightedOrder] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [motos, setMotos] = useState([]);
  const [highlightedMoto, setHighlightedMoto] = useState(null);
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  useEffect(() => {
    const fetchData = async () => {
      const ordersData = await fetchOrdersData();
      setOrders(ordersData);

      const motosData = await fetchMotosData();
      setMotos(motosData);
    };

    fetchData(); // Initial fetch

    const intervalId = setInterval(fetchData, 10000); // Poll every 10 seconds

    return () => clearInterval(intervalId); // Cleanup on component unmount
  }, []);

  const handleMapClick = useCallback(() => {
    setSelectedOrder(null);
    setHighlightedOrder(null);
    setHighlightedMoto(null);
  }, []);

  const handleMarkerClick = useCallback((order) => (e) => {
    e.domEvent.stopPropagation();
    setSelectedOrder(order);
  }, []);

  const handleOrderMouseOver = useCallback((order) => () => setHighlightedOrder(order.id), []);
  const handleOrderMouseOut = useCallback(() => setHighlightedOrder(null), []);

  const handleMotoMouseOver = useCallback((moto) => () => setHighlightedMoto(moto.id), []);
  const handleMotoMouseOut = useCallback(() => setHighlightedMoto(null), []);

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={initialMapCenter}
      zoom={12}
      options={{
        styles: [{ featureType: 'poi', stylers: [{ visibility: 'off' }] }],
        mapTypeControl: false,
      }}
      onClick={handleMapClick}
    >
      {orders.map(order => (
        <Marker
          key={order.id}
          position={{ lat: order.lat, lng: order.lng }}
          icon={{ url: getMarkerIcon(highlightedOrder === order.id, order.color, order.tec) }}
          onClick={handleMarkerClick(order)}
          onMouseOut={handleOrderMouseOut}
          onMouseOver={handleOrderMouseOver(order)}
        />
      ))}

      {motos.map(moto => (
        <Marker
          key={moto.id}
          position={{ lat: moto.lat, lng: moto.lng }}
          icon={{ url: `/icon/motorcycling.png` }}
          onMouseOut={handleMotoMouseOut}
          onMouseOver={handleMotoMouseOver(moto)}
        />
      ))}

      {(highlightedOrder || highlightedMoto) && (
        <InfoWindow
          position={{
            lat: highlightedOrder ? (
                orders.find(order => order.id === highlightedOrder).lat
              ) : (
                motos.find(moto => moto.id === highlightedMoto).lat
              ),
            lng: highlightedOrder ? (
                orders.find(order => order.id === highlightedOrder).lng
              ) : (
                motos.find(moto => moto.id === highlightedMoto).lng
              )
            }}
          options={{ pixelOffset: new window.google.maps.Size(0, -40), disableAutoPan: true }}
        >
          {
            highlightedOrder ? (
              <InfoWindowContentOrder order={orders.find(order => order.id === highlightedOrder)} />
            ) : (
              <InfoWindowContentMoto moto={motos.find(moto => moto.id === highlightedMoto)} />
            )
          }
        </InfoWindow>
      )}

      {selectedOrder && (
        <InfoWindow
          position={{ lat: selectedOrder.lat, lng: selectedOrder.lng }}
          options={{ pixelOffset: new window.google.maps.Size(0, -40), disableAutoPan: true }}
        >
          <InfoWindowContentOrder order={selectedOrder} />
        </InfoWindow>
      )}
    </GoogleMap>
  ) : null;
};

export default MapComponent;
