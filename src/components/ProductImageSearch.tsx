import { useState, useEffect } from 'react';
import { searchImages, ImageSearchResult } from '../services/imageSearchService';

interface ProductImageSearchProps {
  productName: string;
  onSelectImage: (imageUrl: string) => void;
}

export default function ProductImageSearch({ productName, onSelectImage }: ProductImageSearchProps) {
  const [images, setImages] = useState<ImageSearchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (productName) {
      fetchImages(productName);
    }
  }, [productName]);

  const fetchImages = async (query: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const results = await searchImages({ query, maxResults: 10 });
      setImages(results);
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка при поиске изображений');
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-image-search">
      <h3 className="text-lg font-medium mb-2">Изображения для: {productName}</h3>
      
      {loading && <p className="text-gray-500">Загрузка изображений...</p>}
      {error && <p className="text-red-500">Ошибка: {error}</p>}
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-4">
        {images.map((image, index) => (
          <div 
            key={index} 
            className="image-item cursor-pointer border rounded-md overflow-hidden hover:shadow-md transition-shadow"
            onClick={() => onSelectImage(image.url)}
          >
            <img 
              src={image.thumbnail || image.url} 
              alt={image.title} 
              className="w-full h-32 object-cover"
            />
            <div className="p-2 text-xs truncate">{image.title}</div>
          </div>
        ))}
      </div>
      
      {images.length === 0 && !loading && !error && (
        <p className="text-gray-500 mt-4">Изображения не найдены. Попробуйте другой запрос.</p>
      )}
    </div>
  );
}
