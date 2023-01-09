const filepath = "./test.db";
import { Database } from 'sqlite3';

function createDbConnection() {
  const db = new Database(filepath, (error) => {
    if (error) {
      return console.error(error.message);
    }
    db.exec('PRAGMA foreign_keys = ON;', pragmaErr => {
        if (pragmaErr) return console.error('Foreign key enforcement pragma query failed.');
      });
    createUserTable(db);
    createExerciseTable(db);
  });
  console.log("Connection with SQLite has been established");
  return db;
}

function createUserTable(db: Database) {
    db.exec(`
    CREATE TABLE IF NOT EXISTS user (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username text UNIQUE,
        logs text,
        count INTEGER,
        CONSTRAINT username_unique UNIQUE (username)
    )`
    ); 
}

function createExerciseTable(db: Database) {
    db.exec(`
    CREATE TABLE IF NOT EXISTS exercise (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        description text,
        duration INTEGER,
        date text,
        FOREIGN KEY (userId) REFERENCES user(id)
    )`,
    ); 
}

module.exports = createDbConnection();