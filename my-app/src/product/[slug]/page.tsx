'use client';

import { useParams } from 'next/navigation';
import DynamicProductDetailPage from '@/component/ProductDetailPage'; // adjust path as needed

export default function ProductPage() {
  const params = useParams();
  const slug   = (params?.slug as string) || '';
  return <DynamicProductDetailPage slug={slug} />;
}