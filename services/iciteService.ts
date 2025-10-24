
import { Article, ICiteResponse } from '../types';

const ICITE_API_URL = 'https://icite.od.nih.gov/api/pubs?pmids=';

export const fetchICiteData = async (pmids: string[]): Promise<Article[]> => {
  if (pmids.length === 0) {
    return [];
  }
  const url = `${ICITE_API_URL}${pmids.join(',')}`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      // Try to parse error detail from iCite API
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData && errorData.detail) {
          errorMessage = errorData.detail;
        }
      } catch (e) {
        // Ignore if error response is not JSON
      }
      throw new Error(errorMessage);
    }

    const result: ICiteResponse = await response.json();
    return result.data;
  } catch (error) {
    console.error("Failed to fetch iCite data:", error);
    // Re-throw the error to be handled by the caller
    throw error;
  }
};
