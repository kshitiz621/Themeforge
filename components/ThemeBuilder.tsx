'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import JSZip from "jszip";
import { COMP_REGISTRY, CATEGORIES, STYLE_DEFS, getStyleCSS } from "@/lib/shopify-registry";
import { 
  buildThemeLiquid, 
  buildSectionLiquid, 
  buildHeaderSectionLiquid, 
  buildHeaderGroupJson, 
  buildFooterGroupJson, 
  buildSettingsSchema, 
  buildSettingsData, 
  buildBaseCSS, 
  buildThemeCSS, 
  buildGlobalJS, 
  buildMetaTagsSnippet, 
  buildCartNotificationSnippet, 
  buildLocalesEN 
} from "@/lib/shopify-liquid";
import { callAI } from "@/lib/ai-engine";

// ─────────────────────────────────────────────────────────────
// CANVAS PREVIEW RENDERERS
// ─────────────────────────────────────────────────────────────
const RENDERERS: Record<string, (s: any, style: string) => string> = {
  announcement_bar(s) {
    return `<div style="background:${s.bg_color || '#7c6dfa'};color:${s.text_color || '#fff'};text-align:center;padding:9px 20px;font-size:13px;font-weight:500;display:flex;align-items:center;justify-content:center;gap:12px;">
      <span>${s.text || 'Announcement text'}</span>
      ${s.link_label ? `<a href="#" style="color:${s.text_color || '#fff'};font-weight:800;text-decoration:underline;text-underline-offset:2px;">${s.link_label}</a>` : ''}
    </div>`;
  },
  hero(s, style) {
    const v = STYLE_DEFS.hero?.[style] || STYLE_DEFS.hero["modern-dark"];
    return `<div style="min-height:${s.full_height ? '420px' : '280px'};background:${v.bg};display:flex;align-items:center;justify-content:${s.text_align === 'left' ? 'flex-start' : s.text_align === 'right' ? 'flex-end' : 'center'};text-align:${s.text_align || 'center'};padding:60px 48px;position:relative;overflow:hidden;">
      ${s.image_url ? `<div style="position:absolute;inset:0;background:url(${s.image_url}) center/cover no-repeat;"></div><div style="position:absolute;inset:0;background:rgba(0,0,0,${s.overlay_opacity || 0.45});"></div>` : ''}
      <div style="position:relative;z-index:2;max-width:760px;">
        <h1 style="color:${v.tc};font-size:${v.fontSize};font-weight:800;margin-bottom:16px;line-height:1.05;letter-spacing:${v.ls};">${s.heading || 'Hero Heading'}</h1>
        ${s.subheading ? `<p style="color:${v.tc};opacity:.75;font-size:1.1rem;margin-bottom:32px;line-height:1.7;max-width:560px;margin-left:auto;margin-right:auto;">${s.subheading}</p>` : ''}
        <div style="display:flex;gap:14px;justify-content:${s.text_align === 'left' ? 'flex-start' : s.text_align === 'right' ? 'flex-end' : 'center'};flex-wrap:wrap;">
          ${s.btn_primary ? `<span style="padding:14px 32px;background:${v.btnBg};color:${v.btnTc};border:2px solid ${v.btnBorder};font-size:12px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;">${s.btn_primary}</span>` : ''}
          ${s.btn_secondary ? `<span style="padding:14px 32px;background:transparent;color:${v.tc};border:2px solid ${v.tc};opacity:.8;font-size:12px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;">${s.btn_secondary}</span>` : ''}
        </div>
      </div>
    </div>`;
  },
  featured_collection(s) {
    const cols = s.columns_desktop || 4;
    return `<div style="padding:48px 32px;background:#fafafa;">
      <h2 style="text-align:center;margin-bottom:32px;font-size:1.75rem;font-weight:800;color:#111;letter-spacing:-.02em;">${s.title || 'Featured Collection'}</h2>
      <div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:20px;max-width:1200px;margin:0 auto;">
        ${[1, 2, 3, 4].slice(0, cols).map(i => `<div style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.07);">
          <div style="aspect-ratio:1;background:linear-gradient(135deg,#e8e8e8,#d0d0d0);display:flex;align-items:center;justify-content:center;font-size:2.5rem;">🛍</div>
          <div style="padding:14px;"><div style="height:10px;background:#eee;border-radius:3px;margin-bottom:7px;"></div><div style="height:9px;background:#f4f4f4;border-radius:3px;width:55%;margin-bottom:10px;"></div><div style="font-weight:800;color:#111;font-size:14px;">$49.00</div>${s.enable_quick_add ? `<div style="margin-top:10px;padding:8px;background:#111;color:#fff;text-align:center;font-size:11px;font-weight:700;letter-spacing:.05em;border-radius:4px;cursor:pointer;">ADD TO CART</div>` : ''}</div>
        </div>`).join('')}
      </div>
    </div>`;
  },
  rich_text(s) {
    return `<div style="padding:${s.padding_top || 60}px 32px ${s.padding_bottom || 60}px;max-width:760px;margin:0 auto;text-align:center;background:#fff;">
      ${s.heading ? `<h2 style="font-size:2rem;font-weight:800;color:#111;margin-bottom:20px;letter-spacing:-.02em;">${s.heading}</h2>` : ''}
      ${s.content ? `<div style="color:#555;line-height:1.8;font-size:1rem;margin-bottom:28px;">${s.content.replace(/<[^>]+>/g, '')}</div>` : ''}
      ${s.btn_label ? `<span style="display:inline-block;padding:12px 28px;background:#111;color:#fff;font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;">${s.btn_label}</span>` : ''}
    </div>`;
  },
  image_with_text(s) {
    const imgFirst = !s.image_position || s.image_position === "first";
    return `<div style="display:grid;grid-template-columns:1fr 1fr;min-height:400px;background:#fff;">
      ${imgFirst ? `<div style="background:url(${s.image_url || 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80'}) center/cover no-repeat;min-height:320px;"></div>` : ''}
      <div style="display:flex;align-items:center;padding:48px;">
        <div>
          ${s.heading ? `<h2 style="font-size:1.75rem;font-weight:800;color:#111;margin-bottom:16px;letter-spacing:-.02em;">${s.heading}</h2>` : ''}
          ${s.content ? `<p style="color:#555;line-height:1.8;margin-bottom:24px;">${s.content.replace(/<[^>]+>/g, '')}</p>` : ''}
          ${s.btn_label ? `<span style="display:inline-block;padding:11px 24px;background:#111;color:#fff;font-size:12px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;cursor:pointer;">${s.btn_label}</span>` : ''}
        </div>
      </div>
      ${!imgFirst ? `<div style="background:url(${s.image_url || 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80'}) center/cover no-repeat;min-height:320px;"></div>` : ''}
    </div>`;
  },
  testimonials(s) {
    return `<div style="padding:${s.padding_top || 48}px 32px ${s.padding_bottom || 48}px;background:#f8f8f8;">
      ${s.title ? `<h2 style="text-align:center;margin-bottom:32px;font-size:1.75rem;font-weight:800;color:#111;">${s.title}</h2>` : ''}
      <div style="display:grid;grid-template-columns:repeat(${s.columns || 3},1fr);gap:20px;max-width:1100px;margin:0 auto;">
        ${["Best purchase I've made all year. Quality is exceptional.", "Fast shipping, exceeded my expectations completely.", "Absolutely love this. The attention to detail is remarkable."].slice(0, s.columns || 3).map((t, i) => `<div style="background:#fff;border-radius:10px;padding:24px;box-shadow:0 2px 12px rgba(0,0,0,.06);">
          <div style="color:#f59e0b;margin-bottom:10px;font-size:1rem;">★★★★★</div>
          <p style="color:#333;font-size:.9rem;line-height:1.7;margin-bottom:16px;">"${t}"</p>
          <div style="font-weight:700;font-size:.85rem;color:#111;">Customer ${i + 1}</div>
          <div style="font-size:.75rem;color:#888;">Verified Buyer</div>
        </div>`).join('')}
      </div>
    </div>`;
  },
  newsletter(s) {
    return `<div style="padding:${s.padding_top || 60}px 32px ${s.padding_bottom || 60}px;text-align:center;background:linear-gradient(135deg,#7c6dfa,#5a4de8);color:#fff;">
      ${s.heading ? `<h2 style="font-size:2rem;font-weight:800;margin-bottom:12px;">${s.heading}</h2>` : ''}
      ${s.subheading ? `<p style="opacity:.85;margin-bottom:28px;max-width:480px;margin-left:auto;margin-right:auto;line-height:1.7;">${s.subheading}</p>` : ''}
      <div style="display:flex;gap:0;max-width:440px;margin:0 auto;border-radius:6px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.2);">
        <input style="flex:1;padding:14px 18px;border:none;font-size:14px;outline:none;" placeholder="${s.placeholder || 'Your email address'}" />
        <span style="padding:14px 22px;background:#fff;color:#5a4de8;font-weight:800;font-size:12px;letter-spacing:.07em;text-transform:uppercase;cursor:pointer;display:flex;align-items:center;">${s.btn_label || 'Subscribe'}</span>
      </div>
      ${s.disclaimer ? `<p style="margin-top:12px;font-size:11px;opacity:.55;">${s.disclaimer}</p>` : ''}
    </div>`;
  },
  collection_list(s) {
    return `<div style="padding:48px 32px;background:#fff;">
      ${s.title ? `<h2 style="text-align:center;margin-bottom:32px;font-size:1.75rem;font-weight:800;color:#111;">${s.title}</h2>` : ''}
      <div style="display:grid;grid-template-columns:repeat(${s.columns_desktop || 3},1fr);gap:24px;max-width:1100px;margin:0 auto;">
        ${["New Arrivals", "Best Sellers", "On Sale"].slice(0, s.columns_desktop || 3).map((n, i) => `<div style="position:relative;border-radius:10px;overflow:hidden;aspect-ratio:4/3;background:linear-gradient(135deg,hsl(${200 + i * 40},40%,75%),hsl(${220 + i * 40},30%,55%));display:flex;align-items:flex-end;">
          <div style="padding:20px;background:linear-gradient(transparent,rgba(0,0,0,.6));width:100%;">
            <div style="color:#fff;font-size:1.1rem;font-weight:800;">${n}</div>
            <div style="color:rgba(255,255,255,.7);font-size:12px;margin-top:4px;">Shop collection →</div>
          </div>
        </div>`).join('')}
      </div>
    </div>`;
  },
  video_banner(s) {
    return `<div style="min-height:320px;background:url(${s.poster_url || s.image_url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1400&q=80'}) center/cover no-repeat;display:flex;align-items:center;justify-content:center;position:relative;">
      <div style="position:absolute;inset:0;background:rgba(0,0,0,${s.overlay_opacity || 0.5});"></div>
      <div style="position:relative;z-index:1;text-align:center;padding:40px;">
        <div style="width:64px;height:64px;border-radius:50%;border:3px solid rgba(255,255,255,.8);display:inline-flex;align-items:center;justify-content:center;margin-bottom:20px;cursor:pointer;backdrop-filter:blur(8px);background:rgba(255,255,255,.15);">▶</div>
        ${s.heading ? `<h2 style="color:#fff;font-size:2rem;font-weight:800;margin-bottom:8px;">${s.heading}</h2>` : ''}
        ${s.subheading ? `<p style="color:rgba(255,255,255,.8);font-size:1rem;">${s.subheading}</p>` : ''}
      </div>
    </div>`;
  },
  footer(s) {
    return `<div style="background:#111;color:#aaa;padding:48px 32px 24px;">
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:32px;max-width:1200px;margin:0 auto 40px;">
        ${[["Shop", "All Products", "New Arrivals", "Best Sellers", "Sale"], ["Company", "Our Story", "Sustainability", "Press", "Careers"], ["Support", "FAQ", "Shipping", "Returns", "Contact Us"], ["Legal", "Privacy Policy", "Terms of Service", "Cookie Policy", "Accessibility"]].map(([h, ...links]) => `<div><div style="color:#fff;font-weight:800;margin-bottom:16px;font-size:.9rem;">${h}</div>${links.map(l => `<div style="margin-bottom:8px;font-size:13px;cursor:pointer;">${l}</div>`).join('')}</div>`).join('')}
      </div>
      <div style="border-top:1px solid #222;padding-top:24px;display:flex;align-items:center;justify-content:space-between;flex-wrap:gap;max-width:1200px;margin:0 auto;">
        <div style="font-size:12px;">${s.copyright_text || '© 2024 Your Store. All rights reserved.'}</div>
        ${s.show_payment_icons ? `<div style="display:flex;gap:8px;font-size:11px;color:#666;">VISA · MC · AMEX · PAYPAL · APPLE PAY</div>` : ''}
      </div>
    </div>`;
  }
};

// ─────────────────────────────────────────────────────────────
// UI COMPONENTS
// ─────────────────────────────────────────────────────────────
function Notification({ notif, onClose }: { notif: any, onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  const icons: Record<string, string> = { success: "✓", error: "✕", info: "ℹ" };
  return <div className={`tf-notif ${notif.type}`}><span>{icons[notif.type]}</span>{notif.message}</div>;
}

function Toggle({ value, onChange }: { value: boolean, onChange: (v: boolean) => void }) {
  return (
    <div className="tf-toggle" style={{ background: value ? "var(--acc)" : "var(--bg4)" }} onClick={() => onChange(!value)}>
      <div className="tf-toggle-knob" style={{ left: value ? 18 : 3 }} />
    </div>
  );
}

function SettingField({ s, val, onChange }: { s: any, val: any, onChange: (v: any) => void }) {
  const v = val !== undefined ? val : s.default;
  if (s.type === "text" || s.type === "url")
    return <div><span className="tf-label">{s.label}</span><input className="tf-input" value={v || ""} onChange={e => onChange(e.target.value)} placeholder={`Enter ${s.label.toLowerCase()}...`} /></div>;
  if (s.type === "textarea" || s.type === "richtext")
    return <div><span className="tf-label">{s.label}</span><textarea className="tf-input" value={v || ""} onChange={e => onChange(e.target.value)} rows={3} /></div>;
  if (s.type === "checkbox")
    return <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}><span style={{ fontSize: 12, color: "var(--t2)" }}>{s.label}</span><Toggle value={!!v} onChange={onChange} /></div>;
  if (s.type === "range")
    return <div><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}><span className="tf-label" style={{ margin: 0 }}>{s.label}</span><span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--acc)", background: "var(--acc3)", padding: "2px 7px", borderRadius: 3 }}>{v}{s.unit || ""}</span></div><input type="range" min={s.min} max={s.max} step={s.step} value={v || s.default || s.min} onChange={e => onChange(parseFloat(e.target.value))} style={{ width: "100%", accentColor: "var(--acc)" }} /></div>;
  if (s.type === "select")
    return <div><span className="tf-label">{s.label}</span><select className="tf-input" value={v || s.default || (s.options?.[0]?.value || s.options?.[0])} onChange={e => onChange(e.target.value)}>{(s.options || []).map((o: any) => { const ov = typeof o === "string" ? o : o.value; const ol = typeof o === "string" ? o : o.label; return <option key={ov} value={ov}>{ol}</option> })}</select></div>;
  if (s.type === "color")
    return <div><span className="tf-label">{s.label}</span><div style={{ display: "flex", gap: 8, alignItems: "center" }}><input type="color" value={v || s.default || "#000000"} onChange={e => onChange(e.target.value)} style={{ width: 36, height: 32, borderRadius: 4, border: "1px solid var(--bdr)", cursor: "pointer", padding: 2, background: "var(--bg0)" }} /><input className="tf-input" value={v || s.default || "#000000"} onChange={e => onChange(e.target.value)} style={{ fontFamily: "var(--font-mono)", fontSize: 11 }} /></div></div>;
  if (s.type === "image_picker")
    return <div><span className="tf-label">{s.label}</span><input className="tf-input" value={v || ""} onChange={e => onChange(e.target.value)} placeholder="Image URL..." />{v && <div style={{ marginTop: 6, borderRadius: 4, overflow: "hidden", height: 70 }}><img src={v} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" onError={(e: any) => e.target.style.display = "none"} /></div>}</div>;
  return <div><span className="tf-label">{s.label}</span><input className="tf-input" value={v || ""} onChange={e => onChange(e.target.value)} /></div>;
}

// ─────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────
const INITIAL_LAYOUT = {
  themeName: "My Shopify Theme",
  page: "index",
  sections: [
    { id: "s1", component: "announcement_bar", style: "solid", settings: { ...COMP_REGISTRY.announcement_bar.defaults } },
    { id: "s2", component: "hero", style: "modern-dark", settings: { ...COMP_REGISTRY.hero.defaults } },
    { id: "s3", component: "featured_collection", style: "grid", settings: { ...COMP_REGISTRY.featured_collection.defaults } },
    { id: "s4", component: "rich_text", style: "centered", settings: { ...COMP_REGISTRY.rich_text.defaults } },
    { id: "s5", component: "newsletter", style: "centered", settings: { ...COMP_REGISTRY.newsletter.defaults } },
    { id: "s6", component: "footer", style: "multi-column", settings: { ...COMP_REGISTRY.footer.defaults } }
  ]
};

export default function ThemeBuilder() {
  const [layout, setLayout] = useState(INITIAL_LAYOUT);
  const [selectedId, setSelectedId] = useState<string | null>("s2");
  const [previewMode, setPreviewMode] = useState("desktop");
  const [rightTab, setRightTab] = useState("settings");
  const [notif, setNotif] = useState<any>(null);

  const notify = useCallback((message: string, type = "info") => setNotif({ message, type, key: Date.now() }), []);

  const addSection = useCallback((compId: string, atEnd = true) => {
    const comp = COMP_REGISTRY[compId];
    if (!comp) return;
    const sec = { id: `s${Date.now()}`, component: compId, style: comp.styles[0], settings: { ...comp.defaults } };
    setLayout(prev => ({ ...prev, sections: atEnd ? [...prev.sections, sec] : [sec, ...prev.sections] }));
    setSelectedId(sec.id);
    notify(`${comp.label} added`, "success");
  }, [notify]);

  const updateSection = useCallback((id: string, updates: any) => {
    setLayout(prev => ({ ...prev, sections: prev.sections.map(s => s.id === id ? { ...s, ...updates } : s) }));
  }, []);

  const deleteSection = useCallback((id: string) => {
    setLayout(prev => ({ ...prev, sections: prev.sections.filter(s => s.id !== id) }));
    setSelectedId(prev => prev === id ? null : prev);
    notify("Section removed", "info");
  }, [notify]);

  const duplicateSection = useCallback((id: string) => {
    const sec = layout.sections.find(s => s.id === id);
    if (!sec) return;
    const dup = { ...sec, id: `s${Date.now()}`, settings: { ...sec.settings } };
    setLayout(prev => {
      const idx = prev.sections.findIndex(s => s.id === id);
      const secs = [...prev.sections];
      secs.splice(idx + 1, 0, dup);
      return { ...prev, sections: secs };
    });
    setSelectedId(dup.id);
    notify("Section duplicated", "success");
  }, [layout.sections, notify]);

  const moveSection = useCallback((index: number, direction: number) => {
    setLayout(prev => {
      const secs = [...prev.sections];
      const newIdx = index + direction;
      if (newIdx < 0 || newIdx >= secs.length) return prev;
      [secs[index], secs[newIdx]] = [secs[newIdx], secs[index]];
      return { ...prev, sections: secs };
    });
  }, []);

  const reorderSections = useCallback((from: number, to: number) => {
    setLayout(prev => {
      const secs = [...prev.sections];
      const [moved] = secs.splice(from, 1);
      secs.splice(to, 0, moved);
      return { ...prev, sections: secs };
    });
  }, []);

  const applyAI = useCallback((newSections: any[]) => {
    const validated = (newSections || []).filter(s => COMP_REGISTRY[s.component]).map(s => ({
      id: `s${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      component: s.component,
      style: s.style || COMP_REGISTRY[s.component].styles[0],
      settings: { ...COMP_REGISTRY[s.component].defaults, ...(s.settings || {}) }
    }));
    if (validated.length > 0) {
      setLayout(prev => ({ ...prev, sections: [...prev.sections, ...validated] }));
      notify(`${validated.length} AI sections added`, "success");
    }
  }, [notify]);

  const widths: Record<string, string> = { desktop: "100%", tablet: "768px", mobile: "390px" };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      {/* TOP BAR */}
      <div style={{ height: 48, background: "var(--bg1)", borderBottom: "1px solid var(--bdr)", display: "flex", alignItems: "center", padding: "0 14px", gap: 12, flexShrink: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginRight: 6 }}>
          <div style={{ width: 26, height: 26, borderRadius: 6, background: "var(--acc)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, boxShadow: "0 0 14px rgba(124,109,250,.4)" }}>⬛</div>
          <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: "-.02em" }}>ThemeForge</span>
          <span className="tf-tag tf-tag-acc" style={{ fontSize: 9 }}>OS 2.0</span>
        </div>
        <div style={{ width: 1, height: 20, background: "var(--bdr)" }} />
        <input
          value={layout.themeName}
          onChange={e => setLayout(prev => ({ ...prev, themeName: e.target.value }))}
          style={{ background: "transparent", border: "none", color: "var(--t1)", fontSize: 12, fontWeight: 700, outline: "none", width: 180 }}
        />
        <div style={{ flex: 1 }} />
        <div className="tf-tabs">
          {[["desktop", "🖥"], ["tablet", "📱"], ["mobile", "📲"]].map(([m, i]) => (
            <button key={m} className={`tf-tab ${previewMode === m ? "active" : ""}`} onClick={() => setPreviewMode(m)}>{i} {m}</button>
          ))}
        </div>
        <button className="tf-btn tf-btn-green" onClick={() => setRightTab("export")} style={{ fontSize: 11, padding: "6px 14px" }}>
          ⬇ Export ZIP
        </button>
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* LEFT PANEL */}
        <div style={{ width: 230, flexShrink: 0, background: "var(--bg1)", borderRight: "1px solid var(--bdr)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "10px 10px 8px", borderBottom: "1px solid var(--bdr)" }}>
            <span className="tf-label">Library</span>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: 8, display: "flex", flexDirection: "column", gap: 6 }}>
            {Object.values(COMP_REGISTRY).map((comp: any) => (
              <div key={comp.id} className="tf-card" style={{ padding: "10px 12px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ fontSize: 14 }}>{comp.icon}</span>
                    <span style={{ fontSize: 12, fontWeight: 700 }}>{comp.label}</span>
                  </div>
                  <button onClick={() => addSection(comp.id)} style={{ width: 20, height: 20, borderRadius: 4, background: "var(--acc3)", border: "1px solid rgba(124,109,250,.3)", color: "var(--acc)", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, flexShrink: 0 }}>+</button>
                </div>
                <div style={{ fontSize: 10, color: "var(--t3)", lineHeight: 1.4 }}>{comp.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CANVAS */}
        <div style={{ flex: 1, overflowY: "auto", background: "var(--bg0)", padding: "20px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ width: widths[previewMode] || "100%", maxWidth: "100%", transition: "width .3s ease", minHeight: 400 }}>
            <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 20px 80px rgba(0,0,0,.8)", minHeight: 500 }}>
              {layout.sections.map((sec, i) => {
                const renderer = RENDERERS[sec.component];
                const html = renderer ? renderer(sec.settings, sec.style) : `<div style="padding:24px;text-align:center;background:#f5f5f5;color:#666;">Section: ${sec.component}</div>`;
                const isSel = selectedId === sec.id;
                return (
                  <div
                    key={sec.id}
                    className="tf-section-wrap"
                    onClick={() => setSelectedId(sec.id)}
                    style={{
                      outline: isSel ? "2px solid #7c6dfa" : "none",
                      outlineOffset: -2,
                    }}
                  >
                    <div className="tf-section-badge">{COMP_REGISTRY[sec.component]?.label || sec.component} · {sec.style}</div>
                    <div dangerouslySetInnerHTML={{ __html: html }} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div style={{ width: 270, flexShrink: 0, background: "var(--bg1)", borderLeft: "1px solid var(--bdr)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "10px 10px 0", borderBottom: "1px solid var(--bdr)", flexShrink: 0 }}>
            <div className="tf-tabs">
              <button className={`tf-tab ${rightTab === "settings" ? "active" : ""}`} onClick={() => setRightTab("settings")}>Settings</button>
              <button className={`tf-tab ${rightTab === "ai" ? "active" : ""}`} onClick={() => setRightTab("ai")}>✦ AI</button>
              <button className={`tf-tab ${rightTab === "export" ? "active" : ""}`} onClick={() => setRightTab("export")}>Export</button>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: 12 }}>
            {rightTab === "settings" && (
              selectedId ? (
                (() => {
                  const section = layout.sections.find(s => s.id === selectedId);
                  const comp = section ? COMP_REGISTRY[section.component] : null;
                  if (!section || !comp) return null;
                  return (
                    <div className="tf-slide" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                          <span style={{ fontSize: 16 }}>{comp.icon}</span>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 800 }}>{comp.label}</div>
                            <div style={{ fontSize: 10, color: "var(--t3)", fontFamily: "var(--font-mono)" }}>{section.id}</div>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 5 }}>
                          <button onClick={() => duplicateSection(selectedId)} style={{ background: "transparent", border: "1px solid var(--bdr)", borderRadius: 4, color: "var(--t2)", fontSize: 12, cursor: "pointer", padding: "3px 7px" }}>⧉</button>
                          <button onClick={() => deleteSection(selectedId)} style={{ background: "transparent", border: "1px solid rgba(224,82,82,.3)", borderRadius: 4, color: "var(--red)", fontSize: 12, cursor: "pointer", padding: "3px 7px" }}>✕</button>
                        </div>
                      </div>
                      <span className="tf-label">Style Variant</span>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                        {comp.styles.map((st: string) => (
                          <button key={st} onClick={() => updateSection(selectedId, { style: st })} style={{ padding: "5px 11px", borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: "pointer", transition: "all .15s", background: section.style === st ? "var(--acc)" : "transparent", color: section.style === st ? "#fff" : "var(--t2)", border: `1px solid ${section.style === st ? "var(--acc)" : "var(--bdr)"}` }}>{st}</button>
                        ))}
                      </div>
                      <div className="tf-divider" />
                      {comp.schema.settings.filter((s: any) => s.id !== "__style_css").map((s: any) => (
                        <SettingField key={s.id} s={s} val={section.settings[s.id]} onChange={v => updateSection(selectedId, { settings: { ...section.settings, [s.id]: v } })} />
                      ))}
                    </div>
                  );
                })()
              ) : (
                <div style={{ textAlign: "center", padding: 24, color: "var(--t3)" }}>Select a section to edit</div>
              )
            )}

            {rightTab === "ai" && (
              <AITab layout={layout} onApply={applyAI} onNotify={notify} />
            )}

            {rightTab === "export" && (
              <ExportTab layout={layout} onNotify={notify} />
            )}
          </div>
        </div>
      </div>

      {notif && <Notification key={notif.key} notif={notif} onClose={() => setNotif(null)} />}
    </div>
  );
}

function AITab({ layout, onApply, onNotify }: { layout: any, onApply: (s: any) => void, onNotify: (m: string, t?: string) => void }) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const r = await callAI(prompt, layout.sections);
      onApply(r.sections);
      onNotify("AI layout applied", "success");
      setPrompt("");
    } catch (e: any) {
      onNotify("AI generation failed: " + e.message, "error");
    }
    setLoading(false);
  };

  return (
    <div className="tf-slide">
      <span className="tf-label">AI Assistant</span>
      <textarea className="tf-input" value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Describe the layout you want..." rows={4} style={{ marginBottom: 12 }} />
      <button className={`tf-btn tf-btn-primary ${loading ? "tf-pulse" : ""}`} onClick={generate} disabled={loading || !prompt.trim()} style={{ width: "100%", justifyContent: "center" }}>
        {loading ? "Generating..." : "✦ Generate Layout"}
      </button>
    </div>
  );
}

function ExportTab({ layout, onNotify }: { layout: any, onNotify: (m: string, t?: string) => void }) {
  const [exporting, setExporting] = useState(false);

  const doExport = async () => {
    setExporting(true);
    try {
      const zip = new JSZip();
      const themeName = layout.themeName || "My Shopify Theme";
      const usedComponents = [...new Set(layout.sections.map((s: any) => s.component))];

      const indexSections: Record<string, any> = {};
      const indexOrder: string[] = [];
      layout.sections.forEach((section: any, i: number) => {
        const key = `${section.component.replace(/_/g, "-")}_${i}`;
        indexOrder.push(key);
        indexSections[key] = {
          type: section.component.replace(/_/g, "-"),
          settings: { ...section.settings, __style_css: getStyleCSS(section.component, section.style) }
        };
      });

      zip.file("layout/theme.liquid", buildThemeLiquid(themeName));
      zip.file("templates/index.json", JSON.stringify({ sections: indexSections, order: indexOrder }, null, 2));

      usedComponents.forEach((compId: any) => {
        const liquidId = compId.replace(/_/g, "-");
        zip.file(`sections/${liquidId}.liquid`, buildSectionLiquid(compId));
      });

      zip.file("sections/header.liquid", buildHeaderSectionLiquid());
      zip.file("sections/header-group.json", buildHeaderGroupJson());
      zip.file("sections/footer-group.json", buildFooterGroupJson());
      zip.file("config/settings_schema.json", JSON.stringify(buildSettingsSchema(themeName), null, 2));
      zip.file("config/settings_data.json", JSON.stringify(buildSettingsData(), null, 2));
      zip.file("assets/base.css", buildBaseCSS());
      zip.file("assets/theme.css", buildThemeCSS(themeName));
      zip.file("assets/global.js", buildGlobalJS());
      zip.file("snippets/meta-tags.liquid", buildMetaTagsSnippet());
      zip.file("snippets/cart-notification.liquid", buildCartNotificationSnippet());
      zip.file("locales/en.default.json", buildLocalesEN());

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${themeName.replace(/\s+/g, "-").toLowerCase()}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      onNotify("Theme exported successfully!", "success");
    } catch (e: any) {
      onNotify("Export failed: " + e.message, "error");
    }
    setExporting(false);
  };

  return (
    <div className="tf-slide">
      <span className="tf-label">Export Theme</span>
      <button className="tf-btn tf-btn-green" onClick={doExport} disabled={exporting} style={{ width: "100%", justifyContent: "center" }}>
        {exporting ? "Exporting..." : "⬇ Download ZIP"}
      </button>
    </div>
  );
}
