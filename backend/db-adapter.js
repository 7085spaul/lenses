// Database Adapter - Works with both SQLite and PostgreSQL

const DB_TYPE = process.env.DB_TYPE || 'sqlite';

let db;

if (DB_TYPE === 'postgresql') {
  const { getDB: getPostgresDB } = require('./database-pg');
  db = getPostgresDB();
} else {
  const { getDB: getSQLiteDB } = require('./database');
  db = getSQLiteDB();
}

// Query adapter to handle differences between SQLite and PostgreSQL
const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    if (DB_TYPE === 'postgresql') {
      // PostgreSQL uses $1, $2, etc. for parameters
      const pg = require('./database-pg');
      pg.query(sql, params)
        .then(result => {
          // Convert PostgreSQL result to match SQLite format
          const rows = result.rows;
          resolve(rows);
        })
        .catch(reject);
    } else {
      // SQLite uses ? for parameters
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    }
  });
};

// Get single row
const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    if (DB_TYPE === 'postgresql') {
      const pg = require('./database-pg');
      pg.query(sql, params)
        .then(result => {
          resolve(result.rows[0] || null);
        })
        .catch(reject);
    } else {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    }
  });
};

// Run query (INSERT, UPDATE, DELETE)
const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    if (DB_TYPE === 'postgresql') {
      const pg = require('./database-pg');
      pg.query(sql, params)
        .then(result => {
          resolve({ lastID: result.rows[0]?.id, changes: result.rowCount });
        })
        .catch(reject);
    } else {
      db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    }
  });
};

module.exports = { query, get, run, DB_TYPE };
