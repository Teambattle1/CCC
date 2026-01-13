import React, { useState, useEffect, useRef } from 'react';
import { Package, Plus, Trash2, ChevronUp, ChevronDown, Save, Edit3, X, Camera, ImagePlus, GripVertical, Check, RotateCcw, Minus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface PackingItem {
  id: string;
  text: string;
  subtext?: string;
  imageUrl?: string;
  indent?: boolean;
  isDivider?: boolean;
}

interface PackingListData {
  id?: string;
  activity: string;
  list_type: string;
  items: PackingItem[];
  updated_at?: string;
  updated_by?: string;
}

// Default packing lists - these are loaded if no custom data exists
const DEFAULT_LISTS: Record<string, Record<string, PackingItem[]>> = {
  teamrobin: {
    before: [
      { id: 'rb1', text: 'Buer (antal efter behov)' },
      { id: 'rb2', text: 'Pile (min. 6 per bue)' },
      { id: 'rb3', text: 'Skydeskiver med stativer' },
      { id: 'rb4', text: 'Sikkerhedsnet' },
      { id: 'rb5', text: 'Afspærringsbånd' },
      { id: 'rb6', text: 'Højtaler' },
    ],
    after: [
      { id: 'ra1', text: 'Alle buer pakket korrekt' },
      { id: 'ra2', text: 'Pile tjekket for skader' },
      { id: 'ra3', text: 'Skydeskiver rengjort' },
      { id: 'ra4', text: 'Alt gear talt op' },
    ]
  },
  teamlazer: {
    before: [
      { id: 'lb1', text: 'Geværer (antal efter behov)' },
      { id: 'lb2', text: 'Kastere' },
      { id: 'lb3', text: 'Pointtavler' },
      { id: 'lb4', text: 'Controller' },
      { id: 'lb5', text: 'Batterier (fuldt opladet)' },
      { id: 'lb6', text: 'Ledninger og kabler' },
      { id: 'lb7', text: 'Højtaler' },
    ],
    after: [
      { id: 'la1', text: 'Alle geværer slukket' },
      { id: 'la2', text: 'Batterier til opladning' },
      { id: 'la3', text: 'Gear tjekket for skader' },
      { id: 'la4', text: 'Alt pakket i kasser' },
    ]
  },
  teamsegway: {
    before: [
      { id: 'sb1', text: 'Segways (antal efter behov)' },
      { id: 'sb2', text: 'Hjelme til alle' },
      { id: 'sb3', text: 'Kegler til bane' },
      { id: 'sb4', text: 'Ladere' },
      { id: 'sb5', text: 'Førstehjælpskasse' },
    ],
    after: [
      { id: 'sa1', text: 'Segways til opladning' },
      { id: 'sa2', text: 'Hjelme rengjort' },
      { id: 'sa3', text: 'Tjek for skader' },
      { id: 'sa4', text: 'Rapport om eventuelle uheld' },
    ]
  },
  teamcontrol: {
    afgang: [
      { id: 'tca1', text: 'BOX med kasser med Lego droner' },
      { id: 'tca2', text: 'Husk kasse med ekstra legoklodser "FLYBRIX EXTRA"', indent: true },
      { id: 'tca3', text: 'Tablets med "FlyBrix" app (Orange F ikon)' },
      { id: 'tca4', text: 'Kasse med de hvide droner' },
      { id: 'tca5', text: 'Kasse med controllere til hvide droner' },
      { id: 'tca6', text: '2 kasser med RC biler (8 stk.)' },
      { id: 'tca7', text: '1 kasse med RC GEAR + kegler' },
      { id: 'tca8', text: 'Batterier til gear (VIGTIGT!)' },
      { id: 'tca9', text: 'Batterier til Lego droner (med velcro)', indent: true },
      { id: 'tca10', text: 'Batterier til droner (uden velcro)', indent: true },
      { id: 'tca11', text: 'Batterier til controllere (AA)', indent: true },
      { id: 'tca12', text: 'Batterier til RC biler (specielle)', indent: true },
      { id: 'tca13', text: 'Orange helipad ring (i GEARBOX til droner)' },
      { id: 'tca14', text: 'JBL Extreme 5 Højtaler' },
    ],
    hjemkomst: [
      { id: 'tch1', text: 'Gearet skal virke og være klar til næste bruger' },
      { id: 'tch2', text: 'Alle batterier skal oplades' },
      { id: 'tch3', text: 'Tjek at de små DRONE batterier lader', indent: true },
      { id: 'tch4', text: 'Tjek at Controller batterier til RC biler lader', indent: true },
      { id: 'tch5', text: 'Tjek at RC batterier til biler lader', indent: true },
      { id: 'tch6', text: 'Alle brugte/tændte tablets til opladning' },
      { id: 'tch7', text: 'Fejl/mangler skrives i evalueringen' },
      { id: 'tch8', text: 'Ring ved defekt gear der påvirker næste opgave' },
    ]
  },
  teamconstruct: {
    afgang: [
      { id: 'coa1', text: 'Rør i forskellige størrelser' },
      { id: 'coa2', text: 'Save' },
      { id: 'coa3', text: 'Skærebrætter' },
      { id: 'coa4', text: 'Målebånd' },
      { id: 'coa5', text: 'Gaffatape' },
      { id: 'coa6', text: 'Golfbolde' },
      { id: 'coa7', text: 'Sorte borde' },
      { id: 'coa8', text: 'Højtaler' },
    ],
    hjemkomst: [
      { id: 'coh1', text: 'Alt materiale samlet' },
      { id: 'coh2', text: 'Rør sorteret efter størrelse' },
      { id: 'coh3', text: 'Save rengjort' },
      { id: 'coh4', text: 'Affald bortskaffet' },
    ]
  }
};

const ACTIVITY_OPTIONS = [
  { value: 'teamrobin', label: 'TeamRobin' },
  { value: 'teamlazer', label: 'TeamLazer' },
  { value: 'teamsegway', label: 'TeamSegway' },
  { value: 'teamcontrol', label: 'TeamControl' },
  { value: 'teamconstruct', label: 'TeamConstruct' },
  { value: 'teambox', label: 'TeamBox' },
  { value: 'teamconnect', label: 'TeamConnect' },
  { value: 'teamaction', label: 'TeamAction' },
  { value: 'teamchallenge', label: 'TeamChallenge' },
];

const LIST_TYPE_OPTIONS: Record<string, { value: string; label: string }[]> = {
  teamrobin: [
    { value: 'before', label: 'Før Opgaven' },
    { value: 'after', label: 'Efter Opgaven' },
  ],
  teamlazer: [
    { value: 'before', label: 'Før Opgaven' },
    { value: 'after', label: 'Efter Opgaven' },
  ],
  teamsegway: [
    { value: 'before', label: 'Før Opgaven' },
    { value: 'after', label: 'Efter Opgaven' },
  ],
  teamcontrol: [
    { value: 'afgang', label: 'Afgang' },
    { value: 'hjemkomst', label: 'Hjemkomst' },
  ],
  teamconstruct: [
    { value: 'afgang', label: 'Afgang' },
    { value: 'hjemkomst', label: 'Hjemkomst' },
  ],
  teambox: [
    { value: 'checklist', label: 'Nulstilling' },
  ],
  teamconnect: [
    { value: 'before', label: 'Før Opgaven' },
    { value: 'after', label: 'Efter Opgaven' },
  ],
  teamaction: [
    { value: 'before', label: 'Før Opgaven' },
    { value: 'after', label: 'Efter Opgaven' },
  ],
  teamchallenge: [
    { value: 'before', label: 'Før Opgaven' },
    { value: 'after', label: 'Efter Opgaven' },
  ],
};

const PackingListEditor: React.FC = () => {
  const { profile } = useAuth();
  const [selectedActivity, setSelectedActivity] = useState('teamrobin');
  const [selectedListType, setSelectedListType] = useState('before');
  const [items, setItems] = useState<PackingItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editSubtext, setEditSubtext] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [uploadingItemId, setUploadingItemId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Load list when activity or type changes
  useEffect(() => {
    loadList();
  }, [selectedActivity, selectedListType]);

  // Update list type options when activity changes
  useEffect(() => {
    const types = LIST_TYPE_OPTIONS[selectedActivity];
    if (types && types.length > 0) {
      setSelectedListType(types[0].value);
    }
  }, [selectedActivity]);

  const loadList = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      // Try to load from Supabase first
      const { data, error } = await supabase
        .from('packing_lists')
        .select('*')
        .eq('activity', selectedActivity)
        .eq('list_type', selectedListType)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Load error:', error);
      }

      if (data && data.items) {
        setItems(data.items);
      } else {
        // Use default list
        const defaultItems = DEFAULT_LISTS[selectedActivity]?.[selectedListType] || [];
        setItems(defaultItems);
      }
      setHasChanges(false);
    } catch (err) {
      console.error('Error loading list:', err);
      // Use default list on error
      const defaultItems = DEFAULT_LISTS[selectedActivity]?.[selectedListType] || [];
      setItems(defaultItems);
    } finally {
      setIsLoading(false);
    }
  };

  const saveList = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      const listData: PackingListData = {
        activity: selectedActivity,
        list_type: selectedListType,
        items: items,
        updated_at: new Date().toISOString(),
        updated_by: profile?.name || profile?.email || 'unknown'
      };

      const { error } = await supabase
        .from('packing_lists')
        .upsert(listData, {
          onConflict: 'activity,list_type'
        });

      if (error) {
        setMessage({ type: 'error', text: 'Kunne ikke gemme: ' + error.message });
        return;
      }

      setMessage({ type: 'success', text: 'Pakkeliste gemt!' });
      setHasChanges(false);
    } catch (err) {
      setMessage({ type: 'error', text: 'Fejl ved gemning' });
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const resetToDefault = () => {
    if (confirm('Nulstil til standard pakkeliste? Alle ændringer vil gå tabt.')) {
      const defaultItems = DEFAULT_LISTS[selectedActivity]?.[selectedListType] || [];
      setItems(defaultItems);
      setHasChanges(true);
    }
  };

  const addItem = () => {
    const newItem: PackingItem = {
      id: `new-${Date.now()}`,
      text: 'Ny item',
    };
    setItems([...items, newItem]);
    setEditingId(newItem.id);
    setEditText(newItem.text);
    setEditSubtext('');
    setHasChanges(true);
  };

  const addDivider = () => {
    const newDivider: PackingItem = {
      id: `divider-${Date.now()}`,
      text: 'NY SEKTION',
      isDivider: true,
    };
    setItems([...items, newDivider]);
    setEditingId(newDivider.id);
    setEditText(newDivider.text);
    setEditSubtext('');
    setHasChanges(true);
  };

  const deleteItem = (id: string) => {
    if (confirm('Slet denne item?')) {
      setItems(items.filter(item => item.id !== id));
      setHasChanges(true);
    }
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...items];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= items.length) return;
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
    setItems(newItems);
    setHasChanges(true);
  };

  const startEditing = (item: PackingItem) => {
    setEditingId(item.id);
    setEditText(item.text);
    setEditSubtext(item.subtext || '');
  };

  const saveEditing = () => {
    if (!editingId) return;
    setItems(items.map(item =>
      item.id === editingId
        ? { ...item, text: editText, subtext: editSubtext || undefined }
        : item
    ));
    setEditingId(null);
    setHasChanges(true);
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const toggleIndent = (id: string) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, indent: !item.indent } : item
    ));
    setHasChanges(true);
  };

  // Resize image to standard size for packing lists
  const resizeImage = (file: File, maxSize: number = 200): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Make it square (crop to center)
          const size = Math.min(width, height);
          const offsetX = (width - size) / 2;
          const offsetY = (height - size) / 2;

          canvas.width = maxSize;
          canvas.height = maxSize;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }

          // Draw cropped and resized image
          ctx.drawImage(img, offsetX, offsetY, size, size, 0, 0, maxSize, maxSize);

          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Could not create blob'));
            }
          }, 'image/jpeg', 0.85);
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, itemId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingItemId(itemId);

    try {
      // Resize image to standard 200x200 square
      const resizedBlob = await resizeImage(file, 200);
      const fileName = `packing-lists/${selectedActivity}-${itemId}-${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('guide-images')
        .upload(fileName, resizedBlob, { upsert: true, contentType: 'image/jpeg' });

      if (uploadError) {
        setMessage({ type: 'error', text: 'Kunne ikke uploade billede' });
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('guide-images')
        .getPublicUrl(fileName);

      setItems(items.map(item =>
        item.id === itemId ? { ...item, imageUrl: publicUrl } : item
      ));
      setHasChanges(true);
    } catch (err) {
      setMessage({ type: 'error', text: 'Fejl ved upload' });
      console.error(err);
    } finally {
      setUploadingItemId(null);
      // Clear the input
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
    }
  };

  const removeImage = (id: string) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, imageUrl: undefined } : item
    ));
    setHasChanges(true);
  };

  const listTypeOptions = LIST_TYPE_OPTIONS[selectedActivity] || [];
  const activityLabel = ACTIVITY_OPTIONS.find(a => a.value === selectedActivity)?.label || selectedActivity;
  const listTypeLabel = listTypeOptions.find(t => t.value === selectedListType)?.label || selectedListType;

  return (
    <div className="w-full max-w-4xl mx-auto px-2 tablet:px-4">
      <div className="bg-battle-grey/20 border border-white/10 rounded-xl tablet:rounded-2xl p-4 tablet:p-6 backdrop-blur-sm">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-green-500/20 rounded-xl border border-green-500/30">
            <Package className="w-6 h-6 tablet:w-8 tablet:h-8 text-green-400" />
          </div>
          <div>
            <h2 className="text-lg tablet:text-xl font-bold text-white uppercase tracking-wider">
              Pakkeliste Editor
            </h2>
            <p className="text-xs tablet:text-sm text-green-400 uppercase">Admin</p>
          </div>
        </div>

        {/* Selection */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2">
              Aktivitet
            </label>
            <select
              value={selectedActivity}
              onChange={(e) => setSelectedActivity(e.target.value)}
              className="w-full bg-battle-black/50 border border-white/20 rounded-lg p-3 text-white focus:outline-none focus:border-green-500 transition-colors"
            >
              {ACTIVITY_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2">
              Liste Type
            </label>
            <select
              value={selectedListType}
              onChange={(e) => setSelectedListType(e.target.value)}
              className="w-full bg-battle-black/50 border border-white/20 rounded-lg p-3 text-white focus:outline-none focus:border-green-500 transition-colors"
            >
              {listTypeOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Current list info */}
        <div className="flex items-center justify-between mb-4 p-3 bg-battle-black/30 rounded-lg">
          <div>
            <span className="text-white font-medium">{activityLabel}</span>
            <span className="text-gray-500 mx-2">→</span>
            <span className="text-green-400">{listTypeLabel}</span>
          </div>
          <span className="text-xs text-gray-500">{items.length} items</span>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-3 rounded-lg mb-4 ${
            message.type === 'success'
              ? 'bg-green-500/20 border border-green-500/30 text-green-400'
              : 'bg-red-500/20 border border-red-500/30 text-red-400'
          }`}>
            {message.text}
          </div>
        )}

        {/* Hidden file inputs */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => uploadingItemId && handleImageUpload(e, uploadingItemId)}
          accept="image/*"
          className="hidden"
        />
        <input
          type="file"
          ref={cameraInputRef}
          onChange={(e) => uploadingItemId && handleImageUpload(e, uploadingItemId)}
          accept="image/*"
          capture="environment"
          className="hidden"
        />

        {/* Items List */}
        <div className="space-y-2 max-h-[50vh] overflow-y-auto mb-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin mx-auto" />
              <p className="text-gray-500 mt-2">Indlæser...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Ingen items i denne liste</p>
            </div>
          ) : (
            items.map((item, index) => (
              <div
                key={item.id}
                className={`border rounded-lg overflow-hidden transition-all ${
                  item.isDivider
                    ? 'border-battle-orange/50 bg-battle-orange/10'
                    : editingId === item.id
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-white/10 bg-battle-black/30'
                } ${item.indent && !item.isDivider ? 'ml-6' : ''}`}
              >
                {editingId === item.id ? (
                  // Edit mode
                  <div className="p-3 space-y-2">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full bg-battle-black/50 border border-white/20 rounded-lg p-2 text-white uppercase focus:outline-none focus:border-green-500"
                      placeholder="Item tekst"
                      autoFocus
                    />
                    <input
                      type="text"
                      value={editSubtext}
                      onChange={(e) => setEditSubtext(e.target.value)}
                      className="w-full bg-battle-black/50 border border-white/20 rounded-lg p-2 text-white text-sm uppercase focus:outline-none focus:border-green-500"
                      placeholder="Undertekst (valgfrit)"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={saveEditing}
                        className="flex-1 flex items-center justify-center gap-2 p-2 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 text-sm hover:bg-green-500/30"
                      >
                        <Check className="w-4 h-4" />
                        Gem
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="p-2 bg-white/10 border border-white/20 rounded-lg text-gray-400 hover:bg-white/20"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <div className="p-3">
                    <div className="flex items-start gap-2">
                      {/* Reorder buttons */}
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => moveItem(index, 'up')}
                          disabled={index === 0}
                          className="p-1 text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => moveItem(index, 'down')}
                          disabled={index === items.length - 1}
                          className="p-1 text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {item.isDivider ? (
                          <div className="flex items-center gap-2">
                            <Minus className="w-4 h-4 text-battle-orange" />
                            <div className="text-battle-orange font-bold uppercase tracking-wider">{item.text}</div>
                            <div className="flex-1 h-px bg-battle-orange/30" />
                          </div>
                        ) : (
                          <>
                            <div className="text-white uppercase">{item.text}</div>
                            {item.subtext && (
                              <div className="text-xs text-gray-500 uppercase">{item.subtext}</div>
                            )}
                            {item.imageUrl && (
                              <div className="mt-2 relative">
                                <img
                                  src={item.imageUrl}
                                  alt=""
                                  className="h-20 rounded border border-white/10 object-cover"
                                />
                                <button
                                  onClick={() => removeImage(item.id)}
                                  className="absolute top-1 right-1 p-1 bg-red-500/80 rounded-full text-white hover:bg-red-500"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleIndent(item.id)}
                          className={`p-2 rounded transition-colors ${
                            item.indent
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'text-gray-500 hover:text-white hover:bg-white/10'
                          }`}
                          title="Indryk"
                        >
                          <GripVertical className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setUploadingItemId(item.id);
                            cameraInputRef.current?.click();
                          }}
                          disabled={uploadingItemId === item.id}
                          className="p-2 text-gray-500 hover:text-green-400 hover:bg-green-500/10 rounded transition-colors disabled:opacity-50"
                          title="Tag billede"
                        >
                          {uploadingItemId === item.id ? (
                            <div className="w-4 h-4 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin" />
                          ) : (
                            <Camera className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setUploadingItemId(item.id);
                            fileInputRef.current?.click();
                          }}
                          disabled={uploadingItemId === item.id}
                          className="p-2 text-gray-500 hover:text-green-400 hover:bg-green-500/10 rounded transition-colors disabled:opacity-50"
                          title="Vælg billede"
                        >
                          <ImagePlus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => startEditing(item)}
                          className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded transition-colors"
                          title="Rediger"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                          title="Slet"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={addItem}
            className="flex-1 flex items-center justify-center gap-2 p-3 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Tilføj Item
          </button>
          <button
            onClick={addDivider}
            className="flex-1 flex items-center justify-center gap-2 p-3 bg-battle-orange/20 border border-battle-orange/30 rounded-lg text-battle-orange hover:bg-battle-orange/30 transition-colors"
          >
            <Minus className="w-5 h-5" />
            Tilføj Divider
          </button>
          <button
            onClick={resetToDefault}
            className="p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-yellow-400 hover:bg-yellow-500/30 transition-colors"
            title="Nulstil til standard"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <button
            onClick={saveList}
            disabled={isSaving || !hasChanges}
            className="flex-1 flex items-center justify-center gap-2 p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 font-bold uppercase hover:bg-green-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            Gem Liste
          </button>
        </div>

        {hasChanges && (
          <p className="text-xs text-yellow-400 text-center mt-3">
            Du har ugemte ændringer
          </p>
        )}
      </div>
    </div>
  );
};

export default PackingListEditor;
