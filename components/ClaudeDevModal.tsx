import React, { useState } from 'react';
import { X, Terminal, Copy, Check } from 'lucide-react';

interface ClaudeDevModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PROJECTS = [
  { name: 'OCC', path: '/Users/thomas/GITHUB/OCC' },
  { name: 'hest', path: '/Users/thomas/GITHUB/hest' },
  { name: 'Teambattle Website', path: '/Users/thomas/GITHUB/teambattle-website' },
  { name: 'EventDay', path: '/Users/thomas/GITHUB/eventday' },
];

const ClaudeDevModal: React.FC<ClaudeDevModalProps> = ({ isOpen, onClose }) => {
  const [selectedProject, setSelectedProject] = useState(PROJECTS[0]);
  const [copied, setCopied] = useState<'netlify' | 'claude' | null>(null);

  if (!isOpen) return null;

  const netlifyCommand = `cd "${selectedProject.path}" && netlify dev`;
  const claudeCommand = `cd "${selectedProject.path}" && claude`;

  const copyToClipboard = async (text: string, type: 'netlify' | 'claude') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const runScript = () => {
    // Try to open the script - this may not work in all browsers
    window.open(`file:///Users/thomas/GITHUB/OCC/scripts/start-claude-dev.sh`);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-battle-grey border border-battle-orange/30 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Terminal className="w-6 h-6 text-purple-500" />
            <h2 className="text-xl font-bold text-white">Claude Dev Environment</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Project Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Vælg Projekt
            </label>
            <select
              value={selectedProject.name}
              onChange={(e) => setSelectedProject(PROJECTS.find(p => p.name === e.target.value) || PROJECTS[0])}
              className="w-full bg-battle-black border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-battle-orange transition-colors"
            >
              {PROJECTS.map(project => (
                <option key={project.name} value={project.name}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          {/* Commands */}
          <div className="space-y-4">
            <p className="text-sm text-gray-400">
              Åbn to terminal vinduer og kør disse kommandoer:
            </p>

            {/* Terminal 1: Netlify */}
            <div className="bg-battle-black rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-green-400">Terminal 1 - Netlify Dev</span>
                <button
                  onClick={() => copyToClipboard(netlifyCommand, 'netlify')}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
                >
                  {copied === 'netlify' ? (
                    <><Check className="w-3 h-3" /> Kopieret</>
                  ) : (
                    <><Copy className="w-3 h-3" /> Kopier</>
                  )}
                </button>
              </div>
              <code className="text-sm text-battle-orange break-all">
                {netlifyCommand}
              </code>
            </div>

            {/* Terminal 2: Claude */}
            <div className="bg-battle-black rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-purple-400">Terminal 2 - Claude</span>
                <button
                  onClick={() => copyToClipboard(claudeCommand, 'claude')}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
                >
                  {copied === 'claude' ? (
                    <><Check className="w-3 h-3" /> Kopieret</>
                  ) : (
                    <><Copy className="w-3 h-3" /> Kopier</>
                  )}
                </button>
              </div>
              <code className="text-sm text-purple-400 break-all">
                {claudeCommand}
              </code>
            </div>
          </div>

          {/* Script Button */}
          <div className="pt-4 border-t border-white/10">
            <p className="text-xs text-gray-500 mb-3">
              Eller kør scriptet direkte fra Terminal:
            </p>
            <div className="bg-battle-black rounded-lg p-3">
              <code className="text-xs text-gray-400">
                ~/GITHUB/OCC/scripts/start-claude-dev.sh
              </code>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-white/10">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors"
          >
            Luk
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClaudeDevModal;
