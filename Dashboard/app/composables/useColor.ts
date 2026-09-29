// composables/useColor.ts

// Define Color directly from the nested model inside ProductVariant
export interface Color {
  colorId: number;
  colorName: string;
}
export interface ColorRequest {
  name: string;
}

export interface ApiResponse {
  message: string;
}

export const useColor = () => {
  const config = useRuntimeConfig();
  const { getToken } = useAuth();
  const colors = ref<Color[]>([]);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);

  // Authorization header helper
  const getAuthHeaders = (): Record<string, string> => {
    const token = getToken()

    if (!token) {
      return {}
    }

    return {
      Authorization: `Bearer ${token}`
    }
  } 

  // GET: Fetch all colors
  const fetchColors = async (): Promise<void> => {
    loading.value = true;
    error.value = null;
    try {
      const data = await $fetch<Color[]>(`${config.public.apiBase}/Color`);
      colors.value = data;
    } catch (err: any) {
      error.value = err?.data?.message || 'Failed to fetch colors';
    } finally {
      loading.value = false;
    }
  };

  // GET: Fetch single color by ID
  const getColorById = async (id: number): Promise<Color | null> => {
    loading.value = true;
    error.value = null;
    try {
      return await $fetch<Color>(`${config.public.apiBase}/Color/${id}`);
    } catch (err: any) {
      error.value = err?.data?.message || 'Color not found';
      return null;
    } finally {
      loading.value = false;
    }
  };

  // POST: Create a new color (Admin only)
  const createColor = async (payload: ColorRequest): Promise<Color | null> => {
    loading.value = true;
    error.value = null;
    try {
      const newColor = await $fetch<Color>(`${config.public.apiBase}/Color`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: payload,
      });
      return newColor;
    } catch (err: any) {
      error.value = err?.data?.message || 'Failed to create color';
      return null;
    } finally {
      loading.value = false;
    }
  };

  // PUT: Update color by ID (Admin only)
  const updateColor = async (id: number, payload: ColorRequest): Promise<Color | null> => {
    loading.value = true;
    error.value = null;
    try {
      const updatedColor = await $fetch<Color>(`${config.public.apiBase}/Color/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: payload,
      });
      const index = colors.value.findIndex((c) => c.colorId === id);
      if (index !== -1) colors.value[index] = updatedColor;
      return updatedColor;
    } catch (err: any) {
      error.value = err?.data?.message || 'Failed to update color';
      return null;
    } finally {
      loading.value = false;
    }
  };

  // DELETE: Delete color by ID (Admin only)
  const deleteColor = async (id: number): Promise<boolean> => {
    loading.value = true;
    error.value = null;
    try {
      await $fetch<ApiResponse>(`${config.public.apiBase}/Color/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      colors.value = colors.value.filter((c) => c.colorId !== id);
      return true;
    } catch (err: any) {
      error.value = err?.data?.message || 'Failed to delete color';
      return false;
    } finally {
      loading.value = false;
    }
  };

  return {
    colors,
    loading,
    error,
    fetchColors,
    getColorById,
    createColor,
    updateColor,
    deleteColor,
  };
};