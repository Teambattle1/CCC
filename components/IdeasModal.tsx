import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  Lightbulb,
  Clock,
  CheckCircle2,
  Loader2,
  User
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { submitIdea, fetchIdeas, IdeaTodo } from '../lib/supabase';

interface IdeasModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const IdeasModal: React.FC<IdeasModalProps> = ({ isOpen, onClose }) => {
  const { profile, logAction } = useAuth();
  const [ideas, setIdeas] = useState<IdeaTodo[]>([]);
  const [newIdea, setNewIdea] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadIdeas();
    }
  }, [isOpen]);

  const loadIdeas = async () => {
    setIsLoading(true);
    const data = await fetchIdeas();
    setIdeas(data);
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIdea.trim() || !profile || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    const authorName = profile.name || profile.email;
    const result = await submitIdea(newIdea.trim(), authorName, profile.email);

    if (result.success) {
      setNewIdea('');
      setShowSuccess(true);
      logAction('SUBMIT_IDEA', `Submitted idea: ${newIdea.trim().substring(0, 50)}...`);
      await loadIdeas();
      setTimeout(() => setShowSuccess(false), 3000);
    } else {
      setSubmitError(result.error || 'Kunne ikke indsende idé');
    }

    setIsSubmitting(false);
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

  // Parse author from description HTML
  const parseAuthor = (description: string | null): string => {
    if (!description) return 'Ukendt';
    const match = description.match(/<strong>Fra:<\/strong>\s*([^<(]+)/);
    return match ? match[1].trim() : 'Ukendt';
  };

  // Parse idea text from description HTML
  const parseIdeaText = (description: string | null, title: string): string => {
    if (!description) return title.replace('💡 IDÉBOKS: ', '');
    const match = description.match(/<strong>Idé:<\/strong>\s*([^<]+)/);
    return match ? match[1].trim() : title.replace('💡 IDÉBOKS: ', '');
  };

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
            <h3 className="text-sm font-medium text-gray-400 mb-3">
              Har du en god idé til appen? Skriv den her — den sendes direkte til Maria.
            </h3>
            <div className="flex gap-3">
              <textarea
                value={newIdea}
                onChange={(e) => setNewIdea(e.target.value)}
                placeholder="Beskriv din idé eller forslag..."
                className="flex-1 bg-battle-grey border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-battle-orange resize-none"
                maxLength={500}
                rows={2}
              />
              <button
                type="submit"
                disabled={!newIdea.trim() || isSubmitting}
                className="px-4 py-3 bg-battle-orange hover:bg-battle-orange/80 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2 self-end"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>

            {/* Success message */}
            {showSuccess && (
              <div className="mt-3 flex items-center gap-2 text-green-400 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>Din idé er sendt til Maria — tak!</span>
              </div>
            )}

            {/* Error message */}
            {submitError && (
              <div className="mt-3 text-red-400 text-sm">{submitError}</div>
            )}
          </form>

          {/* Ideas list */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-400">
              {isLoading
                ? 'Henter idéer...'
                : ideas.length > 0
                  ? `${ideas.length} idé${ideas.length !== 1 ? 'er' : ''} indsendt`
                  : 'Ingen idéer endnu — vær den første!'}
            </h3>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 text-battle-orange animate-spin" />
              </div>
            ) : (
              ideas.map(idea => (
                <div
                  key={idea.id}
                  className={`bg-battle-black rounded-xl p-4 border-l-4 ${
                    idea.resolved ? 'border-green-500/50 opacity-60' : 'border-yellow-500/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Lightbulb className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                      idea.resolved ? 'text-green-500' : 'text-yellow-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm leading-relaxed">
                        {parseIdeaText(idea.description, idea.title)}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 flex-wrap">
                        <span className="flex items-center gap-1 text-gray-400">
                          <User className="w-3 h-3" />
                          {parseAuthor(idea.description)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(idea.created_at)}
                        </span>
                        {idea.resolved && (
                          <span className="flex items-center gap-1 text-green-400">
                            <CheckCircle2 className="w-3 h-3" />
                            Behandlet
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 text-center text-xs text-gray-500">
          Alle idéer sendes som opgave til Maria — de bedste forslag bliver implementeret
        </div>
      </div>
    </div>
  );
};

export default IdeasModal;
