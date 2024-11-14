import "react-datepicker/dist/react-datepicker.css";

import "../styles/SidebarInfo.css";

const renderSidebarInfo = (isSidebarInfoOpen, toggleSidebarInfo, infos, type, orders, alarms, motos, filters, setFilters, defeitos, onFilterChange, tecnicos) => {
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
      defeitos={defeitos}
      onFilterChange={onFilterChange}
      tecnicos={tecnicos}
    />
  )
}

// Design da sidebarInfo
const SidebarInfo = ({ isOpen, onClose, infos, type, orders, alarms, motos, filters, setFilters, defeitos, onFilterChange, tecnicos }) => {
  return (
    <div className={`sidebarInfo ${isOpen ? 'open' : ''}`}>
      <div className="info-icon" onClick={onClose}>
        <img src="/icon/info.svg" alt="Info" />
      </div>
      <div className="sidebarInfo-items">
        {infos.map((info, index) => {
          const selected = isInfoSelected(info, filters, defeitos);
          return (
            <div
              key={index}
              className={`sidebarInfo-item ${selected}`}
              onClick={() => handleItemInfoClick(info, filters, defeitos, orders, onFilterChange, tecnicos, selected)}
            >
              <span className={`sidebarInfo-label ${selected}`}>{info.label}: </span>
              <span className={`sidebarInfo-value ${selected}`}>{info.value}</span>
            </div>
          )
        })}
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

const isInfoSelected = (info, filters, defeitos) => {
  let isOSAlarme = false;
  if (
    info.label ==="OS Alarme"
    || info.label ==="Retorno"
    || info.label ==="Falha de Comunicação"
    || info.label ==="Arrombamento"
    || info.label ==="Solic. Imagem"
    || info.label ==="Sem Acesso Imagem"
  ) {
    const excludedDefects = [1, 7, 71, 87, 130, 133];
    const filteredDefects = defeitos
    .map(defeito => defeito.idDefeito)
    .filter(id => !excludedDefects.includes(id));

    if (filteredDefects.every(id => filters.defeito.includes(id))) {
      isOSAlarme = true
    }
  }

  if (info.label ==="OS Cliente") {
    if (filters.tipoOS.includes('Cliente')) {
      return 'selected';
    }
  } else if (info.label ==="OS Alarme") {
    if (isOSAlarme) {
      return 'selected';
    }
  } else if (info.label ==="Retorno") {
    if (filters.defeito.includes(132)) {
      if (isOSAlarme) {
        return 'included';
      } else {
        return 'selected';
      }
    }
  } else if (info.label ==="Falha de Comunicação") {
    if (filters.defeito.includes(12)) {
      if (isOSAlarme) {
        return 'included';
      } else {
        return 'selected';
      }
    }
  } else if (info.label ==="Arrombamento") {
    if (filters.defeito.includes(27)) {
      if (isOSAlarme) {
        return 'included';
      } else {
        return 'selected';
      }
    }
  } else if (info.label ==="Solic. Imagem") {
    if (filters.defeito.includes(66)) {
      if (isOSAlarme) {
        return 'included';
      } else {
        return 'selected';
      }
    }
  } else if (info.label ==="Sem Acesso Imagem") {
    if (filters.defeito.includes(71)) {
      return 'selected';
    }
  } else if (info.label ==="Instalação") {
    if (filters.defeito.includes(1)) {
      return 'selected';
    }
  } else if (info.label ==="Pausadas") {
    if (filters.tipoOS.includes('Pausada')) {
      return 'selected';
    }
  } else if (info.label ==="Agendadas p/ Hoje") {
    if (filters.tipoOS.includes('Agendada Hoje')) {
      return 'selected';
    }
  }

  return '';
}

const handleItemInfoClick = (info, filters, defeitos, orders, onFilterChange, tecnicos, selected) => {
  if (info.label ==="OS Cliente") {
    if (selected == ''){
      onFilterChange(
        orders,
        { ...filters, tipoOS: [...filters.tipoOS, 'Cliente'] },
        tecnicos
      );
    } else {
      onFilterChange(
        orders,
        { ...filters, tipoOS: filters.tipoOS.filter(item => item !== 'Cliente') },
        tecnicos
      );
    }
  } else if (info.label ==="OS Alarme") {
    if (selected == ''){
      const excludedDefects = [1, 7, 71, 87, 130, 133];
      
      onFilterChange(
        orders,
        { 
          ...filters,
          defeito: defeitos
            .map(defeito => defeito.idDefeito)
            .filter(id => !excludedDefects.includes(id))
        },
        tecnicos
      );
    } else {
      onFilterChange(
        orders,
        { ...filters, defeito: [] },
        tecnicos
      );
    }
  } else if (info.label ==="Retorno") {
    if (selected == ''){
      onFilterChange(
        orders,
        { ...filters, defeito: [...filters.defeito, 132] },
        tecnicos
      );
    } else {
      onFilterChange(
        orders,
        { ...filters, defeito: filters.defeito.filter(item => item !== 132) },
        tecnicos
      );
    }
  } else if (info.label ==="Falha de Comunicação") {
    if (selected == ''){
      onFilterChange(
        orders,
        { ...filters, defeito: [...filters.defeito, 12] },
        tecnicos
      );
    } else {
      onFilterChange(
        orders,
        { ...filters, defeito: filters.defeito.filter(item => item !== 12) },
        tecnicos
      );
    }
  } else if (info.label ==="Arrombamento") {
    if (selected == ''){
      onFilterChange(
        orders,
        { ...filters, defeito: [...filters.defeito, 27] },
        tecnicos
      );
    } else {
      onFilterChange(
        orders,
        { ...filters, defeito: filters.defeito.filter(item => item !== 27) },
        tecnicos
      );
    }
  } else if (info.label ==="Solic. Imagem") {
    if (selected == ''){
      onFilterChange(
        orders,
        { ...filters, defeito: [...filters.defeito, 66] },
        tecnicos
      );
    } else {
      onFilterChange(
        orders,
        { ...filters, defeito: filters.defeito.filter(item => item !== 66) },
        tecnicos
      );
    }
  } else if (info.label ==="Sem Acesso Imagem") {
    if (selected == ''){
      onFilterChange(
        orders,
        { ...filters, defeito: [...filters.defeito, 71] },
        tecnicos
      );
    } else {
      onFilterChange(
        orders,
        { ...filters, defeito: filters.defeito.filter(item => item !== 71) },
        tecnicos
      );
    }
  } else if (info.label ==="Instalação") {
    if (selected == ''){
      onFilterChange(
        orders,
        { ...filters, defeito: [...filters.defeito, 1] },
        tecnicos
      );
    } else {
      onFilterChange(
        orders,
        { ...filters, defeito: filters.defeito.filter(item => item !== 1) },
        tecnicos
      );
    }
  } else if (info.label ==="Pausadas") {
    if (selected == ''){
      onFilterChange(
        orders,
        { ...filters, tipoOS: [...filters.tipoOS, 'Pausada'] },
        tecnicos
      );
    } else {
      onFilterChange(
        orders,
        { ...filters, tipoOS: filters.tipoOS.filter(item => item !== 'Pausada') },
        tecnicos
      );
    }
  } else if (info.label ==="Agendadas p/ Hoje") {
    if (selected == ''){
      onFilterChange(
        orders,
        { ...filters, tipoOS: [...filters.tipoOS, 'Agendada Hoje'] },
        tecnicos
      );
    } else {
      onFilterChange(
        orders,
        { ...filters, tipoOS: filters.tipoOS.filter(item => item !== 'Agendada Hoje') },
        tecnicos
      );
    }
  }
}

export default renderSidebarInfo;