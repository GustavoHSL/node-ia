import dotenv from 'dotenv'
import OpenAI from 'openai';
dotenv.config();

async function main() {

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})    

const response = await client.responses.create({
    model:"gpt-4o-mini",
    input: "Escreva uma curta historia de dormir sobre unicornio",
    max_output_tokens: 80
});

console.log(response.output[0].content[0].text);
}

main()