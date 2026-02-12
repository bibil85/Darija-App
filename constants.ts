
import { Word, CategoryType } from './types';

export const CATEGORIES = [
  { id: CategoryType.ANIMALS, icon: '🐶', color: 'bg-orange-400', label: 'Animals' },
  { id: CategoryType.FOOD, icon: '🍎', color: 'bg-red-400', label: 'Food' },
  { id: CategoryType.FAMILY, icon: '👪', color: 'bg-pink-400', label: 'Family' },
  { id: CategoryType.OBJECTS, icon: '🧸', color: 'bg-blue-400', label: 'Objects' },
];

export const INITIAL_WORDS: Word[] = [
  // Animals
  { id: '1', english: 'Cat', darija: 'Mouch', phonetics: 'Moo-sh', category: CategoryType.ANIMALS, imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80' },
  { id: '2', english: 'Dog', darija: 'Kelb', phonetics: 'Kel-b', category: CategoryType.ANIMALS, imageUrl: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=400&q=80' },
  { id: '11', english: 'Lion', darija: 'Sba3', phonetics: 'S-ba-h', category: CategoryType.ANIMALS, imageUrl: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=400&q=80' },
  { id: '12', english: 'Cow', darija: 'Begra', phonetics: 'Beg-ra', category: CategoryType.ANIMALS, imageUrl: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=400&q=80' },
  { id: '13', english: 'Bird', darija: 'Tir', phonetics: 'Teer', category: CategoryType.ANIMALS, imageUrl: 'https://images.unsplash.com/photo-1522926193341-e9fed196d4c8?auto=format&fit=crop&w=400&q=80' },
  { id: '26', english: 'Rabbit', darija: 'Gnina', phonetics: 'G-nee-na', category: CategoryType.ANIMALS, imageUrl: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=400&q=80' },
  { id: '27', english: 'Fish', darija: 'Houta', phonetics: 'Hoo-ta', category: CategoryType.ANIMALS, imageUrl: 'https://images.unsplash.com/photo-1524704654690-b56c05c78a00?auto=format&fit=crop&w=400&q=80' },
  { id: '35', english: 'Elephant', darija: 'Fil', phonetics: 'Feel', category: CategoryType.ANIMALS, imageUrl: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=400&q=80' },

  // Food
  { id: '3', english: 'Apple', darija: 'Tefa7', phonetics: 'Tef-fah', category: CategoryType.FOOD, imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=400&q=80' },
  { id: '4', english: 'Milk', darija: 'Hlib', phonetics: 'H-leeb', category: CategoryType.FOOD, imageUrl: 'https://images.unsplash.com/photo-1563636619-e9107da5a76a?auto=format&fit=crop&w=400&q=80' },
  { id: '5', english: 'Water', darija: 'Ma', phonetics: 'Ma', category: CategoryType.FOOD, imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=400&q=80' },
  { id: '14', english: 'Bread', darija: 'Khobz', phonetics: 'Kh-ob-z', category: CategoryType.FOOD, imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80' },
  { id: '15', english: 'Banana', darija: 'Banan', phonetics: 'Ba-nan', category: CategoryType.FOOD, imageUrl: 'https://images.unsplash.com/photo-1481349518771-20055b2a7b24?auto=format&fit=crop&w=400&q=80' },
  { id: '16', english: 'Egg', darija: 'Bayda', phonetics: 'Bay-da', category: CategoryType.FOOD, imageUrl: 'https://images.unsplash.com/photo-1582722872445-44c501f3c89d?auto=format&fit=crop&w=400&q=80' },
  { id: '28', english: 'Orange', darija: 'Limouna', phonetics: 'Lee-moo-na', category: CategoryType.FOOD, imageUrl: 'https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&w=400&q=80' },
  { id: '29', english: 'Grapes', darija: '3neb', phonetics: 'E-neb', category: CategoryType.FOOD, imageUrl: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&w=400&q=80' },

  // Family
  { id: '6', english: 'Mama', darija: 'Mama', phonetics: 'Ma-ma', category: CategoryType.FAMILY, imageUrl: 'https://images.unsplash.com/photo-1536761139421-44770abd6d81?auto=format&fit=crop&w=400&q=80' },
  { id: '7', english: 'Baba', darija: 'Baba', phonetics: 'Ba-ba', category: CategoryType.FAMILY, imageUrl: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=400&q=80' },
  { id: '17', english: 'Brother', darija: 'Khoya', phonetics: 'Kho-ya', category: CategoryType.FAMILY, imageUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=400&q=80' },
  { id: '18', english: 'Sister', darija: 'Khti', phonetics: 'Kh-tee', category: CategoryType.FAMILY, imageUrl: 'https://images.unsplash.com/photo-1544717305-27a734ef4164?auto=format&fit=crop&w=400&q=80' },
  { id: '19', english: 'Grandpa', darija: 'Jedi', phonetics: 'Je-dee', category: CategoryType.FAMILY, imageUrl: 'https://images.unsplash.com/photo-1542171120-1a74d2576b92?auto=format&fit=crop&w=400&q=80' },
  { id: '20', english: 'Grandma', darija: 'Jedati', phonetics: 'Je-da-tee', category: CategoryType.FAMILY, imageUrl: 'https://images.unsplash.com/photo-1530021356476-0a6375ffe73b?auto=format&fit=crop&w=400&q=80' },
  { id: '30', english: 'Baby', darija: 'Bebi', phonetics: 'Be-bee', category: CategoryType.FAMILY, imageUrl: 'https://images.unsplash.com/photo-1519689689253-c960efaba21e?auto=format&fit=crop&w=400&q=80' },
  { id: '31', english: 'Friend', darija: 'Sahbi', phonetics: 'Sah-bee', category: CategoryType.FAMILY, imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=400&q=80' },

  // Objects
  { id: '8', english: 'Ball', darija: 'Koura', phonetics: 'Koo-ra', category: CategoryType.OBJECTS, imageUrl: 'https://images.unsplash.com/photo-1580028286552-3a60afa99301?auto=format&fit=crop&w=400&q=80' },
  { id: '9', english: 'Car', darija: 'Tonobil', phonetics: 'To-no-beel', category: CategoryType.OBJECTS, imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=400&q=80' },
  { id: '10', english: 'House', darija: 'Dar', phonetics: 'Dar', category: CategoryType.OBJECTS, imageUrl: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=400&q=80' },
  { id: '21', english: 'Bed', darija: 'Namoussiya', phonetics: 'Na-moo-see-ya', category: CategoryType.OBJECTS, imageUrl: 'https://images.unsplash.com/photo-1505693419148-ad3035464ebc?auto=format&fit=crop&w=400&q=80' },
  { id: '22', english: 'Chair', darija: 'Koursi', phonetics: 'Koor-see', category: CategoryType.OBJECTS, imageUrl: 'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=400&q=80' },
  { id: '23', english: 'Sun', darija: 'Chems', phonetics: 'Shem-s', category: CategoryType.OBJECTS, imageUrl: 'https://images.unsplash.com/photo-1529690656645-15d31063f96d?auto=format&fit=crop&w=400&q=80' },
  { id: '24', english: 'Moon', darija: 'Gmer', phonetics: 'G-mer', category: CategoryType.OBJECTS, imageUrl: 'https://images.unsplash.com/photo-1522030239044-1ae2f1441c8d?auto=format&fit=crop&w=400&q=80' },
  { id: '25', english: 'Tree', darija: 'Sejra', phonetics: 'Sej-ra', category: CategoryType.OBJECTS, imageUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=400&q=80' },
  { id: '32', english: 'Book', darija: 'Ktab', phonetics: 'K-tab', category: CategoryType.OBJECTS, imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80' },
  { id: '33', english: 'Key', darija: 'Saroout', phonetics: 'Sa-root', category: CategoryType.OBJECTS, imageUrl: 'https://images.unsplash.com/photo-1516733968668-dbdce39c46ef?auto=format&fit=crop&w=400&q=80' },
  { id: '34', english: 'Table', darija: 'Tabla', phonetics: 'Tab-la', category: CategoryType.OBJECTS, imageUrl: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&w=400&q=80' },
];
