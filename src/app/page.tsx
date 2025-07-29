
import { KartographerClient } from "@/components/kartographer-client";
import fs from 'fs';
import path from 'path';

export default function Home() {
  const mapsDirectory = path.join(process.cwd(), 'src', 'components', 'Maps');
  let layoutObjects = [];

  try {
    const mapFiles = fs.readdirSync(mapsDirectory);
    layoutObjects = mapFiles
      .filter(file => /\.(png|jpg|jpeg|webp)$/i.test(file))
      .map(file => {
        const layoutName = file.replace(/\.[^/.]+$/, "").replace(/[_-]/g, ' ');
        return {
          name: layoutName.replace(/\b\w/g, l => l.toUpperCase()),
          image: `/maps/${file}`, // The URL path will be relative to the public directory
          hint: layoutName.toLowerCase(),
        };
      });
  } catch (error) {
    console.error("Could not read maps directory:", error);
    // Provide a default or empty layout list in case of an error
  }
  
  // Add default layouts if no custom maps are found
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
