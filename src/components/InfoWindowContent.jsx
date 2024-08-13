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

export {
  InfoWindowContentOrder,
  InfoWindowContentMoto
};