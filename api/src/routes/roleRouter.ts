import { Router, Request, Response } from "express";
import pool from "../db";
import { Role } from "../models/role";

const router = Router();

// Create a new role
router.post("/", async (req: any, res: any) => {
  try {
    const { client_id, name } = req.body;
    if (!client_id || !name) {
      return res.status(400).json({ error: "Client ID and Role name are required" });
    }

    // Check if client_id exists in client table
    const clientCheck = await pool.query("SELECT * FROM public.client WHERE id = $1", [client_id]);
    if (clientCheck.rows.length === 0) {
      return res.status(404).json({ error: "Client ID does not exist" });
    }

    const result = await pool.query<Role>(
      "INSERT INTO public.roles (client_id, name) VALUES ($1, $2) RETURNING *",
      [client_id, name]
    );

    res.status(201).json({ message: "Role created", role: result.rows[0] });
  } catch (error) {
    console.error("❌ Error creating role:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get all roles
router.get("/", async (req: any, res: any) => {
  try {
    const result = await pool.query<Role>("SELECT * FROM public.roles ORDER BY id");
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("❌ Error fetching roles:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get role by ID
router.get("/:id", async (req: any, res: any) => {
  try {
    const roleId = parseInt(req.params.id, 10);
    if (isNaN(roleId)) {
      return res.status(400).json({ error: "Invalid role ID" });
    }

    const result = await pool.query<Role>("SELECT * FROM public.roles WHERE id = $1", [roleId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Role not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error fetching role:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// Get all roles by client ID
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
  
      // Fetch roles for the given client ID
      const result = await pool.query("SELECT * FROM public.roles WHERE client_id = $1 ORDER BY id", [clientId]);
  
      res.status(200).json(result.rows);
    } catch (error) {
      console.error("❌ Error fetching roles by client ID:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  
// Create multiple roles for a given client
router.post("/bulk", async (req: any, res: any) => {
    try {
      const { client_id, roles } = req.body;
  
      if (!client_id || !Array.isArray(roles) || roles.length === 0) {
        return res.status(400).json({ error: "Client ID and a list of roles are required" });
      }
  
      // Check if client_id exists in the client table
      const clientCheck = await pool.query("SELECT * FROM public.client WHERE id = $1", [client_id]);
      if (clientCheck.rows.length === 0) {
        return res.status(404).json({ error: "Client ID does not exist" });
      }
  
      // Ensure roles are properly formatted as an array of objects with a `name` key
      const values: string[] = [];
      const params: any[] = [];
      
      roles.forEach((role, index) => {
        if (!role.name) {
          throw new Error(`Role at index ${index} is missing a name`);
        }
        values.push(`($1, $${index + 2})`);
        params.push(role.name);
      });
  
      // Construct the bulk insert query
      const insertQuery = `INSERT INTO public.roles (client_id, name) VALUES ${values.join(", ")} RETURNING *;`;
  
      const result = await pool.query(insertQuery, [client_id, ...params]);
      
      res.status(201).json({ message: "Roles created successfully", roles: result.rows });
    } catch (error) {
      console.error("❌ Error creating multiple roles:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  

export default router;
