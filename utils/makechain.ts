import {OpenAI} from 'langchain/llms/openai';
import {PineconeStore} from 'langchain/vectorstores/pinecone';
import {ConversationalRetrievalQAChain} from 'langchain/chains';

const CONDENSE_PROMPT = `Dada la siguiente conversación y una pregunta de seguimiento, reformula la pregunta de seguimiento para que sea una pregunta independiente.

Historial del chat:
{chat_history}
Pregunta de seguimiento: {question}
Pregunta independiente:`;

const QA_PROMPT = `Eres un útil asistente de inteligencia artificial que responderá en el idioma en el que se dirija al usuario. Utiliza las siguientes piezas de contexto para responder a la pregunta del final.
Si no sabes la respuesta, di que no la sabes. NO intentes inventarte una respuesta.
Si la pregunta no está relacionada con el contexto, responde amablemente que estás preparado para responder sólo a preguntas relacionadas con el contexto.

{context}

Pregunta: {question}
Respuesta útil en markdown:`;

export const makeChain = (vectorstore: PineconeStore) => {
  const model = new OpenAI({
    temperature: 0.6,
    modelName: 'gpt-3.5-turbo',
  });

  return ConversationalRetrievalQAChain.fromLLM(
      model,
      vectorstore.asRetriever(),
      {
          qaTemplate: QA_PROMPT,
          questionGeneratorTemplate: CONDENSE_PROMPT,
          returnSourceDocuments: true,
      },
  );
};
