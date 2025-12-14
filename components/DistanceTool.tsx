import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Send, Navigation, MapPin, Loader2, ChevronDown } from 'lucide-react';

const PREDEFINED_LOCATIONS = [
  { id: 'my_location', name: 'MY LOCATION', address: '' },
  { id: 'hub_jylland', name: 'HUB JYLLAND', address: 'Navervej 10, 7000 Fredericia' },
  { id: 'hub_frederikssund', name: 'HUB SJÆLLAND', address: 'Elsenbakken 7, 3600 Frederikssund' },
  { id: 'haraldskaer', name: 'HARALDSKÆR', address: 'Skibetvej 140, 7100 Vejle' },
];

const DistanceTool: React.FC = () => {
  const [destination, setDestination] = useState('');
  const [selectedOrigin, setSelectedOrigin] = useState('my_location');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [groundingLinks, setGroundingLinks] = useState<{uri: string, title?: string}[]>([]);

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

  const handleCalculate = async () => {
    if (!destination) return;
    setIsLoading(true);
    setResult('');
    setGroundingLinks([]);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      let prompt = '';
      const config: any = {
        tools: [{ googleMaps: {} }],
      };

      if (selectedOrigin === 'my_location') {
        if (location) {
          prompt = `Hvad er afstanden og køretiden fra min nuværende lokation (lat: ${location.lat}, lng: ${location.lng}) til ${destination}? Svar kortfattet på dansk.`;
          config.toolConfig = {
            retrievalConfig: {
              latLng: {
                latitude: location.lat,
                longitude: location.lng
              }
            }
          };
        } else {
           prompt = `Hvad er afstanden og køretiden fra min nuværende lokation til ${destination}? Svar kortfattet på dansk.`;
        }
      } else {
        const originObj = PREDEFINED_LOCATIONS.find(l => l.id === selectedOrigin);
        if (originObj) {
           prompt = `Hvad er afstanden og køretiden fra ${originObj.address} til ${destination}? Svar kortfattet på dansk.`;
        }
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: config
      });

      setResult(response.text || "Ingen data fundet.");

      // Extract grounding links
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const links: {uri: string, title?: string}[] = [];
      
      chunks.forEach((chunk: any) => {
        if (chunk.web?.uri) {
          links.push({ uri: chunk.web.uri, title: chunk.web.title });
        } else if (chunk.maps?.uri) {
           links.push({ uri: chunk.maps.uri, title: chunk.maps.title });
        } else if (chunk.maps?.placeAnswerSources?.reviewSnippets) {
           // Handle place sources if needed
        }
      });
      setGroundingLinks(links);

    } catch (error) {
      setResult("Kunne ikke beregne afstand. Prøv igen.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCalculate();
    }
  };

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

        {/* Destination Input */}
        <div className="relative mb-6 w-full">
          <label className="text-[10px] uppercase tracking-widest text-battle-orange mb-1 ml-2 block font-bold">To:</label>
          <div className="relative">
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Indtast destination (f.eks. Tivoli København)..."
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
        </div>

        {selectedOrigin === 'my_location' && location && (
          <div className="text-xs text-center text-gray-500 mb-6 flex items-center justify-center">
             <Navigation className="w-3 h-3 mr-1" />
             Using current location: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
          </div>
        )}

        {result && (
          <div className="mt-6 p-6 bg-black/40 rounded-xl border-l-4 border-battle-orange animate-pulse-slow">
            <h3 className="text-sm font-bold text-battle-orange uppercase mb-2">Resultat</h3>
            <div className="text-lg leading-relaxed">{result}</div>
            
            {groundingLinks.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-xs text-gray-400 mb-2">Kilder:</p>
                <div className="flex flex-wrap gap-2">
                  {groundingLinks.map((link, idx) => (
                    <a 
                      key={idx} 
                      href={link.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs bg-battle-grey/50 hover:bg-battle-orange/20 text-battle-orange px-2 py-1 rounded border border-battle-orange/30 hover:border-battle-orange transition-colors truncate max-w-full"
                    >
                      {link.title || link.uri}
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