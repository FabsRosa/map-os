import React, { useEffect, useState, useCallback } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import apiClient from './utils/apiClient';
import {filterMarker} from './utils/filterMarker';
import { fetchOrdersData, fetchAlarmsData, fetchMotosData, fetchDefects, fetchTechnicians } from './utils/fetchData';
import {renderMarkerPin, renderMarkerMoto, renderHighlightedDialog, renderSelectedDialog} from './components/renderMarkers';
import renderSidebar from './components/Sidebar';
import './styles/Map.css';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const mapContainerStyle = {
  width: '100vw',
  height: '100vh',
};

const initialMapCenter = {
  lat: -15.59163,
  lng: -56.08009,
};

const intervalUpdateMap = 15000;
const intervalUpdateIndex = 60000;

const Map = ({ mapType }) => {
  // Controlador de tipo de mapa
  const [type, setType] = useState(mapType);

  // Dados de OS e posição
  const [orders, setOrders] = useState([]);
  const [unfOrders, setUnfOrders] = useState([]);
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
  const [selectedMoto, setSelectedMoto] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);
  const [schedulingOrder, setSchedulingOrder] = useState(null);
  const [schedulingDate, setSchedulingDate] = useState(null);

  // Controladores de filtro
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [filters, setFilters] = useState(
    {
      ocultar: '',
      tipoOS: '',
      defeito: '',
      tecnico: '',
      cliente: '',
      dataIniAb: null,
      dataFimAb: null,
      dataIniAg: null,
      dataFimAg: null
    }
  );

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const toggleSidebar = () => {
    setIsSidebarOpen(prevState => !prevState);
  };

  // Atualiza lista de técnicos não-terceirizados e defeitos
  useEffect(() => {
    const fetchFilterIndex = async () => {
      const tecData = await fetchTechnicians();
      setTecnicos(tecData);

      const defData = await fetchDefects();
      setDefeitos(defData);
    };
    fetchFilterIndex();

    const intervalId = setInterval(fetchFilterIndex, intervalUpdateIndex);
    return () => clearInterval(intervalId);
  }, []);

  // Atualiza dados de OS e motos
  useEffect(() => {
    const fetchMapData = async () => {
        const ordersData = await fetchOrdersData();
        setUnfOrders(ordersData);
        const ordersFiltered = filterMarker(ordersData, filters, tecnicos);
        setOrders(ordersFiltered);
        const alarmsData = await fetchAlarmsData();
        setAlarms(alarmsData);

      const motosData = await fetchMotosData();
      setMotos(motosData);
    };
    fetchMapData();

    const intervalId = setInterval(fetchMapData, intervalUpdateMap);
    return () => clearInterval(intervalId);
  }, [filters, type, tecnicos, schedulingOrder]);

  // Reseta todos os seletores ao clicar em espaço vazio
  const handleMapClick = useCallback(() => {
    setSelectedOrder(null);
    setHighlightedOrder(null);
    setSelectedAlarm(null);
    setHighlightedAlarm(null);
    setHighlightedMoto(null);
    setSelectedMoto(null);
    setEditingOrder(null);
    setSchedulingOrder(null);
    setSchedulingDate(null);
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

  // Mantém dialog de informações ao clicar em um marker
  const handleMarkerClickMoto = useCallback((moto) => (e) => {
    e.domEvent.stopPropagation();
    setSelectedMoto(moto);
  }, []);

  // Apresenta dialog de informações ao passar o mouse em cima de um marker
  const handleMouseOverOrder = useCallback((order) => () => setHighlightedOrder(order), []);
  const handleMouseOutOrder = useCallback(() => setHighlightedOrder(null), []);
  const handleMouseOverAlarm = useCallback((alarm) => () => setHighlightedAlarm(alarm), []);
  const handleMouseOutAlarm = useCallback(() => setHighlightedAlarm(null), []);
  const handleMouseOverMoto = useCallback((moto) => () => setHighlightedMoto(moto), []);
  const handleMouseOutMoto = useCallback(() => setHighlightedMoto(null), []);

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

  // Atualiza as variáveis e faz update no banco ao alterar o técnico designado de uma OS
  const onScheduleChange = async (idOS, newDate) => {
    if (newDate !== null && (new Date(newDate) == 'Invalid Date' || typeof newDate !== 'string')) {
      return;
    }

    await apiClient.post(`/maps/updateScheduled`, { idOS: idOS, date: newDate });

    setSchedulingOrder(null);
    setSchedulingDate(null);
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

  const mapStyles = [
    { featureType: 'poi', stylers: [{ visibility: 'off' }] },
    { featureType: 'transit', stylers: [{ visibility: 'off' }] },
    { featureType: 'landscape', elementType: 'labels', stylers: [{ visibility: 'off' }] },
    { featureType: 'water', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  ];
  
  // Conditionally add administrative labels style
  if (type === 'OS') {
    mapStyles.push(
      { featureType: 'administrative', stylers: [{ visibility: 'off' }] },
      { featureType: 'road', elementType: 'labels', stylers: [{ visibility: 'off' }] },
    );
    
  }

  // Processamento do mapa
  return isLoaded ? (
    <div>
      {renderSidebar(isSidebarOpen, toggleSidebar, orders, filters, tecnicos, defeitos, onFilterChange, type, onTypeChange)}

      {type === 'OS' && (
      <div className="counter order">
        <span>OS ›</span>
        <span className="count order">{orders ? orders.length : 0}</span>
      </div>
      )}

      {type === 'Alarm' && (
      <div>
        <div className="counter alarm">
          <span>Alarmes ›</span>
          <span className="count alarm">{alarms ? alarms.length : 0}</span>
        </div>
        <div className="counter tatico">
          <span>Táticos ›</span>
          <span className="count tatico">{motos ? motos.filter(moto => moto.nomeTatico !== null).length : 0}</span>
        </div>
      </div>
      )}

      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={initialMapCenter}
        zoom={13}
        options={{
          styles: mapStyles,
          mapTypeControl: false,
          fullscreenControl: false,
          gestureHandling: 'greedy',
        }}
        onClick={handleMapClick}
      >
        {<Marker
          key={1}
          position={{
            lat: -15.59154,
            lng: -56.08001,
          }}
          icon={{
            url: `/icon/Inviolavel.png`,
            scaledSize: new window.google.maps.Size(21, 21) // Adjust the width and height as needed
          }}
          zIndex={google.maps.Marker.MAX_ZINDEX + 1}
        />}

        {renderMarkerPin(orders, alarms, tecnicos, type, highlightedOrder, highlightedAlarm, handleMarkerClickOrder, handleMouseOutOrder, handleMouseOverOrder, handleMarkerClickAlarm, handleMouseOutAlarm, handleMouseOverAlarm)}
        {renderMarkerMoto(motos, unfOrders, tecnicos, type, filters, initialMapCenter, handleMarkerClickMoto, handleMouseOutMoto, handleMouseOverMoto)}
        
        {renderHighlightedDialog(highlightedOrder, highlightedAlarm, highlightedMoto, motos, filters, handleMapClick)}
        {renderSelectedDialog(selectedOrder, editingOrder, setEditingOrder, selectedAlarm, selectedMoto, onTecChange, onScheduleChange, schedulingOrder, setSchedulingOrder, schedulingDate, setSchedulingDate, tecnicos, motos, filters, handleMapClick)}

      </GoogleMap>
    </div>
  ) : null;
};

export default Map;