/**
 * @fileoverview pseudo-kit-assets — barrel export
 *
 * Exports:
 *   components     — URL map for all component .html files (use with register())
 *   frames         — URL map for all frame .html files
 *   componentsMeta — props/slots/layer metadata for tooling and viewer
 *   framesMeta     — slots/description metadata for frames
 *
 * Usage:
 *   import { components, componentNames } from 'pseudo-kit-assets';
 *   PseudoKit.register({ name: componentNames.card, src: components.card });
 *   // → registers <card-pk>
 *
 *   // Or auto-register all at once:
 *   import { components, componentNames } from 'pseudo-kit-assets';
 *   Object.entries(components).forEach(([key, src]) =>
 *     PseudoKit.register({ name: componentNames[key], src })
 *   );
 *   PseudoKit.init();
 */

// ── Utility: resolve URL relative to this file ────────────────────────────
const r = (path) => new URL(path, import.meta.url).href;

// ── Component Names (pk- suffixed HTML tag names) ──────────────────────────
/** Maps camelCase keys → `*-pk` HTML tag names for PseudoKit.register() */
export const componentNames = {
  // Atoms
  avatar:       'avatar-pk',
  badge:        'badge-pk',
  button:       'button-pk',
  chip:         'chip-pk',
  divider:      'divider-pk',
  icon:         'icon-pk',
  image:        'image-pk',
  input:        'input-pk',
  label:        'label-pk',
  loader:       'loader-pk',
  progressBar:  'progress-bar-pk',
  rating:       'rating-pk',
  skeleton:     'skeleton-pk',
  spinner:      'spinner-pk',
  tag:          'tag-pk',
  textarea:     'textarea-pk',
  toggle:       'toggle-pk',
  // Molecules
  breadcrumb:   'breadcrumb-pk',
  card:         'card-pk',
  cardMedia:    'card-media-pk',
  dropdown:     'dropdown-pk',
  formField:    'form-field-pk',
  listItem:     'list-item-pk',
  menuItem:     'menu-item-pk',
  modal:        'modal-pk',
  notification: 'notification-pk',
  pagination:   'pagination-pk',
  priceTag:     'price-tag-pk',
  productTile:  'product-tile-pk',
  searchBar:    'search-bar-pk',
  tabBar:       'tab-bar-pk',
  tooltip:      'tooltip-pk',
  userInfo:     'user-info-pk',
  // Organisms
  cartSummary:    'cart-summary-pk',
  commentThread:  'comment-thread-pk',
  contentRow:     'content-row-pk',
  feedPost:       'feed-post-pk',
  footer:         'footer-pk',
  heroBanner:     'hero-banner-pk',
  navbar:         'navbar-pk',
  productDetail:  'product-detail-pk',
  profileCard:    'profile-card-pk',
  sidebar:        'sidebar-pk',
  storyRing:      'story-ring-pk',
  thumbnailGrid:  'thumbnail-grid-pk',
  topbar:         'topbar-pk',
};

// ── Component URLs ─────────────────────────────────────────────────────────
export const components = {
  // Atoms
  avatar:       r('./components/atoms/avatar.html'),
  badge:        r('./components/atoms/badge.html'),
  button:       r('./components/atoms/button.html'),
  chip:         r('./components/atoms/chip.html'),
  divider:      r('./components/atoms/divider.html'),
  icon:         r('./components/atoms/icon.html'),
  image:        r('./components/atoms/image.html'),
  input:        r('./components/atoms/input.html'),
  label:        r('./components/atoms/label.html'),
  loader:       r('./components/atoms/loader.html'),
  progressBar:  r('./components/atoms/progress-bar.html'),
  rating:       r('./components/atoms/rating.html'),
  skeleton:     r('./components/atoms/skeleton.html'),
  spinner:      r('./components/atoms/spinner.html'),
  tag:          r('./components/atoms/tag.html'),
  textarea:     r('./components/atoms/textarea.html'),
  toggle:       r('./components/atoms/toggle.html'),

  // Molecules (Sprint 2)
  breadcrumb:   r('./components/molecules/breadcrumb.html'),
  card:         r('./components/molecules/card.html'),
  cardMedia:    r('./components/molecules/card-media.html'),
  dropdown:     r('./components/molecules/dropdown.html'),
  formField:    r('./components/molecules/form-field.html'),
  listItem:     r('./components/molecules/list-item.html'),
  menuItem:     r('./components/molecules/menu-item.html'),
  modal:        r('./components/molecules/modal.html'),
  notification: r('./components/molecules/notification.html'),
  pagination:   r('./components/molecules/pagination.html'),
  priceTag:     r('./components/molecules/price-tag.html'),
  productTile:  r('./components/molecules/product-tile.html'),
  searchBar:    r('./components/molecules/search-bar.html'),
  tabBar:       r('./components/molecules/tab-bar.html'),
  tooltip:      r('./components/molecules/tooltip.html'),
  userInfo:     r('./components/molecules/user-info.html'),

  // Organisms (Sprint 3)
  cartSummary:    r('./components/organisms/cart-summary.html'),
  commentThread:  r('./components/organisms/comment-thread.html'),
  contentRow:     r('./components/organisms/content-row.html'),
  feedPost:       r('./components/organisms/feed-post.html'),
  footer:         r('./components/organisms/footer.html'),
  heroBanner:     r('./components/organisms/hero-banner.html'),
  navbar:         r('./components/organisms/navbar.html'),
  productDetail:  r('./components/organisms/product-detail.html'),
  profileCard:    r('./components/organisms/profile-card.html'),
  sidebar:        r('./components/organisms/sidebar.html'),
  storyRing:      r('./components/organisms/story-ring.html'),
  thumbnailGrid:  r('./components/organisms/thumbnail-grid.html'),
  topbar:         r('./components/organisms/topbar.html'),
};

// ── Frame URLs ─────────────────────────────────────────────────────────────
export const frames = {
  netflixHome:      r('./frames/frame-netflix-home.html'),
  netflixDetail:    r('./frames/frame-netflix-detail.html'),
  amazonHome:       r('./frames/frame-amazon-home.html'),
  amazonProduct:    r('./frames/frame-amazon-product.html'),
  amazonCart:       r('./frames/frame-amazon-cart.html'),
  facebookFeed:     r('./frames/frame-facebook-feed.html'),
  facebookProfile:  r('./frames/frame-facebook-profile.html'),
  dashboard:        r('./frames/frame-dashboard.html'),
  landing:          r('./frames/frame-landing.html'),
  login:            r('./frames/frame-login.html'),
  signup:           r('./frames/frame-signup.html'),
  settings:         r('./frames/frame-settings.html'),
  notFound:         r('./frames/frame-404.html'),
  blogHome:         r('./frames/frame-blog-home.html'),
  blogPost:         r('./frames/frame-blog-post.html'),
  pricing:          r('./frames/frame-pricing.html'),
  portfolio:        r('./frames/frame-portfolio.html'),
  admin:            r('./frames/frame-admin.html'),
  chat:             r('./frames/frame-chat.html'),
  searchResults:    r('./frames/frame-search-results.html'),
};

// ── Component Metadata ─────────────────────────────────────────────────────
export const componentsMeta = {
  // Atoms
  avatar:       { props: 'src:string?; alt:string?; initials:string?; size:enum(xs|sm|md|lg|xl)?', slots: 'default', layer: 'atoms' },
  badge:        { props: 'label:string; variant:enum(default|primary|success|warning|danger)?; dot:boolean?; size:enum(sm|md)?', slots: '', layer: 'atoms' },
  button:       { props: 'label:string?; variant:enum(primary|secondary|ghost|danger)?; size:enum(sm|md|lg)?; disabled:boolean?; type:enum(button|submit|reset)?', slots: 'default, icon-left, icon-right', layer: 'atoms' },
  chip:         { props: 'label:string; removable:boolean?; selected:boolean?; variant:enum(default|primary)?', slots: 'icon', layer: 'atoms' },
  divider:      { props: 'orientation:enum(horizontal|vertical)?; label:string?', slots: 'default', layer: 'atoms' },
  icon:         { props: 'name:string?; size:enum(xs|sm|md|lg|xl)?; label:string?', slots: 'default', layer: 'atoms' },
  image:        { props: 'src:string; alt:string; ratio:enum(square|16x9|4x3|3x2|auto)?; loading:enum(lazy|eager)?; fit:enum(cover|contain|fill)?; rounded:boolean?', slots: 'fallback', layer: 'atoms' },
  input:        { props: 'type:enum(text|email|password|number|search|tel|url)?; name:string; id:string?; placeholder:string?; value:string?; disabled:boolean?; required:boolean?; error:string?; size:enum(sm|md|lg)?', slots: 'prefix, suffix', layer: 'atoms' },
  label:        { props: 'for:string?; required:boolean?; text:string?', slots: 'default', layer: 'atoms' },
  loader:       { props: 'size:enum(sm|md|lg)?; label:string?; overlay:boolean?', slots: '', layer: 'atoms' },
  progressBar:  { props: 'value:number; max:number?; label:string?; variant:enum(default|primary|success|warning|danger)?; size:enum(sm|md|lg)?; animated:boolean?', slots: '', layer: 'atoms' },
  rating:       { props: 'value:number; max:number?; readonly:boolean?; size:enum(sm|md|lg)?; label:string?', slots: '', layer: 'atoms' },
  skeleton:     { props: 'width:string?; height:string?; variant:enum(text|circle|rect)?; lines:number?; animated:boolean?', slots: '', layer: 'atoms' },
  spinner:      { props: 'size:enum(sm|md|lg)?; label:string?; variant:enum(default|primary|white)?', slots: '', layer: 'atoms' },
  tag:          { props: 'label:string; variant:enum(default|primary|success|warning|danger|info)?; size:enum(sm|md)?; outline:boolean?', slots: 'icon', layer: 'atoms' },
  textarea:     { props: 'name:string; id:string?; placeholder:string?; rows:number?; disabled:boolean?; required:boolean?; error:string?; resize:enum(none|vertical|horizontal|both)?', slots: '', layer: 'atoms' },
  toggle:       { props: 'name:string; id:string?; checked:boolean?; disabled:boolean?; size:enum(sm|md|lg)?', slots: 'label', layer: 'atoms' },

  // Molecules (Sprint 2 — metadata placeholders)
  breadcrumb:   { props: 'items:[label:string, href:string?][]', slots: 'default', layer: 'molecules' },
  card:         { props: 'title:string?; subtitle:string?; href:string?', slots: 'default, media, actions', layer: 'molecules' },
  cardMedia:    { props: 'src:string; alt:string; ratio:enum(square|16x9|4x3)?', slots: 'overlay', layer: 'molecules' },
  dropdown:     { props: 'label:string; open:boolean?; align:enum(left|right)?', slots: 'trigger, items', layer: 'molecules' },
  formField:    { props: 'label:string; name:string; required:boolean?; error:string?; hint:string?', slots: 'default', layer: 'molecules' },
  listItem:     { props: 'primary:string; secondary:string?; href:string?; active:boolean?', slots: 'leading, trailing', layer: 'molecules' },
  menuItem:     { props: 'label:string; href:string?; icon:string?; active:boolean?; disabled:boolean?', slots: 'icon', layer: 'molecules' },
  modal:        { props: 'title:string?; open:boolean?; size:enum(sm|md|lg|fullscreen)?; closeable:boolean?', slots: 'default, header, footer', layer: 'molecules' },
  notification: { props: 'message:string; variant:enum(info|success|warning|danger)?; dismissible:boolean?; icon:boolean?', slots: 'default, action', layer: 'molecules' },
  pagination:   { props: 'page:number; total:number; perPage:number?; siblings:number?', slots: '', layer: 'molecules' },
  priceTag:     { props: 'price:number; currency:string?; original:number?; discount:boolean?; size:enum(sm|md|lg)?', slots: '', layer: 'molecules' },
  productTile:  { props: 'title:string; price:number; src:string?; alt:string?; rating:number?; badge:string?; href:string?', slots: 'actions', layer: 'molecules' },
  searchBar:    { props: 'placeholder:string?; value:string?; loading:boolean?', slots: 'prefix, suffix', layer: 'molecules' },
  tabBar:       { props: 'active:string?; variant:enum(line|pill)?', slots: 'default', layer: 'molecules' },
  tooltip:      { props: 'content:string; position:enum(top|bottom|left|right)?; delay:number?', slots: 'default', layer: 'molecules' },
  userInfo:     { props: 'name:string; role:string?; src:string?; size:enum(sm|md|lg)?', slots: 'actions', layer: 'molecules' },

  // Organisms (Sprint 3 — metadata placeholders)
  cartSummary:    { props: 'count:number?; total:number?; currency:string?', slots: 'items, actions', layer: 'organisms' },
  commentThread:  { props: 'count:number?', slots: 'default', layer: 'organisms' },
  contentRow:     { props: 'title:string?; href:string?', slots: 'default, header', layer: 'organisms' },
  feedPost:       { props: 'author:string; time:string?; liked:boolean?', slots: 'media, body, actions', layer: 'organisms' },
  footer:         { props: '', slots: 'brand, links, legal', layer: 'organisms' },
  heroBanner:     { props: 'title:string?; subtitle:string?', slots: 'media, headline, cta', layer: 'organisms' },
  navbar:         { props: 'sticky:boolean?; transparent:boolean?', slots: 'logo, links, actions', layer: 'organisms' },
  productDetail:  { props: 'title:string?; price:number?', slots: 'media, info, actions, reviews', layer: 'organisms' },
  profileCard:    { props: 'name:string; bio:string?', slots: 'avatar, stats, actions', layer: 'organisms' },
  sidebar:        { props: 'open:boolean?; position:enum(left|right)?', slots: 'header, default, footer', layer: 'organisms' },
  storyRing:      { props: '', slots: 'default', layer: 'organisms' },
  thumbnailGrid:  { props: 'columns:number?; gap:enum(sm|md|lg)?', slots: 'default', layer: 'organisms' },
  topbar:         { props: 'elevated:boolean?', slots: 'leading, title, actions', layer: 'organisms' },
};

// ── Frame Metadata ─────────────────────────────────────────────────────────
export const framesMeta = {
  netflixHome:      { slots: 'hero, row-1, row-2, row-3',                         description: 'Streaming home layout skeleton' },
  netflixDetail:    { slots: 'hero, info, row-related',                            description: 'Movie/show detail page skeleton' },
  amazonHome:       { slots: 'navbar, hero, categories, featured, footer',         description: 'E-commerce home skeleton' },
  amazonProduct:    { slots: 'breadcrumb, media, info, actions, reviews',          description: 'Product detail page skeleton' },
  amazonCart:       { slots: 'items, summary, recommendations',                    description: 'Shopping cart skeleton' },
  facebookFeed:     { slots: 'topbar, stories, feed, sidebar',                     description: 'Social feed layout skeleton' },
  facebookProfile:  { slots: 'cover, profile, nav, content, sidebar',             description: 'User profile skeleton' },
  dashboard:        { slots: 'sidebar, topbar, main, widgets',                     description: 'Admin dashboard skeleton' },
  landing:          { slots: 'navbar, hero, features, cta, footer',               description: 'Marketing landing page skeleton' },
  login:            { slots: 'brand, form, footer',                               description: 'Login page skeleton' },
  signup:           { slots: 'brand, form, footer',                               description: 'Sign-up page skeleton' },
  settings:         { slots: 'sidebar, header, sections',                          description: 'Settings page skeleton' },
  notFound:         { slots: 'navbar, body, cta',                                  description: '404 error page skeleton' },
  blogHome:         { slots: 'navbar, hero, posts, sidebar, footer',               description: 'Blog listing skeleton' },
  blogPost:         { slots: 'navbar, header, body, sidebar, comments, footer',    description: 'Blog article skeleton' },
  pricing:          { slots: 'navbar, hero, plans, faq, cta, footer',             description: 'Pricing page skeleton' },
  portfolio:        { slots: 'navbar, hero, work, about, contact, footer',        description: 'Portfolio page skeleton' },
  admin:            { slots: 'sidebar, topbar, breadcrumb, content, footer',       description: 'Admin panel skeleton' },
  chat:             { slots: 'sidebar, thread, composer',                          description: 'Chat/messaging UI skeleton' },
  searchResults:    { slots: 'navbar, filters, results, pagination, footer',       description: 'Search results page skeleton' },
};
