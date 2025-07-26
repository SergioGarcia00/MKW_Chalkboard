
"use client";

import React, { useState, useRef, useEffect, useCallback, DragEvent, ChangeEvent } from "react";
import html2canvas from "html2canvas";
import { useToast } from "@/hooks/use-toast";
import type { CanvasItem, ItemType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  ItemBoxIcon,
  BananaIcon,
  MushroomIcon,
  ShellIcon,
  GoldenMushroomIcon,
  MegaMushroomIcon,
  RedShellIcon,
  BlueShellIcon,
  FireFlowerIcon,
  IceFlowerIcon,
  BoomerangFlowerIcon,
  BulletBillIcon,
  BobOmbIcon,
  SuperHornIcon,
  CoinIcon,
  BooIcon,
  BlooperIcon,
  FeatherIcon,
  SuperStarIcon,
  LightningIcon,
  CoinShellIcon,
  HammerIcon,
  KamekIcon,
  DashFoodIcon,
} from "@/components/icons/mario-kart";
import { Download, Save, FolderOpen, Trash2, RotateCw, Scaling, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

const AVAILABLE_ITEMS = [
  { type: "item-box" as ItemType, name: "? Block", icon: ItemBoxIcon },
  { type: "banana" as ItemType, name: "Banana", icon: BananaIcon },
  { type: "mushroom" as ItemType, name: "Mushroom", icon: MushroomIcon },
  { type: "golden-mushroom" as ItemType, name: "Golden Mushroom", icon: GoldenMushroomIcon },
  { type: "mega-mushroom" as ItemType, name: "Mega Mushroom", icon: MegaMushroomIcon },
  { type: "shell" as ItemType, name: "Green Shell", icon: ShellIcon },
  { type: "red-shell" as ItemType, name: "Red Shell", icon: RedShellIcon },
  { type: "blue-shell" as ItemType, name: "Blue Shell", icon: BlueShellIcon },
  { type: "coin-shell" as ItemType, name: "Coin Shell", icon: CoinShellIcon },
  { type: "fire-flower" as ItemType, name: "Fire Flower", icon: FireFlowerIcon },
  { type: "ice-flower" as ItemType, name: "Ice Flower", icon: IceFlowerIcon },
  { type: "boomerang-flower" as ItemType, name: "Boomerang", icon: BoomerangFlowerIcon },
  { type: "bullet-bill" as ItemType, name: "Bullet Bill", icon: BulletBillIcon },
  { type: "bob-omb" as ItemType, name: "Bob-Omb", icon: BobOmbIcon },
  { type: "hammer" as ItemType, name: "Hammer", icon: HammerIcon },
  { type: "super-horn" as ItemType, name: "Super Horn", icon: SuperHornIcon },
  { type: "coin" as ItemType, name: "Coin", icon: CoinIcon },
  { type: "boo" as ItemType, name: "Boo", icon: BooIcon },
  { type: "blooper" as ItemType, name: "Blooper", icon: BlooperIcon },
  { type: "feather" as ItemType, name: "Feather", icon: FeatherIcon },
  { type: "super-star" as ItemType, name: "Super Star", icon: SuperStarIcon },
  { type: "lightning" as ItemType, name: "Lightning", icon: LightningIcon },
  { type: "kamek" as ItemType, name: "Kamek", icon: KamekIcon },
  { type: "dash-food" as ItemType, name: "Dash Food", icon: DashFoodIcon },
];

const LAYOUTS = [
  { name: "Moo Moo Meadows", image: "https://placehold.co/1024x768.png", hint: "grassy field" },
  { name: "Rainbow Road", image: "https://placehold.co/1024x768.png", hint: "rainbow space" },
  { name: "Bowser's Castle", image: "https://placehold.co/1024x768.png", hint: "lava castle" },
  { name: "DK Jungle", image: "https://placehold.co/1024x768.png", hint: "jungle ruins" },
];

const ITEM_SIZE = 48;

export function KartographerClient() {
  const [items, setItems] = useState<CanvasItem[]>([]);
  const [selectedLayout, setSelectedLayout] = useState(LAYOUTS[0].image);
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [interaction, setInteraction] = useState<{
    type: 'move' | 'scale' | 'rotate' | null;
    startEvent: MouseEvent | null;
    initialItem: CanvasItem | null;
  }>({ type: null, startEvent: null, initialItem: null });

  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        setSelectedLayout(imageUrl);
        toast({ title: "Custom layout loaded!" });
      };
      reader.readAsDataURL(file);
    } else {
      toast({ variant: "destructive", title: "Invalid File", description: "Please select an image file." });
    }
  };

  const handleDragStart = (e: DragEvent, itemType: ItemType) => {
    e.dataTransfer.setData("application/kartographer-item", itemType);
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    const itemType = e.dataTransfer.getData("application/kartographer-item") as ItemType;
    if (!itemType || !canvasRef.current) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - canvasRect.left - ITEM_SIZE / 2;
    const y = e.clientY - canvasRect.top - ITEM_SIZE / 2;

    const newItem: CanvasItem = {
      id: Date.now(),
      type: itemType,
      x, y,
      rotation: 0,
      scale: 1,
    };
    setItems((prev) => [...prev, newItem]);
    setSelectedItem(newItem.id);
  };
  
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      setSelectedItem(null);
    }
  };
  
  const handleItemMouseDown = (e: React.MouseEvent, itemId: number, type: 'move' | 'scale' | 'rotate') => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedItem(itemId);
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    
    const nativeEvent = e.nativeEvent;
    
    setInteraction({ type, startEvent: nativeEvent, initialItem: item });
  };
  
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!interaction.type || !interaction.startEvent || !interaction.initialItem || !canvasRef.current) return;
    
    e.preventDefault();
    
    const { type, startEvent, initialItem } = interaction;
    const canvasRect = canvasRef.current.getBoundingClientRect();

    setItems(prevItems => prevItems.map(item => {
        if (item.id !== initialItem.id) return item;

        const updatedItem = { ...item };
        const itemCenterX = item.x + (ITEM_SIZE * item.scale) / 2;
        const itemCenterY = item.y + (ITEM_SIZE * item.scale) / 2;

        if (type === 'move') {
            updatedItem.x = initialItem.x + (e.pageX - startEvent.pageX);
            updatedItem.y = initialItem.y + (e.pageY - startEvent.pageY);
        } else if (type === 'rotate') {
            const angle = Math.atan2(e.clientY - canvasRect.top - itemCenterY, e.clientX - canvasRect.left - itemCenterX) * (180 / Math.PI) + 90;
            updatedItem.rotation = angle;
        } else if (type === 'scale') {
            const initialDist = Math.sqrt(Math.pow(startEvent.clientX - canvasRect.left - itemCenterX, 2) + Math.pow(startEvent.clientY - canvasRect.top - itemCenterY, 2));
            const currentDist = Math.sqrt(Math.pow(e.clientX - canvasRect.left - itemCenterX, 2) + Math.pow(e.clientY - canvasRect.top - itemCenterY, 2));
            const scaleFactor = currentDist / initialDist;
            updatedItem.scale = Math.max(0.2, initialItem.scale * scaleFactor);
        }
        return updatedItem;
    }));
  }, [interaction]);

  const handleMouseUp = useCallback(() => {
    setInteraction({ type: null, startEvent: null, initialItem: null });
  }, []);

  const deleteItem = (e: React.MouseEvent, itemId: number) => {
    e.stopPropagation();
    setItems(items.filter(i => i.id !== itemId));
    setSelectedItem(null);
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const saveLayout = () => {
    try {
      const data = JSON.stringify({ items, selectedLayout });
      localStorage.setItem("kartographer-save", data);
      toast({ title: "Layout Saved!", description: "Your masterpiece is safe and sound." });
    } catch (error) {
      toast({ variant: "destructive", title: "Uh oh!", description: "Could not save layout." });
    }
  };

  const loadLayout = () => {
    try {
      const savedData = localStorage.getItem("kartographer-save");
      if (savedData) {
        const { items, selectedLayout } = JSON.parse(savedData);
        setItems(items);
        setSelectedLayout(selectedLayout);
        toast({ title: "Layout Loaded!", description: "Let's get back to creating." });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Oops!", description: "Could not load saved layout." });
    }
  };
  
  const exportAsImage = (format: 'png' | 'jpeg') => {
    if (canvasRef.current) {
      setSelectedItem(null);
      setTimeout(() => {
        html2canvas(canvasRef.current!, { backgroundColor: null, useCORS: true }).then(canvas => {
          const link = document.createElement("a");
          link.download = `kartographer-layout.${format}`;
          link.href = canvas.toDataURL(`image/${format}`);
          link.click();
        });
      }, 100);
    }
  };

  useEffect(() => {
    loadLayout();
  }, []);

  return (
    <TooltipProvider>
      <div className="flex h-screen w-full bg-background font-headline text-foreground overflow-hidden">
        <aside className="w-[320px] h-full bg-white/50 border-r border-primary/20 flex flex-col p-4 shadow-lg">
          <h1 className="text-3xl font-bold text-primary text-center">Kartographer</h1>
          <p className="text-center text-sm text-muted-foreground mb-4">Build your dream track!</p>
          <Separator />
          <div className="flex-grow overflow-y-auto py-4 pr-2">
            <Card className="mb-4 bg-transparent border-primary/30">
              <CardHeader className="p-4">
                <CardTitle className="text-lg">Track Layouts</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-4">
                <Select value={selectedLayout} onValueChange={setSelectedLayout}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a layout" />
                  </SelectTrigger>
                  <SelectContent>
                    {LAYOUTS.map(layout => (
                      <SelectItem key={layout.name} value={layout.image}>{layout.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                 <Input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleImageUpload}
                />
                <Button variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="mr-2 h-4 w-4" />
                  Import Custom
                </Button>
              </CardContent>
            </Card>
            <Card className="bg-transparent border-primary/30">
              <CardHeader className="p-4">
                <CardTitle className="text-lg">Items</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 grid grid-cols-3 gap-4">
                {AVAILABLE_ITEMS.map(({ type, name, icon: Icon }) => (
                  <Tooltip key={type}>
                    <TooltipTrigger asChild>
                      <div
                        draggable
                        onDragStart={(e) => handleDragStart(e, type)}
                        className="p-2 border border-dashed border-primary/50 rounded-lg flex flex-col items-center justify-center aspect-square cursor-grab active:cursor-grabbing transition-all hover:bg-primary/10 hover:shadow-md"
                      >
                        <Icon className="w-8 h-8" />
                        <span className="text-xs text-center mt-1">{name}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Drag to add {name}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </CardContent>
            </Card>
          </div>
          <Separator />
          <div className="pt-4 space-y-2">
            <div className="flex gap-2">
              <Button onClick={saveLayout} className="w-full"><Save className="mr-2 h-4 w-4" /> Save</Button>
              <Button onClick={loadLayout} variant="secondary" className="w-full"><FolderOpen className="mr-2 h-4 w-4" /> Load</Button>
            </div>
            <div className="flex gap-2">
               <Button onClick={() => exportAsImage('png')} variant="outline" className="w-full"><Download className="mr-2 h-4 w-4" /> Export PNG</Button>
               <Button onClick={() => exportAsImage('jpeg')} variant="outline" className="w-full"><Download className="mr-2 h-4 w-4" /> Export JPG</Button>
            </div>
          </div>
        </aside>
        <main className="flex-1 h-full p-4">
            <div
                ref={canvasRef}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={handleCanvasClick}
                className="w-full h-full rounded-lg shadow-inner relative overflow-hidden border-4 border-white"
                style={{
                  backgroundImage: `url(${selectedLayout})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
                data-ai-hint={LAYOUTS.find(l => l.image === selectedLayout)?.hint}
            >
                {items.map(item => {
                    const ItemIcon = AVAILABLE_ITEMS.find(i => i.type === item.type)!.icon;
                    const isSelected = selectedItem === item.id;
                    return (
                        <div
                            key={item.id}
                            className={cn("absolute cursor-grab active:cursor-grabbing", isSelected && "z-10")}
                            style={{
                                left: `${item.x}px`,
                                top: `${item.y}px`,
                                width: `${ITEM_SIZE * item.scale}px`,
                                height: `${ITEM_SIZE * item.scale}px`,
                                transform: `rotate(${item.rotation}deg)`,
                            }}
                            onMouseDown={(e) => handleItemMouseDown(e, item.id, 'move')}
                        >
                            <div className={cn("w-full h-full relative group transition-all", isSelected && "outline-2 outline-dashed outline-accent rounded-lg")}>
                                <ItemIcon className="w-full h-full drop-shadow-lg" />
                                {isSelected && (
                                <TooltipProvider>
                                    <div 
                                        className="absolute -top-3 -left-3 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
                                        onMouseDown={(e) => e.stopPropagation()} onClick={(e) => deleteItem(e, item.id)}>
                                        <Trash2 size={14} />
                                    </div>
                                    <div
                                        className="absolute -top-4 left-1/2 -translate-x-1/2 w-6 h-6 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center cursor-alias hover:scale-110 transition-transform"
                                        onMouseDown={(e) => handleItemMouseDown(e, item.id, 'rotate')}
                                    ><RotateCw size={14} /></div>
                                    <div
                                        className="absolute -bottom-3 -right-3 w-6 h-6 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center cursor-nwse-resize hover:scale-110 transition-transform"
                                        onMouseDown={(e) => handleItemMouseDown(e, item.id, 'scale')}
                                    ><Scaling size={14} /></div>
                                </TooltipProvider>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </main>
      </div>
    </TooltipProvider>
  );
}

    