
import { KartographerClient } from "@/components/kartographer-client";
import fs from 'fs';
import path from 'path';

export default function Home() {
  const mapsDirectory = path.join(process.cwd(), 'src', 'components', 'Maps');
  let layoutObjects = [];

  try {
    if (fs.existsSync(mapsDirectory)) {
      const mapFiles = fs.readdirSync(mapsDirectory);
      layoutObjects = mapFiles
        .filter(file => /\.(png|jpg|jpeg|webp)$/i.test(file))
        .map(file => {
          const layoutName = file.replace(/\.[^/.]+$/, "").replace(/[_-]/g, ' ');
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
            name: layoutName.replace(/\b\w/g, l => l.toUpperCase()),
            image: dataUri,
            hint: layoutName.toLowerCase(),
          };
        });
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
