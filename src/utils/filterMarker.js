// Valida as OS com base nos filtros presentes
const filterMarker = (orders, filter, tecnicos) => {
  return orders.filter(order => {
    if (!filter) {
      return true;
    }
    
    let filterOS = true;
    let filterDef = true;
    let filterTec = true;

    if (filter.tipoOS) {
      if (filter.tipoOS === 'OS-cliente') {
        filterOS = order.solic == 10001;
      } else if (filter.tipoOS === 'OS-agendada') {
        filterOS = order.dataAg !== null;
      }
    }

    if (filter.defeito) {
      filterDef = filter.defeito == order.def;
    }

    if (filter.tecnico) {
      if (filter.tecnico === 'TERCEIRIZADO') {
        filterTec = !tecnicos.some(tec => tec.id === order.idTec);
      } else {
        filterTec = filter.tecnico == order.idTec;
      }
    }

    return (filterOS && filterDef && filterTec)
  })
}

export default filterMarker;