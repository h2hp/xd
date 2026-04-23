const http = require('http');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2');

const PORT = 3000;

// 🔥 ВСТАВЬ СВОЙ ПАРОЛЬ НИЖЕ
const connection = mysql.createConnection({
  host: '72.56.243.247',
  port: 3306,
  user: 'gen_user',
  password: 'Klokovanklokovan_0711',
  database: 'default_db',
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
  console.log(`Сервер запущен: http://localhost:${PORT}`);
});