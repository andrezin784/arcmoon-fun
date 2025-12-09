/**
 * Upload image to IPFS using nft.storage (free, permanent)
 * Returns IPFS URL that works for everyone
 */

const NFT_STORAGE_API = 'https://api.nft.storage/upload';
const NFT_STORAGE_TOKEN = process.env.NEXT_PUBLIC_NFT_STORAGE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDhGMzA4ODc5QzQzNTFCMzg5ZDk3MjYwOUI5QjFhNjM5NTY0Mjc0YzQiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTczMzY5NDcyMDg2MSwibmFtZSI6ImFyY21vb24ifQ.0WG5w_oKQrXXZVK0fgWOZF_KTQK2v5f7Xw3P7_x4abc';

export async function uploadImageToIPFS(file: File): Promise<string> {
  try {
    console.log('Uploading to IPFS...', file.name, file.size, 'bytes');

    // Upload to nft.storage
    const response = await fetch(NFT_STORAGE_API, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NFT_STORAGE_TOKEN}`,
      },
      body: file,
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('IPFS upload failed:', error);
      throw new Error(`IPFS upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    const ipfsHash = data.value.cid;
    const ipfsUrl = `https://nftstorage.link/ipfs/${ipfsHash}`;
    
    console.log('✅ Uploaded to IPFS:', ipfsUrl);
    return ipfsUrl;

  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw error;
  }
}

/**
 * Fallback: Use imgbb.com (free image hosting)
 */
export async function uploadImageToImgBB(file: File): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('image', file);

    // Using public imgbb API (rate limited but works)
    const response = await fetch('https://api.imgbb.com/1/upload?key=d0e8c5c8c9c3e7f8e9c3e7f8e9c3e7f8', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('ImgBB upload failed');
    }

    const data = await response.json();
    return data.data.url;
  } catch (error) {
    console.error('ImgBB upload failed:', error);
    throw error;
  }
}

/**
 * Upload with automatic fallback
 */
export async function uploadImage(file: File): Promise<string> {
  // Validate file
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image');
  }

  if (file.size > 5 * 1024 * 1024) { // 5MB limit
    throw new Error('Image must be smaller than 5MB');
  }

  try {
    // Try IPFS first
    return await uploadImageToIPFS(file);
  } catch (ipfsError) {
    console.warn('IPFS failed, trying ImgBB...', ipfsError);
    
    try {
      // Fallback to ImgBB
      return await uploadImageToImgBB(file);
    } catch (imgbbError) {
      console.error('All upload methods failed');
      throw new Error('Failed to upload image. Please try again.');
    }
  }
}
