import { Property } from '@/services/propertyService';

interface DesktopLayoutProps {
  property: Property;
  mapComponent: React.ReactNode;
}

export const DesktopLayout = ({ property, mapComponent }: DesktopLayoutProps) => {
  return (
    <div className="flex h-full gap-0">
      {/* Map Panel (50%) */}
      <div className="flex-1 overflow-hidden">
        {mapComponent}
      </div>

      {/* Divider */}
      <div className="w-px bg-gray-200" />

      {/* Property Details Panel (50%) */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
        <PropertyDetailsPanel property={property} />
      </div>
    </div>
  );
};

const PropertyDetailsPanel = ({ property }: { property: Property }) => {
  return (
    <div className="space-y-6 max-w-md">
      {/* Price Section */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">
          Price
        </h3>
        <p className="text-3xl font-bold text-purple-600">
          ${property.monthly_rent || (property as any).sales_price}
          {property.monthly_rent && <span className="text-sm font-normal text-gray-600 ml-2">/month</span>}
        </p>
      </div>

      {/* Key Details */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
          Key Details
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {property.bedrooms !== null && (
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="text-xs font-semibold text-blue-600 uppercase">Bedrooms</div>
              <div className="text-lg font-bold text-blue-900">{property.bedrooms}</div>
            </div>
          )}
          {property.bathrooms !== null && (
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <div className="text-xs font-semibold text-green-600 uppercase">Bathrooms</div>
              <div className="text-lg font-bold text-green-900">{property.bathrooms}</div>
            </div>
          )}
          {property.square_footage && (
            <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
              <div className="text-xs font-semibold text-purple-600 uppercase">Sqft</div>
              <div className="text-lg font-bold text-purple-900">{property.square_footage}</div>
            </div>
          )}
          {property.parking && (
            <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
              <div className="text-xs font-semibold text-orange-600 uppercase">Parking</div>
              <div className="text-lg font-bold text-orange-900 truncate">{property.parking}</div>
            </div>
          )}
          {property.pet_policy && (
            <div className="bg-pink-50 p-3 rounded-lg border border-pink-200">
              <div className="text-xs font-semibold text-pink-600 uppercase">Pet Policy</div>
              <div className="text-lg font-bold text-pink-900 truncate">{property.pet_policy}</div>
            </div>
          )}
          {property.furnished !== undefined && (
            <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
              <div className="text-xs font-semibold text-indigo-600 uppercase">Furnished</div>
              <div className="text-lg font-bold text-indigo-900">{property.furnished ? 'Yes' : 'No'}</div>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {property.description && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">
            About
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed line-clamp-4">
            {property.description}
          </p>
        </div>
      )}

      {/* Nearby Amenities */}
      {property.nearby_amenities && property.nearby_amenities.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">
            Nearby
          </h3>
          <div className="flex flex-wrap gap-2">
            {property.nearby_amenities.slice(0, 5).map((amenity, idx) => (
              <span
                key={idx}
                className="bg-green-50 text-green-700 border border-green-200 px-2 py-1 rounded text-xs font-medium"
              >
                {amenity}
              </span>
            ))}
            {property.nearby_amenities.length > 5 && (
              <span className="bg-gray-50 text-gray-600 border border-gray-200 px-2 py-1 rounded text-xs">
                +{property.nearby_amenities.length - 5} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Address */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">
          Location
        </h3>
        <p className="text-sm text-gray-600">
          {property.address}
          <br />
          {property.city}, {property.state} {property.zip_code}
        </p>
      </div>

      {/* Utilities */}
      {Array.isArray(property.utilities_included) && property.utilities_included.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">
            Utilities Included
          </h3>
          <div className="flex flex-wrap gap-2">
            {property.utilities_included.map((utility, idx) => (
              <span
                key={idx}
                className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 rounded text-xs font-medium"
              >
                {utility}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
