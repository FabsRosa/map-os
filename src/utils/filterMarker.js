// Valida as OS com base nos filtros presentes
const filterMarker = (orders, filter, tecnicos) => {
  return orders.filter(order => {
    if (!filter) return true;

    let filterOc = true;
    let filterOS = true;
    let filterDef = true;
    let filterTec = true;
    let filterCli = true;
    let filterDataIni = true;
    let filterDataFim = true;

    if (filter.tipoOS && filter.tipoOS.length > 0) {
      let OSCli = false;
      let OSAg = false;
      let OSAt = false;
      if (filter.tipoOS.includes('OS Cliente')) {
        OSCli = order.solic == 10001;
      }
      if (filter.tipoOS.includes('OS Agendada')) {
        OSAg = order.dataAg !== null;
      }
      if (filter.tipoOS.includes('OS Atribuida')) {
        OSAt = order.idTec !== tecnicos[0].id && tecnicos.some(tecnico => tecnico.id === order.idTec);
      }
      filterOS = OSCli || OSAg || OSAt;
    }

    if (filter.defeito && filter.defeito.length > 0) {
      filterDef = filter.defeito.includes(order.def);
    }

    if (filter.tecnico && filter.tecnico.length > 0) {
      filterTec = (filter.tecnico.includes('TERCEIRIZADO') && !tecnicos.some(tec => tec.id === order.idTec)) || filter.tecnico.includes(order.idTec);
    }

    if (filter.cliente) {
      const normalizedFilter = filter.cliente.toLowerCase().replace(/^0+/, '');
      filterCli =
        order.clientName.toLowerCase().includes(normalizedFilter) ||
        order.clientID.toLowerCase().replace(/^0+/, '').includes(normalizedFilter);
    }

    if (filter.ocultar && filter.ocultar.length > 0) {
      let filterOcOS = true;
      let filterOcTec = true;
      if (filter.ocultar.includes('OS')) {
        filterOcOS = false;
      }
      if (filter.ocultar.includes('OS Inviolavel e Terceirizados')) {
        filterOcTec = order.idTec !== tecnicos[0].id && tecnicos.some(tecnico => tecnico.id === order.idTec);
      }
      filterOc = filterOcOS && filterOcTec;
    }

    if (filter.dataIni) {
      filterDataIni = compareDateBefore(filter.dataIni, order.dataAb)
    }

    if (filter.dataFim) {
      filterDataFim = compareDateBefore(order.dataAb, filter.dataFim)
    }
  
    return filterOc && filterOS && filterDef && filterTec && filterCli && filterDataIni && filterDataFim;
  });
};

const filterMotos = (filter) => {
  if (!filter) return true;

  let filterOc = true;

  if (filter.ocultar && filter.ocultar.length > 0) {
    filterOc = !filter.ocultar.includes('Motos');
  }
  return filterOc;
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
  
export {
  filterMarker,
  filterMotos,
};