import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ArticleList() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const apiBaseUrl = 'http://localhost:5000';
  // Fetch all articles when component mounts
  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get(`${apiBaseUrl}/articles`);
      setArticles(res.data);
    } catch (fetchError) {
      setError('Unable to load articles. Please make sure the API server is running.');
      console.error(fetchError);
    } finally {
      setLoading(false);
    }
  };

  const deleteArticle = async (id) => {
    try {
      await axios.delete(`${apiBaseUrl}/articles/${id}`);
      setArticles((currentArticles) => currentArticles.filter((article) => article.id !== id));
    } catch (deleteError) {
      console.error(deleteError);
      setError('Unable to delete the selected article.');
    }
  };

  if (loading) {
    return <div>Loading articles...</div>;
  }

  return (
    <div>
      <h2>Articles</h2>
      {error ? <p style={{ color: 'crimson' }}>{error}</p> : null}
      <ul>
        {articles.map((article) => (
          <li key={article.id}>
            <strong>{article.title}</strong> <br />
            <small>By Journalist #{article.journalistId} | Category #{article.categoryId}</small>
            <br />
            <button onClick={() => deleteArticle(article.id)}>Delete</button>
            <button onClick={() => {
              navigate(`/update/${article.id}`);
            }}>Update</button>
            <button onClick={() => {
              navigate(`/articles/${article.id}`);
            }}>View</button>
          </li>
        ))}
      </ul>
      {!articles.length ? <p>No articles found.</p> : null}
    </div>
  );
}