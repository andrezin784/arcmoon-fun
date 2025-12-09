/**
 * Upload de imagens via API interna (evita CORS). A API interna tentará:
 * 1) catbox.moe (sem chave) -> 2) keep.sh (sem chave)
 * Se mesmo assim falhar, cai no ImgBB público como último recurso.
 */

const IMGBB_API_KEY = 'e3fcaa6a6bb856e3db64ab9cd2e0ef81';

async function uploadViaInternalAPI(file: File): Promise<string> {
  console.log('📤 [API interna] enviando para /api/upload');
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  const data = await res.json().catch(() => ({}));
  console.log('📥 /api/upload response:', res.status, data);

  if (res.ok && data?.url) return data.url;

  throw new Error(data?.error || `API interna falhou (${res.status})`);
}

// Fallback direto para ImgBB (caso API interna falhe)
async function uploadToImgBBDirect(file: File): Promise<string> {
  console.log('📤 [fallback] ImgBB direto...');

  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const formData = new FormData();
  formData.append('image', base64);

  const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
    method: 'POST',
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  console.log('📥 ImgBB response:', res.status, data);

  if (data?.success && data?.data?.url) {
    console.log('✅ ImgBB OK:', data.data.url);
    return data.data.url;
  }

  throw new Error(data?.error?.message || 'ImgBB upload failed');
}

export async function uploadImage(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('File must be an image');
  if (file.size > 10 * 1024 * 1024) throw new Error('Image must be smaller than 10MB');

  console.log('🖼️ Processing image:', file.size, 'bytes', file.type);

  try {
    return await uploadViaInternalAPI(file);
  } catch (err1: any) {
    console.warn('⚠️ API interna falhou:', err1?.message || err1);
  }

  // Fallback final direto para ImgBB (pode falhar se quota/key inválida)
  return await uploadToImgBBDirect(file);
}
