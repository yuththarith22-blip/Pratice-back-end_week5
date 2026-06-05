import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

export default function UpdateArticleForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const apiBaseUrl = 'http://localhost:5000';
  const [form, setForm] = useState({
    title: '',
    content: '',
    journalistId: '',
    categoryId: '',
  });


  // Fetch to prefill a form and update an existing article
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const res = await axios.get(`${apiBaseUrl}/articles/${id}`);
        setForm({
          title: res.data.title ?? '',
          content: res.data.content ?? '',
          journalistId: res.data.journalistId ?? '',
          categoryId: res.data.categoryId ?? '',
        });
      } catch (fetchError) {
        console.error(fetchError);
        alert('Unable to load article data for editing.');
      }
    };

    fetchArticle();
  }, [id]);

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

      await axios.put(`${apiBaseUrl}/articles/${id}`, payload);
      navigate(`/articles/${id}`);
    } catch (submitError) {
      console.error(submitError);
      alert('Unable to update article. Please check the API server.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Update Article</h3>
      <input name="title" value={form.title} onChange={handleChange} placeholder="Title" required /><br />
      <textarea name="content" value={form.content} onChange={handleChange} placeholder="Content" required /><br />
      <input name="journalistId" value={form.journalistId} onChange={handleChange} placeholder="Journalist ID" required /><br />
      <input name="categoryId" value={form.categoryId} onChange={handleChange} placeholder="Category ID" required /><br />
      <button type="submit">Update</button>
    </form>
  );
}
