import express from "express";
import cors from "cors";
import pg from "pg";

const app = express();
app.use(express.json());
app.use(cors());

const { Pool } = pg;
const pool = new Pool({
  host: "localhost",
  user: "postgres",
  password: "123456",
  database: "expenses",
  port: "5432",
});

app.post("/api/tasks", async (req, res) => {
  const { title, status } = req.body;
  if (!title || !status) {
    return res.status(400).json({
      message: "Title or status is empty.",
    });
  }

  try {
    const insertTask = await pool.query(
      `INSERT INTO tasks (
                title,
                status
            ) VALUES ($1, $2) RETURNING *`,
      [title, status],
    );
    res.status(201).json({
      message: "Task created",
      data: insertTask.rows[0],
    });
  } catch (error) {
    console.error("Can't create task", error);
    res.status(500).json({
      message: "Server error",
    });
  }
});

app.get("/api/tasks", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM tasks ORDER BY created_at DESC`,
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
    });
  }
});

app.patch("/api/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const result = await pool.query(
      `
        UPDATE tasks
        SET status = $1
        WHERE id = $2 RETURNING *;
        `,
      [status, id],
    );

    if (!status) {
      return res.status(400).json({
        message: "Status is required",
      });
    }

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Task not found.",
      });
    }

    res.status(200).json({
      message: "Status updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
    });
  }
});

app.delete("/api/tasks/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `
            DELETE FROM tasks
            WHERE id = $1
            RETURNING *;
            `,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.status(200).json({
      message: "Deleted task successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Couldn't delete the task", error);
    res.status(500).json({
      message: "Server error",
    });
  }
});

app.listen(5000, () => {
  console.log("Server running on server", 5000);
});
