import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client-simple';

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  price_cad: number;
  product_type: string;
  size_ft: string | null;
  bedrooms: string | null;
  bathrooms: string | null;
  area_sqm: number | null;
  lead_time: string | null;
  frame_type: string | null;
  shipping_port: string | null;
  available_colors: Array<{ name: string; hex: string }> | null;
  created_at: string;
  supplier_id: string;
  status: string;
  construction_product_images: Array<{
    id: string;
    public_url: string;
    is_primary: boolean;
  }>;
  construction_supplier_profiles: {
    company_name: string;
    shipping_port: string;
  } | null;
}

async function fetchProductWithRelations(slug: string): Promise<Product> {
  const { data: productData, error: productError } = await supabase
    .from('construction_products')
    .select('id, title, slug, description, price_cad, product_type, size_ft, bedrooms, bathrooms, area_sqm, lead_time, frame_type, shipping_port, available_colors, supplier_id, created_at, status')
    .eq('slug', slug)
    .single();

  if (productError || !productData) throw new Error('Product not found');

  // Fetch images and supplier in parallel
  const [imagesResult, supplierResult] = await Promise.all([
    supabase
      .from('construction_product_images')
      .select('id, public_url, is_primary')
      .eq('product_id', productData.id),
    supabase
      .from('construction_supplier_profiles')
      .select('company_name, shipping_port')
      .eq('id', productData.supplier_id)
      .single(),
  ]);

  return {
    ...productData,
    construction_product_images: imagesResult.data ?? [],
    construction_supplier_profiles: supplierResult.data ?? null,
  };
}

export const useProducts = (filter: string = 'all') => {
  return useQuery({
    queryKey: ['products', filter],
    queryFn: async () => {
      let query = supabase
        .from('construction_products')
        .select('id, title, product_type, price_cad, slug, supplier_id, status, created_at, description, size_ft, bedrooms, bathrooms, area_sqm, lead_time, frame_type, shipping_port, available_colors')
        .eq('status', 'live')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('product_type', filter);
      }

      const { data: productsData, error } = await query;
      if (error) throw error;
      if (!productsData || productsData.length === 0) return [] as Product[];

      const productIds = productsData.map(p => p.id);
      const { data: imagesData } = await supabase
        .from('construction_product_images')
        .select('id, product_id, public_url, is_primary')
        .in('product_id', productIds);

      const imagesByProduct: Record<string, Product['construction_product_images']> = {};
      for (const img of (imagesData ?? [])) {
        if (!imagesByProduct[img.product_id]) imagesByProduct[img.product_id] = [];
        imagesByProduct[img.product_id].push({ id: img.id, public_url: img.public_url, is_primary: img.is_primary });
      }

      return productsData.map(p => ({
        ...p,
        construction_product_images: imagesByProduct[p.id] ?? [],
        construction_supplier_profiles: null,
      })) as Product[];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useProductBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => fetchProductWithRelations(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const usePrefetchProduct = (slug: string) => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.prefetchQuery({
      queryKey: ['product', slug],
      queryFn: () => fetchProductWithRelations(slug),
      staleTime: 5 * 60 * 1000,
    });
  };
};
