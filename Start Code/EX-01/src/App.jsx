import { Routes, Route, Link } from 'react-router-dom';
import ArticleList from './components/ArticleList';
import CreateArticleForm from './components/CreateArticleForm';
import UpdateArticleForm from './components/UpdateArticleForm';
import ArticleViewer from './components/ArticleViewer';

function App() {
  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '24px 16px 48px' }}>
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ marginBottom: '8px' }}>News Article Management</h1>
        <p style={{ marginTop: 0, color: '#666' }}>
          Browse articles, create new stories, and update existing content through the REST API.
        </p>
        <nav style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link to="/">Articles</Link>
          <Link to="/add">Add Article</Link>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<ArticleList />} />
        <Route path="/add" element={<CreateArticleForm />} />
        <Route path="/update/:id" element={<UpdateArticleForm />} />
        <Route path="/articles/:id" element={<ArticleViewer />} />
      </Routes>
    </div>
  );
}

export default App;
