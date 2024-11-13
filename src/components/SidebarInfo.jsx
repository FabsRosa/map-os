import "react-datepicker/dist/react-datepicker.css";

import "../styles/SidebarInfo.css";

const renderSidebarInfo = (isSidebarInfoOpen, toggleSidebarInfo, infos, type, orders, alarms, motos, filters, setFilters) => {
  return (
    <SidebarInfo
      isOpen={isSidebarInfoOpen}
      onClose={toggleSidebarInfo}
      infos={infos}
      type={type}
      orders={orders}
      alarms={alarms}
      motos={motos}
      filters={filters}
      setFilters={setFilters}
    />
  )
}

// Design da sidebarInfo
const SidebarInfo = ({ isOpen, onClose, infos, type, orders, alarms, motos, filters, setFilters }) => {
  return (
    <div className={`sidebarInfo ${isOpen ? 'open' : ''}`}>
      <div className="info-icon" onClick={onClose}>
        <img src="/icon/info.svg" alt="Info" />
      </div>
      <div className="sidebarInfo-items">
        {infos.map((info, index) => (
          <div
            key={index}
            className="sidebarInfo-item"
            onClick={() => handleItemInfoClick(info, filters, setFilters)}
          >
            <span className="sidebarInfo-label">{info.label}: </span>
            <span className="sidebarInfo-value">{info.value}</span>
          </div>
        ))}
      </div>
      <div className="sidebarInfo-popup">
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
      </div>
    </div>
  );
};

const isInfoSelectd = (info, filters, setFilters) => {

  if (info.label ==="OS Cliente") {
    return filters.tipoOS.includes('Cliente');
  } else if (info.label ==="OS Alarme") {

  } else if (info.label ==="Retorno") {

  } else if (info.label ==="Falha de Comunicação") {

  } else if (info.label ==="Arromabamento") {

  } else if (info.label ==="Solic. Imagem") {

  } else if (info.label ==="Sem Acesso") {

  } else if (info.label ==="Instalação") {

  } else if (info.label ==="Pausadas") {

  }
}

const handleItemInfoClick = (info, filters, setFilters) => {

  if (info.label ==="OS Cliente") {

  } else if (info.label ==="OS Alarme") {

  } else if (info.label ==="Retorno") {

  } else if (info.label ==="Falha de Comunicação") {

  } else if (info.label ==="Arromabamento") {

  } else if (info.label ==="Solic. Imagem") {

  } else if (info.label ==="Sem Acesso") {

  } else if (info.label ==="Instalação") {

  } else if (info.label ==="Pausadas") {

  }
}

export default renderSidebarInfo;