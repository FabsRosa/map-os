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

export {
  InfoWindowContentOrder,
  InfoWindowContentMoto
};