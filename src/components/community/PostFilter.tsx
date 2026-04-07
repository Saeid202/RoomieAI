import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

export interface PostFilters {
  budget_max?: number;
  gender_preference?: string;
  pets?: boolean;
  room_type?: string;
  lease_duration?: string;
}

interface PostFilterProps {
  onFilterChange: (filters: PostFilters) => void;
  activeFilters: PostFilters;
}

export function PostFilter({ onFilterChange, activeFilters }: PostFilterProps) {
  function update(patch: Partial<PostFilters>) {
    onFilterChange({ ...activeFilters, ...patch });
  }

  function clearFilters() {
    onFilterChange({});
  }

  const hasActiveFilters =
    activeFilters.budget_max != null ||
    (activeFilters.gender_preference && activeFilters.gender_preference !== 'any') ||
    activeFilters.pets != null ||
    (activeFilters.room_type && activeFilters.room_type !== 'any') ||
    (activeFilters.lease_duration && activeFilters.lease_duration !== 'any');

  return (
    <div className="rounded-lg border bg-card p-3 mb-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Filters</p>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 text-xs">
            Clear Filters
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {/* Budget max */}
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Max Budget $</label>
          <Input
            type="number"
            min={0}
            placeholder="e.g. 1500"
            value={activeFilters.budget_max ?? ''}
            onChange={e => {
              const val = e.target.value;
              update({ budget_max: val ? Number(val) : undefined });
            }}
            className="h-8 text-sm"
          />
        </div>

        {/* Gender preference */}
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Gender Preference</label>
          <Select
            value={activeFilters.gender_preference || 'any'}
            onValueChange={val => update({ gender_preference: val === 'any' ? undefined : val })}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="non_binary">Non-binary</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Room type */}
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Room Type</label>
          <Select
            value={activeFilters.room_type || 'any'}
            onValueChange={val => update({ room_type: val === 'any' ? undefined : val })}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              <SelectItem value="private">Private</SelectItem>
              <SelectItem value="shared">Shared</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Lease duration */}
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Lease Duration</label>
          <Select
            value={activeFilters.lease_duration || 'any'}
            onValueChange={val => update({ lease_duration: val === 'any' ? undefined : val })}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              <SelectItem value="month_to_month">Month-to-month</SelectItem>
              <SelectItem value="6_months">6 months</SelectItem>
              <SelectItem value="1_year">1 year</SelectItem>
              <SelectItem value="flexible">Flexible</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Pets */}
        <div className="flex items-center gap-2 pt-4">
          <Checkbox
            id="pets-filter"
            checked={activeFilters.pets === true}
            onCheckedChange={checked => update({ pets: checked === true ? true : undefined })}
          />
          <label htmlFor="pets-filter" className="text-sm cursor-pointer">
            Pets allowed
          </label>
        </div>
      </div>
    </div>
  );
}
