import React, { useState, useEffect } from 'react';
import { Package, CheckCircle2, Circle, RotateCcw, Plane, Home, Clock, Send, ChevronLeft, ChevronRight } from 'lucide-react';
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

interface Section {
  id: string;
  title: string;
  items: PackingItem[];
}

// Default packing lists - fallback if no custom data in Supabase
const DEFAULT_LISTS: Record<string, Record<string, PackingItem[]>> = {
  teamconstruct: {
    afgang: [
      { id: 'a1', text: 'Rør (2,5 til hver gruppe)' },
      { id: 'a2', text: 'Rundpinde (3 pinde til hvert hold)' },
      { id: 'a3', text: 'Sorte/gule Construct kasser (en til hvert hold) med:' },
      { id: 'a4', text: 'En golfbold', indent: true },
      { id: 'a5', text: 'Et skærebræt', indent: true },
      { id: 'a6', text: 'En sav', indent: true },
      { id: 'a7', text: 'Skærehandsker', indent: true },
      { id: 'a8', text: 'Målebånd', indent: true },
      { id: 'a9', text: 'Gaffatape', indent: true },
      { id: 'a10', text: 'Manual til hvad de skal konstruere', indent: true },
      { id: 'a11', text: 'Gul gearkasse med:' },
      { id: 'a12', text: 'Skemaer', indent: true },
      { id: 'a13', text: 'Kuglepen', indent: true },
      { id: 'a14', text: 'Ekstra golfbolde', indent: true },
      { id: 'a15', text: 'Ekstra gaffa', indent: true },
      { id: 'a16', text: 'Ekstra målebånd', indent: true },
      { id: 'a17', text: 'Ekstra skærehandsker', indent: true },
      { id: 'a18', text: 'Sorte borde (en til hvert hold)' },
      { id: 'a19', text: 'Højtaler' },
    ],
    hjemkomst: [
      { id: 'h1', text: 'Gearet skal virke og være klar til næste bruger' },
      { id: 'h2', text: 'Vådt gear ordnes med det samme ved retur' },
      { id: 'h3', text: 'Brugte pointskemaer smides ud – nye sættes i' },
      { id: 'h4', text: 'Skrald og "stumper" smides ud' },
      { id: 'h5', text: 'Rør og brugbare "afskæringer" gemmes' },
      { id: 'h6', text: 'Gearkasser fyldes op efter behov' },
      { id: 'h7', text: 'Fejl/mangler skrives i evalueringen' },
      { id: 'h8', text: 'Ring ved defekt gear der påvirker næste opgave' },
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
  teambox: {
    afgang: [
      { id: 'tba1', text: 'Grønne bokse (1 til hvert hold)', subtext: 'Tjek i app hvor mange hold gruppen er inddelt i' },
      { id: 'tba2', text: 'Husk 1-2 ekstrabokse – just in case' },
      { id: 'tba3', text: 'Sorte filtmåtter til skrøbelige borde (1 til hver boks)' },
      { id: 'tba4', text: '1 x powerbank til hver boks + extra' },
      { id: 'tba5', text: '1 stk JBL musikafspiller' },
      { id: 'tba6', text: '1 stk sækkevogn – hvis du skal slæbe dem' },
      { id: 'tba7', text: 'Instruktørkasse', isDivider: true },
      { id: 'tba8', text: 'Lamineret holdnumre (Tal fra hold 1-18)' },
      { id: 'tba9', text: 'Ekstramaterialer' },
    ],
    hjemkomst: [
      { id: 'tbh1', text: 'Gearet skal virke og være klar til næste bruger' },
      { id: 'tbh2', text: 'Alle kasserne skal nulstilles', subtext: 'Se nulstillingsmanual eller https://l.ead.me/teambox-nulstil' },
      { id: 'tbh3', text: 'Powerbanks SKAL oplades efter brug' },
      { id: 'tbh4', text: 'Fejl/mangler skrives i evalueringen' },
      { id: 'tbh5', text: 'Ring ved defekt gear der påvirker næste opgave' },
    ],
    nulstil: [
      { id: 'n-box', text: 'ESCAPEBOX', isDivider: true },
      { id: 'n-b1', text: 'Brief', subtext: 'Tjek der ikke er skrevet på det' },
      { id: 'n-b2', text: 'Blok', subtext: 'Tjek der ikke er skrevet på siderne' },
      { id: 'n-b3', text: 'Kuglepen' },
      { id: 'n-b4', text: 'Rød Kuvert', subtext: 'Tjek den er TOM før start' },
      { id: 'n-b5', text: 'Kodelås 3593', subtext: 'Tjek den er nulstillet' },
      { id: 'n-b6', text: 'Kodelås 4 cifre - 1375', subtext: 'Tjek den er nulstillet' },
      { id: 'n-r1', text: 'RUM 1', isDivider: true },
      { id: 'n-r1-1', text: 'Kortmåler', subtext: 'Tjek den er nulstillet' },
      { id: 'n-r1-2', text: 'Vandflaske (kode 130)', subtext: 'Tjek den åbner + der er vand i' },
      { id: 'n-r1-3', text: 'Sæt koden til "random"' },
      { id: 'n-r1-4', text: 'Pensel' },
      { id: 'n-r1-5', text: 'Papir med "missil etc."', subtext: 'Tjek der ikke er skrevet på' },
      { id: 'n-r1-6', text: 'Kodehjul', subtext: 'Drej det til tilfældig position' },
      { id: 'n-r1-7', text: 'Kuvert med "frimærke"', subtext: 'Tjek den er tom ved start' },
      { id: 'n-r1-8', text: 'Papirsflyver' },
      { id: 'n-r1-9', text: 'Ledere med flag' },
      { id: 'n-r1-10', text: 'Tank' },
      { id: 'n-r1-11', text: 'Sænke slagskib' },
      { id: 'n-r1-12', text: 'Filmstrimmel' },
      { id: 'n-r2', text: 'RUM 2', isDivider: true },
      { id: 'n-r2-1', text: 'Kode "retning"', subtext: 'Ned/Venstre/Op' },
      { id: 'n-r2-2', text: 'Hvide låse', subtext: 'Pres 2 gange på "bøjle" for nulstilling' },
      { id: 'n-r2-3', text: 'Bogstaver med huller', subtext: 'Tjek der IKKE er skrevet på' },
      { id: 'n-r2-4', text: 'Google Translate', subtext: 'Tjek der IKKE er skrevet på' },
      { id: 'n-r2-5', text: 'Puzzle', subtext: 'Find evt. manglende brikker' },
      { id: 'n-r3', text: 'RUM 3', isDivider: true },
      { id: 'n-r3-1', text: 'Højtaler', subtext: 'Sæt frekvens til ca. 92.0' },
      { id: 'n-r3-2', text: 'Tjek højtaler MORSER' },
      { id: 'n-r3-3', text: 'Drej frekvens helt til venstre igen' },
      { id: 'n-r3-4', text: 'FJERN BATTERIER/SLUK POWERBANK', subtext: 'Skal den lades?' },
      { id: 'n-r3-5', text: 'Kort med MORSE', subtext: 'Tjek der IKKE er skrevet på' },
      { id: 'n-r3-6', text: 'Kæden', subtext: 'Tjek låst i nederste + yderste led' },
      { id: 'n-r3-7', text: 'Hængelås kode 555' },
      { id: 'n-r4', text: 'RUM 4', isDivider: true },
      { id: 'n-r4-1', text: 'Penge', subtext: '9 sedler (8 er OK): 5,10,50,100,200,500,1000,2000,5000' },
      { id: 'n-r4-2', text: 'Labyrint', subtext: 'Tjek der IKKE er skrevet på papir' },
      { id: 'n-r4-3', text: 'Overhead', subtext: 'Tjek der ikke er skrevet på + placer print BAG' },
      { id: 'n-r4-4', text: 'Tjek at låg er låst foran i hullet' },
      { id: 'n-r4-5', text: 'Morselås – Kode MORSE', subtext: '"random" ved låsning' },
      { id: 'n-r4-6', text: 'HJULLÅS – LÅS DENNE' },
      { id: 'n-r4-7', text: 'Hvid Kuvert' },
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
  teamrace: {
    afgang: [
      { id: 'tra1', text: 'Sorte tasker med brædder til sæbekassebiler' },
      { id: 'tra2', text: 'Kasser med hjelme' },
      { id: 'tra3', text: 'En gearkasse med:', isDivider: true },
      { id: 'tra4', text: 'Pointskemaer', indent: true },
      { id: 'tra5', text: 'Kuglepen', indent: true },
      { id: 'tra6', text: 'Kegler', indent: true },
      { id: 'tra7', text: 'Regnslag', indent: true },
      { id: 'tra8', text: '1 stk. højt cafébord til point' },
      { id: 'tra9', text: '2 stk. sorte borde til at stille udstyr på' },
      { id: 'tra10', text: 'En gul kasse med værktøj' },
      { id: 'tra11', text: 'En gul kasse med skruemaskiner + opladte batterier' },
      { id: 'tra12', text: 'En gul kasse med tape til at pynte sæbekassebilen' },
      { id: 'tra13', text: '(I tilfælde af regn - 1 stk. telt + Jernklodser)', subtext: 'Valgfrit ved risiko for regn' },
    ],
    hjemkomst: [
      { id: 'trh0', text: 'Gearet skal virke og være klar til næste bruger!', isDivider: true },
      { id: 'trh1', text: 'Alle brædder og udstyr der er gået i stykker skal udskiftes' },
      { id: 'trh2', text: 'Har du oplevet fejl/mangler skal det skrives i evalueringen' },
      { id: 'trh3', text: 'Virker noget af gearet ikke, RING STRAKS', subtext: 'Så kommende opgave ikke er umulig' },
      { id: 'trh4', text: 'Tjek at alle tasker er pakket korrekt' },
      { id: 'trh5', text: 'Batterier til skruemaskiner skal oplades' },
    ],
    taske: [
      { id: 'trt0', text: 'Pakkes i 1 taske pr. hold', isDivider: true },
      { id: 'trt1', text: 'Bræt A', subtext: '1 stk.' },
      { id: 'trt2', text: 'Bræt B', subtext: '2 stk.' },
      { id: 'trt3', text: 'Bræt C', subtext: '3 stk.' },
      { id: 'trt4', text: 'Bræt D', subtext: '1 stk.' },
      { id: 'trt5', text: 'Bræt E', subtext: '2 stk.' },
      { id: 'trt6', text: 'Bræt F', subtext: '1 stk.' },
      { id: 'trt7', text: 'Bræt G', subtext: '2 stk.' },
      { id: 'trt8', text: 'Bræt H', subtext: '2 stk.' },
      { id: 'trt9', text: 'Bræt I', subtext: '2 stk.' },
      { id: 'trt10', text: 'Dæk', subtext: '4 stk.' },
      { id: 'trt11', text: 'Aksler', subtext: '2 stk.' },
      { id: 'trt12', text: 'Reb', subtext: '1 stk.' },
      { id: 'trt13', text: 'Manual', subtext: '1 stk.' },
      { id: 'trt14', text: 'Underlag', subtext: '1 stk.' },
      { id: 'trt15', text: 'Handsker', subtext: '1 par' },
      { id: 'trt16', text: 'Briller', subtext: '1 stk.' },
      { id: 'trt17', text: 'Horn', subtext: '1 stk.' },
      { id: 'trt18', text: 'PAKKES SEPARAT:', isDivider: true },
      { id: 'trt19', text: 'Skruer, bolte, tape', subtext: 'I separat kasse' },
      { id: 'trt20', text: 'Boremaskiner', subtext: 'I separat kasse' },
      { id: 'trt21', text: 'Hjelme', subtext: 'I separat kasse' },
      { id: 'trt22', text: 'HUSK: Tjek om der er træ der skal udskiftes!', isDivider: true },
    ]
  }
};

const ACTIVITY_NAMES: Record<string, string> = {
  teamconstruct: 'TeamConstruct',
  teamcontrol: 'TeamControl',
  teamrobin: 'TeamRobin',
  teamlazer: 'TeamLazer',
  teamsegway: 'TeamSegway',
  teambox: 'TeamBox',
  teamconnect: 'TeamConnect',
  teamaction: 'TeamAction',
  teamchallenge: 'TeamChallenge',
  teamrace: 'TeamRace',
};

interface DynamicPackingListProps {
  activity: string;
  listType: string;
  title?: string;
  enableTabs?: boolean;
  trackCompletion?: boolean;
}

const DynamicPackingList: React.FC<DynamicPackingListProps> = ({
  activity,
  listType,
  title,
  enableTabs = true,
  trackCompletion = false
}) => {
  const { profile } = useAuth();
  const [items, setItems] = useState<PackingItem[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [currentSection, setCurrentSection] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [completed, setCompleted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const storageKey = `${activity}_packing_${listType}`;
  const activityName = ACTIVITY_NAMES[activity] || activity;
  const isAfgang = listType === 'afgang' || listType === 'before';
  const Icon = isAfgang ? Plane : Home;
  const displayTitle = title || (listType === 'nulstil' ? 'NULSTIL BOX' : isAfgang ? 'PAKKELISTE AFGANG' : 'HUSKELISTE HJEMKOMST');

  // Load items from Supabase or use defaults
  useEffect(() => {
    const loadItems = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('packing_lists')
          .select('items')
          .eq('activity', activity)
          .eq('list_type', listType)
          .single();

        if (data && data.items && Array.isArray(data.items) && data.items.length > 0) {
          setItems(data.items);
        } else {
          const defaultItems = DEFAULT_LISTS[activity]?.[listType] || [];
          setItems(defaultItems);
        }
      } catch (err) {
        console.error('Error loading packing list:', err);
        const defaultItems = DEFAULT_LISTS[activity]?.[listType] || [];
        setItems(defaultItems);
      } finally {
        setIsLoading(false);
      }
    };

    loadItems();
  }, [activity, listType]);

  // Parse items into sections based on dividers
  useEffect(() => {
    if (items.length === 0) return;

    const hasDividers = items.some(item => item.isDivider);

    if (!hasDividers || !enableTabs) {
      // No dividers - single section with all items
      setSections([{
        id: 'all',
        title: displayTitle,
        items: items.filter(i => !i.isDivider)
      }]);
      return;
    }

    // Parse into sections
    const parsedSections: Section[] = [];
    let currentSectionItems: PackingItem[] = [];
    let currentSectionTitle = 'ITEMS';
    let currentSectionId = 'default';

    items.forEach((item) => {
      if (item.isDivider) {
        if (currentSectionItems.length > 0) {
          parsedSections.push({
            id: currentSectionId,
            title: currentSectionTitle,
            items: currentSectionItems
          });
        }
        currentSectionTitle = item.text;
        currentSectionId = item.id;
        currentSectionItems = [];
      } else {
        currentSectionItems.push(item);
      }
    });

    if (currentSectionItems.length > 0) {
      parsedSections.push({
        id: currentSectionId,
        title: currentSectionTitle,
        items: currentSectionItems
      });
    }

    setSections(parsedSections);
  }, [items, enableTabs, displayTitle]);

  // Load checked state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setCheckedItems(new Set(parsed));
        } else if (parsed.checked) {
          setCheckedItems(new Set(parsed.checked));
          if (parsed.startTime) setStartTime(new Date(parsed.startTime));
        }
      } catch (e) {
        console.error('Failed to load checked state:', e);
      }
    }
  }, [storageKey]);

  // Save checked state to localStorage
  useEffect(() => {
    if (items.length > 0) {
      const toSave = trackCompletion
        ? { checked: [...checkedItems], startTime: startTime?.toISOString() }
        : [...checkedItems];
      localStorage.setItem(storageKey, JSON.stringify(toSave));
    }
  }, [checkedItems, storageKey, items.length, startTime, trackCompletion]);

  const handleFirstCheck = () => {
    if (trackCompletion && !startTime) {
      setStartTime(new Date());
    }
  };

  const toggleItem = (id: string) => {
    handleFirstCheck();
    setCheckedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const resetAll = () => {
    if (confirm('Nulstil alle checkmarks?')) {
      setCheckedItems(new Set());
      setStartTime(null);
      setCurrentSection(0);
      localStorage.removeItem(storageKey);
    }
  };

  const checkAll = () => {
    handleFirstCheck();
    const allCheckable = sections.flatMap(s => s.items).map(i => i.id);
    setCheckedItems(new Set(allCheckable));
  };

  const checkAllSection = () => {
    handleFirstCheck();
    const currentItems = sections[currentSection]?.items || [];
    setCheckedItems(prev => {
      const newSet = new Set(prev);
      currentItems.forEach(item => newSet.add(item.id));
      return newSet;
    });
  };

  const resetSection = () => {
    if (confirm('Nulstil denne sektion?')) {
      const currentItems = sections[currentSection]?.items || [];
      setCheckedItems(prev => {
        const newSet = new Set(prev);
        currentItems.forEach(item => newSet.delete(item.id));
        return newSet;
      });
    }
  };

  // Calculate progress
  const allCheckableItems = sections.flatMap(s => s.items);
  const totalItems = allCheckableItems.length;
  const totalChecked = allCheckableItems.filter(i => checkedItems.has(i.id)).length;
  const overallProgress = totalItems > 0 ? (totalChecked / totalItems) * 100 : 0;

  const section = sections[currentSection];
  const sectionChecked = section?.items.filter(i => checkedItems.has(i.id)).length || 0;
  const sectionTotal = section?.items.length || 0;
  const sectionProgress = sectionTotal > 0 ? (sectionChecked / sectionTotal) * 100 : 0;

  const hasTabs = sections.length > 1;

  const getDuration = () => {
    if (!startTime) return '0 min';
    const now = new Date();
    const diffMs = now.getTime() - startTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins} min`;
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}t ${mins}m`;
  };

  const handleComplete = async () => {
    if (!trackCompletion) return;

    setIsSaving(true);
    try {
      const endTime = new Date();
      const duration = startTime ? Math.floor((endTime.getTime() - startTime.getTime()) / 1000) : 0;

      await supabase
        .from('packing_list_completions')
        .insert({
          activity,
          list_type: listType,
          completed_by: profile?.email || 'unknown',
          completed_by_name: profile?.name || profile?.email || 'unknown',
          started_at: startTime?.toISOString(),
          completed_at: endTime.toISOString(),
          duration_seconds: duration,
          items_checked: totalChecked,
          items_total: totalItems
        });

      localStorage.removeItem(storageKey);
      setCompleted(true);
    } catch (err) {
      console.error('Error completing:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (completed) {
    return (
      <div className="w-full max-w-2xl mx-auto px-2 tablet:px-4">
        <div className="bg-battle-grey/20 border border-green-500/30 rounded-xl tablet:rounded-2xl p-6 tablet:p-8 backdrop-blur-sm text-center">
          <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-400 uppercase tracking-wider mb-2">
            Tjekliste Fuldført!
          </h2>
          <p className="text-sm text-gray-500 mb-6">Tid brugt: {getDuration()}</p>
          <button
            onClick={() => {
              setCompleted(false);
              setCheckedItems(new Set());
              setStartTime(null);
              setCurrentSection(0);
            }}
            className="px-6 py-3 bg-battle-orange/20 border border-battle-orange/30 rounded-lg text-battle-orange uppercase tracking-wider hover:bg-battle-orange/30 transition-colors"
          >
            Start Forfra
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto px-2 tablet:px-4">
        <div className="bg-battle-grey/20 border border-white/10 rounded-xl tablet:rounded-2xl p-6 tablet:p-8 backdrop-blur-sm text-center">
          <div className="w-8 h-8 border-2 border-battle-orange/30 border-t-battle-orange rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 mt-4">Indlæser pakkeliste...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-2 tablet:px-4">
      <div className="bg-battle-grey/20 border border-white/10 rounded-xl tablet:rounded-2xl p-4 tablet:p-6 backdrop-blur-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 tablet:mb-6">
          <div className="flex items-center gap-3">
            <Icon className="w-6 h-6 tablet:w-8 tablet:h-8 text-battle-orange" />
            <div>
              <h2 className="text-base tablet:text-xl font-bold text-white uppercase tracking-wider">
                {hasTabs ? section?.title : displayTitle}
              </h2>
              <div className="flex items-center gap-2">
                <p className="text-[10px] tablet:text-xs text-gray-500 uppercase">{activityName}</p>
                {trackCompletion && startTime && (
                  <span className="flex items-center gap-1 text-[10px] tablet:text-xs text-battle-orange">
                    <Clock className="w-3 h-3" />
                    {getDuration()}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={hasTabs ? checkAllSection : checkAll}
              className="flex items-center gap-1 px-2 tablet:px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 text-xs uppercase hover:bg-green-500/30 transition-colors"
            >
              <CheckCircle2 className="w-3 h-3 tablet:w-4 tablet:h-4" />
            </button>
            <button
              onClick={hasTabs ? resetSection : resetAll}
              className="flex items-center gap-1 px-2 tablet:px-3 py-1.5 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-xs uppercase hover:bg-red-500/30 transition-colors"
            >
              <RotateCcw className="w-3 h-3 tablet:w-4 tablet:h-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        {hasTabs && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {sections.map((s, idx) => {
              const sChecked = s.items.filter(i => checkedItems.has(i.id)).length;
              const sTotal = s.items.length;
              const isComplete = sChecked === sTotal;

              return (
                <button
                  key={s.id}
                  onClick={() => setCurrentSection(idx)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium uppercase transition-colors whitespace-nowrap ${
                    idx === currentSection
                      ? 'bg-battle-orange text-white'
                      : isComplete
                      ? 'bg-green-500/30 text-green-400 border border-green-500/30'
                      : 'bg-white/10 text-gray-400 hover:bg-white/20'
                  }`}
                >
                  {s.title}
                </button>
              );
            })}
          </div>
        )}

        {/* Overall Progress (only show if tabs) */}
        {hasTabs && (
          <div className="mb-2">
            <div className="flex justify-between text-[10px] text-gray-500 mb-1">
              <span>Total: {totalChecked}/{totalItems}</span>
              <span>{Math.round(overallProgress)}%</span>
            </div>
            <div className="h-1.5 bg-battle-black/50 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  overallProgress === 100 ? 'bg-green-500' : 'bg-battle-orange/50'
                }`}
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Section/Main Progress bar */}
        <div className="mb-4 tablet:mb-6">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>{hasTabs ? sectionChecked : totalChecked} / {hasTabs ? sectionTotal : totalItems}</span>
            <span>{Math.round(hasTabs ? sectionProgress : overallProgress)}%</span>
          </div>
          <div className="h-2 bg-battle-black/50 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                (hasTabs ? sectionProgress : overallProgress) === 100 ? 'bg-green-500' : 'bg-battle-orange'
              }`}
              style={{ width: `${hasTabs ? sectionProgress : overallProgress}%` }}
            />
          </div>
        </div>

        {/* Items */}
        <div className="space-y-2 max-h-[45vh] overflow-y-auto">
          {(hasTabs ? section?.items : allCheckableItems)?.map((item) => {
            const isChecked = checkedItems.has(item.id);

            return (
              <button
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                  item.indent ? 'ml-4 tablet:ml-6' : ''
                } ${
                  isChecked
                    ? 'bg-green-500/20 border border-green-500/30'
                    : 'bg-battle-black/30 border border-white/5 hover:border-white/20'
                }`}
              >
                {isChecked ? (
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-600 flex-shrink-0" />
                )}

                <div className="flex-1 min-w-0">
                  <span className={`text-sm tablet:text-base block uppercase ${
                    isChecked ? 'text-green-400 line-through' : 'text-white'
                  }`}>
                    {item.text}
                  </span>
                  {item.subtext && (
                    <span className={`text-xs block mt-0.5 uppercase ${
                      isChecked ? 'text-green-400/60' : 'text-gray-500'
                    }`}>
                      {item.subtext}
                    </span>
                  )}
                </div>

                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt=""
                    className="w-16 h-16 tablet:w-20 tablet:h-20 rounded-lg object-cover border border-white/10 flex-shrink-0"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Navigation for tabs */}
        {hasTabs && (
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
              disabled={currentSection === 0}
              className="flex-1 flex items-center justify-center gap-2 p-3 bg-white/10 border border-white/20 rounded-lg text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Forrige
            </button>
            {currentSection === sections.length - 1 && overallProgress === 100 && trackCompletion ? (
              <button
                onClick={handleComplete}
                disabled={isSaving}
                className="flex-1 flex items-center justify-center gap-2 p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 hover:bg-green-500/30 transition-colors disabled:opacity-50"
              >
                {isSaving ? (
                  <div className="w-5 h-5 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                Fuldfør
              </button>
            ) : (
              <button
                onClick={() => setCurrentSection(Math.min(sections.length - 1, currentSection + 1))}
                disabled={currentSection === sections.length - 1}
                className="flex-1 flex items-center justify-center gap-2 p-3 bg-battle-orange/20 border border-battle-orange/30 rounded-lg text-battle-orange hover:bg-battle-orange/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Næste
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Reset All for tabs */}
        {hasTabs && (
          <button
            onClick={resetAll}
            className="w-full mt-3 p-2 text-xs text-gray-500 hover:text-red-400 transition-colors uppercase"
          >
            Nulstil Hele Listen
          </button>
        )}

        {/* Completion message (for non-tabs) */}
        {!hasTabs && overallProgress === 100 && (
          <div className="mt-4 tablet:mt-6 p-3 bg-green-500/20 border border-green-500/30 rounded-xl text-center">
            <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <div className="text-lg font-bold text-green-400 uppercase">
              {isAfgang ? 'KLAR TIL AFGANG!' : 'FÆRDIG!'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DynamicPackingList;
