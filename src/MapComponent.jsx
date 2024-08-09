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

const pinColors = ['red', 'blue', 'green', 'lightblue', 'pink', 'purple', 'orange', 'yellow'];

const getMarkerIcon = (isHighlighted, nometec, tec) => {
  const color = tec ? (tec.color ? tec.color : 'yellow' ) : 'yellow';
  const isTerceirizado = color == 'yellow';
  return `/pin/${color}${isHighlighted ? (
      `-dot`
    ) : (
      `${!isTerceirizado ? (
        nometec ? (
          `-${nometec.charAt(0).toLowerCase()}` // First letter of the name
        ) : (
          ``
        )
      ) : (
        `-t` // Terceirizado
      )}`
    )}.png`;
};

const InfoWindowContentOrder = ({ order, isEditing, onEditClick, onTecChange, tecList }) => {
  const isTecInList = tecList ? tecList.some(tec => tec.id == order.idTec) : false;

  return (
    <div style={{ backgroundColor: '#fff', color: '#000', padding: '5px', borderRadius: '5px' }}>
      <p className='p-big'>
        • Cliente: {order.clientID} · <b>{order.clientName}</b>
      </p>
      <p className='p-medium'>
        • Técnico:&nbsp;
        {isEditing ? (
          <select className='custom-select' value={isTecInList ? order.idTec : ''} onChange={(e) => onTecChange(e.target.value)}>
            <option value='' disabled>TERCEIRIZADO</option>
            {tecList.map(tec => (
              <option key={tec.id} value={tec.id}>
                {tec.nome}
              </option>
            ))}
          </select>
        ) : (
          <span>
            <b onClick={onEditClick} style={{ cursor: 'pointer' }}>{order.nomeTec}</b>
            <img 
              src='/icon/down-arrow.png' 
              alt='Edit' 
              style={{ marginLeft: '5px', width: '16px', height: '16px', cursor: 'pointer' }} 
              onClick={onEditClick}
            />
          </span>
        )}
      </p>
      <p className='p-medium'>• Defeito: <b>{order.def}</b></p>
      <p className='p-medium'>• OS: {order.id}</p>
      <p className='p-small'>• {order.desc}</p>
    </div>
  );
};

const InfoWindowContentMoto = ({ moto }) => (
  <div style={{ backgroundColor: '#fff', color: '#000', padding: '5px', borderRadius: '5px' }}>
    <p className='p-big moto'>
      • Placa: <b>{moto.id}</b>
    </p>
  </div>
);

const fetchOrdersData = async () => {
  try {
    const responseOS = await apiClient.get('/maps/OS');

    if (responseOS.ok && responseOS.data) {
      const ordersData = responseOS.data.map(order => ({
        id: order.idOS.toString(),
        lat: parseFloat(order.lat),
        lng: parseFloat(order.lng),
        clientID: order.idCliente,
        clientName: order.nomeCliente,
        def: order.defeito,
        desc: order.descricao,
        idTec: order.idTec,
        nomeTec: order.nomeTec,
      }));

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
    const responseMoto = await apiClient.get('/maps/vehicleLocation');

    if (responseMoto.ok && responseMoto.data) {
      const motosData = responseMoto.data.map(moto => ({
        id: moto.placa,
        lat: parseFloat(moto.lat),
        lng: parseFloat(moto.lng),
      }));

      return motosData;
    } else {
      console.error('Error fetching orders:', responseMoto.problem);
    }
  } catch (error) {
    console.error('Error fetching orders:', error);
  }

  return [];
};

const fetchTechnicians = async () => {
  try {
    const response = await apiClient.get('/maps/tec');
    if (response.ok && response.data) {
      let colorIndex = 0;
      const tecData = response.data.map(tec => {
        if (colorIndex > 6) {
          colorIndex = 0;
        }

        return {
          id: tec.idTec,
          nome: tec.nomeTec,
          color: pinColors[colorIndex++ % pinColors.length],
        };
      });

      return tecData;
    } else {
      console.error('Error fetching orders:', response.problem);
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
  const [tecList, setTecList] = useState([]);
  const [editingOrder, setEditingOrder] = useState(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  useEffect(() => {
    const fetchMapData = async () => {
      const ordersData = await fetchOrdersData();
      setOrders(ordersData);

      const motosData = await fetchMotosData();
      setMotos(motosData);
    };

    fetchMapData(); // Initial fetch

    const intervalId = setInterval(fetchMapData, 5000); // Poll every 5 seconds

    return () => clearInterval(intervalId); // Cleanup on component unmount
  }, []);

  useEffect(() => {
    const fetchTecData = async () => {
      const tecData = await fetchTechnicians();
      setTecList(tecData);
    };

    fetchTecData();
  }, []);

  const handleMapClick = useCallback(() => {
    setSelectedOrder(null);
    setHighlightedOrder(null);
    setHighlightedMoto(null);
    setEditingOrder(null);
  }, []);

  const handleMarkerClick = useCallback((order) => (e) => {
    e.domEvent.stopPropagation();
    setSelectedOrder(order);
  }, []);

  const handleOrderMouseOver = useCallback((order) => () => setHighlightedOrder(order.id), []);
  const handleOrderMouseOut = useCallback(() => setHighlightedOrder(null), []);

  const handleMotoMouseOver = useCallback((moto) => () => setHighlightedMoto(moto.id), []);
  const handleMotoMouseOut = useCallback(() => setHighlightedMoto(null), []);

  const handleEditTech = (order) => {
    setEditingOrder(order.id);
  };

  const handleTecChange = async (idNewTech) => {
    const nomeTec = tecList ? tecList.find(tec => tec.id == idNewTech).nome : '';

    const updatedOrders = orders.map(order => 
      order.id == editingOrder ? { ...order, idTec: idNewTech, nomeTec: nomeTec } : order
    );
    setOrders(updatedOrders);

    const updatedSelectedOrder = selectedOrder ? { ...selectedOrder, idTec: idNewTech, nomeTec: nomeTec } : selectedOrder;
    setSelectedOrder(updatedSelectedOrder);

    await apiClient.post(`/maps/updateTec`, { idOS: editingOrder, idTec: idNewTech });

    setEditingOrder(null);
  };

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
            icon={{ url: getMarkerIcon(highlightedOrder === order.id, order.nomeTec, tecList.find(tec => tec.id == order.idTec)) }}
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
              onEditClick={() => handleEditTech(selectedOrder)}
              onTecChange={handleTecChange}
              tecList={tecList}
            />
          </InfoWindow>
        )}
      </GoogleMap>
  ) : null;
};

export default MapComponent;
