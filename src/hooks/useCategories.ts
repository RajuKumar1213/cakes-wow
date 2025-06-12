
import useSWR from 'swr';

const fetcher = (...args: [RequestInfo, RequestInit?]) => fetch(...args).then(res => res.json())

export const useCategories = () => {
  
  const {data, error, isLoading} = useSWR('/api/categories', fetcher);

  return {
    categories: data || [],
    groupedCategories: data || {},
    loading: isLoading,
    error,
  };
};
