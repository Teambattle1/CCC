import React, { useState, useEffect } from 'react';
import { Save, FolderOpen, Trash2, Cloud, CloudOff } from 'lucide-react';
import {
  saveTeamLazerScore,
  loadTeamLazerScore,
  getAllTeamLazerScores,
  deleteTeamLazerScore,
  TeamLazerScore
} from '../lib/supabase';

interface Team {
  name: string;
  shooters: string[];
}

interface Round1Score {
  first: boolean;
  second: boolean;
}

interface TeamScores {
  round1: Round1Score[];
  round2: boolean[];
  round3: number;
  round4: number[];
}

interface Scores {
  [key: number]: TeamScores;
}

interface Placement {
  round1: number;
  round2: number;
  round3: number;
  round4: number;
  total: number;
}

const LazerPointScoreboard: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([
    { name: 'Hold 1', shooters: ['', '', '', '', ''] },
    { name: 'Hold 2', shooters: ['', '', '', '', ''] },
    { name: 'Hold 3', shooters: ['', '', '', '', ''] },
    { name: 'Hold 4', shooters: ['', '', '', '', ''] },
    { name: 'Hold 5', shooters: ['', '', '', '', ''] },
  ]);

  const [scores, setScores] = useState<Scores>(() => {
    const initial: Scores = {};
    for (let t = 0; t < 5; t++) {
      initial[t] = {
        round1: Array(5).fill({ first: false, second: false }),
        round2: Array(5).fill(false),
        round3: 0,
        round4: Array(5).fill(0),
      };
    }
    return initial;
  });

  // Sync state
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionName, setSessionName] = useState('');
  const [savedSessions, setSavedSessions] = useState<TeamLazerScore[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSessionList, setShowSessionList] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'saved' | 'unsaved' | 'error'>('unsaved');

  // Load saved sessions on mount
  useEffect(() => {
    loadSavedSessions();
  }, []);

  const loadSavedSessions = async () => {
    const result = await getAllTeamLazerScores();
    if (result.success && result.data) {
      setSavedSessions(result.data);
    }
  };

  // Calculate round totals
  const calculateRound1Total = (teamIndex: number): number => {
    return scores[teamIndex].round1.reduce((sum, s) => {
      return sum + (s.first ? 2 : 0) + (s.second ? 1 : 0);
    }, 0);
  };

  const calculateRound2Total = (teamIndex: number): number => {
    return scores[teamIndex].round2.filter(Boolean).length * 2;
  };

  const calculateRound3Total = (teamIndex: number): number => {
    return scores[teamIndex].round3;
  };

  const calculateRound4Total = (teamIndex: number): number => {
    return scores[teamIndex].round4.reduce((sum, v) => sum + v, 0);
  };

  // Calculate rankings for each round
  const getRankings = (roundTotals: number[]): number[] => {
    const sorted = [...roundTotals].map((v, i) => ({ value: v, index: i }))
      .sort((a, b) => b.value - a.value);
    const rankings = Array(roundTotals.length).fill(0);
    let currentRank = 1;
    for (let i = 0; i < sorted.length; i++) {
      if (i > 0 && sorted[i].value < sorted[i - 1].value) {
        currentRank = i + 1;
      }
      rankings[sorted[i].index] = currentRank;
    }
    return rankings;
  };

  const getPlacementPoint = (rank: number, totalTeams: number): number => {
    const points = [5, 4, 3, 2, 1];
    return rank <= totalTeams ? points[rank - 1] || 1 : 0;
  };

  // Calculate all placement points
  const calculateAllPlacements = (): Placement[] => {
    const teamCount = teams.length;
    const round1Totals = teams.map((_, i) => calculateRound1Total(i));
    const round2Totals = teams.map((_, i) => calculateRound2Total(i));
    const round3Totals = teams.map((_, i) => calculateRound3Total(i));
    const round4Totals = teams.map((_, i) => calculateRound4Total(i));

    const r1Rankings = getRankings(round1Totals);
    const r2Rankings = getRankings(round2Totals);
    const r3Rankings = getRankings(round3Totals);
    const r4Rankings = getRankings(round4Totals);

    return teams.map((_, i) => ({
      round1: getPlacementPoint(r1Rankings[i], teamCount),
      round2: getPlacementPoint(r2Rankings[i], teamCount),
      round3: getPlacementPoint(r3Rankings[i], teamCount),
      round4: getPlacementPoint(r4Rankings[i], teamCount),
      total: getPlacementPoint(r1Rankings[i], teamCount) +
             getPlacementPoint(r2Rankings[i], teamCount) +
             getPlacementPoint(r3Rankings[i], teamCount) +
             getPlacementPoint(r4Rankings[i], teamCount),
    }));
  };

  const placements = calculateAllPlacements();

  // Final rankings
  const getFinalRankings = (): number[] => {
    const totals = placements.map(p => p.total);
    return getRankings(totals);
  };

  const finalRankings = getFinalRankings();

  // Update handlers
  const updateTeamName = (index: number, name: string) => {
    const newTeams = [...teams];
    newTeams[index].name = name;
    setTeams(newTeams);
    setSyncStatus('unsaved');
  };

  const updateRound1Score = (teamIndex: number, shooterIndex: number, type: 'first' | 'second') => {
    setScores(prev => {
      const newScores = { ...prev };
      const newRound1 = [...newScores[teamIndex].round1];
      newRound1[shooterIndex] = {
        ...newRound1[shooterIndex],
        [type]: !newRound1[shooterIndex][type]
      };
      newScores[teamIndex] = { ...newScores[teamIndex], round1: newRound1 };
      return newScores;
    });
    setSyncStatus('unsaved');
  };

  const updateRound2Score = (teamIndex: number, shooterIndex: number) => {
    setScores(prev => {
      const newScores = { ...prev };
      const newRound2 = [...newScores[teamIndex].round2];
      newRound2[shooterIndex] = !newRound2[shooterIndex];
      newScores[teamIndex] = { ...newScores[teamIndex], round2: newRound2 };
      return newScores;
    });
    setSyncStatus('unsaved');
  };

  const updateRound3Score = (teamIndex: number, value: string) => {
    setScores(prev => {
      const newScores = { ...prev };
      newScores[teamIndex] = { ...newScores[teamIndex], round3: parseInt(value) || 0 };
      return newScores;
    });
    setSyncStatus('unsaved');
  };

  const updateRound4Score = (teamIndex: number, shooterIndex: number, value: string) => {
    setScores(prev => {
      const newScores = { ...prev };
      const newRound4 = [...newScores[teamIndex].round4];
      newRound4[shooterIndex] = parseInt(value) || 0;
      newScores[teamIndex] = { ...newScores[teamIndex], round4: newRound4 };
      return newScores;
    });
    setSyncStatus('unsaved');
  };

  const addTeam = () => {
    if (teams.length >= 8) return;
    const newIndex = teams.length;
    setTeams([...teams, { name: `Hold ${newIndex + 1}`, shooters: ['', '', '', '', ''] }]);
    setScores(prev => ({
      ...prev,
      [newIndex]: {
        round1: Array(5).fill({ first: false, second: false }),
        round2: Array(5).fill(false),
        round3: 0,
        round4: Array(5).fill(0),
      }
    }));
    setSyncStatus('unsaved');
  };

  const removeTeam = (index: number) => {
    if (teams.length <= 2) return;
    const newTeams = teams.filter((_, i) => i !== index);
    setTeams(newTeams);

    const newScores: Scores = {};
    let newIndex = 0;
    Object.keys(scores).forEach((key) => {
      if (parseInt(key) !== index) {
        newScores[newIndex] = scores[parseInt(key)];
        newIndex++;
      }
    });
    setScores(newScores);
    setSyncStatus('unsaved');
  };

  const resetAll = () => {
    if (confirm('Er du sikker på at du vil nulstille alle scores?')) {
      const initial: Scores = {};
      for (let t = 0; t < teams.length; t++) {
        initial[t] = {
          round1: Array(5).fill({ first: false, second: false }),
          round2: Array(5).fill(false),
          round3: 0,
          round4: Array(5).fill(0),
        };
      }
      setScores(initial);
      setSyncStatus('unsaved');
    }
  };

  // Save to Supabase
  const handleSave = async () => {
    if (!sessionName.trim()) {
      alert('Indtast et navn til sessionen');
      return;
    }
    setIsSaving(true);
    const result = await saveTeamLazerScore(sessionName, teams, scores, sessionId || undefined);
    if (result.success) {
      setSessionId(result.id || null);
      setSyncStatus('saved');
      await loadSavedSessions();
    } else {
      setSyncStatus('error');
      alert('Fejl ved gemning: ' + result.error);
    }
    setIsSaving(false);
  };

  // Load from Supabase
  const handleLoad = async (id: string) => {
    setIsLoading(true);
    const result = await loadTeamLazerScore(id);
    if (result.success && result.data) {
      setTeams(result.data.teams_data as Team[]);
      setScores(result.data.scores_data as Scores);
      setSessionId(result.data.id || null);
      setSessionName(result.data.session_name);
      setSyncStatus('saved');
      setShowSessionList(false);
    } else {
      alert('Fejl ved indlæsning: ' + result.error);
    }
    setIsLoading(false);
  };

  // Delete session
  const handleDelete = async (id: string) => {
    if (!confirm('Er du sikker på at du vil slette denne session?')) return;
    const result = await deleteTeamLazerScore(id);
    if (result.success) {
      if (sessionId === id) {
        setSessionId(null);
        setSessionName('');
      }
      await loadSavedSessions();
    } else {
      alert('Fejl ved sletning: ' + result.error);
    }
  };

  // New session
  const handleNewSession = () => {
    setSessionId(null);
    setSessionName('');
    setTeams([
      { name: 'Hold 1', shooters: ['', '', '', '', ''] },
      { name: 'Hold 2', shooters: ['', '', '', '', ''] },
      { name: 'Hold 3', shooters: ['', '', '', '', ''] },
      { name: 'Hold 4', shooters: ['', '', '', '', ''] },
      { name: 'Hold 5', shooters: ['', '', '', '', ''] },
    ]);
    const initial: Scores = {};
    for (let t = 0; t < 5; t++) {
      initial[t] = {
        round1: Array(5).fill({ first: false, second: false }),
        round2: Array(5).fill(false),
        round3: 0,
        round4: Array(5).fill(0),
      };
    }
    setScores(initial);
    setSyncStatus('unsaved');
  };

  const getRankColor = (rank: number): string => {
    if (rank === 1) return 'bg-yellow-400 text-black';
    if (rank === 2) return 'bg-gray-300 text-black';
    if (rank === 3) return 'bg-amber-600 text-white';
    return 'bg-gray-600 text-white';
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="bg-battle-grey/20 border border-white/10 rounded-2xl p-4 md:p-6 backdrop-blur-sm">

        {/* Cloud Sync Controls */}
        <div className="bg-battle-black/30 rounded-xl p-4 mb-6 border border-white/5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              {syncStatus === 'saved' ? (
                <Cloud className="w-5 h-5 text-green-400" />
              ) : syncStatus === 'error' ? (
                <CloudOff className="w-5 h-5 text-red-400" />
              ) : (
                <CloudOff className="w-5 h-5 text-gray-400" />
              )}
              <span className="text-sm text-gray-400">
                {syncStatus === 'saved' ? 'Gemt' : syncStatus === 'error' ? 'Fejl' : 'Ikke gemt'}
              </span>
            </div>

            <input
              type="text"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder="Session navn..."
              className="flex-1 min-w-[200px] bg-battle-grey/50 border border-battle-grey rounded px-3 py-2 text-white text-sm"
            />

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 text-white rounded-lg font-semibold transition-colors text-sm"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Gemmer...' : 'Gem'}
            </button>

            <button
              onClick={() => setShowSessionList(!showSessionList)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-colors text-sm"
            >
              <FolderOpen className="w-4 h-4" />
              Indlæs
            </button>

            <button
              onClick={handleNewSession}
              className="px-4 py-2 bg-battle-grey/50 hover:bg-battle-grey text-white rounded-lg font-semibold transition-colors text-sm"
            >
              Ny Session
            </button>
          </div>

          {/* Session List */}
          {showSessionList && (
            <div className="mt-4 bg-battle-black/50 rounded-lg p-3 max-h-48 overflow-y-auto">
              {savedSessions.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-2">Ingen gemte sessioner</p>
              ) : (
                <div className="space-y-2">
                  {savedSessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between bg-battle-grey/30 rounded-lg px-3 py-2">
                      <div>
                        <span className="text-white font-medium">{session.session_name}</span>
                        <span className="text-gray-400 text-xs ml-2">
                          {session.updated_at ? new Date(session.updated_at).toLocaleDateString('da-DK') : ''}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleLoad(session.id!)}
                          disabled={isLoading}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs"
                        >
                          Åbn
                        </button>
                        <button
                          onClick={() => handleDelete(session.id!)}
                          className="p-1 text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-3 mb-6 justify-center flex-wrap">
          <button
            onClick={addTeam}
            disabled={teams.length >= 8}
            className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
          >
            + Tilføj Hold
          </button>
          <button
            onClick={resetAll}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-semibold transition-colors"
          >
            Nulstil Scores
          </button>
        </div>

        {/* Scoreboard Table */}
        <div className="overflow-x-auto rounded-xl shadow-2xl">
          <table className="w-full border-collapse bg-battle-black/50 backdrop-blur">
            <thead>
              <tr className="bg-gradient-to-r from-purple-700 to-pink-600">
                <th className="p-3 text-left text-white font-bold border-r border-purple-500 min-w-[200px]">RUNDE</th>
                {teams.map((team, i) => (
                  <th key={i} className="p-2 text-white border-r border-purple-500 min-w-[180px]">
                    <div className="flex flex-col gap-1">
                      <input
                        type="text"
                        value={team.name}
                        onChange={(e) => updateTeamName(i, e.target.value)}
                        className="bg-white/20 rounded px-2 py-1 text-center text-white placeholder-white/50 w-full font-bold"
                      />
                      {teams.length > 2 && (
                        <button
                          onClick={() => removeTeam(i)}
                          className="text-xs text-red-300 hover:text-red-100"
                        >
                          Fjern
                        </button>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Round 1: LAZER POINT */}
              <tr className="bg-red-900/40">
                <td className="p-3 border-r border-battle-grey/50">
                  <div className="font-bold text-red-400">Runde 1: LAZER POINT</div>
                  <div className="text-xs text-gray-400">2p = første skud | 1p = andet skud</div>
                </td>
                {teams.map((_, teamIdx) => (
                  <td key={teamIdx} className="p-2 border-r border-battle-grey/50">
                    <div className="space-y-1">
                      {[0, 1, 2, 3, 4].map((shooterIdx) => (
                        <div key={shooterIdx} className="flex items-center gap-1 text-xs">
                          <span className="text-gray-400 w-14">Skytte {shooterIdx + 1}:</span>
                          <button
                            onClick={() => updateRound1Score(teamIdx, shooterIdx, 'first')}
                            className={`px-2 py-0.5 rounded text-xs font-semibold transition-colors ${
                              scores[teamIdx]?.round1[shooterIdx]?.first
                                ? 'bg-green-500 text-white'
                                : 'bg-battle-grey/50 text-gray-300 hover:bg-battle-grey'
                            }`}
                          >
                            2p
                          </button>
                          <button
                            onClick={() => updateRound1Score(teamIdx, shooterIdx, 'second')}
                            className={`px-2 py-0.5 rounded text-xs font-semibold transition-colors ${
                              scores[teamIdx]?.round1[shooterIdx]?.second
                                ? 'bg-yellow-500 text-black'
                                : 'bg-battle-grey/50 text-gray-300 hover:bg-battle-grey'
                            }`}
                          >
                            1p
                          </button>
                        </div>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>
              <tr className="bg-red-900/20">
                <td className="p-2 border-r border-battle-grey/50 text-right text-sm text-gray-400">
                  Runde 1 Total / Placeringspoint:
                </td>
                {teams.map((_, teamIdx) => (
                  <td key={teamIdx} className="p-2 border-r border-battle-grey/50 text-center">
                    <span className="text-white font-bold">{calculateRound1Total(teamIdx)}</span>
                    <span className="text-gray-400 mx-2">/</span>
                    <span className="text-yellow-400 font-bold">{placements[teamIdx]?.round1}p</span>
                  </td>
                ))}
              </tr>

              {/* Round 2: SPEED */}
              <tr className="bg-blue-900/40">
                <td className="p-3 border-r border-battle-grey/50">
                  <div className="font-bold text-blue-400">Runde 2: SPEED</div>
                  <div className="text-xs text-gray-400">2p til første skytte der rammer</div>
                </td>
                {teams.map((_, teamIdx) => (
                  <td key={teamIdx} className="p-2 border-r border-battle-grey/50">
                    <div className="space-y-1">
                      {[0, 1, 2, 3, 4].map((shooterIdx) => (
                        <div key={shooterIdx} className="flex items-center gap-1 text-xs">
                          <span className="text-gray-400 w-14">Skytte {shooterIdx + 1}:</span>
                          <button
                            onClick={() => updateRound2Score(teamIdx, shooterIdx)}
                            className={`px-3 py-0.5 rounded text-xs font-semibold transition-colors ${
                              scores[teamIdx]?.round2[shooterIdx]
                                ? 'bg-blue-500 text-white'
                                : 'bg-battle-grey/50 text-gray-300 hover:bg-battle-grey'
                            }`}
                          >
                            {scores[teamIdx]?.round2[shooterIdx] ? '2p' : '-'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>
              <tr className="bg-blue-900/20">
                <td className="p-2 border-r border-battle-grey/50 text-right text-sm text-gray-400">
                  Runde 2 Total / Placeringspoint:
                </td>
                {teams.map((_, teamIdx) => (
                  <td key={teamIdx} className="p-2 border-r border-battle-grey/50 text-center">
                    <span className="text-white font-bold">{calculateRound2Total(teamIdx)}</span>
                    <span className="text-gray-400 mx-2">/</span>
                    <span className="text-yellow-400 font-bold">{placements[teamIdx]?.round2}p</span>
                  </td>
                ))}
              </tr>

              {/* Round 3: SKILL */}
              <tr className="bg-green-900/40">
                <td className="p-3 border-r border-battle-grey/50">
                  <div className="font-bold text-green-400">Runde 3: SKILL</div>
                  <div className="text-xs text-gray-400">"Running score" - indtast total</div>
                </td>
                {teams.map((_, teamIdx) => (
                  <td key={teamIdx} className="p-2 border-r border-battle-grey/50">
                    <div className="flex items-center justify-center">
                      <input
                        type="number"
                        min="0"
                        value={scores[teamIdx]?.round3 || 0}
                        onChange={(e) => updateRound3Score(teamIdx, e.target.value)}
                        className="w-20 bg-battle-grey/50 border border-battle-grey rounded px-2 py-1 text-center text-white text-lg font-bold"
                      />
                    </div>
                  </td>
                ))}
              </tr>
              <tr className="bg-green-900/20">
                <td className="p-2 border-r border-battle-grey/50 text-right text-sm text-gray-400">
                  Runde 3 Total / Placeringspoint:
                </td>
                {teams.map((_, teamIdx) => (
                  <td key={teamIdx} className="p-2 border-r border-battle-grey/50 text-center">
                    <span className="text-white font-bold">{calculateRound3Total(teamIdx)}</span>
                    <span className="text-gray-400 mx-2">/</span>
                    <span className="text-yellow-400 font-bold">{placements[teamIdx]?.round3}p</span>
                  </td>
                ))}
              </tr>

              {/* Round 4: RAPID */}
              <tr className="bg-orange-900/40">
                <td className="p-3 border-r border-battle-grey/50">
                  <div className="font-bold text-orange-400">Runde 4: RAPID</div>
                  <div className="text-xs text-gray-400">Point til de 5 første skud (5,4,3,2,1)</div>
                </td>
                {teams.map((_, teamIdx) => (
                  <td key={teamIdx} className="p-2 border-r border-battle-grey/50">
                    <div className="space-y-1">
                      {[0, 1, 2, 3, 4].map((shooterIdx) => (
                        <div key={shooterIdx} className="flex items-center gap-1 text-xs">
                          <span className="text-gray-400 w-14">Skytte {shooterIdx + 1}:</span>
                          <select
                            value={scores[teamIdx]?.round4[shooterIdx] || 0}
                            onChange={(e) => updateRound4Score(teamIdx, shooterIdx, e.target.value)}
                            className="bg-battle-grey/50 border border-battle-grey rounded px-1 py-0.5 text-white text-xs"
                          >
                            <option value={0}>0p</option>
                            <option value={1}>1p</option>
                            <option value={2}>2p</option>
                            <option value={3}>3p</option>
                            <option value={4}>4p</option>
                            <option value={5}>5p</option>
                          </select>
                        </div>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>
              <tr className="bg-orange-900/20">
                <td className="p-2 border-r border-battle-grey/50 text-right text-sm text-gray-400">
                  Runde 4 Total / Placeringspoint:
                </td>
                {teams.map((_, teamIdx) => (
                  <td key={teamIdx} className="p-2 border-r border-battle-grey/50 text-center">
                    <span className="text-white font-bold">{calculateRound4Total(teamIdx)}</span>
                    <span className="text-gray-400 mx-2">/</span>
                    <span className="text-yellow-400 font-bold">{placements[teamIdx]?.round4}p</span>
                  </td>
                ))}
              </tr>

              {/* Final Results */}
              <tr className="bg-gradient-to-r from-yellow-900/60 to-amber-900/60">
                <td className="p-4 border-r border-battle-grey/50">
                  <div className="font-bold text-yellow-400 text-lg">TOTAL PLACERING</div>
                </td>
                {teams.map((_, teamIdx) => (
                  <td key={teamIdx} className="p-3 border-r border-battle-grey/50 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold ${getRankColor(finalRankings[teamIdx])}`}>
                        {finalRankings[teamIdx]}
                      </div>
                      <div className="text-white">
                        <span className="text-2xl font-bold">{placements[teamIdx]?.total}</span>
                        <span className="text-sm text-gray-400 ml-1">point</span>
                      </div>
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="mt-6 p-4 bg-battle-black/30 rounded-lg border border-white/5">
          <h3 className="text-white font-bold mb-2">Pointsystem:</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-gray-300">
              <span className="text-red-400 font-bold">Runde 1:</span> 2p/1p per skytte
            </div>
            <div className="text-gray-300">
              <span className="text-blue-400 font-bold">Runde 2:</span> 2p per første skud
            </div>
            <div className="text-gray-300">
              <span className="text-green-400 font-bold">Runde 3:</span> Running score total
            </div>
            <div className="text-gray-300">
              <span className="text-orange-400 font-bold">Runde 4:</span> 5-4-3-2-1 point
            </div>
          </div>
          <div className="mt-3 text-gray-400 text-xs">
            <strong>Placeringspoint:</strong> 1. plads = 5p, 2. plads = 4p, 3. plads = 3p, 4. plads = 2p, 5. plads = 1p
          </div>
        </div>
      </div>
    </div>
  );
};

export default LazerPointScoreboard;
