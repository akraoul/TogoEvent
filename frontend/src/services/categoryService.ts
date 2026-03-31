import { Category, ApiResponse } from '../types';

// Category service functions
export const categoryService = {
  // Get all categories
  getCategories: async (): Promise<ApiResponse<Category[]>> => {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8001'}/api/categories`);
    return response.json();
  },

  // Get category by ID
  getCategoryById: async (id: string): Promise<ApiResponse<Category>> => {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8001'}/api/categories/${id}`);
    return response.json();
  },

  // Create category (admin only)
  createCategory: async (categoryData: Partial<Category>): Promise<ApiResponse<Category>> => {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8001'}/api/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(categoryData),
    });
    return response.json();
  },

  // Update category (admin only)
  updateCategory: async (id: string, categoryData: Partial<Category>): Promise<ApiResponse<Category>> => {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8001'}/api/categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(categoryData),
    });
    return response.json();
  },

  // Delete category (admin only)
  deleteCategory: async (id: string): Promise<ApiResponse<void>> => {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8001'}/api/categories/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },
};
