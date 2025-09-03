// Reading time calculation
export const calculateReadingTime = (pageCount, wordsPerPage = 250, wordsPerMinute = 200) => {
  if (!pageCount || pageCount <= 0) return 'Unknown';
  
  const totalWords = pageCount * wordsPerPage;
  const totalMinutes = totalWords / wordsPerMinute;
  
  if (totalMinutes < 60) {
    return `${Math.round(totalMinutes)} min`;
  } else {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
};

export const getReadingDifficulty = (pageCount) => {
  if (!pageCount || pageCount <= 0) return { level: 'Unknown', color: '#666' };
  
  if (pageCount < 200) return { level: 'Quick', color: '#28a745' };
  if (pageCount < 400) return { level: 'Standard', color: '#ffc107' };
  if (pageCount < 600) return { level: 'Long', color: '#fd7e14' };
  return { level: 'Epic', color: '#dc3545' };
};

// Custom book cover helpers
export const hasCustomCover = (bookId) => {
  try {
    const customCovers = JSON.parse(localStorage.getItem('customBookCovers') || '{}');
    return !!customCovers[bookId];
  } catch (error) {
    return false;
  }
};

export const saveCustomBookCover = (bookId, imageDataUrl) => {
  try {
    const customCovers = JSON.parse(localStorage.getItem('customBookCovers') || '{}');
    customCovers[bookId] = imageDataUrl;
    localStorage.setItem('customBookCovers', JSON.stringify(customCovers));
    return true;
  } catch (error) {
    console.error('Error saving custom cover:', error);
    return false;
  }
};

export const removeCustomBookCover = (bookId) => {
  try {
    const customCovers = JSON.parse(localStorage.getItem('customBookCovers') || '{}');
    delete customCovers[bookId];
    localStorage.setItem('customBookCovers', JSON.stringify(customCovers));
    return true;
  } catch (error) {
    console.error('Error removing custom cover:', error);
    return false;
  }
};

export const getBookImage = (book) => {
  try {
    const customCovers = JSON.parse(localStorage.getItem('customBookCovers') || '{}');
    if (customCovers[book.id]) return customCovers[book.id];
  } catch (error) {
    console.log('Error loading custom covers:', error);
  }
  
  if (book.thumbnail) return book.thumbnail;
  if (book.imageLinks?.thumbnail) return book.imageLinks.thumbnail;
  if (book.imageLinks?.smallThumbnail) return book.imageLinks.smallThumbnail;
  return null;
};

// Genre options
export const GENRE_OPTIONS = [
  'Fiction', 'Non-fiction', 'Mystery', 'Romance', 'Science Fiction', 
  'Fantasy', 'Biography', 'History', 'Self-help', 'Business',
  'Psychology', 'Philosophy', 'Science', 'Technology', 'Health',
  'Cooking', 'Travel', 'Art', 'Poetry', 'Drama'
];

// Reading status options
export const READING_STATUS_OPTIONS = [
  {
    value: 'want-to-read',
    label: 'Want to Read',
    color: '#ffc107'
  },
  {
    value: 'currently-reading',
    label: 'Currently Reading',
    color: '#28a745'
  },
  {
    value: 'finished',
    label: 'Finished',
    color: '#007bff'
  }
];

// Recommendation algorithms
export const generateRecommendations = (userRatings, userPreferences, allBooks, readingList) => {
  const readingListIds = readingList.map(book => book.id);
  const availableBooks = allBooks.filter(book => !readingListIds.includes(book.id));
  
  if (availableBooks.length === 0) return [];

  const recommendationScores = availableBooks.map(book => {
    let score = 0;
    
    if (userPreferences.genres) {
      userPreferences.genres.forEach(genre => {
        if (book.categories && book.categories.some(cat => 
          cat.toLowerCase().includes(genre.toLowerCase())
        )) {
          score += 2;
        }
      });
    }

    if (book.averageRating >= 4) score += 2;
    if (book.averageRating >= 4.5) score += 1;

    return { ...book, recommendationScore: score };
  });

  return recommendationScores
    .filter(book => book.recommendationScore > 0)
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, 20);
};

export const getRecommendationReason = (book, userRatings, userPreferences, allBooks) => {
  if (book.averageRating >= 4.5) {
    return `Highly rated (${book.averageRating}/5)`;
  }
  return 'Recommended for you';
};

export const formatBookForRecommendation = (book, reason) => ({
  ...book,
  recommendationReason: reason
});

// Utility functions
export const formatDate = (dateString) => {
  if (!dateString) return 'Unknown';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const truncateText = (text, maxLength = 150) => {
  if (!text) return 'No description available';
  const cleanText = text.replace(/<[^>]*>/g, '');
  return cleanText.length > maxLength ? 
    cleanText.substring(0, maxLength) + '...' : 
    cleanText;
};

export const normalizeBookData = (apiBook) => {
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
    thumbnail: getBookImage(volumeInfo),
    previewLink: volumeInfo.previewLink || '',
    infoLink: volumeInfo.infoLink || '',
    isbn: volumeInfo.industryIdentifiers?.[0]?.identifier || ''
  };
};