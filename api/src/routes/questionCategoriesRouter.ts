import { Router, Request, Response } from "express";
import pool from "../db";
const router = Router();

router.get('/', async (req:any, res:any) =>{
    try {
        var result = await pool.query('select * from question_categories');
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({'message':'Unable to get Swot Categories'})
    }
})

export default router;