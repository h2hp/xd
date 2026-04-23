const http = require('http');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2');


const PORT = process.env.PORT || 3000;

const dbHost = process.env.DB_HOST || '72.56.243.247';
const dbPort = process.env.DB_PORT || 3306;       
const dbUser = process.env.DB_USER || 'gen_user';
const dbPassword = process.env.DB_PASSWORD || 'Klokovanklokovan_0711';
const dbName = process.env.DB_NAME || 'default_db';

const connection = mysql.createConnection({
  host: dbHost,
  port: dbPort,
  user: dbUser,
  password: dbPassword,
  database: dbName,
  ssl: {
    rejectUnauthorized: false 
  }
});

connection.connect((err) => {
  if (err) {
    console.error('Ошибка подключения к БД:', err);
  } else {
    console.log('Подключено к базе данных');
  }
});

const server = http.createServer((req, res) => {
  // Главная страница
  if (req.url === '/') {
    const filePath = path.join(__dirname, 'index.html');
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Ошибка сервера');
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(data);
      }
    });
  }

  // API рецептов
  else if (req.url === '/recipes') {
    connection.query('SELECT * FROM recipes', (err, results) => {
      if (err) {
        console.error('Ошибка запроса /recipes:', err);
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: 'Ошибка базы данных' }));
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(results));
      }
    });
  }

  // Картинки
  else if (req.url.startsWith('/images/')) {
    const filePath = path.join(__dirname, req.url);
    const ext = path.extname(filePath).toLowerCase();
    let contentType = 'application/octet-stream';
    if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    if (ext === '.png') contentType = 'image/png';
    if (ext === '.gif') contentType = 'image/gif';
    if (ext === '.webp') contentType = 'image/webp';

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('Картинка не найдена');
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
      }
    });
  }

  // Всё остальное
  else {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Страница не найдена');
  }
});

server.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});