import { useEffect, useState } from 'react';

const API_BASE_URL = 'http://localhost:5000';

export default function ArticleFilter() {
  const [articles, setArticles] = useState([]);
  const [journalists, setJournalists] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedJournalistId, setSelectedJournalistId] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');

  // Fetch all articles when component mounts
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [articlesResponse, journalistsResponse, categoriesResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/articles`),
        fetch(`${API_BASE_URL}/journalists`),
        fetch(`${API_BASE_URL}/categories`),
      ]);

      const [articlesData, journalistsData, categoriesData] = await Promise.all([
        articlesResponse.json(),
        journalistsResponse.json(),
        categoriesResponse.json(),
      ]);

      setArticles(Array.isArray(articlesData) ? articlesData : []);
      setJournalists(Array.isArray(journalistsData) ? journalistsData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error) {
      console.error('Failed to load article filters:', error);
    }
  };

  const fetchFilteredArticles = async () => {
    try {
      let response;

      if (selectedJournalistId && selectedCategoryId) {
        response = await fetch(
          `${API_BASE_URL}/articles?journalistId=${selectedJournalistId}&categoryId=${selectedCategoryId}`,
        );
      } else if (selectedJournalistId) {
        response = await fetch(`${API_BASE_URL}/journalists/${selectedJournalistId}/articles`);
      } else if (selectedCategoryId) {
        response = await fetch(`${API_BASE_URL}/categories/${selectedCategoryId}/articles`);
      } else {
        response = await fetch(`${API_BASE_URL}/articles`);
      }

      const data = await response.json();
      setArticles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to filter articles:', error);
    }
  };

  const resetFilters = async () => {
    setSelectedJournalistId('');
    setSelectedCategoryId('');

    try {
      const response = await fetch(`${API_BASE_URL}/articles`);
      const data = await response.json();
      setArticles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to reset article filters:', error);
    }
  };

  const getOptionId = item => item.id ?? item._id;
  const getOptionLabel = item => item.name ?? item.title ?? item.fullName ?? item.label ?? `Item ${getOptionId(item)}`;

  return (
    <div>
      <h2>Articles</h2>
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <label htmlFor="journalistFilter">Filter by Journalist:</label>
        <select
          id="journalistFilter"
          value={selectedJournalistId}
          onChange={event => setSelectedJournalistId(event.target.value)}
        >
          <option value="">All Journalists</option>
          {journalists.map(journalist => (
            <option key={getOptionId(journalist)} value={getOptionId(journalist)}>
              {getOptionLabel(journalist)}
            </option>
          ))}
        </select>

        <label htmlFor="categoryFilter">Filter by Category:</label>
        <select
          id="categoryFilter"
          value={selectedCategoryId}
          onChange={event => setSelectedCategoryId(event.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={getOptionId(category)} value={getOptionId(category)}>
              {getOptionLabel(category)}
            </option>
          ))}
        </select>

        <button onClick={fetchFilteredArticles}>Apply Filters</button>
        <button onClick={resetFilters}>Reset Filters</button>
      </div>

      <ul>
        {articles.map(article => (
          <li key={article.id}>
            <strong>{article.title}</strong> <br />
            <small>By Journalist #{article.journalistId} | Category #{article.categoryId}</small><br />
            <button disabled>Delete</button>
            <button disabled>Update</button>
            <button disabled>View</button>
          </li>
        ))}
      </ul>
    </div>
  );
}