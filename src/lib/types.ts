export type ItemType = 'item-box' | 'banana' | 'mushroom' | 'shell';

export interface CanvasItem {
  id: number;
  type: ItemType;
  x: number;
  y: number;
  rotation: number;
  scale: number;
}
