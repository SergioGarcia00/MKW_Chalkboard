
"use client";

import React, { useState, useRef, useEffect, useCallback, DragEvent, ChangeEvent } from "react";
import html2canvas from "html2canvas";
import { useToast } from "@/hooks/use-toast";
import type { CanvasItem, ItemType, CanvasLine, CanvasShape, CanvasText, CanvasMarker, CanvasMeasurement, CanvasHeatZone, CanvasRoute } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Download, Trash2, RotateCw, Upload, Pen, MousePointer, Eraser, Square, Circle, ArrowRight, Save, FileUp, Type, Copy, Undo2, RefreshCw, Redo2, Lock, Unlock, Eye, EyeOff, MapPin, Ruler, AlignCenter, AlignLeft, AlignRight, Bold } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Slider } from "./ui/slider";
import { AVAILABLE_ITEMS, iconMap } from "./icon-map";
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
type InteractionMode = 'place' | 'draw' | 'text' | 'marker' | 'measure' | 'pan' | 'erase' | 'heatmap' | 'route';
type Snapshot = {
  items: CanvasItem[];
  lines: CanvasLine[];
  shapes: CanvasShape[];
  texts: CanvasText[];
  markers: CanvasMarker[];
  measurements: CanvasMeasurement[];
  heatZones: CanvasHeatZone[];
  routes: CanvasRoute[];
};

type NoteItemLink = {
  itemId: number;
  label: string;
};

type Language = "es" | "en";

const uiText: Record<Language, Record<string, string>> = {
  es: {
    activeMode: "Modo activo",
    addSelectedObject: "Marcar objeto seleccionado",
    all: "Todo",
    autosave: "Autosave",
    category: "Categoria",
    clearDrawing: "Dibujo",
    clearItems: "Objetos",
    clearTexts: "Textos",
    color: "Color",
    customIcon: "Icono custom",
    description: "Descripcion",
    draw: "Dibujar",
    drawRoutes: "Dibujar rutas",
    erase: "Borrar",
    export: "Exportacion",
    generalNotes: "Apuntes generales",
    grid: "Cuadricula",
    gridExport: "Grid export",
    gridSize: "Tamano grid",
    history: "Historial",
    importMap: "Importar mapa",
    importPalette: "Import Paleta",
    items: "Items",
    layoutPlaceholder: "Mapa",
    line: "Linea",
    loadJson: "Cargar JSON",
    mapTrack: "Pista",
    marker: "Marker",
    markerDetails: "Detalles del marker",
    markerHint: "Pulsa el mapa para crear un marcador.",
    notes: "Apuntes",
    notesPlaceholder: "Escribe aqui tus apuntes generales de la pista...",
    notesPreviewEmpty: "Las referencias a objetos apareceran aqui.",
    objects: "Objetos",
    panel: "Panel",
    pan: "Mover mapa",
    place: "Colocar",
    placeObjects: "Colocar objetos",
    present: "Presentar",
    readOnly: "Read only",
    route: "Ruta",
    rotation: "Rotacion",
    saveJson: "Guardar JSON",
    saveRoute: "Guardar ruta",
    searchObject: "Buscar objeto...",
    selected: "Seleccionado",
    selectObject: "Elige un objeto abajo",
    solid: "Solida",
    snap: "Snap",
    size: "Tamano",
    text: "Texto",
    textToPlace: "Texto a colocar",
    theme: "Tema",
    title: "Titulo",
    validation: "Validacion",
    weapons: "Armas",
    zoom: "Zoom",
    noResults: "Sin resultados",
    noActions: "Sin acciones",
    routeHint: "Pulsa puntos en el mapa y guarda la ruta.",
    drawHint: "Arrastra desde la paleta o pulsa un objeto y luego toca el mapa.",
    measureHint: "Arrastra sobre el mapa para medir una distancia.",
    eraseHint: "Pulsa elementos en el mapa para borrar por capa.",
    heatHint: "Pulsa el mapa para pintar una zona de calor.",
  },
  en: {
    activeMode: "Active mode",
    addSelectedObject: "Tag selected object",
    all: "All",
    autosave: "Autosave",
    category: "Category",
    clearDrawing: "Drawing",
    clearItems: "Objects",
    clearTexts: "Texts",
    color: "Color",
    customIcon: "Custom icon",
    description: "Description",
    draw: "Draw",
    drawRoutes: "Draw routes",
    erase: "Erase",
    export: "Export",
    generalNotes: "General notes",
    grid: "Grid",
    gridExport: "Export grid",
    gridSize: "Grid size",
    history: "History",
    importMap: "Import map",
    importPalette: "Import palette",
    items: "Items",
    layoutPlaceholder: "Map",
    line: "Line",
    loadJson: "Load JSON",
    mapTrack: "Track",
    marker: "Marker",
    markerDetails: "Marker details",
    markerHint: "Click the map to create a marker.",
    notes: "Notes",
    notesPlaceholder: "Write your general track notes here...",
    notesPreviewEmpty: "Object references will appear here.",
    objects: "Objects",
    panel: "Panel",
    pan: "Pan",
    place: "Place",
    placeObjects: "Place objects",
    present: "Present",
    readOnly: "Read only",
    route: "Route",
    rotation: "Rotation",
    saveJson: "Save JSON",
    saveRoute: "Save route",
    searchObject: "Search object...",
    selected: "Selected",
    selectObject: "Choose an object below",
    solid: "Solid",
    snap: "Snap",
    size: "Size",
    text: "Text",
    textToPlace: "Text to place",
    theme: "Theme",
    title: "Title",
    validation: "Validation",
    weapons: "Weapons",
    zoom: "Zoom",
    noResults: "No results",
    noActions: "No actions",
    routeHint: "Click points on the map and save the route.",
    drawHint: "Drag from the palette or click an object, then click the map.",
    measureHint: "Drag on the map to measure a distance.",
    eraseHint: "Click elements on the map to erase by layer.",
    heatHint: "Click the map to paint a heat zone.",
  },
};

const legacyNoteReferencePattern = /\[\[item:(\d+)\|([^\]]+)\]\]/g;

const normalizeNoteText = (text: string) => text.replace(legacyNoteReferencePattern, "@$2");

const extractLegacyNoteLinks = (text: string): NoteItemLink[] => {
  const links: NoteItemLink[] = [];
  for (const match of text.matchAll(legacyNoteReferencePattern)) {
    links.push({ itemId: Number(match[1]), label: match[2] });
  }
  return links;
};

export function KartographerClient({ initialLayouts }: KartographerClientProps) {
  const [items, setItems] = useState<CanvasItem[]>([]);
  const [lines, setLines] = useState<CanvasLine[]>([]);
  const [shapes, setShapes] = useState<CanvasShape[]>([]);
  const [texts, setTexts] = useState<CanvasText[]>([]);
  const [markers, setMarkers] = useState<CanvasMarker[]>([]);
  const [measurements, setMeasurements] = useState<CanvasMeasurement[]>([]);
  const [heatZones, setHeatZones] = useState<CanvasHeatZone[]>([]);
  const [routes, setRoutes] = useState<CanvasRoute[]>([]);
  const [layouts, setLayouts] = useState(initialLayouts);
  const [selectedLayout, setSelectedLayout] = useState(initialLayouts.length > 0 ? initialLayouts[0].image : '');
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [selectedText, setSelectedText] = useState<number | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<number | null>(null);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectedItemForPlacement, setSelectedItemForPlacement] = useState<ItemType | null>(null);
  
  const [mode, setMode] = useState<InteractionMode>('place');
  const [isDrawing, setIsDrawing] = useState(false);
  
  const [drawMode, setDrawMode] = useState<DrawMode>('freehand');
  const [drawColor, setDrawColor] = useState("#FF0000");
  const [strokeWidth, setStrokeWidth] = useState(5);
  const [strokeDash, setStrokeDash] = useState("none");
  const [drawingShape, setDrawingShape] = useState<CanvasShape | null>(null);
  const [textDraft, setTextDraft] = useState("Callout");
  const [textColor, setTextColor] = useState("#111827");
  const [textSize, setTextSize] = useState(28);
  const [showGrid, setShowGrid] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [gridSize, setGridSize] = useState(32);
  const [paletteFilter, setPaletteFilter] = useState("");
  const [visibleLayers, setVisibleLayers] = useState({ items: true, drawing: true, texts: true, markers: true, measurements: true, heatmap: true, routes: true });
  const [lockedLayers, setLockedLayers] = useState({ items: false, drawing: false, texts: false, markers: false, measurements: false, heatmap: false, routes: false });
  const [history, setHistory] = useState<Snapshot[]>([]);
  const [future, setFuture] = useState<Snapshot[]>([]);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [measurementDraft, setMeasurementDraft] = useState<CanvasMeasurement | null>(null);
  const [customIcons, setCustomIcons] = useState<{ id: string; name: string; src: string }[]>([]);
  const [selectedCustomIcon, setSelectedCustomIcon] = useState<string | null>(null);
  const [itemCategory, setItemCategory] = useState("all");
  const [exportScale, setExportScale] = useState(1);
  const [exportGrid, setExportGrid] = useState(true);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [presentationMode, setPresentationMode] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [readOnly, setReadOnly] = useState(false);
  const [darkTheme, setDarkTheme] = useState(true);
  const [actionLog, setActionLog] = useState<string[]>([]);
  const [eraserLayer, setEraserLayer] = useState<'items' | 'drawing' | 'texts' | 'markers' | 'heatmap' | 'routes'>('items');
  const [validationMessages, setValidationMessages] = useState<string[]>([]);
  const [routeDraft, setRouteDraft] = useState<CanvasRoute | null>(null);
  const [activeRouteId, setActiveRouteId] = useState<number | null>(null);
  const [mapNotes, setMapNotes] = useState("");
  const [noteItemLinks, setNoteItemLinks] = useState<NoteItemLink[]>([]);
  const [exportOverlayVisible, setExportOverlayVisible] = useState(false);
  const [highlightedItemId, setHighlightedItemId] = useState<number | null>(null);
  const [language, setLanguage] = useState<Language>("es");
  const paletteFileInputRef = useRef<HTMLInputElement>(null);
  const [textBold, setTextBold] = useState(false);
  const [textBackground, setTextBackground] = useState("transparent");
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left');
  const [markerDraft, setMarkerDraft] = useState({ title: "Marker", description: "", color: "#129CF3", category: "Nota", priority: "medium" as CanvasMarker['priority'] });
  const customIconInputRef = useRef<HTMLInputElement>(null);

  const [interaction, setInteraction] = useState<{
    type: 'move-item' | 'rotate-item' | 'move-text' | 'move-marker' | 'pan' | null;
    startClientX: number;
    startClientY: number;
    initialItem: CanvasItem | null;
    initialText: CanvasText | null;
    initialMarker: CanvasMarker | null;
    initialPan?: { x: number; y: number };
  }>({ type: null, startClientX: 0, startClientY: 0, initialItem: null, initialText: null, initialMarker: null, initialPan: { x: 0, y: 0 } });

  const canvasRef = useRef<HTMLDivElement>(null);
  const layoutFileInputRef = useRef<HTMLInputElement>(null);
  const projectFileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const t = uiText[language];

  useEffect(() => {
    setLayouts(initialLayouts);
    if (!selectedLayout || !initialLayouts.some(l => l.image === selectedLayout)) {
        const newLayout = initialLayouts.length > 0 ? initialLayouts[0].image : '';
        setSelectedLayout(newLayout);
    }
  }, [initialLayouts, selectedLayout]);

  const makeSnapshot = useCallback((): Snapshot => ({
    items,
    lines,
    shapes,
    texts,
    markers,
    measurements,
    heatZones,
    routes,
  }), [items, lines, shapes, texts, markers, measurements, heatZones, routes]);

  const logAction = useCallback((message: string) => {
    setActionLog(prev => [`${new Date().toLocaleTimeString()} - ${message}`, ...prev].slice(0, 20));
  }, []);

  const recordHistory = useCallback(() => {
    setHistory(prev => [...prev.slice(-49), makeSnapshot()]);
    setFuture([]);
  }, [makeSnapshot]);

  const restoreSnapshot = (snapshot: Snapshot) => {
    setItems(snapshot.items);
    setLines(snapshot.lines);
    setShapes(snapshot.shapes);
    setTexts(snapshot.texts);
    setMarkers(snapshot.markers);
    setMeasurements(snapshot.measurements);
    setHeatZones(snapshot.heatZones);
    setRoutes(snapshot.routes);
    setSelectedItem(null);
    setSelectedText(null);
    setSelectedMarker(null);
    setSelectedItems([]);
  };

  const undo = () => {
    setHistory(prev => {
      const snapshot = prev[prev.length - 1];
      if (!snapshot) return prev;
      setFuture(next => [...next, makeSnapshot()]);
      restoreSnapshot(snapshot);
      return prev.slice(0, -1);
    });
  };

  const redo = () => {
    setFuture(prev => {
      const snapshot = prev[prev.length - 1];
      if (!snapshot) return prev;
      setHistory(next => [...next, makeSnapshot()]);
      restoreSnapshot(snapshot);
      return prev.slice(0, -1);
    });
  };

  useEffect(() => {
    const raw = localStorage.getItem("kartographer-autosave");
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      if (!data.items && !data.lines && !data.texts) return;
      setItems((data.items ?? []).map((item: CanvasItem) => ({ ...item, scale: item.scale ?? 1 })));
      setLines(data.lines ?? []);
      setShapes(data.shapes ?? []);
      setTexts(data.texts ?? []);
      setMarkers(data.markers ?? []);
      setMeasurements(data.measurements ?? []);
      setHeatZones(data.heatZones ?? []);
      setRoutes(data.routes ?? []);
      setCustomIcons(data.customIcons ?? []);
      setMapNotes(normalizeNoteText(data.mapNotes ?? ""));
      setNoteItemLinks(data.noteItemLinks ?? extractLegacyNoteLinks(data.mapNotes ?? ""));
      if (data.language === "es" || data.language === "en") setLanguage(data.language);
      if (data.layout) setSelectedLayout(data.layout);
      if (data.settings) {
        setShowGrid(Boolean(data.settings.showGrid));
        setSnapToGrid(Boolean(data.settings.snapToGrid));
        setGridSize(data.settings.gridSize ?? 32);
      }
      toast({ title: "Autosave restored" });
    } catch {
      localStorage.removeItem("kartographer-autosave");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!autoSaveEnabled) return;
    const timer = window.setTimeout(() => {
      localStorage.setItem("kartographer-autosave", JSON.stringify({
        layout: selectedLayout,
        items,
        lines,
        shapes,
        texts,
        markers,
        measurements,
        heatZones,
        routes,
        customIcons,
        mapNotes,
        noteItemLinks,
        language,
        settings: { showGrid, snapToGrid, gridSize },
      }));
    }, 500);
    return () => window.clearTimeout(timer);
  }, [autoSaveEnabled, selectedLayout, items, lines, shapes, texts, markers, measurements, heatZones, routes, customIcons, mapNotes, noteItemLinks, language, showGrid, snapToGrid, gridSize]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkTheme);
  }, [darkTheme]);
  
  const handleLayoutImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        const newLayout = { name: file.name.replace(/.[^/.]+$/, ""), image: imageUrl, hint: "custom" };
        setLayouts(prev => [...prev, newLayout]);
        resetWorkspaceForLayout();
        setSelectedLayout(imageUrl);
        toast({ title: "Custom layout loaded!" });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProject = () => {
    const projectData = { layout: selectedLayout, items, lines, shapes, texts, markers, measurements, heatZones, routes, customIcons, mapNotes, noteItemLinks, language, settings: { showGrid, snapToGrid, gridSize } };
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
          setItems(projectData.items ? projectData.items.map((item: CanvasItem) => ({ ...item, scale: item.scale ?? 1 })) : []);
          setLines(projectData.lines ?? []);
          setShapes(projectData.shapes ?? []);
          setTexts(projectData.texts ?? []);
          setMarkers(projectData.markers ?? []);
          setMeasurements(projectData.measurements ?? []);
          setHeatZones(projectData.heatZones ?? []);
          setRoutes(projectData.routes ?? []);
          setCustomIcons(projectData.customIcons ?? []);
          setMapNotes(normalizeNoteText(projectData.mapNotes ?? ""));
          setNoteItemLinks(projectData.noteItemLinks ?? extractLegacyNoteLinks(projectData.mapNotes ?? ""));
          if (projectData.language === "es" || projectData.language === "en") setLanguage(projectData.language);
          if (projectData.settings) {
            setShowGrid(Boolean(projectData.settings.showGrid));
            setSnapToGrid(Boolean(projectData.settings.snapToGrid));
            setGridSize(projectData.settings.gridSize ?? 32);
          }
          setSelectedItem(null);
          setSelectedText(null);
          toast({ title: "Project Loaded!" });
        } catch (error) {
          toast({ variant: "destructive", title: "Load Failed" });
        }
      };
      reader.readAsText(file);
    }
  };
  
  const handleItemDragStart = (e: DragEvent, itemType: ItemType, customId?: string) => {
    e.dataTransfer.setData("application/reactflow", itemType);
    if (customId) e.dataTransfer.setData("application/kartographer-custom", customId);
  };

  const snapCoordinate = useCallback((value: number) => {
    if (!snapToGrid) return value;
    return Math.round(value / gridSize) * gridSize;
  }, [snapToGrid, gridSize]);

  const snapPoint = useCallback((x: number, y: number) => ({
    x: snapCoordinate(x),
    y: snapCoordinate(y),
  }), [snapCoordinate]);

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    if (!canvasRef.current) return;
    const itemType = e.dataTransfer.getData("application/reactflow") as ItemType;
    if (!itemType) return;
    if (lockedLayers.items) return;
    recordHistory();
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const customId = e.dataTransfer.getData("application/kartographer-custom");
    const custom = customIcons.find(icon => icon.id === customId);
    const { x, y } = snapPoint((e.clientX - canvasRect.left - pan.x) / zoom - ITEM_SIZE / 2, (e.clientY - canvasRect.top - pan.y) / zoom - ITEM_SIZE / 2);
    const newItem: CanvasItem = { id: Date.now(), type: itemType, x, y, rotation: 0, scale: 1, customSrc: custom?.src, customName: custom?.name };
    setItems((prev) => [...prev, newItem]);
    setSelectedItem(newItem.id);
    setSelectedText(null);
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
    if (mode === 'pan') {
      setInteraction({ type: 'pan', startClientX: clientX, startClientY: clientY, initialItem: null, initialText: null, initialMarker: null, initialPan: pan });
      return;
    }
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const { x, y } = snapPoint((clientX - canvasRect.left - pan.x) / zoom, (clientY - canvasRect.top - pan.y) / zoom);
    if (readOnly) return;

    if (mode === 'place' && selectedItemForPlacement) {
      if (lockedLayers.items) return;
      recordHistory();
      const itemPosition = snapPoint(x - ITEM_SIZE / 2, y - ITEM_SIZE / 2);
      const custom = selectedCustomIcon ? customIcons.find(icon => icon.id === selectedCustomIcon) : null;
      const newItem: CanvasItem = { id: Date.now(), type: selectedItemForPlacement, x: itemPosition.x, y: itemPosition.y, rotation: 0, scale: 1, customSrc: custom?.src, customName: custom?.name };
      setItems((prev) => [...prev, newItem]);
      setSelectedItem(newItem.id);
      setSelectedText(null);
      logAction(`Created ${newItem.customName ?? newItem.type}`);
    } else if (mode === 'draw') {
        if (lockedLayers.drawing) return;
        recordHistory();
        setSelectedItem(null);
        setSelectedText(null);
        setIsDrawing(true);
        if (drawMode === 'freehand') {
            const newLine: CanvasLine = { id: Date.now(), points: [{ x, y }], color: drawColor, strokeWidth, strokeDasharray: strokeDash === 'dashed' ? '10,10' : strokeDash === 'dotted' ? '2,8' : 'none' };
            setLines(prev => [...prev, newLine]);
            logAction("Started drawing");
        } else {
            setDrawingShape({ id: Date.now(), type: drawMode, startX: x, startY: y, endX: x, endY: y, color: drawColor, strokeWidth, strokeDasharray: strokeDash === 'dashed' ? '10,10' : strokeDash === 'dotted' ? '2,8' : 'none' });
        }
    } else if (mode === 'text' && textDraft.trim()) {
      if (lockedLayers.texts) return;
      recordHistory();
      const newText: CanvasText = {
        id: Date.now(),
        text: textDraft.trim(),
        x,
        y,
        color: textColor,
        fontSize: textSize,
        rotation: 0,
        bold: textBold,
        background: textBackground,
        align: textAlign,
      };
      setTexts(prev => [...prev, newText]);
      setSelectedText(newText.id);
      setSelectedItem(null);
      logAction("Created text");
    } else if (mode === 'marker') {
      if (lockedLayers.markers) return;
      recordHistory();
      const newMarker: CanvasMarker = { id: Date.now(), x, y, ...markerDraft, label: `M${markers.length + 1}`, status: 'pending' };
      setMarkers(prev => [...prev, newMarker]);
      setSelectedMarker(newMarker.id);
      setSelectedItem(null);
      setSelectedText(null);
      logAction("Created marker");
    } else if (mode === 'measure') {
      if (lockedLayers.measurements) return;
      recordHistory();
      const draft: CanvasMeasurement = { id: Date.now(), startX: x, startY: y, endX: x, endY: y, color: drawColor };
      setMeasurementDraft(draft);
      setIsDrawing(true);
    } else if (mode === 'heatmap') {
      recordHistory();
      setHeatZones(prev => [...prev, { id: Date.now(), x: x - 80, y: y - 50, width: 160, height: 100, color: drawColor, opacity: 0.35 }]);
      logAction("Added heat zone");
    } else if (mode === 'route') {
      recordHistory();
      if (!routeDraft) {
        const route = { id: Date.now(), name: `Route ${routes.length + 1}`, color: drawColor, visible: true, points: [{ x, y }] };
        setRouteDraft(route);
        setActiveRouteId(route.id);
      } else {
        setRouteDraft(prev => prev ? { ...prev, points: [...prev.points, { x, y }] } : null);
      }
    } else if (mode === 'erase') {
      recordHistory();
      eraseAtPoint(x, y);
    } else if (!target.closest('.item-wrapper')) {
      setSelectedItem(null);
      setSelectedText(null);
      setSelectedMarker(null);
      setSelectedItems([]);
    }
  };

  const resetWorkspaceForLayout = () => {
    setItems([]);
    setLines([]);
    setShapes([]);
    setTexts([]);
    setMarkers([]);
    setMeasurements([]);
    setHeatZones([]);
    setRoutes([]);
    setRouteDraft(null);
    setMeasurementDraft(null);
    setDrawingShape(null);
    setSelectedItem(null);
    setSelectedText(null);
    setSelectedMarker(null);
    setSelectedItems([]);
    setMapNotes("");
    setNoteItemLinks([]);
    setHighlightedItemId(null);
    setHistory([]);
    setFuture([]);
    setPan({ x: 0, y: 0 });
    setZoom(1);
  };

  const handleLayoutChange = (layout: string) => {
    if (layout === selectedLayout) return;
    resetWorkspaceForLayout();
    setSelectedLayout(layout);
    logAction("Changed map and cleared workspace");
  };
  
  const handlePointerMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDrawing && !interaction.type) return;
    const { clientX, clientY } = getEventPosition(e);
    if (!canvasRef.current) return;
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const { x, y } = snapPoint((clientX - canvasRect.left - pan.x) / zoom, (clientY - canvasRect.top - pan.y) / zoom);

    if (interaction.type === 'pan') {
      const initialPan = interaction.initialPan ?? { x: 0, y: 0 };
      setPan({ x: initialPan.x + (clientX - interaction.startClientX), y: initialPan.y + (clientY - interaction.startClientY) });
    } else if (isDrawing && mode === 'measure' && measurementDraft) {
      setMeasurementDraft(prev => prev ? { ...prev, endX: x, endY: y } : null);
    } else if (isDrawing && mode === 'draw') {
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
          if (interaction.type === 'move-item') {
              const nextX = interaction.initialItem!.x + (clientX - interaction.startClientX);
              const nextY = interaction.initialItem!.y + (clientY - interaction.startClientY);
              return { ...item, ...snapPoint(nextX, nextY) };
          } else {
              const scale = item.scale ?? 1;
              const angle = Math.atan2(y - (item.y + (ITEM_SIZE * scale) / 2), x - (item.x + (ITEM_SIZE * scale) / 2)) * (180 / Math.PI) + 90;
              return { ...item, rotation: angle };
          }
      }));
    } else if (interaction.type === 'move-text' && interaction.initialText) {
      setTexts(prev => prev.map(text => {
        if (text.id !== interaction.initialText!.id) return text;
        const nextX = interaction.initialText!.x + (clientX - interaction.startClientX);
        const nextY = interaction.initialText!.y + (clientY - interaction.startClientY);
        return { ...text, ...snapPoint(nextX, nextY) };
      }));
    } else if (interaction.type === 'move-marker' && interaction.initialMarker) {
      setMarkers(prev => prev.map(marker => {
        if (marker.id !== interaction.initialMarker!.id) return marker;
        const nextX = interaction.initialMarker!.x + (clientX - interaction.startClientX) / zoom;
        const nextY = interaction.initialMarker!.y + (clientY - interaction.startClientY) / zoom;
        return { ...marker, ...snapPoint(nextX, nextY) };
      }));
    }
  }, [isDrawing, interaction, mode, drawMode, drawingShape, measurementDraft, strokeWidth, drawColor, strokeDash, snapPoint, pan, zoom]);
  
  const handlePointerUp = useCallback(() => {
    if (isDrawing && drawingShape) {
        setShapes(prev => [...prev, drawingShape]);
        setDrawingShape(null);
    }
    if (isDrawing && measurementDraft) {
      setMeasurements(prev => [...prev, measurementDraft]);
      setMeasurementDraft(null);
    }
    setIsDrawing(false);
    setInteraction({ type: null, startClientX: 0, startClientY: 0, initialItem: null, initialText: null, initialMarker: null, initialPan: { x: 0, y: 0 } });
  }, [isDrawing, drawingShape, measurementDraft]);

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

  const selectedLayoutName = layouts.find(layout => layout.image === selectedLayout)?.name ?? "Mapa personalizado";

  const exportAsImage = (format: 'png' | 'jpeg') => {
    if (canvasRef.current) {
      setSelectedItem(null);
      setSelectedText(null);
      setSelectedMarker(null);
      setExportOverlayVisible(true);
      setTimeout(() => {
        html2canvas(canvasRef.current!, { useCORS: true, scale: exportScale, ignoreElements: (el) => !exportGrid && el.getAttribute("data-export-ignore") === "grid" }).then(canvas => {
          const link = document.createElement("a");
          const safeLayoutName = selectedLayoutName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "layout";
          link.download = `kartographer-${safeLayoutName}.${format}`;
          link.href = canvas.toDataURL(`image/${format}`, format === 'jpeg' ? 0.92 : undefined);
          link.click();
        }).finally(() => {
          setExportOverlayVisible(false);
        });
      }, 100);
    }
  };

  const selectedItemData = items.find(item => item.id === selectedItem) ?? null;
  const selectedTextData = texts.find(text => text.id === selectedText) ?? null;
  const selectedMarkerData = markers.find(marker => marker.id === selectedMarker) ?? null;

  const getItemDisplayName = useCallback((item: CanvasItem) => {
    return item.name
      ?? item.customName
      ?? AVAILABLE_ITEMS.find(availableItem => availableItem.type === item.type)?.name
      ?? item.type;
  }, []);

  const insertSelectedItemReference = () => {
    if (!selectedItemData) return;
    const label = getItemDisplayName(selectedItemData);
    const reference = `@${label}`;
    setNoteItemLinks(prev => {
      const withoutDuplicate = prev.filter(link => !(link.itemId === selectedItemData.id && link.label === label));
      return [...withoutDuplicate, { itemId: selectedItemData.id, label }];
    });
    setMapNotes(prev => {
      const separator = prev && !prev.endsWith(" ") && !prev.endsWith("\n") ? " " : "";
      return `${prev}${separator}${reference} `;
    });
    logAction(`Linked note to ${label}`);
  };

  const renderNotesPreview = () => {
    if (!mapNotes.trim()) {
      return <p className="text-xs text-muted-foreground">{t.notesPreviewEmpty}</p>;
    }

    const uniqueLinks = noteItemLinks
      .filter(link => mapNotes.includes(`@${link.label}`))
      .sort((a, b) => b.label.length - a.label.length);

    if (uniqueLinks.length === 0) return mapNotes;

    const pattern = new RegExp(uniqueLinks.map(link => `@${link.label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`).join("|"), "g");
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(mapNotes)) !== null) {
      const raw = match[0];
      const label = raw.slice(1);
      const link = uniqueLinks.find(itemLink => itemLink.label === label);
      if (!link) continue;
      const itemExists = items.some(item => item.id === link.itemId);
      if (match.index > lastIndex) parts.push(mapNotes.slice(lastIndex, match.index));
      parts.push(
        <button
          type="button"
          key={`${link.itemId}-${match.index}`}
          className={cn(
            "mx-0.5 inline-flex max-w-full items-center rounded border px-1.5 py-0.5 text-xs font-semibold align-baseline transition-colors",
            itemExists ? "border-primary/50 bg-primary/15 text-primary hover:bg-primary/25" : "border-destructive/40 bg-destructive/10 text-destructive"
          )}
          onMouseEnter={() => itemExists && setHighlightedItemId(link.itemId)}
          onMouseLeave={() => setHighlightedItemId(null)}
          onFocus={() => itemExists && setHighlightedItemId(link.itemId)}
          onBlur={() => setHighlightedItemId(null)}
          onClick={() => itemExists && setSelectedItem(link.itemId)}
          title={itemExists ? "Iluminar objeto" : "Objeto no encontrado"}
        >
          {raw}
        </button>
      );
      lastIndex = pattern.lastIndex;
    }

    if (lastIndex < mapNotes.length) parts.push(mapNotes.slice(lastIndex));
    return parts;
  };

  const readableMapNotes = normalizeNoteText(mapNotes);

  const updateSelectedItemScale = (scale: number) => {
    if (!selectedItem) return;
    setItems(prev => prev.map(item => item.id === selectedItem ? { ...item, scale } : item));
  };

  const updateSelectedTextSize = (fontSize: number) => {
    if (!selectedText) return;
    setTexts(prev => prev.map(text => text.id === selectedText ? { ...text, fontSize } : text));
  };

  const updateSelectedRotation = (rotation: number) => {
    if (selectedItem) {
      setItems(prev => prev.map(item => item.id === selectedItem ? { ...item, rotation } : item));
      return;
    }
    if (selectedText) {
      setTexts(prev => prev.map(text => text.id === selectedText ? { ...text, rotation } : text));
    }
  };

  const updateSelectedTextStyle = (patch: Partial<CanvasText>) => {
    if (selectedText) setTexts(prev => prev.map(text => text.id === selectedText ? { ...text, ...patch } : text));
  };

  const updateSelectedMarker = (patch: Partial<CanvasMarker>) => {
    if (!selectedMarker) return;
    setMarkers(prev => prev.map(marker => marker.id === selectedMarker ? { ...marker, ...patch } : marker));
  };

  const eraseAtPoint = (x: number, y: number) => {
    const hitRadius = 36;
    if (eraserLayer === 'items') setItems(prev => prev.filter(item => Math.hypot(item.x + ITEM_SIZE / 2 - x, item.y + ITEM_SIZE / 2 - y) > hitRadius));
    if (eraserLayer === 'texts') setTexts(prev => prev.filter(text => Math.hypot(text.x - x, text.y - y) > hitRadius));
    if (eraserLayer === 'markers') setMarkers(prev => prev.filter(marker => Math.hypot(marker.x - x, marker.y - y) > hitRadius));
    if (eraserLayer === 'drawing') {
      setLines(prev => prev.filter(line => !line.points.some(point => Math.hypot(point.x - x, point.y - y) < hitRadius)));
      setShapes(prev => prev.filter(shape => Math.hypot((shape.startX + shape.endX) / 2 - x, (shape.startY + shape.endY) / 2 - y) > hitRadius));
    }
    if (eraserLayer === 'heatmap') setHeatZones(prev => prev.filter(zone => !(x >= zone.x && x <= zone.x + zone.width && y >= zone.y && y <= zone.y + zone.height)));
    if (eraserLayer === 'routes') setRoutes(prev => prev.map(route => ({ ...route, points: route.points.filter(point => Math.hypot(point.x - x, point.y - y) > hitRadius) })));
    logAction(`Erased ${eraserLayer}`);
  };

  const updateSelectedItem = (patch: Partial<CanvasItem>) => {
    if (!selectedItem) return;
    recordHistory();
    setItems(prev => prev.map(item => item.id === selectedItem ? { ...item, ...patch } : item));
  };

  const toggleSelectedLock = () => {
    if (selectedItemData) updateSelectedItem({ locked: !selectedItemData.locked });
    if (selectedTextData) {
      recordHistory();
      setTexts(prev => prev.map(text => text.id === selectedText ? { ...text, locked: !text.locked } : text));
    }
  };

  const moveSelectedZ = (direction: 'front' | 'back') => {
    if (!selectedItem) return;
    const zValues = items.map(item => item.zIndex ?? 0);
    updateSelectedItem({ zIndex: direction === 'front' ? Math.max(0, ...zValues) + 1 : Math.min(0, ...zValues) - 1 });
  };

  const groupSelected = () => {
    if (selectedItems.length < 2) return;
    recordHistory();
    const groupId = Date.now();
    setItems(prev => prev.map(item => selectedItems.includes(item.id) ? { ...item, groupId } : item));
    logAction("Grouped items");
  };

  const finishRoute = () => {
    if (!routeDraft || routeDraft.points.length < 2) return;
    setRoutes(prev => [...prev, routeDraft]);
    setRouteDraft(null);
    logAction("Saved route");
  };

  const exportNotes = () => {
    const markerNotes = markers.map(marker => `${marker.label ?? marker.title}\nCategory: ${marker.category}\nPriority: ${marker.priority}\nStatus: ${marker.status ?? 'pending'}\n${marker.description}`).join("\n\n---\n\n");
    const content = [
      `${selectedLayoutName}`,
      readableMapNotes.trim() ? `Apuntes:\n${readableMapNotes.trim()}` : "",
      markerNotes ? `Marcadores:\n${markerNotes}` : "",
    ].filter(Boolean).join("\n\n---\n\n");
    const blob = new Blob([content || "No markers"], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "kartographer-notes.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const validateProject = () => {
    const messages = [
      ...markers.filter(marker => !marker.description.trim()).map(marker => `Marker without description: ${marker.title}`),
      ...items.filter(item => item.x < 0 || item.y < 0).map(item => `Object outside map: ${item.name ?? item.type}`),
      ...Object.entries(visibleLayers).filter(([, visible]) => !visible).map(([layer]) => `Layer hidden: ${layer}`),
    ];
    setValidationMessages(messages.length ? messages : ["No validation issues found"]);
  };

  const exportPalette = () => {
    const blob = new Blob([JSON.stringify({ customIcons }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "kartographer-palette.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importPalette = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      try {
        const data = JSON.parse(event.target?.result as string);
        setCustomIcons(data.customIcons ?? []);
      } catch {
        toast({ variant: "destructive", title: "Palette import failed" });
      }
    };
    reader.readAsText(file);
  };

  const handleCustomIconUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = event => {
      const icon = { id: String(Date.now()), name: file.name.replace(/\.[^/.]+$/, ""), src: event.target?.result as string };
      setCustomIcons(prev => [...prev, icon]);
      setSelectedCustomIcon(icon.id);
      setSelectedItemForPlacement('custom-icon');
    };
    reader.readAsDataURL(file);
  };

  const deleteSelection = () => {
    if (selectedItem) {
      recordHistory();
      setItems(prev => prev.filter(item => item.id !== selectedItem));
      setSelectedItem(null);
      return;
    }
    if (selectedText) {
      recordHistory();
      setTexts(prev => prev.filter(text => text.id !== selectedText));
      setSelectedText(null);
      return;
    }
    if (selectedMarker) {
      recordHistory();
      setMarkers(prev => prev.filter(marker => marker.id !== selectedMarker));
      setSelectedMarker(null);
      return;
    }
    if (selectedItems.length > 0) {
      recordHistory();
      setItems(prev => prev.filter(item => !selectedItems.includes(item.id)));
      setSelectedItems([]);
    }
  };

  const duplicateSelection = () => {
    if (selectedItemData) {
      recordHistory();
      const copy = { ...selectedItemData, id: Date.now(), x: selectedItemData.x + 18, y: selectedItemData.y + 18 };
      setItems(prev => [...prev, copy]);
      setSelectedItem(copy.id);
      return;
    }
    if (selectedTextData) {
      recordHistory();
      const copy = { ...selectedTextData, id: Date.now(), x: selectedTextData.x + 18, y: selectedTextData.y + 18 };
      setTexts(prev => [...prev, copy]);
      setSelectedText(copy.id);
    }
  };

  const resetSelectionTransform = () => {
    if (selectedItem) {
      recordHistory();
      setItems(prev => prev.map(item => item.id === selectedItem ? { ...item, rotation: 0, scale: 1 } : item));
      return;
    }
    if (selectedText) {
      recordHistory();
      setTexts(prev => prev.map(text => text.id === selectedText ? { ...text, rotation: 0, fontSize: textSize } : text));
    }
  };

  const undoLast = () => {
    if (texts.length > 0) {
      setTexts(prev => prev.slice(0, -1));
      setSelectedText(null);
      return;
    }
    if (items.length > 0) {
      setItems(prev => prev.slice(0, -1));
      setSelectedItem(null);
      return;
    }
    if (shapes.length > 0) {
      setShapes(prev => prev.slice(0, -1));
      return;
    }
    if (lines.length > 0) {
      setLines(prev => prev.slice(0, -1));
    }
  };

  const selectedItemName = selectedItemData
    ? getItemDisplayName(selectedItemData)
    : null;

  const clearCanvas = () => {
    recordHistory();
    setLines([]);
    setShapes([]);
    setItems([]);
    setTexts([]);
    setSelectedItem(null);
    setSelectedText(null);
    setSelectedMarker(null);
    setSelectedItems([]);
  };

  const filteredItems = AVAILABLE_ITEMS.filter(item =>
    item.name.toLowerCase().includes(paletteFilter.trim().toLowerCase())
    || item.type.toLowerCase().includes(paletteFilter.trim().toLowerCase())
  );

  const categorizedItems = filteredItems.filter(item => {
    if (itemCategory === 'all') return true;
    if (itemCategory === 'drivers') return ['player', 'enemy'].includes(item.type);
    if (itemCategory === 'power') return ['mushroom', 'golden-mushroom', 'mega-mushroom', 'super-star', 'lightning', 'bullet-bill'].includes(item.type);
    if (itemCategory === 'weapons') return ['shell', 'red-shell', 'blue-shell', 'bob-omb', 'hammer', 'super-horn', 'fire-flower', 'ice-flower', 'boomerang-flower'].includes(item.type);
    return !['player', 'enemy'].includes(item.type);
  });

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        undo();
      } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'y') {
        event.preventDefault();
        redo();
      } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'd') {
        event.preventDefault();
        duplicateSelection();
      } else if (event.key === 'Delete' || event.key === 'Backspace') {
        deleteSelection();
      } else if (event.key.toLowerCase() === 'g') {
        setShowGrid(v => !v);
      } else if (event.key.toLowerCase() === 'v') {
        setMode('place');
      } else if (event.key.toLowerCase() === 'd') {
        setMode('draw');
      } else if (event.key.toLowerCase() === 't') {
        setMode('text');
      } else if (event.key.toLowerCase() === 'm') {
        setMode('marker');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [undo, redo, duplicateSelection, deleteSelection]);

  const contextPanel = (
    <div className="flex h-full flex-col gap-5">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{t.activeMode}</p>
        <h2 className="mt-1 text-2xl font-semibold">
          {mode === 'place' ? t.placeObjects : mode === 'draw' ? t.drawRoutes : mode === 'text' ? t.text : mode === 'marker' ? t.marker : mode === 'measure' ? "Measure" : mode === 'erase' ? t.erase : mode === 'route' ? t.route : t.pan}
        </h2>
      </div>

      {mode === 'place' && (
        <div className="space-y-5">
          <div className="rounded-lg border bg-muted/20 p-3">
            <p className="text-base font-medium">{selectedItemName ? `${t.selected}: ${selectedItemName}` : t.selectObject}</p>
            <p className="mt-2 text-sm text-muted-foreground">{t.drawHint}</p>
          </div>
          {selectedItemData && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-base font-medium">{t.size}</span>
                <span className="text-sm tabular-nums text-muted-foreground">{Math.round((selectedItemData.scale ?? 1) * 100)}%</span>
              </div>
              <Slider value={[selectedItemData.scale ?? 1]} onValueChange={([v]) => updateSelectedItemScale(v)} min={0.4} max={2.5} step={0.05} />
            </div>
          )}
          {selectedItemData && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-base font-medium">{t.rotation}</span>
                <span className="text-sm tabular-nums text-muted-foreground">{Math.round(selectedItemData.rotation)} deg</span>
              </div>
              <Slider value={[selectedItemData.rotation]} onValueChange={([v]) => updateSelectedRotation(v)} min={-180} max={180} step={1} />
            </div>
          )}
          {selectedItemData && (
            <div className="space-y-3 rounded border p-3">
              <p className="text-base font-medium">Propiedades</p>
              <Input value={selectedItemData.name ?? selectedItemName ?? ""} onChange={(e) => updateSelectedItem({ name: e.target.value })} className="h-10" placeholder="Nombre" />
              <div className="grid grid-cols-2 gap-2">
                <Input type="number" value={Math.round(selectedItemData.x)} onChange={(e) => updateSelectedItem({ x: Number(e.target.value) })} className="h-10" />
                <Input type="number" value={Math.round(selectedItemData.y)} onChange={(e) => updateSelectedItem({ y: Number(e.target.value) })} className="h-10" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Opacidad</span>
                <span className="text-sm">{Math.round((selectedItemData.opacity ?? 1) * 100)}%</span>
              </div>
              <Slider value={[selectedItemData.opacity ?? 1]} onValueChange={([v]) => updateSelectedItem({ opacity: v })} min={0.1} max={1} step={0.05} />
              <div className="grid grid-cols-2 gap-2">
                <Button type="button" variant="outline" className="h-10" onClick={toggleSelectedLock}>{selectedItemData.locked ? "Unlock" : "Lock"}</Button>
                <Button type="button" variant="outline" className="h-10" onClick={groupSelected}>Group</Button>
                <Button type="button" variant="outline" className="h-10" onClick={() => moveSelectedZ('front')}>Front</Button>
                <Button type="button" variant="outline" className="h-10" onClick={() => moveSelectedZ('back')}>Back</Button>
              </div>
            </div>
          )}
        </div>
      )}

      {mode === 'draw' && (
        <div className="space-y-5">
          <div className="grid grid-cols-4 gap-3">
            {(['freehand', 'rectangle', 'circle', 'arrow'] as DrawMode[]).map(m => (
              <Button key={m} type="button" variant={drawMode === m ? 'default' : 'outline'} size="icon" onClick={() => setDrawMode(m)} aria-label={m} className="h-12 w-12">
                {m === 'freehand' && <Pen size={20}/>} {m === 'rectangle' && <Square size={20}/>} {m === 'circle' && <Circle size={20}/>} {m === 'arrow' && <ArrowRight size={20}/>}
              </Button>
            ))}
          </div>
          <div className="space-y-2">
            <label className="text-base font-medium" htmlFor="draw-color">{t.color}</label>
            <Input id="draw-color" type="color" value={drawColor} onChange={(e) => setDrawColor(e.target.value)} className="h-12 w-full cursor-pointer p-1" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-base font-medium">Grosor</span>
              <span className="text-sm tabular-nums text-muted-foreground">{strokeWidth}px</span>
            </div>
            <Slider value={[strokeWidth]} onValueChange={([v]) => setStrokeWidth(v)} min={1} max={20} />
          </div>
          <div className="space-y-2">
              <span className="text-base font-medium">{t.line}</span>
            <Select value={strokeDash} onValueChange={setStrokeDash}>
              <SelectTrigger className="h-12 text-base"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t.solid}</SelectItem>
                <SelectItem value="dashed">Guiones</SelectItem>
                <SelectItem value="dotted">Puntos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {mode === 'text' && (
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-base font-medium" htmlFor="text-draft">{t.text}</label>
            <Input id="text-draft" value={textDraft} onChange={(e) => setTextDraft(e.target.value)} placeholder={t.textToPlace} className="h-12 text-base" />
          </div>
          <div className="space-y-2">
            <label className="text-base font-medium" htmlFor="text-color">{t.color}</label>
            <Input id="text-color" type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="h-12 w-full cursor-pointer p-1" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-base font-medium">{t.size}</span>
              <span className="text-sm tabular-nums text-muted-foreground">{selectedTextData ? selectedTextData.fontSize : textSize}px</span>
            </div>
            <Slider
              value={[selectedTextData ? selectedTextData.fontSize : textSize]}
              onValueChange={([v]) => selectedTextData ? updateSelectedTextSize(v) : setTextSize(v)}
              min={12}
              max={72}
              step={1}
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            <Button type="button" variant={textBold ? "default" : "outline"} className="h-11" onClick={() => { setTextBold(v => !v); updateSelectedTextStyle({ bold: !textBold }); }}><Bold className="h-4 w-4" /></Button>
            <Button type="button" variant={textAlign === "left" ? "default" : "outline"} className="h-11" onClick={() => { setTextAlign("left"); updateSelectedTextStyle({ align: "left" }); }}><AlignLeft className="h-4 w-4" /></Button>
            <Button type="button" variant={textAlign === "center" ? "default" : "outline"} className="h-11" onClick={() => { setTextAlign("center"); updateSelectedTextStyle({ align: "center" }); }}><AlignCenter className="h-4 w-4" /></Button>
            <Button type="button" variant={textAlign === "right" ? "default" : "outline"} className="h-11" onClick={() => { setTextAlign("right"); updateSelectedTextStyle({ align: "right" }); }}><AlignRight className="h-4 w-4" /></Button>
          </div>
          <div className="space-y-2">
            <label className="text-base font-medium" htmlFor="text-bg">Fondo texto</label>
            <Input id="text-bg" value={textBackground} onChange={(e) => { setTextBackground(e.target.value); updateSelectedTextStyle({ background: e.target.value }); }} placeholder="transparent o #000000" className="h-12 text-base" />
          </div>
          <p className="text-sm text-muted-foreground">Pulsa el mapa para colocar texto. Arrastra cualquier texto para moverlo.</p>
          {selectedTextData && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-base font-medium">{t.rotation}</span>
                <span className="text-sm tabular-nums text-muted-foreground">{Math.round(selectedTextData.rotation)} deg</span>
              </div>
              <Slider value={[selectedTextData.rotation]} onValueChange={([v]) => updateSelectedRotation(v)} min={-180} max={180} step={1} />
            </div>
          )}
        </div>
      )}

      {mode === 'marker' && (
        <div className="space-y-4">
          <Input value={markerDraft.title} onChange={(e) => setMarkerDraft(prev => ({ ...prev, title: e.target.value }))} className="h-12 text-base" placeholder={t.title} />
          <Input value={markerDraft.description} onChange={(e) => setMarkerDraft(prev => ({ ...prev, description: e.target.value }))} className="h-12 text-base" placeholder={t.description} />
          <Input value={markerDraft.category} onChange={(e) => setMarkerDraft(prev => ({ ...prev, category: e.target.value }))} className="h-12 text-base" placeholder={t.category} />
          <Input type="color" value={markerDraft.color} onChange={(e) => setMarkerDraft(prev => ({ ...prev, color: e.target.value }))} className="h-12 w-full cursor-pointer p-1" />
          <Select value={markerDraft.priority} onValueChange={(value: CanvasMarker['priority']) => setMarkerDraft(prev => ({ ...prev, priority: value }))}>
            <SelectTrigger className="h-12 text-base"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Baja</SelectItem>
              <SelectItem value="medium">Media</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">{t.markerHint}</p>
        </div>
      )}

      {selectedMarkerData && (
        <div className="space-y-4 rounded border bg-muted/20 p-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{t.markerDetails}</p>
              <p className="mt-1 text-base font-medium">{selectedMarkerData.label ?? selectedMarkerData.title}</p>
            </div>
            <Input
              type="color"
              value={selectedMarkerData.color}
              onChange={(e) => updateSelectedMarker({ color: e.target.value })}
              className="h-10 w-12 shrink-0 cursor-pointer p-1"
              aria-label={t.color}
            />
          </div>
          <Input
            value={selectedMarkerData.title}
            onChange={(e) => updateSelectedMarker({ title: e.target.value })}
            className="h-11"
            placeholder={t.title}
          />
          <Textarea
            value={selectedMarkerData.description}
            onChange={(e) => updateSelectedMarker({ description: e.target.value })}
            className="min-h-28 resize-y"
            placeholder={t.description}
          />
          <Input
            value={selectedMarkerData.category}
            onChange={(e) => updateSelectedMarker({ category: e.target.value })}
            className="h-11"
            placeholder={t.category}
          />
          <Select value={selectedMarkerData.priority} onValueChange={(value: CanvasMarker['priority']) => updateSelectedMarker({ priority: value })}>
            <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="low">{language === "es" ? "Baja" : "Low"}</SelectItem>
              <SelectItem value="medium">{language === "es" ? "Media" : "Medium"}</SelectItem>
              <SelectItem value="high">{language === "es" ? "Alta" : "High"}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {mode === 'measure' && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{t.measureHint}</p>
          <Input type="color" value={drawColor} onChange={(e) => setDrawColor(e.target.value)} className="h-12 w-full cursor-pointer p-1" />
        </div>
      )}

      {mode === 'erase' && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{t.eraseHint}</p>
          <Select value={eraserLayer} onValueChange={(value: typeof eraserLayer) => setEraserLayer(value)}>
            <SelectTrigger className="h-12 text-base"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="items">{t.objects}</SelectItem>
              <SelectItem value="drawing">Dibujo</SelectItem>
              <SelectItem value="texts">{t.text}</SelectItem>
              <SelectItem value="markers">Markers</SelectItem>
              <SelectItem value="heatmap">Heatmap</SelectItem>
              <SelectItem value="routes">Rutas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {mode === 'heatmap' && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{t.heatHint}</p>
          <Input type="color" value={drawColor} onChange={(e) => setDrawColor(e.target.value)} className="h-12 w-full cursor-pointer p-1" />
        </div>
      )}

      {mode === 'route' && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{t.routeHint}</p>
          <Input type="color" value={drawColor} onChange={(e) => setDrawColor(e.target.value)} className="h-12 w-full cursor-pointer p-1" />
          <Button type="button" className="h-11 w-full" onClick={finishRoute}>{t.saveRoute}</Button>
          <div className="space-y-2">
            {routes.map(route => (
              <div key={route.id} className="grid grid-cols-[1fr_auto] items-center gap-2 rounded border p-2">
                <span className="truncate text-sm" style={{ color: route.color }}>{route.name}</span>
                <Button type="button" size="icon" variant="ghost" className="h-8 w-8" onClick={() => setRoutes(prev => prev.map(item => item.id === route.id ? { ...item, visible: !item.visible } : item))}>{route.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-auto space-y-4 border-t pt-5">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-base font-medium">Zoom</span>
            <span className="text-sm text-muted-foreground">{Math.round(zoom * 100)}%</span>
          </div>
          <div className="grid grid-cols-1 gap-2">
            <Button type="button" variant="outline" className="h-11" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}>100%</Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button type="button" variant={showGrid ? "default" : "outline"} className="h-11" onClick={() => setShowGrid(v => !v)}>{t.grid}</Button>
          <Button type="button" variant={snapToGrid ? "default" : "outline"} className="h-11" onClick={() => setSnapToGrid(v => !v)}>Snap</Button>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-base font-medium">{t.gridSize}</span>
            <span className="text-sm tabular-nums text-muted-foreground">{gridSize}px</span>
          </div>
          <Slider value={[gridSize]} onValueChange={([v]) => setGridSize(v)} min={12} max={80} step={4} />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Button type="button" variant="outline" className="h-11 px-2 text-xs" onClick={() => { setLines([]); setShapes([]); }}>{t.clearDrawing}</Button>
          <Button type="button" variant="outline" className="h-11 px-2 text-xs" onClick={() => { setItems([]); setSelectedItem(null); }}>{t.clearItems}</Button>
          <Button type="button" variant="outline" className="h-11 px-2 text-xs" onClick={() => { setTexts([]); setSelectedText(null); }}>{t.clearTexts}</Button>
        </div>
        <div className="space-y-2">
          <p className="text-base font-medium">Capas</p>
          {(['items', 'drawing', 'texts', 'markers', 'measurements', 'heatmap', 'routes'] as const).map(layer => (
            <div key={layer} className="grid grid-cols-[1fr_auto_auto] items-center gap-2 rounded border p-2">
              <span className="text-sm capitalize">{layer}</span>
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => setVisibleLayers(prev => ({ ...prev, [layer]: !prev[layer] }))}>{visibleLayers[layer] ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</Button>
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => setLockedLayers(prev => ({ ...prev, [layer]: !prev[layer] }))}>{lockedLayers[layer] ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}</Button>
            </div>
          ))}
        </div>
        <div className="space-y-3">
          <p className="text-base font-medium">{t.export}</p>
          <div className="grid grid-cols-2 gap-2">
            <Button type="button" variant={exportGrid ? "default" : "outline"} className="h-10 text-xs" onClick={() => setExportGrid(v => !v)}>{t.gridExport}</Button>
            <Select value={String(exportScale)} onValueChange={(value) => setExportScale(Number(value))}>
              <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="1">1x</SelectItem><SelectItem value="2">2x</SelectItem><SelectItem value="4">4x</SelectItem></SelectContent>
            </Select>
          </div>
        </div>
        <Button type="button" variant={autoSaveEnabled ? "default" : "outline"} className="h-11" onClick={() => setAutoSaveEnabled(v => !v)}>{t.autosave}</Button>
        <div className="space-y-2">
          <p className="text-base font-medium">{t.validation}</p>
          <Button type="button" variant="outline" className="h-10 w-full" onClick={validateProject}>Validar</Button>
          {validationMessages.map((message, index) => <p key={index} className="text-xs text-muted-foreground">{message}</p>)}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button type="button" variant="outline" className="h-10 text-xs" onClick={exportNotes}>Notas TXT</Button>
          <Button type="button" variant="outline" className="h-10 text-xs" onClick={exportPalette}>Paleta JSON</Button>
          <Button type="button" variant="outline" className="h-10 text-xs" onClick={() => paletteFileInputRef.current?.click()}>{t.importPalette}</Button>
          <Button type="button" variant={readOnly ? "default" : "outline"} className="h-10 text-xs" onClick={() => setReadOnly(v => !v)}>{t.readOnly}</Button>
          <input type="file" ref={paletteFileInputRef} hidden accept=".json" onChange={importPalette} />
        </div>
        <div className="space-y-2">
          <p className="text-base font-medium">{t.history}</p>
          <div className="max-h-32 space-y-1 overflow-y-auto rounded border p-2">
            {actionLog.length === 0 ? <p className="text-xs text-muted-foreground">{t.noActions}</p> : actionLog.map((entry, index) => <p key={index} className="text-xs text-muted-foreground">{entry}</p>)}
          </div>
        </div>
      </div>
    </div>
  );

  const notesPanel = (
    <section className="flex h-full min-h-[260px] w-full flex-col gap-3 bg-muted/20 p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{t.notes}</p>
          <h2 className="mt-1 text-xl font-semibold">{t.generalNotes}</h2>
        </div>
        <span className="text-xs tabular-nums text-muted-foreground">{mapNotes.length}</span>
      </div>
      <Button
        type="button"
        variant="outline"
        className="h-10 w-full"
        disabled={!selectedItemData}
        onClick={insertSelectedItemReference}
      >
        {t.addSelectedObject}
      </Button>
      <Textarea
        value={mapNotes}
        onChange={(e) => setMapNotes(e.target.value)}
        placeholder={t.notesPlaceholder}
        className="min-h-36 flex-1 resize-none text-sm leading-relaxed"
      />
      <div className="max-h-52 overflow-y-auto rounded-md border bg-background/80 p-3 text-sm leading-relaxed whitespace-pre-wrap">
        {renderNotesPreview()}
      </div>
    </section>
  );

  return (
    <TooltipProvider>
      <div className="flex flex-col w-full h-screen bg-background overflow-hidden">
        {!presentationMode && <header className="flex shrink-0 flex-col gap-4 border-b bg-card px-4 py-4 lg:flex-row lg:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex shrink-0 items-center gap-3">
              <img src="/logo.png" alt="Kartographer logo" className="h-14 w-14 rounded-md object-contain" />
              <div>
                <p className="text-lg font-semibold leading-none">Kartographer</p>
                <p className="mt-1 text-sm text-muted-foreground">Mario Kart World</p>
              </div>
            </div>
            <Select value={selectedLayout} onValueChange={handleLayoutChange}>
              <SelectTrigger className="h-12 min-w-0 flex-1 text-base lg:max-w-md"><SelectValue placeholder={t.layoutPlaceholder} /></SelectTrigger>
              <SelectContent>{layouts.map(l => <SelectItem key={l.name} value={l.image}>{l.name}</SelectItem>)}</SelectContent>
            </Select>
            <Button type="button" variant="outline" size="icon" onClick={() => layoutFileInputRef.current?.click()} aria-label={t.importMap} className="h-12 w-12">
              <Upload className="h-5 w-5"/>
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="outline" onClick={() => setLanguage(language === "es" ? "en" : "es")} className="h-12 px-4 text-base">{language === "es" ? "ESP" : "ING"}</Button>
            <Button type="button" variant="outline" onClick={() => setPresentationMode(true)} className="h-12 px-4 text-base">{t.present}</Button>
            <Button type="button" variant="outline" onClick={() => setRightPanelOpen(v => !v)} className="h-12 px-4 text-base">{t.panel}</Button>
            <Button type="button" variant="outline" onClick={() => setDarkTheme(v => !v)} className="h-12 px-4 text-base">{t.theme}</Button>
            <Button type="button" onClick={handleSaveProject} className="h-12 px-4 text-base"><Save className="mr-2 h-5 w-5"/>{t.saveJson}</Button>
            <Button type="button" variant="outline" onClick={() => projectFileInputRef.current?.click()} className="h-12 px-4 text-base"><FileUp className="mr-2 h-5 w-5"/>{t.loadJson}</Button>
            <Button type="button" variant="secondary" onClick={() => exportAsImage('png')} className="h-12 px-4 text-base"><Download className="mr-2 h-5 w-5"/>PNG</Button>
            <Button type="button" variant="secondary" onClick={() => exportAsImage('jpeg')} className="h-12 px-4 text-base"><Download className="mr-2 h-5 w-5"/>JPG</Button>
            <input type="file" ref={projectFileInputRef} hidden accept=".json" onChange={handleLoadProject} />
            <input type="file" ref={layoutFileInputRef} hidden accept="image/*" onChange={handleLayoutImageUpload} />
          </div>
        </header>}
        {presentationMode && (
          <Button type="button" className="fixed right-4 top-4 z-[60]" onClick={() => setPresentationMode(false)}>{language === "es" ? "Salir" : "Exit"}</Button>
        )}

        <div className="flex min-h-0 flex-1">
          {!presentationMode && (
            <aside className="hidden w-80 shrink-0 border-r bg-card shadow-sm lg:flex">
              {notesPanel}
            </aside>
          )}

          <main className="min-w-0 flex-1 p-6 lg:p-8">
            <div
              ref={canvasRef}
              onMouseDown={handleCanvasPointerDown}
              onTouchStart={handleCanvasPointerDown}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="w-full h-full rounded-lg shadow-inner relative overflow-hidden border border-border bg-muted/20"
            >
            <div
              className="absolute left-0 top-0 h-full w-full"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: "top left",
              }}
            >
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${selectedLayout})`,
                backgroundSize: "contain",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                imageRendering: "pixelated",
              }}
            />
            {showGrid && (
              <div
                data-export-ignore="grid"
                className="pointer-events-none absolute inset-0"
                style={{
                  backgroundImage: "linear-gradient(to right, rgba(0,0,0,0.16) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.16) 1px, transparent 1px)",
                  backgroundSize: `${gridSize}px ${gridSize}px`,
                }}
              />
            )}
            {visibleLayers.drawing && (
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
            )}
            {visibleLayers.measurements && [...measurements, ...(measurementDraft ? [measurementDraft] : [])].map(measure => {
              const distance = Math.hypot(measure.endX - measure.startX, measure.endY - measure.startY);
              return (
                <div key={measure.id} className="pointer-events-none absolute inset-0">
                  <svg className="absolute inset-0 h-full w-full">
                    <line x1={measure.startX} y1={measure.startY} x2={measure.endX} y2={measure.endY} stroke={measure.color} strokeWidth={4} strokeDasharray="8,6" />
                  </svg>
                  <span className="absolute rounded bg-background/90 px-2 py-1 text-xs font-semibold" style={{ left: (measure.startX + measure.endX) / 2, top: (measure.startY + measure.endY) / 2 }}>
                    {Math.round(distance)}px
                  </span>
                </div>
              );
            })}
            {visibleLayers.heatmap && heatZones.map(zone => (
              <div key={zone.id} className="pointer-events-none absolute rounded-full blur-sm" style={{ left: zone.x, top: zone.y, width: zone.width, height: zone.height, background: zone.color, opacity: zone.opacity }} />
            ))}
            {visibleLayers.routes && [...routes, ...(routeDraft ? [routeDraft] : [])].filter(route => route.visible).map(route => (
              <svg key={route.id} className="pointer-events-none absolute inset-0 h-full w-full">
                <polyline points={route.points.map(point => `${point.x},${point.y}`).join(" ")} fill="none" stroke={route.color} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
                {route.points.map((point, index) => <circle key={index} cx={point.x} cy={point.y} r={5} fill={route.color} />)}
              </svg>
            ))}
            {visibleLayers.items && [...items].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0)).map(item => {
              const itemScale = item.scale ?? 1;
              const renderedItemSize = ITEM_SIZE * itemScale;
              return (
              <div
                key={item.id}
                className="absolute flex items-center justify-center item-wrapper select-none"
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
                style={{ left: item.x, top: item.y, width: renderedItemSize, height: renderedItemSize, transform: `rotate(${item.rotation}deg)`, opacity: item.opacity ?? 1, zIndex: item.zIndex ?? 0 }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (lockedLayers.items || item.locked || readOnly) return;
                  if (e.shiftKey) {
                    setSelectedItems(prev => prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id]);
                    setSelectedItem(null);
                    setSelectedText(null);
                    return;
                  }
                  recordHistory();
                  setInteraction({ type: 'move-item', startClientX: e.clientX, startClientY: e.clientY, initialItem: item, initialText: null, initialMarker: null });
                  setSelectedItem(item.id);
                  setSelectedItems([]);
                  setSelectedText(null);
                  setSelectedMarker(null);
                }}
                onTouchStart={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const touch = e.touches[0];
                  if (!touch) return;
                  if (lockedLayers.items) return;
                  recordHistory();
                  setInteraction({ type: 'move-item', startClientX: touch.clientX, startClientY: touch.clientY, initialItem: item, initialText: null, initialMarker: null });
                  setSelectedItem(item.id);
                  setSelectedText(null);
                  setSelectedMarker(null);
                }}
              >
                <div className={cn(
                  "w-full h-full relative flex items-center justify-center rounded-lg transition-[box-shadow,transform]",
                  (selectedItem === item.id || selectedItems.includes(item.id)) && "ring-2 ring-primary ring-offset-2",
                  highlightedItemId === item.id && "scale-110 ring-4 ring-yellow-400 ring-offset-4 ring-offset-background shadow-[0_0_24px_rgba(250,204,21,0.9)]"
                )}>
                  {item.customSrc ? <img src={item.customSrc} alt={item.customName ?? "Custom icon"} className="h-full w-full object-contain pointer-events-none" draggable={false} /> : item.type === 'player' ? <div className="w-full h-full bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">P</div> : item.type === 'enemy' ? <div className="w-full h-full bg-red-500 text-white rounded-full flex items-center justify-center font-bold">E</div> : <Image src={iconMap[item.type]} alt={item.type} fill className="object-contain pointer-events-none" draggable={false} unoptimized />}
                  {selectedItem === item.id && (
                    <>
                      <button className="absolute -top-4 -left-4 w-6 h-6 bg-destructive text-white rounded-full flex items-center justify-center" onClick={(e) => { e.stopPropagation(); deleteSelection(); }}><Trash2 size={12}/></button>
                      <button
                        className="absolute -top-4 -right-4 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setInteraction({ type: 'rotate-item', startClientX: e.clientX, startClientY: e.clientY, initialItem: item, initialText: null, initialMarker: null });
                        }}
                        onTouchStart={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const touch = e.touches[0];
                          if (!touch) return;
                          setInteraction({ type: 'rotate-item', startClientX: touch.clientX, startClientY: touch.clientY, initialItem: item, initialText: null, initialMarker: null });
                        }}
                      ><RotateCw size={12}/></button>
                    </>
                  )}
                </div>
              </div>
            )})}
            {visibleLayers.texts && [...texts].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0)).map(text => (
              <div
                key={text.id}
                className={cn("absolute text-wrapper select-none whitespace-pre rounded px-1 leading-none", selectedText === text.id && "ring-2 ring-primary ring-offset-2")}
                style={{ left: text.x, top: text.y, color: text.color, fontSize: text.fontSize, fontWeight: text.bold ? 700 : 400, background: text.background ?? "transparent", textAlign: text.align ?? "left", transform: `rotate(${text.rotation}deg)`, textShadow: "0 1px 2px rgba(255,255,255,0.85)", zIndex: text.zIndex ?? 0 }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (lockedLayers.texts || text.locked || readOnly) return;
                  recordHistory();
                  setInteraction({ type: 'move-text', startClientX: e.clientX, startClientY: e.clientY, initialItem: null, initialText: text, initialMarker: null });
                  setSelectedText(text.id);
                  setSelectedItem(null);
                  setSelectedMarker(null);
                }}
                onTouchStart={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const touch = e.touches[0];
                  if (!touch) return;
                  if (lockedLayers.texts) return;
                  recordHistory();
                  setInteraction({ type: 'move-text', startClientX: touch.clientX, startClientY: touch.clientY, initialItem: null, initialText: text, initialMarker: null });
                  setSelectedText(text.id);
                  setSelectedItem(null);
                  setSelectedMarker(null);
                }}
              >
                {text.text}
              </div>
            ))}
            {visibleLayers.markers && markers.map(marker => (
              <button
                type="button"
                key={marker.id}
                className={cn("absolute flex max-w-[180px] items-center gap-2 rounded border bg-background/90 px-2 py-1 text-left text-xs shadow", selectedMarker === marker.id && "ring-2 ring-primary")}
                style={{ left: marker.x, top: marker.y, borderColor: marker.color }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (lockedLayers.markers || marker.locked || readOnly) return;
                  recordHistory();
                  setInteraction({ type: 'move-marker', startClientX: e.clientX, startClientY: e.clientY, initialItem: null, initialText: null, initialMarker: marker });
                  setSelectedMarker(marker.id);
                  setSelectedItem(null);
                  setSelectedText(null);
                  setSelectedItems([]);
                }}
                onTouchStart={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const touch = e.touches[0];
                  if (!touch) return;
                  if (lockedLayers.markers || marker.locked || readOnly) return;
                  recordHistory();
                  setInteraction({ type: 'move-marker', startClientX: touch.clientX, startClientY: touch.clientY, initialItem: null, initialText: null, initialMarker: marker });
                  setSelectedMarker(marker.id);
                  setSelectedItem(null);
                  setSelectedText(null);
                  setSelectedItems([]);
                }}
              >
                <MapPin className="h-4 w-4 shrink-0" style={{ color: marker.color }} />
                <span className="truncate font-semibold">{marker.label ? `${marker.label}: ${marker.title}` : marker.title}</span>
              </button>
            ))}
            {visibleLayers.markers && selectedMarkerData && (
              <div
                className="pointer-events-none absolute z-20 w-72 rounded-md border bg-background/95 p-3 text-left text-xs shadow-lg"
                style={{ left: selectedMarkerData.x, top: selectedMarkerData.y + 34, borderColor: selectedMarkerData.color }}
              >
                <div className="mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4 shrink-0" style={{ color: selectedMarkerData.color }} />
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{selectedMarkerData.label ? `${selectedMarkerData.label}: ${selectedMarkerData.title}` : selectedMarkerData.title}</p>
                    <p className="text-[11px] text-muted-foreground">{selectedMarkerData.category} · {selectedMarkerData.priority}</p>
                  </div>
                </div>
                {selectedMarkerData.description.trim() ? (
                  <p className="whitespace-pre-wrap break-words leading-relaxed">{selectedMarkerData.description}</p>
                ) : (
                  <p className="text-muted-foreground">{language === "es" ? "Sin descripcion" : "No description"}</p>
                )}
              </div>
            )}
            </div>
            <div className="pointer-events-none absolute bottom-3 right-3 h-28 w-44 overflow-hidden rounded border bg-background/90 shadow">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url(${selectedLayout})`,
                  backgroundSize: "contain",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
              />
              <div className="absolute inset-0 border-2 border-primary/70" />
              <div className="absolute left-2 top-2 rounded bg-background/80 px-2 py-1 text-[10px] font-semibold">
                {Math.round(zoom * 100)}%
              </div>
            </div>
            {exportOverlayVisible && (
              <>
                <div className="pointer-events-none absolute left-4 top-4 max-w-[60%] rounded-md border border-black/20 bg-white/95 px-4 py-2 text-left text-black shadow">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-black/60">{t.mapTrack}</p>
                  <p className="text-xl font-bold leading-tight">{selectedLayoutName}</p>
                </div>
                {readableMapNotes.trim() && (
                  <div className="pointer-events-none absolute bottom-4 right-4 top-4 w-[min(360px,36%)] overflow-hidden rounded-md border border-black/20 bg-white/95 p-4 text-left text-black shadow">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-black/60">{t.notes}</p>
                    <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                      {readableMapNotes.trim()}
                    </div>
                  </div>
                )}
              </>
            )}
            </div>
          </main>

          {!presentationMode && rightPanelOpen && <aside className="hidden w-96 shrink-0 flex-col border-l bg-card shadow-sm lg:flex">
            <div className="min-h-0 flex-1 overflow-y-auto p-6">
              {contextPanel}
            </div>
          </aside>}
        </div>

        {!presentationMode && <div className="shrink-0 bg-card border-t border-border p-3 z-50">
          <div className="flex items-center gap-3 mb-3 overflow-x-auto pb-1">
            <Button className="h-12 px-4 text-base" variant={mode === 'place' ? 'default' : 'outline'} onClick={() => { setMode('place'); setSelectedItemForPlacement(null); }}><MousePointer className="mr-2 h-5 w-5"/> {t.place}</Button>
            <Button className="h-12 px-4 text-base" variant={mode === 'draw' ? 'default' : 'outline'} onClick={() => setMode('draw')}><Pen className="mr-2 h-5 w-5"/> {t.draw}</Button>
            <Button className="h-12 px-4 text-base" variant={mode === 'text' ? 'default' : 'outline'} onClick={() => setMode('text')}><Type className="mr-2 h-5 w-5"/> {t.text}</Button>
            <Button className="h-12 px-4 text-base" variant={mode === 'marker' ? 'default' : 'outline'} onClick={() => setMode('marker')}><MapPin className="mr-2 h-5 w-5"/> Marker</Button>
            <Button className="h-12 px-4 text-base" variant={mode === 'measure' ? 'default' : 'outline'} onClick={() => setMode('measure')}><Ruler className="mr-2 h-5 w-5"/> Measure</Button>
            <Button className="h-12 px-4 text-base" variant={mode === 'erase' ? 'default' : 'outline'} onClick={() => setMode('erase')}><Eraser className="mr-2 h-5 w-5"/> {t.erase}</Button>
            <Button className="h-12 px-4 text-base" variant={mode === 'heatmap' ? 'default' : 'outline'} onClick={() => setMode('heatmap')}><Circle className="mr-2 h-5 w-5"/> Heat</Button>
            <Button className="h-12 px-4 text-base" variant={mode === 'route' ? 'default' : 'outline'} onClick={() => setMode('route')}><ArrowRight className="mr-2 h-5 w-5"/> {t.route}</Button>
            <Button className="h-12 px-4 text-base" variant={mode === 'pan' ? 'default' : 'outline'} onClick={() => setMode('pan')}><MousePointer className="mr-2 h-5 w-5"/> {t.pan}</Button>
            <Button className="h-12 w-12 shrink-0" variant="outline" size="icon" onClick={undo}><Undo2 className="h-5 w-5"/></Button>
            <Button className="h-12 w-12 shrink-0" variant="outline" size="icon" onClick={redo}><Redo2 className="h-5 w-5"/></Button>
            <Button className="h-12 w-12 shrink-0" variant="outline" size="icon" disabled={!selectedItemData && !selectedTextData} onClick={duplicateSelection}><Copy className="h-5 w-5"/></Button>
            <Button className="h-12 w-12 shrink-0" variant="outline" size="icon" disabled={!selectedItemData && !selectedTextData} onClick={resetSelectionTransform}><RefreshCw className="h-5 w-5"/></Button>
            <Button className="h-12 w-12 shrink-0" variant="outline" size="icon" disabled={!selectedItemData && !selectedTextData} onClick={deleteSelection}><Trash2 className="h-5 w-5"/></Button>
            <Button className="h-12 w-12 shrink-0" variant="outline" size="icon" onClick={clearCanvas}><Eraser className="h-5 w-5"/></Button>
          </div>
          <ScrollArea className="w-full whitespace-nowrap">
            {mode === 'place' && (
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <Input
                  value={paletteFilter}
                  onChange={(e) => setPaletteFilter(e.target.value)}
                  placeholder={t.searchObject}
                  className="h-11 max-w-sm text-base"
                />
                <Select value={itemCategory} onValueChange={setItemCategory}>
                  <SelectTrigger className="h-11 w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.all}</SelectItem>
                    <SelectItem value="items">{t.items}</SelectItem>
                    <SelectItem value="power">Power-ups</SelectItem>
                    <SelectItem value="weapons">{t.weapons}</SelectItem>
                    <SelectItem value="drivers">{language === "es" ? "Pilotos" : "Drivers"}</SelectItem>
                  </SelectContent>
                </Select>
                <Button type="button" variant="outline" className="h-11" onClick={() => customIconInputRef.current?.click()}><Upload className="mr-2 h-4 w-4" />{t.customIcon}</Button>
                <input type="file" ref={customIconInputRef} hidden accept="image/*" onChange={handleCustomIconUpload} />
                <span className="text-sm text-muted-foreground">{categorizedItems.length} objetos</span>
              </div>
            )}
            <div className="flex gap-3 p-1">
              {mode === 'place' ? (
                <>
                  {categorizedItems.map(item => (
                    <button type="button" key={item.type} draggable onDragStart={(e) => handleItemDragStart(e, item.type)} onClick={() => { setSelectedCustomIcon(null); setSelectedItemForPlacement(item.type); }} className={cn("p-3 min-w-[96px] h-[96px] border rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all", selectedItemForPlacement === item.type && !selectedCustomIcon ? "bg-primary/20 ring-2 ring-primary" : "hover:bg-accent")}>
                      <div className="relative w-12 h-12">{item.type === 'player' ? 'P' : item.type === 'enemy' ? 'E' : <Image src={iconMap[item.type]} alt={item.name} fill className="object-contain" unoptimized />}</div>
                      <span className="text-xs mt-2 text-center truncate w-full">{item.name}</span>
                    </button>
                  ))}
                  {customIcons.map(icon => (
                    <button type="button" key={icon.id} draggable onDragStart={(e) => handleItemDragStart(e, 'custom-icon', icon.id)} onClick={() => { setSelectedCustomIcon(icon.id); setSelectedItemForPlacement('custom-icon'); }} className={cn("p-3 min-w-[96px] h-[96px] border rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all", selectedCustomIcon === icon.id && selectedItemForPlacement === 'custom-icon' ? "bg-primary/20 ring-2 ring-primary" : "hover:bg-accent")}>
                      <img src={icon.src} alt={icon.name} className="h-12 w-12 object-contain" />
                      <span className="text-xs mt-2 text-center truncate w-full">{icon.name}</span>
                    </button>
                  ))}
                  {categorizedItems.length === 0 && customIcons.length === 0 && (
                    <div className="flex h-[96px] min-w-[220px] items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
                      {t.noResults}
                    </div>
                  )}
                </>
              ) : (
                <div className="min-w-[280px] p-2 lg:hidden">
                  {notesPanel}
                  {contextPanel}
                </div>
              )}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>}
      </div>
    </TooltipProvider>
  );
}
