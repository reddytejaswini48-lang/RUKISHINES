import React, { useState, useEffect } from 'react';
import { Sparkles, Check, RotateCcw, Lightbulb, Play, ArrowDown, Heart, Camera, Smile } from 'lucide-react';
import confetti from 'canvas-confetti';
import { PlayerAttireState, AvatarGender, CostumeItem, JewelryItem } from '../types';
import { sound } from '../utils/audio';

// Catalogs exported for celebration & rewards
export const COSTUME_CATALOG: CostumeItem[] = [
  {
    id: 'costume_maroon_dhoti',
    name: 'Royal Saffron Gold Zari Pitambar',
    hindiName: 'केसरिया जरी किनारी पीतांबर',
    type: 'pitambar',
    colorName: 'Sacred Kesar & Gold',
    primaryColor: '#ea580c',
    secondaryColor: '#f59e0b',
    zariColor: '#fde047',
    pattern: 'zari_brocade',
    description: 'Auspicious pure mulberry silk pitambar with hand-woven golden temple borders.',
  },
  {
    id: 'costume_peacock_sherwani',
    name: 'Peacock Sapphire Silk Pitambar',
    hindiName: 'शाही मयूर नील पीतांबर',
    type: 'pitambar',
    colorName: 'Peacock Sapphire Blue',
    primaryColor: '#1e3a8a',
    secondaryColor: '#f59e0b',
    zariColor: '#fbbf24',
    pattern: 'silk_embroidery',
    description: 'Majestic royal sapphire silk pitambar encrusted with intricate antique golden zari work.',
  },
  {
    id: 'costume_saffron_pitambar',
    name: 'Sacred Pitambar & Angavastram',
    hindiName: 'उत्सव पीतांबर व रेशमी उत्तरीय',
    type: 'pitambar',
    colorName: 'Sacred Saffron Gold',
    primaryColor: '#ea580c',
    secondaryColor: '#ca8a04',
    zariColor: '#fef08a',
    pattern: 'gold_border',
    description: 'Radiant glowing saffron pure silk lower garment paired with golden-bordered shoulder scarf.',
  },
];

export const HEADWEAR_CATALOG: JewelryItem[] = [
  {
    id: 'headwear_puneri_feta',
    name: 'Royal Puneri Feta with Gold Kalgi',
    hindiName: 'शाही पुणेरी फेटा व कलगी',
    category: 'headwear',
    gemType: 'gold',
    icon: '👑',
    description: 'Traditional royal Ganesh festival turban adorned with an antique pearl and gold kalgi.',
  },
  {
    id: 'headwear_golden_mukut',
    name: 'Temple-Blessed Filigree Golden Mukut',
    hindiName: 'स्वर्ण नक्काशी मुकुट',
    category: 'headwear',
    gemType: 'gold',
    icon: '✨',
    description: 'Radiant layered crown embossed with temple lotus petals and divine sun rays.',
  },
];

export const NECKLACE_CATALOG: JewelryItem[] = [
  {
    id: 'necklace_navratna_haar',
    name: 'Fresh Marigold Mala & Navratna Haar',
    hindiName: 'गेंदा पुष्पमाला व नवरत्न हार',
    category: 'necklace',
    gemType: 'navratna',
    icon: '📿',
    description: 'Fragrant marigold garland paired with nine celestial gems set in pure temple gold.',
  },
  {
    id: 'necklace_kundan_emerald',
    name: 'Royal Kundan & Colombian Emerald Choker',
    hindiName: 'शाही कुंदन व पन्ना चोकर',
    category: 'necklace',
    gemType: 'emerald',
    icon: '💎',
    description: 'Majestic choker centered with an uncut glowing green emerald and teardrop pearl drops.',
  },
];

// --- 8 ANATOMICAL LEVELS ON LORD GANESHA'S FORM ---
export interface AdornmentLevelDef {
  levelNumber: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  id: string;
  name: string;
  hindiName: string;
  bodyZone: string;
  icon: string;
  description: string;
  side: 'left' | 'right';
}

export const ADORNMENT_LEVELS: AdornmentLevelDef[] = [
  {
    levelNumber: 1,
    id: 'level_1_head',
    name: 'Level 1: Crown & Mukut (शीर्ष मुकुट)',
    hindiName: 'शीर्ष मुकुट',
    bodyZone: 'Crown / Head',
    icon: '👑',
    description: 'Place the royal Golden Mukut or Puneri Feta on Bal Ganesha’s divine head.',
    side: 'left',
  },
  {
    levelNumber: 2,
    id: 'level_2_forehead',
    name: 'Level 2: Sacred Tilak (भाल तिलक)',
    hindiName: 'भाल तिलक',
    bodyZone: 'Forehead',
    icon: '🪷',
    description: 'Adorn Bal Ganesha’s forehead with holy Chandan, Kumkum, and sacred marks.',
    side: 'left',
  },
  {
    levelNumber: 3,
    id: 'level_3_ears',
    name: 'Level 3: Divine Ears & Kundal (कर्ण कुंडल)',
    hindiName: 'कर्ण कुंडल',
    bodyZone: 'Ears',
    icon: '🔔',
    description: 'Place glittering gold Kundals on Bal Ganesha’s large, gentle elephant ears.',
    side: 'left',
  },
  {
    levelNumber: 4,
    id: 'level_4_neck',
    name: 'Level 4: Mala & Haar (कंठ पुष्पहार)',
    hindiName: 'कंठ पुष्पहार',
    bodyZone: 'Neck',
    icon: '📿',
    description: 'Drape fragrant fresh Marigold garlands and gem-encrusted haars around his neck.',
    side: 'left',
  },
  {
    levelNumber: 5,
    id: 'level_5_torso',
    name: 'Level 5: Angavastram & Janeu (अंगवस्त्र व जनेऊ)',
    hindiName: 'अंगवस्त्र व जनेऊ',
    bodyZone: 'Torso',
    icon: '🧣',
    description: 'Place the sacred golden Yajnopavita thread and royal silk shawl across his chest.',
    side: 'right',
  },
  {
    levelNumber: 6,
    id: 'level_6_arms',
    name: 'Level 6: Arms & Kadas (हस्त कड़े व बाजूबंद)',
    hindiName: 'हस्त कड़े',
    bodyZone: 'Wrists & Arms',
    icon: '🖐️',
    description: 'Fasten pure temple gold elephant kadas on Bal Ganesha’s divine blessing arms.',
    side: 'right',
  },
  {
    levelNumber: 7,
    id: 'level_7_waist',
    name: 'Level 7: Pitambar Dhoti (कटि पीतांबर)',
    hindiName: 'कटि पीतांबर',
    bodyZone: 'Waist & Dhoti',
    icon: '👖',
    description: 'Wrap the shimmering gold-bordered silk pitambar dhoti around his waist.',
    side: 'right',
  },
  {
    levelNumber: 8,
    id: 'level_8_hands',
    name: 'Level 8: Modak Thali (करकमल मोदक थाल)',
    hindiName: 'करकमल मोदक थाल',
    bodyZone: 'Hands Offering',
    icon: '🥟',
    description: 'Offer a golden thali laden with fresh steamed modaks and a dancing diya to his hands.',
    side: 'right',
  },
];

export interface ShringarItem {
  id: string;
  name: string;
  hindiName: string;
  correctLevel: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  levelTitle: string;
  category: 'headwear' | 'tilak' | 'earrings' | 'necklace' | 'upper' | 'arms' | 'lower' | 'accessory';
  icon: string;
  badge: string;
  description: string;
  ganeshaQuote: string;
  attireKey: keyof PlayerAttireState;
  attireValue: string;
  ensemble: 'puneri_saffron' | 'peacock_sapphire';
}

export const SHRINGAR_ITEMS: ShringarItem[] = [
  // --- ENSEMBLE 1: Royal Puneri Saffron Shringar ---
  {
    id: 'item_puneri_feta',
    name: 'Royal Saffron Puneri Feta with Kalgi',
    hindiName: 'शाही पुणेरी फेटा व कलगी',
    correctLevel: 1,
    levelTitle: 'Level 1: Crown & Mukut (शीर्ष)',
    category: 'headwear',
    icon: '👑',
    badge: 'Level 1 Headwear',
    description: 'Traditional Maratha royal saffron turban adorned with a sparkling golden kalgi brooch.',
    ganeshaQuote: 'Wah! My Puneri Feta sits with supreme majesty on my head!',
    attireKey: 'headwearId',
    attireValue: 'headwear_puneri_feta',
    ensemble: 'puneri_saffron',
  },
  {
    id: 'item_tilak_chandan',
    name: 'Auspicious Chandan & Kumkum Tilak',
    hindiName: 'पवित्र चंदन व कुमकुम तिलक',
    correctLevel: 2,
    levelTitle: 'Level 2: Sacred Tilak (भाल)',
    category: 'tilak',
    icon: '🪷',
    badge: 'Level 2 Tilak',
    description: 'Three curved golden chandan strokes topped with a glowing auspicious red kumkum bindu.',
    ganeshaQuote: 'Ah, the cooling fragrance of sandalwood on my forehead! So refreshing!',
    attireKey: 'tilakId',
    attireValue: 'tilak_chandan',
    ensemble: 'puneri_saffron',
  },
  {
    id: 'item_earrings_chandbali',
    name: 'Royal Pearl & Temple Gold Chandbali',
    hindiName: 'मोती व स्वर्ण चंद्रबाली',
    category: 'earrings',
    correctLevel: 3,
    levelTitle: 'Level 3: Ears & Kundal (कर्ण)',
    icon: '✨',
    badge: 'Level 3 Kundal',
    description: 'Crescent-moon shaped temple earrings lined with natural pearls for his gentle ears.',
    ganeshaQuote: 'Hear that soft chime? My ears sparkle whenever I flap them with joy!',
    attireKey: 'earringsId',
    attireValue: 'earrings_chandbali',
    ensemble: 'puneri_saffron',
  },
  {
    id: 'item_necklace_marigold_navratna',
    name: 'Fresh Marigold Mala & Navratna Haar',
    hindiName: 'गेंदा पुष्पमाला व नवरत्न हार',
    correctLevel: 4,
    levelTitle: 'Level 4: Mala & Haar (कंठ)',
    category: 'necklace',
    icon: '📿',
    badge: 'Level 4 Haar',
    description: 'Golden yellow genda flowers hand-woven with a nine-gem planetary protective necklace.',
    ganeshaQuote: 'Mmm! Nothing smells sweeter than fresh festive marigolds around my neck!',
    attireKey: 'necklaceId',
    attireValue: 'necklace_navratna_haar',
    ensemble: 'puneri_saffron',
  },
  {
    id: 'item_upper_silk_angavastram',
    name: 'Mulberry Silk Angavastram & Golden Janeu',
    hindiName: 'रेशमी अंगवस्त्र व स्वर्ण जनेऊ',
    correctLevel: 5,
    levelTitle: 'Level 5: Angavastram & Janeu (अंगवस्त्र)',
    category: 'upper',
    icon: '🧣',
    badge: 'Level 5 Torso',
    description: 'Sacred golden Yajnopavita thread paired with an ornate red and gold silk shoulder drape.',
    ganeshaQuote: 'My sacred janeu and silk drape give my divine tummy a royal warm hug!',
    attireKey: 'costumeId',
    attireValue: 'costume_maroon_dhoti',
    ensemble: 'puneri_saffron',
  },
  {
    id: 'item_arms_gajamukha_kada',
    name: 'Temple Gold Gaja-Mukha Kadas',
    hindiName: 'स्वर्ण गजमुख कड़े',
    correctLevel: 6,
    levelTitle: 'Level 6: Arms & Kadas (हस्त)',
    category: 'arms',
    icon: '🖐️',
    badge: 'Level 6 Wrists',
    description: 'Heavy 24-karat gold bangles featuring miniature elephant head finials on his wrists.',
    ganeshaQuote: 'Look at my strong blessing hands! These gold kadas gleam like pure sunlight!',
    attireKey: 'armsId',
    attireValue: 'arms_temple_kada',
    ensemble: 'puneri_saffron',
  },
  {
    id: 'item_lower_saffron_pitambar',
    name: 'Pleated Saffron Silk Pitambar with Gold Zari',
    hindiName: 'केसरिया जरी पीतांबर',
    correctLevel: 7,
    levelTitle: 'Level 7: Pitambar Dhoti (कटि)',
    category: 'lower',
    icon: '👖',
    badge: 'Level 7 Dhoti',
    description: 'Auspicious glowing yellow-orange silk dhoti with pleated folds and a golden kamarbandh.',
    ganeshaQuote: 'My bright saffron pitambar is tied! Now I am ready to sit on my lotus throne!',
    attireKey: 'costumeId',
    attireValue: 'costume_maroon_dhoti',
    ensemble: 'puneri_saffron',
  },
  {
    id: 'item_acc_modak_aarti_thali',
    name: 'Golden Thali with Steamed Modak & Diya',
    hindiName: 'स्वर्ण मोदक थाल व दीप',
    correctLevel: 8,
    levelTitle: 'Level 8: Modak Thali (करकमल)',
    category: 'accessory',
    icon: '🥟',
    badge: 'Level 8 Offering',
    description: 'A glowing brass and gold platter heaped with fresh steamed ukadiche modaks and a burning diya.',
    ganeshaQuote: 'YUMMY! My favorite steamed coconut-jaggery Modaks! My GRWM is complete!',
    attireKey: 'accessoryId',
    attireValue: 'acc_aarti_thali',
    ensemble: 'puneri_saffron',
  },

  // --- ENSEMBLE 2: Peacock Sapphire & Emerald Temple Shringar ---
  {
    id: 'item_mukut_gold_peacock',
    name: 'Temple-Blessed Filigree Golden Mukut',
    hindiName: 'स्वर्ण नक्काशी मुकुट',
    correctLevel: 1,
    levelTitle: 'Level 1: Crown & Mukut (शीर्ष)',
    category: 'headwear',
    icon: '✨',
    badge: 'Level 1 Headwear',
    description: 'Radiant layered crown embossed with temple lotus petals, rubies, and divine sun rays.',
    ganeshaQuote: 'A dazzling crown touched with temple blessings! It shines like a thousand stars!',
    attireKey: 'headwearId',
    attireValue: 'headwear_golden_mukut',
    ensemble: 'peacock_sapphire',
  },
  {
    id: 'item_tilak_tripundra',
    name: 'Sacred Shiva-Shakti Tripundra Bhasma',
    hindiName: 'त्रिपुंड्र भस्म तिलक',
    correctLevel: 2,
    levelTitle: 'Level 2: Sacred Tilak (भाल)',
    category: 'tilak',
    icon: '⚪',
    badge: 'Level 2 Tilak',
    description: 'Three horizontal lines of fragrant holy vibhuti ash centered with a red vermilion dot.',
    ganeshaQuote: 'Father Shiva’s holy tripundra! It fills my heart with divine peace!',
    attireKey: 'tilakId',
    attireValue: 'tilak_tripundra',
    ensemble: 'peacock_sapphire',
  },
  {
    id: 'item_earrings_jhumka_bells',
    name: 'Temple Gold Jhumkas with Jingle Bells',
    hindiName: 'स्वर्ण झुमकी व घुंघरू',
    correctLevel: 3,
    levelTitle: 'Level 3: Ears & Kundal (कर्ण)',
    category: 'earrings',
    icon: '🔔',
    badge: 'Level 3 Kundal',
    description: 'Traditional bell-shaped golden ear drops with chiming musical ghungroos.',
    ganeshaQuote: 'Tinkle, tinkle! Mushak loves dancing whenever my jhumka bells jingle!',
    attireKey: 'earringsId',
    attireValue: 'earrings_jhumka_bells',
    ensemble: 'peacock_sapphire',
  },
  {
    id: 'item_necklace_kundan_emerald',
    name: 'Royal Kundan & Colombian Emerald Choker',
    hindiName: 'शाही कुंदन व पन्ना चोकर',
    correctLevel: 4,
    levelTitle: 'Level 4: Mala & Haar (कंठ)',
    category: 'necklace',
    icon: '💎',
    badge: 'Level 4 Haar',
    description: 'Magnificent choker centering an uncut glowing green emerald and teardrop pearl drops.',
    ganeshaQuote: 'Cool emeralds and glowing pearls! They look so regal around my neck!',
    attireKey: 'necklaceId',
    attireValue: 'necklace_kundan_emerald',
    ensemble: 'peacock_sapphire',
  },
  {
    id: 'item_upper_peacock_stole',
    name: 'Peacock Sapphire Embroidered Stole & Janeu',
    hindiName: 'मयूर नील जरदोजी उत्तरीय',
    correctLevel: 5,
    levelTitle: 'Level 5: Angavastram & Janeu (अंगवस्त्र)',
    category: 'upper',
    icon: '🥻',
    badge: 'Level 5 Torso',
    description: 'Deep royal sapphire silk stole hand-embroidered with antique golden peacock feathers.',
    ganeshaQuote: 'Shades of twilight blue and gold peacock feathers! So comfortable!',
    attireKey: 'costumeId',
    attireValue: 'costume_peacock_sherwani',
    ensemble: 'peacock_sapphire',
  },
  {
    id: 'item_arms_peacock_bajuband',
    name: 'Meenakari Peacock Royal Bajuband Pair',
    hindiName: 'मीनाकारी मयूर बाजूबंद',
    correctLevel: 6,
    levelTitle: 'Level 6: Arms & Kadas (हस्त)',
    category: 'arms',
    icon: '🦚',
    badge: 'Level 6 Wrists',
    description: 'Turquoise and emerald enameled armlets with miniature hanging pearl tassels.',
    ganeshaQuote: 'Delicate meenakari peacock feathers on my arms! Ready to grant blessings!',
    attireKey: 'armsId',
    attireValue: 'arms_peacock_bajuband',
    ensemble: 'peacock_sapphire',
  },
  {
    id: 'item_lower_sapphire_pitambar',
    name: 'Royal Sapphire Silk Pitambar with Wide Zari',
    hindiName: 'शाही नील जरी पीतांबर',
    correctLevel: 7,
    levelTitle: 'Level 7: Pitambar Dhoti (कटि)',
    category: 'lower',
    icon: '🩳',
    badge: 'Level 7 Dhoti',
    description: 'Exquisite deep blue silk dhoti framed by broad antique yellow gold borders.',
    ganeshaQuote: 'My sapphire dhoti is pleated to perfection! I feel so light and festive!',
    attireKey: 'costumeId',
    attireValue: 'costume_peacock_sherwani',
    ensemble: 'peacock_sapphire',
  },
  {
    id: 'item_acc_puja_bell_lotus',
    name: 'Silver Garuda Bell & Sacred Pink Lotus',
    hindiName: 'चांदी की गरुड़ घंटी व कमल',
    correctLevel: 8,
    levelTitle: 'Level 8: Modak Thali (करकमल)',
    category: 'accessory',
    icon: '🛎️',
    badge: 'Level 8 Offering',
    description: 'Hand-carved holy silver puja bell and a fresh blooming pink Sahasradala lotus.',
    ganeshaQuote: 'Ting-a-ling! The sound of the sacred bell purifies the festival air!',
    attireKey: 'accessoryId',
    attireValue: 'acc_puja_bell',
    ensemble: 'peacock_sapphire',
  },
];

interface FestivalDressUpGameProps {
  onComplete: () => void;
  onLoseLife: () => void;
  isPaused: boolean;
  playerAttire: PlayerAttireState;
  onUpdateAttire: (attire: PlayerAttireState) => void;
  onUpdateProgress: (done: number, total: number) => void;
  onUpdateTimeLeft?: (sec: number | undefined) => void;
}

export const FestivalDressUpGame: React.FC<FestivalDressUpGameProps> = ({
  onComplete,
  onLoseLife,
  playerAttire,
  onUpdateAttire,
  onUpdateProgress,
}) => {
  // Ensemble theme: Saffron Royal vs Peacock Sapphire
  const [activeEnsemble, setActiveEnsemble] = useState<'puneri_saffron' | 'peacock_sapphire'>('puneri_saffron');

  // Currently placed items map: levelNumber (1 to 8) -> ShringarItem
  const [placedLevels, setPlacedLevels] = useState<Partial<Record<number, ShringarItem>>>({});

  // Selected item in tray (for tap-to-place)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Dragging state
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [highlightSlot, setHighlightSlot] = useState<number | null>(null);

  // Animations & Feedback
  const [shakingSlot, setShakingSlot] = useState<number | null>(null);
  const [hintSlot, setHintSlot] = useState<number | null>(null);
  const [isSparkling, setIsSparkling] = useState(false);
  const [earsWiggling, setEarsWiggling] = useState(false);
  const [ganeshaPosing, setGaneshaPosing] = useState(false);
  const [consecutiveMistakes, setConsecutiveMistakes] = useState(0);

  // Ganesha's dynamic dialogue for the GRWM experience!
  const [ganeshaQuote, setGaneshaQuote] = useState<string>(
    'Namaste friend! Welcome to my GRWM (Get Ready With Me)! Help me get dressed for the grand festival!'
  );
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'info' | 'success' | 'error' } | null>(null);

  // Current items pool
  const currentEnsembleItems = SHRINGAR_ITEMS.filter((item) => item.ensemble === activeEnsemble);
  const placedCount = Object.keys(placedLevels).length;
  const isComplete = placedCount === 8;

  // Unplaced items for the active ensemble
  const unplacedItems = currentEnsembleItems.filter(
    (item) => !placedLevels[item.correctLevel] || placedLevels[item.correctLevel]?.id !== item.id
  );

  // Report progress
  useEffect(() => {
    onUpdateProgress(placedCount, 8);
  }, [placedCount, onUpdateProgress]);

  // Handle switching ensembles
  const handleSwitchEnsemble = (ensemble: 'puneri_saffron' | 'peacock_sapphire') => {
    if (ensemble === activeEnsemble) return;
    sound.playClick();
    setActiveEnsemble(ensemble);
    setPlacedLevels({});
    setSelectedItemId(null);
    setHintSlot(null);
    setGaneshaQuote(
      ensemble === 'puneri_saffron'
        ? 'Aha! Switching to my Royal Puneri Saffron Shringar! Let’s begin with Level 1 Mukut!'
        : 'Ooh! The Peacock Sapphire Temple Shringar! Let’s arrange each sacred piece on me!'
    );
    setToastMessage({
      text: ensemble === 'puneri_saffron' ? 'Switched to Royal Puneri Saffron' : 'Switched to Peacock Sapphire Shringar',
      type: 'info',
    });
  };

  // Trigger Pushpa Varsha (Floral shower)
  const triggerPushpaVarsha = () => {
    sound.playBell();
    setIsSparkling(true);
    setTimeout(() => setIsSparkling(false), 2200);

    confetti({
      particleCount: 50,
      spread: 75,
      origin: { y: 0.35, x: 0.5 },
      colors: ['#f59e0b', '#fbbf24', '#f43f5e', '#ffffff', '#fb923c', '#ca8a04'],
    });
  };

  // Playful Ganesha Interactions
  const handleWiggleEars = () => {
    sound.playClick();
    setEarsWiggling(true);
    setGaneshaQuote('*Flap flap flap!* My big elephant ears love the cool festival breeze!');
    setTimeout(() => setEarsWiggling(false), 1200);
  };

  const handleStrikePose = () => {
    sound.playCelebrate();
    setGaneshaPosing(true);
    triggerPushpaVarsha();
    setGaneshaQuote('✨ Mirror Check! How do I look? Ready to bless all our wonderful devotees! ✨');
    setTimeout(() => setGaneshaPosing(false), 2000);
  };

  // Place an item at a specific level
  const attemptPlaceItem = (itemId: string, targetLevelNumber: number) => {
    const item = SHRINGAR_ITEMS.find((i) => i.id === itemId);
    if (!item) return;

    if (item.correctLevel === targetLevelNumber) {
      // --- CORRECT PLACEMENT! ---
      sound.playSuccess();
      sound.playBell();

      const newPlaced = {
        ...placedLevels,
        [targetLevelNumber]: item,
      };
      setPlacedLevels(newPlaced);

      // Update actual attire state for subsequent screens
      const updatedAttire: PlayerAttireState = {
        ...playerAttire,
        [item.attireKey]: item.attireValue,
      };
      onUpdateAttire(updatedAttire);

      setSelectedItemId(null);
      setDraggedItemId(null);
      setHintSlot(null);
      setConsecutiveMistakes(0);

      // Ganesha speaks his joyful line!
      setGaneshaQuote(item.ganeshaQuote);

      const targetLevelDef = ADORNMENT_LEVELS.find((l) => l.levelNumber === targetLevelNumber);
      setToastMessage({
        text: `✓ Perfect Alignment! "${item.name}" placed at ${targetLevelDef?.name}!`,
        type: 'success',
      });

      // Quick mini confetti burst
      confetti({
        particleCount: 20,
        spread: 50,
        origin: { y: 0.45, x: 0.5 },
        colors: ['#fde047', '#f59e0b', '#22c55e'],
      });

      // Check if all 8 levels are completed!
      if (Object.keys(newPlaced).length === 8) {
        sound.playLevelComplete();
        triggerPushpaVarsha();
        setGaneshaQuote('🎉 JAI GANESHA! My GRWM is complete! I look so radiant! Ganpati Bappa Morya! 🎉');
        setToastMessage({
          text: '✨ ALL 8 LEVELS COMPLETED! Bal Ganesha is ready for Shankar Ji Ka Damru Dance! ✨',
          type: 'success',
        });
      }
    } else {
      // --- WRONG LEVEL PLACEMENT! ---
      sound.playObstacleHit();
      setShakingSlot(targetLevelNumber);
      setTimeout(() => setShakingSlot(null), 700);

      const targetLevelDef = ADORNMENT_LEVELS.find((l) => l.levelNumber === targetLevelNumber);
      const correctLevelDef = ADORNMENT_LEVELS.find((l) => l.levelNumber === item.correctLevel);

      setGaneshaQuote(`*Chuckle* Hehe! That belongs at my ${correctLevelDef?.bodyZone}, not my ${targetLevelDef?.bodyZone}! Try again!`);
      setToastMessage({
        text: `⚠️ Incorrect level! "${item.name}" belongs at ${correctLevelDef?.name}, not ${targetLevelDef?.name}!`,
        type: 'error',
      });

      // Mistake penalty: 3 in a row loses 1 life
      setConsecutiveMistakes((prev) => {
        const next = prev + 1;
        if (next >= 3) {
          onLoseLife();
          return 0;
        }
        return next;
      });
    }
  };

  // Hint button
  const handleUseHint = () => {
    sound.playClick();
    let targetItem: ShringarItem | undefined;

    if (selectedItemId) {
      targetItem = currentEnsembleItems.find((i) => i.id === selectedItemId);
    } else if (unplacedItems.length > 0) {
      targetItem = unplacedItems[0];
      setSelectedItemId(targetItem.id);
    }

    if (targetItem) {
      setHintSlot(targetItem.correctLevel);
      const levelDef = ADORNMENT_LEVELS.find((l) => l.levelNumber === targetItem!.correctLevel);
      setGaneshaQuote(`💡 Sacred Hint: "${targetItem.name}" goes onto my ${levelDef?.bodyZone} (Level ${levelDef?.levelNumber})!`);
      setToastMessage({
        text: `💡 Hint: "${targetItem.name}" belongs at ${levelDef?.name}! Tap that slot to place it.`,
        type: 'info',
      });
    }
  };

  // Reset current round
  const handleResetArrangement = () => {
    sound.playClick();
    setPlacedLevels({});
    setSelectedItemId(null);
    setHintSlot(null);
    setGaneshaQuote('Let us begin my GRWM anew! Tap an item below and place it on my body!');
    setToastMessage({
      text: 'Arrangement reset. Drag or tap items to place them on Bal Ganesha!',
      type: 'info',
    });
  };

  // Complete level button
  const handleConfirmReady = () => {
    sound.playClick();
    if (!isComplete) {
      setToastMessage({
        text: 'Please arrange all 8 costume and jewelry levels on Bal Ganesha first!',
        type: 'error',
      });
      return;
    }
    onComplete();
  };

  const activeSelectedItem = selectedItemId ? SHRINGAR_ITEMS.find((i) => i.id === selectedItemId) : null;

  return (
    <div className="relative w-full h-full overflow-y-auto bg-gradient-to-b from-[#240306] via-[#160204] to-[#0d0102] text-amber-50 flex flex-col p-2 sm:p-4 select-none">
      {/* Pushpa Varsha Particle Overlay */}
      {isSparkling && (
        <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center animate-fade-in">
          <div className="w-full h-full bg-amber-500/10 backdrop-blur-[1px]" />
        </div>
      )}

      {/* TOP HEADER: GRWM with Bal Ganesha Banner */}
      <div className="w-full max-w-5xl mx-auto mb-2 z-10">
        <div className="bg-gradient-to-r from-amber-950/90 via-black/85 to-amber-950/90 border border-amber-500/60 rounded-2xl p-2.5 sm:p-3 shadow-xl flex flex-col md:flex-row items-center justify-between gap-2.5">
          {/* Title & Level Indicator */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 flex items-center justify-center text-maroon-950 font-black shadow-lg border border-amber-200">
              <Camera size={22} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-gradient-to-r from-amber-500 to-yellow-400 text-maroon-950 font-cinzel font-black text-[10px] sm:text-xs px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
                  Level 4 • GRWM
                </span>
                <h2 className="text-base sm:text-xl font-cinzel font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-amber-400">
                  GET READY WITH ME: BAL GANESHA
                </h2>
              </div>
              <p className="text-[11px] sm:text-xs text-amber-300/85">
                Help Lord Ganesha dress up for Ganesh Chaturthi! Arrange his costumes & jewelries on Levels 1 to 8.
              </p>
            </div>
          </div>

          {/* Quick Actions: Ensemble switch, Interactions, Hint, Reset */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-center">
            {/* Ensemble 1 */}
            <button
              id="grwm-ensemble-saffron-btn"
              onClick={() => handleSwitchEnsemble('puneri_saffron')}
              className={`px-2.5 py-1 rounded-xl text-xs font-cinzel font-bold transition flex items-center gap-1 cursor-pointer ${
                activeEnsemble === 'puneri_saffron'
                  ? 'bg-amber-500 text-maroon-950 shadow-md ring-2 ring-amber-300 font-black'
                  : 'bg-black/50 text-amber-300/80 border border-amber-600/40 hover:bg-amber-900/40'
              }`}
            >
              👑 Royal Saffron
            </button>

            {/* Ensemble 2 */}
            <button
              id="grwm-ensemble-peacock-btn"
              onClick={() => handleSwitchEnsemble('peacock_sapphire')}
              className={`px-2.5 py-1 rounded-xl text-xs font-cinzel font-bold transition flex items-center gap-1 cursor-pointer ${
                activeEnsemble === 'peacock_sapphire'
                  ? 'bg-amber-500 text-maroon-950 shadow-md ring-2 ring-amber-300 font-black'
                  : 'bg-black/50 text-amber-300/80 border border-amber-600/40 hover:bg-amber-900/40'
              }`}
            >
              🦚 Peacock Sapphire
            </button>

            {/* Hint Button */}
            <button
              id="grwm-hint-btn"
              onClick={handleUseHint}
              className="px-2.5 py-1 bg-amber-950/70 hover:bg-amber-900 border border-amber-500/50 text-amber-300 rounded-xl text-xs font-semibold flex items-center gap-1 transition active:scale-95 cursor-pointer"
              title="Get a hint on where an item goes"
            >
              <Lightbulb size={13} className="text-yellow-400" />
              <span>Hint</span>
            </button>

            {/* Reset Button */}
            <button
              id="grwm-reset-btn"
              onClick={handleResetArrangement}
              className="p-1.5 bg-black/40 hover:bg-amber-950/60 border border-amber-600/30 text-amber-300/80 rounded-xl text-xs transition cursor-pointer"
              title="Reset arrangement"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>

        {/* Dynamic Toast / Feedback */}
        {toastMessage && (
          <div
            className={`mt-1.5 p-2 rounded-xl text-xs flex items-center justify-between transition-all border ${
              toastMessage.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-200'
                : toastMessage.type === 'error'
                ? 'bg-red-950/80 border-red-500/60 text-red-200'
                : 'bg-amber-950/80 border-amber-500/60 text-amber-200'
            }`}
          >
            <span className="font-semibold">{toastMessage.text}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="text-[10px] opacity-70 hover:opacity-100 ml-2 font-mono"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* MAIN PLAYFIELD: 3-Column Layout (Left Slots 1-4 | Center Ganesha Vanity | Right Slots 5-8) */}
      <div className="w-full max-w-5xl mx-auto flex-1 grid grid-cols-1 md:grid-cols-12 gap-2.5 items-start">
        {/* LEFT COLUMN: Slots 1 to 4 (Crown, Tilak, Ears, Mala/Necklace) */}
        <div className="md:col-span-3 flex flex-col gap-2 order-2 md:order-1">
          <div className="text-[11px] font-cinzel font-bold text-amber-300/80 px-1 uppercase tracking-wider flex items-center justify-between">
            <span>Upper Sacred Levels</span>
            <span>1 - 4</span>
          </div>

          {ADORNMENT_LEVELS.filter((l) => l.levelNumber <= 4).map((slotDef) => {
            const placedItem = placedLevels[slotDef.levelNumber];
            const isTargeted = activeSelectedItem?.correctLevel === slotDef.levelNumber;
            const isShaking = shakingSlot === slotDef.levelNumber;
            const isHinted = hintSlot === slotDef.levelNumber;

            return (
              <div
                key={slotDef.id}
                id={`slot-level-${slotDef.levelNumber}`}
                onClick={() => {
                  if (activeSelectedItem) {
                    attemptPlaceItem(activeSelectedItem.id, slotDef.levelNumber);
                  }
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setHighlightSlot(slotDef.levelNumber);
                }}
                onDragLeave={() => setHighlightSlot(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  setHighlightSlot(null);
                  const itemId = e.dataTransfer.getData('text/plain') || draggedItemId;
                  if (itemId) {
                    attemptPlaceItem(itemId, slotDef.levelNumber);
                  }
                }}
                className={`p-2 rounded-2xl border-2 transition-all relative cursor-pointer ${
                  placedItem
                    ? 'bg-gradient-to-r from-amber-950/70 to-black/60 border-amber-500/80 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                    : isHinted
                    ? 'bg-yellow-500/20 border-yellow-300 shadow-[0_0_20px_rgba(234,179,8,0.5)] animate-pulse ring-2 ring-yellow-400'
                    : isTargeted
                    ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)] animate-pulse'
                    : highlightSlot === slotDef.levelNumber
                    ? 'bg-amber-500/30 border-amber-300 scale-102'
                    : 'bg-black/40 border-dashed border-amber-600/40 hover:border-amber-400/60 hover:bg-amber-950/30'
                } ${isShaking ? 'border-red-500 bg-red-950/50 translate-x-1 animate-bounce' : ''}`}
              >
                <div className="flex items-center justify-between gap-1.5 mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg">{slotDef.icon}</span>
                    <span className="font-cinzel font-bold text-xs text-amber-200">{slotDef.name}</span>
                  </div>
                  {placedItem ? (
                    <span className="p-1 rounded-full bg-emerald-500 text-maroon-950 text-[10px] font-bold">
                      <Check size={12} className="stroke-[3]" />
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-400/60 font-mono">L{slotDef.levelNumber}</span>
                  )}
                </div>

                {placedItem ? (
                  <div className="mt-1 pt-1 border-t border-amber-600/20 flex items-center justify-between">
                    <span className="text-xs font-semibold text-amber-300 truncate">{placedItem.name}</span>
                    <span className="text-[10px] text-emerald-400 font-bold shrink-0 ml-1">✓ Adorned</span>
                  </div>
                ) : (
                  <div className="text-[10px] text-amber-300/50 italic flex items-center gap-1">
                    <ArrowDown size={10} />
                    <span>{isHinted ? 'Place selected item here!' : `Place ${slotDef.bodyZone} item`}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* CENTER COLUMN: BAL GANESHA'S GRWM FESTIVAL VANITY */}
        <div className="md:col-span-6 flex flex-col items-center justify-center order-1 md:order-2">
          {/* BAL GANESHA'S INTERACTIVE SPEECH BUBBLE */}
          <div className="w-full max-w-[340px] mb-2 bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-400 text-maroon-950 p-2.5 rounded-2xl shadow-xl relative border-2 border-yellow-200">
            <div className="flex items-start gap-2">
              <span className="text-xl shrink-0 animate-bounce">🐘</span>
              <div>
                <span className="text-[10px] font-cinzel font-black uppercase tracking-wider block text-maroon-900">
                  Bal Ganesha Says:
                </span>
                <p className="text-xs font-bold leading-snug">{ganeshaQuote}</p>
              </div>
            </div>
            {/* Speech bubble tail pointing down to Ganesha */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-amber-400" />
          </div>

          {/* Golden Mirror Vanity Arch Frame */}
          <div className="relative w-full max-w-[340px] aspect-[3/4] bg-gradient-to-b from-[#3a0812] via-[#24040a] to-[#120204] rounded-3xl border-2 border-amber-500/80 shadow-[0_0_40px_rgba(245,158,11,0.35)] p-2 flex items-center justify-center overflow-hidden">
            {/* Overhead Toran & Bells */}
            <div className="absolute top-0 inset-x-0 h-10 border-b border-amber-500/30 flex justify-between px-3 pt-1 pointer-events-none opacity-80 z-20">
              <span className="text-amber-400 text-sm animate-swing">🔔</span>
              <span className="text-yellow-300 text-xs font-cinzel font-bold">✨ GRWM : BAL GANESHA ✨</span>
              <span className="text-amber-400 text-sm animate-swing">🔔</span>
            </div>

            {/* Glowing Golden Aura / Prabhavali Halo behind Ganesha */}
            <div className="absolute w-52 h-52 rounded-full bg-gradient-to-tr from-amber-500/25 via-yellow-400/30 to-transparent blur-xl pointer-events-none animate-pulse-slow" />

            {/* Quick Interactive Reaction Buttons for Ganesha */}
            <div className="absolute top-11 right-2 flex flex-col gap-1.5 z-20">
              {/* Pose Button */}
              <button
                id="grwm-pose-btn"
                onClick={handleStrikePose}
                className="p-2 bg-amber-950/85 hover:bg-amber-900 border border-amber-400/70 rounded-full text-amber-200 shadow-lg text-xs flex items-center justify-center cursor-pointer active:scale-95 transition"
                title="Strike a cute blessing pose"
              >
                <Camera size={14} className="text-yellow-300" />
              </button>

              {/* Ear Wiggle Button */}
              <button
                id="grwm-wiggle-ears-btn"
                onClick={handleWiggleEars}
                className="p-2 bg-amber-950/85 hover:bg-amber-900 border border-amber-400/70 rounded-full text-amber-200 shadow-lg text-xs flex items-center justify-center cursor-pointer active:scale-95 transition"
                title="Flap Ganesha's elephant ears"
              >
                <Smile size={14} className="text-yellow-300" />
              </button>

              {/* Shower Flowers */}
              <button
                id="grwm-pushpa-btn"
                onClick={triggerPushpaVarsha}
                className="p-2 bg-amber-950/85 hover:bg-amber-900 border border-amber-400/70 rounded-full text-amber-200 shadow-lg text-xs flex items-center justify-center cursor-pointer active:scale-95 transition"
                title="Shower flower petals"
              >
                <Sparkles size={14} className="text-yellow-300" />
              </button>
            </div>

            {/* Cute Mushak (Mouse Companion) in bottom corner */}
            <div className="absolute bottom-2 left-2 z-20 bg-black/60 backdrop-blur-xs border border-amber-500/40 rounded-xl px-2 py-1 flex items-center gap-1.5 shadow-md animate-bounce-slow">
              <span className="text-base">🐭</span>
              <div className="text-[9px] text-amber-200 font-cinzel leading-tight">
                <span className="font-bold block text-yellow-300">Mushak:</span>
                <span>Bappa looks divine!</span>
              </div>
            </div>

            {/* GRWM Progress Badge in bottom right */}
            <div className="absolute bottom-2 right-2 z-20 bg-amber-950/80 border border-amber-500/50 rounded-xl px-2.5 py-1 flex items-center gap-1 shadow-md">
              <Heart size={12} className="text-rose-400 fill-rose-400" />
              <span className="text-[10px] font-mono font-bold text-amber-300">
                {placedCount}/8 Adorned
              </span>
            </div>

            {/* ============================================================== */}
            {/* SVG DIVINE BAL GANESHA CHARACTER WITH MULTI-LEVEL ADORNMENTS */}
            {/* ============================================================== */}
            <svg
              viewBox="0 0 400 480"
              className={`w-full h-full object-contain filter drop-shadow-[0_6px_20px_rgba(0,0,0,0.85)] z-10 transition-transform duration-500 ${
                ganeshaPosing ? 'scale-105' : ''
              }`}
            >
              <defs>
                <radialGradient id="haloGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#fef08a" stopOpacity="0.9" />
                  <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.6" />
                  <stop offset="85%" stopColor="#b45309" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#78350f" stopOpacity="0" />
                </radialGradient>

                <linearGradient id="goldZariGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="40%" stopColor="#f59e0b" />
                  <stop offset="70%" stopColor="#d97706" />
                  <stop offset="100%" stopColor="#b45309" />
                </linearGradient>

                <linearGradient id="skinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fff1f2" />
                  <stop offset="50%" stopColor="#fed7aa" />
                  <stop offset="100%" stopColor="#fb923c" />
                </linearGradient>

                <linearGradient id="lotusPink" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#fbcfe8" />
                  <stop offset="50%" stopColor="#f472b6" />
                  <stop offset="100%" stopColor="#be185d" />
                </linearGradient>

                <linearGradient id="sapphireGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="50%" stopColor="#1e3a8a" />
                  <stop offset="100%" stopColor="#172554" />
                </linearGradient>

                <linearGradient id="saffronGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fed7aa" />
                  <stop offset="50%" stopColor="#fb923c" />
                  <stop offset="100%" stopColor="#ea580c" />
                </linearGradient>
              </defs>

              {/* 1. Divine Prabhavali (Golden Sun Halo) */}
              <circle cx="200" cy="180" r="145" fill="url(#haloGlow)" />
              <circle
                cx="200"
                cy="180"
                r="120"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2.5"
                strokeDasharray="5 7"
                opacity="0.85"
              />

              {/* 2. Lotus Pedestal (Padmasana) */}
              <g id="lotus-pedestal" transform="translate(0, 30)">
                <path d="M 130 380 C 90 350, 70 400, 120 420 Z" fill="url(#lotusPink)" />
                <path d="M 270 380 C 310 350, 330 400, 280 420 Z" fill="url(#lotusPink)" />
                <path d="M 170 380 C 130 420, 150 445, 200 445 C 250 445, 270 420, 230 380 Z" fill="url(#lotusPink)" />
                <ellipse cx="200" cy="435" rx="120" ry="14" fill="url(#goldZariGrad)" stroke="#78350f" strokeWidth="1.5" />
              </g>

              {/* 3. Bal Ganesha Divine Body Structure */}
              <g id="ganesha-base-body">
                {/* Folded Padmasana Legs */}
                <ellipse cx="200" cy="380" rx="90" ry="34" fill="#fb923c" opacity="0.6" />

                {/* Chubby Divine Belly (Lambodara) */}
                <ellipse cx="200" cy="315" rx="68" ry="58" fill="url(#skinGrad)" stroke="#ea580c" strokeWidth="2" />
                <circle cx="200" cy="335" r="3" fill="#ea580c" opacity="0.7" />

                {/* Upper Arms */}
                {/* Upper Right Hand (Holding sacred Ankusha/Axe) */}
                <g>
                  <path d="M 140 280 C 95 260, 80 220, 105 200" stroke="url(#skinGrad)" strokeWidth="13" strokeLinecap="round" fill="none" />
                  <circle cx="105" cy="198" r="8" fill="url(#skinGrad)" />
                  <path d="M 98 175 L 112 218" stroke="url(#goldZariGrad)" strokeWidth="3" />
                  <path d="M 102 180 Q 120 172 110 192" fill="none" stroke="url(#goldZariGrad)" strokeWidth="3" />
                </g>

                {/* Upper Left Hand (Holding Sacred Lotus) */}
                <g>
                  <path d="M 260 280 C 305 260, 320 220, 295 200" stroke="url(#skinGrad)" strokeWidth="13" strokeLinecap="round" fill="none" />
                  <circle cx="295" cy="198" r="8" fill="url(#skinGrad)" />
                  <circle cx="298" cy="186" r="10" fill="url(#lotusPink)" />
                  <circle cx="298" cy="186" r="5" fill="#fef08a" />
                </g>

                {/* Lower Left Hand (Modak Bowl resting on knee) */}
                <g>
                  <path d="M 255 315 C 280 330, 290 350, 270 365" stroke="url(#skinGrad)" strokeWidth="13" strokeLinecap="round" fill="none" />
                  <circle cx="270" cy="365" r="8" fill="url(#skinGrad)" />
                </g>

                {/* Lower Right Hand (Abhaya Mudra Blessing) */}
                <g>
                  <path d="M 145 315 C 120 330, 110 350, 130 365" stroke="url(#skinGrad)" strokeWidth="13" strokeLinecap="round" fill="none" />
                  <circle cx="132" cy="365" r="10" fill="url(#skinGrad)" />
                  <text x="132" y="369" fontSize="10" fontWeight="bold" fill="#dc2626" textAnchor="middle">ॐ</text>
                </g>

                {/* Bal Ganesha Large Gentle Elephant Ears (with ear-wiggle animation) */}
                {/* Left Ear */}
                <g className={earsWiggling ? 'animate-wiggle-left origin-right' : ''}>
                  <path
                    d="M 155 175 C 95 155, 75 215, 145 225 Z"
                    fill="url(#skinGrad)"
                    stroke="#ea580c"
                    strokeWidth="2"
                  />
                  <path
                    d="M 145 185 C 105 175, 95 210, 140 215 Z"
                    fill="#fbcfe8"
                    opacity="0.85"
                  />
                </g>
                {/* Right Ear */}
                <g className={earsWiggling ? 'animate-wiggle-right origin-left' : ''}>
                  <path
                    d="M 245 175 C 305 155, 325 215, 255 225 Z"
                    fill="url(#skinGrad)"
                    stroke="#ea580c"
                    strokeWidth="2"
                  />
                  <path
                    d="M 255 185 C 295 175, 305 210, 260 215 Z"
                    fill="#fbcfe8"
                    opacity="0.85"
                  />
                </g>

                {/* Divine Chubby Head & Cheeks */}
                <ellipse cx="200" cy="188" rx="48" ry="42" fill="url(#skinGrad)" stroke="#ea580c" strokeWidth="2" />

                {/* Graceful Curved Trunk (curving left towards modak hand) */}
                <path
                  d="M 194 198 
                     C 194 235, 192 270, 172 284
                     C 160 292, 148 288, 156 274
                     C 164 266, 172 258, 176 228
                     C 180 206, 184 194, 194 198 Z"
                  fill="url(#skinGrad)"
                  stroke="#ea580c"
                  strokeWidth="1.6"
                />

                {/* Sweet Modak at tip of trunk */}
                <g transform="translate(150, 266)">
                  <path d="M 7 0 C 1 5, 0 10, 7 14 C 14 10, 13 5, 7 0 Z" fill="url(#goldZariGrad)" stroke="#ca8a04" strokeWidth="1" />
                  <line x1="7" y1="2" x2="7" y2="7" stroke="#dc2626" strokeWidth="1" />
                </g>

                {/* Loving, Compassionate Expressive Eyes */}
                {/* Left Eye */}
                <path d="M 175 180 Q 185 175 192 180 Q 184 186 175 180 Z" fill="#3f1406" />
                <circle cx="184" cy="179" r="1.8" fill="#ffffff" />
                {/* Right Eye */}
                <path d="M 208 180 Q 215 175 225 180 Q 216 186 208 180 Z" fill="#3f1406" />
                <circle cx="216" cy="179" r="1.8" fill="#ffffff" />

                {/* Gentle Tusks: Ekadanta (one broken on viewer's left, one full on right) */}
                <polygon points="183,203 186,212 189,203" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
                <polygon points="211,203 215,220 218,203" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
              </g>

              {/* ============================================================== */}
              {/* DYNAMIC SHRINGAR LAYERS CORRESPONDING TO LEVELS 1 TO 8 */}
              {/* ============================================================== */}

              {/* LEVEL 7: Sacred Pitambar Dhoti around Waist & Folded Legs */}
              {placedLevels[7] && (
                <g id="ganesha-level-7-pitambar">
                  {placedLevels[7].ensemble === 'puneri_saffron' ? (
                    // Royal Saffron Silk Dhoti with Gold Border & Kamarbandh
                    <>
                      <ellipse cx="200" cy="380" rx="94" ry="34" fill="url(#saffronGrad)" stroke="#c2410c" strokeWidth="2" />
                      <path d="M 115 375 Q 200 405 285 375 Q 200 415 115 375 Z" fill="url(#goldZariGrad)" opacity="0.95" />
                      {/* Pleats */}
                      <path d="M 190 355 L 185 405 M 200 355 L 200 408 M 210 355 L 215 405" stroke="#fef08a" strokeWidth="2.5" strokeLinecap="round" />
                      {/* Gold Kamarbandh Belt */}
                      <path d="M 140 350 Q 200 365 260 350" fill="none" stroke="url(#goldZariGrad)" strokeWidth="4.5" />
                      <circle cx="200" cy="358" r="4.5" fill="#dc2626" stroke="#fde047" strokeWidth="1" />
                    </>
                  ) : (
                    // Royal Sapphire Blue Zardozi Dhoti
                    <>
                      <ellipse cx="200" cy="380" rx="94" ry="34" fill="url(#sapphireGrad)" stroke="#1e3a8a" strokeWidth="2" />
                      <path d="M 115 375 Q 200 405 285 375 Q 200 415 115 375 Z" fill="url(#goldZariGrad)" opacity="0.95" />
                      {/* Gold Zari pleats */}
                      <path d="M 190 355 L 185 405 M 200 355 L 200 408 M 210 355 L 215 405" stroke="#fde047" strokeWidth="2.5" strokeLinecap="round" />
                      {/* Sapphire Gold Kamarbandh */}
                      <path d="M 140 350 Q 200 365 260 350" fill="none" stroke="url(#goldZariGrad)" strokeWidth="4.5" />
                      <circle cx="200" cy="358" r="4.5" fill="#2563eb" stroke="#fde047" strokeWidth="1" />
                    </>
                  )}
                </g>
              )}

              {/* LEVEL 5: Upper Torso - Silk Angavastram & Sacred Janeu */}
              {placedLevels[5] && (
                <g id="ganesha-level-5-torso">
                  {/* Sacred Golden Yajnopavita Thread (Janeu) running diagonal */}
                  <path
                    d="M 165 255 Q 190 315 225 355"
                    stroke="#ffffff"
                    strokeWidth="3.5"
                    fill="none"
                    strokeDasharray="4 2"
                  />
                  <path
                    d="M 165 255 Q 190 315 225 355"
                    stroke="#fde047"
                    strokeWidth="1.5"
                    fill="none"
                    opacity="0.8"
                  />

                  {/* Flowing Silk Angavastram Shawl across shoulder */}
                  {placedLevels[5].ensemble === 'puneri_saffron' ? (
                    <>
                      <path
                        d="M 150 250 Q 185 275 160 340 Q 145 330 142 270 Z"
                        fill="#991b1b"
                        stroke="#f59e0b"
                        strokeWidth="1.5"
                      />
                      <path d="M 150 252 Q 185 277 160 342" fill="none" stroke="url(#goldZariGrad)" strokeWidth="2.5" />
                    </>
                  ) : (
                    <>
                      <path
                        d="M 150 250 Q 185 275 160 340 Q 145 330 142 270 Z"
                        fill="url(#sapphireGrad)"
                        stroke="#fbbf24"
                        strokeWidth="1.5"
                      />
                      <path d="M 150 252 Q 185 277 160 342" fill="none" stroke="url(#goldZariGrad)" strokeWidth="2.5" />
                    </>
                  )}
                </g>
              )}

              {/* LEVEL 4: Neck Mala & Sacred Haar */}
              {placedLevels[4] && (
                <g id="ganesha-level-4-necklace">
                  {placedLevels[4].ensemble === 'puneri_saffron' ? (
                    // Marigold Flower Mala + Navratna Gold Haar
                    <>
                      {/* Fresh Orange & Yellow Marigold Genda Mala */}
                      <path d="M 170 230 Q 200 270 230 230" fill="none" stroke="#ea580c" strokeWidth="8" strokeLinecap="round" />
                      {/* Marigold Petal Blossoms */}
                      <circle cx="174" cy="235" r="4.5" fill="#facc15" stroke="#ea580c" strokeWidth="0.8" />
                      <circle cx="186" cy="248" r="5" fill="#f97316" stroke="#facc15" strokeWidth="0.8" />
                      <circle cx="200" cy="254" r="5.5" fill="#facc15" stroke="#ea580c" strokeWidth="0.8" />
                      <circle cx="214" cy="248" r="5" fill="#f97316" stroke="#facc15" strokeWidth="0.8" />
                      <circle cx="226" cy="235" r="4.5" fill="#facc15" stroke="#ea580c" strokeWidth="0.8" />

                      {/* Golden Navratna Choker */}
                      <path d="M 175 225 Q 200 245 225 225" fill="none" stroke="url(#goldZariGrad)" strokeWidth="4" />
                      <circle cx="200" cy="243" r="3.5" fill="#dc2626" stroke="#fde047" strokeWidth="1" />
                    </>
                  ) : (
                    // Kundan & Colombian Emerald Choker
                    <>
                      <path d="M 172 225 Q 200 250 228 225" fill="none" stroke="url(#goldZariGrad)" strokeWidth="6" strokeLinecap="round" />
                      <circle cx="200" cy="246" r="5.5" fill="#059669" stroke="#fde047" strokeWidth="1.5" />
                      <circle cx="188" cy="240" r="3.5" fill="#ffffff" stroke="#fde047" strokeWidth="1" />
                      <circle cx="212" cy="240" r="3.5" fill="#ffffff" stroke="#fde047" strokeWidth="1" />
                    </>
                  )}
                </g>
              )}

              {/* LEVEL 6: Divine Wrists & Arms (Kadas & Bajubands) */}
              {placedLevels[6] && (
                <g id="ganesha-level-6-kadas">
                  {/* Blessing Lower Right Hand Kada */}
                  <circle cx="132" cy="360" r="13" fill="none" stroke="url(#goldZariGrad)" strokeWidth="3.5" />
                  {/* Modak Lower Left Hand Kada */}
                  <circle cx="270" cy="360" r="13" fill="none" stroke="url(#goldZariGrad)" strokeWidth="3.5" />

                  {/* Upper Arms Bajuband */}
                  <ellipse cx="106" cy="208" rx="8" ry="4" fill="url(#goldZariGrad)" stroke="#78350f" strokeWidth="1" />
                  <ellipse cx="294" cy="208" rx="8" ry="4" fill="url(#goldZariGrad)" stroke="#78350f" strokeWidth="1" />
                </g>
              )}

              {/* LEVEL 3: Divine Elephant Ears - Kundal (Chandbali / Jhumkas) */}
              {placedLevels[3] && (
                <g id="ganesha-level-3-earrings">
                  {/* Left Ear Kundal */}
                  <g transform="translate(132, 215)">
                    <circle cx="0" cy="0" r="4.5" fill="url(#goldZariGrad)" stroke="#78350f" strokeWidth="1" />
                    <circle cx="0" cy="7" r="3" fill="#dc2626" />
                    <path d="M -4 2 Q 0 8 4 2" fill="none" stroke="#fde047" strokeWidth="1.5" />
                  </g>
                  {/* Right Ear Kundal */}
                  <g transform="translate(268, 215)">
                    <circle cx="0" cy="0" r="4.5" fill="url(#goldZariGrad)" stroke="#78350f" strokeWidth="1" />
                    <circle cx="0" cy="7" r="3" fill="#dc2626" />
                    <path d="M -4 2 Q 0 8 4 2" fill="none" stroke="#fde047" strokeWidth="1.5" />
                  </g>
                </g>
              )}

              {/* LEVEL 2: Forehead Sacred Tilak (Chandan & Kumkum / Tripundra) */}
              {placedLevels[2] && (
                <g id="ganesha-level-2-tilak">
                  {placedLevels[2].ensemble === 'puneri_saffron' ? (
                    // Auspicious Chandan Strokes + Vermilion Bindu
                    <>
                      <path d="M 188 158 Q 200 152 212 158" stroke="#facc15" strokeWidth="3.5" fill="none" strokeLinecap="round" />
                      <path d="M 189 163 Q 200 158 211 163" stroke="#facc15" strokeWidth="3.5" fill="none" strokeLinecap="round" />
                      <ellipse cx="200" cy="160" rx="3" ry="6.5" fill="#dc2626" />
                      <circle cx="200" cy="170" r="2.2" fill="#dc2626" />
                    </>
                  ) : (
                    // Shiva-Shakti Tripundra Bhasma
                    <>
                      <path d="M 186 156 Q 200 152 214 156" stroke="#f8fafc" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                      <path d="M 187 160 Q 200 156 213 160" stroke="#f8fafc" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                      <path d="M 188 164 Q 200 160 212 164" stroke="#f8fafc" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                      <circle cx="200" cy="160" r="3.2" fill="#dc2626" />
                    </>
                  )}
                </g>
              )}

              {/* LEVEL 1: Crown & Mukut on Bal Ganesha's Head */}
              {placedLevels[1] && (
                <g id="ganesha-level-1-headwear">
                  {placedLevels[1].ensemble === 'puneri_saffron' ? (
                    // Royal Saffron Puneri Feta with Gold Kalgi
                    <>
                      {/* Pagadi Feta Wrap */}
                      <path
                        d="M 165 152 Q 200 120 235 152 Q 240 138 225 125 Q 200 110 175 125 Z"
                        fill="#ea580c"
                        stroke="#ca8a04"
                        strokeWidth="1.8"
                      />
                      <path d="M 165 148 Q 200 134 235 148" fill="none" stroke="url(#goldZariGrad)" strokeWidth="3.5" />
                      {/* Side Shirpech & Turban Tail */}
                      <path d="M 165 145 L 152 175 L 163 178 L 170 148 Z" fill="#ea580c" stroke="#ca8a04" strokeWidth="1" />
                      {/* Gold Kalgi with jewel brooch */}
                      <g transform="translate(200, 118)">
                        <path d="M 0 0 Q -4 -22 0 -30 Q 4 -22 0 0" fill="#facc15" stroke="#ca8a04" strokeWidth="1.2" />
                        <circle cx="0" cy="-2" r="4.5" fill="#dc2626" stroke="#fef08a" strokeWidth="1" />
                      </g>
                    </>
                  ) : (
                    // Temple Filigree Golden Mukut
                    <>
                      <path
                        d="M 165 150 L 172 115 L 188 132 L 200 95 L 212 132 L 228 115 L 235 150 Z"
                        fill="url(#goldZariGrad)"
                        stroke="#78350f"
                        strokeWidth="1.8"
                      />
                      <circle cx="200" cy="116" r="4.5" fill="#dc2626" stroke="#fef08a" strokeWidth="1" />
                      <circle cx="184" cy="135" r="3" fill="#047857" />
                      <circle cx="216" cy="135" r="3" fill="#047857" />
                      <line x1="168" y1="148" x2="232" y2="148" stroke="#fef08a" strokeWidth="2.5" />
                    </>
                  )}
                </g>
              )}

              {/* LEVEL 8: Hands Sacred Offering (Golden Modak Thali & Diya / Garuda Bell & Lotus) */}
              {placedLevels[8] && (
                <g id="ganesha-level-8-offering">
                  {placedLevels[8].ensemble === 'puneri_saffron' ? (
                    // Golden Thali with fresh steamed Modaks & burning Diya
                    <g transform="translate(200, 362)">
                      <ellipse cx="0" cy="0" rx="44" ry="14" fill="url(#goldZariGrad)" stroke="#78350f" strokeWidth="1.5" />
                      <ellipse cx="0" cy="0" rx="38" ry="11" fill="#b45309" opacity="0.4" />

                      {/* Steamed Modaks */}
                      <circle cx="-16" cy="-2" r="6" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
                      <circle cx="0" cy="-4" r="7" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
                      <circle cx="16" cy="-2" r="6" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />

                      {/* Lit Diya with dancing flame */}
                      <ellipse cx="0" cy="3" rx="8" ry="4" fill="#ea580c" stroke="#78350f" strokeWidth="1" />
                      <path d="M 0 -6 Q -4 0 0 3 Q 4 0 0 -6 Z" fill="#facc15" />
                      <circle cx="0" cy="-1" r="2" fill="#ffffff" />
                    </g>
                  ) : (
                    // Silver Garuda Bell & Sahasradala Lotus
                    <g transform="translate(200, 362)">
                      <ellipse cx="0" cy="0" rx="38" ry="12" fill="url(#goldZariGrad)" stroke="#78350f" strokeWidth="1.5" />
                      {/* Bell */}
                      <path d="M -12 2 L 0 2 L -3 -16 L -9 -16 Z" fill="#f8fafc" stroke="#64748b" strokeWidth="1" />
                      {/* Pink Lotus */}
                      <circle cx="12" cy="-2" r="8" fill="url(#lotusPink)" />
                      <circle cx="12" cy="-2" r="4" fill="#fde047" />
                    </g>
                  )}
                </g>
              )}
            </svg>
          </div>
        </div>

        {/* RIGHT COLUMN: Slots 5 to 8 (Torso/Janeu, Arms/Kadas, Pitambar Dhoti, Modak Thali) */}
        <div className="md:col-span-3 flex flex-col gap-2 order-3">
          <div className="text-[11px] font-cinzel font-bold text-amber-300/80 px-1 uppercase tracking-wider flex items-center justify-between">
            <span>Lower & Offering Levels</span>
            <span>5 - 8</span>
          </div>

          {ADORNMENT_LEVELS.filter((l) => l.levelNumber >= 5).map((slotDef) => {
            const placedItem = placedLevels[slotDef.levelNumber];
            const isTargeted = activeSelectedItem?.correctLevel === slotDef.levelNumber;
            const isShaking = shakingSlot === slotDef.levelNumber;
            const isHinted = hintSlot === slotDef.levelNumber;

            return (
              <div
                key={slotDef.id}
                id={`slot-level-${slotDef.levelNumber}`}
                onClick={() => {
                  if (activeSelectedItem) {
                    attemptPlaceItem(activeSelectedItem.id, slotDef.levelNumber);
                  }
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setHighlightSlot(slotDef.levelNumber);
                }}
                onDragLeave={() => setHighlightSlot(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  setHighlightSlot(null);
                  const itemId = e.dataTransfer.getData('text/plain') || draggedItemId;
                  if (itemId) {
                    attemptPlaceItem(itemId, slotDef.levelNumber);
                  }
                }}
                className={`p-2 rounded-2xl border-2 transition-all relative cursor-pointer ${
                  placedItem
                    ? 'bg-gradient-to-r from-amber-950/70 to-black/60 border-amber-500/80 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                    : isHinted
                    ? 'bg-yellow-500/20 border-yellow-300 shadow-[0_0_20px_rgba(234,179,8,0.5)] animate-pulse ring-2 ring-yellow-400'
                    : isTargeted
                    ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)] animate-pulse'
                    : highlightSlot === slotDef.levelNumber
                    ? 'bg-amber-500/30 border-amber-300 scale-102'
                    : 'bg-black/40 border-dashed border-amber-600/40 hover:border-amber-400/60 hover:bg-amber-950/30'
                } ${isShaking ? 'border-red-500 bg-red-950/50 translate-x-1 animate-bounce' : ''}`}
              >
                <div className="flex items-center justify-between gap-1.5 mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg">{slotDef.icon}</span>
                    <span className="font-cinzel font-bold text-xs text-amber-200">{slotDef.name}</span>
                  </div>
                  {placedItem ? (
                    <span className="p-1 rounded-full bg-emerald-500 text-maroon-950 text-[10px] font-bold">
                      <Check size={12} className="stroke-[3]" />
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-400/60 font-mono">L{slotDef.levelNumber}</span>
                  )}
                </div>

                {placedItem ? (
                  <div className="mt-1 pt-1 border-t border-amber-600/20 flex items-center justify-between">
                    <span className="text-xs font-semibold text-amber-300 truncate">{placedItem.name}</span>
                    <span className="text-[10px] text-emerald-400 font-bold shrink-0 ml-1">✓ Adorned</span>
                  </div>
                ) : (
                  <div className="text-[10px] text-amber-300/50 italic flex items-center gap-1">
                    <ArrowDown size={10} />
                    <span>{isHinted ? 'Place selected item here!' : `Place ${slotDef.bodyZone} item`}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* BOTTOM TRAY: GRWM Adornment Wardrobe Deck */}
      <div className="w-full max-w-5xl mx-auto mt-2.5 bg-gradient-to-b from-amber-950/70 to-black/85 border border-amber-500/45 rounded-2xl p-2.5 sm:p-3 shadow-2xl z-10">
        <div className="flex items-center justify-between gap-2 mb-2 pb-1 border-b border-amber-600/30">
          <div className="flex items-center gap-2">
            <span className="text-base">🧰</span>
            <h3 className="text-xs sm:text-sm font-cinzel font-bold text-amber-200">
              BAL GANESHA’S SHRINGAR WARDROBE ({unplacedItems.length} items remaining to place)
            </h3>
          </div>
          <span className="text-[11px] text-amber-300/75 italic">
            Tap an item, then tap its body level slot on Bal Ganesha (or drag & drop!)
          </span>
        </div>

        {unplacedItems.length === 0 ? (
          /* Victory Banner */
          <div className="py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-950/80 via-black/85 to-amber-950/80 border-2 border-emerald-400/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-400 to-yellow-300 flex items-center justify-center text-maroon-950 font-black shadow-lg">
                <Check size={28} className="stroke-[3]" />
              </div>
              <div>
                <h4 className="font-cinzel font-black text-emerald-300 text-sm sm:text-base">
                  GRWM COMPLETE! BAL GANESHA IS RADIANTLY ADORNED!
                </h4>
                <p className="text-xs text-amber-100/80">
                  All 8 levels are arranged! Lord Ganesha and Mushak are ready for the Shankar Ji Ka Damru Dance!
                </p>
              </div>
            </div>

            <button
              id="grwm-proceed-btn"
              onClick={handleConfirmReady}
              className="px-6 py-3 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-maroon-950 font-cinzel font-black text-sm sm:text-base rounded-xl shadow-[0_0_25px_rgba(245,158,11,0.6)] border border-yellow-200 flex items-center gap-2 transition active:scale-95 cursor-pointer shrink-0 animate-pulse"
            >
              <span>ENTER LEVEL 5: DAMRU DANCE</span>
              <Play size={18} className="fill-maroon-950" />
            </button>
          </div>
        ) : (
          /* Grid of Items to be Placed on Ganesha */
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-2">
            {unplacedItems.map((item) => {
              const isSelected = selectedItemId === item.id;
              return (
                <div
                  key={item.id}
                  id={`item-${item.id}`}
                  draggable
                  onDragStart={(e) => {
                    setDraggedItemId(item.id);
                    setSelectedItemId(item.id);
                    e.dataTransfer.setData('text/plain', item.id);
                  }}
                  onDragEnd={() => setDraggedItemId(null)}
                  onClick={() => {
                    sound.playClick();
                    setSelectedItemId(isSelected ? null : item.id);
                    setHintSlot(null);
                  }}
                  className={`p-2 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between select-none ${
                    isSelected
                      ? 'bg-amber-500/25 border-amber-300 shadow-[0_0_18px_rgba(245,158,11,0.4)] scale-102 ring-2 ring-amber-400'
                      : 'bg-black/50 border-amber-600/30 hover:bg-amber-950/50 hover:border-amber-500/60'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-xl">{item.icon}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-600/40 text-amber-300">
                        {item.badge}
                      </span>
                    </div>

                    <h4 className="font-cinzel font-bold text-xs text-amber-200 line-clamp-1">{item.name}</h4>
                    <p className="text-[10px] text-amber-300/70 font-serif line-clamp-1 mb-1">{item.hindiName}</p>
                    <p className="text-[10px] text-amber-200/60 line-clamp-2 leading-tight">{item.description}</p>
                  </div>

                  <div className="mt-1.5 pt-1 border-t border-amber-600/20 flex items-center justify-between text-[10px]">
                    <span className="text-amber-400/80 font-mono">
                      {isSelected ? 'Tap slot above' : 'Tap or Drag'}
                    </span>
                    <span className="font-bold text-amber-300">{isSelected ? 'SELECTED' : 'ADORN'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
