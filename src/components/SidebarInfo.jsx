import "react-datepicker/dist/react-datepicker.css";

import "../styles/SidebarInfo.css";

const renderSidebarInfo = (isSidebarInfoOpen, toggleSidebarInfo, infos, type, onTypeChange, orders, alarms, motos) => {
  return (
    <SidebarInfo
      isOpen={isSidebarInfoOpen}
      onClose={toggleSidebarInfo}
      infos={infos}
      type={type}
      onTypeChange={onTypeChange}
      orders={orders}
      alarms={alarms}
      motos={motos}
    />
  )
}

// Design da sidebarInfo
const SidebarInfo = ({ isOpen, onClose, infos, type, onTypeChange, orders, alarms, motos }) => {
  return (
    <div className={`sidebarInfo ${isOpen ? 'open' : ''}`}>
      <div className="info-icon" onClick={onClose}>
        <img src="/icon/info.svg" alt="Info" />
      </div>
      <div className="sidebarInfo-items">
        {infos.map((info, index) => (
          <div key={index} className="sidebarInfo-item">
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

export default renderSidebarInfo;