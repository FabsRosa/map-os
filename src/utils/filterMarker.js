// Valida as OS com base nos filtros presentes
const filterMarker = (orders, filter, tecnicos) => {
  return orders.filter(order => {
    if (!filter) return true;

    let filterOS = true;
    let filterDef = true;
    let filterTec = true;
    let filterCli = true;
    let filterDataIni = true;
    let filterDataFim = true;

    if (filter.tipoOS && filter.tipoOS.length > 0) {
      let OSCli = false;
      let OSAg = false;
      if (filter.tipoOS.includes('OS Cliente')) {
        OSCli = order.solic == 10001;
      }
      if (filter.tipoOS.includes('OS Agendada')) {
        OSAg = order.dataAg !== null;
      }
      filterOS = OSCli || OSAg;
    }

    if (filter.defeito && filter.defeito.length > 0) {
      filterDef = filter.defeito.includes(order.def);
    }

    if (filter.tecnico && filter.tecnico.length > 0) {
      if (filter.tecnico.includes('TERCEIRIZADO')) {
          filterTec = !tecnicos.some(tec => tec.id === order.idTec);
      } else {
          filterTec = filter.tecnico.includes(order.idTec);
      }
    }

    if (filter.cliente) {
      const normalizedFilter = filter.cliente.toLowerCase().replace(/^0+/, '');
      filterCli =
        order.clientName.toLowerCase().includes(normalizedFilter) ||
        order.clientID.toLowerCase().replace(/^0+/, '').includes(normalizedFilter);
    }

    if (filter.dataIni) {
      filterDataIni = compareDateBefore(filter.dataIni, order.dataAb)
    }

    if (filter.dataFim) {
      filterDataFim = compareDateBefore(order.dataAb, filter.dataFim)
    }
  
    return filterOS && filterDef && filterTec && filterCli && filterDataIni && filterDataFim;
  });
};

// Verifica se a dateBefore é antes ou na mesma data que dateAfter
const compareDateBefore = (dateBefore, dateAfter) => {
  // Convert both to Date objects
  dateBefore = toDate(dateBefore);
  dateAfter = toDate(dateAfter);

  dateBefore = resetTimeToMidnight(new Date(dateBefore));
  dateAfter = resetTimeToMidnight(new Date(dateAfter));

  return (dateBefore.getTime() === dateAfter.getTime() || (dateBefore.getTime() < dateAfter.getTime()))
}

function toDate(date) {
  if (typeof date === 'string') {
    return new Date(date);
  } else if (date instanceof Date) {
    return date;
  } else {
    throw new Error('Invalid date format');
  }
}

function resetTimeToMidnight(date) {
  date.setHours(0, 0, 0, 0);
  return date;
}
  
export default filterMarker;