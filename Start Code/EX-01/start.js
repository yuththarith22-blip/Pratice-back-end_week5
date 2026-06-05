import http from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';

const rootDir = dirname(fileURLToPath(import.meta.url));
const dataFile = resolve(rootDir, 'articles-data.json');
const apiPort = 5000;

const seedArticles = [
  {
    id: 1,
    title: 'Getting Started with Local News',
    content: 'This is a seed article provided by the local API.',
    journalistId: 101,
    categoryId: 201,
  },
  {
    id: 2,
    title: 'React Client and Article CRUD',
    content: 'The EX-01 client now has a working local backend.',
    journalistId: 102,
    categoryId: 202,
  },
];

const jsonHeaders = {
  'Content-Type': 'application/json; charset=utf-8',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const sendJson = (response, statusCode, payload) => {
  response.writeHead(statusCode, jsonHeaders);
  response.end(JSON.stringify(payload));
};

const sendEmpty = (response, statusCode) => {
  response.writeHead(statusCode, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  response.end();
};

const normalizeArticle = (article, fallbackId) => ({
  id: Number(article.id ?? fallbackId),
  title: String(article.title ?? ''),
  content: String(article.content ?? ''),
  journalistId: Number(article.journalistId ?? 0),
  categoryId: Number(article.categoryId ?? 0),
});

const readArticles = async () => {
  try {
    const fileContents = await readFile(dataFile, 'utf8');
    const parsed = JSON.parse(fileContents);
    return Array.isArray(parsed) ? parsed.map((article, index) => normalizeArticle(article, index + 1)) : seedArticles;
  } catch {
    return seedArticles;
  }
};

const writeArticles = async (articles) => {
  await writeFile(dataFile, `${JSON.stringify(articles, null, 2)}\n`, 'utf8');
};

const startApiServer = async () => {
  let articles = await readArticles();

  const server = http.createServer(async (request, response) => {
    const url = new URL(request.url ?? '/', `http://${request.headers.host}`);

    if (request.method === 'OPTIONS') {
      sendEmpty(response, 204);
      return;
    }

    if (url.pathname === '/articles' && request.method === 'GET') {
      sendJson(response, 200, articles);
      return;
    }

    if (url.pathname.startsWith('/articles/') && request.method === 'GET') {
      const id = Number(url.pathname.split('/')[2]);
      const article = articles.find((entry) => entry.id === id);

      if (!article) {
        sendJson(response, 404, { message: 'Article not found' });
        return;
      }

      sendJson(response, 200, article);
      return;
    }

    if (url.pathname === '/articles' && request.method === 'POST') {
      const body = await readRequestBody(request);
      const nextId = articles.length ? Math.max(...articles.map((entry) => entry.id)) + 1 : 1;
      const createdArticle = normalizeArticle({ ...body, id: nextId }, nextId);

      articles = [...articles, createdArticle];
      await writeArticles(articles);
      sendJson(response, 201, createdArticle);
      return;
    }

    if (url.pathname.startsWith('/articles/') && request.method === 'PUT') {
      const id = Number(url.pathname.split('/')[2]);
      const body = await readRequestBody(request);
      const articleIndex = articles.findIndex((entry) => entry.id === id);

      if (articleIndex === -1) {
        sendJson(response, 404, { message: 'Article not found' });
        return;
      }

      const updatedArticle = normalizeArticle({ ...body, id }, id);
      articles = articles.map((entry) => (entry.id === id ? updatedArticle : entry));
      await writeArticles(articles);
      sendJson(response, 200, updatedArticle);
      return;
    }

    if (url.pathname.startsWith('/articles/') && request.method === 'DELETE') {
      const id = Number(url.pathname.split('/')[2]);
      const nextArticles = articles.filter((entry) => entry.id !== id);

      if (nextArticles.length === articles.length) {
        sendJson(response, 404, { message: 'Article not found' });
        return;
      }

      articles = nextArticles;
      await writeArticles(articles);
      sendEmpty(response, 204);
      return;
    }

    if (url.pathname === '/') {
      sendJson(response, 200, { status: 'ok', service: 'articles-api' });
      return;
    }

    sendJson(response, 404, { message: 'Not found' });
  });

  await new Promise((resolveServer) => {
    server.listen(apiPort, () => {
      console.log(`API server running at http://localhost:${apiPort}`);
      resolveServer();
    });
  });

  return server;
};

const readRequestBody = async (request) => {
  const chunks = [];

  for await (const chunk of request) {
    chunks.push(chunk);
  }

  if (!chunks.length) {
    return {};
  }

  const rawBody = Buffer.concat(chunks).toString('utf8');
  return rawBody ? JSON.parse(rawBody) : {};
};

const apiServer = await startApiServer();

const viteServer = await createViteServer({
  server: {
    host: true,
  },
});

await viteServer.listen();
viteServer.printUrls();

const shutdown = async () => {
  await viteServer.close();
  await new Promise((resolveServer) => apiServer.close(() => resolveServer()));
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);