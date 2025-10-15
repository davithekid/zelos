"use client";

import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

export default function ParticlesFundo() {
  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      className="h-full w-full"
      options={{
        fullScreen: { enable: false },
        background: {
          color: {
            value: "transparent" 
          },
        },

        particles: {
          number: { value: 70, density: { enable: true, area: 1000, }, },
          color: { value: "#ffffff", },
          shape: { type: "circle", },
          opacity: { value: 0.5, },
          size: { value: 3, random: true, },
          links: {
            enable: true,
            distance: 130,
            color: "#ffffff",
            opacity: 0.6,
            width: 1.2,
            triangles: {
              enable: true,
              color: "#ffffff",
              opacity: 0.07,
            },
          },
          move: {
            enable: true,
            speed: 1.2,
            direction: "none",
            outModes: "bounce",
          },
        },
        interactivity: {
          events: {
            onHover: { enable: false, },
            resize: true,
          },
        },
        detectRetina: true,
      }}
    />
  );
}