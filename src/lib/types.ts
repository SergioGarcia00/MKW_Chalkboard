
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
  | 'dash-food'
  | 'coin-shell'
  | 'player'
  | 'enemy';

export interface CanvasItem {
  id: number;
  type: ItemType;
  x: number;
  y: number;
  rotation: number;
}

export interface CanvasLine {
  id: number;
  points: { x: number; y: number }[];
  color: string;
  strokeWidth: number;
  strokeDasharray: string;
}

export interface CanvasShape {
    id: number;
    type: 'rectangle' | 'circle' | 'arrow';
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    color: string;
    strokeWidth: number;
    strokeDasharray: string;
}

    
