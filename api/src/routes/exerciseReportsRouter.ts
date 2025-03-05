import pool from "../db";
import { Request, Response, Router } from "express";
import { callAI } from "./userSessionsRoutes";

var router = Router();

router.get('/team/:team_id/session/:exercise_session_id', async (req:Request, res:Response) => {
    try {
        const { team_id,exercise_session_id } = req.params;
        var result = await pool.query(`select * from generate_team_performance_report('${exercise_session_id}', ${team_id}) as result_json;`)
        res.status(200).json(result.rows[0].result_json);    
    } catch (error) {
        res.status(500).json({'message':'Error Getting The data'})
    }
    

})
router.get('/client/session/:exercise_session_id', async (req:Request, res:Response) => {
    try {
         const {exercise_session_id} = req.params;
         var result = await pool.query(`select * from generate_client_performance_report('${exercise_session_id}') as result_json;`);
         var report = result.rows[0].result_json
         var scenario_result = await pool.query(`select * from public.scenarios where id in( SELECT scenario_id
    FROM exercise_scenario_sessions
    WHERE session_id = '${exercise_session_id}');`)
            let scenario = scenario_result.rows[0]
            var exercise_result = await pool.query(`SELECT id
    FROM exercise_scenario_sessions
    WHERE session_id = '${exercise_session_id}' `)
            var exercise_id = exercise_result.rows[0].id;
            var user_report_result = await pool.query(`select report from user_sessions where exercise_scenario_session_id = ${exercise_id} and report is not null`);
            var user_reports = user_report_result.rows;
            if(user_reports.length > 0){
                // console.log(user_reports)
                let user_strengths = []
                let user_area_of_improvements = []
                let user_recomended_actions = []
                let user_references = []
                for (let i = 0; i < user_reports.length; i++) {
                    const report = user_reports[i].report;
                    user_strengths.push(report.strengths)
                    user_area_of_improvements.push(report.area_of_improvement)
                    user_recomended_actions.push(report.recommended_actions)
                    user_references.push(report.references)
                }
                var ai_strength_insights = await callAI(`i have conducted a table top exercise for the scenario ${scenario.name}-${scenario.description}  and from the org level Consilidation report ${report}, and strengths of all the users ${user_strengths} now seeing all the details can you write an insignt on the Key Strengths of Organization entire report .in not more that 20-40 words`);
                var ai_areas_of_improvements = await callAI(`i have conducted a table top exercise for the scenario 
                    ${scenario.name}-${scenario.description}
                     and from the org level Consilidation report 
                     ${report},
                      and areas of improvements of all the users 
                      ${user_area_of_improvements}.
                       now seeing all the details can you write an insignt on the Key areas of improvements of Organization entire report 
                       .in not more that 20-40 words`);
                var ai_recomended_actions = await callAI(`i have conducted a table top exercise for the scenario 
                        ${scenario.name}-${scenario.description}
                         and from the org level Consilidation report 
                         ${report},
                          and recomended actions of all the users 
                          ${user_recomended_actions}
                           now seeing all the details can you write an insignt on the Key areas of improvements of Organization entire report 
                           .in not more that 20-40 words`);
                var ai_user_references = await callAI(`i have conducted a table top exercise for the scenario 
                        ${scenario.name}-${scenario.description}
                            and from the org level Consilidation report 
                        ${report},
                            and user refreences of all the users 
                            ${user_references}
                            now seeing all the details can you write an insignt on the Key areas of improvements of Organization entire report 
                            .in not more that 20-40 words`);
                report.strengths = ai_strength_insights;
                report.area_of_improvement = ai_areas_of_improvements;
                report.recommended_actions = ai_recomended_actions;
                report.refreences = ai_user_references;
                    
            }else{
                report.strengths = 'Insights will come after users Start Responding';
                report.area_of_improvement = 'Insights will come after users Start Responding';
                report.recommended_actions = 'Insights will come after users Start Responding';
                report.refreences = 'Insights will come after users Start Responding';
            }
        //  
         res.status(200).json(report)
    } catch (error) {
        res.status(500).json({'message':'Error Getting Organization Report'})
    }
})

export default router;