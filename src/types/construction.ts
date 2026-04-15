export interface ConstructionProduct {
  id: string;
  supplier_id: string;
  title: string;
  slug: string;
  description?: string;
  price_cad: number;
  product_type: 'expandable' | 'foldable' | 'flatpack' | 'capsule' | 'modular';
  size_ft?: string;
  bedrooms?: string;
  bathrooms?: string;
  area_sqm?: number;
  lead_time?: string;
  frame_type?: string;
  shipping_port?: string;
  status: 'draft' | 'live' | 'archived';
  created_at: string;
  updated_at: string;
  images?: ConstructionProductImage[];
  customization_options?: ConstructionCustomizationOption[];
}

export interface ConstructionProductImage {
  id: string;
  product_id: string;
  storage_path: string;
  public_url: string;
  is_primary: boolean;
  sort_order: number;
  uploaded_at: string;
}

export interface ConstructionCustomizationOption {
  id: string;
  product_id: string;
  option_type: 'exterior_colour' | 'interior_finish' | 'dimensions' | 'rooms' | 'windows' | 'door' | 'roofing' | 'insulation' | 'solar' | 'flooring';
  option_value: string;
  hex_code?: string;
  price_modifier?: number;
  sort_order: number;
  supports_pattern_images?: boolean;
  color_patterns?: ConstructionColorPattern[];
}

export interface ConstructionColorPattern {
  id: string;
  customization_option_id: string;
  color_name?: string;
  pattern_image_url?: string;
  pattern_image_storage_path?: string;
  is_pattern_based: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ColorPatternUploadData {
  customization_option_id: string;
  color_name?: string;
  pattern_image?: File;
  is_pattern_based: boolean;
  sort_order?: number;
}

export interface ColorPatternFormData {
  color_name: string;
  pattern_image: File | null;
  is_pattern_based: boolean;
  preview_url?: string;
}

export enum CustomizationOptionType {
  EXTERIOR_COLOUR = 'exterior_colour',
  INTERIOR_FINISH = 'interior_finish',
  DIMENSIONS = 'dimensions',
  ROOMS = 'rooms',
  WINDOWS = 'windows',
  DOOR = 'door',
  ROOFING = 'roofing',
  INSULATION = 'insulation',
  SOLAR = 'solar',
  FLOORING = 'flooring'
}

export const CUSTOMIZATION_OPTION_LABELS = {
  [CustomizationOptionType.EXTERIOR_COLOUR]: 'Exterior Colour',
  [CustomizationOptionType.INTERIOR_FINISH]: 'Interior Finish',
  [CustomizationOptionType.DIMENSIONS]: 'Dimensions',
  [CustomizationOptionType.ROOMS]: 'Rooms',
  [CustomizationOptionType.WINDOWS]: 'Windows',
  [CustomizationOptionType.DOOR]: 'Door',
  [CustomizationOptionType.ROOFING]: 'Roofing',
  [CustomizationOptionType.INSULATION]: 'Insulation',
  [CustomizationOptionType.SOLAR]: 'Solar',
  [CustomizationOptionType.FLOORING]: 'Flooring'
};

export const COLOR_PATTERN_SUPPORTED_OPTIONS = [
  CustomizationOptionType.EXTERIOR_COLOUR,
  CustomizationOptionType.INTERIOR_FINISH,
  CustomizationOptionType.FLOORING
];
