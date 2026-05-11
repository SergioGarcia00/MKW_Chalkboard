
import { KartographerClient } from "@/components/kartographer-client";
import fs from 'fs';
import path from 'path';

const mapDisplayNames: Record<string, string> = {
  Acorn_Heights: "Acorn Heights",
  Airship_Fortress: "Airship Fortress",
  BooCinema: "Boo Cinema",
  Bowsers_Caslte: "Bowser's Castle",
  Cheep_Cheep_Falls: "Cheep Cheep Falls",
  Choco_Mountain: "Choco Mountain",
  Crown_City_Route: "Crown City Route",
  DandelionDepths: "Dandelion Depths",
  Desert_Hills: "Desert Hills",
  Dino_Dino_Jungle: "Dino Dino Jungle",
  DK_Pass: "DK Pass",
  DK_Spaceport: "DK Spaceport",
  Dry_Bones_Burnout: "Dry Bones Burnout",
  Faraway_Oasis: "Faraway Oasis",
  GreatQBlockRuins: "Great ? Block Ruins",
  Koopa_Troopa_beach: "Koopa Troopa Beach",
  MarioCircuit: "Mario Circuit",
  MooMooMeadows: "Moo Moo Meadows",
  Peach_Stadium: "Peach Stadium",
  PeachBeach_Map: "Peach Beach",
  Rainbow_Road: "Rainbow Road",
  Salty_Salty_Speedway: "Salty Salty Speedway",
  Shy_Guy_Bazaar: "Shy Guy Bazaar",
  "Sky-High_Sundae": "Sky-High Sundae",
  Starview_Peak: "Starview Peak",
  ToadFactory: "Toad Factory",
  Wario_Shipyard: "Wario Shipyard",
  Wario_Stadium: "Wario Stadium",
  Whistlestop_Summit: "Whistlestop Summit",
};

export default function Home() {
  const mapsDirectory = path.join(process.cwd(), 'src', 'components', 'Maps');
  let layoutObjects: { name: string; image: string; hint: string; }[] = [];

  try {
    if (fs.existsSync(mapsDirectory)) {
      const mapFiles = fs.readdirSync(mapsDirectory);
      layoutObjects = mapFiles
        .filter(file => /\.(png|jpg|jpeg|webp)$/i.test(file))
        .map(file => {
          const baseName = file.replace(/\.[^/.]+$/, "");
          let displayName = mapDisplayNames[baseName] ?? baseName; 

          // Apply specific replacements for user-friendly names
          if (!mapDisplayNames[baseName]) {
            displayName = displayName.replace(/^\d+px-/, ''); 
            displayName = displayName.replace(/[_-]/g, ' '); 
            displayName = displayName.replace(/MKWorld/g, '');
            displayName = displayName.replace(/Map/g, ''); 
            displayName = displayName.replace(/([a-z])([A-Z])/g, '$1 $2'); 
            displayName = displayName.replace(/\s+/g, ' ').trim(); 
          }

          const imagePath = path.join(mapsDirectory, file);
          const imageBuffer = fs.readFileSync(imagePath);
          const imageBase64 = imageBuffer.toString('base64');
          
          // Determine MIME type from file extension
          const ext = path.extname(file).toLowerCase();
          let mimeType = 'image/png'; // default
          if (ext === '.jpg' || ext === '.jpeg') {
            mimeType = 'image/jpeg';
          } else if (ext === '.webp') {
            mimeType = 'image/webp';
          }

          const dataUri = `data:${mimeType};base64,${imageBase64}`;

          return {
            name: displayName.replace(/\b\w/g, l => l.toUpperCase()),
            image: dataUri,
            hint: displayName.toLowerCase(),
          };
        })
        .sort((a, b) => a.name.localeCompare(b.name));
    }
  } catch (error) {
    console.error("Could not read maps directory:", error);
  }
  
  // Add default placeholder layouts if no custom maps are found.
  if (layoutObjects.length === 0) {
      layoutObjects.push({ name: "Luigi Circuit", image: "https://placehold.co/1024x768.png", hint: "race track" });
      layoutObjects.push({ name: "Moo Moo Meadows", image: "https://placehold.co/1024x768.png", hint: "farm track" });
      layoutObjects.push({ name: "Mushroom Gorge", image: "https://placehold.co/1024x768.png", hint: "mushroom track" });
  }

  return (
    <main>
      <KartographerClient initialLayouts={layoutObjects} />
    </main>
  );
}
