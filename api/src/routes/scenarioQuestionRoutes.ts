import { Router, Request, Response } from "express";
import pool from "../db";
import { ScenarioQuestion } from "../models/scenarioQuestion";

const router = Router();

// Create a new scenario question
router.post("/", async (req: any, res: any) => {
  try {
    
    const { scenario_id, role_ids, execrise_id, scenario_inject_id, question, options, question_type_id, compliance_reference, nist_framework_id, swot_category_id,question_category_id } = req.body;
    console.log(req.body)
    
    if (!scenario_id || !role_ids || !execrise_id || !scenario_inject_id || !question || !options || !question_type_id ||!nist_framework_id ||!question_category_id ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Validate scenario_id
    const scenarioCheck = await pool.query("SELECT * FROM public.scenarios WHERE id = $1", [scenario_id]);
    if (scenarioCheck.rows.length === 0) {
      return res.status(404).json({ error: `Scenario ID ${scenario_id} does not exist` });
    }

    // Validate role_id
    for (let role = 0; role < role_ids.length; role++) {
      const role_id = role_ids[role];
      const roleCheck = await pool.query("SELECT * FROM public.roles WHERE id = $1", [role_id]);
    if (roleCheck.rows.length === 0) {
      return res.status(404).json({ error: `Role ID ${role_id} does not exist` });
    }  
    }
    

    // Validate exercise_id
    const exerciseCheck = await pool.query("SELECT * FROM public.execrise WHERE id = $1", [execrise_id]);
    if (exerciseCheck.rows.length === 0) {
      return res.status(404).json({ error: `Exercise ID ${execrise_id} does not exist` });
    }

    // Validate scenario_inject_id
    const scenarioInjectCheck = await pool.query("SELECT * FROM public.scenerio_inject WHERE id = $1", [scenario_inject_id]);
    if (scenarioInjectCheck.rows.length === 0) {
      return res.status(404).json({ error: `Scenario Inject ID ${scenario_inject_id} does not exist` });
    }

    // Validate question_type_id
    const questionTypeCheck = await pool.query("SELECT * FROM public.question_types WHERE id = $1", [question_type_id]);
    if (questionTypeCheck.rows.length === 0) {
      return res.status(404).json({ error: `Question Type ID ${question_type_id} does not exist` });
    }
    var results = []
    for (let i = 0; i < role_ids.length; i++) {
      const role_id = role_ids[i];
      const result = await pool.query<ScenarioQuestion>(
        "INSERT INTO public.senerio_question (scenario_id, role_id, exercise_id, scenario_inject_id, question, options, question_type_id, compliance_reference, nist_framework_id, swot_category_id, question_based_on_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *",
        [scenario_id, role_id, execrise_id, scenario_inject_id, question, JSON.stringify(options), question_type_id, compliance_reference, nist_framework_id, swot_category_id,question_category_id    ]
      );  
      results.push(result.rows[0])
    }
    

    res.status(201).json({ message: "Scenario Question created successfully", scenarioQuestion: results });
  } catch (error) {
    console.error("❌ Error creating scenario question:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get all scenario questions
router.get("/", async (req: any, res: any) => {
  try {
    const result = await pool.query<ScenarioQuestion>("SELECT * FROM public.senerio_question ORDER BY id");
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("❌ Error fetching scenario questions:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get scenario questions by scenario ID
router.get("/scenario/:scenario_id", async (req: any, res: any) => {
  try {
    const scenarioId = parseInt(req.params.scenario_id, 10);
    if (isNaN(scenarioId)) {
      return res.status(400).json({ error: "Invalid scenario ID" });
    }

    const result = await pool.query<ScenarioQuestion>("SELECT * FROM public.senerio_question WHERE scenario_id = $1 ORDER BY id", [scenarioId]);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("❌ Error fetching scenario questions by scenario ID:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/inject/:scenario_inject_id", async (req: any, res: any) => {
  try {
    const scenarioInjectId = parseInt(req.params.scenario_inject_id, 10);
    if (isNaN(scenarioInjectId)) {
      return res.status(400).json({ error: "Invalid scenario inject ID" });
    }

    const result = await pool.query<ScenarioQuestion>("SELECT * FROM public.senerio_question WHERE scenario_inject_id = $1 ORDER BY id", [scenarioInjectId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: `No questions found for scenario inject ID ${scenarioInjectId}` });
    }

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("❌ Error fetching scenario questions by scenario inject ID:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// Route to get JSON structure using PostgreSQL function
router.get("/user-session/:session_id", async (req: any, res: any) => {
    try {
        const session_id = req.params.session_id;
        console.log(session_id)
        if (!session_id ) {
            return res.status(400).json({ error: "Invalid session ID" });
        }

        // Call the PostgreSQL function to retrieve JSON output
        const result = await pool.query("SELECT get_exercise_scenario_json($1) AS json_result", [
            session_id
        ]);

        if (result.rows.length === 0 || !result.rows[0].json_result) {
            return res.status(404).json({ error: "No data found for the given parameters" });
        }

        res.status(200).json(result.rows[0].json_result);
    } catch (error) {
        console.error("❌ Error fetching structured scenario data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});



// Get scenario question by ID
router.get("/:id", async (req: any, res: any) => {
  try {
    const scenarioQuestionId = parseInt(req.params.id, 10);
    if (isNaN(scenarioQuestionId)) {
      return res.status(400).json({ error: "Invalid scenario question ID" });
    }

    const result = await pool.query<ScenarioQuestion>("SELECT * FROM public.senerio_question WHERE id = $1", [scenarioQuestionId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: `Scenario Question with ID ${scenarioQuestionId} not found` });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error fetching scenario question:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
