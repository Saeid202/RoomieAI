import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  ShoppingCart, 
  Star, 
  Heart, 
  Search,
  Filter,
  DollarSign,
  Truck,
  Shield,
  Clock,
  Zap,
  Home,
  Wrench,
  Droplets,
  Wind,
  Lightbulb,
  Tv,
  Refrigerator,
  WashingMachine,
  Sofa,
  Bed,
  Chair,
  Table,
  Microwave,
  Coffee,
  Utensils,
  Bath,
  Thermometer,
  Camera,
  Headphones,
  Smartphone,
  Laptop,
  Monitor,
  Printer,
  Router,
  Battery,
  Plug,
  Lock,
  Key,
  Bell,
  Eye,
  Plus,
  Minus,
  ShoppingBag,
  Tag,
  TrendingDown,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  reviewCount: number;
  image: string;
  description: string;
  features: string[];
  specifications: Record<string, string>;
  availability: string;
  shipping: string;
  warranty: string;
  seller: string;
  sellerRating: number;
  isPrime: boolean;
  isBestSeller: boolean;
  isLowStock: boolean;
  tags: string[];
}

const mockProducts: Product[] = [
  {
    id: "1",
    name: "Smart LED Light Bulbs (4-Pack)",
    brand: "EcoBright",
    category: "Lighting",
    price: 24.99,
    originalPrice: 39.99,
    discount: 38,
    rating: 4.6,
    reviewCount: 1247,
    image: "/api/placeholder/200/200",
    description: "Energy-efficient smart LED bulbs with WiFi connectivity. Control via smartphone app or voice commands.",
    features: ["WiFi Enabled", "Voice Control", "Energy Efficient", "16 Million Colors"],
    specifications: {
      "Wattage": "9W",
      "Lumens": "800",
      "Color Temperature": "2700K-6500K",
      "Lifespan": "25,000 hours"
    },
    availability: "In Stock",
    shipping: "Free shipping",
    warranty: "2 years",
    seller: "HomeTech Direct",
    sellerRating: 4.8,
    isPrime: true,
    isBestSeller: true,
    isLowStock: false,
    tags: ["Smart Home", "Energy Saving", "WiFi"]
  },
  {
    id: "2",
    name: "Programmable Thermostat",
    brand: "ClimateControl",
    category: "HVAC",
    price: 89.99,
    originalPrice: 129.99,
    discount: 31,
    rating: 4.7,
    reviewCount: 892,
    image: "/api/placeholder/200/200",
    description: "Smart programmable thermostat with energy-saving features and smartphone control.",
    features: ["Smart Scheduling", "Energy Reports", "Geofencing", "Compatible with Alexa"],
    specifications: {
      "Display": "Touchscreen",
      "Compatibility": "Works with most HVAC systems",
      "Power": "Battery + C-wire",
      "App": "iOS & Android"
    },
    availability: "In Stock",
    shipping: "Free shipping",
    warranty: "3 years",
    seller: "HVAC Solutions",
    sellerRating: 4.9,
    isPrime: true,
    isBestSeller: false,
    isLowStock: false,
    tags: ["Smart Home", "Energy Saving", "HVAC"]
  },
  {
    id: "3",
    name: "Security Camera System (4 Cameras)",
    brand: "SecureView",
    category: "Security",
    price: 199.99,
    originalPrice: 299.99,
    discount: 33,
    rating: 4.5,
    reviewCount: 2156,
    image: "/api/placeholder/200/200",
    description: "4K security camera system with night vision, motion detection, and cloud storage.",
    features: ["4K Resolution", "Night Vision", "Motion Detection", "Cloud Storage"],
    specifications: {
      "Resolution": "4K Ultra HD",
      "Night Vision": "Up to 100ft",
      "Storage": "Cloud + Local",
      "Power": "PoE"
    },
    availability: "In Stock",
    shipping: "Free shipping",
    warranty: "2 years",
    seller: "Security Pro",
    sellerRating: 4.7,
    isPrime: true,
    isBestSeller: true,
    isLowStock: true,
    tags: ["Security", "4K", "Night Vision"]
  },
  {
    id: "4",
    name: "Air Purifier with HEPA Filter",
    brand: "PureAir",
    category: "Air Quality",
    price: 149.99,
    originalPrice: 199.99,
    discount: 25,
    rating: 4.8,
    reviewCount: 743,
    image: "/api/placeholder/200/200",
    description: "HEPA air purifier for rooms up to 500 sq ft. Removes 99.97% of airborne particles.",
    features: ["HEPA Filter", "Quiet Operation", "Auto Mode", "Filter Replacement Indicator"],
    specifications: {
      "Coverage": "500 sq ft",
      "CADR": "200 CFM",
      "Noise Level": "< 50 dB",
      "Filter Life": "6-12 months"
    },
    availability: "In Stock",
    shipping: "Free shipping",
    warranty: "1 year",
    seller: "Air Quality Plus",
    sellerRating: 4.6,
    isPrime: false,
    isBestSeller: false,
    isLowStock: false,
    tags: ["Air Purification", "HEPA", "Health"]
  },
  {
    id: "5",
    name: "Smart Door Lock",
    brand: "LockTech",
    category: "Security",
    price: 179.99,
    originalPrice: 249.99,
    discount: 28,
    rating: 4.4,
    reviewCount: 567,
    image: "/api/placeholder/200/200",
    description: "Smart door lock with keyless entry, smartphone control, and guest access features.",
    features: ["Keyless Entry", "Smartphone Control", "Guest Access", "Auto Lock"],
    specifications: {
      "Power": "4 AA Batteries",
      "Compatibility": "iOS & Android",
      "Lock Type": "Deadbolt",
      "Finish": "Satin Nickel"
    },
    availability: "In Stock",
    shipping: "Free shipping",
    warranty: "2 years",
    seller: "Smart Home Store",
    sellerRating: 4.5,
    isPrime: true,
    isBestSeller: false,
    isLowStock: false,
    tags: ["Smart Home", "Security", "Keyless"]
  },
  {
    id: "6",
    name: "Energy Monitor Smart Plug",
    brand: "PowerTrack",
    category: "Smart Home",
    price: 19.99,
    originalPrice: 29.99,
    discount: 33,
    rating: 4.3,
    reviewCount: 1892,
    image: "/api/placeholder/200/200",
    description: "Smart plug with energy monitoring. Track power usage and control devices remotely.",
    features: ["Energy Monitoring", "Remote Control", "Scheduling", "Voice Control"],
    specifications: {
      "Max Load": "15A",
      "Voltage": "120V",
      "WiFi": "2.4GHz",
      "App": "iOS & Android"
    },
    availability: "In Stock",
    shipping: "Free shipping",
    warranty: "1 year",
    seller: "Energy Solutions",
    sellerRating: 4.4,
    isPrime: true,
    isBestSeller: true,
    isLowStock: false,
    tags: ["Smart Home", "Energy Monitoring", "WiFi"]
  },
  {
    id: "7",
    name: "Water Leak Detector (3-Pack)",
    brand: "AquaAlert",
    category: "Safety",
    price: 34.99,
    originalPrice: 49.99,
    discount: 30,
    rating: 4.6,
    reviewCount: 445,
    image: "/api/placeholder/200/200",
    description: "Wireless water leak detectors with smartphone alerts and battery backup.",
    features: ["Wireless Alerts", "Battery Backup", "Easy Installation", "Smartphone Notifications"],
    specifications: {
      "Battery Life": "2 years",
      "Range": "300ft",
      "Sensors": "3 detectors",
      "App": "iOS & Android"
    },
    availability: "In Stock",
    shipping: "Free shipping",
    warranty: "1 year",
    seller: "Safety First",
    sellerRating: 4.7,
    isPrime: false,
    isBestSeller: false,
    isLowStock: false,
    tags: ["Safety", "Water Detection", "Wireless"]
  },
  {
    id: "8",
    name: "Smart Smoke Detector",
    brand: "FireGuard",
    category: "Safety",
    price: 79.99,
    originalPrice: 99.99,
    discount: 20,
    rating: 4.7,
    reviewCount: 678,
    image: "/api/placeholder/200/200",
    description: "Smart smoke detector with smartphone alerts and self-testing capabilities.",
    features: ["Smartphone Alerts", "Self-Testing", "Interconnect", "Battery Backup"],
    specifications: {
      "Power": "Battery + Hardwired",
      "Interconnect": "Up to 12 devices",
      "Battery Life": "10 years",
      "Certification": "UL Listed"
    },
    availability: "In Stock",
    shipping: "Free shipping",
    warranty: "5 years",
    seller: "Fire Safety Pro",
    sellerRating: 4.8,
    isPrime: true,
    isBestSeller: false,
    isLowStock: false,
    tags: ["Safety", "Fire Detection", "Smart Home"]
  }
];

const categories = [
  { id: "all", name: "All Products", icon: <ShoppingCart className="h-4 w-4" /> },
  { id: "Lighting", name: "Lighting", icon: <Lightbulb className="h-4 w-4" /> },
  { id: "HVAC", name: "HVAC", icon: <Thermometer className="h-4 w-4" /> },
  { id: "Security", name: "Security", icon: <Shield className="h-4 w-4" /> },
  { id: "Air Quality", name: "Air Quality", icon: <Wind className="h-4 w-4" /> },
  { id: "Smart Home", name: "Smart Home", icon: <Zap className="h-4 w-4" /> },
  { id: "Safety", name: "Safety", icon: <AlertCircle className="h-4 w-4" /> },
  { id: "Appliances", name: "Appliances", icon: <Refrigerator className="h-4 w-4" /> },
  { id: "Furniture", name: "Furniture", icon: <Sofa className="h-4 w-4" /> }
];

const categoryIcons: Record<string, React.ReactNode> = {
  "Lighting": <Lightbulb className="h-4 w-4" />,
  "HVAC": <Thermometer className="h-4 w-4" />,
  "Security": <Shield className="h-4 w-4" />,
  "Air Quality": <Wind className="h-4 w-4" />,
  "Smart Home": <Zap className="h-4 w-4" />,
  "Safety": <AlertCircle className="h-4 w-4" />,
  "Appliances": <Refrigerator className="h-4 w-4" />,
  "Furniture": <Sofa className="h-4 w-4" />
};

export default function ShopPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [sortBy, setSortBy] = useState("relevance");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<Product[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);

  const filteredProducts = mockProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    const matchesPrice = product.price >= priceRange.min && product.price <= priceRange.max;
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "rating":
        return b.rating - a.rating;
      case "discount":
        return (b.discount || 0) - (a.discount || 0);
      default:
        return 0;
    }
  });

  const handleAddToCart = (product: Product) => {
    setCart(prev => [...prev, product]);
    toast.success(`${product.name} added to cart!`);
  };

  const handleAddToWishlist = (productId: string) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
    toast.success(wishlist.includes(productId) ? "Removed from wishlist" : "Added to wishlist");
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const calculateSavings = (product: Product) => {
    if (product.originalPrice && product.discount) {
      return product.originalPrice - product.price;
    }
    return 0;
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <ShoppingCart className="h-8 w-8 text-green-600" />
          Shop for Your Home
        </h1>
        <p className="text-muted-foreground">
          Find low-cost products, items, and home appliances for your rental properties at better prices.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search products, brands, or categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="w-48">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="relevance">Sort by Relevance</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
              <option value="discount">Best Discount</option>
            </select>
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="flex items-center gap-2"
            >
              {category.icon}
              {category.name}
            </Button>
          ))}
        </div>

        {/* Price Range */}
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Price Range:</span>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={priceRange.min}
              onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
              className="w-20"
            />
            <span>-</span>
            <Input
              type="number"
              placeholder="Max"
              value={priceRange.max}
              onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
              className="w-20"
            />
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortedProducts.map((product) => (
          <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="relative">
                <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="h-16 w-16 text-gray-400" />
                </div>
                {product.discount && (
                  <Badge className="absolute top-2 left-2 bg-red-500 text-white">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    {product.discount}% OFF
                  </Badge>
                )}
                {product.isBestSeller && (
                  <Badge className="absolute top-2 right-2 bg-orange-500 text-white">
                    Best Seller
                  </Badge>
                )}
                {product.isLowStock && (
                  <Badge className="absolute bottom-2 left-2 bg-yellow-500 text-white">
                    Low Stock
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute bottom-2 right-2 h-8 w-8 p-0"
                  onClick={() => handleAddToWishlist(product.id)}
                >
                  <Heart className={`h-4 w-4 ${wishlist.includes(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {/* Product Info */}
              <div>
                <h3 className="font-medium text-sm line-clamp-2">{product.name}</h3>
                <p className="text-xs text-muted-foreground">{product.brand}</p>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex">{renderStars(product.rating)}</div>
                <span className="text-sm font-medium">{product.rating}</span>
                <span className="text-sm text-muted-foreground">({product.reviewCount})</span>
              </div>

              {/* Price */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-green-600">${product.price}</span>
                  {product.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">${product.originalPrice}</span>
                  )}
                </div>
                {product.discount && (
                  <p className="text-xs text-green-600 font-medium">
                    Save ${calculateSavings(product).toFixed(2)}
                  </p>
                )}
              </div>

              {/* Features */}
              <div className="flex flex-wrap gap-1">
                {product.features.slice(0, 2).map((feature) => (
                  <Badge key={feature} variant="outline" className="text-xs">
                    {feature}
                  </Badge>
                ))}
                {product.features.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{product.features.length - 2} more
                  </Badge>
                )}
              </div>

              {/* Seller Info */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{product.seller}</span>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span>{product.sellerRating}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedProduct(product)}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleAddToCart(product)}
                  className="flex-1"
                >
                  <ShoppingBag className="h-4 w-4 mr-1" />
                  Add to Cart
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Product Detail Dialog */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              {selectedProduct?.name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedProduct && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Image */}
                <div className="space-y-4">
                  <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                    <ShoppingCart className="h-24 w-24 text-gray-400" />
                  </div>
                  
                  {/* Price and Actions */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-green-600">${selectedProduct.price}</span>
                        {selectedProduct.originalPrice && (
                          <span className="text-lg text-muted-foreground line-through">${selectedProduct.originalPrice}</span>
                        )}
                      </div>
                      {selectedProduct.discount && (
                        <p className="text-green-600 font-medium">
                          Save ${calculateSavings(selectedProduct).toFixed(2)} ({selectedProduct.discount}% OFF)
                        </p>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleAddToCart(selectedProduct)}
                        className="flex-1"
                      >
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleAddToWishlist(selectedProduct.id)}
                      >
                        <Heart className={`h-4 w-4 ${wishlist.includes(selectedProduct.id) ? 'fill-red-500 text-red-500' : ''}`} />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Product Details */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold">{selectedProduct.name}</h3>
                    <p className="text-muted-foreground">{selectedProduct.brand}</p>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2">
                    <div className="flex">{renderStars(selectedProduct.rating)}</div>
                    <span className="font-medium">{selectedProduct.rating}</span>
                    <span className="text-muted-foreground">({selectedProduct.reviewCount} reviews)</span>
                  </div>

                  {/* Description */}
                  <p className="text-sm">{selectedProduct.description}</p>

                  {/* Features */}
                  <div>
                    <h4 className="font-medium mb-2">Key Features:</h4>
                    <ul className="text-sm space-y-1">
                      {selectedProduct.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Specifications */}
                  <div>
                    <h4 className="font-medium mb-2">Specifications:</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(selectedProduct.specifications).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-muted-foreground">{key}:</span>
                          <span>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Seller Info */}
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Sold by {selectedProduct.seller}</p>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{selectedProduct.sellerRating} rating</span>
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <p>{selectedProduct.shipping}</p>
                        <p>{selectedProduct.warranty} warranty</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
