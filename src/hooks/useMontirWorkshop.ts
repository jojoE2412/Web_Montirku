// hooks/useMontirWorkshop.ts - COMPLETE FIXED VERSION
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { workshopService } from '../services/workshop.service';
import type { Workshop } from '../types';
import type { CreateWorkshopData, UpdateWorkshopData } from '../services/workshop.service';

export const useMontirWorkshop = () => {
  const { user } = useAuth();
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  // ✅ COMPLETE API RESPONSE HANDLER
  const extractWorkshopsFromResponse = (response: any): Workshop[] => {
    console.log('Raw API Response:', response); // Untuk debugging
    
    // Case 1: Response langsung array Workshop[]
    if (Array.isArray(response)) {
      console.log('✅ API Response: Direct array of workshops');
      return response;
    }
    
    // Case 2: Response dengan wrapper { data: Workshop[] }
    if (response && 
        typeof response === 'object' && 
        'data' in response && 
        Array.isArray(response.data)) {
      console.log('✅ API Response: With data wrapper');
      return response.data;
    }
    
    // Case 3: Response dengan wrapper { workshops: Workshop[] }
    if (response && 
        typeof response === 'object' && 
        'workshops' in response && 
        Array.isArray(response.workshops)) {
      console.log('✅ API Response: With workshops wrapper');
      return response.workshops;
    }
    
    // Case 4: Response dengan pagination { data: [], pagination: {} }
    if (response && 
        typeof response === 'object' && 
        'data' in response && 
        Array.isArray(response.data)) {
      console.log('✅ API Response: With pagination wrapper');
      return response.data;
    }
    
    // Case 5: Response dengan success wrapper { success: true, data: [] }
    if (response && 
        typeof response === 'object' && 
        'success' in response && 
        'data' in response && 
        Array.isArray(response.data)) {
      console.log('✅ API Response: With success wrapper');
      return response.data;
    }
    
    // Case 6: Unknown or empty response
    console.warn('❌ Unknown API response structure:', response);
    return [];
  };

  // ✅ FETCH WORKSHOPS DATA
  useEffect(() => {
    const fetchWorkshops = async () => {
      // Only fetch if user is montir
      if (!user?.id || user.role !== 'montir') {
        console.log('Skipping workshop fetch - user is not montir:', user);
        setIsLoading(false);
        return;
      }
      
      try {
        console.log('🔄 Fetching workshops for montir:', user.id);
        setIsLoading(true);
        setError(null);
        
        const response = await workshopService.getWorkshops();
        console.log('📦 Workshop service response:', response);
        
        // Extract workshops from various response structures
        const workshopsData = extractWorkshopsFromResponse(response);
        console.log('🎯 Extracted workshops:', workshopsData);
        
        setWorkshops(workshopsData);
        
      } catch (err) {
        console.error('💥 Error fetching workshops:', err);
        setError(err);
      } finally {
        setIsLoading(false);
        console.log('🏁 Workshop fetch completed');
      }
    };

    fetchWorkshops();
  }, [user]);

  // ✅ FIND WORKSHOP OWNED BY CURRENT USER
  const ownedWorkshop = workshops.find(workshop => {
    const isOwner = workshop.montir_id === user?.id;
    if (isOwner) {
      console.log('🔑 Found owned workshop:', workshop.name);
    }
    return isOwner;
  });

  // ✅ ADD WORKSHOP MUTATION
  const addWorkshopMutation = {
    mutateAsync: async (data: CreateWorkshopData) => {
      console.log('🆕 Creating new workshop:', data);
      try {
        const newWorkshop = await workshopService.createWorkshop(data);
        console.log('✅ Workshop created successfully:', newWorkshop);
        
        // Update local state
        setWorkshops(prev => {
          const updated = [...prev, newWorkshop];
          console.log('📝 Updated workshops list:', updated);
          return updated;
        });
        
        return newWorkshop;
      } catch (error) {
        console.error('💥 Error creating workshop:', error);
        throw error;
      }
    }
  };

  // ✅ UPDATE WORKSHOP MUTATION
  const updateWorkshopMutation = {
    mutateAsync: async ({ id, ...updates }: { id: string } & UpdateWorkshopData) => {
      console.log('✏️ Updating workshop:', id, updates);
      try {
        const updatedWorkshop = await workshopService.updateWorkshop(id, updates);
        console.log('✅ Workshop updated successfully:', updatedWorkshop);
        
        // Update local state
        setWorkshops(prev => {
          const updated = prev.map(w => w.id === id ? updatedWorkshop : w);
          console.log('📝 Updated workshops list:', updated);
          return updated;
        });
        
        return updatedWorkshop;
      } catch (error) {
        console.error('💥 Error updating workshop:', error);
        throw error;
      }
    }
  };

  // ✅ RETURN HOOK DATA
  return {
    // Role & Status
    isWorkshopOwner: !!ownedWorkshop,
    hasWorkshop: !!ownedWorkshop,
    isLoading,
    error,
    
    // Data
    ownedWorkshop,
    workshops,
    
    // Mutations
    addWorkshopMutation,
    updateWorkshopMutation,
    
    // Debug info
    debug: {
      user: user?.id,
      workshopsCount: workshops.length,
      ownedWorkshop: ownedWorkshop?.name || 'None'
    }
  };
};