
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
import { Download, Trash2, RotateCw, Scaling, Upload, Pen, MousePointer, Eraser, Square, Circle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Slider } from "./ui/slider";
import { AVAILABLE_ITEMS, iconMap } from "./icon-map";
import logo from '../components/icons/Logo_ok.png';

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

export function KartographerClient({ initialLayouts }: KartographerClientProps) {
  const [items, setItems] = useState<CanvasItem[]>([]);
  const [lines, setLines] = useState<CanvasLine[]>([]);
  const [shapes, setShapes] = useState<CanvasShape[]>([]);
  const [layouts, setLayouts] = useState(initialLayouts);
  const [selectedLayout, setSelectedLayout] = useState(initialLayouts.length > 0 ? initialLayouts[0].image : '');
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [mode, setMode] = useState<'place' | 'draw'>('place');
  const [isDrawing, setIsDrawing] = useState(false);
  
  const [drawMode, setDrawMode] = useState<DrawMode>('freehand');
  const [drawColor, setDrawColor] = useState("#FF0000");
  const [strokeWidth, setStrokeWidth] = useState(5);
  const [strokeDash, setStrokeDash] = useState("none");
  const [drawingShape, setDrawingShape] = useState<CanvasShape | null>(null);

  const [interaction, setInteraction] = useState<{
    type: 'move' | 'scale' | 'rotate' | null;
    startEvent: MouseEvent | null;
    initialItem: CanvasItem | null;
  }>({ type: null, startEvent: null, initialItem: null });

  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    setLayouts(initialLayouts);
    if (!selectedLayout || !initialLayouts.some(l => l.image === selectedLayout)) {
        setSelectedLayout(initialLayouts.length > 0 ? initialLayouts[0].image : '');
    }
  }, [initialLayouts, selectedLayout]);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        const layoutNameFromFile = file.name.replace(/.[^/.]+$/, "");
        
        const createUniqueLayout = (currentLayouts: Layout[]) => {
          const existingNames = new Set(currentLayouts.map(l => l.name));
          let newLayoutName = layoutNameFromFile;
          let counter = 1;
          while (existingNames.has(newLayoutName)) {
            newLayoutName = `${layoutNameFromFile} (${counter})`;
            counter++;
          }
          return { name: newLayoutName, image: imageUrl, hint: "custom" };
        };

        setLayouts(prevLayouts => {
          const newLayout = createUniqueLayout(prevLayouts);
          const newLayoutsList = [...prevLayouts, newLayout];
          
          handleLayoutChange(newLayout.image);
          toast({ title: "Custom layout loaded!" });

          return newLayoutsList;
        });
      };
      reader.readAsDataURL(file);
    } else {
      toast({ variant: "destructive", title: "Invalid File", description: "Please select an image file." });
    }
  };

  const handleDragStart = (e: DragEvent, itemType: ItemType) => {
    if (mode !== 'place') return;
    e.dataTransfer.setData("application/kartographer-item", itemType);
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    if(mode === 'place') {
      e.dataTransfer.dropEffect = "copy";
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    if(mode !== 'place') return;
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
    if (e.target === canvasRef.current || (e.target as HTMLElement).tagName === 'svg' || (e.target as HTMLElement).tagName === 'path') {
      setSelectedItem(null);
    }
  };
  
  const handleItemMouseDown = (e: React.MouseEvent, itemId: number, type: 'move' | 'scale' | 'rotate') => {
    if (mode !== 'place') return;
    e.stopPropagation();
    e.preventDefault();
    setSelectedItem(itemId);
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    
    const nativeEvent = e.nativeEvent;
    
    setInteraction({ type, startEvent: nativeEvent, initialItem: item });
  };
  
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDrawing && !interaction.type) return;

    if (isDrawing && canvasRef.current && mode === 'draw') {
        const canvasRect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - canvasRect.left;
        const y = e.clientY - canvasRect.top;

        if (drawMode === 'freehand') {
            setLines(prevLines => {
                const newLines = [...prevLines];
                newLines[newLines.length - 1].points.push({ x, y });
                return newLines;
            });
        } else if (drawingShape) {
            setDrawingShape(prev => {
                if (!prev) return null;
                const newShape = { ...prev };
                newShape.endX = x;
                newShape.endY = y;
                return newShape;
            });
        }
    } else if (interaction.type && canvasRef.current && mode === 'place') {
      if (!interaction.startEvent || !interaction.initialItem) return;
    
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
    }
  }, [interaction, mode, isDrawing, drawMode, drawingShape]);
  
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (mode !== 'draw' || !canvasRef.current) return;
    setIsDrawing(true);
    setSelectedItem(null);

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - canvasRect.left;
    const y = e.clientY - canvasRect.top;

    if (drawMode === 'freehand') {
        const newLine: CanvasLine = {
          id: Date.now(),
          points: [{ x, y }],
          color: drawColor,
          strokeWidth: strokeWidth,
          strokeDasharray: strokeDash === 'dashed' ? '10,10' : strokeDash === 'dotted' ? '2,8' : 'none',
        };
        setLines(prev => [...prev, newLine]);
    } else {
        const newShape: CanvasShape = {
            id: Date.now(),
            type: drawMode,
            startX: x, startY: y, endX: x, endY: y,
            color: drawColor,
            strokeWidth: strokeWidth,
            strokeDasharray: strokeDash === 'dashed' ? '10,10' : strokeDash === 'dotted' ? '2,8' : 'none',
        };
        setDrawingShape(newShape);
    }
  };
  
  const handleCanvasMouseUp = () => {
    if (mode === 'draw') {
        setIsDrawing(false);
        if (drawingShape) {
            setShapes(prev => [...prev, drawingShape]);
            setDrawingShape(null);
        }
    }
  };

  const handleMouseUp = useCallback(() => {
    if (mode === 'place') {
      setInteraction({ type: null, startEvent: null, initialItem: null });
    }
  }, [mode]);

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
  
  const handleLayoutChange = (newLayoutImage: string) => {
    setSelectedLayout(newLayoutImage);
    setItems([]);
    setLines([]);
    setShapes([]);
  };

  const clearCanvas = () => {
    setItems([]);
    setLines([]);
    setShapes([]);
    toast({ title: "Canvas Cleared", description: "Ready for a fresh start!" });
  };
  
  const strokeStyles = [
    { name: 'Solid', value: 'none' },
    { name: 'Dashed', value: 'dashed' },
    { name: 'Dotted', value: 'dotted' },
  ];
  
  const allShapes = [...shapes, ...(drawingShape ? [drawingShape] : [])];

  const renderItemIcon = (type: ItemType, name: string) => {
    if (type === 'player') {
      return (
        <div className="w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded-full font-bold text-lg">P</div>
      );
    }
    if (type === 'enemy') {
      return (
        <div className="w-8 h-8 flex items-center justify-center bg-red-500 text-white rounded-full font-bold text-lg">E</div>
      );
    }
    return (
      <Image
        src={iconMap[type]}
        alt={name}
        width={32}
        height={32}
        className="object-contain"
        unoptimized
      />
    );
  };

  const renderCanvasItem = (item: CanvasItem) => {
    if (item.type === 'player') {
      return (
        <div className="w-full h-full flex items-center justify-center bg-blue-500 text-white rounded-full font-bold text-2xl" style={{ transform: `scale(${item.scale})` }}>
          P
        </div>
      );
    }
    if (item.type === 'enemy') {
      return (
        <div className="w-full h-full flex items-center justify-center bg-red-500 text-white rounded-full font-bold text-2xl" style={{ transform: `scale(${item.scale})` }}>
          E
        </div>
      );
    }
    const itemData = AVAILABLE_ITEMS.find(i => i.type === item.type);
    if (!itemData) return null;
    return (
      <Image
        src={iconMap[itemData.type]}
        alt={itemData.name}
        className="object-contain"
        style={{ transform: `scale(${item.scale})` }}
        layout="fill"
        unoptimized
      />
    );
  };

  return (
    <TooltipProvider>
      <div className="flex h-screen w-full bg-background font-headline text-foreground overflow-hidden">
        <aside className="w-[320px] h-full bg-card border-r border-border flex flex-col p-4 shadow-lg">
          <div className="flex items-center mb-4 space-x-2">
            <Image src={logo} alt="MKW Chalkboard Logo" width={55} height={55} unoptimized />
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-primary whitespace-nowrap">MKW Chalkboard</h1>
              <p className="text-xs text-muted-foreground whitespace-nowrap">mario kart world track planner</p>
            </div>
          </div>
          <Separator />
          <div className="flex-grow overflow-y-auto py-4 pr-2">
            <Card className="mb-4 bg-transparent border-border">
              <CardHeader className="p-4">
                <CardTitle className="text-lg">Track Layouts</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-4">
                <Select value={selectedLayout} onValueChange={handleLayoutChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a layout" />
                  </SelectTrigger>
                  <SelectContent>
                    {layouts.map(layout => (
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
            <Card className="mb-4 bg-transparent border-border">
              <CardHeader className="p-4">
                <CardTitle className="text-lg">Tools</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-4">
                 <div className="grid grid-cols-2 gap-2">
                    <Button variant={mode === 'place' ? 'default' : 'outline'} onClick={() => setMode('place')}>
                      <MousePointer className="mr-2"/> Place
                    </Button>
                    <Button variant={mode === 'draw' ? 'default' : 'outline'} onClick={() => setMode('draw')}>
                      <Pen className="mr-2"/> Draw
                    </Button>
                  </div>
                  <Button variant="outline" className="w-full" onClick={clearCanvas}>
                    <Eraser className="mr-2 h-4 w-4" />
                    Clear Canvas
                  </Button>
                   {mode === 'draw' && (
                    <div className="space-y-4 pt-4 border-t border-border">
                      <div className="grid grid-cols-4 gap-2">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant={drawMode === 'freehand' ? 'secondary' : 'ghost'} size="icon" onClick={() => setDrawMode('freehand')}><Pen/></Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Freehand</p></TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant={drawMode === 'rectangle' ? 'secondary' : 'ghost'} size="icon" onClick={() => setDrawMode('rectangle')}><Square/></Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Rectangle</p></TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant={drawMode === 'circle' ? 'secondary' : 'ghost'} size="icon" onClick={() => setDrawMode('circle')}><Circle/></Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Circle</p></TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant={drawMode === 'arrow' ? 'secondary' : 'ghost'} size="icon" onClick={() => setDrawMode('arrow')}><ArrowRight/></Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Arrow</p></TooltipContent>
                        </Tooltip>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Color</label>
                        <Input type="color" value={drawColor} onChange={(e) => setDrawColor(e.target.value)} className="p-1 h-10" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Style</label>
                        <Select value={strokeDash} onValueChange={setStrokeDash}>
                          <SelectTrigger><SelectValue/></SelectTrigger>
                          <SelectContent>
                            {strokeStyles.map(style => (
                              <SelectItem key={style.value} value={style.value}>{style.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Thickness: {strokeWidth}px</label>
                        <Slider value={[strokeWidth]} onValueChange={([val]) => setStrokeWidth(val)} min={1} max={50} step={1} />
                      </div>
                    </div>
                  )}
              </CardContent>
            </Card>
            <Card className="bg-transparent border-border">
              <CardHeader className="p-4">
                <CardTitle className="text-lg">Items</CardTitle>
              </CardHeader>
              <CardContent className={cn("p-4 pt-0 grid grid-cols-3 gap-4", mode !== 'place' && "opacity-50 pointer-events-none")}>
                {AVAILABLE_ITEMS.map(({ type, name }) => (
                  <Tooltip key={type}>
                    <TooltipTrigger asChild>
                      <div
                        draggable
                        onDragStart={(e) => handleDragStart(e, type)}
                        className="p-2 border border-dashed border-border rounded-lg flex flex-col items-center justify-center aspect-square cursor-grab active:cursor-grabbing transition-all hover:bg-primary/10 hover:shadow-md"
                      >
                         <div className="w-8 h-8 flex items-center justify-center">
                           {renderItemIcon(type, name)}
                         </div>
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
                onMouseDown={handleCanvasMouseDown}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseUp}
                className={cn(
                  "w-full h-full rounded-lg shadow-inner relative overflow-hidden border border-border",
                  mode === 'draw' ? 'cursor-crosshair' : 'cursor-default'
                )}
                style={{
                  backgroundImage: `url(${selectedLayout})`,
                  backgroundSize: "contain",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
                data-ai-hint={layouts.find(l => l.image === selectedLayout)?.hint}
            >
                <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{
                    width: '100%',
                    height: '100%',
                }}>
                  {lines.map(line => (
                    <path
                      key={line.id}
                      d={line.points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')}
                      stroke={line.color}
                      strokeWidth={line.strokeWidth}
                      strokeDasharray={line.strokeDasharray}
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ))}
                  {allShapes.map(shape => {
                      const { id, type, startX, startY, endX, endY, color, strokeWidth, strokeDasharray } = shape;
                      if (type === 'rectangle') {
                          return <rect key={id} x={Math.min(startX, endX)} y={Math.min(startY, endY)} width={Math.abs(endX - startX)} height={Math.abs(endY - startY)} stroke={color} strokeWidth={strokeWidth} strokeDasharray={strokeDasharray} fill="none" />;
                      }
                      if (type === 'circle') {
                          const r = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
                          return <circle key={id} cx={startX} cy={startY} r={r} stroke={color} strokeWidth={strokeWidth} strokeDasharray={strokeDasharray} fill="none" />;
                      }
                      if (type === 'arrow') {
                          const angle = Math.atan2(endY - startY, endX - startX);
                          const arrowLength = 15;
                          const arrowWidth = 5;
                          const p1 = { x: endX - arrowLength * Math.cos(angle - Math.PI / 6), y: endY - arrowLength * Math.sin(angle - Math.PI / 6) };
                          const p2 = { x: endX - arrowLength * Math.cos(angle + Math.PI / 6), y: endY - arrowLength * Math.sin(angle + Math.PI / 6) };
                          return (
                              <g key={id} stroke={color} strokeWidth={strokeWidth} fill={color} strokeDasharray={strokeDasharray}>
                                  <line x1={startX} y1={startY} x2={endX} y2={endY} strokeLinecap="round" />
                                  <path d={`M ${endX} ${endY} L ${p1.x} ${p1.y} L ${p2.x} ${p2.y} Z`} />
                              </g>
                          );
                      }
                      return null;
                  })}
                </svg>

                {items.map(item => {
                    const isSelected = selectedItem === item.id;
                    const scaledItemSize = ITEM_SIZE;

                    return (
                        <div
                            key={item.id}
                            className={cn("absolute cursor-grab active:cursor-grabbing flex items-center justify-center", isSelected && "z-10")}
                            style={{
                                left: `${item.x}px`,
                                top: `${item.y}px`,
                                width: `${scaledItemSize}px`,
                                height: `${scaledItemSize}px`,
                                transform: `rotate(${item.rotation}deg)`,
                                transformOrigin: 'center center',
                            }}
                            onMouseDown={(e) => handleItemMouseDown(e, item.id, 'move')}
                        >
                            <div className={cn("w-full h-full relative group transition-all flex items-center justify-center", isSelected && "outline-2 outline-dashed outline-accent rounded-lg")}>
                                {renderCanvasItem(item)}
                                {isSelected && (
                                <TooltipProvider>
                                    <div 
                                        className="absolute -top-3 -left-3 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
                                        onMouseDown={(e) => e.stopPropagation()} onClick={(e) => deleteItem(e, item.id)}
                                        style={{transform: `scale(${1/item.scale})`}}
                                        >
                                        <Trash2 size={14} />
                                    </div>
                                    <div
                                        className="absolute -top-4 left-1/2 -translate-x-1/2 w-6 h-6 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center cursor-alias hover:scale-110 transition-transform"
                                        onMouseDown={(e) => handleItemMouseDown(e, item.id, 'rotate')}
                                        style={{transform: `scale(${1/item.scale})`}}
                                    ><RotateCw size={14} /></div>
                                    <div
                                        className="absolute -bottom-3 -right-3 w-6 h-6 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center cursor-nwse-resize hover:scale-110 transition-transform"
                                        onMouseDown={(e) => handleItemMouseDown(e, item.id, 'scale')}
                                        style={{transform: `scale(${1/item.scale})`}}
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
