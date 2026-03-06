import React, { useState, useRef } from 'react';
import { Send, X, AlertTriangle, CheckCircle2, Camera, ImagePlus, Loader2, AlertOctagon } from 'lucide-react';
import { supabase, submitFejlrapportAsTodo } from '../lib/supabase';
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
  teamtaste: 'TeamTaste',
  teamrace: 'TeamRace'
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
  teamtaste: ['Køkkenudstyr', 'Ingredienser', 'Andet'],
  teamrace: ['RC Bil', 'Bane', 'Controller', 'Batterier', 'Andet']
};

const FejlsogningReport: React.FC<FejlsogningReportProps> = ({ activity }) => {
  const { profile, logAction } = useAuth();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [gear, setGear] = useState('');
  const [description, setDescription] = useState('');
  const [haster, setHaster] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const activityName = ACTIVITY_NAMES[activity] || activity;
  const gearOptions = GEAR_OPTIONS[activity] || ['Udstyr', 'Andet'];

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setError(null);

    try {
      const newUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `fejlsogning/${activity}-${Date.now()}-${i}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('guide-images')
          .upload(fileName, file, { upsert: true });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('guide-images')
          .getPublicUrl(fileName);

        newUrls.push(publicUrl);
      }

      if (newUrls.length > 0) {
        setImageUrls(prev => [...prev, ...newUrls]);
      } else {
        setError('Kunne ikke uploade billede(r)');
      }
    } catch (err) {
      setError('Fejl ved upload af billede');
      console.error(err);
    } finally {
      setIsUploading(false);
      // Reset file inputs so same file can be selected again
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!gear || !description) {
      setError('Udfyld venligst gear og beskrivelse');
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      const reporterName = profile?.name || profile?.email || 'Ukendt';
      const reporterEmail = profile?.email || 'unknown';

      const result = await submitFejlrapportAsTodo({
        activity,
        activityName,
        gear,
        date,
        description,
        imageUrls,
        reporterName,
        reporterEmail,
        haster,
      });

      if (!result.success) {
        setError(result.error || 'Fejl ved indsendelse');
        setIsSending(false);
        return;
      }

      logAction('SUBMIT_FEJLRAPPORT', `${activityName} — ${gear}${haster ? ' [HASTER]' : ''}`);
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
          <p className="text-gray-400 mb-2">
            Din fejlrapport er gemt og sendt som opgave til administrationen.
          </p>
          {haster && (
            <p className="text-red-400 text-sm mb-4">
              🚨 Markeret som HASTER — alle admins er notificeret.
            </p>
          )}
          <button
            onClick={() => {
              setSent(false);
              setGear('');
              setDescription('');
              setImageUrls([]);
              setHaster(false);
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
          {/* HASTER Toggle */}
          <button
            type="button"
            onClick={() => setHaster(!haster)}
            className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 touch-manipulation ${
              haster
                ? 'border-red-500 bg-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                : 'border-white/10 bg-battle-black/30 hover:border-red-500/40'
            }`}
          >
            <AlertOctagon className={`w-6 h-6 ${haster ? 'text-red-400' : 'text-gray-500'}`} />
            <div className="flex-1 text-left">
              <span className={`font-bold uppercase tracking-wider text-sm ${haster ? 'text-red-400' : 'text-gray-400'}`}>
                HASTER
              </span>
              <p className="text-xs text-gray-500">
                {haster ? 'Alle admins notificeres øjeblikkeligt' : 'Markér hvis fejlen er kritisk'}
              </p>
            </div>
            <div className={`w-12 h-7 rounded-full transition-colors duration-200 flex items-center ${
              haster ? 'bg-red-500 justify-end' : 'bg-gray-600 justify-start'
            }`}>
              <div className={`w-5 h-5 rounded-full bg-white mx-1 transition-transform shadow-sm`} />
            </div>
          </button>

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

          {/* Image Upload - Multi-image */}
          <div>
            <label className="block text-xs text-yellow-400/70 uppercase tracking-wider mb-2">
              Billeder {imageUrls.length > 0 && `(${imageUrls.length})`}
            </label>

            {/* Hidden file inputs */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              multiple
              className="hidden"
            />
            <input
              type="file"
              ref={cameraInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              capture="environment"
              className="hidden"
            />

            {/* Image preview grid */}
            {imageUrls.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {imageUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Billede ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-yellow-500/30"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 p-1 bg-red-500/80 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload buttons */}
            <div className="flex gap-3">
              {/* Camera button */}
              <button
                onClick={() => cameraInputRef.current?.click()}
                disabled={isUploading}
                className="flex-1 p-4 border-2 border-dashed border-yellow-500/30 rounded-lg flex flex-col items-center gap-2 hover:border-yellow-500 hover:bg-yellow-500/5 transition-colors disabled:opacity-50"
              >
                {isUploading ? (
                  <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
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
                  <Loader2 className="w-8 h-8 text-yellow-400/70 animate-spin" />
                ) : (
                  <>
                    <ImagePlus className="w-8 h-8 text-yellow-400/70" />
                    <span className="text-xs text-yellow-400/70">Vælg Billeder</span>
                  </>
                )}
              </button>
            </div>
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
            className={`w-full flex items-center justify-center gap-3 p-4 rounded-xl font-bold uppercase tracking-wider transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
              haster
                ? 'bg-red-500/20 border-2 border-red-500/50 text-red-400 hover:bg-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                : 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/30'
            }`}
          >
            {isSending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
            {haster ? '🚨 Send Haste-Rapport' : 'Send Rapport'}
          </button>

          <p className="text-xs text-yellow-400/50 text-center">
            Rapporten gemmes som opgave til administrationen
          </p>
        </div>
      </div>
    </div>
  );
};

export default FejlsogningReport;
