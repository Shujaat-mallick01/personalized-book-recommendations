const GOOGLE_BOOKS_API_KEY = process.env.REACT_APP_GOOGLE_BOOKS_API_KEY;
const BASE_URL = 'https://www.googleapis.com/books/v1/volumes';

const normalizeBookData = (apiBook) => {
  const volumeInfo = apiBook.volumeInfo || {};
  
  return {
    id: apiBook.id,
    title: volumeInfo.title || 'Unknown Title',
    authors: volumeInfo.authors || ['Unknown Author'],
    description: volumeInfo.description || '',
    publishedDate: volumeInfo.publishedDate || '',
    pageCount: volumeInfo.pageCount || 0,
    categories: volumeInfo.categories || [],
    averageRating: volumeInfo.averageRating || 0,
    ratingsCount: volumeInfo.ratingsCount || 0,
    thumbnail: volumeInfo.imageLinks?.thumbnail || null,
    previewLink: volumeInfo.previewLink || '',
    infoLink: volumeInfo.infoLink || '',
    isbn: volumeInfo.industryIdentifiers?.[0]?.identifier || ''
  };
};

export const searchBooks = async (query, maxResults = 10) => {
  try {
    const params = new URLSearchParams({
      q: query,
      maxResults: Math.min(maxResults, 40),
      orderBy: 'relevance',
      printType: 'books',
      ...(GOOGLE_BOOKS_API_KEY && { key: GOOGLE_BOOKS_API_KEY })
    });

    const response = await fetch(`${BASE_URL}?${params}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      return [];
    }

    return data.items
      .filter(item => item.volumeInfo)
      .map(item => normalizeBookData(item))
      .filter(book => book.title && book.authors.length > 0);

  } catch (error) {
    console.error('Error searching books:', error);
    throw new Error('Failed to search books. Please try again later.');
  }
};

export const getPopularBooks = async (maxResults = 20) => {
  try {
    const popularQueries = [
      'bestseller fiction',
      'popular books 2024',
      'award winning books',
      'new york times bestseller'
    ];

    const allBooks = [];
    
    for (const query of popularQueries) {
      try {
        const books = await searchBooks(query, 10);
        allBooks.push(...books);
        if (allBooks.length >= maxResults) break;
      } catch (error) {
        console.log(`Failed to fetch books for query: ${query}`);
      }
    }

    const uniqueBooks = allBooks.filter((book, index, self) => 
      self.findIndex(b => b.id === book.id) === index
    );

    return uniqueBooks.slice(0, maxResults);

  } catch (error) {
    console.error('Error getting popular books:', error);
    throw new Error('Failed to load popular books. Please try again later.');
  }
};