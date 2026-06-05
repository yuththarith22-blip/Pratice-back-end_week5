import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ArticleForm() {
  const navigate = useNavigate();
  const apiBaseUrl = 'http://localhost:5000';
  const [form, setForm] = useState({
    title: '',
    content: '',
    journalistId: '',
    categoryId: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        journalistId: Number(form.journalistId),
        categoryId: Number(form.categoryId),
      };

      await axios.post(`${apiBaseUrl}/articles`, payload);
      navigate('/');
    } catch (submitError) {
      console.error(submitError);
      alert('Unable to create article. Please check the API server.');
    }
  };

  return (
    <div>
      <nav style={{ marginBottom: '20px' }}>
        <Link to="/">📄 View Articles</Link>
      </nav>

      <h2>Add Article</h2>
      <form onSubmit={handleSubmit}>
        <h3>Add New Article</h3>
        <input name="title" value={form.title} onChange={handleChange} placeholder="Title" required /><br />
        <textarea name="content" value={form.content} onChange={handleChange} placeholder="Content" required /><br />
        <input name="journalistId" value={form.journalistId} onChange={handleChange} placeholder="Journalist ID" required /><br />
        <input name="categoryId" value={form.categoryId} onChange={handleChange} placeholder="Category ID" required /><br />
        <button type="submit">Add</button>
      </form>

    </div>
  );
}
