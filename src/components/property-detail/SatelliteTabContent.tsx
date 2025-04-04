
import React from 'react';

interface SatelliteTabContentProps {
  latitude: number;
  longitude: number;
}

const SatelliteTabContent: React.FC<SatelliteTabContentProps> = ({
  latitude,
  longitude
}) => {
  return (
    <div className="h-[400px] relative">
      <iframe 
        title="Satellite View"
        width="100%"
        height="100%"
        frameBorder="0"
        style={{ border: 0 }}
        src={`https://www.google.com/maps/embed/v1/view?key=AIzaSyCqG_rXoFfwIRg8eoCV_joDHYk8ZrkpOsg&center=${latitude},${longitude}&zoom=18&maptype=satellite`}
        allowFullScreen
      />
    </div>
  );
};

export default SatelliteTabContent;
