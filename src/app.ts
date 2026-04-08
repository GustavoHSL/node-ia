import express from 'express';
import dotenv from 'dotenv'
import OpenAI from 'openai';
dotenv.config();
const app = express();

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})    

app.post("/generate", async(req,res) => {
        const completion = await client.chat.completions.create({
            model:"gpt-4o-mini",
            max_completion_tokens: 80,
            //temperature: 0.2, //balanço entre determinismo x criativo de 0(determinista) a 2(criativo), 
            messages: [
                {
                    role: "developer",
                    content: "Use emojis a cada 2 palavras. Gere um texto com no máximo uma frase."
                },
                {
                    role: "user", //developer, assistant
                    content: "Escreva uma mensagem de uma frase sobre hobbits",
                },
                {
                    role: "assistant",
                    content: "Os 🧙‍♂️ hobbits 🥔 são 🌿 criaturas 🏡 adoráveis que 🌈 amam a 🍵 simplicidade e 🌍 aventuras inesperadas!",
                },
                {
                    role: "user",
                    content: "Obrigado",
                }
            ],
        });

        res.json({message: completion.choices[0].message.content});
})

export default app;