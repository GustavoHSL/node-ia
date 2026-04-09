import dotenv from 'dotenv'
import OpenAI from 'openai';
import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';
dotenv.config();
const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})    

const schema = z.object({
    produtos : z.array(z.string()),
});

export const generateProducts = async (message : string) => {
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
                    content: message,
                },
            ],
        });


        if(completion.choices[0].message.refusal){
            throw new Error("Refusal");
        }

        return completion.choices[0].message.parsed;
};