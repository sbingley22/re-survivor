/* eslint-disable react/prop-types */
/* eslint-disable react/no-unknown-property */
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useMemo, useState } from "react";
import { Points, PointsMaterial, BufferGeometry, BufferAttribute, AdditiveBlending } from 'three';

const BloodSplatter = ({ position, color=0x772211 }) => { 
  const [initialized, setInitialized] = useState(false)
  const pointsRef = useRef();

  const particles = useMemo(() => {
    const geometry = new BufferGeometry();
    const material = new PointsMaterial({ color: color, size: 0.2, blending: AdditiveBlending, transparent: true });
    const points = new Points(geometry, material);
    
    const positions = new Float32Array(25 * 3);
    const spread = 0.3;
    for (let i = 0; i < positions.length; i += 3) {
      positions[i] = (Math.random() - 0.5) * spread
      positions[i + 1] = (Math.random() - 0.5) + 1
      positions[i + 2] = (Math.random() - 0.5) * spread
    }
    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    return points;
  }, [color]);

  useEffect(() => {
    pointsRef.current = particles;
    setInitialized(true)
  }, [particles]);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      const positions = pointsRef.current.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] -= delta; // Gravity effect
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group position={position}>
      {initialized && <primitive object={pointsRef.current} />}
    </group>
  );
}

export default BloodSplatter;
