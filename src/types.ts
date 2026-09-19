export type GameScreen = 
  | 'MENU'
  | 'HOW_TO_PLAY'
  | 'CONTROLS'
  | 'INTRO'
  | 'LEVEL_1'
  | 'LEVEL_2'
  | 'LEVEL_3'
  | 'CELEBRATION'
  | 'REWARD'
  | 'LEVEL_FAILED';

export interface GameState {
  currentLevel: 1 | 2 | 3;
  completedLevels: number[]; // e.g. [1, 2, 3,]
  lives: number; // max 3
  soundEnabled: boolean;
  isPaused: boolean;
  highScore: number;
}

export interface PujaItem {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
}

export type AvatarGender = 'boy' | 'girl' | 'little_devotee';

export interface CostumeItem {
  id: string;
  name: string;
  hindiName: string;
  type: 'kurta_dhoti' | 'sherwani' | 'angrakha' | 'pitambar' | 'lehenga' | 'anarkali';
  colorName: string;
  primaryColor: string;
  secondaryColor: string;
  zariColor: string;
  pattern: string;
  description: string;
}

export interface JewelryItem {
  id: string;
  name: string;
  hindiName: string;
  category: 'necklace' | 'headwear' | 'arms' | 'earrings' | 'accessory';
  gemType: 'gold' | 'pearl' | 'ruby' | 'emerald' | 'navratna' | 'chandan';
  icon: string;
  description: string;
}

export interface PlayerAttireState {
  avatarGender: AvatarGender;
  costumeId: string;
  necklaceId: string;
  headwearId: string;
  armsId: string;
  earringsId: string;
  accessoryId: string;
  tilakId: string;
}
