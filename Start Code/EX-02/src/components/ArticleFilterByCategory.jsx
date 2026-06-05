import { useEffect, useState } from 'react';

const API_BASE_URL = 'http://localhost:5000';

export default function ArticleFilterByCategory() {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');

  // Fetch all articles when component mounts
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [articlesResponse, categoriesResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/articles`),
        fetch(`${API_BASE_URL}/categories`),
      ]);

      const [articlesData, categoriesData] = await Promise.all([
        articlesResponse.json(),
        categoriesResponse.json(),
      ]);

      setArticles(Array.isArray(articlesData) ? articlesData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const fetchArticlesByCategory = async () => {
    if (!selectedCategoryId) {
      loadInitialData();
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/categories/${selectedCategoryId}/articles`);
      const data = await response.json();
      setArticles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to filter articles by category:', error);
    }
  };

  const resetFilters = async () => {
    setSelectedCategoryId('');

    try {
      const response = await fetch(`${API_BASE_URL}/articles`);
      const data = await response.json();
      setArticles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to reset category filter:', error);
    }
  };

  const getOptionId = item => item.id ?? item._id;
  const getOptionLabel = item => item.name ?? item.title ?? item.label ?? `Category ${getOptionId(item)}`;

  return (
    <div>
      <h2>Articles</h2>
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
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

        <button onClick={fetchArticlesByCategory}>Apply Filters</button>
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