import React, { useState, useEffect } from 'react';
import { MapPin, Sword, Shield, Book, Coins, Heart, Clock, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Home } from 'lucide-react';

// Game constants
const TILE_TYPES = {
  EMPTY: 0,
  WALL: 1,
  PATH: 2,
  INN: 3,
  DUNGEON_ENTRANCE: 4,
  DUNGEON_EXIT: 5,
  BOSS: 6,
  TREASURE: 7,
  EVENT: 8,
  ENEMY: 9
};

const LOCATIONS = {
  TOWN: 'town',
  DUNGEON: 'dungeon',
  INN: 'inn'
};

const DIRECTIONS = {
  NORTH: 'north',
  EAST: 'east',
  SOUTH: 'south',
  WEST: 'west'
};

const RetroRPG = () => {
  // Game state
  const [player, setPlayer] = useState({
    name: 'Adventurer',
    level: 1,
    hp: 20,
    maxHp: 20,
    attack: 5,
    defense: 3,
    gold: 50,
    exp: 0,
    nextLevelExp: 100,
    inventory: [{ name: 'Inn Portal Scroll', type: 'scroll', quantity: 3 }],
    spells: [],
    equipment: { weapon: null, armor: null, accessory: null }
  });
  
  const [gameMap, setGameMap] = useState([]);
  const [mapSize, setMapSize] = useState({ width: 15, height: 15 });
  const [playerPosition, setPlayerPosition] = useState({ x: 7, y: 7 });
  const [currentLocation, setCurrentLocation] = useState(LOCATIONS.INN);
  const [gameLog, setGameLog] = useState(['Welcome to the Mystic Realms! You find yourself at the cozy Wanderer\'s Inn.']);
  const [currentScene, setCurrentScene] = useState('inn');
  const [enemy, setEnemy] = useState(null);
  const [inCombat, setInCombat] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [innOptions, setInnOptions] = useState(true);
  const [gameTime, setGameTime] = useState(0);
  const [saveGames, setSaveGames] = useState(() => {
    try {
      const saved = localStorage.getItem('retrorpg_saves');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  
  // Images for different scenes
  const sceneImages = {
    inn: 'https://cdnjs.cloudflare.com/ajax/libs/placeholders/0.0.1/img/placeholder.svg',
    path: 'https://cdnjs.cloudflare.com/ajax/libs/placeholders/0.0.1/img/placeholder.svg',
    wall: 'https://cdnjs.cloudflare.com/ajax/libs/placeholders/0.0.1/img/placeholder.svg',
    dungeonEntrance: 'https://cdnjs.cloudflare.com/ajax/libs/placeholders/0.0.1/img/placeholder.svg',
    dungeonPath: 'https://cdnjs.cloudflare.com/ajax/libs/placeholders/0.0.1/img/placeholder.svg',
    dungeonWall: 'https://cdnjs.cloudflare.com/ajax/libs/placeholders/0.0.1/img/placeholder.svg',
    treasure: 'https://cdnjs.cloudflare.com/ajax/libs/placeholders/0.0.1/img/placeholder.svg',
    boss: 'https://cdnjs.cloudflare.com/ajax/libs/placeholders/0.0.1/img/placeholder.svg',
    enemy: 'https://cdnjs.cloudflare.com/ajax/libs/placeholders/0.0.1/img/placeholder.svg',
    event: 'https://cdnjs.cloudflare.com/ajax/libs/placeholders/0.0.1/img/placeholder.svg'
  };
  
  // Shop items
  const shopItems = [
    { name: 'Wooden Sword', type: 'weapon', attack: 3, price: 50 },
    { name: 'Iron Sword', type: 'weapon', attack: 7, price: 150 },
    { name: 'Leather Armor', type: 'armor', defense: 2, price: 75 },
    { name: 'Chain Mail', type: 'armor', defense: 5, price: 200 },
    { name: 'Health Potion', type: 'potion', restore: 15, price: 25, quantity: 1 },
    { name: 'Inn Portal Scroll', type: 'scroll', price: 30, quantity: 1 }
  ];
  
  // Library books
  const libraryBooks = [
    { name: 'Basic Magic', cost: 100, reward: { type: 'spell', spell: { name: 'Fireball', damage: 8, manaCost: 5 } } },
    { name: 'Monster Compendium', cost: 75, reward: { type: 'knowledge', description: 'Reveals enemy weaknesses during combat' } },
    { name: 'Map Reading', cost: 50, reward: { type: 'ability', ability: 'seeMap' } }
  ];
  
  // Enemy templates
  const enemyTemplates = [
    { name: 'Goblin', hp: 10, attack: 3, defense: 1, exp: 20, gold: 15, image: 'enemy' },
    { name: 'Wolf', hp: 12, attack: 4, defense: 0, exp: 25, gold: 10, image: 'enemy' },
    { name: 'Skeleton', hp: 15, attack: 5, defense: 2, exp: 35, gold: 25, image: 'enemy' },
    { name: 'Troll', hp: 30, attack: 7, defense: 4, exp: 60, gold: 50, image: 'enemy' }
  ];
  
  // Boss templates
  const bossTemplates = [
    { name: 'Ancient Dragon', hp: 50, attack: 12, defense: 8, exp: 150, gold: 200, image: 'boss' },
    { name: 'Necromancer', hp: 40, attack: 15, defense: 5, exp: 130, gold: 180, image: 'boss' },
    { name: 'Stone Golem', hp: 60, attack: 10, defense: 10, exp: 160, gold: 160, image: 'boss' }
  ];
  
  // Treasure templates
  const treasureTemplates = [
    { name: 'Gold Hoard', gold: 300, items: [] },
    { name: 'Magic Weapon Cache', gold: 100, items: [{ name: 'Enchanted Sword', type: 'weapon', attack: 12, price: 400 }] },
    { name: 'Ancient Relics', gold: 200, items: [{ name: 'Protection Amulet', type: 'accessory', defense: 3, price: 350 }] }
  ];
  
  // Initialize game
  useEffect(() => {
    initializeGame();
  }, []);
  
  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (inCombat || shopOpen || libraryOpen) return;
      
      switch (e.key) {
        case 'ArrowUp':
          move(DIRECTIONS.NORTH);
          break;
        case 'ArrowRight':
          move(DIRECTIONS.EAST);
          break;
        case 'ArrowDown':
          move(DIRECTIONS.SOUTH);
          break;
        case 'ArrowLeft':
          move(DIRECTIONS.WEST);
          break;
        case 'i':
          if (currentLocation !== LOCATIONS.INN) {
            activatePortalScroll();
          }
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playerPosition, gameMap, currentLocation, inCombat, shopOpen, libraryOpen]);
  
  // Game clock
  useEffect(() => {
    const timer = setInterval(() => {
      setGameTime(prevTime => prevTime + 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Initialize the game
  const initializeGame = () => {
    generateTownMap();
    setCurrentLocation(LOCATIONS.INN);
    setCurrentScene('inn');
    setPlayerPosition({ x: 7, y: 7 });
    addToGameLog('Welcome to the Mystic Realms! You find yourself at the cozy Wanderer\'s Inn.');
  };
  
  // Generate random town map
  const generateTownMap = () => {
    const width = mapSize.width;
    const height = mapSize.height;
    let map = Array(height).fill().map(() => Array(width).fill(TILE_TYPES.WALL));
    
    // Place the inn in the center
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);
    map[centerY][centerX] = TILE_TYPES.INN;
    
    // Generate paths
    const numPaths = 3 + Math.floor(Math.random() * 3); // 3-5 paths
    
    for (let i = 0; i < numPaths; i++) {
      // Pick a random direction from the inn
      const direction = Math.floor(Math.random() * 4);
      let currentX = centerX;
      let currentY = centerY;
      let pathLength = 5 + Math.floor(Math.random() * 10); // 5-14 length
      
      // Create the path
      for (let j = 0; j < pathLength; j++) {
        // Move in the chosen direction
        switch (direction) {
          case 0: // North
            currentY = Math.max(1, currentY - 1);
            break;
          case 1: // East
            currentX = Math.min(width - 2, currentX + 1);
            break;
          case 2: // South
            currentY = Math.min(height - 2, currentY + 1);
            break;
          case 3: // West
            currentX = Math.max(1, currentX - 1);
            break;
        }
        
        // Set the tile to path
        map[currentY][currentX] = TILE_TYPES.PATH;
        
        // Sometimes branch the path
        if (j > 2 && Math.random() < 0.3) {
          const branchDir = (direction + (Math.random() < 0.5 ? 1 : 3)) % 4;
          let branchX = currentX;
          let branchY = currentY;
          
          // Move in the branch direction
          switch (branchDir) {
            case 0: // North
              branchY = Math.max(1, branchY - 1);
              break;
            case 1: // East
              branchX = Math.min(width - 2, branchX + 1);
              break;
            case 2: // South
              branchY = Math.min(height - 2, branchY + 1);
              break;
            case 3: // West
              branchX = Math.max(1, branchX - 1);
              break;
          }
          
          if (map[branchY][branchX] === TILE_TYPES.WALL) {
            map[branchY][branchX] = TILE_TYPES.PATH;
          }
        }
      }
      
      // Place a dungeon entrance at the end of the path
      map[currentY][currentX] = TILE_TYPES.DUNGEON_ENTRANCE;
    }
    
    // Add some random events
    const numEvents = 5 + Math.floor(Math.random() * 5);
    for (let i = 0; i < numEvents; i++) {
      const x = 1 + Math.floor(Math.random() * (width - 2));
      const y = 1 + Math.floor(Math.random() * (height - 2));
      
      if (map[y][x] === TILE_TYPES.PATH) {
        map[y][x] = TILE_TYPES.EVENT;
      }
    }
    
    setGameMap(map);
  };
  
  // Generate dungeon map
  const generateDungeonMap = () => {
    const width = mapSize.width;
    const height = mapSize.height;
    let map = Array(height).fill().map(() => Array(width).fill(TILE_TYPES.WALL));
    
    // Place the dungeon entrance
    const entranceX = Math.floor(width / 2);
    const entranceY = height - 2;
    map[entranceY][entranceX] = TILE_TYPES.DUNGEON_EXIT;
    
    // Start creating a path from the entrance
    let currentX = entranceX;
    let currentY = entranceY - 1;
    map[currentY][currentX] = TILE_TYPES.PATH;
    
    // Create a winding path to the boss room
    const pathLength = 15 + Math.floor(Math.random() * 10);
    let direction = 0; // 0: North, 1: East, 2: South, 3: West
    
    for (let i = 0; i < pathLength; i++) {
      // Decide whether to change direction
      if (Math.random() < 0.3) {
        direction = Math.floor(Math.random() * 4);
      }
      
      // Try to move in the current direction
      let newX = currentX;
      let newY = currentY;
      
      switch (direction) {
        case 0: // North
          newY = Math.max(1, currentY - 1);
          break;
        case 1: // East
          newX = Math.min(width - 2, currentX + 1);
          break;
        case 2: // South
          newY = Math.min(height - 2, currentY + 1);
          break;
        case 3: // West
          newX = Math.max(1, currentX - 1);
          break;
      }
      
      // If we haven't visited this tile yet
      if (map[newY][newX] === TILE_TYPES.WALL) {
        map[newY][newX] = TILE_TYPES.PATH;
        currentX = newX;
        currentY = newY;
        
        // Sometimes add a branch
        if (Math.random() < 0.2) {
          const branchDir = (direction + (Math.random() < 0.5 ? 1 : 3)) % 4;
          let branchX = currentX;
          let branchY = currentY;
          
          switch (branchDir) {
            case 0: // North
              branchY = Math.max(1, branchY - 1);
              break;
            case 1: // East
              branchX = Math.min(width - 2, branchX + 1);
              break;
            case 2: // South
              branchY = Math.min(height - 2, branchY + 1);
              break;
            case 3: // West
              branchX = Math.max(1, branchX - 1);
              break;
          }
          
          if (map[branchY][branchX] === TILE_TYPES.WALL) {
            map[branchY][branchX] = TILE_TYPES.PATH;
            
            // Sometimes extend the branch
            if (Math.random() < 0.5) {
              let branchX2 = branchX;
              let branchY2 = branchY;
              
              switch (branchDir) {
                case 0: // North
                  branchY2 = Math.max(1, branchY2 - 1);
                  break;
                case 1: // East
                  branchX2 = Math.min(width - 2, branchX2 + 1);
                  break;
                case 2: // South
                  branchY2 = Math.min(height - 2, branchY2 + 1);
                  break;
                case 3: // West
                  branchX2 = Math.max(1, branchX2 - 1);
                  break;
              }
              
              if (map[branchY2][branchX2] === TILE_TYPES.WALL) {
                map[branchY2][branchX2] = Math.random() < 0.7 ? TILE_TYPES.PATH : TILE_TYPES.ENEMY;
              }
            }
          }
        }
      }
    }
    
    // Place the boss at the end of the path
    map[currentY][currentX] = TILE_TYPES.BOSS;
    
    // Place the treasure next to the boss
    const treasureDirections = [
      { dx: 0, dy: -1 }, // North
      { dx: 1, dy: 0 },  // East
      { dx: 0, dy: 1 },  // South
      { dx: -1, dy: 0 }  // West
    ];
    
    for (const dir of treasureDirections) {
      const treasureX = currentX + dir.dx;
      const treasureY = currentY + dir.dy;
      
      if (
        treasureX > 0 && treasureX < width - 1 &&
        treasureY > 0 && treasureY < height - 1 &&
        map[treasureY][treasureX] === TILE_TYPES.WALL
      ) {
        map[treasureY][treasureX] = TILE_TYPES.TREASURE;
        break;
      }
    }
    
    // Add some enemies
    const numEnemies = 5 + Math.floor(Math.random() * 5);
    let enemiesPlaced = 0;
    
    while (enemiesPlaced < numEnemies) {
      const x = 1 + Math.floor(Math.random() * (width - 2));
      const y = 1 + Math.floor(Math.random() * (height - 2));
      
      if (map[y][x] === TILE_TYPES.PATH) {
        map[y][x] = TILE_TYPES.ENEMY;
        enemiesPlaced++;
      }
    }
    
    setGameMap(map);
  };
  
  // Move the player
  const move = (direction) => {
    let newPosition = { ...playerPosition };
    
    switch (direction) {
      case DIRECTIONS.NORTH:
        newPosition.y -= 1;
        break;
      case DIRECTIONS.EAST:
        newPosition.x += 1;
        break;
      case DIRECTIONS.SOUTH:
        newPosition.y += 1;
        break;
      case DIRECTIONS.WEST:
        newPosition.x -= 1;
        break;
      default:
        break;
    }
    
    // Check if the new position is valid
    if (
      newPosition.x >= 0 && newPosition.x < mapSize.width &&
      newPosition.y >= 0 && newPosition.y < mapSize.height
    ) {
      const tileType = gameMap[newPosition.y][newPosition.x];
      
      // Handle different tile types
      switch (tileType) {
        case TILE_TYPES.WALL:
          addToGameLog('You bump into a wall.');
          return;
        case TILE_TYPES.PATH:
          setPlayerPosition(newPosition);
          addToGameLog('You walk along the path.');
          setCurrentScene('path');
          if (Math.random() < 0.1 && currentLocation !== LOCATIONS.INN) {
            triggerRandomEncounter();
          }
          break;
        case TILE_TYPES.INN:
          setPlayerPosition(newPosition);
          setCurrentLocation(LOCATIONS.INN);
          setCurrentScene('inn');
          setInnOptions(true);
          addToGameLog('You return to the Wanderer\'s Inn. A warm fire welcomes you.');
          break;
        case TILE_TYPES.DUNGEON_ENTRANCE:
          setPlayerPosition(newPosition);
          enterDungeon();
          break;
        case TILE_TYPES.DUNGEON_EXIT:
          exitDungeon();
          break;
        case TILE_TYPES.BOSS:
          setPlayerPosition(newPosition);
          encounterBoss();
          break;
        case TILE_TYPES.TREASURE:
          setPlayerPosition(newPosition);
          findTreasure();
          break;
        case TILE_TYPES.EVENT:
          setPlayerPosition(newPosition);
          triggerEvent();
          break;
        case TILE_TYPES.ENEMY:
          setPlayerPosition(newPosition);
          encounterEnemy();
          break;
        default:
          break;
      }
    }
  };
  
  // Enter a dungeon
  const enterDungeon = () => {
    generateDungeonMap();
    setCurrentLocation(LOCATIONS.DUNGEON);
    setCurrentScene('dungeonEntrance');
    setPlayerPosition({ x: Math.floor(mapSize.width / 2), y: mapSize.height - 2 });
    addToGameLog('You enter a dark, foreboding dungeon. The air is damp and cold.');
  };
  
  // Exit a dungeon
  const exitDungeon = () => {
    generateTownMap();
    setCurrentLocation(LOCATIONS.TOWN);
    setCurrentScene('path');
    setPlayerPosition({ x: Math.floor(mapSize.width / 2), y: 1 });
    addToGameLog('You exit the dungeon and return to the town.');
  };
  
  // Random encounter
  const triggerRandomEncounter = () => {
    if (Math.random() < 0.5) {
      encounterEnemy();
    } else {
      triggerEvent();
    }
  };
  
  // Encounter an enemy
  const encounterEnemy = () => {
    const template = enemyTemplates[Math.floor(Math.random() * enemyTemplates.length)];
    const newEnemy = { ...template };
    
    // Scale enemies based on player level
    const levelFactor = 1 + (player.level - 1) * 0.2;
    newEnemy.hp = Math.floor(newEnemy.hp * levelFactor);
    newEnemy.attack = Math.floor(newEnemy.attack * levelFactor);
    newEnemy.defense = Math.floor(newEnemy.defense * levelFactor);
    newEnemy.exp = Math.floor(newEnemy.exp * levelFactor);
    newEnemy.gold = Math.floor(newEnemy.gold * levelFactor);
    
    setEnemy(newEnemy);
    setInCombat(true);
    setCurrentScene('enemy');
    addToGameLog(`A ${newEnemy.name} appears before you!`);
  };
  
  // Encounter a boss
  const encounterBoss = () => {
    const template = bossTemplates[Math.floor(Math.random() * bossTemplates.length)];
    const boss = { ...template };
    
    // Scale boss based on player level
    const levelFactor = 1 + (player.level - 1) * 0.15;
    boss.hp = Math.floor(boss.hp * levelFactor);
    boss.attack = Math.floor(boss.attack * levelFactor);
    boss.defense = Math.floor(boss.defense * levelFactor);
    boss.exp = Math.floor(boss.exp * levelFactor);
    boss.gold = Math.floor(boss.gold * levelFactor);
    
    setEnemy(boss);
    setInCombat(true);
    setCurrentScene('boss');
    addToGameLog(`You face the dungeon's guardian: a fearsome ${boss.name}!`);
  };
  
  // Find treasure
  const findTreasure = () => {
    const treasure = treasureTemplates[Math.floor(Math.random() * treasureTemplates.length)];
    let treasureLog = `You found a ${treasure.name}! `;
    
    // Add gold to player
    const goldFound = treasure.gold;
    setPlayer(prev => ({
      ...prev,
      gold: prev.gold + goldFound
    }));
    treasureLog += `You gained ${goldFound} gold. `;
    
    // Add items to inventory
    if (treasure.items.length > 0) {
      const newInventory = [...player.inventory];
      treasure.items.forEach(item => {
        newInventory.push({ ...item, quantity: 1 });
        treasureLog += `You acquired a ${item.name}. `;
      });
      
      setPlayer(prev => ({
        ...prev,
        inventory: newInventory
      }));
    }
    
    setCurrentScene('treasure');
    addToGameLog(treasureLog);
    
    // Update the map to mark treasure as collected
    const newMap = [...gameMap];
    newMap[playerPosition.y][playerPosition.x] = TILE_TYPES.PATH;
    setGameMap(newMap);
  };
  
  // Trigger a random event
  const triggerEvent = () => {
    const events = [
      {
        name: 'Healing Spring',
        description: 'You discover a magical spring. Its waters restore your health.',
        effect: () => {
          setPlayer(prev => ({
            ...prev,
            hp: prev.maxHp
          }));
          return 'You feel completely refreshed!';
        }
      },
      {
        name: 'Gold Cache',
        description: 'You spot a small cache of gold hidden under a rock.',
        effect: () => {
          const goldFound = 10 + Math.floor(Math.random() * 30);
          setPlayer(prev => ({
            ...prev,
            gold: prev.gold + goldFound
          }));
          return `You found ${goldFound} gold!`;
        }
      },
      {
        name: 'Abandoned Supplies',
        description: 'You find a discarded backpack with some useful items.',
        effect: () => {
          const newInventory = [...player.inventory];
          if (Math.random() < 0.5) {
            newInventory.push({ name: 'Health Potion', type: 'potion', restore: 15, quantity: 1 });
            setPlayer(prev => ({
              ...prev,
              inventory: newInventory
            }));
            return 'You found a Health Potion!';
          } else {
            newInventory.push({ name: 'Inn Portal Scroll', type: 'scroll', quantity: 1 });
            setPlayer(prev => ({
              ...prev,
              inventory: newInventory
            }));
            return 'You found an Inn Portal Scroll!';
          }
        }
      },
      {
        name: 'Training Dummy',
        description: 'You come across an old training dummy. Practicing on it improves your skills.',
        effect: () => {
          setPlayer(prev => ({
            ...prev,
            attack: prev.attack + 1
          }));
          return 'Your attack skill increased by 1!';
        }
      },
      {
        name: 'Trap',
        description: 'You trigger a hidden trap!',
        effect: () => {
          const damage = Math.max(1, Math.floor(player.maxHp * 0.2));
          setPlayer(prev => ({
            ...prev,
            hp: Math.max(1, prev.hp - damage)
          }));
          return `The trap hits you for ${damage} damage!`;
        }
      }
    ];
    
    const event = events[Math.floor(Math.random() * events.length)];
    setCurrentScene('event');
    addToGameLog(event.description);
    const effectResult = event.effect();
    addToGameLog(effectResult);
    
    // Update the map to mark event as triggered
    const newMap = [...gameMap];
    newMap[playerPosition.y][playerPosition.x] = TILE_TYPES.PATH;
    setGameMap(newMap);
  };
  
  // Open shop
  const openShop = () => {
	    setShopOpen(true);
    setLibraryOpen(false);
    setInnOptions(false);
    addToGameLog('Welcome to the shop! What would you like to buy?');
  };
  
  // Close shop
  const closeShop = () => {
    setShopOpen(false);
    setInnOptions(true);
    addToGameLog('Come back anytime!');
  };
  
  // Buy item
  const buyItem = (item) => {
    if (player.gold < item.price) {
      addToGameLog('You don\'t have enough gold!');
      return;
    }
    
    // Add item to inventory
    const newInventory = [...player.inventory];
    const existingItemIndex = newInventory.findIndex(i => 
      i.name === item.name && i.type === item.type
    );
    
    if (existingItemIndex !== -1 && (item.type === 'potion' || item.type === 'scroll')) {
      // Stack consumables
      newInventory[existingItemIndex].quantity += item.quantity;
    } else {
      // Add new item
      newInventory.push({ ...item });
    }
    
    let attackBonus = 0;
    let defenseBonus = 0;
    const newEquipment = { ...player.equipment };

    if (item.type === 'weapon') {
      if (newEquipment.weapon) attackBonus -= newEquipment.weapon.attack || 0;
      newEquipment.weapon = item;
      attackBonus += item.attack || 0;
    } else if (item.type === 'armor') {
      if (newEquipment.armor) defenseBonus -= newEquipment.armor.defense || 0;
      newEquipment.armor = item;
      defenseBonus += item.defense || 0;
    }

    setPlayer(prev => ({
      ...prev,
      gold: prev.gold - item.price,
      inventory: newInventory,
      equipment: newEquipment,
      attack: prev.attack + attackBonus,
      defense: prev.defense + defenseBonus
    }));

    const equipped = item.type === 'weapon' || item.type === 'armor' ? ' and equipped it' : '';
    addToGameLog(`You bought a ${item.name} for ${item.price} gold${equipped}.`);
  };
  
  // Open library
  const openLibrary = () => {
    setLibraryOpen(true);
    setShopOpen(false);
    setInnOptions(false);
    addToGameLog('Welcome to the library! Which book would you like to read?');
  };
  
  // Close library
  const closeLibrary = () => {
    setLibraryOpen(false);
    setInnOptions(true);
    addToGameLog('May knowledge guide your journey!');
  };
  
  // Read book
  const readBook = (book) => {
    if (player.gold < book.cost) {
      addToGameLog('You don\'t have enough gold!');
      return;
    }
    
    let rewardText = '';
    
    // Apply book reward
    if (book.reward.type === 'spell') {
      // Add spell
      const newSpells = [...player.spells];
      newSpells.push(book.reward.spell);
      
      setPlayer(prev => ({
        ...prev,
        gold: prev.gold - book.cost,
        spells: newSpells
      }));
      
      rewardText = `You learned the ${book.reward.spell.name} spell!`;
    } else if (book.reward.type === 'knowledge') {
      // Add knowledge benefit
      setPlayer(prev => ({
        ...prev,
        gold: prev.gold - book.cost
      }));
      
      rewardText = `You gained valuable knowledge: ${book.reward.description}`;
    } else if (book.reward.type === 'ability') {
      // Add ability
      setPlayer(prev => ({
        ...prev,
        gold: prev.gold - book.cost
      }));
      
      rewardText = 'You learned how to read maps. You can now see more of your surroundings.';
    }
    
    addToGameLog(`You spent ${book.cost} gold to study the ${book.name} book.`);
    addToGameLog(rewardText);
  };
  
  // Rest at inn
  const restAtInn = () => {
    // Heal to full
    setPlayer(prev => ({
      ...prev,
      hp: prev.maxHp
    }));
    
    addToGameLog('You rest at the inn and recover all your HP.');
  };
  
  // Save game
  const saveGame = () => {
    const saveData = {
      player,
      gameMap,
      playerPosition,
      currentLocation,
      gameTime,
      timestamp: new Date().toLocaleString()
    };
    
    const newSaveGames = [...saveGames, saveData];
    setSaveGames(newSaveGames);
    localStorage.setItem('retrorpg_saves', JSON.stringify(newSaveGames));

    addToGameLog('Game saved successfully!');
  };
  
  // Load game
  const loadGame = (index) => {
    const saveData = saveGames[index];
    if (!saveData) return;

    setPlayer(saveData.player);
    setGameMap(saveData.gameMap);
    setPlayerPosition(saveData.playerPosition);
    setCurrentLocation(saveData.currentLocation);
    setGameTime(saveData.gameTime);
    
    setCurrentScene(saveData.currentLocation === LOCATIONS.INN ? 'inn' : 'path');
    setInCombat(false);
    setEnemy(null);
    setShopOpen(false);
    setLibraryOpen(false);
    
    if (saveData.currentLocation === LOCATIONS.INN) {
      setInnOptions(true);
    }
    
    addToGameLog('Game loaded successfully!');
  };
  
  // Attack the enemy
  const attackEnemy = () => {
    if (!inCombat || !enemy) return;
    
    // Calculate damage
    const playerDamage = Math.max(1, player.attack - enemy.defense);
    const enemyHp = enemy.hp - playerDamage;
    
    addToGameLog(`You attack the ${enemy.name} for ${playerDamage} damage!`);
    
    if (enemyHp <= 0) {
      // Enemy defeated
      addToGameLog(`You defeated the ${enemy.name}!`);
      addToGameLog(`You gained ${enemy.exp} experience and ${enemy.gold} gold.`);
      
      // Update player stats
      const newExp = player.exp + enemy.exp;
      let newLevel = player.level;
      let newNextLevelExp = player.nextLevelExp;
      
      // Check for level up
      if (newExp >= player.nextLevelExp) {
        newLevel++;
        newNextLevelExp = Math.floor(player.nextLevelExp * 1.5);
        
        // Increase stats
        setPlayer(prev => ({
          ...prev,
          level: newLevel,
          maxHp: prev.maxHp + 5,
          hp: prev.hp + 5,
          attack: prev.attack + 2,
          defense: prev.defense + 1,
          exp: newExp,
          nextLevelExp: newNextLevelExp,
          gold: prev.gold + enemy.gold
        }));
        
        addToGameLog(`Congratulations! You reached level ${newLevel}!`);
        addToGameLog('Your stats have increased!');
      } else {
        setPlayer(prev => ({
          ...prev,
          exp: newExp,
          gold: prev.gold + enemy.gold
        }));
      }
      
      setInCombat(false);
      setEnemy(null);
      
      // Update map if it was a boss
      if (enemy.name === bossTemplates[0].name || 
          enemy.name === bossTemplates[1].name || 
          enemy.name === bossTemplates[2].name) {
        const newMap = [...gameMap];
        newMap[playerPosition.y][playerPosition.x] = TILE_TYPES.PATH;
        setGameMap(newMap);
      }
      
      setCurrentScene(currentLocation === LOCATIONS.DUNGEON ? 'dungeonPath' : 'path');
    } else {
      // Enemy still alive, counter-attack
      setEnemy({ ...enemy, hp: enemyHp });
      
      const enemyDamage = Math.max(1, enemy.attack - player.defense);
      const playerHp = player.hp - enemyDamage;
      
      addToGameLog(`The ${enemy.name} attacks you for ${enemyDamage} damage!`);
      
      if (playerHp <= 0) {
        // Player defeated
        addToGameLog('You have been defeated!');
        setPlayer(prev => ({
          ...prev,
          hp: Math.max(1, Math.floor(prev.maxHp * 0.5))
        }));
        
        // Transport back to inn
        returnToInn();
      } else {
        setPlayer(prev => ({
          ...prev,
          hp: playerHp
        }));
      }
    }
  };

  // Use a potion
  const consumePotion = () => {
    if (!inCombat || !enemy) return;
    
    // Find health potion in inventory
    const potionIndex = player.inventory.findIndex(item => 
      item.type === 'potion' && item.name === 'Health Potion' && item.quantity > 0
    );
    
    if (potionIndex === -1) {
      addToGameLog('You don\'t have any Health Potions!');
      return;
    }
    
    // Use potion
    const potion = player.inventory[potionIndex];
    const newHp = Math.min(player.maxHp, player.hp + potion.restore);
    
    // Update inventory
    const newInventory = [...player.inventory];
    if (potion.quantity > 1) {
      newInventory[potionIndex] = { ...potion, quantity: potion.quantity - 1 };
    } else {
      newInventory.splice(potionIndex, 1);
    }
    
    setPlayer(prev => ({
      ...prev,
      hp: newHp,
      inventory: newInventory
    }));
    
    addToGameLog(`You drink a Health Potion and restore ${potion.restore} HP!`);
    
    // Enemy still gets to attack
    const enemyDamage = Math.max(1, enemy.attack - player.defense);
    const playerHp = newHp - enemyDamage;
    
    addToGameLog(`The ${enemy.name} attacks you for ${enemyDamage} damage!`);
    
    if (playerHp <= 0) {
      // Player defeated
      addToGameLog('You have been defeated!');
      setPlayer(prev => ({
        ...prev,
        hp: Math.max(1, Math.floor(prev.maxHp * 0.5))
      }));
      
      // Transport back to inn
      returnToInn();
    } else {
      setPlayer(prev => ({
        ...prev,
        hp: playerHp
      }));
    }
  };
  
  // Run from combat
  const runFromCombat = () => {
    if (!inCombat || !enemy) return;
    
    // 70% chance to run successfully
    if (Math.random() < 0.7) {
      addToGameLog('You successfully escape from the battle!');
      setInCombat(false);
      setEnemy(null);
      setCurrentScene(currentLocation === LOCATIONS.DUNGEON ? 'dungeonPath' : 'path');
    } else {
      // Failed to run, enemy attacks
      addToGameLog('You failed to escape!');
      
      const enemyDamage = Math.max(1, enemy.attack - player.defense);
      const playerHp = player.hp - enemyDamage;
      
      addToGameLog(`The ${enemy.name} attacks you for ${enemyDamage} damage!`);
      
      if (playerHp <= 0) {
        // Player defeated
        addToGameLog('You have been defeated!');
        setPlayer(prev => ({
          ...prev,
          hp: Math.max(1, Math.floor(prev.maxHp * 0.5))
        }));
        
        // Transport back to inn
        returnToInn();
      } else {
        setPlayer(prev => ({
          ...prev,
          hp: playerHp
        }));
      }
    }
  };
  
  // Return to inn
  const returnToInn = () => {
    generateTownMap();
    setCurrentLocation(LOCATIONS.INN);
    setCurrentScene('inn');
    setPlayerPosition({ x: Math.floor(mapSize.width / 2), y: Math.floor(mapSize.height / 2) });
    setInCombat(false);
    setEnemy(null);
    setInnOptions(true);
    addToGameLog('You return to the safety of the Wanderer\'s Inn.');
  };
  
  // Use portal scroll
  const activatePortalScroll = () => {
    // Find portal scroll in inventory
    const scrollIndex = player.inventory.findIndex(item => 
      item.type === 'scroll' && item.name === 'Inn Portal Scroll' && item.quantity > 0
    );
    
    if (scrollIndex === -1) {
      addToGameLog('You don\'t have any Inn Portal Scrolls!');
      return;
    }
    
    // Use scroll
    const newInventory = [...player.inventory];
    const scroll = newInventory[scrollIndex];
    
    if (scroll.quantity > 1) {
      newInventory[scrollIndex] = { ...scroll, quantity: scroll.quantity - 1 };
    } else {
      newInventory.splice(scrollIndex, 1);
    }
    
    setPlayer(prev => ({
      ...prev,
      inventory: newInventory
    }));
    
    addToGameLog('You use an Inn Portal Scroll. Magic swirls around you...');
    returnToInn();
  };
  
  // Add to game log
  const addToGameLog = (message) => {
    setGameLog(prev => [...prev, message]);
  };
  
  // Get current view image
  const getCurrentImage = () => {
    if (inCombat) {
      return enemy ? sceneImages[enemy.image] : sceneImages.path;
    }
    
    if (shopOpen || libraryOpen) {
      return sceneImages.inn;
    }
    
    if (currentLocation === LOCATIONS.INN) {
      return sceneImages.inn;
    }
    
    if (currentLocation === LOCATIONS.DUNGEON) {
      const tileType = gameMap[playerPosition.y][playerPosition.x];
      
      switch (tileType) {
        case TILE_TYPES.DUNGEON_EXIT:
          return sceneImages.dungeonEntrance;
        case TILE_TYPES.PATH:
          return sceneImages.dungeonPath;
        case TILE_TYPES.WALL:
          return sceneImages.dungeonWall;
        case TILE_TYPES.BOSS:
          return sceneImages.boss;
        case TILE_TYPES.TREASURE:
          return sceneImages.treasure;
        case TILE_TYPES.ENEMY:
          return sceneImages.enemy;
        case TILE_TYPES.EVENT:
          return sceneImages.event;
        default:
          return sceneImages.dungeonPath;
      }
    }
    
    // Town
    const tileType = gameMap[playerPosition.y][playerPosition.x];
    
    switch (tileType) {
      case TILE_TYPES.INN:
        return sceneImages.inn;
      case TILE_TYPES.PATH:
        return sceneImages.path;
      case TILE_TYPES.WALL:
        return sceneImages.wall;
      case TILE_TYPES.DUNGEON_ENTRANCE:
        return sceneImages.dungeonEntrance;
      case TILE_TYPES.EVENT:
        return sceneImages.event;
      case TILE_TYPES.ENEMY:
        return sceneImages.enemy;
      default:
        return sceneImages.path;
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 p-4 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-yellow-400">Mystic Realms</h1>
        <div className="flex justify-between mt-2">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Heart size={16} className="text-red-500 mr-1" />
              <span>{player.hp}/{player.maxHp}</span>
            </div>
            <div className="flex items-center">
              <Sword size={16} className="text-blue-400 mr-1" />
              <span>{player.attack}</span>
            </div>
            <div className="flex items-center">
              <Shield size={16} className="text-green-400 mr-1" />
              <span>{player.defense}</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Coins size={16} className="text-yellow-400 mr-1" />
              <span>{player.gold}</span>
            </div>
            <div className="flex items-center">
              <Clock size={16} className="text-purple-400 mr-1" />
              <span>{Math.floor(gameTime / 60)}:{String(gameTime % 60).padStart(2, '0')}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
        {/* Game display */}
        <div className="flex-grow flex flex-col items-center p-4">
          {/* Scene image */}
          <div className="w-full max-w-xl h-64 mb-4 bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
            <img 
              src="/api/placeholder/800/400" 
              alt={currentScene}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Game log */}
          <div className="w-full max-w-xl h-48 p-4 bg-gray-800 border border-gray-700 rounded-lg overflow-y-auto">
            {gameLog.slice(-10).map((message, index) => (
              <p key={index} className="mb-1">{message}</p>
            ))}
          </div>
          
          {/* Action controls */}
          <div className="w-full max-w-xl mt-4">
            {inCombat ? (
              <div className="grid grid-cols-3 gap-2">
                <button 
                  onClick={attackEnemy}
                  className="bg-red-700 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                >
                  Attack
                </button>
                <button 
                  onClick={consumePotion}
                  className="bg-green-700 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                >
                  Use Potion
                </button>
                <button 
                  onClick={runFromCombat}
                  className="bg-blue-700 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                >
                  Run
                </button>
              </div>
            ) : shopOpen ? (
              <div className="space-y-2">
                <h3 className="text-lg font-bold mb-2">Shop</h3>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  {shopItems.map((item, index) => (
                    <button 
                      key={index}
                      onClick={() => buyItem(item)}
                      className={`bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded flex justify-between ${player.gold < item.price ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={player.gold < item.price}
                    >
                      <span>{item.name}</span>
                      <span>{item.price} gold</span>
                    </button>
                  ))}
                </div>
                <button 
                  onClick={closeShop}
                  className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded w-full"
                >
                  Return
                </button>
              </div>
            ) : libraryOpen ? (
              <div className="space-y-2">
                <h3 className="text-lg font-bold mb-2">Library</h3>
                <div className="grid grid-cols-1 gap-2 mb-2">
                  {libraryBooks.map((book, index) => (
                    <button 
                      key={index}
                      onClick={() => readBook(book)}
                      className={`bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded flex justify-between ${player.gold < book.cost ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={player.gold < book.cost}
                    >
                      <span>{book.name}</span>
                      <span>{book.cost} gold</span>
                    </button>
                  ))}
                </div>
                <button 
                  onClick={closeLibrary}
                  className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded w-full"
                >
                  Return
                </button>
              </div>
            ) : currentLocation === LOCATIONS.INN && innOptions ? (
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={openShop}
                  className="bg-yellow-700 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded"
                >
                  Shop
                </button>
                <button 
                  onClick={openLibrary}
                  className="bg-purple-700 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded"
                >
                  Library
                </button>
                <button 
                  onClick={restAtInn}
                  className="bg-green-700 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                >
                  Rest
                </button>
                <button 
                  onClick={saveGame}
                  className="bg-blue-700 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                >
                  Save Game
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-3 grid grid-cols-3 gap-2">
                  <div className="col-start-2">
                    <button 
                      onClick={() => move(DIRECTIONS.NORTH)}
                      className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded w-full"
                    >
                      <ArrowUp size={16} className="mx-auto" />
                    </button>
                  </div>
                  <div className="col-span-3 grid grid-cols-3 gap-2">
                    <button 
                      onClick={() => move(DIRECTIONS.WEST)}
                      className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
                    >
                      <ArrowLeft size={16} className="mx-auto" />
                    </button>
                    <button 
                      onClick={() => move(DIRECTIONS.SOUTH)}
                      className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
                    >
                      <ArrowDown size={16} className="mx-auto" />
                    </button>
                    <button 
                      onClick={() => move(DIRECTIONS.EAST)}
                      className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
                    >
                      <ArrowRight size={16} className="mx-auto" />
                    </button>
                  </div>
                </div>
                <button 
                  onClick={activatePortalScroll}
                  className="col-span-3 mt-2 bg-purple-700 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded flex items-center justify-center"
                >
                  <Home size={16} className="mr-2" /> Use Portal Scroll
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="w-full md:w-64 p-4 bg-gray-800 overflow-y-auto">
          <h2 className="text-xl font-bold mb-4 text-yellow-400">Character</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-bold mb-1 text-gray-400">Status</h3>
              <div className="space-y-1 text-sm">
                <p>Name: {player.name}</p>
                <p>Level: {player.level}</p>
                <p>EXP: {player.exp}/{player.nextLevelExp}</p>
                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-400" 
                    style={{ width: `${(player.exp / player.nextLevelExp) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold mb-1 text-gray-400">Inventory</h3>
              <div className="space-y-1 text-sm max-h-32 overflow-y-auto">
                {player.inventory.length > 0 ? (
                  player.inventory.map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{item.name}</span>
                      {item.quantity > 1 && <span>x{item.quantity}</span>}
                    </div>
                  ))
                ) : (
                  <p>Empty</p>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="font-bold mb-1 text-gray-400">Equipment</h3>
              <div className="space-y-1 text-sm">
                <p>Weapon: {player.equipment.weapon ? player.equipment.weapon.name : 'None'}</p>
                <p>Armor: {player.equipment.armor ? player.equipment.armor.name : 'None'}</p>
                <p>Accessory: {player.equipment.accessory ? player.equipment.accessory.name : 'None'}</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold mb-1 text-gray-400">Spells</h3>
              <div className="space-y-1 text-sm">
                {player.spells.length > 0 ? (
                  player.spells.map((spell, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{spell.name}</span>
                      <span>{spell.damage} dmg</span>
                    </div>
                  ))
                ) : (
                  <p>No spells learned</p>
                )}
              </div>
            </div>
            
            {saveGames.length > 0 && (
              <div>
                <h3 className="font-bold mb-1 text-gray-400">Saved Games</h3>
                <div className="space-y-1">
                  {saveGames.map((save, index) => (
                    <button 
                      key={index}
                      onClick={() => loadGame(index)}
                      className="w-full text-left text-sm bg-gray-700 hover:bg-gray-600 p-1 rounded"
                    >
                      Load: {save.timestamp}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RetroRPG;