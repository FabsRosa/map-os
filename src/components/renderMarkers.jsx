import { InfoWindow, Marker } from '@react-google-maps/api';
import { calculateDistance } from '../utils/distanceCalculator';
import React, { useState, useEffect } from 'react';
import {formatTime, formatDate} from '../utils/handleTime';
import haversineDistance from '../utils/haversineDistance';
import {filterMotos} from '../utils/filterMarker';

const iconSizePinOrder = 31;
const iconSizePinAlarm = 32;
const iconSizeMoto = 32;

const renderMarkerPin = (orders, alarms, tecnicos, type, highlightedOrder, highlightedAlarm, handleMarkerClickOrder, handleMouseOutOrder, handleMouseOverOrder, handleMarkerClickAlarm, handleMouseOutAlarm, handleMouseOverAlarm) => {
  if (type === 'OS') {
    return orders.map(order => (
      <Marker
        key={order.id}
        position={{ lat: order.lat, lng: order.lng }}
        icon={{
          url: getMarkerIconOrder((highlightedOrder ? highlightedOrder.id === order.id : false), order.nomeTec, tecnicos.find(tec => tec.id == order.idTec)),
          scaledSize: new window.google.maps.Size(iconSizePinOrder, iconSizePinOrder)
        }}
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
        icon={{
          url: getMarkerIconAlarm((highlightedAlarm ? highlightedAlarm.clientID === alarm.clientID : false), alarm),
          scaledSize: new window.google.maps.Size(iconSizePinAlarm, iconSizePinAlarm)
        }}
        onClick={handleMarkerClickAlarm(alarm)}
        onMouseOut={handleMouseOutAlarm}
        onMouseOver={handleMouseOverAlarm(alarm)}
      />
    )})
  }
}

const renderMarkerMoto = (motos, unfOrders, tecnicos, type, filters, initialMapCenter, handleMotoMouseOut, handleMotoMouseOver) => {
  if (!motos || motos.length === 0) return null;

  if (filterMotos(filters)) {
    return motos.map(moto => (
      <Marker
        key={moto.id}
        position={{ lat: moto.lat, lng: moto.lng }}
        icon={{
          url: getMarkerIconMoto(moto, unfOrders, tecnicos, type, initialMapCenter),
          scaledSize: new window.google.maps.Size(iconSizeMoto, iconSizeMoto)
        }}
        onMouseOut={handleMotoMouseOut}
        onMouseOver={handleMotoMouseOver(moto)}
        zIndex={type === 'OS' ? google.maps.Marker.MAX_ZINDEX : null}
      />
    ))
  } else {
    return null;
  }
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
      {order.dataAb ? (
        <p className='p-medium'>• Data Abertura: <b>{formatDate(order.dataAb)}</b>, {formatTime(order.dataAb)}</p>
      ) : null}
      {order.dataAg ? (
        <p className='p-medium'>• Data Agendada: <b>{formatDate(order.dataAg)}</b>, {formatTime(order.dataAg)}</p>
      ) : null}
      <p className='p-medium'>• OS: {order.id}</p>
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
      <div className='p-medium'>
        {alarm.dtRecebido !== null ? (
          <span>
            • Recebido: 
            &nbsp;<b>{alarm.tempoRecebido}m {alarm.segRecebido !== null ? alarm.segRecebido : null}s</b>
            , {formatTime(alarm.dtRecebido)}
          </span>
        ) : null}
      </div>
      <div className='p-medium'>
        {alarm.dtDeslocamento !== null ? (
          <span>
            • Deslocamento: 
            &nbsp;<b>{alarm.tempoDeslocamento}m {alarm.segDeslocamento !== null ? alarm.segDeslocamento : null}s</b>
            , {formatTime(alarm.dtDeslocamento)}
          </span>
        ) : null}
      </div>
      <div className='p-medium'>
        {alarm.dtLocal !== null ? (
          <span>
            • No Local: 
            &nbsp;<b>{alarm.tempoLocal}m {alarm.segLocal !== null ? alarm.segLocal : null}s</b>
            , {formatTime(alarm.dtLocal)}
          </span>
        ) : null}
      </div>
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
      <div className='p-medium'>
        {alarm.dtRecebido !== null ? (
          <span>
            • Recebido:
            &nbsp;<b>{alarm.tempoRecebido}m {alarm.segRecebido !== null ? alarm.segRecebido : null}s</b>
            , {formatTime(alarm.dtRecebido)}
          </span>
        ) : null}
      </div>
      <div className='p-medium'>
        {alarm.dtDeslocamento !== null ? (
          <span>
            • Deslocamento: 
            &nbsp;<b>{alarm.tempoDeslocamento}m {alarm.segDeslocamento !== null ? alarm.segDeslocamento : null}s</b>
            , {formatTime(alarm.dtDeslocamento)}
          </span>
        ) : null}
      </div>
      <div className='p-medium'>
        {alarm.dtLocal !== null ? (
          <span>
            • No Local:
            &nbsp;<b>{alarm.tempoLocal}m {alarm.segLocal !== null ? alarm.segLocal : null}s</b>
            , {formatTime(alarm.dtLocal)}
          </span>
        ) : null}
      </div>
      {distances.map((distance, index) => (
        distance && (
          <div className='p-medium alarm' key={index}>
            {distance.nomeTatico}: {`${distance.distance}, ${distance.duration}.`}
          </div>
        )
      ))}
    </div>
  );
};

// Design da dialog de informações de Moto
const InfoWindowContentMoto = ({ moto }) => (
  <div style={{ backgroundColor: '#fff', color: '#000', padding: '5px', borderRadius: '5px' }}>
    <p className='p-big'>
      • Placa: <b>{moto.id}</b>
    </p>
    <p className='p-medium'>
      • Tempo parado: <b>{moto.idleTime < 86400000 ? formatTime(moto.idleTime) : `+${Math.floor(moto.idleTime / (24 * 60 * 60 * 1000))}d`}</b>
    </p>
    {moto.nomeTatico ? (
        <p className='p-medium'>• Tático: <b>{moto.nomeTatico}</b></p>
      ) : null}
  </div>
);

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

  if ((!alarm.tempoRecebido || alarm.tempoRecebido < 8 ) && alarm.dtDeslocamento === null && alarm.dtLocal === null) {
    iconPath += 'yellow';
  } else if (alarm.tempoRecebido > 59 && alarm.dtDeslocamento === null && alarm.dtLocal === null) {
    iconPath += 'pink';
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
const getMarkerIconMoto = (moto, unfOrders, tecnicos, type, initialMapCenter) => {
  const color = checkMotosTracker(moto, unfOrders, tecnicos, type, initialMapCenter);
  let iconPath = `/icon/motorcycling`;

  if (color) {
    iconPath += `-${color}`
  } else {
    iconPath += '-green'
  }

  iconPath += '.png';
  return iconPath;
};

const checkMotosTracker = (moto, unfOrders, tecnicos, type, initialMapCenter) => {
  const idleLimit = 5 * 60 * 1000;
  const parkLimit = 240 * 60 * 1000;
  const distanceLimitInMeters = 100;
  
  if (moto.nomeTatico) {
    return 'yellow';
  }
  if ((!unfOrders) || (!tecnicos || tecnicos.length === 0)) {
    return 'green';
  }

  if (moto.idleTime > idleLimit) {
    if (haversineDistance(moto.lat, moto.lng, initialMapCenter.lat, initialMapCenter.lng) < distanceLimitInMeters) {
      return 'gray';
    } else {
      for (let index = 0; index < unfOrders.length; index++) {
        const order = unfOrders[index];
        if (tecnicos.some(tecnico => tecnico.id === order.idTec)) {
          if (haversineDistance(moto.lat, moto.lng, order.lat, order.lng) < distanceLimitInMeters) {
            return 'green';
          }
        }
      }
    }
    
    if (moto.idleTime > parkLimit){
      return 'gray';
    } else {
      return 'softred';
    }
  }
  return 'green';
}

export {
  renderMarkerPin,
  renderMarkerMoto,
  renderHighlightedDialog,
  renderSelectedDialog
};