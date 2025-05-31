import { ReactNode, useRef } from 'react'
import { Box, BoxProps } from '@chakra-ui/react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

interface TiltCardProps extends BoxProps {
  children: ReactNode
  tiltMaxAngleX?: number
  tiltMaxAngleY?: number
  perspective?: number
  scale?: number
  transitionEasing?: string
  transitionSpeed?: number
  glareEnable?: boolean
  glareMaxOpacity?: number
  glareColor?: string
  glarePosition?: string
  glareBorderRadius?: string
}

const MotionBox = motion(Box)

const TiltCard = ({
  children,
  tiltMaxAngleX = 20,
  tiltMaxAngleY = 20,
  perspective = 1000,
  scale = 1.05,
  transitionEasing = 'cubic-bezier(.03,.98,.52,.99)',
  transitionSpeed = 400,
  glareEnable = true,
  glareMaxOpacity = 0.7,
  glareColor = '#ffffff',
  glarePosition = 'bottom',
  glareBorderRadius = '0',
  ...boxProps
}: TiltCardProps) => {
  const ref = useRef<HTMLDivElement>(null)

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const mouseXSpring = useSpring(x)
  const mouseYSpring = useSpring(y)

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [`${tiltMaxAngleX}deg`, `-${tiltMaxAngleX}deg`])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [`-${tiltMaxAngleY}deg`, `${tiltMaxAngleY}deg`])

  const diagonalMovement = useTransform<number, number>(
    [mouseXSpring, mouseYSpring],
    ([newX, newY]) => {
      const position = Math.sqrt(newX * newX + newY * newY)
      return position
    }
  )

  const sheenPosition = useTransform(diagonalMovement, [-0.5, 0.5], [-40, 40])
  const sheenOpacity = useTransform(diagonalMovement, [-0.5, 0.5], [0, glareMaxOpacity])
  const sheenGradient = useTransform(
    sheenPosition,
    (pos) => `linear-gradient(55deg, transparent ${pos - 10}%, ${glareColor} ${pos}%, transparent ${pos + 10}%)`
  )

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return

    const rect = ref.current.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const mouseX = (e.clientX - rect.left) / width - 0.5
    const mouseY = (e.clientY - rect.top) / height - 0.5

    x.set(mouseX)
    y.set(mouseY)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <MotionBox
      ref={ref}
      style={{
        rotateY,
        rotateX,
        transformStyle: 'preserve-3d',
        perspective,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale }}
      transition={{
        type: 'spring',
        stiffness: 150,
        damping: 15,
        mass: 0.1,
      }}
      position="relative"
      overflow="hidden"
      {...boxProps}
    >
      {children}
      
      {glareEnable && (
        <MotionBox
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          background={sheenGradient}
          opacity={sheenOpacity}
          borderRadius={glareBorderRadius}
          pointerEvents="none"
          style={{
            mixBlendMode: 'overlay',
          }}
        />
      )}
    </MotionBox>
  )
}

export default TiltCard
