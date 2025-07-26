export type ItemType =
  | 'item-box'
  | 'banana'
  | 'mushroom'
  | 'golden-mushroom'
  | 'mega-mushroom'
  | 'shell'
  | 'red-shell'
  | 'blue-shell'
  | 'fire-flower'
  | 'ice-flower'
  | 'boomerang-flower'
  | 'bullet-bill'
  | 'bob-omb'
  | 'hammer'
  | 'super-horn'
  | 'coin'
  | 'boo'
  | 'blooper'
  | 'feather'
  | 'super-star'
  | 'lightning'
  | 'kamek'
  | 'dash-food';

export interface CanvasItem {
  id: number;
  type: ItemType;
  x: number;
  y: number;
  rotation: number;
  scale: number;
}
