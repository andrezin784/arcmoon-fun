/**
 * Upload de imagens com múltiplos serviços e logs detalhados.
 * Ordem de tentativa: ImgBB (API key pública) -> catbox.moe -> keep.sh
 */

// API key pública do ImgBB (free tier)
const IMGBB_API_KEY = 'e3fcaa6a6bb856e3db64ab9cd2e0ef81';

/**
 * Convert File/Blob to Base64
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1]; // remove data:image/...;base64,
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Upload via ImgBB
 */
async function uploadImageToImgBB(file: File | string): Promise<string> {
  console.log('📤 [1/3] ImgBB...');
  let imageBase64: string;

  if (typeof file === 'string') {
    imageBase64 = file.split(',')[1];
  } else {
    imageBase64 = await blobToBase64(file);
  }

  const formData = new FormData();
  formData.append('image', imageBase64);

  const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  console.log('📥 ImgBB response:', data);

  if (data?.success && data.data?.url) {
    console.log('✅ ImgBB OK:', data.data.url);
    return data.data.url;
  }

  throw new Error(data?.error?.message || 'ImgBB upload failed');
}

/**
 * Upload via catbox.moe (sem API key)
 */
async function uploadImageToCatbox(file: File): Promise<string> {
  console.log('📤 [2/3] catbox.moe...');

  const formData = new FormData();
  formData.append('reqtype', 'fileupload');
  formData.append('fileToUpload', file);

  const response = await fetch('https://catbox.moe/user/api.php', {
    method: 'POST',
    body: formData,
  });

  const text = await response.text();
  console.log('📥 catbox response:', text);

  if (response.ok && text.startsWith('https://files.catbox.moe/')) {
    console.log('✅ catbox OK:', text.trim());
    return text.trim();
  }

  throw new Error(`catbox upload failed: ${response.status} ${text}`);
}

/**
 * Upload via keep.sh (sem API key)
 */
async function uploadImageToKeepSH(blob: Blob): Promise<string> {
  console.log('📤 [3/3] keep.sh...');

  const response = await fetch('https://free.keep.sh', {
    method: 'POST',
    body: blob,
  });

  const text = await response.text();
  console.log('📥 keep.sh response:', response.status, text);

  if (response.ok && text.startsWith('https://')) {
    console.log('✅ keep.sh OK:', text.trim());
    return text.trim();
  }

  throw new Error(`keep.sh upload failed: ${response.status} ${text}`);
}

/**
 * Função principal com fallbacks e mensagens ricas.
 */
export async function uploadImage(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image');
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('Image must be smaller than 10MB');
  }

  console.log('🖼️ Processing image:', file.size, 'bytes', file.type);

  const errors: string[] = [];

  // 1) ImgBB
  try {
    return await uploadImageToImgBB(file);
  } catch (err: any) {
    console.warn('⚠️ ImgBB falhou:', err?.message || err);
    errors.push(`ImgBB: ${err?.message || err}`);
  }

  // 2) catbox.moe
  try {
    return await uploadImageToCatbox(file);
  } catch (err: any) {
    console.warn('⚠️ catbox falhou:', err?.message || err);
    errors.push(`catbox: ${err?.message || err}`);
  }

  // 3) keep.sh
  try {
    return await uploadImageToKeepSH(file);
  } catch (err: any) {
    console.warn('⚠️ keep.sh falhou:', err?.message || err);
    errors.push(`keep.sh: ${err?.message || err}`);
  }

  console.error('❌ Todos os serviços falharam:', errors.join(' | '));
  throw new Error('Failed to upload image. ' + errors.join(' | '));
}
