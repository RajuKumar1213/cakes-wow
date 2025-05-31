import { useState, useEffect } from 'react';
import axios from 'axios';

interface Category {
  _id: string;
  name: string;
  slug: string;
  group: string;
  type: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  sortOrder: number;
}

interface GroupedCategories {
  [group: string]: Category[];
}

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [groupedCategories, setGroupedCategories] = useState<GroupedCategories>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/categories');
        
        if (response.data.success) {
          // The API returns grouped categories by default
          const groupedData = response.data.data;
          setGroupedCategories(groupedData);
          
          // Create flat array of categories for other uses
          const flatCategories: Category[] = [];
          Object.keys(groupedData).forEach(group => {
            groupedData[group].forEach((category: any) => {
              flatCategories.push({
                ...category,
                group,
                isActive: true,
                sortOrder: 0,
              });
            });
          });
          
          setCategories(flatCategories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Failed to fetch categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return {
    categories,
    groupedCategories,
    loading,
    error,
  };
};
