import { useState, useEffect } from 'react';

export interface AddOn {
  _id: string;
  name: string;
  price: number;
  image: string;
  rating: number;
  createdAt?: string;
  updatedAt?: string;
}

export function useAddOns() {
  const [addOns, setAddOns] = useState<AddOn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAddOns = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/addons');
      const data = await response.json();

      if (data.success) {
        setAddOns(data.data);
        setError(null);
      } else {
        setError(data.message || 'Failed to fetch add-ons');
      }
    } catch (err) {
      setError('Network error while fetching add-ons');
      console.error('Error fetching add-ons:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAddOnById = async (id: string) => {
    try {
      const response = await fetch(`/api/addons?id=${id}`);
      const data = await response.json();

      if (data.success) {
        return { success: true, data: data.data };
      } else {
        throw new Error(data.message || 'Failed to fetch add-on');
      }
    } catch (err: any) {
      console.error('Error fetching add-on:', err);
      throw new Error(err.message || 'Network error while fetching add-on');
    }
  };

  const createAddOn = async (addOnData: Omit<AddOn, '_id' | 'createdAt' | 'updatedAt'> | FormData) => {
    try {
      const isFormData = addOnData instanceof FormData;
      
      const response = await fetch('/api/addons', {
        method: 'POST',
        ...(isFormData ? {} : {
          headers: {
            'Content-Type': 'application/json',
          },
        }),
        body: isFormData ? addOnData : JSON.stringify(addOnData),
      });

      const data = await response.json();

      if (data.success) {
        await fetchAddOns(); // Refresh the list
        return { success: true, data: data.data };
      } else {
        throw new Error(data.message || 'Failed to create add-on');
      }
    } catch (err: any) {
      console.error('Error creating add-on:', err);
      throw new Error(err.message || 'Network error while creating add-on');
    }
  };

  const updateAddOn = async (id: string, addOnData: Partial<Omit<AddOn, '_id' | 'createdAt' | 'updatedAt'>> | FormData) => {
    try {
      const isFormData = addOnData instanceof FormData;
      
      const response = await fetch(`/api/addons?id=${id}`, {
        method: 'PUT',
        ...(isFormData ? {} : {
          headers: {
            'Content-Type': 'application/json',
          },
        }),
        body: isFormData ? addOnData : JSON.stringify(addOnData),
      });

      const data = await response.json();

      if (data.success) {
        await fetchAddOns(); // Refresh the list
        return { success: true, data: data.data };
      } else {
        throw new Error(data.message || 'Failed to update add-on');
      }
    } catch (err: any) {
      console.error('Error updating add-on:', err);
      throw new Error(err.message || 'Network error while updating add-on');
    }
  };

  const deleteAddOn = async (id: string) => {
    try {
      const response = await fetch(`/api/addons?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        await fetchAddOns(); // Refresh the list
        return { success: true };
      } else {
        throw new Error(data.message || 'Failed to delete add-on');
      }
    } catch (err: any) {
      console.error('Error deleting add-on:', err);
      throw new Error(err.message || 'Network error while deleting add-on');
    }
  };

  const seedAddOns = async () => {
    try {
      const response = await fetch('/api/addons/seed', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        await fetchAddOns(); // Refresh the list
        return { success: true, data: data.data };
      } else {
        throw new Error(data.message || 'Failed to seed add-ons');
      }
    } catch (err: any) {
      console.error('Error seeding add-ons:', err);
      throw new Error(err.message || 'Network error while seeding add-ons');
    }
  };

  useEffect(() => {
    fetchAddOns();
  }, []);

  return {
    addOns,
    loading,
    error,
    refetch: fetchAddOns,
    fetchAddOnById,
    createAddOn,
    updateAddOn,
    deleteAddOn,
    seedAddOns,
  };
}
