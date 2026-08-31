// StoryNest High-Resolution Visual Assets & Preset Avatars

export const ABOUT_HERO_WALLPAPER_IMAGE =
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2000&auto=format&fit=crop&sat=-100&contrast=120';

export const NITHIN_REDDY_AVATAR_URL =
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop';

export interface AvatarPreset {
  id: string;
  name: string;
  url: string;
  tag: string;
}

export const AVATAR_PRESETS: AvatarPreset[] = [
  {
    id: 'nithin-reddy-og',
    name: 'Nithin Reddy (Signature Katana & Suit)',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600',
    tag: 'Founder & Author',
  },
  {
    id: 'cinematic-author',
    name: 'Cinematic Noir Author',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600',
    tag: 'Mystery & Thriller',
  },
  {
    id: 'vintage-writer',
    name: 'Vintage Storyteller',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=600',
    tag: 'Romance & Real Life',
  },
  {
    id: 'poet-creator',
    name: 'Soulful Poet',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=600',
    tag: 'Poetry & Reflections',
  },
  {
    id: 'urban-chronicler',
    name: 'Urban Chronicler',
    url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=600',
    tag: 'Drama & Life Lessons',
  },
  {
    id: 'thoughtful-scholar',
    name: 'Thoughtful Scholar',
    url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=600',
    tag: 'Philosophy & Essays',
  },
];
