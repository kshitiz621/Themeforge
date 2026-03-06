export const COMP_REGISTRY: Record<string, any> = {
  hero: {
    id: "hero", label: "Hero Banner", icon: "⬛", category: "Marketing",
    description: "Full-width hero with heading, subheading, CTA buttons",
    styles: ["minimal", "modern-dark", "luxury", "bold", "editorial"],
    defaults: { heading: "Elevate Your Style", subheading: "Discover our curated collection of premium products crafted for the modern lifestyle.", btn_primary: "Shop Now", btn_primary_link: "/collections/all", btn_secondary: "Learn More", btn_secondary_link: "/pages/about", image_url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1400&q=80", overlay_opacity: 0.45, text_align: "center", full_height: true },
    schema: {
      name: "Hero Banner", tag: "section", class: "section", disabled_on: { groups: ["header", "footer"] }, settings: [
        { type: "image_picker", id: "image", label: "Background Image" },
        { type: "range", id: "overlay_opacity", min: 0, max: 1, step: 0.05, label: "Image Overlay Opacity", default: 0.45 },
        { type: "text", id: "heading", default: "Elevate Your Style", label: "Heading" },
        { type: "textarea", id: "subheading", label: "Subheading" },
        { type: "text", id: "btn_primary", label: "Primary Button Label", default: "Shop Now" },
        { type: "url", id: "btn_primary_link", label: "Primary Button Link" },
        { type: "text", id: "btn_secondary", label: "Secondary Button Label" },
        { type: "url", id: "btn_secondary_link", label: "Secondary Button Link" },
        { type: "select", id: "text_align", options: [{ value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }], default: "center", label: "Text Alignment" },
        { type: "checkbox", id: "full_height", default: true, label: "Full Screen Height" },
        { type: "textarea", id: "__style_css", label: "Style CSS (auto)" }
      ], presets: [{ name: "Hero Banner" }]
    }
  },
  announcement_bar: {
    id: "announcement_bar", label: "Announcement Bar", icon: "📢", category: "Navigation",
    description: "Top-of-page banner with message and optional link",
    styles: ["solid", "gradient", "minimal", "dark"],
    defaults: { text: "Free shipping on orders over $50 — Use code FREESHIP", link_url: "/collections/all", link_label: "Shop Now →", bg_color: "#7c6dfa", text_color: "#ffffff", show_close: true },
    schema: {
      name: "Announcement bar", tag: "section", class: "section", limit: 1, settings: [
        { type: "text", id: "text", default: "Free shipping on orders over $50", label: "Announcement Text" },
        { type: "url", id: "link_url", label: "Link URL" },
        { type: "text", id: "link_label", label: "Link Label" },
        { type: "color", id: "bg_color", label: "Background Color", default: "#7c6dfa" },
        { type: "color", id: "text_color", label: "Text Color", default: "#ffffff" },
        { type: "checkbox", id: "show_close", default: true, label: "Show Close Button" }
      ], presets: [{ name: "Announcement bar" }]
    }
  },
  featured_collection: {
    id: "featured_collection", label: "Featured Collection", icon: "🗃️", category: "Products",
    description: "Showcase a collection grid with quick-add",
    styles: ["grid", "masonry", "minimal-list", "carousel"],
    defaults: { title: "Featured Collection", collection: "frontpage", products_to_show: 4, columns_desktop: 4, columns_mobile: 2, show_vendor: false, enable_quick_add: true, show_secondary_image: true, image_ratio: "square" },
    schema: {
      name: "Featured collection", tag: "section", class: "section", settings: [
        { type: "inline_richtext", id: "title", default: "Featured collection", label: "Heading" },
        { type: "collection", id: "collection", label: "Collection" },
        { type: "range", id: "products_to_show", min: 2, max: 25, step: 1, default: 4, label: "Max products to show" },
        { type: "range", id: "columns_desktop", min: 1, max: 5, step: 1, default: 4, label: "Columns (desktop)" },
        { type: "range", id: "columns_mobile", min: 1, max: 3, step: 1, default: 2, label: "Columns (mobile)" },
        { type: "checkbox", id: "show_vendor", default: false, label: "Show vendor" },
        { type: "checkbox", id: "enable_quick_add", default: false, label: "Enable quick add" },
        { type: "checkbox", id: "show_secondary_image", default: false, label: "Show second image on hover" },
        { type: "select", id: "image_ratio", options: [{ value: "adapt", label: "Adapt to image" }, { value: "portrait", label: "Portrait" }, { value: "square", label: "Square" }], default: "square", label: "Image ratio" },
        { type: "range", id: "padding_top", min: 0, max: 100, step: 4, unit: "px", label: "Top padding", default: 36 },
        { type: "range", id: "padding_bottom", min: 0, max: 100, step: 4, unit: "px", label: "Bottom padding", default: 36 }
      ], presets: [{ name: "Featured collection" }]
    }
  },
  rich_text: {
    id: "rich_text", label: "Rich Text", icon: "📝", category: "Content",
    description: "Formatted text block with heading, body, and CTA",
    styles: ["centered", "left-aligned", "boxed", "editorial"],
    defaults: { heading: "Built with intention", content: "<p>We believe in creating products that stand the test of time. Our commitment to quality craftsmanship and sustainable practices defines everything we do.</p>", btn_label: "Read our story", btn_link: "/pages/about", heading_size: "h2" },
    schema: {
      name: "Rich text", tag: "section", class: "section", settings: [
        { type: "text", id: "heading", label: "Heading" },
        { type: "richtext", id: "content", label: "Content" },
        { type: "text", id: "btn_label", label: "Button Label" },
        { type: "url", id: "btn_link", label: "Button Link" },
        { type: "select", id: "heading_size", label: "Heading Size", options: [{ value: "h1", label: "Large (H1)" }, { value: "h2", label: "Medium (H2)" }, { value: "h3", label: "Small (H3)" }], default: "h2" },
        { type: "range", id: "padding_top", min: 0, max: 100, step: 4, unit: "px", label: "Top padding", default: 60 },
        { type: "range", id: "padding_bottom", min: 0, max: 100, step: 4, unit: "px", label: "Bottom padding", default: 60 }
      ], presets: [{ name: "Rich text" }]
    }
  },
  image_with_text: {
    id: "image_with_text", label: "Image with Text", icon: "🖼️", category: "Content",
    description: "Side-by-side image and text layout",
    styles: ["image-first", "text-first", "overlap", "editorial"],
    defaults: { image_url: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80", heading: "Our Craft", content: "<p>Every product tells a story of meticulous craftsmanship, sustainable sourcing, and thoughtful design.</p>", btn_label: "Discover more", btn_link: "/pages/about", image_position: "first" },
    schema: {
      name: "Image with text", tag: "section", class: "section", settings: [
        { type: "image_picker", id: "image", label: "Image" },
        { type: "select", id: "image_position", options: [{ value: "first", label: "Image first" }, { value: "second", label: "Image second" }], default: "first", label: "Image position" },
        { type: "text", id: "heading", label: "Heading" },
        { type: "richtext", id: "content", label: "Text" },
        { type: "text", id: "btn_label", label: "Button Label" },
        { type: "url", id: "btn_link", label: "Button Link" }
      ], presets: [{ name: "Image with text" }]
    }
  },
  testimonials: {
    id: "testimonials", label: "Testimonials", icon: "💬", category: "Social Proof",
    description: "Customer reviews with star ratings",
    styles: ["cards", "quote-wall", "minimal", "dark"],
    defaults: { title: "What customers are saying", layout: "grid", columns: 3 },
    schema: {
      name: "Testimonials", tag: "section", class: "section", settings: [
        { type: "text", id: "title", label: "Section Title", default: "What customers are saying" },
        { type: "select", id: "layout", label: "Layout", options: [{ value: "grid", label: "Grid" }, { value: "slider", label: "Slider" }], default: "grid" },
        { type: "range", id: "columns", min: 1, max: 4, step: 1, label: "Columns", default: 3 },
        { type: "range", id: "padding_top", min: 0, max: 100, step: 4, unit: "px", label: "Top padding", default: 48 },
        { type: "range", id: "padding_bottom", min: 0, max: 100, step: 4, unit: "px", label: "Bottom padding", default: 48 }
      ], blocks: [{
        type: "testimonial", name: "Testimonial", limit: 9, settings: [
          { type: "text", id: "author", label: "Author Name", default: "Happy Customer" },
          { type: "text", id: "role", label: "Role / Company" },
          { type: "textarea", id: "content", label: "Review Text", default: "Absolutely love this product!" },
          { type: "range", id: "rating", min: 1, max: 5, step: 1, label: "Star Rating", default: 5 }
        ]
      }], presets: [{
        name: "Testimonials", blocks: [
          { type: "testimonial", settings: { author: "Sarah M.", role: "Verified Buyer", content: "Best purchase I've made all year. Quality is exceptional.", rating: 5 } },
          { type: "testimonial", settings: { author: "James R.", role: "Verified Buyer", content: "Fast shipping, perfect quality. Will definitely order again.", rating: 5 } },
          { type: "testimonial", settings: { author: "Emma L.", role: "Verified Buyer", content: "Exceeded my expectations. The attention to detail is remarkable.", rating: 5 } }
        ]
      }]
    }
  },
  newsletter: {
    id: "newsletter", label: "Newsletter Signup", icon: "✉️", category: "Marketing",
    description: "Email capture with customizable copy",
    styles: ["centered", "split", "banner", "minimal"],
    defaults: { heading: "Join our community", subheading: "Subscribe for exclusive offers and early access to new collections. No spam, ever.", placeholder: "Enter your email address", btn_label: "Subscribe", disclaimer: "By subscribing you agree to our Privacy Policy." },
    schema: {
      name: "Email signup", tag: "section", class: "section", settings: [
        { type: "text", id: "heading", label: "Heading", default: "Join our community" },
        { type: "textarea", id: "subheading", label: "Subheading" },
        { type: "text", id: "placeholder", label: "Input Placeholder", default: "Enter your email" },
        { type: "text", id: "btn_label", label: "Button Label", default: "Subscribe" },
        { type: "text", id: "disclaimer", label: "Disclaimer Text" },
        { type: "range", id: "padding_top", min: 0, max: 100, step: 4, unit: "px", label: "Top padding", default: 60 },
        { type: "range", id: "padding_bottom", min: 0, max: 100, step: 4, unit: "px", label: "Bottom padding", default: 60 }
      ], presets: [{ name: "Email signup" }]
    }
  },
  collection_list: {
    id: "collection_list", label: "Collection List", icon: "📂", category: "Products",
    description: "Grid of collection cards linking to collections",
    styles: ["grid", "large-cards", "minimal", "editorial"],
    defaults: { title: "Shop by Category", columns_desktop: 3, columns_mobile: 1 },
    schema: {
      name: "Collection list", tag: "section", class: "section", settings: [
        { type: "text", id: "title", label: "Heading", default: "Shop by Category" },
        { type: "range", id: "columns_desktop", min: 2, max: 5, step: 1, default: 3, label: "Columns (desktop)" },
        { type: "range", id: "columns_mobile", min: 1, max: 2, step: 1, default: 1, label: "Columns (mobile)" },
        { type: "range", id: "padding_top", min: 0, max: 100, step: 4, unit: "px", label: "Top padding", default: 36 },
        { type: "range", id: "padding_bottom", min: 0, max: 100, step: 4, unit: "px", label: "Bottom padding", default: 36 }
      ], blocks: [{
        type: "collection", name: "Collection", limit: 6, settings: [
          { type: "collection", id: "collection", label: "Collection" },
          { type: "image_picker", id: "image", label: "Custom Image (optional)" },
          { type: "text", id: "custom_title", label: "Custom Title (optional)" }
        ]
      }], presets: [{ name: "Collection list" }]
    }
  },
  video_banner: {
    id: "video_banner", label: "Video Banner", icon: "🎬", category: "Media",
    description: "Autoplay background video with text overlay",
    styles: ["fullwidth", "contained", "split", "minimal"],
    defaults: { video_url: "", poster_url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1400&q=80", heading: "Our Story", subheading: "Watch how we bring our products to life", overlay_opacity: 0.5 },
    schema: {
      name: "Video banner", tag: "section", class: "section", settings: [
        { type: "video", id: "video", label: "Video" },
        { type: "text", id: "video_url", label: "Video URL (Shopify CDN)" },
        { type: "image_picker", id: "poster", label: "Poster Image" },
        { type: "text", id: "heading", label: "Heading" },
        { type: "text", id: "subheading", label: "Subheading" },
        { type: "range", id: "overlay_opacity", min: 0, max: 1, step: 0.1, label: "Overlay Opacity", default: 0.5 },
        { type: "select", id: "height", options: [{ value: "small", label: "Small" }, { value: "medium", label: "Medium" }, { value: "large", label: "Large" }], default: "large", label: "Section Height" }
      ], presets: [{ name: "Video banner" }]
    }
  },
  footer: {
    id: "footer", label: "Footer", icon: "⬇️", category: "Navigation",
    description: "Site footer with links, social, and copyright",
    styles: ["multi-column", "minimal", "dark", "editorial"],
    defaults: { show_social: true, show_payment_icons: true, copyright_text: "© 2024 Your Store. All rights reserved.", newsletter_enable: true, newsletter_heading: "Stay connected" },
    schema: {
      name: "Footer", tag: "section", class: "section", limit: 1, settings: [
        { type: "checkbox", id: "show_social", default: true, label: "Show Social Media Icons" },
        { type: "checkbox", id: "show_payment_icons", default: true, label: "Show Payment Icons" },
        { type: "text", id: "copyright_text", label: "Copyright Text" },
        { type: "checkbox", id: "newsletter_enable", default: true, label: "Enable Newsletter in Footer" },
        { type: "text", id: "newsletter_heading", label: "Newsletter Heading", default: "Stay connected" }
      ], blocks: [{
        type: "link_list", name: "Footer menu", limit: 4, settings: [
          { type: "text", id: "heading", label: "Heading", default: "Quick links" },
          { type: "link_list", id: "menu", label: "Menu", default: "footer" }
        ]
      }], presets: [{ name: "Footer" }]
    }
  }
};

export const CATEGORIES = ["All", "Marketing", "Products", "Content", "Media", "Social Proof", "Navigation"];

export const STYLE_DEFS: Record<string, any> = {
  hero: {
    minimal: { label: "Minimal", bg: "#ffffff", tc: "#111111", ac: "#111111", btnBg: "#111111", btnBorder: "#111111", btnTc: "#ffffff", fontSize: "clamp(2.5rem,5vw,5rem)", ls: "-0.03em" },
    "modern-dark": { label: "Modern Dark", bg: "#0d0d1a", tc: "#ffffff", ac: "#7c6dfa", btnBg: "#7c6dfa", btnBorder: "#7c6dfa", btnTc: "#ffffff", fontSize: "clamp(3rem,6vw,6rem)", ls: "-0.04em" },
    luxury: { label: "Luxury", bg: "#1a1208", tc: "#e8d5b0", ac: "#c9a96e", btnBg: "transparent", btnBorder: "#c9a96e", btnTc: "#c9a96e", fontSize: "clamp(2rem,4vw,4.5rem)", ls: "0.08em" },
    bold: { label: "Bold", bg: "#e82c2c", tc: "#ffffff", ac: "#000000", btnBg: "#000000", btnBorder: "#000000", btnTc: "#ffffff", fontSize: "clamp(3.5rem,7vw,7rem)", ls: "-0.05em" },
    editorial: { label: "Editorial", bg: "#f0ebe3", tc: "#2c2424", ac: "#8b4513", btnBg: "transparent", btnBorder: "#2c2424", btnTc: "#2c2424", fontSize: "clamp(2rem,4.5vw,5rem)", ls: "0.04em" }
  }
};

export function getStyleCSS(component: string, style: string) {
  const v = STYLE_DEFS[component]?.[style];
  if (!v) return "";
  if (component === "hero") return `
.hero-section{--hero-bg:${v.bg};--hero-tc:${v.tc};--hero-ac:${v.ac};--hero-btn-bg:${v.btnBg};--hero-btn-border:${v.btnBorder};--hero-btn-tc:${v.btnTc};--hero-fs:${v.fontSize};--hero-ls:${v.ls};}`;
  return "";
}
