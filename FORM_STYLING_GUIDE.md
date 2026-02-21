# Form Styling Guide - Roomi AI Design System

This guide documents the standardized frame and color code system used across all forms in the Roomi AI application. Use this as a reference when creating or updating forms to maintain consistency.

---

## 🎨 Core Design Principles

1. **Gray backgrounds** for section containers - makes content stand out
2. **White cards** for actual content - clean and readable
3. **Numbered badges** for fields - helps users navigate
4. **Bold borders** - clear visual separation
5. **Consistent spacing** - professional and organized

---

## 📦 Page Container

Every page should use this container:

```tsx
<div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
  {/* Page content */}
</div>
```

**Breakdown:**
- `max-w-7xl` - Maximum width of 80rem (1280px)
- `mx-auto` - Centers the container
- `px-4 md:px-6` - Horizontal padding (responsive)
- `py-6` - Vertical padding

---

## 🎯 Page Header

```tsx
<header className="flex items-center justify-between mb-6">
  <div className="flex items-center gap-3">
    <div className="p-2 rounded-lg orange-purple-gradient">
      <IconComponent className="h-6 w-6 text-white" aria-hidden="true" />
    </div>
    <div>
      <h1 className="text-xl md:text-2xl font-bold text-gradient">
        Page Title
      </h1>
      <p className="text-sm text-muted-foreground">Subtitle or description</p>
    </div>
  </div>
</header>
```

**Key Classes:**
- `orange-purple-gradient` - Icon background gradient
- `text-gradient` - Title gradient effect
- `text-muted-foreground` - Subtle subtitle color

---

## 🗂️ Section Card (Main Container)

Use this for major sections like "Application Statistics" or "Applications & Contracts":

```tsx
<Card className="border-orange-200/30 shadow-lg">
  <CardHeader className="bg-slate-50/50">
    <CardTitle className="text-gradient">Section Title</CardTitle>
  </CardHeader>
  <CardContent className="p-4">
    {/* Section content */}
  </CardContent>
</Card>
```

**Color Variations:**
- `border-orange-200/30` - Orange tint (primary sections)
- `border-purple-200/30` - Purple tint (secondary sections)
- `border-green-200/30` - Green tint (success/contracts)
- `border-blue-200/30` - Blue tint (info sections)

---

## 📋 Form Section with Gray Background

This is the **key pattern** for organized form sections:

```tsx
<div className="bg-slate-50 rounded-lg p-3 border-2 border-slate-400">
  <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
    <IconComponent className="h-4 w-4 text-orange-600" />
    Section Title
  </h3>
  
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
    {/* Fields go here */}
  </div>
</div>
```

**Breakdown:**
- `bg-slate-50` - Light gray background (#F8FAFC)
- `rounded-lg` - Rounded corners (0.5rem)
- `p-3` - Padding (0.75rem)
- `border-2 border-slate-400` - Bold gray border (#94A3B8)

---

## 🏷️ Form Field with Numbered Badge

```tsx
<div className="space-y-1.5">
  <div className="flex items-center gap-2">
    <span className="bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">
      1
    </span>
    <Label htmlFor="fieldId" className="text-sm font-semibold">
      Field Label
    </Label>
  </div>
  <Input
    id="fieldId"
    className="h-9 border-2 border-slate-300"
    placeholder="Enter value..."
  />
</div>
```

**Badge Color Options:**
- `bg-primary` - Default blue (#3B82F6)
- `bg-blue-600` - Blue (#2563EB)
- `bg-purple-600` - Purple (#9333EA)
- `bg-green-600` - Green (#16A34A)
- `bg-orange-600` - Orange (#EA580C)
- `bg-amber-600` - Amber (#D97706)
- `bg-indigo-600` - Indigo (#4F46E5)
- `bg-emerald-600` - Emerald (#059669)
- `bg-rose-600` - Rose (#E11D48)
- `bg-slate-600` - Slate (#475569)

---

## 📊 Statistics/Metrics Display

```tsx
<div className="bg-slate-50 rounded-lg p-3 border-2 border-slate-400">
  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 mb-2">
        <span className="bg-slate-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">
          1
        </span>
        <Label className="text-sm font-semibold text-slate-900">Stat Name</Label>
      </div>
      <div className="bg-white rounded-lg p-3 border-2 border-slate-300 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-2xl font-bold text-gray-900">123</p>
          <div className="bg-slate-100 p-1.5 rounded">
            <IconComponent className="h-4 w-4 text-slate-600" />
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

---

## 🎴 Individual Item Card (Applications, Contracts, etc.)

For list items like applications or contracts:

```tsx
<div className="bg-slate-50 rounded-lg p-3 border-2 border-slate-400">
  <Card className="group hover:shadow-lg transition-all duration-300 border-2 border-slate-300 bg-white">
    <CardContent className="p-4">
      {/* Card content */}
    </CardContent>
  </Card>
</div>
```

**Why this works:**
- Outer gray frame creates clear separation between items
- Inner white card contains the actual content
- Hover effect adds interactivity
- Bold borders ensure visibility

---

## 🎨 Color Palette Reference

### Background Colors
- `bg-slate-50` - Light gray (#F8FAFC) - Section backgrounds
- `bg-white` - White (#FFFFFF) - Content cards
- `bg-slate-100` - Slightly darker gray (#F1F5F9) - Icon backgrounds

### Border Colors
- `border-slate-400` - Medium gray (#94A3B8) - Section borders (2px)
- `border-slate-300` - Light gray (#CBD5E1) - Card borders (2px)
- `border-slate-200` - Very light gray (#E2E8F0) - Subtle borders

### Text Colors
- `text-slate-900` - Dark gray (#0F172A) - Headings
- `text-gray-900` - Black (#111827) - Primary text
- `text-gray-600` - Medium gray (#4B5563) - Secondary text
- `text-muted-foreground` - Muted gray - Subtle text

### Accent Colors (for badges, stats, buttons)
- Blue: `bg-blue-600` (#2563EB), `text-blue-600`
- Purple: `bg-purple-600` (#9333EA), `text-purple-600`
- Green: `bg-green-600` (#16A34A), `text-green-600`
- Orange: `bg-orange-600` (#EA580C), `text-orange-600`
- Amber: `bg-amber-600` (#D97706), `text-amber-600`
- Indigo: `bg-indigo-600` (#4F46E5), `text-indigo-600`
- Emerald: `bg-emerald-600` (#059669), `text-emerald-600`
- Rose: `bg-rose-600` (#E11D48), `text-rose-600`

---

## 🔘 Button Styles

### Primary Action Buttons
```tsx
<Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
  Action
</Button>
```

### Secondary Action Buttons
```tsx
<Button className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white">
  Quick Apply
</Button>
```

### Success Buttons
```tsx
<Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white">
  Download
</Button>
```

### Danger Buttons
```tsx
<Button className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white">
  Withdraw
</Button>
```

### Outline Buttons
```tsx
<Button variant="outline" className="border-2 border-slate-300 hover:bg-slate-50">
  Back
</Button>
```

---

## 📐 Spacing System

### Gaps
- `gap-2` - 0.5rem (8px) - Tight spacing
- `gap-3` - 0.75rem (12px) - Standard spacing
- `gap-4` - 1rem (16px) - Comfortable spacing
- `gap-6` - 1.5rem (24px) - Section spacing

### Padding
- `p-2` - 0.5rem (8px) - Tight padding
- `p-3` - 0.75rem (12px) - Standard padding
- `p-4` - 1rem (16px) - Comfortable padding

### Margins
- `mb-2` - 0.5rem (8px) - Small bottom margin
- `mb-3` - 0.75rem (12px) - Standard bottom margin
- `mb-4` - 1rem (16px) - Section bottom margin
- `mb-6` - 1.5rem (24px) - Large section margin
- `mb-8` - 2rem (32px) - Major section margin

---

## 📱 Responsive Grid Layouts

### 2-Column Layout
```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
  {/* Fields */}
</div>
```

### 3-Column Layout
```tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
  {/* Fields */}
</div>
```

### 5-Column Layout (Statistics)
```tsx
<div className="grid grid-cols-2 md:grid-cols-5 gap-3">
  {/* Stats */}
</div>
```

---

## ✅ Complete Example: Form Section

Here's a complete example combining all elements:

```tsx
<section className="mb-8">
  <Card className="border-orange-200/30 shadow-lg">
    <CardHeader className="bg-slate-50/50">
      <CardTitle className="text-gradient">Section Title</CardTitle>
    </CardHeader>
    <CardContent className="p-4">
      <div className="bg-slate-50 rounded-lg p-3 border-2 border-slate-400">
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-orange-600" />
          Subsection Title
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Field 1 */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                1
              </span>
              <Label htmlFor="field1" className="text-sm font-semibold">
                Field Label
              </Label>
            </div>
            <Input
              id="field1"
              className="h-9 border-2 border-slate-300"
              placeholder="Enter value..."
            />
          </div>
          
          {/* Field 2 */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="bg-purple-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                2
              </span>
              <Label htmlFor="field2" className="text-sm font-semibold">
                Another Field
              </Label>
            </div>
            <Input
              id="field2"
              className="h-9 border-2 border-slate-300"
              placeholder="Enter value..."
            />
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</section>
```

---

## 🎯 Key Takeaways

1. **Always use gray backgrounds** (`bg-slate-50 border-2 border-slate-400`) for section containers
2. **White cards inside** (`bg-white border-2 border-slate-300`) for content
3. **Numbered badges** help users navigate through fields
4. **Bold borders** (2px) ensure everything is clearly visible
5. **Consistent spacing** (`gap-3`, `gap-4`, `p-3`, `p-4`) keeps things organized
6. **Gradient buttons** for primary actions
7. **Responsive grids** for mobile-friendly layouts

---

## 📝 Usage Notes

- This system is already implemented in:
  - Plan Ahead Matching page
  - Opposite Schedule page
  - Work Exchange page
  - Rental Options page
  - Property Details page
  - My Applications page

- Use this guide when creating new forms or updating existing ones
- Maintain consistency across all pages for a professional, cohesive user experience
- The gray background + white card pattern is the signature of our design system

---

**Last Updated:** February 20, 2026
**Version:** 1.0
