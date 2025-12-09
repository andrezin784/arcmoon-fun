import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

async function uploadToTelegraph(file: Blob, filename: string) {
  const formData = new FormData();
  formData.append('file', file, filename);

  const res = await fetch('https://telegra.ph/upload', {
    method: 'POST',
    body: formData,
  });

  const data = await res.json().catch(() => null);
  if (Array.isArray(data) && data[0]?.src) {
    return `https://telegra.ph${data[0].src}`;
  }
  throw new Error(`telegraph ${res.status}: ${JSON.stringify(data)}`);
}

async function uploadToCatbox(file: Blob, filename: string) {
  const formData = new FormData();
  formData.append('reqtype', 'fileupload');
  formData.append('fileToUpload', file, filename);

  const res = await fetch('https://catbox.moe/user/api.php', {
    method: 'POST',
    body: formData,
  });

  const text = await res.text();
  if (res.ok && text.startsWith('https://files.catbox.moe/')) {
    return text.trim();
  }
  throw new Error(`catbox ${res.status}: ${text}`);
}

async function uploadToKeep(file: Blob) {
  const res = await fetch('https://free.keep.sh', {
    method: 'POST',
    body: file,
  });
  const text = await res.text();
  if (res.ok && text.startsWith('https://')) {
    return text.trim();
  }
  throw new Error(`keep.sh ${res.status}: ${text}`);
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: 'Arquivo não enviado' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Somente imagens são permitidas' }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Imagem deve ser menor que 10MB' }, { status: 400 });
    }

    const filename = (file as any).name || 'upload.png';

    // 1) telegraph (no-key, estável)
    try {
      const url = await uploadToTelegraph(file, filename);
      return NextResponse.json({ url });
    } catch (err) {
      console.warn('telegraph falhou, tentando catbox', err);
    }

    // 2) catbox
    try {
      const url = await uploadToCatbox(file, filename);
      return NextResponse.json({ url });
    } catch (err) {
      console.warn('catbox falhou, tentando keep.sh', err);
    }

    // 3) keep.sh
    const url = await uploadToKeep(file);
    return NextResponse.json({ url });
  } catch (error: any) {
    console.error('API upload error', error);
    return NextResponse.json({ error: error?.message || 'Falha no upload' }, { status: 500 });
  }
}
