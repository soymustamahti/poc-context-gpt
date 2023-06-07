import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { pinecone } from '@/utils/pinecone-client';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { PINECONE_INDEX_NAME, PINECONE_NAME_SPACE } from '@/config/pinecone';
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';

/* Nom du répertoire à partir duquel vous pouvez récupérer vos fichiers
   Veillez à ajouter vos fichiers PDF dans le dossier "docs".
*/
const filePath = 'docs';

export const run = async () => {
  try {
    /*charger les documents bruts à partir de tous les fichiers du répertoire */
    const directoryLoader = new DirectoryLoader(filePath, {
      '.pdf': (path) => new PDFLoader(path),
    });

    const rawDocs = await directoryLoader.load();

    /* Diviser le texte en morceaux */
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const docs = await textSplitter.splitDocuments(rawDocs);
    console.log('split docs', docs);

    console.log('creating vector store...');
    /*créer et stocker les embeddings dans le vectorStore*/
    const embeddings = new OpenAIEmbeddings();
    const index = pinecone.Index(PINECONE_INDEX_NAME); //changer pour votre propre nom d'index

    //insérer les documents PDF
    await PineconeStore.fromDocuments(docs, embeddings, {
      pineconeIndex: index,
      namespace: PINECONE_NAME_SPACE,
      textKey: 'text',
    });
  } catch (error) {
    console.log('error', error);
    throw new Error('Failed to ingest your data');
  }
};

(async () => {
  await run();
  console.log('ingestion complete');
})();
