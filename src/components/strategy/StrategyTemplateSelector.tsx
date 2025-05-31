import { useState } from 'react';
import {
  Box,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Heading,
  Text,
  Button,
  Badge,
  useColorModeValue,
  Flex,
  Icon,
  Tooltip
} from '@chakra-ui/react';
import { InfoIcon, CheckCircleIcon } from '@chakra-ui/icons';
import { StrategyTemplate, StrategyType } from '../../types/strategy';

// Иконки для разных типов стратегий (используем FontAwesome иконки)
const strategyTypeIcons = {
  [StrategyType.COMPETITOR_BASED]: '👥',
  [StrategyType.MARGIN_BASED]: '💰',
  [StrategyType.MARKET_POSITION]: '📊',
  [StrategyType.TIME_BASED]: '⏱️',
  [StrategyType.STOCK_BASED]: '📦',
  [StrategyType.CUSTOM]: '⚙️'
};

// Цвета для разных типов стратегий
const strategyTypeColors = {
  [StrategyType.COMPETITOR_BASED]: 'blue',
  [StrategyType.MARGIN_BASED]: 'green',
  [StrategyType.MARKET_POSITION]: 'purple',
  [StrategyType.TIME_BASED]: 'orange',
  [StrategyType.STOCK_BASED]: 'teal',
  [StrategyType.CUSTOM]: 'pink'
};

// Названия типов стратегий на русском
const strategyTypeNames = {
  [StrategyType.COMPETITOR_BASED]: 'На основе конкурентов',
  [StrategyType.MARGIN_BASED]: 'На основе маржи',
  [StrategyType.MARKET_POSITION]: 'Позиция на рынке',
  [StrategyType.TIME_BASED]: 'По времени',
  [StrategyType.STOCK_BASED]: 'По остаткам',
  [StrategyType.CUSTOM]: 'Пользовательская'
};

interface StrategyTemplateSelectorProps {
  templates: StrategyTemplate[];
  onSelectTemplate: (template: StrategyTemplate) => void;
}

export default function StrategyTemplateSelector({
  templates,
  onSelectTemplate
}: StrategyTemplateSelectorProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  // Цвета для светлой/темной темы
  const cardBg = useColorModeValue('white', 'gray.700');
  const cardBorderColor = useColorModeValue('gray.200', 'gray.600');
  const selectedCardBg = useColorModeValue('blue.50', 'blue.900');
  const selectedCardBorderColor = useColorModeValue('blue.300', 'blue.500');
  const badgeBg = useColorModeValue('gray.100', 'gray.600');

  // Обработчик выбора шаблона
  const handleSelectTemplate = (template: StrategyTemplate) => {
    setSelectedTemplateId(template.id);
    onSelectTemplate(template);
  };

  return (
    <Box>
      <Flex
        direction="column"
        align="center"
        mb={8}
        p={6}
        bg={useColorModeValue('blue.50', 'blue.900')}
        borderRadius="lg"
        boxShadow="sm"
      >
        <Heading size="lg" mb={2} textAlign="center">Выберите шаблон стратегии</Heading>
        <Text
          fontSize="md"
          color={useColorModeValue('gray.600', 'gray.300')}
          textAlign="center"
          maxW="700px"
        >
          Выберите один из готовых шаблонов или создайте свою стратегию ценообразования с нуля.
          Каждый шаблон можно настроить под ваши потребности на следующем шаге.
        </Text>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {templates.map((template) => (
          <Card
            key={template.id}
            bg={selectedTemplateId === template.id ? `${strategyTypeColors[template.type]}.50` : cardBg}
            borderWidth="2px"
            borderColor={selectedTemplateId === template.id
              ? `${strategyTypeColors[template.type]}.400`
              : cardBorderColor}
            borderRadius="xl"
            overflow="hidden"
            boxShadow={selectedTemplateId === template.id ? 'md' : 'sm'}
            transition="all 0.3s ease"
            _hover={{
              transform: 'translateY(-4px)',
              boxShadow: 'lg',
              borderColor: `${strategyTypeColors[template.type]}.400`
            }}
            onClick={() => handleSelectTemplate(template)}
            cursor="pointer"
            position="relative"
          >
            {/* Цветная полоса сверху карточки */}
            <Box
              position="absolute"
              top="0"
              left="0"
              right="0"
              height="6px"
              bg={`${strategyTypeColors[template.type]}.500`}
            />

            <CardHeader pb={2} pt={4}>
              <Flex justify="space-between" align="center">
                <Heading size="md">
                  <Flex align="center">
                    <Box
                      mr={3}
                      fontSize="xl"
                      bg={`${strategyTypeColors[template.type]}.100`}
                      color={`${strategyTypeColors[template.type]}.700`}
                      p={2}
                      borderRadius="md"
                    >
                      {strategyTypeIcons[template.type]}
                    </Box>
                    {template.name}
                  </Flex>
                </Heading>
                <Badge
                  colorScheme={strategyTypeColors[template.type]}
                  fontSize="xs"
                  px={2}
                  py={1}
                  borderRadius="full"
                  fontWeight="medium"
                >
                  {strategyTypeNames[template.type]}
                </Badge>
              </Flex>
            </CardHeader>

            <CardBody py={3}>
              <Text
                fontSize="sm"
                color={useColorModeValue('gray.600', 'gray.300')}
                minHeight="60px"
              >
                {template.description}
              </Text>
            </CardBody>

            <CardFooter
              pt={2}
              justifyContent="space-between"
              alignItems="center"
              borderTopWidth="1px"
              borderTopColor={useColorModeValue('gray.100', 'gray.700')}
              bg={useColorModeValue('gray.50', 'gray.800')}
            >
              <Button
                size="sm"
                colorScheme={strategyTypeColors[template.type]}
                variant={selectedTemplateId === template.id ? 'solid' : 'outline'}
                leftIcon={selectedTemplateId === template.id ? <CheckCircleIcon /> : undefined}
                fontWeight="medium"
              >
                {selectedTemplateId === template.id ? 'Выбрано' : 'Выбрать'}
              </Button>

              <Tooltip label="Количество параметров для настройки">
                <Flex
                  align="center"
                  bg={useColorModeValue(`${strategyTypeColors[template.type]}.50`, `${strategyTypeColors[template.type]}.900`)}
                  px={2}
                  py={1}
                  borderRadius="md"
                >
                  <InfoIcon
                    mr={1}
                    boxSize={3}
                    color={useColorModeValue(`${strategyTypeColors[template.type]}.600`, `${strategyTypeColors[template.type]}.200`)}
                  />
                  <Text
                    fontSize="xs"
                    fontWeight="medium"
                    color={useColorModeValue(`${strategyTypeColors[template.type]}.600`, `${strategyTypeColors[template.type]}.200`)}
                  >
                    {template.configurationFields.length} {template.configurationFields.length === 1 ? 'параметр' :
                     template.configurationFields.length > 1 && template.configurationFields.length < 5 ? 'параметра' : 'параметров'}
                  </Text>
                </Flex>
              </Tooltip>
            </CardFooter>
          </Card>
        ))}
      </SimpleGrid>
    </Box>
  );
}
