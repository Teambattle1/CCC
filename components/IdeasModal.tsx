import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  X,
  Send,
  Lightbulb,
  ThumbsUp,
  Trash2,
  Clock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Idea {
  id: string;
  text: string;
  author: string;
  authorEmail: string;
  timestamp: string;
  votes: number;
  votedBy: string[];
}

interface IdeasModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Load ideas from localStorage
const loadIdeas = (): Idea[] => {
  try {
    const saved = localStorage.getItem('occ_ideas');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load ideas:', e);
  }
  return [];
};

// Save ideas to localStorage
const saveIdeas = (ideas: Idea[]) => {
  try {
    localStorage.setItem('occ_ideas', JSON.stringify(ideas));
  } catch (e) {
    console.error('Failed to save ideas:', e);
  }
};

const IdeasModal: React.FC<IdeasModalProps> = ({ isOpen, onClose }) => {
  const { profile, logAction } = useAuth();
  const [ideas, setIdeas] = useState<Idea[]>(loadIdeas);
  const [newIdea, setNewIdea] = useState('');

  useEffect(() => {
    if (isOpen) {
      setIdeas(loadIdeas());
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIdea.trim() || !profile) return;

    const idea: Idea = {
      id: Date.now().toString(),
      text: newIdea.trim(),
      author: profile.name || profile.email,
      authorEmail: profile.email,
      timestamp: new Date().toISOString(),
      votes: 0,
      votedBy: []
    };

    const updatedIdeas = [idea, ...ideas];
    setIdeas(updatedIdeas);
    saveIdeas(updatedIdeas);
    setNewIdea('');
    logAction('SUBMIT_IDEA', `Submitted idea: ${idea.text.substring(0, 50)}...`);

    // Send email notification
    const subject = encodeURIComponent(`Ny idé fra ${idea.author} - OCC`);
    const body = encodeURIComponent(`Ny idé indsendt:\n\n"${idea.text}"\n\nFra: ${idea.author} (${idea.authorEmail})\nTidspunkt: ${new Date(idea.timestamp).toLocaleString('da-DK')}`);

    // Open mailto link in background (hidden iframe approach won't work for mailto)
    // Instead, we'll use a fetch to a webhook or just store locally
    // For now, we'll create a mailto link that users can click if they want to share directly

    // Alternative: Use a simple webhook/form service
    // For simplicity, let's just show a toast that the idea was saved
  };

  const handleVote = (ideaId: string) => {
    if (!profile) return;

    const updatedIdeas = ideas.map(idea => {
      if (idea.id === ideaId) {
        const hasVoted = idea.votedBy.includes(profile.email);
        if (hasVoted) {
          // Remove vote
          return {
            ...idea,
            votes: idea.votes - 1,
            votedBy: idea.votedBy.filter(email => email !== profile.email)
          };
        } else {
          // Add vote
          return {
            ...idea,
            votes: idea.votes + 1,
            votedBy: [...idea.votedBy, profile.email]
          };
        }
      }
      return idea;
    });

    setIdeas(updatedIdeas);
    saveIdeas(updatedIdeas);
  };

  const handleDelete = (ideaId: string) => {
    const idea = ideas.find(i => i.id === ideaId);
    if (!idea) return;

    // Only author or admin can delete
    if (profile?.email !== idea.authorEmail && profile?.role !== 'ADMIN') return;

    if (!confirm('Er du sikker på at du vil slette denne idé?')) return;

    const updatedIdeas = ideas.filter(i => i.id !== ideaId);
    setIdeas(updatedIdeas);
    saveIdeas(updatedIdeas);
    logAction('DELETE_IDEA', `Deleted idea: ${idea.text.substring(0, 50)}...`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('da-DK', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Sort by votes (descending)
  const sortedIdeas = [...ideas].sort((a, b) => b.votes - a.votes);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-battle-grey border border-battle-orange/30 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Lightbulb className="w-6 h-6 text-yellow-400" />
            <h2 className="text-xl font-bold text-white">Idéer & Forslag</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Submit new idea */}
          <form onSubmit={handleSubmit} className="bg-battle-black rounded-xl p-4">
            <h3 className="text-sm font-medium text-gray-400 mb-3">Har du en god idé til appen?</h3>
            <div className="flex gap-3">
              <input
                type="text"
                value={newIdea}
                onChange={(e) => setNewIdea(e.target.value)}
                placeholder="Skriv din idé her..."
                className="flex-1 bg-battle-grey border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-battle-orange"
                maxLength={500}
              />
              <button
                type="submit"
                disabled={!newIdea.trim()}
                className="px-4 py-3 bg-battle-orange hover:bg-battle-orange/80 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>
          </form>

          {/* Ideas list */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-400">
              {ideas.length > 0 ? `${ideas.length} idé${ideas.length !== 1 ? 'er' : ''}` : 'Ingen idéer endnu - vær den første!'}
            </h3>

            {sortedIdeas.map(idea => {
              const hasVoted = profile ? idea.votedBy.includes(profile.email) : false;
              const canDelete = profile?.email === idea.authorEmail || profile?.role === 'ADMIN';

              return (
                <div
                  key={idea.id}
                  className="bg-battle-black rounded-xl p-4 flex gap-4"
                >
                  {/* Vote button */}
                  <button
                    onClick={() => handleVote(idea.id)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                      hasVoted
                        ? 'bg-battle-orange/20 text-battle-orange'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <ThumbsUp className={`w-5 h-5 ${hasVoted ? 'fill-current' : ''}`} />
                    <span className="text-sm font-bold">{idea.votes}</span>
                  </button>

                  {/* Idea content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white">{idea.text}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      <span className="font-medium text-gray-400">{idea.author}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(idea.timestamp)}
                      </span>
                    </div>
                  </div>

                  {/* Delete button */}
                  {canDelete && (
                    <button
                      onClick={() => handleDelete(idea.id)}
                      className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors self-start"
                      title="Slet idé"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 text-center text-xs text-gray-500">
          Stem på de bedste idéer - de mest populære vil blive overvejet til fremtidige opdateringer
        </div>
      </div>
    </div>
  );
};

export default IdeasModal;
