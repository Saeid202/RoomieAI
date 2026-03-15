import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client-simple'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EnhancedPageLayout, EnhancedHeader } from '@/components/ui/design-system'
import { Save, Upload, Plus, Trash2, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'

type Section = 'nav' | 'hero' | 'categories' | 'custom_design' | 'footer'

export default function AdminConstructionContentPage() {
  const [content, setContent] = useState<Record<Section, any>>({} as any)
  const [saving, setSaving] = useState<Section | null>(null)
  const [uploading, setUploading] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('construction_page_content').select('section, content')
      if (data) {
        const map: any = {}
        for (const row of data) map[row.section] = row.content
        setContent(map)
      }
    }
    load()
  }, [])

  const save = async (section: Section) => {
    setSaving(section)
    const { error } = await supabase
      .from('construction_page_content')
      .upsert({ section, content: content[section] }, { onConflict: 'section' })
    setSaving(null)
    if (error) toast.error('Failed to save: ' + error.message)
    else toast.success(`${section} section saved`)
  }

  const set = (section: Section, path: string[], value: any) => {
    setContent(prev => {
      const updated = { ...prev, [section]: { ...prev[section] } }
      let obj = updated[section]
      for (let i = 0; i < path.length - 1; i++) {
        obj[path[i]] = { ...obj[path[i]] }
        obj = obj[path[i]]
      }
      obj[path[path.length - 1]] = value
      return updated
    })
  }

  const uploadImage = async (section: Section, path: string[], file: File) => {
    const key = path.join('.')
    setUploading(key)
    const ext = file.name.split('.').pop()
    const filename = `construction-content/${section}-${Date.now()}.${ext}`
    const { error: upErr } = await supabase.storage.from('construction-images').upload(filename, file, { upsert: true })
    if (upErr) { toast.error('Upload failed'); setUploading(null); return }
    const { data: urlData } = supabase.storage.from('construction-images').getPublicUrl(filename)
    set(section, path, urlData.publicUrl)
    setUploading(null)
    toast.success('Image uploaded')
  }

  const ImageField = ({ section, path, label }: { section: Section; path: string[]; label: string }) => {
    const key = path.join('.')
    let val = content[section]
    for (const p of path) val = val?.[p]
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium">{label}</label>
        {val && <img src={val} alt={label} className="w-full h-40 object-cover rounded-lg border" />}
        <div className="flex gap-2">
          <Input value={val || ''} onChange={e => set(section, path, e.target.value)} placeholder="Image URL" className="flex-1" />
          <label className="cursor-pointer">
            <Button variant="outline" size="icon" asChild>
              <span>{uploading === key ? '...' : <Upload size={16} />}</span>
            </Button>
            <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && uploadImage(section, path, e.target.files[0])} />
          </label>
          {val && <Button variant="ghost" size="icon" asChild><a href={val} target="_blank" rel="noreferrer"><ExternalLink size={16} /></a></Button>}
        </div>
      </div>
    )
  }

  const Field = ({ section, path, label, multiline = false }: { section: Section; path: string[]; label: string; multiline?: boolean }) => {
    let val = content[section]
    for (const p of path) val = val?.[p]
    return (
      <div className="space-y-1">
        <label className="text-sm font-medium">{label}</label>
        {multiline
          ? <Textarea value={val || ''} onChange={e => set(section, path, e.target.value)} rows={3} />
          : <Input value={val || ''} onChange={e => set(section, path, e.target.value)} />
        }
      </div>
    )
  }

  if (!content.nav) return <EnhancedPageLayout><div className="p-8 text-center text-muted-foreground">Loading content...</div></EnhancedPageLayout>

  return (
    <EnhancedPageLayout>
      <EnhancedHeader title="Construction Page Editor" subtitle="Edit all content on the construction landing page" />
      <div className="flex justify-end mb-4">
        <Button variant="outline" asChild>
          <a href="/construction" target="_blank" rel="noreferrer" className="flex items-center gap-2">
            <ExternalLink size={14} /> Preview Page
          </a>
        </Button>
      </div>

      <Tabs defaultValue="nav">
        <TabsList className="mb-6">
          <TabsTrigger value="nav">Navigation</TabsTrigger>
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="custom_design">Custom Design</TabsTrigger>
          <TabsTrigger value="footer">Footer</TabsTrigger>
        </TabsList>

        {/* ── NAV TAB ── */}
        <TabsContent value="nav">
          <Card>
            <CardHeader><CardTitle>Navigation Bar</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Field section="nav" path={['logo']} label="Logo / Brand Name" />
              <div className="space-y-2">
                <label className="text-sm font-medium">Nav Links</label>
                {(content.nav?.links || []).map((l: any, i: number) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Input value={l.label} onChange={e => { const links = [...content.nav.links]; links[i] = { ...links[i], label: e.target.value }; set('nav', ['links'], links) }} placeholder="Label" className="flex-1" />
                    <Input value={l.href} onChange={e => { const links = [...content.nav.links]; links[i] = { ...links[i], href: e.target.value }; set('nav', ['links'], links) }} placeholder="URL" className="flex-1" />
                    <Button variant="ghost" size="icon" onClick={() => { const links = content.nav.links.filter((_: any, j: number) => j !== i); set('nav', ['links'], links) }}><Trash2 size={14} /></Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => set('nav', ['links'], [...(content.nav?.links || []), { label: '', href: '' }])}><Plus size={14} className="mr-1" /> Add Link</Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field section="nav" path={['login_label']} label="Login Button Label" />
                <Field section="nav" path={['login_href']} label="Login Button URL" />
                <Field section="nav" path={['cta_label']} label="CTA Button Label" />
                <Field section="nav" path={['cta_href']} label="CTA Button URL" />
              </div>
              <Button onClick={() => save('nav')} disabled={saving === 'nav'} className="w-full">
                <Save size={14} className="mr-2" />{saving === 'nav' ? 'Saving...' : 'Save Navigation'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── HERO TAB ── */}
        <TabsContent value="hero">
          <Card>
            <CardHeader><CardTitle>Hero Section</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Field section="hero" path={['badge']} label="Badge Text" />
              <div className="grid grid-cols-3 gap-4">
                <Field section="hero" path={['title_line1']} label="Title Line 1" />
                <Field section="hero" path={['title_line2']} label="Title Line 2" />
                <Field section="hero" path={['title_highlight']} label="Highlighted Word (green)" />
              </div>
              <Field section="hero" path={['subtitle']} label="Subtitle" multiline />
              <div className="space-y-2">
                <label className="text-sm font-medium">Trust Badges</label>
                {(content.hero?.trust_badges || []).map((b: string, i: number) => (
                  <div key={i} className="flex gap-2">
                    <Input value={b} onChange={e => { const badges = [...content.hero.trust_badges]; badges[i] = e.target.value; set('hero', ['trust_badges'], badges) }} className="flex-1" />
                    <Button variant="ghost" size="icon" onClick={() => set('hero', ['trust_badges'], content.hero.trust_badges.filter((_: any, j: number) => j !== i))}><Trash2 size={14} /></Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => set('hero', ['trust_badges'], [...(content.hero?.trust_badges || []), ''])}><Plus size={14} className="mr-1" /> Add Badge</Button>
              </div>
              <Field section="hero" path={['search_placeholder']} label="Search Placeholder" />
              <div className="grid grid-cols-2 gap-4">
                <Field section="hero" path={['cta_primary_label']} label="Primary CTA Label" />
                <Field section="hero" path={['cta_primary_href']} label="Primary CTA URL" />
                <Field section="hero" path={['cta_secondary_label']} label="Secondary CTA Label" />
                <Field section="hero" path={['cta_secondary_href']} label="Secondary CTA URL" />
              </div>
              <ImageField section="hero" path={['hero_image_url']} label="Hero Background Image (right side)" />
              <Button onClick={() => save('hero')} disabled={saving === 'hero'} className="w-full">
                <Save size={14} className="mr-2" />{saving === 'hero' ? 'Saving...' : 'Save Hero'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── CATEGORIES TAB ── */}
        <TabsContent value="categories">
          <Card>
            <CardHeader><CardTitle>Featured Categories</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field section="categories" path={['title']} label="Section Title" />
                <Field section="categories" path={['subtitle']} label="Section Subtitle" />
              </div>
              <div className="space-y-4">
                <label className="text-sm font-medium">Category Cards</label>
                {(content.categories?.items || []).map((item: any, i: number) => (
                  <Card key={i} className="p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-sm">Category {i + 1}</span>
                      <Button variant="ghost" size="icon" onClick={() => { const items = content.categories.items.filter((_: any, j: number) => j !== i); set('categories', ['items'], items) }}><Trash2 size={14} /></Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-medium">Label</label>
                        <Input value={item.label} onChange={e => { const items = [...content.categories.items]; items[i] = { ...items[i], label: e.target.value }; set('categories', ['items'], items) }} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium">Filter Key</label>
                        <Input value={item.filter} onChange={e => { const items = [...content.categories.items]; items[i] = { ...items[i], filter: e.target.value }; set('categories', ['items'], items) }} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Image</label>
                      {item.image_url && <img src={item.image_url} alt={item.label} className="w-full h-32 object-cover rounded-lg border" />}
                      <div className="flex gap-2">
                        <Input value={item.image_url || ''} onChange={e => { const items = [...content.categories.items]; items[i] = { ...items[i], image_url: e.target.value }; set('categories', ['items'], items) }} placeholder="Image URL" className="flex-1" />
                        <label className="cursor-pointer">
                          <Button variant="outline" size="icon" asChild><span><Upload size={14} /></span></Button>
                          <input type="file" accept="image/*" className="hidden" onChange={async e => {
                            if (!e.target.files?.[0]) return
                            const file = e.target.files[0]
                            const ext = file.name.split('.').pop()
                            const filename = `construction-content/cat-${i}-${Date.now()}.${ext}`
                            await supabase.storage.from('construction-images').upload(filename, file, { upsert: true })
                            const { data: urlData } = supabase.storage.from('construction-images').getPublicUrl(filename)
                            const items = [...content.categories.items]; items[i] = { ...items[i], image_url: urlData.publicUrl }; set('categories', ['items'], items)
                            toast.success('Image uploaded')
                          }} />
                        </label>
                      </div>
                    </div>
                  </Card>
                ))}
                <Button variant="outline" onClick={() => set('categories', ['items'], [...(content.categories?.items || []), { label: '', filter: '', image_url: '' }])}><Plus size={14} className="mr-1" /> Add Category</Button>
              </div>
              <Button onClick={() => save('categories')} disabled={saving === 'categories'} className="w-full">
                <Save size={14} className="mr-2" />{saving === 'categories' ? 'Saving...' : 'Save Categories'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── CUSTOM DESIGN TAB ── */}
        <TabsContent value="custom_design">
          <Card>
            <CardHeader><CardTitle>Custom Design Section</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Field section="custom_design" path={['title']} label="Section Title" />
              <Field section="custom_design" path={['subtitle']} label="Subtitle" multiline />
              <div className="grid grid-cols-2 gap-4">
                <Field section="custom_design" path={['cta_primary_label']} label="Primary CTA Label" />
                <Field section="custom_design" path={['cta_primary_href']} label="Primary CTA URL" />
                <Field section="custom_design" path={['cta_secondary_label']} label="Secondary CTA Label" />
                <Field section="custom_design" path={['cta_secondary_href']} label="Secondary CTA URL" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Feature Icons</label>
                {(content.custom_design?.features || []).map((f: any, i: number) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Input value={f.label} onChange={e => { const features = [...content.custom_design.features]; features[i] = { ...features[i], label: e.target.value }; set('custom_design', ['features'], features) }} placeholder="Label" className="flex-1" />
                    <select value={f.icon} onChange={e => { const features = [...content.custom_design.features]; features[i] = { ...features[i], icon: e.target.value }; set('custom_design', ['features'], features) }} className="border rounded-md px-3 py-2 text-sm">
                      <option value="triangle">Triangle</option>
                      <option value="building">Building</option>
                      <option value="sparkles">Sparkles</option>
                    </select>
                    <Button variant="ghost" size="icon" onClick={() => set('custom_design', ['features'], content.custom_design.features.filter((_: any, j: number) => j !== i))}><Trash2 size={14} /></Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => set('custom_design', ['features'], [...(content.custom_design?.features || []), { label: '', icon: 'sparkles' }])}><Plus size={14} className="mr-1" /> Add Feature</Button>
              </div>
              <Card className="p-4 space-y-3">
                <div className="font-medium text-sm">Sample Product Card</div>
                <div className="grid grid-cols-2 gap-3">
                  <Field section="custom_design" path={['sample_card', 'badge']} label="Badge" />
                  <Field section="custom_design" path={['sample_card', 'title']} label="Title" />
                  <Field section="custom_design" path={['sample_card', 'location']} label="Location" />
                  <Field section="custom_design" path={['sample_card', 'price']} label="Price" />
                </div>
                <ImageField section="custom_design" path={['sample_card', 'image_url']} label="Card Image" />
              </Card>
              <Button onClick={() => save('custom_design')} disabled={saving === 'custom_design'} className="w-full">
                <Save size={14} className="mr-2" />{saving === 'custom_design' ? 'Saving...' : 'Save Custom Design Section'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── FOOTER TAB ── */}
        <TabsContent value="footer">
          <Card>
            <CardHeader><CardTitle>Footer</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Field section="footer" path={['logo']} label="Footer Logo / Brand Name" />
              <Field section="footer" path={['copyright']} label="Copyright Text" />
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Column 1 Links</label>
                  {(content.footer?.links_col1 || []).map((l: any, i: number) => (
                    <div key={i} className="flex gap-2">
                      <Input value={l.label} onChange={e => { const links = [...content.footer.links_col1]; links[i] = { ...links[i], label: e.target.value }; set('footer', ['links_col1'], links) }} placeholder="Label" className="flex-1" />
                      <Input value={l.href} onChange={e => { const links = [...content.footer.links_col1]; links[i] = { ...links[i], href: e.target.value }; set('footer', ['links_col1'], links) }} placeholder="URL" className="flex-1" />
                      <Button variant="ghost" size="icon" onClick={() => set('footer', ['links_col1'], content.footer.links_col1.filter((_: any, j: number) => j !== i))}><Trash2 size={14} /></Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => set('footer', ['links_col1'], [...(content.footer?.links_col1 || []), { label: '', href: '' }])}><Plus size={14} className="mr-1" /> Add</Button>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Column 2 Links</label>
                  {(content.footer?.links_col2 || []).map((l: any, i: number) => (
                    <div key={i} className="flex gap-2">
                      <Input value={l.label} onChange={e => { const links = [...content.footer.links_col2]; links[i] = { ...links[i], label: e.target.value }; set('footer', ['links_col2'], links) }} placeholder="Label" className="flex-1" />
                      <Input value={l.href} onChange={e => { const links = [...content.footer.links_col2]; links[i] = { ...links[i], href: e.target.value }; set('footer', ['links_col2'], links) }} placeholder="URL" className="flex-1" />
                      <Button variant="ghost" size="icon" onClick={() => set('footer', ['links_col2'], content.footer.links_col2.filter((_: any, j: number) => j !== i))}><Trash2 size={14} /></Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => set('footer', ['links_col2'], [...(content.footer?.links_col2 || []), { label: '', href: '' }])}><Plus size={14} className="mr-1" /> Add</Button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Legal Links</label>
                {(content.footer?.legal || []).map((l: any, i: number) => (
                  <div key={i} className="flex gap-2">
                    <Input value={l.label} onChange={e => { const legal = [...content.footer.legal]; legal[i] = { ...legal[i], label: e.target.value }; set('footer', ['legal'], legal) }} placeholder="Label" className="flex-1" />
                    <Input value={l.href} onChange={e => { const legal = [...content.footer.legal]; legal[i] = { ...legal[i], href: e.target.value }; set('footer', ['legal'], legal) }} placeholder="URL" className="flex-1" />
                    <Button variant="ghost" size="icon" onClick={() => set('footer', ['legal'], content.footer.legal.filter((_: any, j: number) => j !== i))}><Trash2 size={14} /></Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => set('footer', ['legal'], [...(content.footer?.legal || []), { label: '', href: '' }])}><Plus size={14} className="mr-1" /> Add</Button>
              </div>
              <Button onClick={() => save('footer')} disabled={saving === 'footer'} className="w-full">
                <Save size={14} className="mr-2" />{saving === 'footer' ? 'Saving...' : 'Save Footer'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </EnhancedPageLayout>
  )
}
