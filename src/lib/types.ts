
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
  | 'custom-icon'
  | 'player'
  | 'enemy';

export interface CanvasItem {
  id: number;
  type: ItemType;
  x: number;
  y: number;
  rotation: number;
  scale?: number;
  customSrc?: string;
  customName?: string;
  name?: string;
  locked?: boolean;
  opacity?: number;
  zIndex?: number;
  groupId?: number;
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

export interface CanvasText {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
  fontSize: number;
  rotation: number;
  bold?: boolean;
  background?: string;
  align?: 'left' | 'center' | 'right';
  locked?: boolean;
  zIndex?: number;
  groupId?: number;
}

export interface CanvasMarker {
  id: number;
  x: number;
  y: number;
  title: string;
  description: string;
  color: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  status?: 'pending' | 'reviewed' | 'ready';
  locked?: boolean;
  label?: string;
}

export interface CanvasMeasurement {
  id: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color: string;
}

export interface CanvasHeatZone {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  opacity: number;
}

export interface CanvasRoute {
  id: number;
  name: string;
  color: string;
  visible: boolean;
  points: { x: number; y: number }[];
}

    
