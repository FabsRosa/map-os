import apiClient from './apiClient';

const pinColors = ['red', 'blue', 'green', 'lightblue', 'pink', 'purple', 'orange', 'yellow'];

// Retorna informações de OS
const fetchOrdersData = async () => {
  try {
    const responseOS = await apiClient.get('/maps/OS');

    if (responseOS.ok && responseOS.data) {
      const ordersData = responseOS.data.map(order => ({
        id: order.idOS.toString(),
        lat: parseFloat(order.lat),
        lng: parseFloat(order.lng),
        clientID: order.idCliente,
        clientName: order.nomeCliente,
        def: order.defeito,
        desc: order.descricao,
        idTec: order.idTec,
        nomeTec: order.nomeTec,
        solic: order.solic,
        dataAg: order.dataAg,
      }));

      return ordersData;
    } else {
      console.error('Error fetching orders:', responseOS.problem);
    }
  } catch (error) {
    console.error('Error fetching orders:', error);
  }
  return [];
};

// Retorna informações de Alarmes
const fetchAlarmsData = async () => {
  try {
    const responseOS = await apiClient.get('/maps/alarm');

    if (responseOS.ok && responseOS.data) {
      const alarmsData = responseOS.data.map(alarm => ({
        lat: parseFloat(alarm.lat),
        lng: parseFloat(alarm.lng),
        clientID: alarm.idCliente,
        clientName: alarm.nomeCliente,
      }));

      return alarmsData;
    } else {
      console.error('Error fetching alarms:', responseOS.problem);
    }
  } catch (error) {
    console.error('Error fetching alarms:', error);
  }
  return [];
};
  
// Retorna informações de Moto
const fetchMotosData = async () => {
  try {
    const responseMoto = await apiClient.get('/maps/motoLocation');

    if (responseMoto.ok && responseMoto.data) {
      const motosData = responseMoto.data.map(moto => ({
        id: moto.placa,
        lat: parseFloat(moto.lat),
        lng: parseFloat(moto.lng),
        nomeTatico: moto.nomeTatico ? moto.nomeTatico : null,
      }));

      return motosData;
    } else {
      console.error('Error fetching motos:', responseMoto.problem);
    }
  } catch (error) {
    console.error('Error fetching motos:', error);
  }

  return [];
};

// Retorna lista de defeitos
const fetchDefects = async () => {
  try {
    const response = await apiClient.get('/maps/defeito');
    if (response.ok && response.data) {
      const defData = response.data.map(def => {
        return {
          defeito: def.defeito,
        };
      });

      return defData;
    } else {
      console.error('Error fetching defects:', response.problem);
    }
  } catch (error) {
    console.error('Error fetching defects:', error);
  }

  return [];
};

// Retorna lista de técnicos não-terceirizados
const fetchTechnicians = async () => {
  try {
    const response = await apiClient.get('/maps/tec');
    if (response.ok && response.data) {
      let colorIndex = 0;
      const tecData = response.data.map(tec => {
        if (colorIndex > 6) {
          colorIndex = 0;
        }

        return {
          id: tec.idTec,
          nome: tec.nomeTec,
          color: pinColors[colorIndex++ % pinColors.length],
        };
      });

      return tecData;
    } else {
      console.error('Error fetching technicians:', response.problem);
    }
  } catch (error) {
    console.error('Error fetching technicians:', error);
  }

  return [];
};

export {
  fetchOrdersData,
  fetchAlarmsData,
  fetchMotosData,
  fetchDefects,
  fetchTechnicians
};