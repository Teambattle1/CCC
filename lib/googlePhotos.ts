const API_BASE = 'https://photoslibrary.googleapis.com/v1';

export interface GoogleAlbum {
  id: string;
  title: string;
  productUrl: string;
  mediaItemsCount: string;
  coverPhotoBaseUrl: string;
  coverPhotoMediaItemId: string;
}

export interface GoogleMediaItem {
  id: string;
  description?: string;
  productUrl: string;
  baseUrl: string;
  mimeType: string;
  mediaMetadata: {
    creationTime: string;
    width: string;
    height: string;
  };
  filename: string;
}

export async function fetchAlbums(accessToken: string): Promise<GoogleAlbum[]> {
  const albums: GoogleAlbum[] = [];
  let pageToken: string | undefined;

  do {
    const url = new URL(`${API_BASE}/albums`);
    url.searchParams.set('pageSize', '50');
    if (pageToken) url.searchParams.set('pageToken', pageToken);

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) throw new Error(`Failed to fetch albums: ${res.status}`);

    const data = await res.json();
    if (data.albums) albums.push(...data.albums);
    pageToken = data.nextPageToken;
  } while (pageToken);

  return albums;
}

export async function fetchMediaItems(
  accessToken: string,
  albumId: string
): Promise<GoogleMediaItem[]> {
  const items: GoogleMediaItem[] = [];
  let pageToken: string | undefined;

  do {
    const res = await fetch(`${API_BASE}/mediaItems:search`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        albumId,
        pageSize: 100,
        ...(pageToken && { pageToken }),
      }),
    });
    if (!res.ok) throw new Error(`Failed to fetch media items: ${res.status}`);

    const data = await res.json();
    if (data.mediaItems) items.push(...data.mediaItems);
    pageToken = data.nextPageToken;
  } while (pageToken);

  return items;
}

export async function uploadPhoto(
  accessToken: string,
  file: File,
  albumId: string
): Promise<void> {
  // Step 1: Upload bytes
  const uploadRes = await fetch(`${API_BASE}/uploads`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/octet-stream',
      'X-Goog-Upload-Content-Type': file.type,
      'X-Goog-Upload-Protocol': 'raw',
    },
    body: file,
  });
  if (!uploadRes.ok) throw new Error(`Upload failed: ${uploadRes.status}`);

  const uploadToken = await uploadRes.text();

  // Step 2: Create media item in album
  const createRes = await fetch(`${API_BASE}/mediaItems:batchCreate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      albumId,
      newMediaItems: [
        {
          description: file.name,
          simpleMediaItem: { fileName: file.name, uploadToken },
        },
      ],
    }),
  });
  if (!createRes.ok) throw new Error(`Create media item failed: ${createRes.status}`);
}
