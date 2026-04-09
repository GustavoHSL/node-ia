import dotenv from 'dotenv'
import OpenAI from 'openai';
import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';
import { ChatCompletionMessageParam, ChatCompletionTool } from 'openai/resources/chat/completions';
import { produtosEmEstoque, produtosEmFalta } from './database';
dotenv.config();
const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})    

const schema = z.object({
    produtos : z.array(z.string()),
});

const tools: ChatCompletionTool[] = [
    {
        type: 'function',
        function: {
            name: 'produtos_em_estoque',
            description: 'Lista de produtos que estão em estoque',
            parameters: {
                type: 'object',
                properties: {},
                additionalProperties: false,                       
            },
            strict: true, 
        }
    },
    {
        type: 'function',
        function: {
            name: 'produtos_em_falta',
            description: 'Lista de produtos que estão em falta.',
            parameters: {
                type: 'object',
                properties: {},   
                additionalProperties: false,                        
            },
            strict: true,
        }
    },
]

export const generateProducts = async (message : string) => {
    const messages: ChatCompletionMessageParam[] = [
            {
            role: "developer",
            content: "Liste três produtos que atendam a necessidade do usuário. Considere apenas produtos em estoque"
        },
        {
            role: "user", //developer, assistant
            content: message,
        },  
    ];

    const completion = await client.chat.completions.parse({
            model:"gpt-4o-mini",
            max_tokens: 80,
            response_format: zodResponseFormat(schema, 'produtos_schema'),
            //temperature: 0.2, //balanço entre determinismo x criativo de 0(determinista) a 2(criativo), 
            tools,
            messages,
        });


        if(completion.choices[0].message.refusal){
            throw new Error("Refusal");
        }

        const {tool_calls} = completion.choices[0].message;
        if(tool_calls){
            const [tool_call] = tool_calls;
            const toolsMap = {
                produtos_em_estoque: produtosEmEstoque,
                produtos_em_falta: produtosEmFalta,
            }
            const functionToCall = toolsMap[tool_call.function.name];
            if(!functionToCall){
                throw new Error("Function not found");
            }
            const result = functionToCall(tool_call.parsed_arguments);
        

        console.log(completion.choices[0].message.tool_calls);

        return completion.choices[0].message.parsed;
};