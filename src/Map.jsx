import React, { useEffect, useState, useCallback } from 'react';
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import apiClient from './utils/apiClient';
import getMarkerIcon from './utils/getMarkerIcon';
import filterMarker from './utils/filterMarker';
import { fetchOrdersData, fetchMotosData, fetchDefects, fetchTechnicians } from './utils/fetchData';
import {InfoWindowContentOrder, InfoWindowContentMoto} from './components/InfoWindowContent';
import Sidebar from './components/Sidebar';
import './styles/Map.css';

const mapContainerStyle = {
  width: '100vw',
  height: '100vh',
};

const initialMapCenter = {
  lat: -15.59163,
  lng: -56.08009,
};

const Map = ({ mapType }) => {
  // Dados de OS e posição
  const [orders, setOrders] = useState([]);
  const [motos, setMotos] = useState([]);
  const [defeitos, setDefeitos] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);

  // Controladores de seleção de markers
  const [highlightedOrder, setHighlightedOrder] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [highlightedMoto, setHighlightedMoto] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);

  // Controladores de filtro
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [filters, setFilters] = useState({tipoOS: '', defeito: '', tecnico: ''});

  const [type, setType] = useState(mapType);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const toggleSidebar = () => {
    setIsSidebarOpen(prevState => !prevState);
  };

  // Atualiza dados de OS e motos
  useEffect(() => {
    const fetchMapData = async () => {
      const ordersData = await fetchOrdersData();
      const ordersFiltered = filterMarker(ordersData, filters, tecnicos);
      setOrders(ordersFiltered);

      const motosData = await fetchMotosData();
      setMotos(motosData);
    };
    fetchMapData();

    const intervalId = setInterval(fetchMapData, 5000);
    return () => clearInterval(intervalId);
  }, [filters]);

  // Atualiza lista de técnicos não-terceirizados e defeitos
  useEffect(() => {
    const fetchFilterData = async () => {
      const tecData = await fetchTechnicians();
      setTecnicos(tecData);

      const defData = await fetchDefects();
      setDefeitos(defData);
    };
    fetchFilterData();

    const intervalId = setInterval(fetchFilterData, 60000);
    return () => clearInterval(intervalId);
  }, []);

  // Reseta todos os seletores ao clicar em espaço vazio
  const handleMapClick = useCallback(() => {
    setSelectedOrder(null);
    setHighlightedOrder(null);
    setHighlightedMoto(null);
    setEditingOrder(null);
  }, []);

  // Mantém dialog de informações ao clicar em um marker
  const handleMarkerClick = useCallback((order) => (e) => {
    e.domEvent.stopPropagation();
    setSelectedOrder(order);
  }, []);

  // Apresenta dialog de informações ao passar o mouse em cima de um marker
  const handleOrderMouseOver = useCallback((order) => () => setHighlightedOrder(order.id), []);
  const handleOrderMouseOut = useCallback(() => setHighlightedOrder(null), []);
  const handleMotoMouseOver = useCallback((moto) => () => setHighlightedMoto(moto.id), []);
  const handleMotoMouseOut = useCallback(() => setHighlightedMoto(null), []);

  // Atualiza as variáveis e faz update no banco ao alterar o técnico designado de uma OS
  const onTecChange = async (idNewTech) => {
    const nomeTec = tecnicos ? tecnicos.find(tec => tec.id == idNewTech).nome : '';
    const updatedOrders = orders.map(order => 
      order.id == editingOrder ? { ...order, idTec: idNewTech, nomeTec: nomeTec } : order
    );
    setOrders(updatedOrders);

    const updatedSelectedOrder = selectedOrder ? { ...selectedOrder, idTec: idNewTech, nomeTec: nomeTec } : selectedOrder;
    setSelectedOrder(updatedSelectedOrder);

    await apiClient.post(`/maps/updateTec`, { idOS: editingOrder, idTec: idNewTech });
    setEditingOrder(null);
  };

  const onTypeChange = async (idNewType) => {
    setType(idNewType);
  };

  // Atualiza variáveis de OS e filtro ao alterar os filtros
  const onFilterChange = async (orders, newFilter, tecnicos) => {
    setFilters(newFilter);
    const ordersFiltered = filterMarker(orders, newFilter, tecnicos);
    setOrders(ordersFiltered);
  };

  // Processamento do mapa
  return isLoaded ? (
    <div>
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={toggleSidebar}
        orders={orders}
        filters={filters}
        tecnicos={tecnicos}
        defeitos={defeitos}
        onFilterChange={onFilterChange}
        type={type}
        onTypeChange={onTypeChange}
      />

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
        <Marker
          key={1}
          position={{
            lat: -15.59163,
            lng: -56.08009,
          }}
          icon={{ url: `/icon/Inviolavel.png` }}
        />

        {orders.map(order => (
          <Marker
            key={order.id}
            position={{ lat: order.lat, lng: order.lng }}
            icon={{ url: getMarkerIcon(highlightedOrder === order.id, order.nomeTec, tecnicos.find(tec => tec.id == order.idTec)) }}
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
            <InfoWindowContentOrder
              key={selectedOrder.id + selectedOrder.nomeTec} // Unique key to force re-render
              order={selectedOrder}
              isEditing={editingOrder === selectedOrder.id}
              onEditClick={() => setEditingOrder(selectedOrder.id)}
              onTecChange={onTecChange}
              tecnicos={tecnicos}
            />
          </InfoWindow>
        )}

      </GoogleMap>
    </div>
  ) : null;
};

export default Map;