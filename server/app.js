import express from "express";
import pkg from "pg";
import dotenv from "dotenv";
import bcryptjs from "bcryptjs";
import cors from "cors";
import bodyParser from "body-parser";
import { generateAuthToken } from "./utils/generateAuthToken.js";
import { verifyUserToken } from "./middleware/verifyUserToken.js";
dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

// Parse JSON bodies for this app
app.use(cors());
app.use(express.json());
// app.use(
//   bodyParser.urlencoded({
//     extended: false,
//   })
// );
// app.use(bodyParser.json());

// Create a new pool using your Neon database connection string
const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.get("/", async (req, res) => {
  try {
    // Fetch books from your database using the postgres connection
    const { rows } = await pool.query("SELECT * FROM users;");
    res.json(rows);
  } catch (error) {
    console.error("Failed to fetch books", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/register", async (req, res) => {
  try {
    let { name, email, password, password2 } = req.body;

    let errors = [];

    if (!name || !email || !password || !password2) {
      errors.push({ message: "Please enter all fields" });
    }

    if (password.length < 6) {
      errors.push({ message: "Password must be a least 6 characters long" });
    }

    if (password !== password2) {
      errors.push({ message: "Passwords do not match" });
    }

    if (errors.length > 0) {
      return res.json({ errors, name, email, password, password2 });
    } else {
      const hashedPassword = await bcryptjs.hash(password, 10);
      console.log(hashedPassword);
      // Validation passed
      pool.query(
        `SELECT * FROM users
        WHERE email = $1`,
        [email],
        (err, results) => {
          if (err) {
            console.log(err);
            return res.status(500).send({
              message: "Something went wrong",
              error: err.message,
            });
          }
          console.log(results.rows);

          if (results.rows.length > 0) {
            return res.json({
              message: "Email already registered",
            });
          } else {
            pool.query(
              `INSERT INTO users (name, email, password)
                VALUES ($1, $2, $3)
                RETURNING id, password`,
              [name, email, hashedPassword],
              (error, results) => {
                if (error) {
                  return res.status(500).send({
                    message: "Something went wrong",
                    errors: error.message,
                  });
                }
                return res.json({
                  message: "You are now registered. Please log in",
                  results,
                });
              }
            );
          }
        }
      );
    }
  } catch (error) {
    return res.status(500).send({
      message: "Something went wrong",
      errors: error.message,
    });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    let errors = [];

    if (!email || !password) {
      errors.push({ message: "Please enter all fields" });
    }
    if (errors.length > 0) {
      return res.json({ errors, email, password });
    } else {
      pool.query(
        `SELECT * FROM users
        WHERE email = $1`,
        [email],
        async (err, results) => {
          if (err) {
            return res.status(500).json({
              message: "Something went wrong",
              errors: err.message,
            });
          }
          const { rows } = results;
          //   console.log(rows[0].password + " :: " + password);
          const dePassword = await bcryptjs.compare(password, rows[0].password);
          if (!(rows[0].email && dePassword))
            return res.status(201).json({
              message: "Bad Credentials",
            });
          const token = generateAuthToken(rows[0].email, "24h");
          return res
            .cookie("internship", token, {
              path: "/",
              expires: new Date(Date.now() + 86400000),
              httpOnly: true,
              sameSite: "strict",
            })
            .status(201)
            .json({
              message: "User Loggedin successfully",
              email: rows[0].email,
              name: rows[0].name,
            })
            .end();
        }
      );
    }
  } catch (error) {
    return res.status(500).send({
      message: "Something went wrong",
      errors: error.message,
    });
  }
});

app.post("/create", verifyUserToken, async (req, res) => {
  try {
    const { question, answer } = req.body;
    const email = req.email_token;
    console.log(email);
    let errors = [];
    if (!question || !answer) {
      errors.push({ message: "Please enter all fields" });
    }
    if (errors.length > 0) {
      return res.json({ errors, email, password });
    } else {
      pool.query(
        `SELECT * FROM users
        WHERE email = $1`,
        [email],
        async (err, results) => {
          if (err) {
            return res.status(500).json({
              message: "Something went wrong",
              errors: err.message,
            });
          }
          const { rows } = results;
          pool.query(
            `INSERT INTO flashcards (question, answer,uid)
                VALUES ($1, $2, $3)`,
            [question, answer, rows[0].id],
            (error) => {
              if (error) {
                return res.status(500).send({
                  message: "Something went wrong",
                  errors: error.message,
                });
              }
              return res.json({
                message: "Data added",
              });
            }
          );
        }
      );
    }
  } catch (error) {
    return res.status(500).send({
      message: "Something went wrong",
      errors: error.message,
    });
  }
});

app.get("/read", verifyUserToken, (req, res) => {
  try {
    const email = req.email_token;
    pool.query(
      `SELECT * FROM users
        WHERE email = $1`,
      [email],
      (err, results) => {
        if (err) {
          return res.status(500).json({
            message: "Something went wrong",
            errors: err.message,
          });
        }
        const user = results.rows[0];
        pool.query(
          `SELECT * FROM flashcards
        WHERE uid = $1`,
          [user.id],
          (err, { rows }) => {
            if (err) {
              return res.status(500).json({
                message: "Something went wrong",
                errors: err.message,
              });
            }
            const cards = rows;
            return res.json({
              message: "Data fetched",
              cards,
            });
          }
        );
      }
    );
  } catch (error) {
    return res.status(500).send({
      message: "Something went wrong",
      errors: error.message,
    });
  }
});

app.delete("/delete/:id", verifyUserToken, (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const email = req.email_token;
    pool.query(
      `SELECT * FROM users
        WHERE email = $1`,
      [email],
      (err) => {
        if (err) {
          return res.status(500).json({
            message: "Something went wrong",
            errors: err.message,
          });
        }
      }
    );
    pool.query(
      `DELETE FROM flashcards
        WHERE id = $1 `,
      [id],
      (err) => {
        if (err) {
          return res.status(500).json({
            message: "Something went wrong",
            errors: err.message,
          });
        }
        return res.json({
          message: "Data deleted",
        });
      }
    );
  } catch (error) {
    return res.status(500).send({
      message: "Something went wrong",
      errors: error.message,
    });
  }
});

app.patch("/update", verifyUserToken, (req, res) => {
  try {
    const { id, question, answer } = req.body;
    let errors = [];

    if (!id || !question || !answer) {
      errors.push({ message: "Please enter all fields" });
    }
    if (errors.length > 0) {
      return res.json({ errors, id, question, answer });
    } else {
      const email = req.email_token;
      pool.query(
        `SELECT * FROM users
        WHERE email = $1`,
        [email],
        (err) => {
          if (err) {
            return res.status(500).json({
              message: "Something went wrong",
              errors: err.message,
            });
          }
        }
      );
      pool.query(`SELECT * FROM flashcards where id=$1`, [id], (err) => {
        if (err) {
          return res.status(500).json({
            message: "Something went wrong",
            errors: err.message,
          });
        }
      });
      pool.query(
        `UPDATE flashcards SET question=$1, answer=$2`,
        [question, answer],
        (err, { rows }) => {
          if (err) {
            return res.status(500).json({
              message: "Something went wrong",
              errors: err.message,
            });
          }
          const upd = rows;
          return res.json({
            message: "Data updated",
            upd,
          });
        }
      );
    }
  } catch (error) {
    return res.status(500).send({
      message: "Something went wrong",
      errors: error.message,
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
