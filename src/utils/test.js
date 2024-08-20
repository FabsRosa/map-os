// Valida as OS com base nos filtros presentes
const filterMarker = (orders, filter, tecnicos) => {
return orders.filter(order => {
    if (!filter) return true;

    let filterOS = true;
    let filterDef = true;
    let filterTec = true;
    let filterCli = true;

    if (filter.tipoOS && filter.tipoOS.length > 0) {
    filterOS = filter.tipoOS.includes('OS Cliente') ? order.solic == 10001 : order.dataAg !== null;
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

    return filterOS && filterDef && filterTec && filterCli;
});
};