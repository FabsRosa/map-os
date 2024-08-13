import { create } from 'apisauce';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Retorna posicionamento das motos
if (!API_BASE_URL) {
  throw new Error('Environment variable VITE_API_BASE_URL is not defined.');
}

const apiClient = create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json',
  },
});

apiClient.addResponseTransform(response => {
  if (!response.ok) {
    console.error('API Response Error: ' + response.data.error, response.problem);
    throw response;
  }
});

export default apiClient;
