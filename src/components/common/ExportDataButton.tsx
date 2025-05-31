import React, { useState } from 'react';
import {
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Icon,
  useToast,
  useColorModeValue
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { FaFileExport, FaFileCsv, FaFileExcel, FaFilePdf, FaFileCode } from 'react-icons/fa';

interface ExportDataButtonProps {
  data: any[];
  filename?: string;
  buttonText?: string;
  onExport?: (format: string, data: any[]) => void;
}

/**
 * Компонент кнопки для экспорта данных в различные форматы
 */
const ExportDataButton: React.FC<ExportDataButtonProps> = ({
  data,
  filename = 'export',
  buttonText = 'Экспорт',
  onExport
}) => {
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const toast = useToast();
  
  // Цвета для светлой/темной темы
  const menuBg = useColorModeValue('white', 'gray.800');
  const menuBorderColor = useColorModeValue('gray.200', 'gray.600');
  
  // Функция для экспорта данных в CSV
  const exportToCSV = () => {
    try {
      setIsExporting(true);
      
      // Получаем заголовки (ключи первого объекта)
      const headers = Object.keys(data[0] || {});
      
      // Создаем строку заголовков
      let csvContent = headers.join(',') + '\n';
      
      // Добавляем строки данных
      data.forEach(item => {
        const row = headers.map(header => {
          // Получаем значение для текущего заголовка
          let value = item[header];
          
          // Обрабатываем различные типы данных
          if (value === null || value === undefined) {
            return '';
          } else if (typeof value === 'object') {
            if (value instanceof Date) {
              return value.toISOString();
            } else {
              return JSON.stringify(value).replace(/"/g, '""');
            }
          } else {
            // Экранируем кавычки и оборачиваем в кавычки, если есть запятые
            value = String(value).replace(/"/g, '""');
            return value.includes(',') ? `"${value}"` : value;
          }
        });
        
        csvContent += row.join(',') + '\n';
      });
      
      // Создаем Blob и ссылку для скачивания
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Показываем уведомление об успешном экспорте
      toast({
        title: 'Экспорт выполнен',
        description: `Данные успешно экспортированы в формате CSV`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Вызываем пользовательский обработчик, если он предоставлен
      if (onExport) {
        onExport('csv', data);
      }
    } catch (error) {
      console.error('Ошибка при экспорте в CSV:', error);
      
      toast({
        title: 'Ошибка экспорта',
        description: 'Не удалось экспортировать данные в формате CSV',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsExporting(false);
    }
  };
  
  // Функция для экспорта данных в JSON
  const exportToJSON = () => {
    try {
      setIsExporting(true);
      
      // Преобразуем данные в строку JSON
      const jsonContent = JSON.stringify(data, null, 2);
      
      // Создаем Blob и ссылку для скачивания
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Показываем уведомление об успешном экспорте
      toast({
        title: 'Экспорт выполнен',
        description: `Данные успешно экспортированы в формате JSON`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Вызываем пользовательский обработчик, если он предоставлен
      if (onExport) {
        onExport('json', data);
      }
    } catch (error) {
      console.error('Ошибка при экспорте в JSON:', error);
      
      toast({
        title: 'Ошибка экспорта',
        description: 'Не удалось экспортировать данные в формате JSON',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsExporting(false);
    }
  };
  
  // Функция для экспорта данных в Excel (заглушка)
  const exportToExcel = () => {
    toast({
      title: 'Функция в разработке',
      description: 'Экспорт в Excel будет доступен в ближайшее время',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
    
    if (onExport) {
      onExport('excel', data);
    }
  };
  
  // Функция для экспорта данных в PDF (заглушка)
  const exportToPDF = () => {
    toast({
      title: 'Функция в разработке',
      description: 'Экспорт в PDF будет доступен в ближайшее время',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
    
    if (onExport) {
      onExport('pdf', data);
    }
  };
  
  return (
    <Menu>
      <MenuButton
        as={Button}
        rightIcon={<ChevronDownIcon />}
        leftIcon={<Icon as={FaFileExport} />}
        isLoading={isExporting}
        loadingText="Экспорт..."
        isDisabled={data.length === 0}
        colorScheme="blue"
        variant="outline"
      >
        {buttonText}
      </MenuButton>
      <MenuList bg={menuBg} borderColor={menuBorderColor}>
        <MenuItem 
          icon={<Icon as={FaFileCsv} />} 
          onClick={exportToCSV}
          isDisabled={isExporting || data.length === 0}
        >
          Экспорт в CSV
        </MenuItem>
        <MenuItem 
          icon={<Icon as={FaFileCode} />} 
          onClick={exportToJSON}
          isDisabled={isExporting || data.length === 0}
        >
          Экспорт в JSON
        </MenuItem>
        <MenuItem 
          icon={<Icon as={FaFileExcel} />} 
          onClick={exportToExcel}
          isDisabled={isExporting || data.length === 0}
        >
          Экспорт в Excel
        </MenuItem>
        <MenuItem 
          icon={<Icon as={FaFilePdf} />} 
          onClick={exportToPDF}
          isDisabled={isExporting || data.length === 0}
        >
          Экспорт в PDF
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

export default ExportDataButton;
