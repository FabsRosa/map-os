import apiClient from './apiClient';
import { toDate, getMinutesDifference } from './handleTime';

const pinColors = ['blue', 'green', 'lightblue', 'pink', 'purple', 'orange', 'darkred'];

// Retorna informações de OS
const fetchOrdersData = async () => {
  try {
    const responseOS = await apiClient.get('/maps/OS');
    let lastClientID = '';
    let count = 0;

    if (responseOS.ok && responseOS.data) {
      let templateCoord = { lat: -15.591627, lng: -56.143837 };
      const ordersData = responseOS.data.map(order => {
        // In case there's many pins in the same client (thus, same position)
        [count, lastClientID] = adjustRepeatedOrders(order, count, lastClientID);

        // For clients without position. A default position in the river is assigned, going downward for each
        if (!order.lat && !order.lng) {
          order.lat = templateCoord.lat;
          order.lng = templateCoord.lng;
          templateCoord.lat -= 0.0006;
        }

        return {
          id: order.idOS.toString(),
          lat: parseFloat(order.lat),
          lng: parseFloat(order.lng),
          clientID: order.idCliente,
          clientName: order.nomeCliente,
          clientRazao: order.razaoCliente,
          def: order.descDefeito,
          idDef: order.idDefeito,
          desc: order.descricao,
          idTec: order.idTec,
          nomeTec: order.nomeTec,
          solic: order.solic,
          dataAb: order.dataAb,
          dataAg: order.dataAg,
          isPausada: order.isPausada,
        };
      });

      return ordersData;
    } else {
      console.error('Error fetching orders:', responseOS.problem);
    }
  } catch (error) {
    console.error('Error fetching orders:', error);
  }
  return [];
};

// Retorna informações da barra lateral SidebarInfo
const fetchInfosData = async (type) => {
  try {
    const responseInfos = await apiClient.get('/maps/BI_' + type);

    if (responseInfos.ok && responseInfos.data) {
      if (type == 'OS') {
        return (
          [
            { label: "OS Cliente", field: "OS Cliente", value: responseInfos.data.qtdOsCliente },
            { label: "Agendadas", field: "Agendadas", value: responseInfos.data.qtdAgendada },
            { label: "Agendadas para Hoje", field: "Agendadas para Hoje", value: responseInfos.data.qtdAgendadaHoje },
            { label: "Pausadas", field: "Pausadas", value: responseInfos.data.qtdPausada },
            { label: "OS Alarme", field: "OS Alarme", value: responseInfos.data.qtdOsAlarme },
            { label: "Retorno", field: "Retorno", value: responseInfos.data.qtdRetorno },
            { label: "Falha de Comunicação", field: "Falha de Comunicação", value: responseInfos.data.qtdFalhaComunicacao },
            { label: "Arrombamento", field: "Arrombamento", value: responseInfos.data.qtdArrombamento },
            { label: "Solic. Imagem", field: "Solic. Imagem", value: responseInfos.data.qtdSolicImagem },
            { label: "Sem Acesso Imagem", field: "Sem Acesso Imagem", value: responseInfos.data.qtdSemAcess },
            { label: "Instalação", field: "Instalação", value: responseInfos.data.qtdInstalacao },
          ]
        );
      } else if (type == 'Alarm') {
        if (responseInfos.ok && responseInfos.data) {
          return (
            [
              { label: "Táticos", field: "Táticos", value: responseInfos.data.qtdTaticos },
              { label: "Alarme", field: "Alarme", value: responseInfos.data.qtdAlarme },
              { label: "Falha de Comunicação", field: "Falha de Comunicação", value: responseInfos.data.qtdFalha },
              { label: "Pânico", field: "Pânico", value: responseInfos.data.qtdPanico },
              { label: "Em observação", field: "Em observação", value: responseInfos.data.qtdObservacao },
              { label: "Não Atendido", field: "Não Atendido", value: responseInfos.data.qtdNaoAtendido },
            ]
          );
        }
      }
    } else {
      console.error('Error fetching infos:', responseInfos.problem);
    }
  } catch (error) {
    console.error('Error fetching infos:', error);
  }
  return [];
};

// Retorna informações de Alarmes
const fetchAlarmsData = async () => {
  try {
    const responseOS = await apiClient.get('/maps/alarm');
    let lastClientID = '';
    let count = 0;

    if (responseOS.ok && responseOS.data) {
      let templateCoord = { lat: -15.591627, lng: -56.143837 };
      const alarmsData = responseOS.data.map(alarm => {
        // In case there's many pins in the same client (thus, same position)
        [count, lastClientID] = adjustRepeatedOrders(alarm, count, lastClientID);

        // For clients without position. A default position in the river is assigned, going downward for each
        if (!alarm.lat && !alarm.lng) {
          alarm.lat = templateCoord.lat;
          alarm.lng = templateCoord.lng;
          templateCoord.lat -= 0.0006;
        }

        // Time difference of each timestamps, in minutes and seconds
        // The last timestamp (may vary) always compares itself with current time
        const recebido = (alarm.dtRecebido ? (getMinutesDifference(toDate(alarm.dtRecebido), (alarm.dtDeslocamento ? toDate(alarm.dtDeslocamento) : new Date()))) : null);
        const deslocamento = (alarm.dtDeslocamento ? (getMinutesDifference(toDate(alarm.dtDeslocamento), (alarm.dtLocal ? toDate(alarm.dtLocal) : new Date()))) : null);
        const local = (alarm.dtLocal ? (getMinutesDifference(toDate(alarm.dtLocal), new Date())) : null);

        return {
          lat: parseFloat(alarm.lat),
          lng: parseFloat(alarm.lng),
          clientID: alarm.idCliente,
          clientName: alarm.nomeCliente,
          clientRazao: alarm.razaoCliente,
          codEvento: alarm.codEvento,
          tipoEvento: alarm.tipoEvento,
          dtObservacao: alarm.dtObservacao,
          dtRecebido: alarm.dtRecebido,
          tempoRecebido: recebido !== null ? (recebido.minutes !== null ? recebido.minutes : null) : null,
          segRecebido: recebido !== null ? (recebido.seconds !== null ? recebido.seconds : null) : null,
          dtDeslocamento: alarm.dtDeslocamento,
          tempoDeslocamento: deslocamento !== null ? (deslocamento.minutes !== null ? deslocamento.minutes : null) : null,
          segDeslocamento: deslocamento !== null ? (deslocamento.seconds !== null ? deslocamento.seconds : null) : null,
          dtLocal: alarm.dtLocal,
          tempoLocal: local !== null ? (local.minutes !== null ? local.minutes : null) : null,
          segLocal: local !== null ? (local.seconds !== null ? local.seconds : null) : null,
        };
      });

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
      const motosData = responseMoto.data.map(moto => {
        return {
          id: moto.id,
          lat: parseFloat(moto.lat),
          lng: parseFloat(moto.lng),
          nomeTatico: moto.nomeTatico ? moto.nomeTatico : null,
          idleTime: moto.idleTime,
          type: moto.type,
        }
      });

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
          idDefeito: def.idDefeito,
          descDefeito: def.descDefeito,
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
      let colorIndex = -1;
      const tecData = response.data.map(tec => {
        if (colorIndex > 6) {
          colorIndex = 0;
        }

        let color;
        if (colorIndex === -1) {
          color = 'red'
          colorIndex++;
        } else {
          color = pinColors[colorIndex++]
        }

        return {
          id: tec.idTec,
          nome: tec.nomeTec,
          color: color,
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

const adjustRepeatedOrders = (order, count, lastClientID) => {
  if (!order.lat || !order.lng) {
    return [count, lastClientID];
  }

  if (lastClientID === order.idCliente) {
    count++;
    const angle = count * 30; // 30 degrees for each subsequent marker
    const radians = (angle * Math.PI) / 180; // Convert angle to radians
    const radiusIncrement = 0.0003;; // Fixed distance for each step
    const radius = radiusIncrement * (Math.trunc((count + 1) / 12) + 1); // Increase radius slightly with each step

    // Adjust lat and lng slightly to create the linear spiral effect without overlap
    order.lat = parseFloat(order.lat) + radius * Math.sin(radians);
    order.lng = parseFloat(order.lng) + radius * Math.cos(radians);
  } else {
    lastClientID = order.idCliente;
    count = 0;
  }

  return [count, lastClientID];
}

export {
  fetchOrdersData,
  fetchInfosData,
  fetchAlarmsData,
  fetchMotosData,
  fetchDefects,
  fetchTechnicians,
};