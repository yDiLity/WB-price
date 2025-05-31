import { useEffect, useState } from 'react'
import { Text, TextProps } from '@chakra-ui/react'

interface TypedTextProps extends TextProps {
  strings: string[]
  typeSpeed?: number
  backSpeed?: number
  backDelay?: number
  loop?: boolean
  showCursor?: boolean
}

const TypedText = ({ 
  strings, 
  typeSpeed = 50, 
  backSpeed = 30, 
  backDelay = 1500,
  loop = true,
  showCursor = true,
  ...textProps 
}: TypedTextProps) => {
  const [displayText, setDisplayText] = useState('')
  const [currentStringIndex, setCurrentStringIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(true)
  const [showCursorState, setShowCursorState] = useState(true)

  useEffect(() => {
    let timeout: NodeJS.Timeout

    const currentString = strings[currentStringIndex]
    
    if (isTyping) {
      if (displayText.length < currentString.length) {
        timeout = setTimeout(() => {
          setDisplayText(currentString.slice(0, displayText.length + 1))
        }, typeSpeed)
      } else {
        timeout = setTimeout(() => {
          setIsTyping(false)
        }, backDelay)
      }
    } else {
      if (displayText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1))
        }, backSpeed)
      } else {
        setIsTyping(true)
        if (loop) {
          setCurrentStringIndex((prev) => (prev + 1) % strings.length)
        }
      }
    }

    return () => clearTimeout(timeout)
  }, [displayText, currentStringIndex, isTyping, strings, typeSpeed, backSpeed, backDelay, loop])

  // Cursor blinking effect
  useEffect(() => {
    if (!showCursor) return
    
    const cursorInterval = setInterval(() => {
      setShowCursorState(prev => !prev)
    }, 530)

    return () => clearInterval(cursorInterval)
  }, [showCursor])

  return (
    <Text {...textProps}>
      {displayText}
      {showCursor && (
        <Text 
          as="span" 
          opacity={showCursorState ? 1 : 0}
          transition="opacity 0.1s"
          color="purple.500"
          fontWeight="bold"
        >
          |
        </Text>
      )}
    </Text>
  )
}

export default TypedText
