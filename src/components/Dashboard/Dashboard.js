import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import axios from "axios";
import { Area } from "@antv/g2plot";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTemperatureHigh,
  faDroplet,
  faFlask,
  faVial,
  faWater,
} from "@fortawesome/free-solid-svg-icons";

import TopBar from "../TopBar/TopBar";
import Sidebar from "../SideBar/Sidebar";
import "./Dashboard.css";

function Dashboard() {
  const [sensorsData, setSensorsData] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [setLastUpdated] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  

// Memorize chartsConfig com useMemo
const chartsConfig = useMemo(
  () => [
    {
      title: "Temperatura (°C)",
      metrics: [{ field: "Temperature", name: "Temperatura", color: "#e67e22" }],
    },
    {
      title: "Umidade (%)",
      metrics: [{ field: "Humidity", name: "Umidade", color: "#2ecc71" }],
    },
    {
      title: "Níveis de Nitrogênio, Fósforo, Potássio (mg/kg)",
      metrics: [
        { field: "Nitrogen", name: "Nitrogênio", color: "#e74c3c" },
        { field: "Phosphorus", name: "Fósforo", color: "#2980b9" },
        { field: "Potassium", name: "Potássio", color: "#27ae60" },
      ],
    },
    {
      title: "pH",
      metrics: [{ field: "pH", name: "pH", color: "#8e44ad" }],
    },
    {
      title: "Condutividade (µS/cm)",
      metrics: [{ field: "Conductivity", name: "Condutividade", color: "#34495e" }],
    },
    {
      title: "Salinidade (mg/L)",
      metrics: [{ field: "Salinity", name: "Salinidade", color: "#f39c12" }],
    },
  ],
  []
);


  const chartRefs = useRef([]);
  const chartInstances = useRef([]);

  const fetchData = useCallback(async (deviceId) => {
    try {
      setLoading(true);
      setError(null);
  
      const params = {
        deviceId: deviceId,
        startDate: startDate ? new Date(`${startDate}T00:00:00`).getTime() : undefined,
        endDate: endDate ? new Date(`${endDate}T23:59:59`).getTime() : undefined,
      };
  
      const [dashboardResponse, historyResponse] = await Promise.all([
        axios.get("http://localhost:3001/dashboard", { params }),
        axios.get("http://localhost:3001/measures/history", { params }),
      ]);
  
      if (dashboardResponse.data.success && historyResponse.data.success) {
        setSensorsData(dashboardResponse.data.data);
        setHistoryData(historyResponse.data.data);
        setLastUpdated(new Date()); // Mantido aqui
      } else {
        setSensorsData({});
        setHistoryData([]);
        setLastUpdated(new Date()); // Mantido aqui
      }
    } catch (err) {
      console.error(err);
      setSensorsData({});
      setHistoryData([]);
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, setLastUpdated]);
  

  const initializeCharts = useCallback(() => {
    chartInstances.current.forEach((instance) => {
      if (instance) instance.destroy();
    });
    chartInstances.current = [];

    chartsConfig.forEach((chartConfig, index) => {
      const container = chartRefs.current[index];
      if (!container) return;

      const moment = require("moment-timezone");

      const chartData = chartConfig.metrics.flatMap((metric) =>
        historyData.map((item) => {
          const timestampMs = item.created_at_mili;
          const localCreatedAt = moment(timestampMs).tz("America/Sao_Paulo");

          return {
            date: localCreatedAt.toDate(),
            value: item[metric.field],
            type: metric.name,
          };
        })
      );

      if (chartData.length === 0) return;

      const area = new Area(container, {
        data: chartData,
        xField: "date",
        yField: "value",
        seriesField: "type",
        color: chartConfig.metrics.map((m) => m.color),
        xAxis: {
          type: "time",
          label: {
            formatter: (value) => moment(value).tz("America/Sao_Paulo").format("DD/MM/YYYY"),
          },
        },
        yAxis: {
          label: {
            formatter: (text) => `${Math.round(text)}`,
          },
        },
        tooltip: {
          shared: true,
          customContent: (title, items) => {
            const date = moment(title).tz("America/Sao_Paulo").format("DD/MM/YYYY");
            const tooltipItems = items
              .map((item) => `<span style="color:${item.color}">●</span> ${item.name}: ${item.value}<br/>`)
              .join("");
            return `<div style="padding:10px"><strong>${date}</strong><br/>${tooltipItems}</div>`;
          },
        },
        animation: true,
        smooth: true,
      });

      area.render();
      chartInstances.current[index] = area;
    });
  }, [chartsConfig, historyData]);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const devicesResponse = await axios.get("http://localhost:3001/devices");
        if (devicesResponse.data.success) {
          const devicesData = devicesResponse.data.data;
          setDevices(devicesData);
          if (devicesData.length > 0) {
            setSelectedDevice(devicesData[0].id);
          }
        } else {
          setError("Erro ao carregar dispositivos.");
        }
      } catch (err) {
        console.error(err);
        setError("Erro ao se conectar com o servidor.");
      }
    };
    fetchDevices();
  }, []);

  useEffect(() => {
    if (selectedDevice) {
      fetchData(selectedDevice);
    }
  }, [selectedDevice, startDate, endDate, fetchData]);

  useEffect(() => {
    if (historyData.length > 0) {
      initializeCharts();
    }
    return () => {
      chartInstances.current.forEach((instance) => {
        if (instance) instance.destroy();
      });
      chartInstances.current = [];
    };
  }, [historyData, initializeCharts]);

  if (loading) {
    return <div className="loading"><p>Carregando dados...</p></div>;
  }

  if (error) {
    return <div className="error"><p>{error}</p></div>;
  }

  return (
    <>
      <TopBar />
      <div className="dashboard">
        <Sidebar />
        <div className="main-content">
          <h1 className="filter-title">Filtros</h1>
          <hr className="title-divisor" />
          <div className="filter-container">
            <div className="device-selector">
              <label htmlFor="device-dropdown2" className="device-label">Dispositivo</label>
              <select
                id="device-dropdown2"
                value={selectedDevice}
                onChange={(e) => {
                  const selectedDeviceId = e.target.value;
                  setSelectedDevice(selectedDeviceId);
                }}
                className="device-dropdown2"
              >
                <option value="">Selecione um dispositivo</option>
                {devices.map((device) => (
                  <option key={device.id} value={device.id}>
                    {device.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="date-filter">
              <div className="date-input-container">
                <label htmlFor="start-date" className="device-label">Data de Início:</label>
                <input
                  type="date"
                  id="start-date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="date-input"
                />
              </div>
              <div className="date-input-container">
                <label htmlFor="end-date" className="device-label">Data de Fim:</label>
                <input
                  type="date"
                  id="end-date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="date-input"
                />
              </div>
              <button
                onClick={() => {
                  if (selectedDevice) {
                    fetchData(selectedDevice);
                  } 
                }}
                className="filter-button"
              >
                Filtrar
              </button>
            </div>
          </div>
          
          <hr className="title-divisor" />
          <br></br>
          <br></br>
          
          <h1 className="filter-title">Ultimas Medições do Solo</h1>
          <hr className="title-divisor" />
          <div className="stats-grid">
            {sensorsData && (
              <>
                {/* Card de Temperatura */}
                <div className="stat-card">
                  <h3 className="stat-title temperature-value">
                    <FontAwesomeIcon icon={faTemperatureHigh} className="stat-icon" /> Temperatura
                  </h3>
                  <div className="stat-values">
                    <span className="stat-value temperature-value">
                      {sensorsData.Temperature !== undefined
                        ? `${parseFloat(sensorsData.Temperature).toFixed(2)} °C`
                        : "--"}
                    </span>
                  </div>
                </div>

                {/* Card de Umidade */}
                <div className="stat-card">
                  <h3 className="stat-title humidity-value">
                    <FontAwesomeIcon icon={faDroplet} className="stat-icon" /> Umidade
                  </h3>
                  <div className="stat-values">
                    <span className="stat-value humidity-value">
                      {sensorsData.Humidity !== undefined
                        ? `${parseFloat(sensorsData.Humidity).toFixed(2)} %`
                        : "--"}
                    </span>
                  </div>
                </div>

                {/* Card de pH */}
                <div className="stat-card">
                  <h3 className="stat-title ph-value">
                    <FontAwesomeIcon icon={faFlask} className="stat-icon " /> PH
                  </h3>
                  <div className="stat-values">
                    <span className="stat-value ph-value">
                      {sensorsData.pH !== undefined ? parseFloat(sensorsData.pH).toFixed(2) : "--"}
                    </span>
                  </div>
                </div>

                {/* Card de NPK */}
                <div className="stat-card npk-card">
                  <h3 className="stat-title npk-title">
                    <FontAwesomeIcon icon={faVial} className="stat-icon nitrogen" /> 
                    <span className="npk-letter nitrogen">N</span>
                    <span className="npk-letter phosphorus">P</span>
                    <span className="npk-letter potassium">K</span>
                  </h3>
                  <div className="stat-values">
                    <div className="npk-item">
                      <span className="npk-label">N:</span>
                      <span className="npk-value">
                        {sensorsData.Nitrogen !== undefined
                          ? parseFloat(sensorsData.Nitrogen).toFixed(2)
                          : "--"}
                      </span>
                    </div>
                    <div className="npk-item">
                      <span className="npk-label">P:</span>
                      <span className="npk-value">
                        {sensorsData.Phosphorus !== undefined
                          ? parseFloat(sensorsData.Phosphorus).toFixed(2)
                          : "--"}
                      </span>
                    </div>
                    <div className="npk-item">
                      <span className="npk-label">K:</span>
                      <span className="npk-value">
                        {sensorsData.Potassium !== undefined
                          ? parseFloat(sensorsData.Potassium).toFixed(2)
                          : "--"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card de Salinidade */}
                <div className="stat-card">
                  <h3 className="stat-title salinity-value">
                    <FontAwesomeIcon icon={faWater} className="stat-icon" /> Salinidade
                  </h3>
                  <div className="stat-values">
                    <span className="stat-value salinity-value">
                      {sensorsData.Salinity !== undefined
                        ? `${parseFloat(sensorsData.Salinity).toFixed(2)} mg/L`
                        : "--"}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
          <hr className="title-divisor" />

          <div className="charts-grid">
            {chartsConfig.map((chartConfig, index) => (
              <div className="chart-container" key={index}>
                <h3 className="chart-title">{chartConfig.title}</h3>
                <div
                  ref={(el) => (chartRefs.current[index] = el)}
                  className="chart"
                ></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
