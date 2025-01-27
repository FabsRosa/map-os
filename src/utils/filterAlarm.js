// Valida as OS com base nos filtros presentes
const filterAlarm = (alarms, filter) => {
  return alarms.filter(alarm => {
    if (!filter) return true;

    let filterCli = true;

    if (filter.cliente) {
      const normalizedFilter = filter.cliente.toLowerCase().replace(/^0+/, '');
      filterCli =
        alarm.clientName.toLowerCase().includes(normalizedFilter) ||
        alarm.clientRazao.toLowerCase().includes(normalizedFilter) ||
        alarm.clientID.toLowerCase().replace(/^0+/, '').includes(normalizedFilter);
    }

    return filterCli;
  });
};

export {
  filterAlarm,
};