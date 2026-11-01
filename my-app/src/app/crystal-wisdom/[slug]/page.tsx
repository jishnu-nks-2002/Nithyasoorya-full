'use client';

import { use } from 'react';
import CrystalPageView from '@/component/CrystalPageView';

// /crystal-wisdom/chakra-connection, /zodiac-alignment, /sacred-spaces, /care-cleanse …
// Any page created in the admin panel is served here automatically by its slug.
export default function CrystalSubPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);   // Next.js 15: params is a Promise
  return <CrystalPageView slug={slug} />;
}
