export type Album = {
  id: string;
  name: string;
  emoji: string;
  slug: string;
  country_code: string;
  country_name: string;
  cover_path: string | null;
  pin_hash: string | null;
};

export type Media = {
  id: string;
  album_id: string;
  storage_path: string;
  mime_type: string;
  created_at: string;
};
