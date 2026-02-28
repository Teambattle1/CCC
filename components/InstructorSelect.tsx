import React, { useState, useEffect } from 'react';
import { Users, ChevronDown, User } from 'lucide-react';
import { fetchJobCrew, fetchAllEmployees, CrewAssignment, Employee } from '../lib/supabase';

interface InstructorSelectProps {
  jobId: string;
  jobTitle: string;
  onSelect: (instructor: { name: string; id?: string }) => void;
}

const InstructorSelect: React.FC<InstructorSelectProps> = ({ jobId, jobTitle, onSelect }) => {
  const [crew, setCrew] = useState<CrewAssignment[]>([]);
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAll, setIsLoadingAll] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const crewData = await fetchJobCrew(jobId);
      setCrew(crewData);
      setIsLoading(false);
    };
    load();
  }, [jobId]);

  const handleShowAll = async () => {
    if (allEmployees.length === 0) {
      setIsLoadingAll(true);
      const employees = await fetchAllEmployees();
      setAllEmployees(employees);
      setIsLoadingAll(false);
    }
    setShowAll(true);
  };

  return (
    <div className="w-full max-w-md mx-auto px-4">
      <div className="bg-battle-grey/20 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Users className="w-8 h-8 text-battle-orange" />
          <div>
            <h2 className="text-xl font-bold text-white uppercase tracking-wider">Vælg Instruktør</h2>
            <p className="text-xs text-gray-500 uppercase">{jobTitle}</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-2 border-battle-orange/30 border-t-battle-orange rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Job crew (assigned instructors) */}
            <div className="space-y-2 mb-4">
              {crew.length > 0 && (
                <p className="text-xs text-gray-500 uppercase mb-2">Tildelt denne opgave</p>
              )}
              {crew.map((c, i) => (
                <button
                  key={i}
                  onClick={() => onSelect({ name: c.employee_name })}
                  className="w-full flex items-center gap-3 p-4 bg-battle-orange/10 border-2 border-battle-orange/30 rounded-xl text-left hover:bg-battle-orange/20 hover:border-battle-orange/50 transition-all"
                >
                  <div className="w-10 h-10 bg-battle-orange/20 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-battle-orange" />
                  </div>
                  <div>
                    <span className="text-white font-bold uppercase block">{c.employee_name}</span>
                    <span className="text-xs text-battle-orange/70 uppercase">{c.role}</span>
                  </div>
                </button>
              ))}
              {crew.length === 0 && (
                <p className="text-center text-gray-500 py-4 uppercase text-sm">Ingen instruktører tildelt denne opgave</p>
              )}
            </div>

            {/* Show all toggle */}
            {!showAll ? (
              <button
                onClick={handleShowAll}
                disabled={isLoadingAll}
                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 uppercase text-sm hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
              >
                {isLoadingAll ? (
                  <div className="w-4 h-4 border-2 border-gray-400/30 border-t-gray-400 rounded-full animate-spin" />
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Vis alle medarbejdere
                  </>
                )}
              </button>
            ) : (
              <div className="border-t border-white/10 pt-4 mt-2">
                <p className="text-xs text-gray-500 uppercase mb-2">Alle medarbejdere</p>
                <div className="space-y-1.5 max-h-[40vh] overflow-y-auto">
                  {allEmployees
                    .filter(e => !crew.some(c => c.employee_name === e.name))
                    .map((e) => (
                      <button
                        key={e.id}
                        onClick={() => onSelect({ name: e.name, id: e.id })}
                        className="w-full flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg text-left hover:bg-white/10 transition-colors"
                      >
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-white/80 uppercase text-sm">{e.name}</span>
                      </button>
                    ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default InstructorSelect;
