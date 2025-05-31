import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// Интерфейс для данных Excel
export interface ExcelProductData {
  'ID товара': string;
  'Название товара': string;
  'Категория': string;
  'Наша цена': number;
  'Изменение цены': string;
  'Конкуренты': string;
  'Мин. цена конкурентов': number;
  'Макс. цена конкурентов': number;
  'Средняя цена': number;
  'Позиция': string;
  'Стратегия': string;
  'Статус мониторинга': string;
  'Алерты': number;
  'Последнее обновление': string;
}

// Интерфейс для листа конкурентов
export interface ExcelCompetitorData {
  'ID товара': string;
  'Название товара': string;
  'ID конкурента': string;
  'Название конкурента': string;
  'Цена конкурента': number;
  'Изменение цены': string;
  'URL конкурента': string;
  'Статус': string;
  'Дата добавления': string;
  'Последнее обновление': string;
}

// Интерфейс для листа изменений цен
export interface ExcelPriceChangeData {
  'Дата и время': string;
  'ID товара': string;
  'Название товара': string;
  'Старая цена': number;
  'Новая цена': number;
  'Изменение': string;
  'Процент изменения': string;
  'Причина': string;
  'Источник': string;
}

export class ExcelService {
  private static instance: ExcelService;

  private constructor() {}

  public static getInstance(): ExcelService {
    if (!ExcelService.instance) {
      ExcelService.instance = new ExcelService();
    }
    return ExcelService.instance;
  }

  // Создание Excel файла с несколькими листами
  public createExcelFile(
    productsData: ExcelProductData[],
    competitorsData: ExcelCompetitorData[],
    priceChangesData: ExcelPriceChangeData[],
    filename?: string
  ): void {
    try {
      // Создаем новую рабочую книгу
      const workbook = XLSX.utils.book_new();

      // Лист 1: Основные данные товаров
      const productsSheet = XLSX.utils.json_to_sheet(productsData);
      this.formatProductsSheet(productsSheet);
      XLSX.utils.book_append_sheet(workbook, productsSheet, 'Товары');

      // Лист 2: Конкуренты
      const competitorsSheet = XLSX.utils.json_to_sheet(competitorsData);
      this.formatCompetitorsSheet(competitorsSheet);
      XLSX.utils.book_append_sheet(workbook, competitorsSheet, 'Конкуренты');

      // Лист 3: История изменений цен
      const priceChangesSheet = XLSX.utils.json_to_sheet(priceChangesData);
      this.formatPriceChangesSheet(priceChangesSheet);
      XLSX.utils.book_append_sheet(workbook, priceChangesSheet, 'История цен');

      // Лист 4: Сводка и статистика
      const summaryData = this.generateSummaryData(productsData, competitorsData, priceChangesData);
      const summarySheet = XLSX.utils.json_to_sheet(summaryData);
      this.formatSummarySheet(summarySheet);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Сводка');

      // Генерируем имя файла
      const defaultFilename = `ozon_tracking_${new Date().toISOString().split('T')[0]}.xlsx`;
      const finalFilename = filename || defaultFilename;

      // Сохраняем файл
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, finalFilename);

      console.log(`Excel файл "${finalFilename}" успешно создан`);
    } catch (error) {
      console.error('Ошибка создания Excel файла:', error);
      throw new Error('Не удалось создать Excel файл');
    }
  }

  // Форматирование листа товаров
  private formatProductsSheet(sheet: XLSX.WorkSheet): void {
    // Устанавливаем ширину колонок
    const columnWidths = [
      { wch: 15 }, // ID товара
      { wch: 40 }, // Название товара
      { wch: 15 }, // Категория
      { wch: 12 }, // Наша цена
      { wch: 20 }, // Изменение цены
      { wch: 50 }, // Конкуренты
      { wch: 15 }, // Мин. цена
      { wch: 15 }, // Макс. цена
      { wch: 15 }, // Средняя цена
      { wch: 12 }, // Позиция
      { wch: 20 }, // Стратегия
      { wch: 18 }, // Статус
      { wch: 10 }, // Алерты
      { wch: 20 }  // Последнее обновление
    ];
    sheet['!cols'] = columnWidths;

    // Замораживаем первую строку (заголовки)
    sheet['!freeze'] = { xSplit: 0, ySplit: 1 };
  }

  // Форматирование листа конкурентов
  private formatCompetitorsSheet(sheet: XLSX.WorkSheet): void {
    const columnWidths = [
      { wch: 15 }, // ID товара
      { wch: 30 }, // Название товара
      { wch: 15 }, // ID конкурента
      { wch: 30 }, // Название конкурента
      { wch: 12 }, // Цена конкурента
      { wch: 15 }, // Изменение цены
      { wch: 40 }, // URL конкурента
      { wch: 12 }, // Статус
      { wch: 18 }, // Дата добавления
      { wch: 18 }  // Последнее обновление
    ];
    sheet['!cols'] = columnWidths;
    sheet['!freeze'] = { xSplit: 0, ySplit: 1 };
  }

  // Форматирование листа изменений цен
  private formatPriceChangesSheet(sheet: XLSX.WorkSheet): void {
    const columnWidths = [
      { wch: 18 }, // Дата и время
      { wch: 15 }, // ID товара
      { wch: 30 }, // Название товара
      { wch: 12 }, // Старая цена
      { wch: 12 }, // Новая цена
      { wch: 15 }, // Изменение
      { wch: 15 }, // Процент изменения
      { wch: 25 }, // Причина
      { wch: 20 }  // Источник
    ];
    sheet['!cols'] = columnWidths;
    sheet['!freeze'] = { xSplit: 0, ySplit: 1 };
  }

  // Форматирование листа сводки
  private formatSummarySheet(sheet: XLSX.WorkSheet): void {
    const columnWidths = [
      { wch: 30 }, // Показатель
      { wch: 20 }  // Значение
    ];
    sheet['!cols'] = columnWidths;
  }

  // Генерация данных для сводки
  private generateSummaryData(
    productsData: ExcelProductData[],
    competitorsData: ExcelCompetitorData[],
    priceChangesData: ExcelPriceChangeData[]
  ): Array<{ 'Показатель': string; 'Значение': string | number }> {
    const totalProducts = productsData.length;
    const totalCompetitors = competitorsData.length;
    const totalPriceChanges = priceChangesData.length;
    
    const activeProducts = productsData.filter(p => p['Статус мониторинга'] === 'Активен').length;
    const productsWithAlerts = productsData.filter(p => p['Алерты'] > 0).length;
    const bestPriceProducts = productsData.filter(p => p['Позиция'] === 'Лучшая').length;

    const avgPrice = productsData.reduce((sum, p) => sum + p['Наша цена'], 0) / totalProducts;
    const avgCompetitorPrice = productsData.reduce((sum, p) => sum + p['Средняя цена'], 0) / totalProducts;

    return [
      { 'Показатель': 'Дата создания отчета', 'Значение': new Date().toLocaleString('ru-RU') },
      { 'Показатель': '', 'Значение': '' },
      { 'Показатель': '=== ОБЩАЯ СТАТИСТИКА ===', 'Значение': '' },
      { 'Показатель': 'Всего товаров в отслеживании', 'Значение': totalProducts },
      { 'Показатель': 'Активный мониторинг', 'Значение': activeProducts },
      { 'Показатель': 'Товары с алертами', 'Значение': productsWithAlerts },
      { 'Показатель': 'Товары с лучшей ценой', 'Значение': bestPriceProducts },
      { 'Показатель': '', 'Значение': '' },
      { 'Показатель': '=== КОНКУРЕНТЫ ===', 'Значение': '' },
      { 'Показатель': 'Всего конкурентов', 'Значение': totalCompetitors },
      { 'Показатель': 'Среднее количество конкурентов на товар', 'Значение': Math.round(totalCompetitors / totalProducts * 10) / 10 },
      { 'Показатель': '', 'Значение': '' },
      { 'Показатель': '=== ЦЕНЫ ===', 'Значение': '' },
      { 'Показатель': 'Средняя цена наших товаров', 'Значение': Math.round(avgPrice) },
      { 'Показатель': 'Средняя цена конкурентов', 'Значение': Math.round(avgCompetitorPrice) },
      { 'Показатель': 'Разница в ценах', 'Значение': Math.round(avgPrice - avgCompetitorPrice) },
      { 'Показатель': '', 'Значение': '' },
      { 'Показатель': '=== АКТИВНОСТЬ ===', 'Значение': '' },
      { 'Показатель': 'Изменений цен за период', 'Значение': totalPriceChanges },
      { 'Показатель': 'Среднее изменений на товар', 'Значение': Math.round(totalPriceChanges / totalProducts * 10) / 10 }
    ];
  }

  // Автоматическое создание Excel файла при изменениях
  public scheduleAutoExport(
    dataProvider: () => {
      products: ExcelProductData[];
      competitors: ExcelCompetitorData[];
      priceChanges: ExcelPriceChangeData[];
    },
    intervalMinutes: number = 30
  ): () => void {
    const intervalId = setInterval(() => {
      try {
        const data = dataProvider();
        if (data.products.length > 0) {
          const filename = `auto_export_${new Date().toISOString().replace(/[:.]/g, '-')}.xlsx`;
          this.createExcelFile(data.products, data.competitors, data.priceChanges, filename);
          console.log(`Автоматический экспорт выполнен: ${filename}`);
        }
      } catch (error) {
        console.error('Ошибка автоматического экспорта:', error);
      }
    }, intervalMinutes * 60 * 1000);

    // Возвращаем функцию для остановки автоэкспорта
    return () => {
      clearInterval(intervalId);
      console.log('Автоматический экспорт остановлен');
    };
  }
}

// Экспортируем singleton instance
export const excelService = ExcelService.getInstance();
