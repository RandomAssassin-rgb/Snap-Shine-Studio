import { bootstrapCameraKit, CameraKitSession, Lens } from '@snap/camera-kit';

let cameraKitInstance: any = null;
let currentSession: CameraKitSession | null = null;
let availableLenses: Lens[] = [];

// Fallback to empty string to avoid crashes if env is missing
const API_TOKEN = import.meta.env.VITE_SNAP_API_TOKEN || "";
// We will use the user's provided Demo Lens Group ID for now
const LENS_GROUP_ID = import.meta.env.VITE_SNAP_LENS_GROUP_ID || "71ce4e79-1fdc-49a6-bd72-5542c189342d";

export async function initCameraKit(): Promise<CameraKitSession | null> {
  if (!API_TOKEN) {
    console.warn("Snap Camera Kit API Token is missing. Please add VITE_SNAP_API_TOKEN to .env");
    return null;
  }

  try {
    if (!cameraKitInstance) {
      cameraKitInstance = await bootstrapCameraKit({ apiToken: API_TOKEN });
    }

    if (!currentSession) {
      currentSession = await cameraKitInstance.createSession();
      // Load the lens group
      const lensGroup = await cameraKitInstance.lensRepository.loadLensGroups([LENS_GROUP_ID]);
      // Extract lenses from the group
      availableLenses = lensGroup?.lenses || [];
      console.log(`Loaded ${availableLenses.length} lenses from group ${LENS_GROUP_ID}`);
    }

    return currentSession;
  } catch (error) {
    console.error("Failed to initialize Snap Camera Kit:", error);
    return null;
  }
}

export function getAvailableLenses(): Lens[] {
  return availableLenses;
}

export async function applyLens(lensId: string) {
  if (!currentSession) return;
  const lens = availableLenses.find(l => l.id === lensId);
  if (lens) {
    await currentSession.applyLens(lens);
  } else {
    // If we pass an empty string or normal filter, remove the lens
    await currentSession.removeLens();
  }
}

export async function setCameraKitStream(mediaStream: MediaStream, renderTarget: HTMLCanvasElement) {
  if (!currentSession) return;
  
  // Set the source stream (the webcam)
  await currentSession.setSource(mediaStream);
  
  // Set the output canvas where the AR is rendered
  currentSession.play(renderTarget);
}

export function destroyCameraKitSession() {
  if (currentSession) {
    currentSession.pause();
    currentSession = null;
  }
}
