import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.css';


import Sidebar from '../SideBar/Sidebar';
import TopBar from '../TopBar/TopBar';
import './DeviceRegistration.css';

function DeviceRegistration() {
  const [devices, setDevices] = useState([]);
  const [currentDevice, setCurrentDevice] = useState(null);
  const [newDevice, setNewDevice] = useState('');
  const [newLat, setNewLat] = useState('');
  const [newLon, setNewLon] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem('user_id');
    setUserId(storedUserId);
  }, []);

  const fetchDevices = async () => {
    try {
      const response = await axios.get('http://localhost:3001/devices');
      setDevices(response.data.data);
    } catch (error) {
      console.error('Erro ao buscar dispositivos:', error);
    }
  };

  const handleAddDevice = async () => {
    try {
      if (newDevice.trim() && newLat.trim() && newLon.trim() && userId) {
        if (currentDevice) {
          await axios.put(`http://localhost:3001/devices/${currentDevice.id}`, {
            name: newDevice,
            lat: newLat,
            lon: newLon,
            user_id: userId,
          });
        } else {
          await axios.post('http://localhost:3001/devices', {
            name: newDevice,
            lat: newLat,
            lon: newLon,
            user_id: userId,
          });
        }
        setShowModal(false);
        fetchDevices();
      } else {
        alert('Todos os campos e o ID do usuário são obrigatórios.');
      }
    } catch (error) {
      console.error('Erro ao adicionar ou atualizar dispositivo:', error);
    }
  };

  const confirmDeleteDevice = (device) => {
    setCurrentDevice(device);
    setShowConfirmModal(true);
  };
  
  const handleDeleteDevice = async () => {
    try {
      if (currentDevice) {
        await axios.delete(`http://localhost:3001/devices/${currentDevice.id}`);
        fetchDevices();
        setShowConfirmModal(false);
        setCurrentDevice(null);
      }
    } catch (error) {
      console.error('Erro ao excluir dispositivo:', error);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  return (
    <>
      <TopBar />
      <div className="dashboard">
        <Sidebar />
        <div className="main-content p-4">
          <div className="container">
          <h1 className="filter-title">Cadastro de Dispositivos</h1>
            <hr className="title-divider" />
            <div className="card">
              <div className="card-body">
                <table className="table table-bordered custom-table">
                  <thead>
                    <tr>
                      
                      <th>Nome</th>
                      <th>Localização (Lat, Lon)</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {devices.map((device) => (
                      <tr key={device.id}>
                        
                        <td>{device.name}</td>
                        <td>
                          Lat: {device.lat}, Lon: {device.lon}
                        </td>
                        <td>
                          <Button
                            className="custom-btn-primary me-2"
                            size="sm"
                            onClick={() => {
                              setCurrentDevice(device);
                              setNewDevice(device.name);
                              setNewLat(device.lat);
                              setNewLon(device.lon);
                              setShowModal(true);
                            }}
                          >
                            <i className="fa fa-pencil-alt"></i>
                          </Button>
                          <Button
                            className="custom-btn-secondary"
                            size="sm"
                            onClick={() => confirmDeleteDevice(device)}
                          >
                            <i className="fa fa-trash"></i>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <Button
                  className="custom-btn-primary"
                  onClick={() => {
                    setCurrentDevice(null);
                    setNewDevice('');
                    setNewLat('');
                    setNewLon('');
                    setShowModal(true);
                  }}
                >
                  Adicionar Novo Dispositivo
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para adicionar ou editar dispositivo */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{currentDevice ? 'Editar Dispositivo' : 'Adicionar Novo Dispositivo'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="form-group mb-3">
            <label htmlFor="device-name" className="form-label">Nome do Dispositivo</label>
            <input
              type="text"
              id="device-name"
              className="form-control"
              placeholder="Digite o nome do dispositivo"
              value={newDevice}
              onChange={(e) => setNewDevice(e.target.value)}
            />
          </div>

          <div className="form-group mb-3">
            <label htmlFor="device-lat" className="form-label">Latitude</label>
            <input
              type="text"
              id="device-lat"
              className="form-control"
              placeholder="Digite a latitude"
              value={newLat}
              onChange={(e) => setNewLat(e.target.value)}
            />
          </div>

          <div className="form-group mb-3">
            <label htmlFor="device-lon" className="form-label">Longitude</label>
            <input
              type="text"
              id="device-lon"
              className="form-control"
              placeholder="Digite a longitude"
              value={newLon}
              onChange={(e) => setNewLon(e.target.value)}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button className="custom-btn-secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button className="custom-btn-primary" onClick={handleAddDevice}>
            {currentDevice ? 'Salvar Alterações' : 'Adicionar'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de confirmação para exclusão */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Exclusão</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Tem certeza de que deseja excluir o dispositivo <strong>{currentDevice?.name}</strong>?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button className="custom-btn-secondary" onClick={() => setShowConfirmModal(false)}>
            Cancelar
          </Button>
          <Button className="custom-btn-primary" onClick={handleDeleteDevice}>
            Excluir
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default DeviceRegistration;
