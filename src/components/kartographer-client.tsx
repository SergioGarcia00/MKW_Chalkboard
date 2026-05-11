
"use client";

import React, { useState, useRef, useEffect, useCallback, DragEvent, ChangeEvent } from "react";
import html2canvas from "html2canvas";
import { useToast } from "@/hooks/use-toast";
import type { CanvasItem, ItemType, CanvasLine, CanvasShape } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Download, Trash2, RotateCw, Upload, Pen, MousePointer, Eraser, Square, Circle, ArrowRight, Save, FileUp, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Slider } from "./ui/slider";
import { AVAILABLE_ITEMS, iconMap } from "./icon-map";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";

type Layout = {
  name: string;
  image: string;
  hint: string;
};

interface KartographerClientProps {
  initialLayouts: Layout[];
}

const ITEM_SIZE = 48;
type DrawMode = 'freehand' | 'rectangle' | 'circle' | 'arrow';
type InteractionMode = 'place' | 'draw';

export function KartographerClient({ initialLayouts }: KartographerClientProps) {
  const [items, setItems] = useState<CanvasItem[]>([]);
  const [lines, setLines] = useState<CanvasLine[]>([]);
  const [shapes, setShapes] = useState<CanvasShape[]>([]);
  const [layouts, setLayouts] = useState(initialLayouts);
  const [selectedLayout, setSelectedLayout] = useState(initialLayouts.length > 0 ? initialLayouts[0].image : '');
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [selectedItemForPlacement, setSelectedItemForPlacement] = useState<ItemType | null>(null);
  
  const [mode, setMode] = useState<InteractionMode>('place');
  const [isDrawing, setIsDrawing] = useState(false);
  
  const [drawMode, setDrawMode] = useState<DrawMode>('freehand');
  const [drawColor, setDrawColor] = useState("#FF0000");
  const [strokeWidth, setStrokeWidth] = useState(5);
  const [strokeDash, setStrokeDash] = useState("none");
  const [drawingShape, setDrawingShape] = useState<CanvasShape | null>(null);

  const [interaction, setInteraction] = useState<{
    type: 'move' | 'rotate' | null;
    startEvent: MouseEvent | TouchEvent | null;
    initialItem: CanvasItem | null;
  }>({ type: null, startEvent: null, initialItem: null });

  const canvasRef = useRef<HTMLDivElement>(null);
  const layoutFileInputRef = useRef<HTMLInputElement>(null);
  const projectFileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    setLayouts(initialLayouts);
    if (!selectedLayout || !initialLayouts.some(l => l.image === selectedLayout)) {
        const newLayout = initialLayouts.length > 0 ? initialLayouts[0].image : '';
        setSelectedLayout(newLayout);
    }
  }, [initialLayouts, selectedLayout]);
  
  const handleLayoutImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        const newLayout = { name: file.name.replace(/.[^/.]+$/, ""), image: imageUrl, hint: "custom" };
        setLayouts(prev => [...prev, newLayout]);
        setSelectedLayout(imageUrl);
        toast({ title: "Custom layout loaded!" });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProject = () => {
    const projectData = { layout: selectedLayout, items, lines, shapes };
    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "kartographer-project.json";
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Project Saved!" });
  };

  const handleLoadProject = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const projectData = JSON.parse(event.target?.result as string);
          if (projectData.layout) setSelectedLayout(projectData.layout);
          if (projectData.items) setItems(projectData.items);
          if (projectData.lines) setLines(projectData.lines);
          if (projectData.shapes) setShapes(projectData.shapes);
          toast({ title: "Project Loaded!" });
        } catch (error) {
          toast({ variant: "destructive", title: "Load Failed" });
        }
      };
      reader.readAsText(file);
    }
  };
  
  const handleItemDragStart = (e: DragEvent, itemType: ItemType) => {
    e.dataTransfer.setData("application/reactflow", itemType);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    if (!canvasRef.current) return;
    const itemType = e.dataTransfer.getData("application/reactflow") as ItemType;
    if (!itemType) return;
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - canvasRect.left - ITEM_SIZE / 2;
    const y = e.clientY - canvasRect.top - ITEM_SIZE / 2;
    const newItem: CanvasItem = { id: Date.now(), type: itemType, x, y, rotation: 0 };
    setItems((prev) => [...prev, newItem]);
    setSelectedItem(newItem.id);
  };

  const getEventPosition = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    if ('touches' in e && e.touches.length > 0) return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
    if ('clientX' in e) return { clientX: e.clientX, clientY: e.clientY };
    return { clientX: 0, clientY: 0 };
  };

  const handleCanvasPointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    const target = e.target as HTMLElement;
    const { clientX, clientY } = getEventPosition(e);
    if (!canvasRef.current) return;
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const x = clientX - canvasRect.left;
    const y = clientY - canvasRect.top;

    if (mode === 'place' && selectedItemForPlacement) {
      const newItem: CanvasItem = { id: Date.now(), type: selectedItemForPlacement, x: x - ITEM_SIZE / 2, y: y - ITEM_SIZE / 2, rotation: 0 };
      setItems((prev) => [...prev, newItem]);
      setSelectedItem(newItem.id);
    } else if (mode === 'draw') {
        setIsDrawing(true);
        if (drawMode === 'freehand') {
            const newLine: CanvasLine = { id: Date.now(), points: [{ x, y }], color: drawColor, strokeWidth, strokeDasharray: strokeDash === 'dashed' ? '10,10' : strokeDash === 'dotted' ? '2,8' : 'none' };
            setLines(prev => [...prev, newLine]);
        } else {
            setDrawingShape({ id: Date.now(), type: drawMode, startX: x, startY: y, endX: x, endY: y, color: drawColor, strokeWidth, strokeDasharray: strokeDash === 'dashed' ? '10,10' : strokeDash === 'dotted' ? '2,8' : 'none' });
        }
    } else if (!target.closest('.item-wrapper')) {
      setSelectedItem(null);
    }
  };
  
  const handlePointerMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDrawing && !interaction.type) return;
    const { clientX, clientY } = getEventPosition(e);
    if (!canvasRef.current) return;
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const x = clientX - canvasRect.left;
    const y = clientY - canvasRect.top;

    if (isDrawing && mode === 'draw') {
        if (drawMode === 'freehand') {
            setLines(prev => {
                const updated = [...prev];
                if (updated.length > 0) updated[updated.length - 1].points.push({ x, y });
                return updated;
            });
        } else if (drawingShape) {
            setDrawingShape(prev => prev ? { ...prev, endX: x, endY: y } : null);
        }
    } else if (interaction.type && interaction.initialItem) {
      setItems(prev => prev.map(item => {
          if (item.id !== interaction.initialItem!.id) return item;
          if (interaction.type === 'move') {
              const { clientX: startX, clientY: startY } = getEventPosition(interaction.startEvent!);
              return { ...item, x: interaction.initialItem!.x + (clientX - startX), y: interaction.initialItem!.y + (clientY - startY) };
          } else {
              const angle = Math.atan2(y - (item.y + ITEM_SIZE / 2), x - (item.x + ITEM_SIZE / 2)) * (180 / Math.PI) + 90;
              return { ...item, rotation: angle };
          }
      }));
    }
  }, [isDrawing, interaction, mode, drawMode, drawingShape, strokeWidth, drawColor, strokeDash]);
  
  const handlePointerUp = useCallback(() => {
    if (isDrawing && drawingShape) {
        setShapes(prev => [...prev, drawingShape]);
        setDrawingShape(null);
    }
    setIsDrawing(false);
    setInteraction({ type: null, startEvent: null, initialItem: null });
  }, [isDrawing, drawingShape]);

  useEffect(() => {
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('touchmove', handlePointerMove, { passive: false });
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchend', handlePointerUp);
    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  const exportAsImage = (format: 'png' | 'jpeg') => {
    if (canvasRef.current) {
      setSelectedItem(null);
      setTimeout(() => {
        html2canvas(canvasRef.current!, { useCORS: true }).then(canvas => {
          const link = document.createElement("a");
          link.download = `kartographer-layout.${format}`;
          link.href = canvas.toDataURL(`image/${format}`);
          link.click();
        });
      }, 100);
    }
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col w-full h-screen bg-background overflow-hidden">
        <div className="flex-1 relative p-4 pb-48">
          <div
            ref={canvasRef}
            onMouseDown={handleCanvasPointerDown}
            onTouchStart={handleCanvasPointerDown}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="w-full h-full rounded-lg shadow-inner relative overflow-hidden border border-border"
            style={{ backgroundImage: `url(${selectedLayout})`, backgroundSize: "contain", backgroundPosition: "center", backgroundRepeat: "no-repeat" }}
          >
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {lines.map(line => (
                <path key={line.id} d={line.points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')} stroke={line.color} strokeWidth={line.strokeWidth} strokeDasharray={line.strokeDasharray} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              ))}
              {[...shapes, ...(drawingShape ? [drawingShape] : [])].map(shape => {
                const { id, type, startX, startY, endX, endY, color, strokeWidth, strokeDasharray } = shape;
                if (type === 'rectangle') return <rect key={id} x={Math.min(startX, endX)} y={Math.min(startY, endY)} width={Math.abs(endX - startX)} height={Math.abs(endY - startY)} stroke={color} strokeWidth={strokeWidth} strokeDasharray={strokeDasharray} fill="none" />;
                if (type === 'circle') return <circle key={id} cx={startX} cy={startY} r={Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2))} stroke={color} strokeWidth={strokeWidth} strokeDasharray={strokeDasharray} fill="none" />;
                if (type === 'arrow') {
                  const angle = Math.atan2(endY - startY, endX - startX);
                  const p1 = { x: endX - 15 * Math.cos(angle - Math.PI / 6), y: endY - 15 * Math.sin(angle - Math.PI / 6) };
                  const p2 = { x: endX - 15 * Math.cos(angle + Math.PI / 6), y: endY - 15 * Math.sin(angle + Math.PI / 6) };
                  return <g key={id} stroke={color} strokeWidth={strokeWidth} fill={color}><line x1={startX} y1={startY} x2={endX} y2={endY} /><path d={`M ${endX} ${endY} L ${p1.x} ${p1.y} L ${p2.x} ${p2.y} Z`} /></g>;
                }
                return null;
              })}
            </svg>
            {items.map(item => (
              <div key={item.id} className="absolute flex items-center justify-center item-wrapper" style={{ left: item.x, top: item.y, width: ITEM_SIZE, height: ITEM_SIZE, transform: `rotate(${item.rotation}deg)` }} onMouseDown={(e) => { e.stopPropagation(); setInteraction({ type: 'move', startEvent: e.nativeEvent, initialItem: item }); setSelectedItem(item.id); }}>
                <div className={cn("w-full h-full relative flex items-center justify-center", selectedItem === item.id && "ring-2 ring-primary ring-offset-2 rounded-lg")}>
                  {item.type === 'player' ? <div className="w-full h-full bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">P</div> : item.type === 'enemy' ? <div className="w-full h-full bg-red-500 text-white rounded-full flex items-center justify-center font-bold">E</div> : <Image src={iconMap[item.type]} alt={item.type} fill className="object-contain" unoptimized />}
                  {selectedItem === item.id && (
                    <>
                      <button className="absolute -top-4 -left-4 w-6 h-6 bg-destructive text-white rounded-full flex items-center justify-center" onClick={(e) => { e.stopPropagation(); setItems(prev => prev.filter(i => i.id !== item.id)); setSelectedItem(null); }}><Trash2 size={12}/></button>
                      <button className="absolute -top-4 -right-4 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center" onMouseDown={(e) => { e.stopPropagation(); setInteraction({ type: 'rotate', startEvent: e.nativeEvent, initialItem: item }); }}><RotateCw size={12}/></button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-2 z-50">
          <div className="flex items-center gap-2 mb-2">
            <Sheet>
              <SheetTrigger asChild><Button variant="outline" size="icon"><Menu/></Button></SheetTrigger>
              <SheetContent side="bottom" className="h-auto">
                <SheetHeader><SheetTitle>Project Management</SheetTitle></SheetHeader>
                <div className="grid grid-cols-2 gap-4 p-4">
                  <Button onClick={handleSaveProject}><Save className="mr-2 h-4 w-4"/> Save JSON</Button>
                  <Button variant="outline" onClick={() => projectFileInputRef.current?.click()}><FileUp className="mr-2 h-4 w-4"/> Load JSON</Button>
                  <Button variant="secondary" onClick={() => exportAsImage('png')}><Download className="mr-2 h-4 w-4"/> Export PNG</Button>
                  <Button variant="secondary" onClick={() => exportAsImage('jpeg')}><Download className="mr-2 h-4 w-4"/> Export JPG</Button>
                  <Button variant="ghost" onClick={() => layoutFileInputRef.current?.click()} className="col-span-2"><Upload className="mr-2 h-4 w-4"/> Import Custom Map</Button>
                  <input type="file" ref={projectFileInputRef} hidden accept=".json" onChange={handleLoadProject} />
                  <input type="file" ref={layoutFileInputRef} hidden accept="image/*" onChange={handleLayoutImageUpload} />
                </div>
              </SheetContent>
            </Sheet>
            <Select value={selectedLayout} onValueChange={setSelectedLayout}>
              <SelectTrigger className="flex-1"><SelectValue placeholder="Map" /></SelectTrigger>
              <SelectContent>{layouts.map(l => <SelectItem key={l.name} value={l.image}>{l.name}</SelectItem>)}</SelectContent>
            </Select>
            <Button variant={mode === 'place' ? 'default' : 'outline'} onClick={() => { setMode('place'); setSelectedItemForPlacement(null); }}><MousePointer className="mr-2 h-4 w-4"/> Place</Button>
            <Button variant={mode === 'draw' ? 'default' : 'outline'} onClick={() => setMode('draw')}><Pen className="mr-2 h-4 w-4"/> Draw</Button>
            <Button variant="outline" size="icon" onClick={() => { setLines([]); setShapes([]); setItems([]); }}><Eraser/></Button>
          </div>
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-2 p-1">
              {mode === 'place' ? AVAILABLE_ITEMS.map(item => (
                <div key={item.type} draggable onDragStart={(e) => handleItemDragStart(e, item.type)} onClick={() => setSelectedItemForPlacement(item.type)} className={cn("p-2 min-w-[72px] h-[72px] border rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all", selectedItemForPlacement === item.type ? "bg-primary/20 ring-2 ring-primary" : "hover:bg-accent")}>
                  <div className="relative w-8 h-8">{item.type === 'player' ? 'P' : item.type === 'enemy' ? 'E' : <Image src={iconMap[item.type]} alt={item.name} fill className="object-contain" unoptimized />}</div>
                  <span className="text-[10px] mt-1 text-center truncate w-full">{item.name}</span>
                </div>
              )) : (
                <div className="flex items-center gap-4 p-2 bg-muted/30 rounded-lg w-full">
                  <div className="flex gap-1">
                    {(['freehand', 'rectangle', 'circle', 'arrow'] as DrawMode[]).map(m => (
                      <Button key={m} variant={drawMode === m ? 'secondary' : 'ghost'} size="icon" onClick={() => setDrawMode(m)}>
                        {m === 'freehand' && <Pen size={16}/>} {m === 'rectangle' && <Square size={16}/>} {m === 'circle' && <Circle size={16}/>} {m === 'arrow' && <ArrowRight size={16}/>}
                      </Button>
                    ))}
                  </div>
                  <Separator orientation="vertical" className="h-8"/>
                  <Input type="color" value={drawColor} onChange={(e) => setDrawColor(e.target.value)} className="w-12 h-8 p-1 cursor-pointer" />
                  <Separator orientation="vertical" className="h-8"/>
                  <div className="flex-1 flex items-center gap-2 min-w-[120px]">
                    <span className="text-xs">{strokeWidth}px</span>
                    <Slider value={[strokeWidth]} onValueChange={([v]) => setStrokeWidth(v)} min={1} max={20} />
                  </div>
                  <Separator orientation="vertical" className="h-8"/>
                  <Select value={strokeDash} onValueChange={setStrokeDash}>
                    <SelectTrigger className="w-24 h-8"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="none">Solid</SelectItem><SelectItem value="dashed">Dash</SelectItem><SelectItem value="dotted">Dot</SelectItem></SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </div>
    </TooltipProvider>
  );
}
