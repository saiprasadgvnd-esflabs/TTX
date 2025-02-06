import { Router, Request, Response } from "express";
import pool from "../db";
import { Scenario } from "../models/scenario";

const router = Router();

// Create a new scenario
router.post("/", async (req: any, res: any) => {
  try {
    const { name, client_id, execrise_id } = req.body;

    if (!name || !client_id || !execrise_id) {
      return res.status(400).json({ error: "Name, client_id, and execrise_id are required" });
    }

    // Validate client_id
    const clientCheck = await pool.query("SELECT * FROM public.client WHERE id = $1", [client_id]);
    if (clientCheck.rows.length === 0) {
      return res.status(404).json({ error: `Client ID ${client_id} does not exist` });
    }

    // Validate execrise_id
    const exerciseCheck = await pool.query("SELECT * FROM public.execrise WHERE id = $1", [execrise_id]);
    if (exerciseCheck.rows.length === 0) {
      return res.status(404).json({ error: `Exercise ID ${execrise_id} does not exist` });
    }

    const result = await pool.query<Scenario>(
      "INSERT INTO public.scenarios (name, client_id, execrise_id) VALUES ($1, $2, $3) RETURNING *",
      [name, client_id, execrise_id]
    );

    res.status(201).json({ message: "Scenario created successfully", scenario: result.rows[0] });
  } catch (error) {
    console.error("❌ Error creating scenario:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get all scenarios
router.get("/", async (req: any, res: any) => {
  try {
    const result = await pool.query<Scenario>("SELECT * FROM public.scenarios ORDER BY id");
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("❌ Error fetching scenarios:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get scenarios by client ID
router.get("/client/:client_id", async (req: any, res: any) => {
  try {
    const clientId = parseInt(req.params.client_id, 10);
    if (isNaN(clientId)) {
      return res.status(400).json({ error: "Invalid client ID" });
    }

    // Validate client ID
    const clientCheck = await pool.query("SELECT * FROM public.client WHERE id = $1", [clientId]);
    if (clientCheck.rows.length === 0) {
      return res.status(404).json({ error: `Client ID ${clientId} not found` });
    }

    const result = await pool.query<Scenario>("SELECT * FROM public.scenarios WHERE client_id = $1 ORDER BY id", [clientId]);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("❌ Error fetching scenarios by client ID:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get scenario by ID
router.get("/:id", async (req: any, res: any) => {
  try {
    const scenarioId = parseInt(req.params.id, 10);
    if (isNaN(scenarioId)) {
      return res.status(400).json({ error: "Invalid scenario ID" });
    }

    const result = await pool.query<Scenario>("SELECT * FROM public.scenarios WHERE id = $1", [scenarioId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: `Scenario with ID ${scenarioId} not found` });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error fetching scenario:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
