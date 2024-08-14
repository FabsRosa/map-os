// Design da sidebar de filtro
const Sidebar = ({ isOpen, onClose, orders, filters, tecnicos, defeitos, onFilterChange }) => {
  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="filter-icon" onClick={onClose}>
        <img src={!isOpen ? "/icon/filter.svg" : "/icon/clear-filter.svg"} alt="Filter" />
      </div>
      <div className="filter-option n1">
        <label className="filter-label n1">Tipo de Ordem de Serviço</label>
        <br />
        <select
          className='custom-select filter'
          onChange={(e) => onFilterChange(orders, { ...filters, tipoOS: e.target.value }, tecnicos)}
        >
          <option value="">Sem filtro</option>
          <option value="OS-cliente">OS aberta por cliente</option>
        </select>
      </div>
      <div className="filter-option n2">
        <label className="filter-label n2">Defeito</label>
        <br />
        <select
          className='custom-select filter'
          onChange={(e) => onFilterChange(orders, { ...filters, defeito: e.target.value }, tecnicos)}
        >
          <option value="">Sem filtro</option>
          {
            defeitos.map(def => (
              <option key={def.defeito} value={def.defeito}>
                {def.defeito}
              </option>
            ))
          }
        </select>
      </div>
      <div className="filter-option n3">
        <label className="filter-label n3">Técnico</label>
        <br />
        <select
          className='custom-select filter'
          onChange={(e) => onFilterChange(orders, { ...filters, tecnico: e.target.value }, tecnicos)}
        >
        <option value="">Sem filtro</option>
        {
          tecnicos.map(tec => (
            <option key={tec.id} value={tec.id}>
              {tec.nome}
            </option>
          ))
        }
        <option value="TERCEIRIZADO">TERCEIRIZADO</option>
        </select>
      </div>
    </div>
  );
};

export default Sidebar;