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
      const ordersData = responseOS.data.map(order => {
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

        return {
          id: order.idOS.toString(),
          lat: order.lat ? parseFloat(order.lat) : (-15.5946388337158 + getRandomNumber()),
          lng: order.lng ? parseFloat(order.lng) : (-56.1441360169476 + getRandomNumber()),
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
const fetchInfosData = async () => {
  try {
    const responseInfos = await apiClient.get('/maps/BI');

    if (responseInfos.ok && responseInfos.data) {
      return (
        [
          { label: "OS Cliente", value: responseInfos.data.qtdOsCliente },
          { label: "OS Alarme", value: responseInfos.data.qtdOsAlarme },
          { label: "Retorno", value: responseInfos.data.qtdRetorno },
          { label: "Falha de Comunicação", value: responseInfos.data.qtdFalhaComunicacao },
          { label: "Arrombamento", value: responseInfos.data.qtdArrombamento },
          { label: "Solic. Imagem", value: responseInfos.data.qtdSolicImagem },
          { label: "Sem Acesso Imagem", value: responseInfos.data.qtdSemAcess },
          { label: "Instalação", value: responseInfos.data.qtdInstalacao },
          { label: "Pausadas", value: responseInfos.data.qtdPausada },
          { label: "Agendadas", value: responseInfos.data.qtdAgendada },
          { label: "Agendadas p/ Hoje", value: responseInfos.data.qtdAgendadaHoje },
        ]
      );
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
      const alarmsData = responseOS.data.map(alarm => {
        if (lastClientID === alarm.idCliente) {
          count++;
          const angle = count * 30; // 30 degrees for each subsequent marker
          const radians = (angle * Math.PI) / 180; // Convert angle to radians
          const radiusIncrement = 0.0003; // Fixed distance for each step
          const radius = radiusIncrement * (Math.trunc((count + 1) / 12) + 1); // Increase radius slightly with each step

          // Adjust lat and lng slightly to create the linear spiral effect without overlap
          alarm.lat = parseFloat(alarm.lat) + radius * Math.sin(radians);
          alarm.lng = parseFloat(alarm.lng) + radius * Math.cos(radians);
        } else {
          lastClientID = alarm.idCliente;
          count = 0;
        }
        const recebido = (alarm.dtRecebido ? (getMinutesDifference(toDate(alarm.dtRecebido), (alarm.dtDeslocamento ? toDate(alarm.dtDeslocamento) : new Date()))) : null);
        const deslocamento = (alarm.dtDeslocamento ? (getMinutesDifference(toDate(alarm.dtDeslocamento), (alarm.dtLocal ? toDate(alarm.dtLocal) : new Date()))) : null);
        const local = (alarm.dtLocal ? (getMinutesDifference(toDate(alarm.dtLocal), new Date())) : null);

        return {
          // If there is no location, the pin will be in a randon position in river
          lat: alarm.lat ? parseFloat(alarm.lat) : (-15.5946388337158 + getRandomNumber()),
          lng: alarm.lng ? parseFloat(alarm.lng) : (-56.1441360169476 + getRandomNumber()),
          clientID: alarm.idCliente,
          clientName: alarm.nomeCliente,
          codEvento: alarm.codEvento,
          tipoEvento: alarm.tipoEvento,
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

const getRandomNumber = () => {
  const min = -0.00050000000000;
  const max = 0;
  const randomNumber = Math.random() * (max - min) + min;
  return parseFloat(randomNumber.toFixed(13));
}

export {
  fetchOrdersData,
  fetchInfosData,
  fetchAlarmsData,
  fetchMotosData,
  fetchDefects,
  fetchTechnicians,
};