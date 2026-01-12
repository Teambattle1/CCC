import React, { useState, useEffect, useRef } from 'react';
import { Send, Navigation, MapPin, Loader2, ChevronDown } from 'lucide-react';

const PREDEFINED_LOCATIONS = [
  { id: 'my_location', name: 'MY LOCATION', address: '', region: 'unknown' },
  { id: 'hub_jylland', name: 'HUB JYLLAND', address: 'Navervej 10, 7000 Fredericia', region: 'jylland' },
  { id: 'hub_frederikssund', name: 'HUB SJÆLLAND', address: 'Elsenbakken 7, 3600 Frederikssund', region: 'sjaelland' },
];

interface Suggestion {
  display_name: string;
  lat: string;
  lon: string;
}

const DistanceTool: React.FC = () => {
  const [destination, setDestination] = useState('');
  const [selectedOrigin, setSelectedOrigin] = useState('my_location');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [groundingLinks, setGroundingLinks] = useState<{uri: string, title?: string}[]>([]);

  // Autocomplete state
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLDivElement>(null);

  // Claude API key - set in environment or replace with your key
  const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY || '';

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => console.error("Error getting location", error)
      );
    }
  }, []);

  // Autocomplete search using Nominatim (OpenStreetMap)
  const searchLocations = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=dk&limit=5&addressdetails=1`,
        { headers: { 'Accept-Language': 'da' } }
      );
      const data = await response.json();
      setSuggestions(data);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Autocomplete error:', error);
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDestination(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      searchLocations(value);
    }, 300);
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setDestination(suggestion.display_name);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleCalculate = async () => {
    if (!destination) return;
    setIsLoading(true);
    setResult('');
    setGroundingLinks([]);
    setShowSuggestions(false);

    try {
      let originAddress = '';
      let originRegion = 'unknown';

      if (selectedOrigin === 'my_location') {
        if (location) {
          originAddress = `koordinater ${location.lat}, ${location.lng}`;
        } else {
          setResult('❌ Kunne ikke finde din lokation. Vælg venligst en startlokation.');
          setIsLoading(false);
          return;
        }
      } else {
        const originObj = PREDEFINED_LOCATIONS.find(l => l.id === selectedOrigin);
        if (originObj) {
          originAddress = originObj.address;
          originRegion = originObj.region;
        }
      }

      const now = new Date();
      const timeStr = now.toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' });

      const prompt = `Du er en præcis ruteberegner. Beregn kørerute fra "${originAddress}" til "${destination}" i Danmark.

Svar KUN med dette præcise format (udskift X med tal):
• Afstand: X km
• Køretid: X time(r) X min
• Ankomst: XX:XX (afgang kl. ${timeStr})
• Broafgift: [Ja, 446 kr (Storebælt t/r) ELLER Nej]

Regler:
- Broafgift KUN hvis ruten krydser Storebæltsbroen (mellem Sjælland og Fyn/Jylland)
- Brug realistiske køretider baseret på danske motorveje (110-130 km/t) og landeveje (80 km/t)
- Beregn ankomsttid ved at lægge køretid til ${timeStr}`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 500,
          messages: [{ role: 'user', content: prompt }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API fejl: ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage = data.content[0]?.text || 'Ingen svar modtaget';
      setResult(assistantMessage);

      // Add Google Maps link
      const mapsOrigin = selectedOrigin === 'my_location' && location
        ? `${location.lat},${location.lng}`
        : originAddress;
      const mapsUrl = `https://www.google.com/maps/dir/${encodeURIComponent(mapsOrigin)}/${encodeURIComponent(destination)}`;
      setGroundingLinks([{ uri: mapsUrl, title: 'Åbn i Google Maps' }]);

    } catch (error: any) {
      console.error('Route calculation error:', error);
      setResult(`❌ Fejl: ${error.message || 'Kunne ikke beregne rute'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setShowSuggestions(false);
      handleCalculate();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
      <div className="w-full bg-battle-grey/20 border border-white/10 rounded-2xl p-8 backdrop-blur-sm shadow-neon-strong">

        <div className="flex items-center justify-center mb-8 text-battle-orange">
          <MapPin className="w-12 h-12 mr-4 animate-bounce" />
          <h2 className="text-2xl font-bold uppercase tracking-widest">Route Calculator</h2>
        </div>

        {/* Origin Selection Dropdown */}
        <div className="relative mb-4 w-full group">
          <label className="text-[10px] uppercase tracking-widest text-battle-orange mb-1 ml-2 block font-bold">From:</label>
          <div className="relative">
            <select
              value={selectedOrigin}
              onChange={(e) => setSelectedOrigin(e.target.value)}
              className="w-full bg-battle-black/50 border border-battle-orange/30 rounded-xl px-6 py-4 text-white appearance-none focus:outline-none focus:border-battle-orange focus:ring-1 focus:ring-battle-orange transition-all cursor-pointer"
            >
              {PREDEFINED_LOCATIONS.map((loc) => (
                <option key={loc.id} value={loc.id} className="bg-battle-dark text-white">
                  {loc.name} {loc.address ? `- ${loc.address}` : ''}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-battle-orange w-5 h-5 pointer-events-none" />
          </div>
        </div>

        {/* Destination Input with Autocomplete */}
        <div className="relative mb-6 w-full" ref={inputRef}>
          <label className="text-[10px] uppercase tracking-widest text-battle-orange mb-1 ml-2 block font-bold">To:</label>
          <div className="relative">
            <input
              type="text"
              value={destination}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              placeholder="Indtast destination (f.eks. Slagelse)..."
              className="w-full bg-battle-black/50 border border-battle-orange/30 rounded-xl px-6 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-battle-orange focus:ring-1 focus:ring-battle-orange transition-all pr-14"
              autoFocus
            />
            <button
              onClick={handleCalculate}
              disabled={isLoading || !destination}
              className="absolute right-2 top-2 bottom-2 bg-battle-orange text-white px-4 rounded-lg hover:bg-battle-orangeLight transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>

          {/* Autocomplete Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-battle-dark border border-battle-orange/30 rounded-xl overflow-hidden shadow-2xl">
              {isSearching && (
                <div className="px-4 py-2 text-gray-400 text-sm flex items-center">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Søger...
                </div>
              )}
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-4 py-3 text-left text-white hover:bg-battle-orange/20 transition-colors border-b border-white/5 last:border-b-0 flex items-start gap-3"
                >
                  <MapPin className="w-4 h-4 text-battle-orange mt-1 flex-shrink-0" />
                  <span className="text-sm leading-tight">{suggestion.display_name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedOrigin === 'my_location' && location && (
          <div className="text-xs text-center text-gray-500 mb-6 flex items-center justify-center">
             <Navigation className="w-3 h-3 mr-1" />
             Using current location: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
          </div>
        )}

        {result && (
          <div className="mt-6 p-6 bg-black/40 rounded-xl border-l-4 border-battle-orange">
            <h3 className="text-sm font-bold text-battle-orange uppercase mb-3">Resultat</h3>
            <div className="text-lg leading-relaxed whitespace-pre-line">{result}</div>

            {groundingLinks.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex flex-wrap gap-2">
                  {groundingLinks.map((link, idx) => (
                    <a
                      key={idx}
                      href={link.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs bg-battle-grey/50 hover:bg-battle-orange/20 text-battle-orange px-3 py-2 rounded border border-battle-orange/30 hover:border-battle-orange transition-colors"
                    >
                      🗺️ {link.title || link.uri}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DistanceTool;
