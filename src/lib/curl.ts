import { exportAsCurl } from './tauri';

export async function copyAsCurl(id: string): Promise<void> {
  const curl = await exportAsCurl(id);
  await navigator.clipboard.writeText(curl);
}
