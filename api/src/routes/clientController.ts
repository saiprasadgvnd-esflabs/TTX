import { Router } from "express";
import pool from "../db";

const router = Router();

// Create a new client
router.post("/", async (req:any, res:any) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Client name is required" });
    }

    const result = await pool.query(
      "INSERT INTO public.client (name) VALUES ($1) RETURNING *",
      [name]
    );
    res.status(201).json({ message: "Client created", client: result.rows[0] });
  } catch (error) {
    console.error("Error creating client:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get all clients
router.get("/", async (req:any, res:any) => {
  try {
    const result = await pool.query("SELECT * FROM public.client ORDER BY id");
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching clients:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get client by ID
router.get("/:id", async (req:any, res:any) => {
  try {
    const clientId = parseInt(req.params.id);
    if (isNaN(clientId)) {
      return res.status(400).json({ error: "Invalid client ID" });
    }

    const result = await pool.query("SELECT * FROM public.client WHERE id = $1", [clientId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Client not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching client:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
