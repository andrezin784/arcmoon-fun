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
  const API_KEY = 'e3fcaa6a6bb856e3db64ab9cd2e0ef81'; // Free public key
  
  try {
    console.log('📤 [3/3] Trying ImgBB...');

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
    formData.append('image', imageBase64);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${API_KEY}`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    console.log('📥 ImgBB response:', data);

    if (data.success && data.data?.url) {
      console.log('✅ ImgBB SUCCESS:', data.data.url);
      return data.data.url;
    }

    throw new Error(data.error?.message || 'ImgBB upload failed');

  } catch (error: any) {
    console.error('❌ ImgBB FAILED:', error.message);
    throw error;
  }
}

/**
 * Upload to catbox.moe (sem API key, confiável, permanente)
 */
export async function uploadImageToCatbox(file: File): Promise<string> {
  try {
    console.log('📤 [1/3] Trying catbox.moe...');

    const formData = new FormData();
    formData.append('reqtype', 'fileupload');
    formData.append('fileToUpload', file);

    const response = await fetch('https://catbox.moe/user/api.php', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ catbox status:', response.status, errorText);
      throw new Error(`catbox upload failed: ${response.status}`);
    }

    const url = await response.text();
    console.log('📥 catbox response:', url);
    
    if (!url || !url.startsWith('https://files.catbox.moe/')) {
      throw new Error(`Invalid catbox response: ${url}`);
    }

    console.log('✅ catbox.moe SUCCESS:', url.trim());
    return url.trim();

  } catch (error: any) {
    console.error('❌ catbox.moe FAILED:', error.message);
    throw error;
  }
}

/**
 * Upload to postimages.org (alternativa confiável)
 */
export async function uploadImageToPostImages(file: File): Promise<string> {
  try {
    console.log('📤 [2/3] Trying postimages.org...');

    const formData = new FormData();
    formData.append('upload', file);

    const response = await fetch('https://postimages.org/json/rr', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`postimages failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('📥 postimages response:', data);

    if (data.status === 'OK' && data.url) {
      console.log('✅ postimages.org SUCCESS:', data.url);
      return data.url;
    }

    throw new Error('Invalid postimages response');

  } catch (error: any) {
    console.error('❌ postimages.org FAILED:', error.message);
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

  console.log('🖼️ Processing image:', file.size, 'bytes', file.type);
  console.log('🔄 Trying 3 upload services...');

  // Try catbox.moe first (no API key, very reliable)
  try {
    return await uploadImageToCatbox(file);
  } catch (error1: any) {
    console.warn('⚠️ Catbox failed, trying postimages...');
  }

  // Try postimages.org as second option
  try {
    return await uploadImageToPostImages(file);
  } catch (error2: any) {
    console.warn('⚠️ Postimages failed, trying ImgBB...');
  }

  // Try ImgBB as final fallback
  try {
    return await uploadImageToImgBB(file);
  } catch (error3: any) {
    console.error('❌ ALL SERVICES FAILED');
    console.error('Catbox:', error3);
    throw new Error('Failed to upload image. All services unavailable. Please try again later.');
  }
}
