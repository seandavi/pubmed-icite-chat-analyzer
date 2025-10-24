import React, { useState, useCallback, useMemo } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { Article, ChatMessage, ColumnDefinition, ColumnKey } from './types';
import { fetchICiteData } from './services/iciteService';
import InputForm from './components/InputForm';
import ResultsDisplay from './components/ResultsDisplay';
import ChatInterface from './components/ChatInterface';

const ALL_COLUMNS: ColumnDefinition[] = [
  { key: 'pmid', label: 'PMID' },
  { key: 'title', label: 'Title' },
  { key: 'authors', label: 'Authors' },
  { key: 'year', label: 'Year' },
  { key: 'journal', label: 'Journal' },
  { key: 'is_research_article', label: 'Research Article' },
  { key: 'citation_count', label: 'Citations' },
  { key: 'relative_citation_ratio', label: 'RCR' },
  { key: 'nih_percentile', label: 'NIH %' },
  { key: 'doi', label: 'DOI' },
];

const DEFAULT_VISIBLE_COLUMNS: ColumnKey[] = ['pmid', 'title', 'year', 'journal', 'relative_citation_ratio', 'nih_percentile'];
const MAX_PMIDS = 200;
const ITEMS_PER_PAGE = 10;

const App: React.FC = () => {
  const [iciteData, setIciteData] = useState<Article[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [isBotReplying, setIsBotReplying] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chat, setChat] = useState<Chat | null>(null);
  const [visibleColumns, setVisibleColumns] = useState<Set<ColumnKey>>(new Set(DEFAULT_VISIBLE_COLUMNS));
  const [filter, setFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const handleToggleColumn = useCallback((key: ColumnKey) => {
    setVisibleColumns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  }, []);

  const initializeChat = useCallback((data: Article[]) => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const systemInstruction = `You are an expert biomedical research assistant. The user has provided the following publication data from the NIH iCite database in JSON format. Your task is to answer questions based *only* on this data. Do not use any external knowledge. If the answer cannot be found in the provided data, state that clearly. Be concise and clear in your answers. Here is the data:\n${JSON.stringify(data, null, 2)}`;
      
      const newChat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: systemInstruction,
        }
      });
      setChat(newChat);
      setMessages([{ role: 'model', parts: [{ text: "Hello! I've analyzed the publication data you provided. How can I help you explore these results?" }] }]);
    } catch (e) {
      setError("Failed to initialize the chat service. Please check your Gemini API key.");
      console.error(e);
    }
  }, []);

  const handleFetchData = useCallback(async (pmids: string) => {
    const pmidList = pmids.split(/[,\s]+/).map(id => id.trim()).filter(id => id);
    if (pmidList.length === 0) {
      setError("Please enter at least one PubMed ID.");
      return;
    }
    if (pmidList.length > MAX_PMIDS) {
      setError(`Please enter no more than ${MAX_PMIDS} PubMed IDs at a time.`);
      return;
    }

    setIsLoadingData(true);
    setError(null);
    setIciteData([]);
    setMessages([]);
    setChat(null);
    setFilter('');
    setCurrentPage(1);

    try {
      const data = await fetchICiteData(pmidList);
      if (data.length === 0) {
        setError("No data found for the provided PubMed IDs. Please check the IDs and try again.");
      } else {
        setIciteData(data);
        initializeChat(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoadingData(false);
    }
  }, [initializeChat]);


  const handleSendMessage = useCallback(async (userMessage: string) => {
    if (!chat || isBotReplying) return;

    const newUserMessage: ChatMessage = { role: 'user', parts: [{ text: userMessage }] };
    setMessages(prev => [...prev, newUserMessage]);
    setIsBotReplying(true);

    try {
      const response = await chat.sendMessage({ message: userMessage });
      const botMessage: ChatMessage = { role: 'model', parts: [{ text: response.text }] };
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      console.error(err);
      const errorMessage: ChatMessage = { role: 'model', parts: [{ text: "Sorry, I encountered an error. Please try again." }] };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsBotReplying(false);
    }
  }, [chat, isBotReplying]);
  
  const filteredData = useMemo(() => {
    if (!filter) return iciteData;
    const lowercasedFilter = filter.toLowerCase();
    return iciteData.filter(article => {
        const titleMatch = (article.title || '').toLowerCase().includes(lowercasedFilter);
        const authorsMatch = (article.authors || []).join(', ').toLowerCase().includes(lowercasedFilter);
        const journalMatch = (article.journal || '').toLowerCase().includes(lowercasedFilter);
        const pmidMatch = String(article.pmid).includes(lowercasedFilter);
        return pmidMatch || titleMatch || authorsMatch || journalMatch;
    });
  }, [iciteData, filter]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredData, currentPage]);
  
  const handleFilterChange = useCallback((newFilter: string) => {
      setFilter(newFilter);
      setCurrentPage(1);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col items-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">
            PubMed iCite Chat Analyzer
          </h1>
          <p className="mt-2 text-lg text-gray-400">
            Fetch publication data and ask questions with the power of Gemini.
          </p>
        </header>

        <main className="space-y-8">
          <InputForm onSubmit={handleFetchData} isLoading={isLoadingData} maxPmid={MAX_PMIDS} />

          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {iciteData.length > 0 && (
            <>
              <ResultsDisplay 
                data={paginatedData}
                allColumns={ALL_COLUMNS}
                visibleColumns={visibleColumns}
                onToggleColumn={handleToggleColumn}
                filter={filter}
                onFilterChange={handleFilterChange}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={filteredData.length}
              />
              <ChatInterface 
                messages={messages} 
                onSendMessage={handleSendMessage} 
                isLoading={isBotReplying} 
              />
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;