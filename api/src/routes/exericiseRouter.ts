import { Router, Request, Response } from "express";
import pool from "../db";
import { Exercise } from "../models/exercise";

const router = Router();

// Create a new exercise
router.post("/", async (req: any, res: any) => {
  try {
    const { name, time, exercise_simulated_amount, client_id } = req.body;
    console.log(req.body)
    if (!name || !time || !exercise_simulated_amount || !client_id) {
      
      return res.status(400).json({ error: "Name, time, execrise_simulated_amount, and client_id are required" });
    }

    // Check if client exists
    const clientCheck = await pool.query("SELECT * FROM public.client WHERE id = $1", [client_id]);
    if (clientCheck.rows.length === 0) {
      return res.status(404).json({ error: "Client ID does not exist" });
    }

    const result = await pool.query<Exercise>(
      "INSERT INTO public.execrise (name, time, execrise_simulated_amount, client_id) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, time, exercise_simulated_amount, client_id]
    );

    res.status(201).json({ message: "Exercise created successfully", exercise: result.rows[0] });
  } catch (error) {
    console.error("❌ Error creating exercise:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get all exercises
router.get("/", async (req: any, res: any) => {
  try {
    const result = await pool.query<Exercise>("SELECT * FROM public.execrise ORDER BY id");
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("❌ Error fetching exercises:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get exercises by client ID
router.get("/client/:client_id", async (req: any, res: any) => {
  try {
    const clientId = parseInt(req.params.client_id, 10);
    if (isNaN(clientId)) {
      return res.status(400).json({ error: "Invalid client ID" });
    }

    // Check if client exists
    const clientCheck = await pool.query("SELECT * FROM public.client WHERE id = $1", [clientId]);
    if (clientCheck.rows.length === 0) {
      return res.status(404).json({ error: "Client not found" });
    }

    // Fetch exercises for the given client ID
    const result = await pool.query<Exercise>("SELECT * FROM public.execrise WHERE client_id = $1 ORDER BY id", [clientId]);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("❌ Error fetching exercises by client ID:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get exercise by ID
router.get("/:id", async (req: any, res: any) => {
  try {
    const exerciseId = parseInt(req.params.id, 10);
    if (isNaN(exerciseId)) {
      return res.status(400).json({ error: "Invalid exercise ID" });
    }

    const result = await pool.query<Exercise>("SELECT * FROM public.execrise WHERE id = $1", [exerciseId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Exercise not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error fetching exercise:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
