import Select from 'react-select';
import DatePicker from "react-datepicker";
import { ptBR } from 'date-fns/locale';
import "react-datepicker/dist/react-datepicker.css";

import "../styles/SidebarFilter.css";

// Design da sidebar de filtro
const renderSidebarFilter = (isOpen, onClose, orders, alarms, filters, filtersAlarm, tecnicos, defeitos, onFilterChange, onFilterChangeAlarm, type, onTypeChange, hasMultipleTypes) => {
  return (
    <div className={`sidebarFilter ${isOpen ? 'open' : ''}`}>
      <div className="filter-icon" onClick={onClose}>
        <img src={!isOpen ? "/icon/filter.svg" : "/icon/filter-clear.svg"} alt="Filter" />
      </div>
      <div className="sidebarFilter-items">
        <div className="margin-top"> </div>
        {hasMultipleTypes && (
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
        )}
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
                  { value: "Atribuida", label: "Atribuída à Técnico" },
                  { value: "Pausada", label: "Pausada" },
                  { value: "Agendada", label: "Agendada" },
                  { value: "Agendada Hoje", label: "Agendada p/ Hoje" },
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
                  value: def.idDefeito,
                  label: capitalizeWords(def.descDefeito)
                }))}
                value={defeitos.map(def => ({
                  value: def.idDefeito,
                  label: capitalizeWords(def.descDefeito)
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
                    label: formatName(tec.nome)
                  }))
                ]}
                value={[
                  ...tecnicos.map(tec => ({
                    value: tec.id,
                    label: formatName(tec.nome)
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

        {type === 'Alarm' && (
          <div>
            <div className="filter-option n9">
              <label className="filter-label-alarm n2">Tipo de Alarme</label>
              <br />
              <Select
                id="tipoAlarme"
                isMulti
                options={[
                  { value: "Alarme", label: "Alarme" },
                  { value: "Falha", label: "Falha de Comunicação" },
                  { value: "Panico", label: "Pânico" },
                ]}
                value={filtersAlarm.tipoAlarme ? filtersAlarm.tipoAlarme.map(tipoAlarme => ({ value: tipoAlarme, label: tipoAlarme })) : null}
                onChange={(selectedOptions) => {
                  const selectedValues = selectedOptions ? selectedOptions.map(option => option.value) : [];
                  onFilterChangeAlarm(alarms, { ...filtersAlarm, tipoAlarme: selectedValues });
                }}
                placeholder="Selecione Alarme"
              />
            </div>
            <div className="filter-option n10">
              <label className="filter-label-alarm n3">Em observação</label>
              <br />
              <Select
                id="isObservacao"
                isMulti
                options={[
                  { value: "Observacao", label: "Observação" },
                  { value: "Nao Atendido", label: "Não Atendido" },
                ]}
                value={filtersAlarm.isObservacao ? filtersAlarm.isObservacao.map(isObservacao => ({ value: isObservacao, label: isObservacao })) : null}
                onChange={(selectedOptions) => {
                  const selectedValues = selectedOptions ? selectedOptions.map(option => option.value) : [];
                  onFilterChangeAlarm(alarms, { ...filtersAlarm, isObservacao: selectedValues });
                }}
                placeholder="Selecione"
              />
            </div>
            <div className="filter-option n11">
              <label className="filter-label-alarm n4">Tipo de Moto</label>
              <br />
              <Select
                id="tipoMoto"
                isMulti
                options={[
                  { value: "Tatico", label: "Tático" },
                  { value: "Outros", label: "Outros" },
                ]}
                value={filtersAlarm.tipoMoto ? filtersAlarm.tipoMoto.map(tipoMoto => ({ value: tipoMoto, label: tipoMoto })) : null}
                onChange={(selectedOptions) => {
                  const selectedValues = selectedOptions ? selectedOptions.map(option => option.value) : [];
                  onFilterChangeAlarm(alarms, { ...filtersAlarm, tipoMoto: selectedValues });
                }}
                placeholder="Selecione Moto"
              />
            </div>
            <div className="filter-option last">
              <label className="filter-label-alarm n1" htmlFor="clienteFilter">Cliente</label>
              <br />
              <input
                id="clienteFilter"
                type="text"
                className='custom-textbox filter'
                value={filtersAlarm.cliente || ''}
                onChange={(e) => onFilterChangeAlarm(alarms, { ...filtersAlarm, cliente: e.target.value })}
                placeholder="Digite o nome ou código"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const formatName = (fullName) => {
  if (!fullName) return '';
  if (fullName == 'INVIOLAVEL') return 'Inviolável';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return '';
  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  const lowerCaseWords = ['do', 'da', 'dos', 'das', 'de'];
  if (parts.length === 1) {
    return capitalize(parts[0]);
  }
  if (parts.length >= 3 && lowerCaseWords.includes(parts[1].toLowerCase())) {
    return `${capitalize(parts[0])} ${parts[1].toLowerCase()} ${capitalize(parts[2])}`;
  }
  // Default: first and second name, both capitalized
  return `${capitalize(parts[0])} ${capitalize(parts[1])}`;
};

const capitalizeWords = (str) => {
  if (!str) return '';
  const exceptions = ['do', 'dos', 'da', 'das', 'de', 'no', 'nos', 'nas', 'na', 'e'];
  const tiVariants = ['ti', 't.i', 't.i.'];
  return str
    .toLowerCase()
    .split(' ')
    .map((word, idx) => {
      if (word.replace(/\./g, '') === 'cftv') {
        return 'CFTV';
      }
      if (tiVariants.includes(word.replace(/\./g, ''))) {
        return word.replace(/t\.?i\.?/i, word => word.toUpperCase());
      }
      if (exceptions.includes(word) && idx !== 0) {
        return word;
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
};

export default renderSidebarFilter;