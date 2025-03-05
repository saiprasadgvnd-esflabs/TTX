import { Router, Request, Response } from "express";
import pool from "../db";
import { ScenarioInject } from "../models/scenarioInject";

const router = Router();

// Create a new scenario inject
router.post("/", async (req: any, res: any) => {
  try {
    const { scenario_id, name, data } = req.body;
    console.log(req.body)
    if (!scenario_id || !name || !data) {
      return res.status(400).json({ error: "scenario_id, name, and data are required" });
    }

    // Validate scenario_id
    const scenarioCheck = await pool.query("SELECT * FROM public.scenarios WHERE id = $1", [scenario_id]);
    if (scenarioCheck.rows.length === 0) {
      return res.status(404).json({ error: `Scenario ID ${scenario_id} does not exist` });
    }

    const result = await pool.query<ScenarioInject>(
      "INSERT INTO public.scenerio_inject (scenario_id, name, data) VALUES ($1, $2, $3) RETURNING *",
      [scenario_id, name, JSON.stringify(data)]
    );

    res.status(201).json({ message: "Scenario Inject created successfully", scenarioInject: result.rows[0] });
  } catch (error) {
    console.error("❌ Error creating scenario inject:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get all scenario injects
router.get("/", async (req: any, res: any) => {
  try {
    const result = await pool.query<ScenarioInject>("SELECT * FROM public.scenerio_inject ORDER BY id");
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("❌ Error fetching scenario injects:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get scenario injects by scenario ID
router.get("/scenario/:scenario_id", async (req: any, res: any) => {
  try {
    const scenarioId = parseInt(req.params.scenario_id, 10);
    if (isNaN(scenarioId)) {
      return res.status(400).json({ error: "Invalid scenario ID" });
    }

    // Validate scenario ID
    const scenarioCheck = await pool.query("SELECT * FROM public.scenarios WHERE id = $1", [scenarioId]);
    if (scenarioCheck.rows.length === 0) {
      return res.status(404).json({ error: `Scenario ID ${scenarioId} not found` });
    }

    const result = await pool.query<ScenarioInject>("SELECT * FROM public.scenerio_inject WHERE scenario_id = $1 ORDER BY id", [scenarioId]);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("❌ Error fetching scenario injects by scenario ID:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get scenario inject by ID
router.get("/:id", async (req: any, res: any) => {
  try {
    const scenarioInjectId = parseInt(req.params.id, 10);
    if (isNaN(scenarioInjectId)) {
      return res.status(400).json({ error: "Invalid scenario inject ID" });
    }

    const result = await pool.query<ScenarioInject>("SELECT * FROM public.scenerio_inject WHERE id = $1", [scenarioInjectId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: `Scenario Inject with ID ${scenarioInjectId} not found` });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error fetching scenario inject:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
