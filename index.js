import express from 'express';
import cors from 'cors';
import pkg from 'pg';
const { Pool } = pkg;

const app = express();
const port = 8081;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
  host: 'database-1.ckp22cngt1wp.eu-north-1.rds.amazonaws.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'postgresknowledge',
  ssl: {
    rejectUnauthorized: false,
  },
});

// Fetch all todos
app.get('/api/todos', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM todos ORDER BY created_at DESC');
    res.json(result.rows);
    client.release();
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

// Create a new todo
app.post('/api/todos', async (req, res) => {
  const { title } = req.body;
  try {
    const client = await pool.connect();
    const result = await client.query(
      'INSERT INTO todos (title, is_complete) VALUES ($1, $2) RETURNING *',
      [title, false]
    );
    res.status(201).json(result.rows[0]);
    client.release();
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ error: 'Failed to create todo' });
  }
});

// Update a todo's status
app.put('/api/todos/:id', async (req, res) => {
  const { id } = req.params;
  const { is_complete } = req.body;
  try {
    const client = await pool.connect();
    const result = await client.query(
      'UPDATE todos SET is_complete = $1 WHERE id = $2 RETURNING *',
      [is_complete, id]
    );
    res.json(result.rows[0]);
    client.release();
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

// Delete a todo
app.delete('/api/todos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const client = await pool.connect();
    await client.query('DELETE FROM todos WHERE id = $1', [id]);
    res.json({ message: 'Todo deleted' });
    client.release();
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

