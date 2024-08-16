import React, { useEffect, useState, useCallback } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import apiClient from './utils/apiClient';
import filterMarker from './utils/filterMarker';
import { fetchOrdersData, fetchAlarmsData, fetchMotosData, fetchDefects, fetchTechnicians } from './utils/fetchData';
import {renderMarkerOrder, renderMarkerMoto, renderHighlightedDialog, renderSelectedDialog} from './components/renderMarkers';
import renderSidebar from './components/Sidebar';
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
  const [alarms, setAlarms] = useState([]);
  const [motos, setMotos] = useState([]);
  const [defeitos, setDefeitos] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);

  // Controladores de seleção de markers
  const [highlightedOrder, setHighlightedOrder] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [highlightedAlarm, setHighlightedAlarm] = useState(null);
  const [selectedAlarm, setSelectedAlarm] = useState(null);
  const [highlightedMoto, setHighlightedMoto] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);

  // Controladores de filtro
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [filters, setFilters] = useState({tipoOS: '', defeito: '', tecnico: '', dataAg: ''});

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

      const alarmsData = await fetchAlarmsData();
      setAlarms(alarmsData);

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
    setSelectedAlarm(null);
    setHighlightedAlarm(null);
    setHighlightedMoto(null);
    setEditingOrder(null);
  }, []);

  // Mantém dialog de informações ao clicar em um marker
  const handleMarkerClickOrder = useCallback((order) => (e) => {
    e.domEvent.stopPropagation();
    setSelectedOrder(order);
  }, []);

  // Mantém dialog de informações ao clicar em um marker
  const handleMarkerClickAlarm = useCallback((alarm) => (e) => {
    e.domEvent.stopPropagation();
    setSelectedAlarm(alarm);
  }, []);

  // Apresenta dialog de informações ao passar o mouse em cima de um marker
  const handleMouseOverOrder = useCallback((order) => () => setHighlightedOrder(order), []);
  const handleMouseOutOrder = useCallback(() => setHighlightedOrder(null), []);
  const handleMouseOverAlarm = useCallback((alarm) => () => setHighlightedAlarm(alarm), []);
  const handleMouseOutAlarm = useCallback(() => setHighlightedAlarm(null), []);
  const handleMotoMouseOver = useCallback((moto) => () => setHighlightedMoto(moto), []);
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
      {renderSidebar(isSidebarOpen, toggleSidebar, orders, filters, tecnicos, defeitos, onFilterChange, type, onTypeChange)}

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

        {renderMarkerOrder(orders, alarms, tecnicos, type, highlightedOrder, handleMarkerClickOrder, handleMouseOutOrder, handleMouseOverOrder, handleMarkerClickAlarm, handleMouseOutAlarm, handleMouseOverAlarm)}
        {renderMarkerMoto(motos, handleMotoMouseOut, handleMotoMouseOver)}
        
        {renderHighlightedDialog(highlightedOrder, highlightedAlarm, highlightedMoto, orders, alarms, motos)}
        {renderSelectedDialog(selectedOrder, editingOrder, setEditingOrder, selectedAlarm, onTecChange, tecnicos)}

      </GoogleMap>
    </div>
  ) : null;
};

export default Map;