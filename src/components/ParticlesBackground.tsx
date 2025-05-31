import { useCallback } from 'react'
import Particles from 'react-particles'
import { loadStarsPreset } from 'tsparticles-preset-stars'
import type { Engine } from 'tsparticles-engine'
import { Box } from '@chakra-ui/react'

const ParticlesBackground = () => {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadStarsPreset(engine)
  }, [])

  return (
    <Box position="absolute" top="0" left="0" w="100%" h="100%" zIndex="0">
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          preset: 'stars',
          background: {
            opacity: 0,
          },
          particles: {
            number: {
              value: 100,
              density: {
                enable: true,
                value_area: 800,
              },
            },
            color: {
              value: ['#667eea', '#764ba2', '#f093fb', '#f5576c'],
            },
            shape: {
              type: 'circle',
            },
            opacity: {
              value: 0.6,
              random: true,
              anim: {
                enable: true,
                speed: 1,
                opacity_min: 0.1,
                sync: false,
              },
            },
            size: {
              value: 3,
              random: true,
              anim: {
                enable: true,
                speed: 2,
                size_min: 0.1,
                sync: false,
              },
            },
            line_linked: {
              enable: true,
              distance: 150,
              color: '#667eea',
              opacity: 0.2,
              width: 1,
            },
            move: {
              enable: true,
              speed: 1,
              direction: 'none',
              random: false,
              straight: false,
              out_mode: 'out',
              bounce: false,
              attract: {
                enable: false,
                rotateX: 600,
                rotateY: 1200,
              },
            },
          },
          interactivity: {
            detect_on: 'canvas',
            events: {
              onhover: {
                enable: true,
                mode: 'repulse',
              },
              onclick: {
                enable: true,
                mode: 'push',
              },
              resize: true,
            },
            modes: {
              grab: {
                distance: 400,
                line_linked: {
                  opacity: 1,
                },
              },
              bubble: {
                distance: 400,
                size: 40,
                duration: 2,
                opacity: 8,
                speed: 3,
              },
              repulse: {
                distance: 200,
                duration: 0.4,
              },
              push: {
                particles_nb: 4,
              },
              remove: {
                particles_nb: 2,
              },
            },
          },
          retina_detect: true,
        }}
      />
    </Box>
  )
}

export default ParticlesBackground
