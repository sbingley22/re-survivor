/* eslint-disable react/prop-types */
import { useCallback, useState } from "react";
import BloodSplatter from "./BloodSplatter";
import { useFrame } from "@react-three/fiber";

const BloodManager = ({ splatterFlag }) => {
  const [splatters, setSplatters] = useState([]);

  const addSplatter = useCallback((position, color) => {
    const id = Date.now();
    setSplatters((s) => [...s, { id, position, color }]);
    setTimeout(() => setSplatters((s) => s.filter((splatter) => splatter.id !== id)), 400);
  }, []);
  
  useFrame(() => {
    if (splatterFlag.current) {
      const pos = [
        splatterFlag.current.pos.x,
        splatterFlag.current.pos.y,
        splatterFlag.current.pos.z,
      ];
      let col = 0x772211
      if (splatterFlag.current.color) col = splatterFlag.current.color

      addSplatter(pos, col);
      splatterFlag.current = null;
    }
  });

  return (
    <>
      {splatters.map((splatter) => (
        <BloodSplatter 
          key={splatter.id} 
          position={splatter.position} 
          color={splatter.color}
        />
      ))}
    </>
  );
}

export default BloodManager;
