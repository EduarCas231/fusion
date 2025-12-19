import React, { useEffect, useRef } from 'react';
import './Snowfall.css';

const Snowfall = () => {
  const snowfallRef = useRef(null);

  useEffect(() => {
    const createSnowflake = () => {
      const snowflake = document.createElement('div');
      snowflake.className = 'snowflake';
      snowflake.innerHTML = '❄';
      snowflake.style.left = Math.random() * 100 + '%';
      snowflake.style.animationDuration = Math.random() * 3 + 2 + 's';
      snowflake.style.opacity = Math.random();
      snowflake.style.fontSize = Math.random() * 10 + 10 + 'px';

      if (snowfallRef.current) {
        snowfallRef.current.appendChild(snowflake);
      }

      setTimeout(() => {
        if (snowflake.parentNode) {
          snowflake.parentNode.removeChild(snowflake);
        }
      }, 5000);
    };

    const interval = setInterval(createSnowflake, 300);

    return () => clearInterval(interval);
  }, []);

  return <div ref={snowfallRef} className="snowfall-container"></div>;
};

export default Snowfall;