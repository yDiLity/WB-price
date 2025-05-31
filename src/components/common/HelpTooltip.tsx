import React from 'react';
import {
  Tooltip,
  IconButton,
  Box,
  Text,
  VStack,
  List,
  ListItem,
  ListIcon,
  useColorModeValue
} from '@chakra-ui/react';
import { InfoIcon, CheckIcon } from '@chakra-ui/icons';

interface HelpTooltipProps {
  label: string;
  description?: string;
  steps?: string[];
  placement?: 'top' | 'bottom' | 'left' | 'right';
  hasArrow?: boolean;
  maxWidth?: string;
}

/**
 * Компонент для отображения подсказок с информацией
 */
const HelpTooltip: React.FC<HelpTooltipProps> = ({
  label,
  description,
  steps,
  placement = 'top',
  hasArrow = true,
  maxWidth = '300px'
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  return (
    <Tooltip
      label={
        <Box p={2}>
          <Text fontWeight="bold" mb={description || steps ? 2 : 0}>
            {label}
          </Text>
          
          {description && (
            <Text mb={steps ? 2 : 0}>{description}</Text>
          )}
          
          {steps && steps.length > 0 && (
            <List spacing={1}>
              {steps.map((step, index) => (
                <ListItem key={index} display="flex" alignItems="flex-start">
                  <ListIcon as={CheckIcon} color="green.500" mt={1} />
                  <Text>{step}</Text>
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      }
      placement={placement}
      hasArrow={hasArrow}
      bg={bgColor}
      color="inherit"
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="md"
      boxShadow="md"
      maxWidth={maxWidth}
    >
      <IconButton
        icon={<InfoIcon />}
        aria-label="Подсказка"
        size="xs"
        variant="ghost"
        colorScheme="blue"
      />
    </Tooltip>
  );
};

export default HelpTooltip;
