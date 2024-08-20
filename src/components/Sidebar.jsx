import Select from 'react-select';

const renderSidebar = (isSidebarOpen, toggleSidebar, orders, filters, tecnicos, defeitos, onFilterChange, type, onTypeChange) => {
  return (
    <Sidebar
      isOpen={isSidebarOpen}
      onClose={toggleSidebar}
      orders={orders}
      filters={filters}
      tecnicos={tecnicos}
      defeitos={defeitos}
      onFilterChange={onFilterChange}
      type={type}
      onTypeChange={onTypeChange}
    />
  )
}

// Design da sidebar de filtro
const Sidebar = ({ isOpen, onClose, orders, filters, tecnicos, defeitos, onFilterChange, type, onTypeChange }) => {
  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="filter-icon" onClick={onClose}>
        <img src={!isOpen ? "/icon/filter.svg" : "/icon/clear-filter.svg"} alt="Filter" />
      </div>
      <div className="filter-option n1">
        <label className="filter-label n1">Tipo de Mapa</label>
        <br />
        <select
          className='custom-select filter'
          value={type}
          onChange={(e) => onTypeChange(e.target.value)}
        >
          <option value="OS">OS</option>
          <option value="Alarm">Alarme</option>
        </select>
      </div>
      { type === 'OS' ? (
        <div>
          <div className="filter-option n2">
            <label className="filter-label n2">Nome ou Código do Cliente</label>
            <br />
            <input
              type="text"
              className='custom-textbox filter'
              value={filters.cliente ? filters.cliente : ''}
              onChange={(e) => onFilterChange(orders, { ...filters, cliente: e.target.value }, tecnicos)}
              placeholder="Digite o nome ou código"
            />
          </div>
          <div className="filter-option n3">
            <label className="filter-label n3">Tipo de Ordem de Serviço</label>
            <br />
            <Select
              isMulti
              options={[
                { value: "OS Cliente", label: "OS Aberta por cliente" },
                { value: "OS Agendada", label: "OS Agendada" }
              ]}
              value={filters.tipoOS ? (
                filters.tipoOS.map(tipoOS => ({
                  value: tipoOS,
                  label: tipoOS
                }))
              ) : (
                null
              )
              }
              onChange={(selectedOptions) => {
                const selectedValues = selectedOptions ? selectedOptions.map(option => option.value) : [];
                onFilterChange(orders, { ...filters, tipoOS: selectedValues }, tecnicos);
              }}
              placeholder="Selecione tipo OS"
            />
          </div>
          <div className="filter-option n4">
            <label className="filter-label n4">Defeito</label>
            <br />
            <Select
              isMulti
              options={defeitos.map(def => ({
                value: def.defeito,
                label: def.defeito
              }))}
              value={defeitos
                .map(def => ({
                  value: def.defeito,
                  label: def.defeito
                }))
                .filter(option => filters.defeito.includes(option.value))
              }
              onChange={(selectedOptions) => {
                const selectedValues = selectedOptions ? selectedOptions.map(option => option.value) : [];
                onFilterChange(orders, { ...filters, defeito: selectedValues }, tecnicos);
              }}
              placeholder="Selecione o defeito"
            />
          </div>
          <div className="filter-option n5">
            <label className="filter-label n5">Técnico</label>
            <br />
            <Select
              isMulti
              options={tecnicos.map(tec => ({
                value: tec.id,
                label: tec.nome
              }))}
              value={tecnicos
                .map(tec => ({
                  value: tec.id,
                  label: tec.nome
                }))
                .filter(option => filters.tecnico.includes(option.value))
              }
              onChange={(selectedOptions) => {
                const selectedValues = selectedOptions ? selectedOptions.map(option => option.value) : [];
                onFilterChange(orders, { ...filters, tecnico: selectedValues }, tecnicos);
              }}
              placeholder="Selecione o técnico"
            />
          </div>
        </div>
      ) : (
        null
      )}
    </div>
  );
};

export default renderSidebar;