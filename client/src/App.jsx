import { useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

function App() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!text && !file) {
      setError('Please upload a resume or paste text.');
      return;
    }

    const formData = new FormData();
    if (file) formData.append('resume', file);
    if (text) formData.append('text', text);
    if (name) formData.append('name', name);
    if (email) formData.append('email', email);

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/analyze`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to analyze resume');
      }

      const data = await response.json();
      setResult(data.result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event) => {
    const selected = event.target.files?.[0];
    if (!selected) {
      setFile(null);
      return;
    }

    if (selected.type !== 'application/pdf' && selected.type !== 'text/plain') {
      setError('Only PDF or plain text files are supported.');
      event.target.value = '';
      return;
    }

    setError('');
    setFile(selected);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Resume Insight
          </h1>
          <p className="text-gray-600 text-lg">
            Upload your resume or paste text to get AI-powered insights.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <form 
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 border border-white/20" 
            onSubmit={handleSubmit}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <label className="block">
                <span className="text-sm font-semibold text-gray-700 mb-2 block">Name</span>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Shreyas Parab"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-gray-700 mb-2 block">Email</span>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="example@gmail.com"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </label>
            </div>

            <label className="block mb-4">
              <span className="text-sm font-semibold text-gray-700 mb-2 block">Resume File (PDF or TXT)</span>
              <input 
                type="file" 
                accept=".pdf,.txt,text/plain" 
                onChange={handleFileChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
              />
            </label>

            <label className="block mb-4">
              <span className="text-sm font-semibold text-gray-700 mb-2 block">Or paste resume text</span>
              <textarea 
                value={text} 
                onChange={(e) => setText(e.target.value)} 
                placeholder="Paste resume content here..." 
                rows={8}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-y"
              />
            </label>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing...
                </span>
              ) : (
                'Analyze Resume'
              )}
            </button>
          </form>

          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 border border-white/20">
            {!result && !loading && (
              <div className="flex items-center justify-center h-full min-h-[300px]">
                <p className="text-gray-400 italic text-center">Results will appear here.</p>
              </div>
            )}
            {loading && (
              <div className="flex items-center justify-center h-full min-h-[300px]">
                <p className="text-gray-600">Analyzing resume...</p>
              </div>
            )}
            {result && (
              <div className="space-y-6">
                <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                  <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                    Summary
                  </h2>
                  <p className="text-gray-700 leading-relaxed">{result.summary}</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                  <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                    Key Skills
                  </h2>
                  <ul className="space-y-2">
                    {result.skills?.map((skill, index) => (
                      <li key={index} className="flex items-center text-gray-700">
                        <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-2"></span>
                        {skill}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 bg-gradient-to-r from-pink-50 to-indigo-50 rounded-xl border border-pink-100">
                  <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-pink-500 rounded-full mr-2"></span>
                    Suggested Roles
                  </h2>
                  <ul className="space-y-2">
                    {result.suggested_roles?.map((role, index) => (
                      <li key={index} className="flex items-center text-gray-700">
                        <span className="w-1.5 h-1.5 bg-pink-400 rounded-full mr-2"></span>
                        {role}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default App;
