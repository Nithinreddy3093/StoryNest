import React from 'react';
import { GenreCardInfo } from '../types';
import { useApp } from '../context/AppContext';
import {
  Heart,
  Theater,
  Smile,
  HeartCrack,
  FileText,
  CassetteTape,
  Users,
  Search,
  Star,
  MoreHorizontal,
  ArrowRight,
} from 'lucide-react';
import { motion } from 'motion/react';

interface GenreCardProps {
  genre: GenreCardInfo;
  onSelectGenre: (genreName: string) => void;
}

export const GenreCard: React.FC<GenreCardProps> = ({ genre, onSelectGenre }) => {
  const { stories } = useApp();

  const realCount = stories.filter(
    (s) =>
      s.status === 'published' &&
      (s.genre === genre.name || s.secondaryGenre === genre.name)
  ).length;

  const getIcon = () => {
    const iconProps = { className: 'w-6 h-6 text-amber-400' };
    switch (genre.iconName) {
      case 'Heart':
        return <Heart {...iconProps} />;
      case 'Drama':
        return <Theater {...iconProps} />;
      case 'Smile':
        return <Smile {...iconProps} />;
      case 'HeartCrack':
        return <HeartCrack {...iconProps} />;
      case 'FileText':
        return <FileText {...iconProps} />;
      case 'CassetteTape':
        return <CassetteTape {...iconProps} />;
      case 'Users':
        return <Users {...iconProps} />;
      case 'Search':
        return <Search {...iconProps} />;
      case 'Star':
        return <Star {...iconProps} />;
      default:
        return <MoreHorizontal {...iconProps} />;
    }
  };

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.2 }}
      onClick={() => onSelectGenre(genre.id === 'More Genres' ? 'All' : genre.name)}
      className="group relative h-80 rounded-2xl overflow-hidden border border-slate-800 hover:border-amber-500/50 shadow-xl cursor-pointer flex flex-col justify-end p-6 transition-all duration-300"
    >
      {/* Background Image */}
      <img
        src={genre.coverImage}
        alt={genre.name}
        referrerPolicy="no-referrer"
        onError={(e) => {
          (e.target as HTMLImageElement).src =
            'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1000&auto=format&fit=crop';
        }}
        className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 brightness-[0.45] group-hover:brightness-[0.55]"
        loading="lazy"
      />

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#070b14] via-[#070b14]/70 to-transparent" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Icon Circle */}
        <div className="w-13 h-13 rounded-full border border-amber-500/50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center mb-3.5 group-hover:border-amber-400 group-hover:scale-110 group-hover:bg-amber-950/40 transition-all duration-300 shadow-lg shadow-amber-500/10">
          {getIcon()}
        </div>

        {/* Genre Name */}
        <h3 className="font-serif-heading text-xl font-bold text-slate-100 group-hover:text-amber-300 transition-colors mb-1.5">
          {genre.name}
        </h3>

        {/* Description */}
        <p className="text-xs text-slate-400 line-clamp-2 mb-4 max-w-[220px] leading-relaxed">
          {genre.description}
        </p>

        {/* Dynamic Story Count and Arrow */}
        <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400/90 group-hover:text-amber-300 transition-colors">
          <span>{genre.id === 'More Genres' ? 'Explore All' : `${realCount} ${realCount === 1 ? 'Story' : 'Stories'}`}</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </motion.div>
  );
};
