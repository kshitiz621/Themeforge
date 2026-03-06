import { COMP_REGISTRY, getStyleCSS } from './shopify-registry';

export function buildThemeLiquid(themeName: string) {
  return `<!doctype html>
<html class="no-js" lang="{{ request.locale.iso_code }}">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="theme-color" content="{{ settings.color_accent }}">
    <link rel="canonical" href="{{ canonical_url }}">
    <link rel="preconnect" href="https://cdn.shopify.com" crossorigin>
    {%- if settings.favicon != blank -%}
      <link rel="icon" type="image/png" href="{{ settings.favicon | image_url: width: 32, height: 32 }}">
    {%- endif -%}
    <title>
      {{ page_title }}
      {%- if current_tags %} &ndash; tagged "{{ current_tags | join: ', ' }}"{% endif -%}
      {%- if current_page != 1 %} &ndash; Page {{ current_page }}{% endif -%}
      {%- unless page_title contains shop.name %} &ndash; {{ shop.name }}{% endunless -%}
    </title>
    {%- if page_description -%}
      <meta name="description" content="{{ page_description | escape }}">
    {%- endif -%}
    {% render 'meta-tags' %}
    {{ content_for_header }}
    <link rel="stylesheet" href="{{ 'base.css' | asset_url }}">
    <link rel="stylesheet" href="{{ 'theme.css' | asset_url }}">
    {%- if settings.animations_reveal_on_scroll -%}
      <style>
        .animate--slide-in,
        .animate--zoom-in,
        .animate--fade-in { opacity: 0; }
      </style>
    {%- endif -%}
    <script>
      document.documentElement.className = document.documentElement.className.replace('no-js', 'js');
      if (Shopify.designMode) { document.documentElement.classList.add('shopify-design-mode'); }
    </script>
  </head>

  <body class="gradient">
    <a class="skip-to-content-link button visually-hidden" href="#MainContent">
      {{ 'accessibility.skip_to_text_link' | t }}
    </a>

    {%- if settings.cart_type == 'notification' -%}
      {%- render 'cart-notification' -%}
    {%- endif -%}

    {% sections 'header-group' %}

    <main id="MainContent" class="content-for-layout focus-none" role="main" tabindex="-1">
      {{ content_for_layout }}
    </main>

    {% sections 'footer-group' %}

    <ul hidden id="a11y-refresh-page-message">
      <li>{{ 'accessibility.refresh_page' | t }}</li>
    </ul>

    <script src="{{ 'global.js' | asset_url }}" defer="defer"></script>
  </body>
</html>`;
}

export function buildSectionLiquid(compId: string) {
  const comp = COMP_REGISTRY[compId];
  if (!comp) return `{%- comment -%}Unknown section: ${compId}{%- endcomment -%}`;

  const schemaJSON = JSON.stringify(comp.schema, null, 2);

  switch (compId) {
    case "hero": return buildHeroLiquid(schemaJSON);
    case "announcement_bar": return buildAnnouncementLiquid(schemaJSON);
    case "featured_collection": return buildFeaturedCollectionLiquid(schemaJSON);
    case "rich_text": return buildRichTextLiquid(schemaJSON);
    case "image_with_text": return buildImageWithTextLiquid(schemaJSON);
    case "testimonials": return buildTestimonialsLiquid(schemaJSON);
    case "newsletter": return buildNewsletterLiquid(schemaJSON);
    case "collection_list": return buildCollectionListLiquid(schemaJSON);
    case "video_banner": return buildVideoBannerLiquid(schemaJSON);
    case "footer": return buildFooterLiquid(schemaJSON);
    default: return buildGenericLiquid(comp, schemaJSON);
  }
}

function buildHeroLiquid(schemaJSON: string) {
  return `{%- style -%}
  {{ section.settings.__style_css }}
  .hero-section-{{ section.id }} {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    {%- if section.settings.full_height -%}
      min-height: 100vh;
    {%- else -%}
      min-height: 60vh;
    {%- endif -%}
    background-color: var(--hero-bg, #111);
  }
  .hero-section-{{ section.id }} .hero__media {
    position: absolute;
    inset: 0;
    z-index: 0;
  }
  .hero-section-{{ section.id }} .hero__media img {
    width: 100%; height: 100%; object-fit: cover;
  }
  .hero-section-{{ section.id }} .hero__overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, {{ section.settings.overlay_opacity | default: 0.45 }});
    z-index: 1;
  }
  .hero-section-{{ section.id }} .hero__content {
    position: relative;
    z-index: 2;
    text-align: {{ section.settings.text_align | default: 'center' }};
    padding: 48px 24px;
    max-width: 900px;
    margin: 0 auto;
    width: 100%;
  }
  .hero-section-{{ section.id }} .hero__heading {
    font-size: var(--hero-fs, clamp(2.5rem, 5vw, 5rem));
    letter-spacing: var(--hero-ls, -0.03em);
    color: var(--hero-tc, #ffffff);
    line-height: 1.05;
    font-weight: 800;
    margin-bottom: 20px;
  }
  .hero-section-{{ section.id }} .hero__subheading {
    font-size: clamp(1rem, 2vw, 1.2rem);
    color: var(--hero-tc, #ffffff);
    opacity: 0.78;
    line-height: 1.7;
    margin-bottom: 36px;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }
  .hero-section-{{ section.id }} .hero__buttons {
    display: flex;
    gap: 14px;
    justify-content: {{ section.settings.text_align | default: 'center' }};
    flex-wrap: wrap;
  }
  .hero-section-{{ section.id }} .btn--primary {
    display: inline-block;
    padding: 15px 36px;
    background: var(--hero-btn-bg, #ffffff);
    color: var(--hero-btn-tc, #000000);
    border: 2px solid var(--hero-btn-border, #ffffff);
    font-size: 13px;
    font-weight: 800;
    text-decoration: none;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    transition: opacity 0.2s ease, transform 0.2s ease;
  }
  .hero-section-{{ section.id }} .btn--primary:hover {
    opacity: 0.85;
    transform: translateY(-2px);
  }
  .hero-section-{{ section.id }} .btn--secondary {
    display: inline-block;
    padding: 15px 36px;
    background: transparent;
    color: var(--hero-tc, #ffffff);
    border: 2px solid var(--hero-tc, #ffffff);
    font-size: 13px;
    font-weight: 800;
    text-decoration: none;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    opacity: 0.85;
    transition: opacity 0.2s ease, background 0.2s ease;
  }
  .hero-section-{{ section.id }} .btn--secondary:hover { opacity: 1; }
{%- endstyle -%}

<section class="hero-section hero-section-{{ section.id }}" id="Hero-{{ section.id }}">
  {%- if section.settings.image != blank -%}
    <div class="hero__media">
      {{
        section.settings.image
        | image_url: width: 1920
        | image_tag:
          loading: 'eager',
          fetchpriority: 'high',
          widths: '375, 550, 750, 1100, 1500, 1780, 2000',
          sizes: '100vw',
          class: 'hero__image'
      }}
    </div>
  {%- endif -%}
  <div class="hero__overlay"></div>
  <div class="page-width hero__content">
    {%- if section.settings.heading != blank -%}
      <h1 class="hero__heading">
        {{- section.settings.heading -}}
      </h1>
    {%- endif -%}
    {%- if section.settings.subheading != blank -%}
      <p class="hero__subheading">{{ section.settings.subheading }}</p>
    {%- endif -%}
    {%- if section.settings.btn_primary != blank or section.settings.btn_secondary != blank -%}
      <div class="hero__buttons">
        {%- if section.settings.btn_primary != blank -%}
          <a href="{{ section.settings.btn_primary_link | default: '/collections/all' }}" class="btn--primary">
            {{- section.settings.btn_primary -}}
          </a>
        {%- endif -%}
        {%- if section.settings.btn_secondary != blank -%}
          <a href="{{ section.settings.btn_secondary_link | default: '/pages/about' }}" class="btn--secondary">
            {{- section.settings.btn_secondary -}}
          </a>
        {%- endif -%}
      </div>
    {%- endif -%}
  </div>
</section>

{% schema %}
${schemaJSON}
{% endschema %}`;
}

function buildAnnouncementLiquid(schemaJSON: string) {
  return `{%- style -%}
  .announcement-{{ section.id }} {
    background-color: {{ section.settings.bg_color | default: '#7c6dfa' }};
    color: {{ section.settings.text_color | default: '#ffffff' }};
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 10px 20px;
    font-size: 14px;
    font-weight: 500;
    text-align: center;
    position: relative;
  }
  .announcement-{{ section.id }} a {
    color: {{ section.settings.text_color | default: '#ffffff' }};
    font-weight: 700;
    text-decoration: underline;
    text-underline-offset: 2px;
  }
{%- endstyle -%}

{%- if section.settings.text != blank -%}
  <div class="announcement-bar announcement-{{ section.id }}" id="AnnouncementBar-{{ section.id }}" role="region">
    <p class="announcement__message">
      {{ section.settings.text }}
      {%- if section.settings.link_url != blank and section.settings.link_label != blank -%}
        &nbsp;<a href="{{ section.settings.link_url }}">{{ section.settings.link_label }}</a>
      {%- endif -%}
    </p>
  </div>
{%- endif -%}

{% schema %}
${schemaJSON}
{% endschema %}`;
}

function buildFeaturedCollectionLiquid(schemaJSON: string) {
  return `{%- style -%}
  .featured-collection-{{ section.id }} {
    padding-top: {{ section.settings.padding_top | default: 36 }}px;
    padding-bottom: {{ section.settings.padding_bottom | default: 36 }}px;
  }
  .featured-collection-{{ section.id }} .collection-grid {
    display: grid;
    grid-template-columns: repeat({{ section.settings.columns_desktop | default: 4 }}, 1fr);
    gap: 20px;
  }
{%- endstyle -%}

<div class="featured-collection featured-collection-{{ section.id }}">
  <div class="page-width">
    {%- if section.settings.title != blank -%}
      <h2 class="section-heading">{{ section.settings.title }}</h2>
    {%- endif -%}
    <ul class="collection-grid" role="list">
      {%- assign collection = section.settings.collection -%}
      {%- if collection == blank -%}
        {%- for i in (1..section.settings.products_to_show) -%}
          <li>Placeholder Product {{ i }}</li>
        {%- endfor -%}
      {%- else -%}
        {%- for product in collection.products limit: section.settings.products_to_show -%}
          <li>{{ product.title }}</li>
        {%- endfor -%}
      {%- endif -%}
    </ul>
  </div>
</div>

{% schema %}
${schemaJSON}
{% endschema %}`;
}

function buildRichTextLiquid(schemaJSON: string) {
  return `{%- style -%}
  .rich-text-{{ section.id }} {
    padding-top: {{ section.settings.padding_top | default: 60 }}px;
    padding-bottom: {{ section.settings.padding_bottom | default: 60 }}px;
  }
{%- endstyle -%}

<div class="rich-text rich-text-{{ section.id }}">
  <div class="page-width">
    {%- if section.settings.heading != blank -%}
      <{{ section.settings.heading_size | default: 'h2' }}>{{ section.settings.heading }}</{{ section.settings.heading_size | default: 'h2' }}>
    {%- endif -%}
    {%- if section.settings.content != blank -%}
      <div>{{ section.settings.content }}</div>
    {%- endif -%}
  </div>
</div>

{% schema %}
${schemaJSON}
{% endschema %}`;
}

function buildImageWithTextLiquid(schemaJSON: string) {
  return `{%- style -%}
  .image-with-text-{{ section.id }} {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
{%- endstyle -%}

<div class="image-with-text image-with-text-{{ section.id }}">
  <div class="image-with-text__media">
    {%- if section.settings.image != blank -%}
      {{ section.settings.image | image_url: width: 900 | image_tag: loading: 'lazy' }}
    {%- endif -%}
  </div>
  <div class="image-with-text__content">
    {%- if section.settings.heading != blank -%}
      <h2>{{ section.settings.heading }}</h2>
    {%- endif -%}
    {%- if section.settings.content != blank -%}
      <div>{{ section.settings.content }}</div>
    {%- endif -%}
  </div>
</div>

{% schema %}
${schemaJSON}
{% endschema %}`;
}

function buildTestimonialsLiquid(schemaJSON: string) {
  return `{% schema %}
${schemaJSON}
{% endschema %}`;
}

function buildNewsletterLiquid(schemaJSON: string) {
  return `{% schema %}
${schemaJSON}
{% endschema %}`;
}

function buildCollectionListLiquid(schemaJSON: string) {
  return `{% schema %}
${schemaJSON}
{% endschema %}`;
}

function buildVideoBannerLiquid(schemaJSON: string) {
  return `{% schema %}
${schemaJSON}
{% endschema %}`;
}

function buildFooterLiquid(schemaJSON: string) {
  return `{% schema %}
${schemaJSON}
{% endschema %}`;
}

function buildGenericLiquid(comp: any, schemaJSON: string) {
  return `{% schema %}
${schemaJSON}
{% endschema %}`;
}

export function buildSettingsSchema(themeName: string) {
  return [
    {
      name: "theme_info",
      theme_name: themeName,
      theme_version: "1.0.0",
      theme_author: "ThemeForge"
    },
    {
      name: "Colors",
      settings: [
        { type: "color", id: "color_background_1", label: "Background 1", default: "#ffffff" },
        { type: "color", id: "color_accent_1", label: "Accent 1", default: "#7c6dfa" }
      ]
    }
  ];
}

export function buildSettingsData() {
  return {
    current: {
      color_background_1: "#ffffff",
      color_accent_1: "#7c6dfa"
    }
  };
}

export function buildBaseCSS() {
  return `/* Base CSS */`;
}

export function buildThemeCSS(themeName: string) {
  return `/* Theme CSS for ${themeName} */`;
}

export function buildGlobalJS() {
  return `/* Global JS */`;
}

export function buildMetaTagsSnippet() {
  return `{%- comment -%}Meta tags{%- endcomment -%}`;
}

export function buildCartNotificationSnippet() {
  return `{%- comment -%}Cart notification{%- endcomment -%}`;
}

export function buildLocalesEN() {
  return JSON.stringify({
    general: {
      accessibility: {
        skip_to_text_link: "Skip to content"
      }
    }
  }, null, 2);
}

export function buildHeaderGroupJson() {
  return JSON.stringify({
    type: "header",
    name: "Header group",
    sections: {
      "announcement-bar": { type: "announcement-bar", settings: {} }
    },
    order: ["announcement-bar"]
  }, null, 2);
}

export function buildFooterGroupJson() {
  return JSON.stringify({
    type: "footer",
    name: "Footer group",
    sections: {
      "footer": { type: "footer", settings: {} }
    },
    order: ["footer"]
  }, null, 2);
}

export function buildHeaderSectionLiquid() {
  return `{% schema %}
{
  "name": "Header",
  "settings": []
}
{% endschema %}`;
}
