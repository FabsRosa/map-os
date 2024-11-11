import Select from 'react-select';
import DatePicker from "react-datepicker";
import { ptBR } from 'date-fns/locale';
import "react-datepicker/dist/react-datepicker.css";

import "../styles/SidebarFilter.css";

const renderSidebarFilter = (isSidebarFilterOpen, toggleSidebarFilter, orders, filters, tecnicos, defeitos, onFilterChange, type, onTypeChange) => {
  return (
    <SidebarFilter
      isOpen={isSidebarFilterOpen}
      onClose={toggleSidebarFilter}
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
const SidebarFilter = ({ isOpen, onClose, orders, filters, tecnicos, defeitos, onFilterChange, type, onTypeChange }) => {
  return (
    <div className={`sidebarFilter ${isOpen ? 'open' : ''}`}>
      <div className="filter-icon" onClick={onClose}>
        <img src={!isOpen ? "/icon/filter.svg" : "/icon/filter-clear.svg"} alt="Filter" />
      </div>
      <div className="sidebarFilter-items">
        <div className="filter-option n1">
          <label className="filter-label n1" htmlFor="mapType">Tipo de Mapa</label>
          <br />
          <select
            id="mapType"
            className='custom-select filter'
            value={type}
            onChange={(e) => onTypeChange(e.target.value)}
          >
            <option value="OS">Ordem de Serviço</option>
            <option value="Alarm">Alarme</option>
          </select>
        </div>
        {type === 'OS' && (
          <div>
            <div className="filter-option n2">
              <label className="filter-label n2" htmlFor="clienteFilter">Cliente ou nº OS</label>
              <br />
              <input
                id="clienteFilter"
                type="text"
                className='custom-textbox filter'
                value={filters.cliente || ''}
                onChange={(e) => onFilterChange(orders, { ...filters, cliente: e.target.value }, tecnicos)}
                placeholder="Digite o nome ou código"
              />
            </div>

            <div className="filter-option n3">
              <label className="filter-label n3">Tipo de Ordem de Serviço</label>
              <br />
              <Select
                id="tipoOS"
                isMulti
                options={[
                  { value: "Cliente", label: "Aberta por Cliente" },
                  { value: "Agendada", label: "Agendada" },
                  { value: "Atribuida", label: "Atribuída à Técnico" },
                ]}
                value={filters.tipoOS ? filters.tipoOS.map(tipoOS => ({ value: tipoOS, label: tipoOS })) : null}
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
                id="defeito"
                isMulti
                options={defeitos.map(def => ({
                  value: def.defeito,
                  label: def.defeito
                }))}
                value={defeitos.map(def => ({
                  value: def.defeito,
                  label: def.defeito
                })).filter(option => filters.defeito.includes(option.value))}
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
                id="tecnico"
                isMulti
                options={[
                  { value: 'TERCEIRIZADO', label: 'TERCEIRIZADO' },
                  ...tecnicos.map(tec => ({
                    value: tec.id,
                    label: tec.nome
                  }))
                ]}
                value={[
                  ...tecnicos.map(tec => ({
                    value: tec.id,
                    label: tec.nome
                  })).filter(option => filters.tecnico.includes(option.value)),
                  filters.tecnico.includes('TERCEIRIZADO') ? { value: 'TERCEIRIZADO', label: 'TERCEIRIZADO' } : null
                ].filter(Boolean)}
                onChange={(selectedOptions) => {
                  const selectedValues = selectedOptions ? selectedOptions.map(option => option.value) : [];
                  onFilterChange(orders, { ...filters, tecnico: selectedValues }, tecnicos);
                }}
                placeholder="Selecione o técnico"
              />
            </div>

            <div className="filter-option n6">
              <label className="filter-label n6">Ocultar</label>
              <br />
              <Select
                id="ocultar"
                isMulti
                options={[
                  { value: "OS", label: "OS: Todas" },
                  { value: "Motos", label: "Motos: Todas" }
                ]}
                value={filters.ocultar ? filters.ocultar.map(ocultar => ({ value: ocultar, label: ocultar })) : null}
                onChange={(selectedOptions) => {
                  const selectedValues = selectedOptions ? selectedOptions.map(option => option.value) : [];
                  onFilterChange(orders, { ...filters, ocultar: selectedValues }, tecnicos);
                }}
                placeholder="Selecione a opção"
              />
            </div>

            <div className="filter-option n7">
              <label className="filter-label n7" htmlFor="dataAberturaIni">Data de Abertura</label>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <DatePicker
                  id="dataAberturaIni"
                  selected={filters.dataIniAb ? new Date(filters.dataIniAb) : null}
                  onChange={(date) => onFilterChange(orders, { ...filters, dataIniAb: date }, tecnicos)}
                  isClearable
                  placeholderText="Data Inicial"
                  className='custom-date filter n1'
                  popperPlacement="bottom-start"
                  dateFormat="dd/MM/yyyy"
                  locale={ptBR}
                />
                <DatePicker
                  id="dataAberturaFim"
                  selected={filters.dataFimAb ? new Date(filters.dataFimAb) : null}
                  onChange={(date) => onFilterChange(orders, { ...filters, dataFimAb: date }, tecnicos)}
                  isClearable
                  placeholderText="Data Final"
                  className='custom-date filter n2'
                  popperPlacement="bottom-start"
                  dateFormat="dd/MM/yyyy"
                  locale={ptBR}
                />
              </div>
            </div>

            <div className="filter-option n8">
              <label className="filter-label n8" htmlFor="dataAgendamentoIni">Data de Agendamento</label>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <DatePicker
                  id="dataAgendamentoIni"
                  selected={filters.dataIniAg ? new Date(filters.dataIniAg) : null}
                  onChange={(date) => onFilterChange(orders, { ...filters, dataIniAg: date }, tecnicos)}
                  isClearable
                  placeholderText="Data Inicial"
                  className='custom-date filter n1'
                  popperPlacement="bottom-start"
                  dateFormat="dd/MM/yyyy"
                />
                <DatePicker
                  id="dataAgendamentoFim"
                  selected={filters.dataFimAg ? new Date(filters.dataFimAg) : null}
                  onChange={(date) => onFilterChange(orders, { ...filters, dataFimAg: date }, tecnicos)}
                  isClearable
                  placeholderText="Data Final"
                  className='custom-date filter n2'
                  popperPlacement="bottom-start"
                  dateFormat="dd/MM/yyyy"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default renderSidebarFilter;