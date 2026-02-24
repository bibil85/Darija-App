
import { Word, CategoryType } from './types';

export const CATEGORIES = [
  { id: CategoryType.ANIMALS, icon: '🐶', color: 'bg-orange-400', label: 'Animals' },
  { id: CategoryType.FOOD, icon: '🍎', color: 'bg-red-400', label: 'Food' },
  { id: CategoryType.FAMILY, icon: '👪', color: 'bg-pink-400', label: 'Family' },
  { id: CategoryType.OBJECTS, icon: '🧸', color: 'bg-blue-400', label: 'Objects' },
  { id: CategoryType.COLORS, icon: '🎨', color: 'bg-purple-400', label: 'Colors' },
  { id: CategoryType.BODY, icon: '🖐️', color: 'bg-teal-400', label: 'Body' },
  { id: CategoryType.NUMBERS, icon: '🔢', color: 'bg-yellow-400', label: 'Numbers' },
];

export const INITIAL_WORDS: Word[] = [
  // Animals
  { id: '1', english: 'Cat', darija: 'Mouch', phonetics: 'Moo-sh', category: CategoryType.ANIMALS, imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80', emoji: '🐱' },
  { id: '2', english: 'Dog', darija: 'Kelb', phonetics: 'Kel-b', category: CategoryType.ANIMALS, imageUrl: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=400&q=80', emoji: '🐶' },
  { id: '11', english: 'Lion', darija: 'Sba3', phonetics: 'S-ba-h', category: CategoryType.ANIMALS, imageUrl: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=400&q=80', emoji: '🦁' },
  { id: '12', english: 'Cow', darija: 'Begra', phonetics: 'Beg-ra', category: CategoryType.ANIMALS, imageUrl: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=400&q=80', emoji: '🐄' },
  { id: '13', english: 'Bird', darija: 'Tir', phonetics: 'Teer', category: CategoryType.ANIMALS, imageUrl: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?auto=format&fit=crop&w=400&q=80', emoji: '🐦' },
  { id: '26', english: 'Rabbit', darija: 'Gnina', phonetics: 'G-nee-na', category: CategoryType.ANIMALS, imageUrl: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=400&q=80', emoji: '🐰' },
  { id: '27', english: 'Fish', darija: 'Houta', phonetics: 'Hoo-ta', category: CategoryType.ANIMALS, imageUrl: 'https://images.unsplash.com/photo-1524704654690-b56c05c78a00?auto=format&fit=crop&w=400&q=80', emoji: '🐟' },
  { id: '35', english: 'Elephant', darija: 'Fil', phonetics: 'Feel', category: CategoryType.ANIMALS, imageUrl: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=400&q=80', emoji: '🐘' },

  // Food
  { id: '3', english: 'Apple', darija: 'Tefa7', phonetics: 'Tef-fah', category: CategoryType.FOOD, imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=400&q=80', emoji: '🍎' },
  { id: '4', english: 'Milk', darija: 'Hlib', phonetics: 'H-leeb', category: CategoryType.FOOD, imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80', emoji: '🥛' },
  { id: '5', english: 'Water', darija: 'Ma', phonetics: 'Ma', category: CategoryType.FOOD, imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=400&q=80', emoji: '💧' },
  { id: '14', english: 'Bread', darija: 'Khobz', phonetics: 'Kh-ob-z', category: CategoryType.FOOD, imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80', emoji: '🍞' },
  { id: '15', english: 'Banana', darija: 'Banan', phonetics: 'Ba-nan', category: CategoryType.FOOD, imageUrl: 'https://images.unsplash.com/photo-1481349518771-20055b2a7b24?auto=format&fit=crop&w=400&q=80', emoji: '🍌' },
  { id: '16', english: 'Egg', darija: 'Bayda', phonetics: 'Bay-da', category: CategoryType.FOOD, imageUrl: 'https://images.unsplash.com/photo-1498654077810-12c21d4d6dc3?auto=format&fit=crop&w=400&q=80', emoji: '🥚' },
  { id: '28', english: 'Orange', darija: 'Limouna', phonetics: 'Lee-moo-na', category: CategoryType.FOOD, imageUrl: 'https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&w=400&q=80', emoji: '🍊' },
  { id: '29', english: 'Grapes', darija: '3neb', phonetics: 'E-neb', category: CategoryType.FOOD, imageUrl: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&w=400&q=80', emoji: '🍇' },

  // Family
  { id: '6', english: 'Mama', darija: 'Mama', phonetics: 'Ma-ma', category: CategoryType.FAMILY, imageUrl: 'https://images.unsplash.com/photo-1492725764893-90b379c2b6e7?auto=format&fit=crop&w=400&q=80', emoji: '👩' },
  { id: '7', english: 'Baba', darija: 'Baba', phonetics: 'Ba-ba', category: CategoryType.FAMILY, imageUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=400&q=80', emoji: '👨' },
  { id: '17', english: 'Brother', darija: 'Khoya', phonetics: 'Kho-ya', category: CategoryType.FAMILY, imageUrl: 'https://images.unsplash.com/photo-1502945015378-0e284ca1a5be?auto=format&fit=crop&w=400&q=80', emoji: '👦' },
  { id: '18', english: 'Sister', darija: 'Khti', phonetics: 'Kh-tee', category: CategoryType.FAMILY, imageUrl: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=400&q=80', emoji: '👧' },
  { id: '19', english: 'Grandpa', darija: 'Jedi', phonetics: 'Je-dee', category: CategoryType.FAMILY, imageUrl: 'https://images.unsplash.com/photo-1566753323558-f4e0952af115?auto=format&fit=crop&w=400&q=80', emoji: '👴' },
  { id: '20', english: 'Grandma', darija: 'Jedati', phonetics: 'Je-da-tee', category: CategoryType.FAMILY, imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80', emoji: '👵' },
  { id: '30', english: 'Baby', darija: 'Bebi', phonetics: 'Be-bee', category: CategoryType.FAMILY, imageUrl: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&w=400&q=80', emoji: '👶' },
  { id: '31', english: 'Friend', darija: 'Sahbi', phonetics: 'Sah-bee', category: CategoryType.FAMILY, imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=400&q=80', emoji: '🤝' },

  // Objects
  { id: '8', english: 'Ball', darija: 'Koura', phonetics: 'Koo-ra', category: CategoryType.OBJECTS, imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=400&q=80', emoji: '⚽' },
  { id: '9', english: 'Car', darija: 'Tonobil', phonetics: 'To-no-beel', category: CategoryType.OBJECTS, imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=400&q=80', emoji: '🚗' },
  { id: '10', english: 'House', darija: 'Dar', phonetics: 'Dar', category: CategoryType.OBJECTS, imageUrl: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=400&q=80', emoji: '🏠' },
  { id: '21', english: 'Bed', darija: 'Namoussiya', phonetics: 'Na-moo-see-ya', category: CategoryType.OBJECTS, imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80', emoji: '🛏️' },
  { id: '22', english: 'Chair', darija: 'Koursi', phonetics: 'Koor-see', category: CategoryType.OBJECTS, imageUrl: 'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=400&q=80', emoji: '🪑' },
  { id: '23', english: 'Sun', darija: 'Chems', phonetics: 'Shem-s', category: CategoryType.OBJECTS, imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=400&q=80', emoji: '☀️' },
  { id: '24', english: 'Moon', darija: 'Gmer', phonetics: 'G-mer', category: CategoryType.OBJECTS, imageUrl: 'https://images.unsplash.com/photo-1532693322450-2cb5c511067d?auto=format&fit=crop&w=400&q=80', emoji: '🌙' },
  { id: '25', english: 'Tree', darija: 'Sejra', phonetics: 'Sej-ra', category: CategoryType.OBJECTS, imageUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=400&q=80', emoji: '🌳' },
  { id: '32', english: 'Book', darija: 'Ktab', phonetics: 'K-tab', category: CategoryType.OBJECTS, imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80', emoji: '📖' },
  { id: '33', english: 'Key', darija: 'Saroout', phonetics: 'Sa-root', category: CategoryType.OBJECTS, imageUrl: 'https://images.unsplash.com/photo-1553991562-9f24b119ff51?auto=format&fit=crop&w=400&q=80', emoji: '🔑' },
  { id: '34', english: 'Table', darija: 'Tabla', phonetics: 'Tab-la', category: CategoryType.OBJECTS, imageUrl: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&w=400&q=80', emoji: '🪵' },

  // Colors
  { id: '36', english: 'Red', darija: 'Hmer', phonetics: 'H-mer', category: CategoryType.COLORS, imageUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=400&q=80', emoji: '🔴' },
  { id: '37', english: 'Blue', darija: 'Zre9', phonetics: 'Z-rek', category: CategoryType.COLORS, imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80', emoji: '🔵' },
  { id: '38', english: 'Green', darija: 'Khder', phonetics: 'Kh-der', category: CategoryType.COLORS, imageUrl: 'https://images.unsplash.com/photo-1560717789-0ac7c58ac90a?auto=format&fit=crop&w=400&q=80', emoji: '🟢' },
  { id: '39', english: 'Yellow', darija: 'Sfar', phonetics: 'S-far', category: CategoryType.COLORS, imageUrl: 'https://images.unsplash.com/photo-1519638399535-1b036603ac77?auto=format&fit=crop&w=400&q=80', emoji: '🟡' },
  { id: '40', english: 'White', darija: 'Byed', phonetics: 'B-yed', category: CategoryType.COLORS, imageUrl: 'https://images.unsplash.com/photo-1517483000871-1dbf64a6e1c6?auto=format&fit=crop&w=400&q=80', emoji: '⚪' },
  { id: '41', english: 'Black', darija: 'Khal', phonetics: 'Kh-al', category: CategoryType.COLORS, imageUrl: 'https://images.unsplash.com/photo-1579546929662-711aa81148cf?auto=format&fit=crop&w=400&q=80', emoji: '⚫' },
  { id: '42', english: 'Orange', darija: 'Limoni', phonetics: 'Lee-mo-nee', category: CategoryType.COLORS, imageUrl: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?auto=format&fit=crop&w=400&q=80', emoji: '🟠' },
  { id: '43', english: 'Pink', darija: 'Wridi', phonetics: 'Wri-dee', category: CategoryType.COLORS, imageUrl: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=400&q=80', emoji: '🩷' },

  // Body Parts
  { id: '44', english: 'Hand', darija: 'Yed', phonetics: 'Yed', category: CategoryType.BODY, imageUrl: 'https://images.unsplash.com/photo-1577648188599-291bb8b831c3?auto=format&fit=crop&w=400&q=80', emoji: '✋' },
  { id: '45', english: 'Eye', darija: '3in', phonetics: 'Ayn', category: CategoryType.BODY, imageUrl: 'https://images.unsplash.com/photo-1494869042583-f6c911f04b4c?auto=format&fit=crop&w=400&q=80', emoji: '👁️' },
  { id: '46', english: 'Nose', darija: 'Nif', phonetics: 'Neef', category: CategoryType.BODY, imageUrl: 'https://images.unsplash.com/photo-1542393545-10f5cde2c810?auto=format&fit=crop&w=400&q=80', emoji: '👃' },
  { id: '47', english: 'Mouth', darija: 'Fomm', phonetics: 'Fom', category: CategoryType.BODY, imageUrl: 'https://images.unsplash.com/photo-1530268729831-4b0b9e170218?auto=format&fit=crop&w=400&q=80', emoji: '👄' },
  { id: '48', english: 'Ear', darija: 'Wden', phonetics: 'W-den', category: CategoryType.BODY, imageUrl: 'https://images.unsplash.com/photo-1585232004423-244e0e6904e3?auto=format&fit=crop&w=400&q=80', emoji: '👂' },
  { id: '49', english: 'Foot', darija: 'Rejl', phonetics: 'Rej-l', category: CategoryType.BODY, imageUrl: 'https://images.unsplash.com/photo-1515709980177-7a7d628c09ba?auto=format&fit=crop&w=400&q=80', emoji: '🦶' },
  { id: '50', english: 'Head', darija: 'Ras', phonetics: 'Ras', category: CategoryType.BODY, imageUrl: 'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?auto=format&fit=crop&w=400&q=80', emoji: '🗣️' },
  { id: '51', english: 'Hair', darija: 'Cha3r', phonetics: 'Sha-er', category: CategoryType.BODY, imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80', emoji: '💇' },

  // Numbers
  { id: '52', english: 'One', darija: 'Wahd', phonetics: 'Wa-hed', category: CategoryType.NUMBERS, imageUrl: 'https://images.unsplash.com/photo-1502570149819-b2260483d302?auto=format&fit=crop&w=400&q=80', emoji: '1️⃣' },
  { id: '53', english: 'Two', darija: 'Jouj', phonetics: 'Jooj', category: CategoryType.NUMBERS, imageUrl: 'https://images.unsplash.com/photo-1559526323-cb2f2fe2591b?auto=format&fit=crop&w=400&q=80', emoji: '2️⃣' },
  { id: '54', english: 'Three', darija: 'Tlata', phonetics: 'Tla-ta', category: CategoryType.NUMBERS, imageUrl: 'https://images.unsplash.com/photo-1509909756405-be0199881695?auto=format&fit=crop&w=400&q=80', emoji: '3️⃣' },
  { id: '55', english: 'Four', darija: 'Rb3a', phonetics: 'Reb-ah', category: CategoryType.NUMBERS, imageUrl: 'https://images.unsplash.com/photo-1501862700950-18382cd41497?auto=format&fit=crop&w=400&q=80', emoji: '4️⃣' },
  { id: '56', english: 'Five', darija: 'Khmsa', phonetics: 'Khem-sa', category: CategoryType.NUMBERS, imageUrl: 'https://images.unsplash.com/photo-1516534775068-ba3e7458af70?auto=format&fit=crop&w=400&q=80', emoji: '5️⃣' },
  { id: '57', english: 'Six', darija: 'Stta', phonetics: 'Set-ta', category: CategoryType.NUMBERS, imageUrl: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?auto=format&fit=crop&w=400&q=80', emoji: '6️⃣' },
  { id: '58', english: 'Seven', darija: 'Sb3a', phonetics: 'Seb-ah', category: CategoryType.NUMBERS, imageUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=400&q=80', emoji: '7️⃣' },
  { id: '59', english: 'Eight', darija: 'Tmnya', phonetics: 'Tem-nya', category: CategoryType.NUMBERS, imageUrl: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=400&q=80', emoji: '8️⃣' },
];
