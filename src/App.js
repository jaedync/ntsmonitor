// App.js
import React, { useState, useCallback, useEffect } from 'react';
import './App.css';
import DeviceCard from './components/DeviceCard';
import ModalContainer from './components/ModalContainer';
import LineChart from './components/LineChart';
import ApiKeyInput from './components/ApiKeyInput';
import useDevices from './hooks/useDevices';
import useBandwidth from './hooks/useBandwidth';
import useVerkadaCameras from './hooks/useVerkadaCameras';
import TopManufacturers from './components/TopManufacturers';
import TopDevices from './components/TopDevices';
import TopClients from './components/TopClients';
import ModelsChart from './components/ModelsChart';
import useVerkadaOccupancy from './hooks/useVerkadaOccupancy';
import OccupancyCard from './components/OccupancyCard';
import useTrafficAnalysis from './hooks/useTrafficAnalysis';
import TrafficAnalysisTable from './components/TrafficAnalysisTable';

let timeoutId;

function DeviceCountCard({ title, count }) { // New component for device count card
  return (
    <div className="device-count-card">
      <h2>{title}</h2>
      {count['online'] > 0 && <h2 className="online">Online: {count['online']}</h2>}
      {count['offline'] > 0 && <h2 className="offline">Offline: {count['offline']}</h2>}
      {count['dormant'] > 0 && <h2 className="dormant">Dormant: {count['dormant']}</h2>}
    </div>
  );
}
function App() {
  const [apiKey, setApiKey] = useState(localStorage.getItem('apiKey') || 'my-default-api-key');
  const [infoModalIsOpen, setInfoModalIsOpen] = useState(false);

  const { devices, statusCount } = useDevices(apiKey);
  const bandwidth = useBandwidth(apiKey);
  const verkadaCameras = useVerkadaCameras(apiKey);
  const verkadaOccupancy = useVerkadaOccupancy(apiKey);
  
  const trafficAnalysisData = useTrafficAnalysis(apiKey);

  const handleMouseMove = useCallback(() => {
    const infoButton = document.querySelector('.infoButton');
    infoButton.style.opacity = 1;

    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      infoButton.style.opacity = 0;
    }, 3000);
  }, []);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleMouseMove]);

  const toggleInfoModal = () => setInfoModalIsOpen(!infoModalIsOpen);

  const formatDataSize = (sizeInMBs) => {
    if (sizeInMBs < 1) {
      return `${(sizeInMBs * 1024 * 1024).toFixed(3)} Bytes`;
    } else if (sizeInMBs < 1024) {
      return `${sizeInMBs.toFixed(3)} MBs`;
    } else if (sizeInMBs < 1024 * 1024) {
      return `${(sizeInMBs / 1024).toFixed(3)} GBs`;
    } else if (sizeInMBs < 1024 * 1024 * 1024) {
      return `${(sizeInMBs / (1024 * 1024)).toFixed(3)} TBs`;
    } else {
      return `${(sizeInMBs / (1024 * 1024 * 1024)).toFixed(3)} PBs`;
    }
  };

  const offlineDevices = devices.filter(device => device.status === 'offline');
  const offlineCameras = verkadaCameras.filter(camera => camera.status === 'offline');

  const onlineDevices = devices.filter(device => device.status === 'online');
  const onlineCameras = verkadaCameras.filter(camera => camera.status === 'online');

  const dormantDevices = devices.filter(device => device.status === 'dormant');
  const dormantCameras = verkadaCameras.filter(camera => camera.status === 'dormant');

  const verkadaStatusCount = {
    offline: offlineCameras.length,
    online: onlineCameras.length,
  };

  const allDevices = [...offlineCameras, ...offlineDevices, ...onlineCameras, ...onlineDevices, ...dormantCameras, ...dormantDevices];


  return (
    <div className="App">
      <button onClick={toggleInfoModal} className="infoButton">i</button>
      <ModalContainer isOpen={infoModalIsOpen} toggleModal={toggleInfoModal}>
        <div className="info-card">
          <h4>Why This Exists</h4>
          <p>The official Meraki Dashboard didn't dynamically update! It was hard to know the real-time status of our devices. I found it especially frustrating when I discovered our status TV was several days behind. And, the user interface was too cluttered for our use.</p>
          <p>So, I decided to build a better solution.</p>
          <p>I created this status monitor using the Meraki API, a Flask backend, and a React frontend. It's simple, clean, and updates the status of our Meraki devices twice a minute. For added convenience, offline devices are listed at the top.</p>
          <p>Much better now!</p>
          <p className="author">- Jaedyn Chilton</p>
          <h1 className="email-container"><a href="mailto:mail@jaedynchilton.com" className="email-link">mail@jaedynchilton.com</a></h1>
        </div>
        <div className="info-card">
          <ApiKeyInput setApiKey={setApiKey} />
        </div>
      </ModalContainer>
      <aside className="sidebar">
        <div className="faint-card device-counts-card">
          <DeviceCountCard
            title="Meraki Networking"
            count={statusCount}
          />
          <DeviceCountCard
            title="Verkada Security"
            count={verkadaStatusCount}
          />
        </div>
        <TopDevices apiKey={apiKey} />
        <ModelsChart apiKey={apiKey} />
        <div className="card">
          <h1 className="bandwidth-amount">Total Bandwidth: {formatDataSize(bandwidth['total'] || 0)}</h1>
          <div className="chart-container-line">
            {bandwidth.chartData && <LineChart data={bandwidth.chartData} />}
          </div>
        </div>
        <TopClients apiKey={apiKey} />
        <TopManufacturers />
        <div className="faint-card">
          <h1 style={{ marginBottom: '1.2rem' }}>Verkada Persons Traffic</h1>

          {verkadaOccupancy.map((camera, index) => (
            <OccupancyCard key={index} camera={camera} />
          ))}
        </div>
        
        <TrafficAnalysisTable data={trafficAnalysisData} />
      </aside>
      <main className="content">
        <div className="dev-title-card">
          <h1>Network Services Status Monitor</h1>
        </div>
        <div className="devices-container">
          {allDevices.map((device) => (
            <DeviceCard key={device.name} device={device} status={device.status} />
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;
