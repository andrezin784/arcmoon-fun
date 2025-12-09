// Sistema de upload de imagens para tokens

const IMAGE_STORAGE_KEY = 'moon_fun_images';

export interface StoredImage {
  id: string;
  dataUrl: string;
  createdAt: number;
}

// Converter arquivo para base64
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

// Comprimir imagem antes de salvar (retorna blob + dataUrl)
export async function compressImage(
  file: File,
  maxSize: number = 512
): Promise<{ blob: Blob; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        // Redimensionar mantendo proporção
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        // Converter para JPEG com qualidade 0.8
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        const byteString = atob(dataUrl.split(',')[1]);
        const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: mimeString });
        resolve({ blob, dataUrl });
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
}

// Salvar imagem no localStorage
export function saveImage(id: string, dataUrl: string): void {
  if (typeof window === 'undefined') return;
  
  const images = getStoredImages();
  images[id] = {
    id,
    dataUrl,
    createdAt: Date.now(),
  };
  
  localStorage.setItem(IMAGE_STORAGE_KEY, JSON.stringify(images));
}

// Obter todas as imagens armazenadas
export function getStoredImages(): Record<string, StoredImage> {
  if (typeof window === 'undefined') return {};
  
  const stored = localStorage.getItem(IMAGE_STORAGE_KEY);
  if (!stored) return {};
  
  try {
    return JSON.parse(stored);
  } catch {
    return {};
  }
}

// Obter imagem por ID
export function getImage(id: string): string | null {
  const images = getStoredImages();
  return images[id]?.dataUrl || null;
}

// Gerar ID único para imagem
export function generateImageId(): string {
  return `img_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

