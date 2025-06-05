import React, { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';
import { InfoWindow, Marker } from '@react-google-maps/api';
import DatePicker from "react-datepicker";
import { ptBR } from 'date-fns/locale';
import "react-datepicker/dist/react-datepicker.css";

import haversineDistance from '../utils/haversineDistance';
import { filterMotos } from '../utils/filterMarker';
import { filterMotosAlarm } from '../utils/filterAlarm';
import { formatTime, formatDate, toISOStringWithLocalTimezone } from '../utils/handleTime';

const iconSizePinOrder = 31;
const iconSizePinAlarm = 32;
const iconSizeMoto = 29;
const iconSizeCar = 27;
const iconSizePickup = 35;
const iconSizeTruck = 33;

const renderMarkerPin = (orders, alarms, tecnicos, type, highlightedOrder, highlightedAlarm, handleMarkerClickOrder, handleMouseOutOrder, handleMouseOverOrder, handleMarkerClickAlarm, handleMouseOutAlarm, handleMouseOverAlarm) => {
  if (type === 'OS') {
    return orders.map(order => (
      <Marker
        key={order.id}
        position={{
          lat: order.lat,
          lng: order.lng
        }}
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
          position={{
            lat: alarm.lat,
            lng: alarm.lng
          }}
          icon={{
            url: getMarkerIconAlarm((highlightedAlarm ? highlightedAlarm.clientID === alarm.clientID : false), alarm),
            scaledSize: new window.google.maps.Size(iconSizePinAlarm, iconSizePinAlarm)
          }}
          onClick={handleMarkerClickAlarm(alarm)}
          onMouseOut={handleMouseOutAlarm}
          onMouseOver={handleMouseOverAlarm(alarm)}
        />
      )
    })
  }
}

const renderMarkerMoto = (motos, unfOrders, tecnicos, type, filters, filtersAlarm, initialMapCenter, handleMarkerClickMoto, handleMouseOutMoto, handleMouseOverMoto) => {
  if (!motos || motos.length === 0) return null;

  if (filterMotos((filters)) || type != 'OS') {
    return motos.map(moto => {
      if (filterMotosAlarm(filtersAlarm, moto)) {
        let iconSize;
        switch (moto.type) {
          case 1:
            iconSize = iconSizeMoto;
            break;
          case 2:
            iconSize = iconSizeCar;
            break;
          case 3:
            iconSize = iconSizeTruck;
            break;
          case 4:
            iconSize = iconSizePickup;
            break;
          default:
            iconSize = iconSizeMoto;
        }
        return (
          <Marker
            key={moto.id}
            position={{
              lat: moto.lat,
              lng: moto.lng
            }}
            icon={{
              url: getMarkerIconMoto(moto, unfOrders, tecnicos, initialMapCenter, type),
              scaledSize: new window.google.maps.Size(iconSize, iconSize)
            }}
            onClick={handleMarkerClickMoto(moto)}
            onMouseOut={handleMouseOutMoto}
            onMouseOver={handleMouseOverMoto(moto)}
            zIndex={google.maps.Marker.MAX_ZINDEX}
          />
        )
      } else {
        return null;
      }
    })
  } else {
    return null;
  }
}

const renderHighlightedDialog = (highlightedOrder, editingOrder, setEditingOrder, setHighlightedOrder, highlightedAlarm, highlightedMoto, onTecChange, onDefChange, onScheduleChange, schedulingOrder, setSchedulingOrder, schedulingDate, setSchedulingDate, tecnicos, defeitos, motos, filters, handleMapClick, unfOrders, initialMapCenter, type
) => {
  hideCloseButton();

  if (highlightedOrder) {
    return (
      <InfoWindow
        position={{
          lat: highlightedOrder.lat,
          lng: highlightedOrder.lng
        }}
        options={{
          pixelOffset: new window.google.maps.Size(0, -40),
          disableAutoPan: true,
          minWidth: 320
        }}
        onCloseClick={() => { hideCloseButton(); handleMapClick(); }}
      >
        <InfoWindowContentOrder
          key={highlightedOrder.id + highlightedOrder.nomeTec + highlightedOrder.dataAg} // Unique key to force re-render
          order={highlightedOrder}
          isEditing={editingOrder === highlightedOrder.id}
          onEditClick={() => { setEditingOrder(highlightedOrder.id); setHighlightedOrder(null); }}
          onTecChange={onTecChange}
          onDefChange={onDefChange}
          onScheduleChange={onScheduleChange}
          schedulingOrder={schedulingOrder}
          setSchedulingOrder={setSchedulingOrder}
          schedulingDate={schedulingDate}
          setSchedulingDate={setSchedulingDate}
          tecnicos={tecnicos}
          defeitos={defeitos}
          filters={filters}
        />
      </InfoWindow>
    )
  } else if (highlightedAlarm) {
    return (
      <InfoWindow
        position={{
          lat: highlightedAlarm.lat,
          lng: highlightedAlarm.lng
        }}
        options={{
          pixelOffset: new window.google.maps.Size(0, -40),
          disableAutoPan: true,
          minWidth: 320
        }}
        onCloseClick={() => { hideCloseButton(); handleMapClick(); }}
      >
        <InfoWindowContentAlarm
          alarm={highlightedAlarm}
          motos={motos}
        />
      </InfoWindow>
    )
  } else if (highlightedMoto) {
    return (
      <InfoWindow
        position={{
          lat: highlightedMoto.lat,
          lng: highlightedMoto.lng
        }}
        options={{
          pixelOffset: new window.google.maps.Size(0, -40),
          disableAutoPan: true,
          minWidth: 260
        }}
        onCloseClick={() => { hideCloseButton(); handleMapClick(); }}
      >
        <InfoWindowContentMoto
          moto={highlightedMoto}
          unfOrders={unfOrders}
          tecnicos={tecnicos}
          initialMapCenter={initialMapCenter}
          type={type}
        />
      </InfoWindow>
    )
  }
}
const renderSelectedDialog = (selectedOrder, editingOrder, setEditingOrder, setHighlightedOrder, selectedAlarm, selectedMoto, onTecChange, onDefChange, onScheduleChange, schedulingOrder, setSchedulingOrder, schedulingDate, setSchedulingDate, tecnicos, defeitos, motos, filters, handleMapClick, unfOrders, initialMapCenter, type) => {
  hideCloseButton();

  if (selectedOrder) {
    return (
      <InfoWindow
        position={{
          lat: selectedOrder.lat,
          lng: selectedOrder.lng
        }}
        options={{
          pixelOffset: new window.google.maps.Size(0, -40),
          disableAutoPan: true,
          minWidth: 320
        }}
        onCloseClick={() => { hideCloseButton(); handleMapClick(); }}
      >
        <InfoWindowContentOrder
          key={selectedOrder.id + selectedOrder.nomeTec + selectedOrder.dataAg} // Unique key to force re-render
          order={selectedOrder}
          isEditing={editingOrder === selectedOrder.id}
          onEditClick={() => { setEditingOrder(selectedOrder.id); setHighlightedOrder(null); }}
          onTecChange={onTecChange}
          onDefChange={onDefChange}
          onScheduleChange={onScheduleChange}
          schedulingOrder={schedulingOrder}
          setSchedulingOrder={setSchedulingOrder}
          schedulingDate={schedulingDate}
          setSchedulingDate={setSchedulingDate}
          tecnicos={tecnicos}
          defeitos={defeitos}
          filters={filters}
        />
      </InfoWindow>
    )
  } else if (selectedAlarm) {
    return (
      <InfoWindow
        position={{
          lat: selectedAlarm.lat,
          lng: selectedAlarm.lng
        }}
        options={{
          pixelOffset: new window.google.maps.Size(0, -40),
          disableAutoPan: true,
          minWidth: 320
        }}
        onCloseClick={() => { hideCloseButton(); handleMapClick(); }}
      >
        <InfoWindowContentAlarm
          alarm={selectedAlarm}
          motos={motos}
        />
      </InfoWindow>
    )
  } else if (selectedMoto) {
    return (
      <InfoWindow
        position={{
          lat: selectedMoto.lat,
          lng: selectedMoto.lng
        }}
        options={{
          pixelOffset: new window.google.maps.Size(0, -40),
          disableAutoPan: true,
          minWidth: 250
        }}
        onCloseClick={() => { hideCloseButton(); handleMapClick(); }}
      >
        <InfoWindowContentMoto
          moto={selectedMoto}
          unfOrders={unfOrders}
          tecnicos={tecnicos}
          initialMapCenter={initialMapCenter}
          type={type}
        />
      </InfoWindow>
    )
  }
}

// Design da dialog de informações de OS
const InfoWindowContentOrder = ({ order, isEditing, onEditClick, onTecChange, onDefChange, onScheduleChange, schedulingOrder, setSchedulingOrder, schedulingDate, setSchedulingDate, tecnicos, defeitos, filters }) => {
  const isTecInList = tecnicos ? tecnicos.some(tec => tec.id == order.idTec) : false;

  if (schedulingOrder) {
    showCloseButton();

    return (
      <div className='schedulingBox'>
        <DatePicker
          id="schedulingDate"
          selected={schedulingDate}
          onChange={(newDate) => setSchedulingDate(newDate)}
          isClearable
          placeholderText="Data Agendada"
          className='custom-date filter'
          dateFormat="dd/MM/yyyy"
          locale={ptBR}
          open={true}
        />
        <button
          className='schedulingButton'
          onClick={() => onScheduleChange(order.id, toISOStringWithLocalTimezone(schedulingDate))}
        >
          Ok
        </button>
        <button
          className='schedulingBackButton'
          onClick={() => setSchedulingOrder(null)}
        >
          Voltar
        </button>
      </div>
    )
  } else {
    return (
      <div style={{ backgroundColor: '#fff', color: '#000', padding: '5px', borderRadius: '5px' }}>
        <span className='p-big' >
          • Cliente: {order.clientID} ·&nbsp;<b>{capitalizeWords(order.clientName)}&nbsp;</b>
          <img
            src='/icon/link.png'
            alt='Edit'
            style={{ marginLeft: '5px', width: '16px', height: '16px', cursor: 'pointer' }}
            onClick={() => window.open(`https://www.google.com/maps?q=${order.lat},${order.lng}&z=13&t=m`, '_blank')}
          />
        </span>
        {(filters && filters.cliente) ? (
          <p className='p-medium'>• Razão Social: {capitalizeWords(order.clientRazao)}</p>
        ) : null}
        <p className='p-medium'>
          • Técnico:&nbsp;
          {isEditing ? (
            <select className='custom-select' value={isTecInList ? order.idTec : ''} onChange={(e) => onTecChange(e.target.value)}>
              <option value='' disabled>TERCEIRIZADO</option>
              {tecnicos.map(tec => (
                <option key={tec.id} value={tec.id}>
                  {formatName(tec.nome)}
                </option>
              ))}
            </select>
          ) : (
            <span>
              <b onClick={onEditClick} style={{ cursor: 'pointer' }}>{formatName(order.nomeTec)}</b>
              <img
                src='/icon/down-arrow.png'
                alt='Edit'
                style={{ marginLeft: '5px', width: '16px', height: '16px', cursor: 'pointer' }}
                onClick={onEditClick}
              />
            </span>
          )}
        </p>
        <p className='p-medium'>
          • Defeito:&nbsp;
          {isEditing ? (
            <select className='custom-select' value={order.idDef} onChange={(e) => onDefChange(e.target.value)}>
              {defeitos.map(def => (
                <option key={def.idDefeito} value={def.idDefeito}>
                  {capitalizeWords(def.descDefeito)}
                </option>
              ))}
            </select>
          ) : (
            <span>
              <b onClick={onEditClick} style={{ cursor: 'pointer' }}>{capitalizeWords(order.def)}</b>
              <img
                src='/icon/down-arrow.png'
                alt='Edit'
                style={{ marginLeft: '5px', width: '16px', height: '16px', cursor: 'pointer' }}
                onClick={onEditClick}
              />
            </span>
          )}
        </p>
        {order.dataAb ? (
          <div>
            <p className='p-medium'>
              • Data Abertura: <b>{formatDate(order.dataAb)}</b>, {formatTime(order.dataAb)}
              {!order.dataAg && (
                <img
                  src='/icon/clock.png'
                  alt='Edit'
                  style={{ marginLeft: '5px', width: '18px', height: '18px', cursor: 'pointer' }}
                  onClick={() => { setSchedulingOrder(order.id); setSchedulingDate(order.dataAg); }}
                />
              )}
            </p>
          </div>
        ) : null}
        {order.dataAg ? (
          <div>
            <p className='p-medium'>
              • Data Agendada: <b>{formatDate(order.dataAg)}</b>, {formatTime(order.dataAg)}
              <img
                src='/icon/clock.png'
                alt='Edit'
                style={{ marginLeft: '5px', width: '18px', height: '18px', cursor: 'pointer' }}
                onClick={() => { setSchedulingOrder(order.id); setSchedulingDate(order.dataAg); }}
              />
            </p>
          </div>
        ) : null}
        <p className='p-medium'>• OS: {order.id}</p>
        <p
          className='p-small'
          dangerouslySetInnerHTML={{ __html: removeBLEnd(`• ${DOMPurify.sanitize(order.desc.replace(/\n/g, '<br />'))}`) }}
        ></p>
      </div>
    );
  }
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
              const result = haversineDistance(locationMoto.lat, locationMoto.lng, locationAlarm.lat, locationAlarm.lng);
              return result ? { distance: result, nomeTatico: moto.nomeTatico } : null;
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

    const hasTactician = motos.some(moto => moto.nomeTatico != null);

    return (
      <div style={{ backgroundColor: '#fff', color: '#000', padding: '5px', borderRadius: '5px' }}>
        <div className='p-big'><b>{retTypeAlarmText(alarm)}</b></div>
        <span className='p-big alarm'>
          • Cliente: {alarm.clientID} · <b>{capitalizeWords(alarm.clientName)}&nbsp;</b>
          <img
            src='/icon/link.png'
            alt='Edit'
            style={{ marginLeft: '5px', width: '16px', height: '16px', cursor: 'pointer' }}
            onClick={() => window.open(`https://www.google.com/maps?q=${alarm.lat},${alarm.lng}&z=13&t=m`, '_blank')}
          />
        </span>
        <div className='p-medium'>• Razão Social: {capitalizeWords(alarm.clientRazao)}</div>
        <div className='p-medium'>• Evento: <b>{alarm.codEvento}</b> · {alarm.tipoEvento}</div>
        <div className='p-medium'>
          {alarm.dtRecebido !== null ? (
            <span>
              Recebido:
              &nbsp;{alarm.tempoRecebido}m {alarm.segRecebido !== null ? alarm.segRecebido : null}s
              , <b>{formatTime(alarm.dtRecebido)}</b>
            </span>
          ) : null}
        </div>
        <div className='p-medium'>
          {alarm.dtDeslocamento !== null ? (
            <span>
              Deslocamento:
              &nbsp;{alarm.tempoDeslocamento}m {alarm.segDeslocamento !== null ? alarm.segDeslocamento : null}s
              , <b>{formatTime(alarm.dtDeslocamento)}</b>
            </span>
          ) : null}
        </div>
        <div className='p-medium'>
          {alarm.dtLocal !== null ? (
            <span>
              No Local:
              &nbsp;{alarm.tempoLocal}m {alarm.segLocal !== null ? alarm.segLocal : null}s
              , <b>{formatTime(alarm.dtLocal)}</b>
            </span>
          ) : null}
        </div>
        {hasTactician ? (
          <div className='p-medium'>Calculando distâncias...</div>
        ) : null}
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#fff', color: '#000', padding: '5px', borderRadius: '5px' }}>
      <div className='p-big'><b>{retTypeAlarmText(alarm)}</b></div>
      <span className='p-big alarm'>
        • Cliente: {alarm.clientID} · <b>{capitalizeWords(alarm.clientName)}&nbsp;</b>
        <img
          src='/icon/link.png'
          alt='Edit'
          style={{ marginLeft: '5px', width: '16px', height: '16px', cursor: 'pointer' }}
          onClick={() => window.open(`https://www.google.com/maps?q=${alarm.lat},${alarm.lng}&z=13&t=m`, '_blank')}
        />
      </span>
      <div className='p-medium'>• Razão Social: {capitalizeWords(alarm.clientRazao)}</div>
      <div className='p-medium'>• Evento: <b>{alarm.codEvento}</b> · {alarm.tipoEvento}</div>
      <div className='p-medium'>
        {alarm.dtRecebido !== null ? (
          <span>
            Recebido:
            &nbsp;{alarm.tempoRecebido}m {alarm.segRecebido !== null ? alarm.segRecebido : null}s
            , <b>{formatTime(alarm.dtRecebido)}</b>
          </span>
        ) : null}
      </div>
      <div className='p-medium'>
        {alarm.dtDeslocamento !== null ? (
          <span>
            Deslocamento:
            &nbsp;{alarm.tempoDeslocamento}m {alarm.segDeslocamento !== null ? alarm.segDeslocamento : null}s
            , <b>{formatTime(alarm.dtDeslocamento)}</b>
          </span>
        ) : null}
      </div>
      <div className='p-medium'>
        {alarm.dtLocal !== null ? (
          <span>
            No Local:
            &nbsp;{alarm.tempoLocal}m {alarm.segLocal !== null ? alarm.segLocal : null}s
            , <b>{formatTime(alarm.dtLocal)}</b>
          </span>
        ) : null}
      </div>
      {distances.map((distance, index) => (
        distance && (
          <div className='p-medium alarm' key={index}>
            {formatName(distance.nomeTatico)}: {`${distance.distance < 1000 ? `${distance.distance.toFixed(2)}m` : `${(distance.distance / 1000).toFixed(2)}km`}.`}
          </div>
        )
      ))}
    </div>
  );
};

const retTypeAlarmText = (alarm) => {
  let typeAlarm = '';

  if (alarm.codEvento == 'E130') { // Alarme, verde
    typeAlarm = 'Alarme';
  } else if (alarm.codEvento == 'E120' || alarm.codEvento == 'E121' || alarm.codEvento == 'E122') { // Pânico, roxo
    typeAlarm = 'Pânico';
  } else if (alarm.codEvento == 'E131'
    || alarm.codEvento == 'E133'
    || alarm.codEvento == 'E250'
    || alarm.codEvento == 'E301'
    || alarm.codEvento == 'E333') {
    typeAlarm = 'Falha de comunicação';
  }

  if (alarm.dtObservacao != null) {
    typeAlarm += ' · Em observação';
  }

  return typeAlarm;
}

// Design da dialog de informações de Moto
const InfoWindowContentMoto = ({ moto, unfOrders, tecnicos, initialMapCenter, type }) => {
  const motoColor = checkMotosTracker(moto, unfOrders, tecnicos, initialMapCenter, type);

  // Map moto type to human-readable string
  const getTypeName = (type) => {
    switch (type) {
      case 1:
        return 'Moto';
      case 2:
        return 'Carro';
      case 3:
        return 'Caminhão';
      case 4:
        return 'Caminhonete';
      default:
        return type;
    }
  };

  return (
    <div style={{ backgroundColor: '#fff', color: '#000', padding: '5px', borderRadius: '5px' }}>
      <p className='p-big'>
        <span className='p-big'>
          <b>{getMotoStatus(motoColor)}&nbsp;</b>
          <img
            src='/icon/link.png'
            alt='Edit'
            style={{ marginLeft: '5px', width: '16px', height: '16px', cursor: 'pointer' }}
            onClick={() => window.open(`https://www.google.com/maps?q=${moto.lat},${moto.lng}&z=13&t=m`, '_blank')}
          />
        </span>
      </p>
      <p className='p-medium'>
        &nbsp;&nbsp;{getTypeName(moto.type)}
      </p>
      <p className='p-big'>
        • Placa: <b>{moto.id}</b>
      </p>
      <p className='p-medium'>
        • Tempo parado: <b>{moto.idleTime < 86400000 ? formatTime(moto.idleTime) : `+${Math.floor(moto.idleTime / (24 * 60 * 60 * 1000))} dias`}</b>
      </p>
      {moto.nomeTatico ? (
        <p className='p-medium'>• Tático: <b>{formatName(moto.nomeTatico)}</b></p>
      ) : null}
    </div>
  )
};

const getMotoStatus = (motoColor) => {
  let status = '';

  if (motoColor === 'green') {
    status = 'Em deslocamento';
  } else if (motoColor === 'gray') {
    status = 'Estacionado';
  } else if (motoColor === 'blue') {
    status = 'Em atendimento';
  } else if (motoColor === 'red') {
    status = 'Parado';
  } else if (motoColor === 'yellow') {
    status = 'Tático';
  }

  return status;
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

  /* if (alarm.dtObservacao != null) {
    iconPath += 'yellow';
  } else */ if (alarm.codEvento == 'E130') { // Alarme
    iconPath += 'green';
  } else if (alarm.codEvento == 'E120' || alarm.codEvento == 'E121' || alarm.codEvento == 'E122') { // Pânico
    iconPath += 'purple';
  } else if (alarm.codEvento == 'E130' // Falha
    || alarm.codEvento == 'E131'
    || alarm.codEvento == 'E133'
    || alarm.codEvento == 'E250'
    || alarm.codEvento == 'E301'
    || alarm.codEvento == 'E333') {
    iconPath += 'red';
  } else {
    iconPath += 'yellow';
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
const getMarkerIconMoto = (moto, unfOrders, tecnicos, initialMapCenter, type) => {
  const color = checkMotosTracker(moto, unfOrders, tecnicos, initialMapCenter, type);

  let iconPath;
  if (moto && moto.type) {
    if (moto.type == 1) {
      iconPath = `/icon/moto`;
    } else if (moto.type == 2) {
      iconPath = `/icon/car`;
    } else if (moto.type == 3) {
      iconPath = `/icon/truck`;
    } else if (moto.type == 4) {
      iconPath = `/icon/pickup`;
    } else {
      iconPath = `/icon/moto`;
    }
  } else {
    iconPath = `/icon/moto`;
  }

  if (color) {
    iconPath += `-${color}`
  } else {
    iconPath += '-green'
  }

  iconPath += '.png';
  return iconPath;
};

const checkMotosTracker = (moto, unfOrders, tecnicos, initialMapCenter, type) => {
  const idleLimit = 5 * 60 * 1000;
  const parkLimit = 300 * 60 * 1000;
  const distanceLimitInMeters = 100;

  if (moto.nomeTatico) {
    return 'yellow';
  }

  if (moto.idleTime > parkLimit) {
    return 'gray';
  }

  if (moto.idleTime > idleLimit) {
    if (haversineDistance(moto.lat, moto.lng, initialMapCenter.lat, initialMapCenter.lng) < distanceLimitInMeters) {
      return 'gray';
    } else if (type === 'OS') {
      for (let index = 0; index < unfOrders.length; index++) {
        const order = unfOrders[index];
        if (order.idTec !== tecnicos[0].id && tecnicos.some(tecnico => tecnico.id === order.idTec)) {
          if (haversineDistance(moto.lat, moto.lng, order.lat, order.lng) < distanceLimitInMeters) {
            return 'blue';
          }
        }
      }
      return 'red';
    }
  }
  return 'green';
}

// Function to add the CSS rule to hide the close button
const hideCloseButton = () => {
  let style = document.getElementById('hide-close-button-style');

  // Check if the style element already exists to avoid duplicates
  if (!style) {
    style = document.createElement('style');
    style.id = 'hide-close-button-style';
    style.innerHTML = `.gm-style-iw button { display: none !important; }`;
    document.head.appendChild(style);
  }
};

// Function to remove the CSS rule to show the close button again
const showCloseButton = () => {
  const style = document.getElementById('hide-close-button-style');
  if (style) {
    style.parentNode.removeChild(style);  // Ensure removal
  }
};

const removeBLEnd = (string) => {
  if (typeof string !== 'string') {
    return '';
  }
  while (string.endsWith("&nbsp;") || string.endsWith("<br>")) {
    if (string.endsWith("&nbsp;")) {
      string = string.slice(0, -6); // Remove the last 6 characters
    } else if (string.endsWith("<br>")) {
      string = string.slice(0, -4); // Remove the last 4 characters

    }
  }
  return string;
}

const formatName = (fullName) => {
  if (!fullName) return '';
  if (fullName == 'INVIOLAVEL') return 'Inviolável';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return '';
  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  const lowerCaseWords = ['do', 'da', 'dos', 'das', 'de'];
  if (parts.length === 1) {
    return capitalize(parts[0]);
  }
  if (parts.length >= 3 && lowerCaseWords.includes(parts[1].toLowerCase())) {
    return `${capitalize(parts[0])} ${parts[1].toLowerCase()} ${capitalize(parts[2])}`;
  }
  // Default: first and second name, both capitalized
  return `${capitalize(parts[0])} ${capitalize(parts[1])}`;
};

const capitalizeWords = (str) => {
  if (!str) return '';
  const exceptions = ['do', 'dos', 'da', 'das', 'de', 'no', 'nos', 'nas', 'na', 'e'];
  const upperCased = ['cftv', 'ltda'];
  const tiVariants = ['ti', 't.i', 't.i.'];
  return str
    .toLowerCase()
    .split(' ')
    .map((word, idx) => {
      // Handle CFTV
      const normalized = word.replace(/\./g, '');
      if (upperCased.includes(normalized)) {
        return normalized.toUpperCase();
      }
      // Handle TI
      if (tiVariants.includes(normalized)) {
        return word.replace(/t\.?i\.?/i, w => w.toUpperCase());
      }
      // Capitalize after / or .
      let result = '';
      let capitalizeNext = true;
      for (let i = 0; i < word.length; i++) {
        if (capitalizeNext && /[a-zA-Z]/.test(word[i])) {
          result += word[i].toUpperCase();
          capitalizeNext = false;
        } else {
          result += word[i];
        }
        if (word[i] === '/' || word[i] === '.') {
          capitalizeNext = true;
        }
      }
      // Handle exceptions (but not after / or .)
      if (exceptions.includes(word) && idx !== 0) {
        // Only lowercase if not after / or .
        const prevChar = idx > 0 ? str[str.indexOf(word) - 1] : '';
        if (prevChar !== '/' && prevChar !== '.') {
          return word;
        }
      }
      return result;
    })
    .join(' ');
};

export {
  renderMarkerPin,
  renderMarkerMoto,
  renderHighlightedDialog,
  renderSelectedDialog
};