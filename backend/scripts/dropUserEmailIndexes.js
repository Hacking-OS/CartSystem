const mysql = require('mysql2/promise');
const config = require('../config').database;

(async () => {
  const connection = await mysql.createConnection({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.name,
  });

  const [rows] = await connection.query(
    "SHOW INDEX FROM users WHERE Key_name <> 'PRIMARY'"
  );

  const uniqueNames = [...new Set(rows.map((row) => row.Key_name))];
  const indexesToDrop = uniqueNames.filter((name) => name !== 'email');

  if (!indexesToDrop.length) {
    console.log('No duplicate indexes found.');
    await connection.end();
    return;
  }

  const dropSql = `ALTER TABLE users ${indexesToDrop
    .map((name) => `DROP INDEX \`${name}\``)
    .join(', ')};`;

  console.log('Executing:', dropSql);
  await connection.query(dropSql);
  await connection.end();
  console.log('Duplicate indexes dropped.');
})();

