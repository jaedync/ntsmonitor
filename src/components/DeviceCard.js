import React, { useState, useEffect } from 'react';

function timeSinceLastSeen(lastSeenUnixTime) {
  const secondsAgo = Math.floor(Date.now() / 1000 - lastSeenUnixTime);

  // If more than 24 hours, return in MM/DD/YYYY HH:mm format
  if (secondsAgo >= 24 * 3600) {
    const date = new Date(lastSeenUnixTime * 1000);
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    const timeString = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    return `${month}/${day}/${year} ${timeString}`;
  }

  let remainder = secondsAgo;

  const hours = Math.floor(remainder / 3600);
  remainder %= 3600;

  const minutes = Math.floor(remainder / 60);
  remainder %= 60;

  const seconds = remainder;

  return `${hours > 0 ? hours + (hours === 1 ? ' hour ' : ' hours ') : ''}${minutes > 0 ? minutes + (minutes === 1 ? ' minute ' : ' minutes ') : ''}${seconds > 0 ? seconds + (seconds === 1 ? ' second ago' : ' seconds ago') : ''}`.trim();
}


function DeviceCard({ device, status }) {
  const [lastSeen, setLastSeen] = useState(timeSinceLastSeen(device.lastSeen));

  useEffect(() => {
    const timer = setInterval(() => {
      setLastSeen(timeSinceLastSeen(device.lastSeen));
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [device.lastSeen]);

  return (
    <article className={`${status}-card`}>
      <div className="device-type-icon">
        {device.productType === 'wireless' && <img src="/wireless.svg" alt="Wireless" />}
        {device.productType === 'switch' && <img src="/switch.svg" alt="Switch" />}
        {device.productType === 'camera' && <img src="/camera.svg" alt="Camera" />}
      </div>
      <h2>{device.name}</h2>
      <p>MAC Address: {device.mac}</p>
      <p>Serial: {device.serial}</p>
      <p>IP Address: {device.local_ip || device.lanIp}</p>
      <p>Model: {device.model}</p>
      {device.productType === 'camera' ? (
        <>
          {device.date_added && <p>Date Added: {timeSinceLastSeen(device.date_added)}</p>}
          {device.firmware && <p>{device.firmware}</p>}
        </>
      ) : (
        <>
          {device.publicIp && <p>Public: {device.publicIp}</p>}
        </>
      )}
      <p>Last Seen: {lastSeen}</p>
    </article>
  );
}

export default DeviceCard;
