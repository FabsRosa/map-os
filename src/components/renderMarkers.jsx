import { InfoWindow, Marker } from '@react-google-maps/api';
import { calculateDistance } from '../utils/distanceCalculator';
import React, { useState, useEffect } from 'react';

const renderMarkerPin = (orders, alarms, tecnicos, type, highlightedOrder, highlightedAlarm, handleMarkerClickOrder, handleMouseOutOrder, handleMouseOverOrder, handleMarkerClickAlarm, handleMouseOutAlarm, handleMouseOverAlarm) => {
  if (type === 'OS') {
    return orders.map(order => (
      <Marker
        key={order.id}
        position={{ lat: order.lat, lng: order.lng }}
        icon={{ url: getMarkerIconOrder((highlightedOrder ? highlightedOrder.id === order.id : false), order.nomeTec, tecnicos.find(tec => tec.id == order.idTec)) }}
        onClick={handleMarkerClickOrder(order)}
        onMouseOut={handleMouseOutOrder}
        onMouseOver={handleMouseOverOrder(order)}
      />
    ))
  } else if (type === 'Alarm') {
    let id = 0;
    return alarms.map(alarm => {
      return (
      <Marker
        key={alarm.clientID + id++}
        position={{ lat: alarm.lat, lng: alarm.lng }}
        icon={{ url: getMarkerIconAlarm((highlightedAlarm ? highlightedAlarm.clientID === alarm.clientID : false), alarm) }}
        onClick={handleMarkerClickAlarm(alarm)}
        onMouseOut={handleMouseOutAlarm}
        onMouseOver={handleMouseOverAlarm(alarm)}
      />
    )})
  }
}

const renderMarkerMoto = (motos, handleMotoMouseOut, handleMotoMouseOver) => {
  return motos.map(moto => (
    <Marker
      key={moto.id}
      position={{ lat: moto.lat, lng: moto.lng }}
      icon={{ url: getMarkerIconMoto(moto.nomeTatico)}}
      onMouseOut={handleMotoMouseOut}
      onMouseOver={handleMotoMouseOver(moto)}
    />
  ))
}

const renderHighlightedDialog = (highlightedOrder, highlightedAlarm, highlightedMoto, motos) => {
  if (highlightedOrder) {
    return (
      <InfoWindow
        position={{
          lat: highlightedOrder.lat,
          lng: highlightedOrder.lng
        }}
        options={{ pixelOffset: new window.google.maps.Size(0, -40), disableAutoPan: true }}
      > 
        <InfoWindowContentOrder order={highlightedOrder} />
      </InfoWindow>
    )
  } else if (highlightedMoto) {
    return (
      <InfoWindow
        position={{
          lat: highlightedMoto.lat,
          lng: highlightedMoto.lng
        }}
        options={{ pixelOffset: new window.google.maps.Size(0, -40), disableAutoPan: true }}
      > 
        <InfoWindowContentMoto moto={highlightedMoto} />
      </InfoWindow>
    )
  } else if (highlightedAlarm) {
    return (
      <InfoWindow
        position={{
          lat: highlightedAlarm.lat,
          lng: highlightedAlarm.lng
        }}
        options={{ pixelOffset: new window.google.maps.Size(0, -40), disableAutoPan: true }}
      > 
        <InfoWindowContentAlarm alarm={highlightedAlarm} motos={motos}/>
      </InfoWindow>
    )
  }
}
const renderSelectedDialog = (selectedOrder, editingOrder, setEditingOrder, selectedAlarm, onTecChange, tecnicos, motos) => {
  if (selectedOrder) {
    return (
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
    )
  } else if (selectedAlarm) {
      return (
      <InfoWindow
        position={{ lat: selectedAlarm.lat, lng: selectedAlarm.lng }}
        options={{ pixelOffset: new window.google.maps.Size(0, -40), disableAutoPan: true }}
      >
        <InfoWindowContentAlarm
          key={selectedAlarm.clientID + selectedAlarm.clientName}
          alarm={selectedAlarm}
          motos={motos}
        />
      </InfoWindow>
    )
  }
}

// Design da dialog de informações de OS
const InfoWindowContentOrder = ({ order, isEditing, onEditClick, onTecChange, tecnicos }) => {
  const isTecInList = tecnicos ? tecnicos.some(tec => tec.id == order.idTec) : false;

  return (
    <div style={{ backgroundColor: '#fff', color: '#000', padding: '5px', borderRadius: '5px' }}>
      <span className='p-big'>
          • Cliente: {order.clientID} · <b>{order.clientName}&nbsp;</b>
        <img 
          src='/icon/link.png' 
          alt='Edit' 
          style={{ marginLeft: '5px', width: '16px', height: '16px', cursor: 'pointer' }} 
          onClick={() => window.open(`https://www.google.com/maps?q=${order.lat},${order.lng}&z=13&t=m`, '_blank')}
        />
      </span>
      <p className='p-medium'>
        • Técnico:&nbsp;
        {isEditing ? (
          <select className='custom-select' value={isTecInList ? order.idTec : ''} onChange={(e) => onTecChange(e.target.value)}>
            <option value='' disabled>TERCEIRIZADO</option>
            {tecnicos.map(tec => (
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
      {order.dataAg ? (
        <p className='p-medium'>• Data Agendada: {formatDate(order.dataAg)}</p>
      ) : null}
      <p className='p-small'>• {order.desc}</p>
    </div>
  );
};

// Design da dialog de informações de Alarmes
const InfoWindowContentAlarm = ({ alarm, motos }) => {
  const [distances, setDistances] = useState([]);
  const locationAlarm = { lat: alarm.lat, lng: alarm.lng };

  useEffect(() => {
    const fetchDistances = async () => {
      const listDistance = await Promise.all(
        motos
          .filter(moto => moto.nomeTatico !== null)  // Filter out null values first
          .map(async moto => {
            const locationMoto = { lat: moto.lat, lng: moto.lng };
            try {
              const result = await calculateDistance(locationMoto, locationAlarm);
              return result ? { distance: result.distance, duration: result.duration, nomeTatico: moto.nomeTatico } : null;
            } catch (error) {
              console.error('Error calculating distance:', error);
              return null;
            }
          })
      );

      setDistances(listDistance);
    };

    fetchDistances();
  }, [alarm, motos]);

  // Wait for the distances to be calculated before rendering
  if (distances.length === 0) {
    return (
      <div style={{ backgroundColor: '#fff', color: '#000', padding: '5px', borderRadius: '5px' }}>
        <span className='p-big alarm'>
          • Cliente: {alarm.clientID} · <b>{alarm.clientName}&nbsp;</b>
          <img 
            src='/icon/link.png' 
            alt='Edit' 
            style={{ marginLeft: '5px', width: '16px', height: '16px', cursor: 'pointer' }} 
            onClick={() => window.open(`https://www.google.com/maps?q=${alarm.lat},${alarm.lng}&z=13&t=m`, '_blank')}
          />
        </span>
        <div className='p-medium'>• Código Evento: <b>{alarm.codEvento}</b></div>
        <div className='p-medium'>{alarm.dtRecebido !== null ? `• Recebido: ${formatTime(alarm.dtRecebido)}, ${alarm.tempoRecebido} min` : null}</div>
      <div className='p-medium'>{alarm.dtDeslocamento !== null ? `• Deslocamento: ${formatTime(alarm.dtDeslocamento)}, ${alarm.tempoDeslocamento} min` : null}</div>
      <div className='p-medium'>{alarm.dtLocal !== null ? `• Local: ${formatTime(alarm.dtLocal)}, ${alarm.tempoLocal} min` : null}</div>
        <div className='p-medium'>Calculando distâncias...</div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#fff', color: '#000', padding: '5px', borderRadius: '5px' }}>
      <span className='p-big alarm'>
        • Cliente: {alarm.clientID} · <b>{alarm.clientName}&nbsp;</b>
        <img 
          src='/icon/link.png' 
          alt='Edit' 
          style={{ marginLeft: '5px', width: '16px', height: '16px', cursor: 'pointer' }} 
          onClick={() => window.open(`https://www.google.com/maps?q=${alarm.lat},${alarm.lng}&z=13&t=m`, '_blank')}
        />
      </span>
      <div className='p-medium'>• Código Evento: <b>{alarm.codEvento}</b></div>
      <div className='p-medium'>{alarm.dtRecebido !== null ? `• Recebido: ${formatTime(alarm.dtRecebido)}, ${alarm.tempoRecebido} min` : null}</div>
      <div className='p-medium'>{alarm.dtDeslocamento !== null ? `• Deslocamento: ${formatTime(alarm.dtDeslocamento)}, ${alarm.tempoDeslocamento} min` : null}</div>
      <div className='p-medium'>{alarm.dtLocal !== null ? `• Local: ${formatTime(alarm.dtLocal)}, ${alarm.tempoLocal} min` : null}</div>
      {distances.map((distance, index) => (
        distance && (
          <div className='p-medium alarm' key={index}>
            <b>{distance.nomeTatico}:</b> {`${distance.distance}, ${distance.duration}.`}
          </div>
        )
      ))}
    </div>
  );
};

// Design da dialog de informações de Moto
const InfoWindowContentMoto = ({ moto }) => (
  <div style={{ backgroundColor: '#fff', color: '#000', padding: '5px', borderRadius: '5px' }}>
    <p className='p-big moto'>
      • Placa: <b>{moto.id}</b>
    </p>
    {moto.nomeTatico ? (
        <p className='p-medium'>• Tático: <b>{moto.nomeTatico}</b></p>
      ) : null}
  </div>
);

const formatDate = (dateStr) => {
  try {
    const date = new Date(dateStr);
    
    if (isNaN(date.getTime())) {
      throw new Error("Invalid date string");
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error("Error formatting date:", error.message);
    return null; // or return a fallback value
  }
}

// Retorna endereço do ícone, com base no técnico designado
const getMarkerIconOrder = (isHighlighted, nomeTec, tec) => {
  let color;
  let isTerceirizado = false;
  
  if (tec) {
    if (tec.color) {
      color = tec.color;
    } else {
      color = 'yellow';
      isTerceirizado = true;
    }
  } else {
    color = 'yellow';
    isTerceirizado = true;
  }

  let iconPath = `/pin/${color}`;

  if (isHighlighted) {
    iconPath += `-dot`;
  } else {
    if (!isTerceirizado) {
      if (nomeTec) {
        iconPath += `-${nomeTec.charAt(0).toLowerCase()}`;
      }
    } else {
      iconPath += `-t`; // Terceirizado
    }
  }

  iconPath += `.png`;
  
  return iconPath;
}

// Retorna endereço do ícone
const getMarkerIconAlarm = (isHighlighted, alarm) => {
  // const pinColors = ['red', 'blue', 'green', 'lightblue', 'pink', 'purple', 'orange', 'yellow'];
  let iconPath = `/pin/`;

  if ((!alarm.tempoRecebido || alarm.tempoRecebido) < 10 && alarm.dtDeslocamento === null && alarm.dtLocal === null) {
    iconPath += 'yellow';
  } else if (alarm.dtDeslocamento === null && alarm.dtLocal === null) {
    iconPath += 'red';
  } else if (alarm.dtLocal === null) {
    iconPath += 'blue';
  } else {
    iconPath += 'green';
  }

  if (isHighlighted) {
    iconPath += `-dot`;
  } else if (alarm.clientName) {
    iconPath += `-${alarm.clientName.charAt(0).toLowerCase()}`; // First letter of the name
  }

  iconPath += '.png';
  return iconPath;
};

// Retorna endereço do ícone
const getMarkerIconMoto = (nomeTatico) => {
  return `/icon/motorcycling${nomeTatico ? (
    `-yellow` // First letter of the name
  ) : (
    ``
  )}.png`;
};

const formatTime = (isoString) => {
  try {
    const date = new Date(isoString);

    // Extract hours and minutes
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    const seconds = date.getUTCSeconds().toString().padStart(2, '0');
  
    // Format as HH:MM
    return `${hours}:${minutes}:${seconds}`;
  } catch (error) {
    console.error("Error while converting string of time.")
    return '';
  }
}

export {
  renderMarkerPin,
  renderMarkerMoto,
  renderHighlightedDialog,
  renderSelectedDialog
};