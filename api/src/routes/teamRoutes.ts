import { Router, Request, Response } from "express";
import pool from "../db";
import { Team } from "../models/team";

const router = Router();

// Create a new team
router.post("/", async (req: any, res: any) => {
  try {
    const { client_id, name, roles } = req.body; // roles is an array of role names

    if (!client_id || !name || !Array.isArray(roles) || roles.length === 0) {
      return res.status(400).json({ error: "Client ID, team name, and roles are required" });
    }

    // Check if client exists
    const clientCheck = await pool.query("SELECT * FROM public.client WHERE id = $1", [client_id]);
    if (clientCheck.rows.length === 0) {
      return res.status(404).json({ error: "Client ID does not exist" });
    }

    // Retrieve role IDs based on role names
    const roleQuery = `SELECT id FROM public.roles WHERE name = ANY($1) AND client_id = $2`;
    const roleResult = await pool.query(roleQuery, [roles, client_id]);

    if (roleResult.rows.length === 0) {
      return res.status(400).json({ error: "No matching roles found for the given client" });
    }

    const roleIds = roleResult.rows.map((row) => row.id);

    // Insert team into the database
    const insertQuery = `INSERT INTO public.teams (client_id, role_id, name) VALUES ($1, $2, $3) RETURNING *`;
    const result = await pool.query(insertQuery, [client_id, roleIds, name]);

    res.status(201).json({ message: "Team created successfully", team: result.rows[0] });
  } catch (error) {
    console.error("❌ Error creating team:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get all teams by client ID
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

    // Fetch teams for the given client ID
    const result = await pool.query("SELECT * FROM public.teams WHERE client_id = $1 ORDER BY id", [clientId]);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("❌ Error fetching teams by client ID:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get team by team ID
router.get("/:team_id", async (req: any, res: any) => {
  try {
    const teamId = parseInt(req.params.team_id, 10);
    if (isNaN(teamId)) {
      return res.status(400).json({ error: "Invalid team ID" });
    }

    const result = await pool.query("SELECT * FROM public.teams WHERE id = $1", [teamId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Team not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error fetching team:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Bulk create teams
router.post("/bulk", async (req: any, res: any) => {
    try {
      const { teams } = req.body; // teams should be an array of { client_id, name, roles }
  
      if (!Array.isArray(teams) || teams.length === 0) {
        return res.status(400).json({ error: "A list of teams is required" });
      }
  
      const insertedTeams = [];
  
      for (const team of teams) {
        const { client_id, name, roles } = team;
  
        if (!client_id || !name || !Array.isArray(roles) || roles.length === 0) {
          return res.status(400).json({ error: "Each team must have a client_id, name, and roles" });
        }
  
        // Check if client exists
        const clientCheck = await pool.query("SELECT * FROM public.client WHERE id = $1", [client_id]);
        if (clientCheck.rows.length === 0) {
          return res.status(404).json({ error: `Client ID ${client_id} does not exist` });
        }
  
        // Retrieve role IDs based on role names
        const roleQuery = `SELECT id FROM public.roles WHERE name = ANY($1) AND client_id = $2`;
        const roleResult = await pool.query(roleQuery, [roles, client_id]);
  
        if (roleResult.rows.length === 0) {
          return res.status(400).json({ error: `No matching roles found for client ID ${client_id}` });
        }
  
        const roleIds = roleResult.rows.map((row) => row.id);
  
        // Insert the team into the database
        const insertQuery = `INSERT INTO public.teams (client_id, role_id, name) VALUES ($1, $2, $3) RETURNING *`;
        const result = await pool.query(insertQuery, [client_id, roleIds, name]);
  
        insertedTeams.push(result.rows[0]);
      }
  
      res.status(201).json({ message: "Teams created successfully", teams: insertedTeams });
    } catch (error) {
      console.error("❌ Error creating multiple teams:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  

export default router;
