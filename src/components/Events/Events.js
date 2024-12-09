import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Sidebar from '../SideBar/Sidebar';
import TopBar from '../TopBar/TopBar';
import './Events.css';

function Events() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [setPredictedFertilizer] = useState(null);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchEvents = async () => {
    setIsLoading(true);
    setError('');
    try {
      const devicesResponse = await axios.get('http://localhost:3001/devices');
      const eventsResponse = await axios.get('http://localhost:3001/events');

      if (devicesResponse.data.success) {
        setDevices(devicesResponse.data.data);
        const devicesMap = devicesResponse.data.data.reduce((map, device) => {
          map[device.id] = device.name;
          return map;
        }, {});

        const eventsWithDeviceName = eventsResponse.data.data.map((event) => ({
          ...event,
          deviceName: devicesMap[event.device_id] || 'Dispositivo Desconhecido',
        }));

        const sortedEvents = eventsWithDeviceName.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );

        setEvents(sortedEvents);
        setFilteredEvents(sortedEvents);
      } else {
        console.error('Erro ao carregar dispositivos');
      }
    } catch (error) {
      setError('Erro ao buscar eventos. Tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDevices = async () => {
    try {
      const response = await axios.get('http://localhost:3001/devices');
      if (response.data.success) {
        setDevices(response.data.data);
      } else {
        console.error('Erro ao carregar dispositivos');
      }
    } catch (error) {
      console.error('Erro ao se conectar com o servidor:', error);
    }
  };

  const fetchPrediction = useCallback(async () => {
    try {
      const response = await axios.post(
        'http://localhost:8000/predict?api_key=6d2a222c0a4cb9354b52687ceb0ddf1f'
      );
      setPredictedFertilizer(response.data);
    } catch (error) {
      setError('Erro ao buscar predição. Tente novamente.');
    }
  }, [setPredictedFertilizer]);

  const applyFilters = (deviceId, category) => {
    let filtered = events;

    if (deviceId) {
      filtered = filtered.filter((event) => String(event.device_id) === deviceId);
    }

    if (category) {
      filtered = filtered.filter((event) => event.type === category);
    }

    setFilteredEvents(filtered);
  };

  const handleDeviceFilterChange = (e) => {
    const value = e.target.value;
    setSelectedDevice(value);
    applyFilters(value, selectedCategory);
  };

  const handleCategoryFilterChange = (e) => {
    const value = e.target.value;
    setSelectedCategory(value);
    applyFilters(selectedDevice, value);
  };

  const handleDelete = async (alertMessage) => {
    const confirmDelete = window.confirm(`Você realmente deseja deletar o evento "${alertMessage}"?`);
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:3001/events/${alertMessage}`);
      setEvents(events.filter((event) => event.alertMessage !== alertMessage));
      setFilteredEvents(filteredEvents.filter((event) => event.alertMessage !== alertMessage));
    } catch (error) {
      setError('Erro ao deletar evento. Tente novamente.');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchPrediction();
      fetchEvents();
      fetchDevices();
    };
    fetchData();
  }, [fetchPrediction]);

  return(
    <>
      <TopBar />
      <div className="dashboard">
        <Sidebar />
        <div className="main-content">
          <div className="content-container">
          <h1 className="filter-title">Eventos</h1>
            <hr className="title-divider" />
            <div className="filter-container2">
              <div className="filter-group">
                <label htmlFor="device-dropdown">Dispositivo:</label>
                <select id="device-dropdown" value={selectedDevice} onChange={handleDeviceFilterChange}>
                  <option value="">Selecione um dispositivo</option>
                  {devices.map((device) => (
                    <option key={device.id} value={String(device.id)}>
                      {device.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="category-dropdown">Categoria:</label>
                <select id="category-dropdown" value={selectedCategory} onChange={handleCategoryFilterChange}>
                  <option value="">Selecione uma categoria</option>
                  <option value="critical">Critical</option>
                  <option value="warning">Warning</option>
                  <option value="info">Info</option>
                </select>
              </div>
            </div>

            <hr className="title-divider" />
            {isLoading && <p>Carregando...</p>}
            {error && <p className="error-message">{error}</p>}
            <div className="events-container">
              {filteredEvents.map((event) => (
                
                <div
                  key={event.id}
                  className={`alert-card ${event.type === 'critical' ? 'critical' : event.type === 'warning' ? 'warning' : 'info'}`}
                >
                  <div className="alert-icon-container">
                    <i
                      className={`alert-icon ${
                        event.type === 'critical'
                          ? 'fa-solid fa-circle-exclamation critical'
                          : event.type === 'warning'
                          ? 'fa-solid fa-exclamation-triangle warning'
                          : 'fa-solid fa-info-circle info'
                      }`}
                    ></i>
                  </div>

                  <div className="alert-text-container">
                    <span className="alert-message">{event.alertMessage}</span>
                    {event.gene_by_ia === 1 && <div className="generated-by-ai">Gerado por IA</div>}
                    <div className="event-details">
                      <p><strong>Dispositivo:</strong> {event.deviceName}</p>
                      <p><strong>Data de Criação:</strong> {event.created_at ? new Date(event.created_at).toLocaleString() : 'Data indisponível'}</p>
                      {event.measure !== undefined && event.measure !== null && (
                        <p><strong>Medição:</strong> {event.measure}</p>
                      )}
                    </div>
                  </div>

                  <button
                    className="delete-button"
                    onClick={() => handleDelete(event.alertMessage)}
                    aria-label="Deletar alerta"
                  >
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </div>
              ))}
            </div>
            
          </div>
        </div>
      </div>
    </>
  );
}

export default Events;
