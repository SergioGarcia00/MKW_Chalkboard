
import type { ItemType } from "@/lib/types";
import type { StaticImageData } from "next/image";

import itemBox from './icons/107px-MKW_Item_Box.png';
import mushroom from './icons/120px-MKW_Mushroom_Roulette.png';
import goldenMushroom from './icons/100px-MKW_Golden_Mushroom_Item_Roulette.png';
import megaMushroom from './icons/120px-MKW_Mega_Mushroom_Roulette.png';
import shell from './icons/120px-MKW_Green_Shell_Roulette.png';
import redShell from './icons/120px-MKW_Red_Shell_Roulette.png';
import blueShell from './icons/120px-MKW_Spiny_Shell_Roulette.png';
import coin from './icons/99px-MKW_Coin_Roulette.png';
import fireFlower from './icons/115px-MKW_Fire_Flower_Roulette.png';
import iceFlower from './icons/115px-MKW_Ice_Flower_Roulette.png';
import boomerangFlower from './icons/120px-MKW_Boomerang_Flower_Roulette.png';
import bulletBill from './icons/120px-MKW_Bullet_Bill_Roulette.png';
import bobOmb from './icons/120px-MKW_Bob-omb_Roulette.png';
import hammer from './icons/110px-MKW_Hammer_Roulette.png';
import superHorn from './icons/120px-MKW_Super_Horn_Roulette.png';
import boo from './icons/120px-MKW_Boo_Roulette.png';
import blooper from './icons/93px-MKW_Blooper_Roulette.png';
import feather from './icons/120px-MKW_Feather_Roulette.png';
import superStar from './icons/120px-MKW_Super_Star_Roulette.png';
import lightning from './icons/73px-MKW_Lightning_Roulette.png';
import kamek from './icons/103px-MKW_Kamek_Roulette.png';
import dashFood from './icons/120px-MKWorld_Dash_Food_bag.png';
import player from './icons/120px-MKW_Coin_Shell_Roulette.png';
import enemy from './icons/120px-MKW_Triple_Banana_Roulette.png';

export const AVAILABLE_ITEMS: { type: ItemType; name: string; }[] = [
    { type: "item-box", name: "? Block" },
    { type: "mushroom", name: "Mushroom" },
    { type: "golden-mushroom", name: "Golden Mushroom" },
    { type: "mega-mushroom", name: "Mega Mushroom" },
    { type: "shell", name: "Green Shell" },
    { type: "red-shell", name: "Red Shell" },
    { type: "blue-shell", name: "Blue Shell" },
    { type: "coin", name: "Coin" },
    { type: "fire-flower", name: "Fire Flower" },
    { type: "ice-flower", name: "Ice Flower" },
    { type: "boomerang-flower", name: "Boomerang" },
    { type: "bullet-bill", name: "Bullet Bill" },
    { type: "bob-omb", name: "Bob-omb" },
    { type: "hammer", name: "Hammer" },
    { type: "super-horn", name: "Super Horn" },
    { type: "boo", name: "Boo" },
    { type: "blooper", name: "Blooper" },
    { type: "feather", name: "Feather" },
    { type: "super-star", name: "Super Star" },
    { type: "lightning", name: "Lightning" },
    { type: "kamek", name: "Kamek" },
    { type: "dash-food", name: "Dash Food" },
    { type: "player", name: "Player" },
    { type: "enemy", name: "Enemies" },
];

export const iconMap: Record<ItemType, StaticImageData> = {
    "item-box": itemBox,
    "mushroom": mushroom,
    "golden-mushroom": goldenMushroom,
    "mega-mushroom": megaMushroom,
    "shell": shell,
    "red-shell": redShell,
    "blue-shell": blueShell,
    "coin": coin,
    "fire-flower": fireFlower,
    "ice-flower": iceFlower,
    "boomerang-flower": boomerangFlower,
    "bullet-bill": bulletBill,
    "bob-omb": bobOmb,
    "hammer": hammer,
    "super-horn": superHorn,
    "boo": boo,
    "blooper": blooper,
    "feather": feather,
    "super-star": superStar,
    "lightning": lightning,
    "kamek": kamek,
    "dash-food": dashFood,
    "player": player,
    "enemy": enemy,
    // a few fallbacks just in case
    'banana': itemBox,
    'coin-shell': itemBox,
};
