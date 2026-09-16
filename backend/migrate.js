const mysql = require('mysql2');

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '@Nu4114#*',
  database: 'bunkmaster_db'
}).promise();

async function migrate() {
  try {
    const [uCols] = await db.query("SHOW COLUMNS FROM users LIKE 'academic_end_date'");
    if (uCols.length === 0) {
      await db.query("ALTER TABLE users ADD COLUMN academic_end_date DATE NULL");
      console.log("Added academic_end_date to users");
    } else {
      console.log("academic_end_date already exists");
    }

    const [sCols] = await db.query("SHOW COLUMNS FROM users LIKE 'semester_name'");
    if (sCols.length === 0) {
      await db.query("ALTER TABLE users ADD COLUMN semester_name VARCHAR(100) DEFAULT NULL");
      console.log("Added semester_name to users");
    } else {
      console.log("semester_name already exists");
    }

    const [aCols] = await db.query("SHOW COLUMNS FROM semester_archives LIKE 'semester_name'");
    if (aCols.length === 0) {
      await db.query("ALTER TABLE semester_archives ADD COLUMN semester_name VARCHAR(100) DEFAULT NULL");
      console.log("Added semester_name to semester_archives");
    } else {
      console.log("semester_name already exists in semester_archives");
    }

    console.log("Migration finished successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Migration error:", err.message);
    process.exit(1);
  }
}

migrate();
