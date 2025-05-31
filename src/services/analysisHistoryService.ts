import { AnalysisHistory, ProductAnalysis } from '../types';

/**
 * Сервис для работы с историей анализа товаров
 */
class AnalysisHistoryService {
  private analysisHistory: AnalysisHistory[] = [];
  private storageKey = 'ozon_price_optimizer_analysis_history';

  constructor() {
    this.loadFromLocalStorage();
  }

  /**
   * Загрузка истории анализа из localStorage
   */
  private loadFromLocalStorage(): void {
    try {
      const savedHistory = localStorage.getItem(this.storageKey);
      if (savedHistory) {
        this.analysisHistory = JSON.parse(savedHistory);
      }
    } catch (error) {
      console.error('Error loading analysis history from localStorage:', error);
      this.analysisHistory = [];
    }
  }

  /**
   * Сохранение истории анализа в localStorage
   */
  private saveToLocalStorage(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.analysisHistory));
    } catch (error) {
      console.error('Error saving analysis history to localStorage:', error);
    }
  }

  /**
   * Добавление нового анализа в историю
   * @param productId ID товара
   * @param analysis Результат анализа
   * @returns Созданная запись истории анализа
   */
  addAnalysis(productId: string, analysis: ProductAnalysis): AnalysisHistory | null {
    if (!analysis.success || !analysis.analysis) {
      return null;
    }

    // Извлекаем данные из анализа
    const recommendedPrice = analysis.recommendedPrice || 0;
    const minPrice = analysis.minPrice || 0;
    const competitorsCount = analysis.competitorsData?.count || 0;
    const avgCompetitorPrice = analysis.competitorsData?.avgPrice || 0;

    // Создаем новую запись истории
    const newHistoryEntry: AnalysisHistory = {
      id: `analysis_${Date.now()}`,
      productId,
      date: new Date().toISOString(),
      recommendedPrice,
      minPrice,
      competitorsCount,
      avgCompetitorPrice,
      analysis: analysis.analysis,
      appliedToProduct: false
    };

    // Добавляем запись в историю
    this.analysisHistory.push(newHistoryEntry);
    this.saveToLocalStorage();

    return newHistoryEntry;
  }

  /**
   * Получение истории анализа для товара
   * @param productId ID товара
   * @returns Массив записей истории анализа
   */
  getProductAnalysisHistory(productId: string): AnalysisHistory[] {
    return this.analysisHistory
      .filter(entry => entry.productId === productId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  /**
   * Получение всей истории анализа
   * @returns Массив всех записей истории анализа
   */
  getAllAnalysisHistory(): AnalysisHistory[] {
    return [...this.analysisHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  /**
   * Отметка анализа как примененного к товару
   * @param analysisId ID анализа
   * @returns Обновленная запись истории анализа или null, если запись не найдена
   */
  markAnalysisAsApplied(analysisId: string): AnalysisHistory | null {
    const index = this.analysisHistory.findIndex(entry => entry.id === analysisId);
    if (index === -1) {
      return null;
    }

    // Обновляем запись
    this.analysisHistory[index] = {
      ...this.analysisHistory[index],
      appliedToProduct: true,
      appliedDate: new Date().toISOString()
    };

    this.saveToLocalStorage();
    return this.analysisHistory[index];
  }

  /**
   * Удаление записи истории анализа
   * @param analysisId ID анализа
   * @returns true, если запись успешно удалена, иначе false
   */
  deleteAnalysis(analysisId: string): boolean {
    const initialLength = this.analysisHistory.length;
    this.analysisHistory = this.analysisHistory.filter(entry => entry.id !== analysisId);
    
    if (this.analysisHistory.length !== initialLength) {
      this.saveToLocalStorage();
      return true;
    }
    
    return false;
  }

  /**
   * Очистка всей истории анализа
   */
  clearAllHistory(): void {
    this.analysisHistory = [];
    this.saveToLocalStorage();
  }

  /**
   * Очистка истории анализа для конкретного товара
   * @param productId ID товара
   */
  clearProductHistory(productId: string): void {
    this.analysisHistory = this.analysisHistory.filter(entry => entry.productId !== productId);
    this.saveToLocalStorage();
  }
}

// Экспортируем синглтон
export const analysisHistoryService = new AnalysisHistoryService();
