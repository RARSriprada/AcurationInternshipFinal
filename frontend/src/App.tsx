// App.tsx
import React from 'react';
import { Upload, MessageSquare, FileText, Bot, User, Loader2, Sparkles, Link } from 'lucide-react';

type Message = { role: 'user' | 'assistant'; content: string };
type Page = 'Upload' | 'Summary' | 'Chat';

// 🔥 50 riddles
const riddles = [
  { q: "What has an eye, but cannot see?", a: "A needle" },
  { q: "What is full of holes but still holds water?", a: "A sponge" },
  { q: "What has hands, but can’t clap?", a: "A clock" },
  { q: "What has a neck, but no head?", a: "A bottle" },
  { q: "What gets wetter as it dries?", a: "A towel" },
  { q: "What has to be broken before you can use it?", a: "An egg" },
  { q: "I’m tall when I’m young, and I’m short when I’m old. What am I?", a: "A candle" },
  { q: "What month of the year has 28 days?", a: "All of them" },
  { q: "The more of me you take, the more you leave behind. What am I?", a: "Footsteps" },
  { q: "What goes up but never comes down?", a: "Your age" },
  { q: "What has a thumb and four fingers, but is not a hand?", a: "A glove" },
  { q: "What is always in front of you but can’t be seen?", a: "The future" },
  { q: "What can you catch, but not throw?", a: "A cold" },
  { q: "David’s parents have three sons: Snap, Crackle, and what’s the name of the third son?", a: "David" },
  { q: "I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?", a: "A map" },
  { q: "What has one head, one foot, and four legs?", a: "A bed" },
  { q: "What building has the most stories?", a: "A library" },
  { q: "What is cut on a table, but is never eaten?", a: "A deck of cards" },
  { q: "What kind of band never plays music?", a: "A rubber band" },
  { q: "What can you hold in your left hand but not in your right?", a: "Your right elbow" },
  { q: "What is so fragile that saying its name breaks it?", a: "Silence" },
  { q: "What comes once in a minute, twice in a moment, but never in a thousand years?", a: "The letter 'M'" },
  { q: "What runs all around a backyard, yet never moves?", a: "A fence" },
  { q: "What can fill a room but takes up no space?", a: "Light" },
  { q: "If you drop me I’m sure to crack, but give me a smile and I’ll always smile back. What am I?", a: "A mirror" },
  { q: "What has words, but never speaks?", a: "A book" },
  { q: "I have keys, but open no doors. I have a space, but no room. You can enter, but can’t go outside. What am I?", a: "A keyboard" },
  { q: "I am an odd number. Take away a letter and I become even. What number am I?", a: "Seven" },
  { q: "What can run but never walks, has a mouth but never talks, has a head but never weeps, has a bed but never sleeps?", a: "A river" },
  { q: "What has an endless supply of letters, but starts empty?", a: "A postbox/mailbox" },
  { q: "If you have me, you want to share me. If you share me, you haven't got me. What am I?", a: "A secret" },
  { q: "The more you have of it, the less you see. What is it?", a: "Darkness" },
  { q: "What invention lets you look right through a wall?", a: "A window" },
  { q: "What is it that you have that other people use more than you do?", a: "Your name" },
  { q: "What has a face and two hands but no arms or legs?", a: "A clock" },
  { q: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?", a: "An echo" },
  { q: "You see a boat filled with people. It has not sunk, but when you look again you don’t see a single person on the boat. Why?", a: "All the people were married." },
  { q: "The person who makes it, sells it. The person who buys it never uses it. The person who uses it never knows they're using it. What is it?", a: "A coffin" },
  { q: "What can travel around the world while staying in a corner?", a: "A stamp" },
  { q: "I have no voice, but I can tell you stories. I have no legs, but I can take you to distant lands. What am I?", a: "A book" },
  { q: "What is always coming but never arrives?", a: "Tomorrow" },
  { q: "What has to be broken before you can use it?", a: "A promise" },
  { q: "What can be measured, but has no length, width, or height?", a: "Temperature" },
  { q: "A man is looking at a portrait. Someone asks him whose portrait he is looking at. He replies, 'Brothers and sisters I have none, but that man's father is my father's son.' Who is in the portrait?", a: "His son" },
  { q: "Forward I am heavy, but backward I am not. What am I?", a: "The word 'ton'" },
  { q: "I am the beginning of the end, and the end of time and space. I am essential to creation, and I surround every place. What am I?", a: "The letter 'E'" },
  { q: "What is greater than God, more evil than the devil, the poor have it, the rich need it, and if you eat it, you'll die?", a: "Nothing" },
  { q: "Two in a corner, one in a room, zero in a house, but one in a shelter. What am I?", a: "The letter 'R'" },
  { q: "What appears once in a year, twice in a week, but never in a day?", a: "The letter 'E'" },
  { q: "What five-letter word becomes shorter when you add two letters to it?", a: "Short" }
];

function RiddleBox() {
  const [riddle, setRiddle] = React.useState(() => riddles[Math.floor(Math.random() * riddles.length)]);
  const [userAnswer, setUserAnswer] = React.useState("");
  const [showAnswer, setShowAnswer] = React.useState(false);

  React.useEffect(() => {
    const rotation = setInterval(() => {
      setRiddle(riddles[Math.floor(Math.random() * riddles.length)]);
      setShowAnswer(false);
      setUserAnswer("");
    }, 20000); // auto rotate every 20s
    return () => clearInterval(rotation);
  }, []);

  const handleSubmit = () => setShowAnswer(true);
  const handleNext = () => {
    setRiddle(riddles[Math.floor(Math.random() * riddles.length)]);
    setUserAnswer("");
    setShowAnswer(false);
  };

  return (
    <div className="mt-6 p-6 bg-[#2a2b2f] rounded-lg shadow-lg text-center max-w-md mx-auto">
      <h3 className="text-lg font-bold mb-2">🧩 Quick Riddle Break</h3>
      <p className="mb-4 text-gray-300">{riddle.q}</p>
      <input
        type="text"
        value={userAnswer}
        onChange={(e) => setUserAnswer(e.target.value)}
        placeholder="Type your answer..."
        className="w-full bg-[#202123] border border-gray-600 rounded p-2 text-white"
      />
      <div className="flex justify-center gap-3 mt-4">
        <button onClick={handleSubmit} className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-4 py-2 rounded">Submit</button>
        <button onClick={handleNext} className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded">Next</button>
      </div>
      {showAnswer && <div className="mt-4 text-green-400">✅ Answer: <b>{riddle.a}</b></div>}
    </div>
  );
}

export default function App() {
  const [page, setPage] = React.useState<Page>('Upload');
  const [summary, setSummary] = React.useState('');
  const [chatHistory, setChatHistory] = React.useState<Message[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [sessionId, setSessionId] = React.useState('');
  const [suggestedQuestions, setSuggestedQuestions] = React.useState<string[]>([]);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [processingMessage, setProcessingMessage] = React.useState('');
  const [ocrMeta, setOcrMeta] = React.useState<{ ocr_pages?: number; total_pages?: number }>({});
  const [showRiddle, setShowRiddle] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [showSlowUploadMessage, setShowSlowUploadMessage] = React.useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const pollingIntervalRef = React.useRef<number | null>(null);
  const timeoutRef = React.useRef<number | null>(null);
  const chatEndRef = React.useRef<HTMLDivElement>(null);

  // --- Main Polling Logic ---
  React.useEffect(() => {
    if (isProcessing && sessionId) {
      pollingIntervalRef.current = window.setInterval(async () => {
        try {
          const res = await fetch(`http://127.0.0.1:8000/status/${sessionId}`);
          const data = await res.json();

          if (data.progress) {
            setProcessingMessage(data.progress);
          }

          if (data.status === 'complete') {
            setSummary(data.summary);
            setSuggestedQuestions(data.suggested_questions || []);
            setOcrMeta(data.ocr_meta || {});
            setIsProcessing(false);
            setProcessingMessage("✅ All done!");
            setChatHistory([{ role: 'assistant', content: "I've summarized the document. What would you like to know?" }]);
            if (pollingIntervalRef.current) window.clearInterval(pollingIntervalRef.current);
          } else if (data.status === 'error') {
            setError(data.message || 'An error occurred during processing.');
            setIsProcessing(false);
            if (pollingIntervalRef.current) window.clearInterval(pollingIntervalRef.current);
          }
        } catch {
          setError('⚠️ Could not connect to backend.');
          setIsProcessing(false);
          if (pollingIntervalRef.current) window.clearInterval(pollingIntervalRef.current);
        }
      }, 3000);

      return () => {
        if (pollingIntervalRef.current) window.clearInterval(pollingIntervalRef.current);
      };
    }
  }, [isProcessing, sessionId]);

  // --- Riddle Visibility Logic ---
  React.useEffect(() => {
    const shouldShowRiddle = showSlowUploadMessage || isProcessing;

    if (shouldShowRiddle) {
      timeoutRef.current = window.setTimeout(() => {
        setShowRiddle(true);
      }, 2000);
    } else {
      setShowRiddle(false);
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    }
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [showSlowUploadMessage, isProcessing]);


  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleProcessContent = async (file?: File, url?: string) => {
    setIsLoading(true);
    setIsUploading(true);
    setShowSlowUploadMessage(false);
    setError('');
    setProcessingMessage('');
    setSummary('');
    setSuggestedQuestions([]);
    setChatHistory([]);

    const slowUploadTimer = setTimeout(() => {
      setShowSlowUploadMessage(true);
    }, 20000); // The timeout is now 20 seconds (20000ms)

    const formData = new FormData();
    if (file) formData.append('file', file);
    if (url) formData.append('url', url);

    try {
      const res = await fetch('http://127.0.0.1:8000/process-content/', { method: 'POST', body: formData });
      
      clearTimeout(slowUploadTimer);
      
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || 'Failed to start processing.');
        return;
      }
      setSessionId(data.session_id);
      setIsProcessing(true); 
      setPage('Chat');
    } catch (err) {
      clearTimeout(slowUploadTimer);
      setError('Failed to connect to backend.');
    } finally {
      setIsUploading(false);
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (q: string) => {
    if (!q.trim()) return;
    
    setIsLoading(true);
    setError('');
    
    const userMessage: Message = { role: 'user', content: q };
    setChatHistory(prev => [...prev, userMessage]);

    const lowerCaseQuery = q.trim().toLowerCase();

    // --- 🚀 UPDATED: Expanded local replies ---
    const greetings = ['hi', 'hey', 'hello', 'yo', 'sup', 'howdy', 'greetings'];
    const farewells = ['bye', 'goodbye', 'see you', 'see ya', 'cya', 'farewell', 'take care'];

    if (greetings.includes(lowerCaseQuery)) {
      const assistantMessage: Message = { 
        role: 'assistant', 
        content: 'Hello! How can I help you with your document today?'
      };
      setTimeout(() => {
        setChatHistory(prev => [...prev, assistantMessage]);
        setIsLoading(false);
      }, 500);
      return;
    }

    if (farewells.includes(lowerCaseQuery)) {
      const assistantMessage: Message = { 
        role: 'assistant', 
        content: 'Goodbye! Feel free to return if you have more questions.'
      };
      setTimeout(() => {
        setChatHistory(prev => [...prev, assistantMessage]);
        setIsLoading(false);
      }, 500);
      return;
    }
    // --- End of new logic ---

    try {
      const res = await fetch('http://127.0.0.1:8000/chat/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, chat_history: chatHistory, session_id: sessionId }),
      });
      const data = await res.json();

      const assistantMessage: Message = { 
        role: 'assistant', 
        content: data.success ? data.answer : 'Sorry, I ran into an error.' 
      };
      
      setChatHistory(prev => [...prev, assistantMessage]);

      if (!data.success) {
        setError(data.message || 'Chat failed.');
      }
    } catch {
      setError('Chat backend error.');
      const errorAssistantMessage: Message = {role: 'assistant', content: 'Sorry, I couldn\'t connect to the server.'};
      setChatHistory(prev => [...prev, errorAssistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const Sidebar = () => (
    <aside className="w-72 bg-[#2a2b2f] p-6 flex flex-col flex-shrink-0">
      <div className="flex items-center gap-3 mb-10">
        <span className="text-2xl">🧠</span>
        <div>
          <h1 className="text-xl font-bold text-white">Cognitive Agent</h1>
          <p className="text-sm text-gray-300">Your Document Assistant</p>
        </div>
      </div>
      <nav className="flex flex-col gap-2">
        <NavItem icon={<Upload size={20} />} label="Upload" active={page === 'Upload'} onClick={() => setPage('Upload')} />
        <NavItem icon={<FileText size={20} />} label="Summary" active={page === 'Summary'} onClick={() => setPage('Summary')} disabled={!summary} />
        <NavItem icon={<MessageSquare size={20} />} label="Chat" active={page === 'Chat'} onClick={() => setPage('Chat')} disabled={!sessionId} />
      </nav>
    </aside>
  );

  const NavItem = ({ icon, label, active, onClick, disabled = false }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void; disabled?: boolean }) => (
    <button onClick={onClick} disabled={disabled} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${active ? 'bg-[#7c3aed]' : 'hover:bg-[#343541]'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      {icon}
      <span className="font-semibold">{label}</span>
    </button>
  );

  const UploadPage = () => {
    const [url, setUrl] = React.useState('');
    const [file, setFile] = React.useState<File | null>(null);
    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
    };

    return (
      <div className="bg-[#343541] rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          Upload Your Document <Sparkles size={20} className="text-yellow-400" />
        </h2>
        <p className="text-gray-300 mb-6">Drop a PDF or paste a URL. We’ll summarize and let you chat with it.</p>
        <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-gray-600 rounded-lg p-12 text-center cursor-pointer hover:border-[#7c3aed] transition-colors">
          <Upload size={40} className="mx-auto text-[#7c3aed] mb-4" />
          <p className="font-semibold">{file ? `📄 ${file.name}` : 'Drag & drop your PDF here'}</p>
        </div>
        <input type="file" ref={fileInputRef} onChange={onFileChange} accept=".pdf" className="hidden" />
        <p className="text-center text-gray-400 my-6 font-bold">OR</p>
        <div className="relative">
          <Link size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com"
            className="w-full bg-[#2a2b2f] border border-gray-700 rounded-md p-3 pl-10 focus:border-[#7c3aed]" />
        </div>
        <button onClick={() => handleProcessContent(file || undefined, url || undefined)} disabled={isUploading || isLoading || (!file && !url)}
          className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold py-3 px-4 rounded-md mt-6 flex items-center justify-center gap-2 disabled:bg-gray-600">
          {isUploading || isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : '✨ Process & Begin ✨'}
        </button>
        
        {(isUploading || isLoading) && (
          <div className="mt-6 text-center text-gray-300">
            {showSlowUploadMessage ? (
              <>
                <p>This looks like a scanned PDF/A larger pdf file. Wait a moment...</p>
                {showRiddle && <RiddleBox />}
              </>
            ) : (
              <p>⏳ Uploading and processing...</p>
            )}
          </div>
        )}
      </div>
    );
  };

  const SummaryPage = () => (
    <div className="bg-[#343541] rounded-lg p-8 h-full overflow-y-auto">
      <h2 className="text-2xl font-bold mb-6">📄 Document Summary</h2>
      {summary ? (
        <div className="prose prose-invert max-w-none text-gray-300 whitespace-pre-wrap">{summary}</div>
      ) : (
        <p className="text-gray-300">No summary available. Please upload a document first.</p>
      )}
    </div>
  );

  const ChatPage = () => {
    const [input, setInput] = React.useState('');
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (input.trim() && !isLoading) {
          handleSendMessage(input.trim());
          setInput('');
        }
      }
    };

    if (isProcessing) {
      return (
        <div className="bg-[#343541] rounded-lg p-8 flex flex-col h-full items-center justify-center text-center">
          <Loader2 className="animate-spin h-12 w-12 text-[#7c3aed] mb-4" />
          <h2 className="text-xl mb-2">{processingMessage || "Kicking off analysis..."}</h2>
          <p className="text-gray-400 mb-4">This should only take a few moments.</p>
          {showRiddle && <RiddleBox />}
        </div>
      );
    }

    if (!sessionId) {
        return (
            <div className="bg-[#343541] rounded-lg p-8 text-center">
                <h2 className="text-2xl font-bold mb-4">No Document Loaded</h2>
                <p className="text-gray-300">Please go to the "Upload" page to begin.</p>
            </div>
        )
    }

    return (
      <div className="bg-[#343541] rounded-lg p-8 flex flex-col h-full">
        <h2 className="text-2xl font-bold mb-4">Chat with your Document</h2>
        
        {suggestedQuestions.length > 0 && chatHistory.length <= 1 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {suggestedQuestions.map((q, i) => (
              <button key={i} onClick={() => handleSendMessage(q)} 
                      className="bg-[#2a2b2f] border border-gray-600 text-sm px-3 py-1.5 rounded-full hover:bg-[#3f4049]">
                {q}
              </button>
            ))}
          </div>
        )}

        <div className="flex-grow overflow-y-auto pr-4 -mr-4 mb-4">
          {chatHistory.map((msg, i) => (
            <div key={i} className={`flex gap-4 mb-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && <Bot size={32} className="text-white bg-green-500 p-1.5 rounded-full flex-shrink-0" />}
              <div className={`p-4 rounded-lg max-w-xl ${msg.role === 'user' ? 'bg-[#7c3aed]' : 'bg-[#2a2b2f]'}`}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
              {msg.role === 'user' && <User size={32} className="text-white bg-blue-500 p-1.5 rounded-full flex-shrink-0" />}
            </div>
          ))}
          {isLoading && chatHistory.slice(-1)[0]?.role === 'user' && (
            <div className="flex gap-4 mb-4 justify-start">
              <Bot size={32} className="text-white bg-green-500 p-1.5 rounded-full flex-shrink-0" />
              <div className="p-4 rounded-lg bg-[#2a2b2f]"><Loader2 className="animate-spin h-5 w-5"/></div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        <div className="mt-auto pt-4 border-t border-gray-700">
          <div className="flex gap-2">
            <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
              placeholder="Ask anything about your document..."
              className="flex-1 bg-[#2a2b2f] border border-gray-700 rounded-md p-3 resize-none focus:border-[#7c3aed]" rows={1} />
            <button onClick={() => { handleSendMessage(input); setInput(''); }} disabled={isLoading}
              className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-4 py-3 rounded-md disabled:bg-gray-600">Send</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-[#202123] text-white font-sans">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        {error && <div className="bg-red-500/80 text-white p-3 rounded mb-4 sticky top-0 z-10">{error}</div>}
        {page === 'Upload' && <UploadPage />}
        {page === 'Summary' && <SummaryPage />}
        {page === 'Chat' && <ChatPage />}
      </main>
    </div>
  );
}
