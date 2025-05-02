// Valida as OS com base nos filtros presentes
const filterAlarm = (alarms, filter) => {
  return alarms.filter(alarm => {
    if (!filter) return true;

    let filterAlarm = true;
    let filterObs = true;
    let filterCli = true;

    if (filter.tipoAlarme && filter.tipoAlarme.length > 0) {
      let isAlarm = false;
      if (filter.tipoAlarme.includes('Alarme')) {
        isAlarm = alarm.codEvento == 'E130';
      }

      let isFalha = false;
      if (filter.tipoAlarme.includes('Falha')) {
        isFalha = alarm.codEvento == 'E131'
          || alarm.codEvento == 'E133'
          || alarm.codEvento == 'E250'
          || alarm.codEvento == 'E301'
          || alarm.codEvento == 'E333';
      }

      let isPanico = false;
      if (filter.tipoAlarme.includes('Panico')) {
        isPanico = alarm.codEvento == 'E120' || alarm.codEvento == 'E121' || alarm.codEvento == 'E122';
      }

      filterAlarm = isAlarm || isFalha || isPanico
    }

    if (filter.isObservacao && filter.isObservacao.length > 0) {
      let isObs = false;
      if (filter.isObservacao.includes('Observacao')) {
        isObs = alarm.dtObservacao != null;
      }

      let isNaoAtendido = false;
      if (filter.isObservacao.includes('Nao Atendido')) {
        isNaoAtendido = alarm.dtObservacao == null;
      }

      filterObs = isObs || isNaoAtendido
    }

    if (filter.cliente) {
      const normalizedFilter = filter.cliente.toLowerCase().replace(/^0+/, '');
      filterCli =
        alarm.clientName.toLowerCase().includes(normalizedFilter) ||
        alarm.clientRazao.toLowerCase().includes(normalizedFilter) ||
        alarm.clientID.toLowerCase().replace(/^0+/, '').includes(normalizedFilter);
    }

    return filterAlarm && filterObs && filterCli;
  });
};

const filterMotosAlarm = (filter, moto) => {
  if (!filter) return true;

  let filterOc = true;

  if (filter.tipoMoto && filter.tipoMoto.length > 0) {
    let isObs = false;
    if (filter.tipoMoto.includes('Tatico')) {
      isObs = moto.nomeTatico != null;
    }

    let isNaoAtendido = false;
    if (filter.tipoMoto.includes('Tecnico')) {
      isNaoAtendido = moto.nomeTatico == null;
    }

    filterOc = isObs || isNaoAtendido
  }
  return filterOc;
};

export {
  filterAlarm,
  filterMotosAlarm,
};