/**
 * Upload via API interna (/api/upload) para evitar CORS.
 * Ordem no servidor: telegraph -> catbox -> keep.
 */

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

export async function uploadImage(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('File must be an image');
  if (file.size > 10 * 1024 * 1024) throw new Error('Image must be smaller than 10MB');

  console.log('🖼️ Processing image:', file.size, 'bytes', file.type);

  // Apenas API interna (sem ImgBB externo para evitar chave inválida)
  return await uploadViaInternalAPI(file);
}
