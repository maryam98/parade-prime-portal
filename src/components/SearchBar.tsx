import { Search, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  delay?: number;
}

const SearchBar = ({ value, onChange, placeholder, delay = 0.3 }: SearchBarProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="mt-8 max-w-lg mx-auto relative"
    >
      <Search className="absolute top-3.5 start-4 h-5 w-5 text-muted-foreground pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full ps-12 pe-10 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring shadow-lg"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute top-3.5 end-4 text-muted-foreground hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </motion.div>
  );
};

export default SearchBar;
