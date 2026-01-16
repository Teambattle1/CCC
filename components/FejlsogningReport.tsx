import React, { useState, useRef } from 'react';
import { Send, Upload, X, AlertTriangle, CheckCircle2, Camera, ImagePlus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface FejlsogningReportProps {
  activity: string;
}

const ACTIVITY_NAMES: Record<string, string> = {
  teamlazer: 'TeamLazer',
  teamrobin: 'TeamRobin',
  teamsegway: 'TeamSegway',
  teamcontrol: 'TeamControl',
  teamconstruct: 'TeamConstruct',
  teamconnect: 'TeamConnect',
  teambox: 'TeamBox',
  teamaction: 'TeamAction',
  teamchallenge: 'TeamChallenge',
  loquiz: 'Loquiz',
  teamplay: 'TeamPlay',
  teamtaste: 'TeamTaste'
};

const GEAR_OPTIONS: Record<string, string[]> = {
  teamlazer: ['Gevær', 'Kaster', 'Pointtavle', 'Controller', 'Batterier', 'Ledninger', 'Andet'],
  teamrobin: ['Bue', 'Pile', 'Skydeskive', 'Stativ', 'Sikkerhedsnet', 'Andet'],
  teamsegway: ['Segway', 'Hjelm', 'Kegler', 'Batterier', 'Lader', 'Andet'],
  teamcontrol: ['RC Bil', 'RC Controller', 'Drone (Hvid)', 'Drone Controller', 'LEGO Drone', 'Tablet', 'Batterier', 'Andet'],
  teamconstruct: ['Rør', 'Sav', 'Skærebræt', 'Målebånd', 'Gaffatape', 'Golfbold', 'Sort bord', 'Andet'],
  teamconnect: ['Udstyr', 'Andet'],
  teambox: ['EscapeBOX', 'Låse', 'Props', 'Hints', 'Andet'],
  teamaction: ['GPS Enhed', 'Tablet', 'Andet'],
  teamchallenge: ['GPS Enhed', 'Tablet', 'Udstyr', 'Andet'],
  loquiz: ['GPS Enhed', 'Tablet', 'App', 'Andet'],
  teamplay: ['Udstyr', 'Andet'],
  teamtaste: ['Køkkenudstyr', 'Ingredienser', 'Andet']
};

const FejlsogningReport: React.FC<FejlsogningReportProps> = ({ activity }) => {
  const { profile } = useAuth();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [gear, setGear] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const activityName = ACTIVITY_NAMES[activity] || activity;
  const gearOptions = GEAR_OPTIONS[activity] || ['Udstyr', 'Andet'];

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `fejlsogning/${activity}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('guide-images')
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        setError('Kunne ikke uploade billede: ' + uploadError.message);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('guide-images')
        .getPublicUrl(fileName);

      setImageUrl(publicUrl);
    } catch (err) {
      setError('Fejl ved upload af billede');
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!gear || !description) {
      setError('Udfyld venligst alle felter');
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      // Save to Supabase
      const { error: dbError } = await supabase
        .from('fejlsogning_reports')
        .insert({
          activity: activity,
          activity_name: activityName,
          date: date,
          gear: gear,
          description: description,
          image_url: imageUrl,
          reported_by: profile?.email || 'unknown',
          reported_by_name: profile?.name || profile?.email || 'unknown',
          created_at: new Date().toISOString()
        });

      if (dbError) {
        console.error('DB Error:', dbError);
        // Continue anyway - send email even if DB fails
      }

      // Open email client
      const subject = encodeURIComponent(`Fejlrapport: ${activityName} - ${gear}`);
      const body = encodeURIComponent(
`FEJLRAPPORT - ${activityName}

Dato: ${date}
Aktivitet: ${activityName}
Gear: ${gear}
Rapporteret af: ${profile?.name || profile?.email || 'Unknown'}

Beskrivelse:
${description}

${imageUrl ? `Billede: ${imageUrl}` : 'Intet billede vedhæftet'}

---
Sendt fra CrewCenter`
      );

      window.location.href = `mailto:booking@teambattle.dk?subject=${subject}&body=${body}`;

      setSent(true);
    } catch (err) {
      setError('Fejl ved afsendelse af rapport');
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  if (sent) {
    return (
      <div className="w-full max-w-2xl mx-auto px-2 tablet:px-4">
        <div className="bg-battle-grey/20 border border-green-500/30 rounded-xl tablet:rounded-2xl p-6 tablet:p-8 backdrop-blur-sm text-center">
          <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-400 uppercase tracking-wider mb-2">
            Rapport Sendt!
          </h2>
          <p className="text-gray-400 mb-6">
            Din fejlrapport er blevet åbnet i din email-klient. Send emailen for at fuldføre.
          </p>
          <button
            onClick={() => {
              setSent(false);
              setGear('');
              setDescription('');
              setImageUrl(null);
            }}
            className="px-6 py-3 bg-battle-orange/20 border border-battle-orange/30 rounded-lg text-battle-orange uppercase tracking-wider hover:bg-battle-orange/30 transition-colors"
          >
            Opret Ny Rapport
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-2 tablet:px-4">
      <div className="bg-battle-grey/20 border border-yellow-500/30 rounded-xl tablet:rounded-2xl p-4 tablet:p-6 backdrop-blur-sm">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-yellow-500/20 rounded-xl border border-yellow-500/30">
            <AlertTriangle className="w-6 h-6 tablet:w-8 tablet:h-8 text-yellow-400" />
          </div>
          <div>
            <h2 className="text-lg tablet:text-xl font-bold text-yellow-400 uppercase tracking-wider">
              Fejlrapport
            </h2>
            <p className="text-xs tablet:text-sm text-yellow-400/70 uppercase">{activityName}</p>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Date */}
          <div>
            <label className="block text-xs text-yellow-400/70 uppercase tracking-wider mb-2">
              Dato
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-battle-black/50 border border-yellow-500/30 rounded-lg p-3 text-white focus:outline-none focus:border-yellow-500 transition-colors"
            />
          </div>

          {/* Gear Selection */}
          <div>
            <label className="block text-xs text-yellow-400/70 uppercase tracking-wider mb-2">
              Hvilket gear drejer det sig om?
            </label>
            <select
              value={gear}
              onChange={(e) => setGear(e.target.value)}
              className="w-full bg-battle-black/50 border border-yellow-500/30 rounded-lg p-3 text-white focus:outline-none focus:border-yellow-500 transition-colors"
            >
              <option value="">Vælg gear...</option>
              {gearOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs text-yellow-400/70 uppercase tracking-wider mb-2">
              Beskriv fejlen
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Hvad er problemet? Hvornår opstod det? Hvad har du prøvet?"
              rows={4}
              className="w-full bg-battle-black/50 border border-yellow-500/30 rounded-lg p-3 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500 transition-colors resize-none"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-xs text-yellow-400/70 uppercase tracking-wider mb-2">
              Billede (valgfrit)
            </label>
            {/* Hidden file inputs */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            <input
              type="file"
              ref={cameraInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              capture
              className="hidden"
            />
            {imageUrl ? (
              <div className="relative">
                <img
                  src={imageUrl}
                  alt="Uploaded"
                  className="w-full h-48 object-cover rounded-lg border border-yellow-500/30"
                />
                <button
                  onClick={() => setImageUrl(null)}
                  className="absolute top-2 right-2 p-2 bg-red-500/80 rounded-full text-white hover:bg-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                {/* Camera button */}
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex-1 p-4 border-2 border-dashed border-yellow-500/30 rounded-lg flex flex-col items-center gap-2 hover:border-yellow-500 hover:bg-yellow-500/5 transition-colors disabled:opacity-50"
                >
                  {isUploading ? (
                    <div className="w-8 h-8 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
                  ) : (
                    <>
                      <Camera className="w-8 h-8 text-yellow-400" />
                      <span className="text-xs text-yellow-400/70">Tag Billede</span>
                    </>
                  )}
                </button>
                {/* Gallery button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex-1 p-4 border-2 border-dashed border-yellow-500/30 rounded-lg flex flex-col items-center gap-2 hover:border-yellow-500 hover:bg-yellow-500/5 transition-colors disabled:opacity-50"
                >
                  {isUploading ? (
                    <div className="w-8 h-8 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
                  ) : (
                    <>
                      <ImagePlus className="w-8 h-8 text-yellow-400/70" />
                      <span className="text-xs text-yellow-400/70">Vælg Billede</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isSending || !gear || !description}
            className="w-full flex items-center justify-center gap-3 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-xl text-yellow-400 font-bold uppercase tracking-wider hover:bg-yellow-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? (
              <div className="w-5 h-5 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
            Send Rapport
          </button>

          <p className="text-xs text-yellow-400/50 text-center">
            Rapporten sendes til booking@teambattle.dk
          </p>
        </div>
      </div>
    </div>
  );
};

export default FejlsogningReport;
