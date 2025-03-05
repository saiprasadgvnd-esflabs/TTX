import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import pool from "../db";
import { OpenAI } from "openai";
import { json } from "stream/consumers";

const router = Router();

// Create a new user session
router.post("/", async (req: any, res: any) => {
    try {
        const { exercise_scenario_session_id, user_name, role_id } = req.body;

        if (!exercise_scenario_session_id || !user_name || !role_id) {
            return res.status(400).json({ error: "exercise_scenario_session_id, user_name, and role_id are required" });
        }
        const exerciseResult = await pool.query(
            "select id from exercise_scenario_sessions where session_id = $1",
            [exercise_scenario_session_id]
        )
        
        // Get the team_id based on role_id
        const teamResult = await pool.query(
            "SELECT id FROM public.teams WHERE $1 = ANY(role_id) LIMIT 1",
            [role_id]
        );

        if (teamResult.rows.length === 0) {
            return res.status(404).json({ error: `No team found for role ID ${role_id}` });
        }

        const team_id = teamResult.rows[0].id;
        const session_id = uuidv4();
        const exericise_session_id = exerciseResult.rows[0].id
        console.log(exericise_session_id)
        const result = await pool.query(
            "INSERT INTO public.user_sessions (exercise_scenario_session_id, session_id, user_name, team_id, role_id, started_on) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *",
            [exericise_session_id, session_id, user_name, team_id, role_id]
        );

        res.status(201).json({ message: "User session created successfully", userSession: result.rows[0] });
    } catch (error) {
        console.error("❌ Error creating user session:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Get all user sessions
router.get("/", async (req: any, res: any) => {
    try {
        const result = await pool.query("SELECT * FROM public.user_sessions ORDER BY started_on DESC");
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("❌ Error fetching user sessions:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.get('/result/:session_id', async (req:any, res:any) => {
    try {
        const { session_id } = req.params
        // var session_query = `select * from user_sessions where session_id = '${session_id}'`;
        // var session_result = await pool.query(session_query);
        // console.log(session_result)
        // var report = session_result.rows[0].report;
        
        // if(report){
        //     return res.status(200).json(report);
        // } 
        const result = await pool.query(`SELECT public.get_exercise_results_by_session_id('${session_id}') AS results_json;`)
        var response = result.rows[0].results_json;
        let query = `seeing the result of a Table Top Exercise for the Role ${response.role_name} for the scenario ${response.scenario_name} - ${response.scenario_description} \n the user asnwers are as follows \n\n ${JSON.stringify(response.answers)} \n\n\n\n now seeing all the details can you write an insignt on the progression of user's response time, which should key insight helping the user to improve this skils. in not more that 10-20 words `
        var time_insignt =await callAI(query);
        response.time_insignt = time_insignt
        query = `seeing the result of a Table Top Exercise for the Role ${response.role_name} for the scenario ${response.scenario_name} - ${response.scenario_description} \n the user NIST Scores are as follows \n\n ${JSON.stringify(response.nistScores)} \n\n\n\n now seeing all the details can you write an insignt on the progression of user's Nist Scores, which should be helping the user to improve this skils. in not more that 10-20 words `
        response.nist_insight = await callAI(query);
        query = `seeing the result of a Table Top Exercise for the Role ${response.role_name} for the scenario ${response.scenario_name} - ${response.scenario_description} \n the user Simulated Finicial Impact are as follows \n\n Total simulated amount $${response.base_amount} and Amount After the Exericse is $${response.final_amount}, the KPI is to descrease the Finincial Impact As High As possible  \n\n\n\n now seeing all the details can you write an insignt on the Financial Impact Analysis, which should be helping the user to improve this skils. in not more that 10-20 words `
        response.finincial_impact_insight = await callAI(query);
        query = `seeing the result of a Table Top Exercise for the Role 
        ${response.role_name} for the scenario ${response.scenario_name} - ${response.scenario_description} \n 
        the user entire report are as follows \n\n ${JSON.stringify(response)} \n\n\n\n 
        now seeing all the details can you write an insignt on the Key Strengths of user's entire report .in not more that 10-20 words `
        response.strengths = await callAI(query)
        query = `seeing the result of a Table Top Exercise for the Role ${response.role_name} for the scenario ${response.scenario_name} - ${response.scenario_description} \n the user entire report are as follows \n\n ${JSON.stringify(response)} \n\n\n\n now seeing all the details can you write an insignt on the Areas for Improvement from user's entire report .in not more that 10-20 words `
        response.area_of_improvement = await callAI(query)
        query = `seeing the result of a Table Top Exercise for the Role ${response.role_name} 
        for the scenario ${response.scenario_name} - ${response.scenario_description} \n 
        the user entire report are as follows \n\n ${JSON.stringify(response)} \n\n\n\n now seeing all the details can you write an insignt on the 
        Recommended Actions 
        from user's entire report .
        in not more that 10-20 words `
        response.recommended_actions = await callAI(query)

        query = `seeing the result of a Table Top Exercise for the Role ${response.role_name} 
        for the scenario ${response.scenario_name} - ${response.scenario_description} \n 
        the user entire report are as follows \n\n ${JSON.stringify(response)} \n\n\n\n now seeing all the details 
        can you get the list of complaince_referneces for all the wrong answers
        
        from user's entire report .
        in not more that 10-20 words `
        response.references = await callAI(query)
        // console.log(response)
        let swot_analysis = await getSWOTAnalysis(response)
        console.log(swot_analysis)
        response.swot_analysis = JSON.parse(swot_analysis);
        query = `UPDATE public.user_sessions
       SET report = $1
     WHERE session_id = $2;`
     var report = JSON.stringify(response)
     await pool.query(query, [report, session_id])
        res.status(200).json(response)
    } catch (error) {
        console.error(error)
        res.status(500).json({'error':'Unable to get the result'})
    }
})
async function getSWOTAnalysis(data:any) {
    const openai = new OpenAI({
        apiKey:process.env.OPENAI_API_KEY
      });
      try {
        const response = await openai.chat.completions.create({
            model:'gpt-4o',
            messages:[{
                "role": "system",
                "content": "You are an AI assistant that evaluates cybersecurity tabletop exercises using the SWOT framework. score out of 100"
            },
            {
                role:'user',
                content:`Evaluate the following response to the Ransomware Tabletop Exercise Scenario using the SWOT framework: ${data}`
            }
        ],
        "response_format": {
        "type": "json_schema",
        "json_schema": {
            "name": "swot_analysis",
            "description": "Structured SWOT analysis response",
            "schema": {
                "type": "object",
                "properties": {
                    "strengths": {
                        "type": "object",
                        "properties": {
                            "score": { "type": "integer" },
                            "details": { "type": "string" }
                        },
                        "required": ["score", "details"]
                    },
                    "weaknesses": {
                        "type": "object",
                        "properties": {
                            "score": { "type": "integer" },
                            "details": { "type": "string" }
                        },
                        "required": ["score", "details"]
                    },
                    "opportunities": {
                        "type": "object",
                        "properties": {
                            "score": { "type": "integer" },
                            "details": { "type": "string" }
                        },
                        "required": ["score", "details"]
                    },
                    "threats": {
                        "type": "object",
                        "properties": {
                            "score": { "type": "integer" },
                            "details": { "type": "string" }
                        },
                        "required": ["score", "details"]
                    }
                },
                "required": ["strengths", "weaknesses", "opportunities", "threats"]
            }
        }
    }
        })
        const result = response.choices[0]?.message?.content ?? "";
    // console.log(result)
    return result.trim();
      } catch (error) {
        throw error;

      }
}



export async function callAI(query: string): Promise<string> {
  // 1. Configure OpenAI
  
  const openai = new OpenAI({
    apiKey:process.env.OPENAI_API_KEY
  });

  try {
    // 2. Call the Chat Completion endpoint
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // or 'gpt-4', if you have access
      messages: [
        {
            role:"system",
            content:"User a AI System who only asnwers what ever is asked for in a consise way."
        },
        {
          role: "user",
          content: query,
          
        },
      ],
      
      max_tokens: 100,
      temperature: 0.7,
    });

    // 3. Extract the assistant's response text
    
    const result = response.choices[0]?.message?.content ?? "";
    // console.log(result)
    return result.trim();
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    throw error; // Or handle error as needed
  }
}

export default router;
