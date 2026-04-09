import express from 'express';
import dotenv from 'dotenv'
import OpenAI from 'openai';
import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';

dotenv.config();
const app = express();

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})    

app.use(express.json());

const schema = z.object({
    produtos : z.array(z.string()),
});

app.post("/generate", async(req,res) => {
    try{
        const completion = await client.chat.completions.parse({
            model:"gpt-4o-mini",
            max_completion_tokens: 80,
            response_format: zodResponseFormat(schema, 'produtos_schema'),
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

        const output = completion.choices[0].message.parsed;

        if(!output){
            res.status(500).end();
            return;
        }

        if(completion.choices[0].message.refusal){
            res.status(400).json({error: 'Refusal'})
        }

        res.json(output);
}catch(e){
    console.error(e);
    res.status(500).json({error: 'Internal Server Error'})
}

})

export default app;