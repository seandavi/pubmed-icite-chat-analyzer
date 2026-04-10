
import { Article, ICiteResponse } from '../types';

const ICITE_API_URL = '/api/icite';

export const fetchICiteData = async (pmids: string[]): Promise<Article[]> => {
  if (pmids.length === 0) {
    return [];
  }
  
  try {
    const response = await fetch(ICITE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pmids }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch iCite data via proxy:", error);
    throw error;
  }
};
