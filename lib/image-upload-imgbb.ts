/**
 * Upload de imagens usando ImgBB (gratuito, público, confiável)
 * Funciona em todos os dispositivos
 */

// API key pública do ImgBB (free tier)
const IMGBB_API_KEY = 'YOUR_IMGBB_API_KEY'; // Você pode pegar grátis em https://api.imgbb.com/

/**
 * Convert File/Blob to Base64
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (data:image/png;base64,)
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Upload image to ImgBB
 * Returns public URL accessible by everyone
 */
export async function uploadImageToImgBB(file: File | string): Promise<string> {
  try {
    console.log('📤 Uploading to ImgBB...');

    let imageBase64: string;

    // Se já é base64 string, usa direto
    if (typeof file === 'string') {
      imageBase64 = file.split(',')[1]; // Remove data:image prefix
    } else {
      // Convert file to base64
      imageBase64 = await blobToBase64(file);
    }

    // Upload usando FormData
    const formData = new FormData();
    formData.append('key', IMGBB_API_KEY);
    formData.append('image', imageBase64);

    const response = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`ImgBB upload failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error('ImgBB upload failed');
    }

    const imageUrl = data.data.url;
    console.log('✅ Image uploaded:', imageUrl);

    return imageUrl;

  } catch (error) {
    console.error('❌ ImgBB error:', error);
    throw error;
  }
}

/**
 * Upload to catbox.moe (sem API key, confiável, permanente)
 */
export async function uploadImageToCatbox(file: File): Promise<string> {
  try {
    console.log('📤 Uploading to catbox.moe...');

    const formData = new FormData();
    formData.append('reqtype', 'fileupload');
    formData.append('fileToUpload', file);

    const response = await fetch('https://catbox.moe/user/api.php', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('catbox upload failed');
    }

    const url = await response.text();
    
    if (!url.startsWith('https://files.catbox.moe/')) {
      throw new Error('Invalid catbox response');
    }

    console.log('✅ Image uploaded:', url.trim());
    return url.trim();

  } catch (error) {
    console.error('❌ catbox error:', error);
    throw error;
  }
}

/**
 * Main upload function with multiple fallbacks
 */
export async function uploadImage(file: File): Promise<string> {
  // Validate
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image');
  }

  if (file.size > 10 * 1024 * 1024) {
    throw new Error('Image must be smaller than 10MB');
  }

  console.log('🖼️ Processing image:', file.size, 'bytes');

  try {
    // Try catbox.moe first (no API key, very reliable)
    const url = await uploadImageToCatbox(file);
    console.log('✅ Upload successful! URL:', url);
    return url;
  } catch (error: any) {
    console.error('❌ Upload failed:', error.message);
    throw new Error('Failed to upload image. Please try again.');
  }
}
