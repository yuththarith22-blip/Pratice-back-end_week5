import { useEffect, useState } from 'react';

const API_BASE_URL = 'http://localhost:5000';

export default function ArticleFilterByJournalist() {
  const [articles, setArticles] = useState([]);
  const [journalists, setJournalists] = useState([]);
  const [selectedJournalistId, setSelectedJournalistId] = useState('');

  // Fetch all articles when component mounts
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [articlesResponse, journalistsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/articles`),
        fetch(`${API_BASE_URL}/journalists`),
      ]);

      const [articlesData, journalistsData] = await Promise.all([
        articlesResponse.json(),
        journalistsResponse.json(),
      ]);

      setArticles(Array.isArray(articlesData) ? articlesData : []);
      setJournalists(Array.isArray(journalistsData) ? journalistsData : []);
    } catch (error) {
      console.error('Failed to load journalists:', error);
    }
  };

  const fetchArticlesByJournalist = async () => {
    if (!selectedJournalistId) {
      loadInitialData();
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/journalists/${selectedJournalistId}/articles`);
      const data = await response.json();
      setArticles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to filter articles by journalist:', error);
    }
  };

  const resetFilters = async () => {
    setSelectedJournalistId('');

    try {
      const response = await fetch(`${API_BASE_URL}/articles`);
      const data = await response.json();
      setArticles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to reset journalist filter:', error);
    }
  };

  const getOptionId = item => item.id ?? item._id;
  const getOptionLabel = item => item.name ?? item.title ?? item.fullName ?? item.label ?? `Journalist ${getOptionId(item)}`;

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

        <button onClick={fetchArticlesByJournalist}>Apply Filters</button>
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