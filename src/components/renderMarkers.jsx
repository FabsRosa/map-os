import { InfoWindow, Marker } from '@react-google-maps/api';

const renderMarkerOrder = (orders, alarms, tecnicos, type, highlightedOrder, handleMarkerClickOrder, handleMouseOutOrder, handleMouseOverOrder, handleMarkerClickAlarm, handleMouseOutAlarm, handleMouseOverAlarm) => {
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
    let count = 0;
    return alarms.map(alarm => {
      if (count > 7) {
        count = 0;
      }

      return (
      <Marker
        key={alarm.clientID}
        position={{ lat: alarm.lat, lng: alarm.lng }}
        icon={{ url: getMarkerIconAlarm(alarm.clientName, count++) }}
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
      icon={{ url: `/icon/motorcycling.png` }}
      onMouseOut={handleMotoMouseOut}
      onMouseOver={handleMotoMouseOver(moto)}
    />
  ))
}

const renderHighlightedDialog = (highlightedOrder, highlightedAlarm, highlightedMoto, orders, alarms, motos) => {
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
        <InfoWindowContentAlarm alarm={highlightedAlarm} />
      </InfoWindow>
    )
  }
}
const renderSelectedDialog = (selectedOrder, editingOrder, setEditingOrder, selectedAlarm, onTecChange, tecnicos) => {
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
    <InfoWindow
      position={{ lat: selectedAlarm.lat, lng: selectedAlarm.lng }}
      options={{ pixelOffset: new window.google.maps.Size(0, -40), disableAutoPan: true }}
    >
      <InfoWindowContentAlarm
        alarm={selectedAlarm}
      />
    </InfoWindow>
  }
}

// Design da dialog de informações de OS
const InfoWindowContentOrder = ({ order, isEditing, onEditClick, onTecChange, tecnicos }) => {
  const isTecInList = tecnicos ? tecnicos.some(tec => tec.id == order.idTec) : false;

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
const InfoWindowContentAlarm = ({ alarm }) => (
  <div style={{ backgroundColor: '#fff', color: '#000', padding: '5px', borderRadius: '5px' }}>
    <p className='p-big alarm'>
      • Cliente: {alarm.clientID} · <b>{alarm.clientName}</b>
    </p>
  </div>
);

// Design da dialog de informações de Moto
const InfoWindowContentMoto = ({ moto }) => (
  <div style={{ backgroundColor: '#fff', color: '#000', padding: '5px', borderRadius: '5px' }}>
    <p className='p-big moto'>
      • Placa: <b>{moto.id}</b>
    </p>
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
  const color = tec ? (tec.color ? tec.color : 'yellow' ) : 'yellow';
  const isTerceirizado = color == 'yellow';
  return `/pin/${color}${isHighlighted ? (
      `-dot`
    ) : (
      `${!isTerceirizado ? (
        nomeTec ? (
          `-${nomeTec.charAt(0).toLowerCase()}` // First letter of the name
        ) : (
          ``
        )
      ) : (
        `-t` // Terceirizado
      )}`
    )}.png`;
};

// Retorna endereço do ícone
const getMarkerIconAlarm = (nomeCliente, count) => {
  const pinColors = ['red', 'blue', 'green', 'lightblue', 'pink', 'purple', 'orange', 'yellow'];

  return `/pin/${pinColors[count]}${nomeCliente ? (
    `-${nomeCliente.charAt(0).toLowerCase()}` // First letter of the name
  ) : (
    ``
  )}.png`;
};

export {
  renderMarkerOrder,
  renderMarkerMoto,
  renderHighlightedDialog,
  renderSelectedDialog
};