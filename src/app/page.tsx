
import { KartographerClient } from "@/components/kartographer-client";
import fs from 'fs';
import path from 'path';

export default function Home() {
  // Correctly point to the public/maps directory for web-accessible images.
  const mapsDirectory = path.join(process.cwd(), 'public', 'maps');
  let layoutObjects = [];

  try {
    // Check if the directory exists before trying to read it.
    if (fs.existsSync(mapsDirectory)) {
      const mapFiles = fs.readdirSync(mapsDirectory);
      layoutObjects = mapFiles
        .filter(file => /\.(png|jpg|jpeg|webp)$/i.test(file))
        .map(file => {
          const layoutName = file.replace(/\.[^/.]+$/, "").replace(/[_-]/g, ' ');
          return {
            name: layoutName.replace(/\b\w/g, l => l.toUpperCase()),
            // The URL path is now correct because the files are in `public/maps`.
            image: `/maps/${file}`,
            hint: layoutName.toLowerCase(),
          };
        });
    }
  } catch (error) {
    console.error("Could not read maps directory:", error);
    // Fallback to default layouts in case of an error.
  }
  
  // Add default placeholder layouts if no custom maps are found in public/maps.
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
