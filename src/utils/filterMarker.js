// Valida as OS com base nos filtros presentes
const filterMarker = (orders, filter, tecnicos) => {
  return orders.filter(order => {
    if (!filter) return true;

    let filterOc = true;
    let filterOS = true;
    let filterDef = true;
    let filterTec = true;
    let filterCli = true;
    let filterdataIniAb = true;
    let filterdataFimAb = true;
    let filterdataIniAg = true;
    let filterdataFimAg = true;

    if (filter.tipoOS && filter.tipoOS.length > 0) {
      let OSCli = true;
      if (filter.tipoOS.includes('Cliente')) {
        OSCli = order.solic == 10001;
      }

      let OSAg = true;
      if (filter.tipoOS.includes('Agendada')) {
        OSAg = order.dataAg !== null;
      }

      let OSAt = true;
      if (filter.tipoOS.includes('Atribuida')) {
        OSAt = order.idTec !== tecnicos[0].id && tecnicos.some(tecnico => tecnico.id === order.idTec);
      }

      let OSPausada = true;
      if (filter.tipoOS.includes('Pausada')) {
        OSAt = order.isPausada == true;
      }
      
      filterOS = OSCli && OSAg && OSAt && OSPausada;
    }

    if (filter.defeito && filter.defeito.length > 0) {
      filterDef = filter.defeito.includes(order.idDef);
    }

    if (filter.tecnico && filter.tecnico.length > 0) {
      filterTec = (filter.tecnico.includes('TERCEIRIZADO') && !tecnicos.some(tec => tec.id === order.idTec)) || filter.tecnico.includes(order.idTec);
    }

    if (filter.cliente) {
      let filterOS = false;
      if (/^\d{6}$/.test(filter.cliente)) { //If it has exactly 6 numbers
        filterOS = filter.cliente == order.id;
      }
      
      const normalizedFilter = filter.cliente.toLowerCase().replace(/^0+/, '');
      const filterClient =
        order.clientName.toLowerCase().includes(normalizedFilter) ||
        order.clientRazao.toLowerCase().includes(normalizedFilter) ||
        order.clientID.toLowerCase().replace(/^0+/, '').includes(normalizedFilter);
      
      filterCli = filterClient || filterOS;
    }

    if (filter.ocultar && filter.ocultar.length > 0) {
      let filterOcOS = true;
      if (filter.ocultar.includes('OS')) {
        filterOcOS = false;
      }
      filterOc = filterOcOS;
    }

    if (filter.dataIniAb) {
      if (order.dataAb) {
        filterdataIniAb = compareDateBefore(filter.dataIniAb, order.dataAb)
      } else {
        filterdataIniAb = false;
      }
    }

    if (filter.dataFimAb) {
      if (order.dataAb) {
        filterdataFimAb = compareDateBefore(order.dataAb, filter.dataFimAb)
      } else {
        filterdataFimAb = false;
      }
    }

    if (filter.dataIniAg) {
      if (order.dataAg) {
        filterdataIniAg = compareDateBefore(filter.dataIniAg, order.dataAg)
      } else {
        filterdataIniAg = false;
      }
    }

    if (filter.dataFimAg) {
      if (order.dataAg) {
        filterdataFimAg = compareDateBefore(order.dataAg, filter.dataFimAg)
      } else {
        filterdataFimAg = false;
      }
    }
  
    return filterOc && filterOS && filterDef && filterTec && filterCli && filterdataIniAb && filterdataFimAb && filterdataIniAg && filterdataFimAg;
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