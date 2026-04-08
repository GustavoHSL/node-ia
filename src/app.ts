import express from 'express';
import dotenv from 'dotenv'
import OpenAI from 'openai';
import z from 'zod';
dotenv.config();
const app = express();

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})    

app.use(express.json());

app.post("/generate", async(req,res) => {
        const completion = await client.chat.completions.create({
            model:"gpt-4o-mini",
            max_completion_tokens: 80,
            //JSON_MODE
            response_format: { type: 'json_object'},
            //temperature: 0.2, //balanço entre determinismo x criativo de 0(determinista) a 2(criativo), 
            messages: [
                {
                    role: "developer",
                    content: "Liste três produtos que atendam a necessidade do usuário. Responda em JSON no formato {produtos: string[]"
                },
                {
                    role: "user", //developer, assistant
                    content: req.body.message,
                },
            ],
        });

        const output = JSON.parse(completion.choices[0].message.content ?? "");

        const schema = z.object({
            produtos: z.array(z.string()),
        })

        const result = schema.safeParse(output);

        if(!result.success){
            res.status(500).end();
            return;
        }

        res.json(output);
})

export default app;