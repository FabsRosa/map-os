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
  const excludedDefectsOSAlarme = [1, 7, 71, 87, 130, 133, 138];
  return (
    <div className={`sidebarInfo ${isOpen ? 'open' : ''}`}>
      <div className="info-icon" onClick={onClose}>
        <img src="/icon/info.svg" alt="Info" />
      </div>
      <div className="sidebarInfo-items">
        {infos.map((info, index) => {
          const selected = isInfoSelected(info, filters, defeitos, excludedDefectsOSAlarme);
          return (
            <div
              key={index}
              className={`sidebarInfo-item ${selected}`}
              onClick={() => handleItemInfoClick(info, filters, defeitos, excludedDefectsOSAlarme, orders, onFilterChange, tecnicos, selected)}
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

const isInfoSelected = (info, filters, defeitos, excludedDefectsOSAlarme) => {
  let isOSAlarme = false;
  if (
    info.field ==="OS Alarme"
    || info.field ==="Retorno"
    || info.field ==="Falha de Comunicação"
    || info.field ==="Arrombamento"
    || info.field ==="Solic. Imagem"
    || info.field ==="Sem Acesso Imagem"
  ) {
    const filteredDefects = defeitos
    .map(defeito => defeito.idDefeito)
    .filter(id => !excludedDefectsOSAlarme.includes(id));

    if (filteredDefects.every(id => filters.defeito.includes(id))) {
      isOSAlarme = true
    }
  }

  if (info.field ==="OS Cliente") {
    if (filters.tipoOS.includes('Cliente')) {
      return 'selectedTipoOS';
    }
  } else if (info.field ==="OS Alarme") {
    if (isOSAlarme) {
      return 'selectedDef';
    }
  } else if (info.field ==="Retorno") {
    if (filters.defeito.includes(132)) {
      if (isOSAlarme) {
        return 'includedDef';
      } else {
        return 'selectedDef';
      }
    }
  } else if (info.field ==="Falha de Comunicação") {
    if (filters.defeito.includes(12)) {
      if (isOSAlarme) {
        return 'includedDef';
      } else {
        return 'selectedDef';
      }
    }
  } else if (info.field ==="Arrombamento") {
    if (filters.defeito.includes(27)) {
      if (isOSAlarme) {
        return 'includedDef';
      } else {
        return 'selectedDef';
      }
    }
  } else if (info.field ==="Solic. Imagem") {
    if (filters.defeito.includes(66)) {
      if (isOSAlarme) {
        return 'includedDef';
      } else {
        return 'selectedDef';
      }
    }
  } else if (info.field ==="Sem Acesso Imagem") {
    if (filters.defeito.includes(71)) {
      return 'selectedDef';
    }
  } else if (info.field ==="Instalação") {
    if (filters.defeito.includes(1)) {
      return 'selectedDef';
    }
  } else if (info.field ==="Pausadas") {
    if (filters.tipoOS.includes('Pausada')) {
      return 'selectedTipoOS';
    }
  } else if (info.field ==="Agendadas") {
    if (filters.tipoOS.includes('Agendada')) {
      return 'selectedTipoOS';
    }
  } else if (info.field ==="Agendadas para Hoje") {
    if (filters.tipoOS.includes('Agendada Hoje')) {
      return 'selectedTipoOS';
    }
  }

  return '';
}

const handleItemInfoClick = (info, filters, defeitos, excludedDefectsOSAlarme, orders, onFilterChange, tecnicos, selected) => {
  if (info.field ==="OS Cliente") {
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
  } else if (info.field ==="OS Alarme") {
    if (selected == ''){
      onFilterChange(
        orders,
        { 
          ...filters,
          defeito: defeitos
            .map(defeito => defeito.idDefeito)
            .filter(id => !excludedDefectsOSAlarme.includes(id))
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
  } else if (info.field ==="Retorno") {
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
  } else if (info.field ==="Falha de Comunicação") {
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
  } else if (info.field ==="Arrombamento") {
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
  } else if (info.field ==="Solic. Imagem") {
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
  } else if (info.field ==="Sem Acesso Imagem") {
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
  } else if (info.field ==="Instalação") {
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
  } else if (info.field ==="Pausadas") {
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
  } else if (info.field ==="Agendadas") {
    if (selected == ''){
      onFilterChange(
        orders,
        { ...filters, tipoOS: [...filters.tipoOS, 'Agendada'] },
        tecnicos
      );
    } else {
      onFilterChange(
        orders,
        { ...filters, tipoOS: filters.tipoOS.filter(item => item !== 'Agendada') },
        tecnicos
      );
    }
  } else if (info.field ==="Agendadas para Hoje") {
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