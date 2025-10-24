import React, { useState } from 'react';
import { SearchIcon } from './Icons';

interface InputFormProps {
  onSubmit: (pmids: string) => void;
  isLoading: boolean;
  maxPmid: number;
}

const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading, maxPmid }) => {
  const [pmids, setPmids] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(pmids);
  };

  return (
    <section className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 shadow-lg">
      <form onSubmit={handleSubmit}>
        <div className="flex justify-between items-center mb-2">
            <label htmlFor="pmids" className="block text-sm font-medium text-gray-300">
            Enter PubMed IDs (comma or space-separated)
            </label>
            <span className="text-xs text-gray-500">Max {maxPmid} IDs</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <textarea
            id="pmids"
            value={pmids}
            onChange={(e) => setPmids(e.target.value)}
            placeholder="e.g., 29433190, 31186301 32366947"
            className="flex-grow bg-gray-900 border border-gray-600 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 resize-y min-h-[60px] sm:min-h-0"
            rows={2}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-md transition duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Fetching...</span>
              </>
            ) : (
               <>
                <SearchIcon />
                <span>Fetch Data</span>
               </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
};

export default InputForm;