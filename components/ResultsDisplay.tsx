import React from 'react';
import { Article, ColumnDefinition, ColumnKey } from '../types';
import { ChevronLeftIcon, ChevronRightIcon, SearchIcon } from './Icons';

interface ResultsDisplayProps {
  data: Article[];
  allColumns: ColumnDefinition[];
  visibleColumns: Set<ColumnKey>;
  onToggleColumn: (key: ColumnKey) => void;
  filter: string;
  onFilterChange: (filter: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
}

const ColumnToggleButton: React.FC<{
  column: ColumnDefinition;
  isVisible: boolean;
  onToggle: (key: ColumnKey) => void;
}> = ({ column, isVisible, onToggle }) => (
  <button
    onClick={() => onToggle(column.key)}
    className={`px-3 py-1 text-sm font-medium rounded-full transition-all duration-200 border ${
      isVisible
        ? 'bg-blue-600 text-white border-blue-500'
        : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border-gray-600'
    }`}
    aria-pressed={isVisible}
  >
    {column.label}
  </button>
);


const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  data,
  allColumns,
  visibleColumns,
  onToggleColumn,
  filter,
  onFilterChange,
  currentPage,
  totalPages,
  onPageChange,
  totalItems
}) => {

  const renderCellContent = (article: Article, key: ColumnKey) => {
    const value = article[key];
    switch (key) {
      case 'pmid':
        return (
          <a href={`https://pubmed.ncbi.nlm.nih.gov/${value}`} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-400 font-medium">
            {value}
          </a>
        );
      case 'doi':
        return (
          <a href={`https://doi.org/${value}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
            {value}
          </a>
        );
      case 'title':
      case 'journal':
          return <span title={String(value)}>{String(value)}</span>
      case 'authors':
          const authorsList = Array.isArray(value) ? value.join(', ') : String(value);
          return <span title={authorsList}>{authorsList}</span>
      case 'is_research_article':
        return value ? 'Yes' : 'No';
      case 'relative_citation_ratio':
      case 'nih_percentile':
        return typeof value === 'number' ? value.toFixed(2) : 'N/A';
      default:
        return value !== null ? String(value) : 'N/A';
    }
  };

  return (
    <section className="bg-gray-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-gray-700 shadow-lg">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-teal-200 mb-3 sm:mb-0">
          Publication Results
        </h2>
      </div>
       
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
            <p className="text-sm text-gray-400 mb-2">Toggle Columns:</p>
            <div className="flex flex-wrap gap-2">
                {allColumns.map(col => (
                <ColumnToggleButton 
                    key={col.key}
                    column={col}
                    isVisible={visibleColumns.has(col.key)}
                    onToggle={onToggleColumn}
                />
                ))}
            </div>
        </div>
        <div className="relative">
             <label htmlFor="table-filter" className="text-sm text-gray-400 mb-2 block">Filter Results:</label>
             <div className="absolute inset-y-0 left-0 flex items-center pl-3 pt-7 pointer-events-none">
                 <SearchIcon />
             </div>
            <input 
                id="table-filter"
                type="text"
                value={filter}
                onChange={(e) => onFilterChange(e.target.value)}
                placeholder="Filter by title, author, etc."
                className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 pl-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
            />
        </div>
       </div>


      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800">
            <tr>
              {allColumns.map(col => visibleColumns.has(col.key) && (
                  <th key={col.key} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {col.label}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="bg-gray-900 divide-y divide-gray-800">
            {data.map((article) => (
              <tr key={article.pmid} className="hover:bg-gray-800/60 transition-colors duration-200">
                {allColumns.map(col => visibleColumns.has(col.key) && (
                    <td key={col.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 max-w-xs truncate">
                      {renderCellContent(article, col.key)}
                    </td>
                  )
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {totalPages > 0 && (
        <div className="flex items-center justify-between mt-4 px-2">
            <span className="text-sm text-gray-400">
                Showing <span className="font-medium text-gray-200">{Math.min(1 + (currentPage - 1) * 10, totalItems)}</span> to <span className="font-medium text-gray-200">{Math.min(currentPage * 10, totalItems)}</span> of <span className="font-medium text-gray-200">{totalItems}</span> results
            </span>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-md bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed disabled:text-gray-500 transition-colors"
                    aria-label="Previous page"
                >
                    <ChevronLeftIcon />
                </button>
                <span className="text-sm font-medium text-gray-300">
                    Page {currentPage} of {totalPages}
                </span>
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-md bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed disabled:text-gray-500 transition-colors"
                    aria-label="Next page"
                >
                    <ChevronRightIcon />
                </button>
            </div>
        </div>
      )}

    </section>
  );
};

export default ResultsDisplay;