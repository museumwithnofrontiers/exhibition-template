import {
  languageLabels, loadEntities, mwnfLinks, offeredLanguages, sectionMeta, useDataPackage,
} from '@museumwnf/viewer-core'
import { itemFromUidPath, partnerFromKey } from '@museumwnf/viewer-core/legacy'
import { TextPageView } from '@museumwnf/viewer-layout/views'
import { standardRoutes } from '@museumwnf/viewer-layout/dxa'
import SiteShell from './SiteShell.vue'
import { countries, items, visiblePartners, hasTimeline } from './composables/exhibitionData.js'
import { creditsSpec } from './composables/textPageSpecs.js'

// The whole declaration of this website. Before it mounts, the website reads
// nothing from its package but the manifest: the languages it offers, their
// labels and its name come from `manifest.site`, and every record is loaded
// by the route that reads it.

const { manifest } = useDataPackage()

// ── Source-project site config (epic #1727 phase 4) ─────────────────────────
//
// Per-project-UUID editorial choices composables/sheet.js makes about a
// borrowed item's source, on top of RecordSheetView's own spec keys (epic
// #1728): which colour family its chip uses (one of this exhibition family's
// own `mwnf-chip--<family>` classes, `src/styles/site.css`), and which
// projects still get the Explore-partner notice legacy showed on the sheet.
// Both keyed by project UUID, read from this package's own
// `manifest.projects`.
//
// TODO(dataset): the map below is water-in-islam's own (the reference site
// this template was built from) — replace it entirely with your own
// dataset's `manifest.projects` entries. Find them with:
//
//   fetch https://unpkg.com/@museumwnf/__DATASET__-data@latest/manifest.json
//
// Family names (this exhibition family's own short vocabulary, distinct from
// the gallery family's `mwnf-chip--<Name>` one): `islamic-art`,
// `baroque-art`, `sharing-history`, `carpet-art`, `glass-art`, `galleries`,
// or the catch-all `exhibition` for this exhibition's own native project or
// any project borrowed from another exhibition.
export const projectColors = {
  '61c122ac-ea86-5462-8bab-6b86138c49b2': 'islamic-art', // EXAMPLE — Discover Islamic Art (replace with your own manifest.projects)
}

// TODO(dataset): legacy's Explore-partner notice, shown only on a sheet
// borrowed from Explore Islamic Art Collections. Set this to
// `['928f5e0d-53e3-5f53-b9c2-5af389c30dd4']` if any of this exhibition's own
// items borrow from that project (check with `items.some(i => i.project_id
// === '928f5e0d-53e3-5f53-b9c2-5af389c30dd4')` against your published
// `items.json`), otherwise leave it empty.
export const noticeProjects = []

// The languages this exhibition publishes (`exhibition_i18n.enabled`, declared
// by the package as `site.languages`), kept where the item translations
// actually carry them. An item sheet may offer more — whatever languages the
// record itself carries — from its own switcher, without touching the site
// language.
const languages = offeredLanguages()

// Every page renders the chrome — the header logos, the banner and its
// caption, the bottom banner and the sponsor strip — off these four; a page
// adds what it reads on top. A route also says which section it belongs
// to, and the shell reads that for the banner title and the active menu
// entry (viewer-core's `useSection`).
const CHROME = ['exhibition', 'items', 'partners', 'countries']
const meta = sectionMeta(CHROME)

export default {
  // The dataset package this website renders. Must match the alias in
  // vite.config.js and the dependency in package.json.
  datasetPackage: '@museumwnf/__DATASET__-data',

  // English is the base language of every catalogue in the platform, so the
  // name the site is known by is the English one, whatever this build enables.
  siteName: manifest.site?.names?.en ?? '__SITE_NAME__',

  // All pages are website-specific views (below) — no generic entity pages.
  features: {
    entities: [],
  },

  languages,

  // The absolute address this build is deployed at, base path included
  // (viewer-core's README, "the declaration outside a component" —
  // `sourceUrl()` reads it). GitHub Pages serves this repo at
  // `https://museumwithnofrontiers.github.io/<repo>`, the same `<repo>` segment
  // `vite.config.js`'s `BASE_PATH` puts in the build's own base path — so
  // this changes together with that one, and with the domain, whenever the
  // site moves off GitHub Pages.
  site: { origin: 'https://museumwithnofrontiers.github.io/__DATASET__' },

  shell: SiteShell,

  // What viewer-layout's `SiteShell` (src/SiteShell.vue) reads to build the
  // menu, the header/footer link lists, the search submit and the banner
  // title of every page but Home. `to`, not a bare `href`, so a route rename
  // stays one edit. TIMELINE is dropped when the exhibition reports neither
  // chronology (`hasTimeline`) — both flags gate the nav entry, not the data.
  navigation: {
    languages: languageLabels(languages),
    links: [
      { section: 'about', label: 'exhibition.nav.about', to: { name: 'about' } },
      { section: 'themes', label: 'exhibition.nav.themes', to: { name: 'themes' } },
      { section: 'collection', label: 'exhibition.nav.collection', to: { name: 'collection' } },
      { section: 'partners', label: 'exhibition.nav.partners', to: { name: 'partners' } },
      { section: 'timeline', label: 'exhibition.nav.timeline', to: { name: 'timeline' }, when: () => hasTimeline.value },
      { section: 'related', label: 'exhibition.related.title', to: { name: 'related' } },
      { section: 'credits', label: 'exhibition.nav.credits', to: { name: 'credits' } },
      { label: 'exhibition.nav.myCollection', href: mwnfLinks.myCollection, external: true },
    ],
    headerLinks: [
      { label: 'core.nav.home', to: { name: 'home' } },
      { label: 'exhibition.footer.aboutMwnf', href: mwnfLinks.about, external: true },
    ],
    footerLinks: [
      { label: 'exhibition.footer.aboutMwnf', href: mwnfLinks.about, external: true },
      { label: 'exhibition.footer.contact', href: mwnfLinks.contact, external: true },
      { label: 'exhibition.footer.legalNotice', href: mwnfLinks.legalNotice, external: true },
      { label: 'exhibition.footer.credits', href: mwnfLinks.credits, external: true },
      { label: 'exhibition.footer.cookies', href: mwnfLinks.cookies, external: true },
    ],
    // The banner title over every section page but Home, which supplies its
    // own from the exhibition record (src/SiteShell.vue) — a route with none
    // of these names never renders (`checkSectionMeta` in the smoke test), so
    // there is no "error" fallback to declare any more.
    sectionTitles: {
      themes: 'exhibition.section.themes',
      collection: 'exhibition.section.collection',
      database: 'exhibition.section.database',
      partners: 'exhibition.section.partners',
      related: 'exhibition.related.title',
      timeline: 'exhibition.section.timeline',
      about: 'exhibition.section.about',
      credits: 'exhibition.section.credits',
    },
    // `all-objects` is legacy's sentinel for an empty submission, and the
    // value SearchResults matches on. The two must agree.
    search: {
      route: 'search-results',
      key: 'q',
      placeholder: 'exhibition.search.placeholder',
      submitLabel: 'catalogue.search.submit',
      empty: 'all-objects',
    },
  },

  // The banner variant is the one thing every page (but the sections Home
  // gates on `isHome`, src/SiteShell.vue) reads off the route alone: a split
  // banner with the exhibition's own title/subtitle/headline on Home, a
  // narrow section strip everywhere else.
  banner: {
    variant: ({ section }) => (section === 'home' ? 'split' : 'section'),
  },

  // Legacy renders category 0 — "Header" — beside the MWNF mark, under the
  // `header_logo_section_1` heading, and leaves categories 1–4 to the footer
  // strip. Each heading is written out: a name assembled from the category id
  // would resolve at run time and be invisible to the check that every entry
  // a page asks for exists. Only the categories that carry real copy need an
  // entry — an unlisted category falls back to its own legacy category name.
  // `logos` (below) is `src/SiteShell.vue`'s own reshaping of the
  // exhibition's raw logo records into this shape.
  //
  // TODO(dataset): water-in-islam has one header logo (category 1, "Under
  // the patronage of"); adjust `header`/`headerTitle` if this exhibition's
  // own logos.json uses category 0 differently, or has none.
  logos: {
    header: (logo) => Number(logo.category_id) === 0 && logo.visible !== false,
    headerTitle: 'exhibition.sponsors.coOrganisers',
    sponsorGroups: (logos, t) => {
      const byCategory = new Map()
      for (const logo of logos) {
        if (logo.visible === false) continue
        if (Number(logo.category_id) === 0) continue
        const key = logo.category_id ?? 0
        const bucket = byCategory.get(key)
        if (bucket) bucket.push(logo)
        else byCategory.set(key, [logo])
      }
      return [...byCategory.entries()]
        .sort((a, b) => a[0] - b[0])
        .map(([categoryId, group]) => ({
          title: Number(categoryId) === 1 ? t('exhibition.sponsors.patronage')
            : Number(categoryId) === 2 ? t('exhibition.sponsors.support')
              : (group[0].category ?? ''),
          sponsors: [...group]
            .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
            .map((logo) => ({ name: logo.alt, href: logo.href, logo: logo.image })),
        }))
    },
  },

  // Exhibition chrome images and related-content documents live on the legacy
  // media server and were never imported; the package ships the path, this is
  // the host.
  media: {
    legacyHost: 'https://images.museumwnf.org',
  },

  // Every address this website links out to — the twelve portal addresses
  // every DXA `dataset.config.js` repeats, from viewer-core.
  links: { ...mwnfLinks },

  // The canonical routes, one view per page: a section is `/<section>`, a
  // record `/<section>/:id` with the package id, and the language, the page
  // and every filter travel in the query.
  //
  // `/theme/:id` keeps `display_order - 1`, exactly as legacy did — the About
  // theme is display order 1, so the first listed theme is `/theme/1`.
  //
  // The 'home' name replaces viewer-core's generic home route.
  extraViews: [
    { path: '/', name: 'home', component: () => import('./views/Home.vue'), meta: meta('home') },
    { path: '/about', name: 'about', component: () => import('./views/About.vue'), meta: meta('about', 'themes') },
    { path: '/themes', name: 'themes', component: () => import('./views/Themes.vue'), meta: meta('themes', 'themes') },
    {
      path: '/theme/:id/:subtheme?/:image?',
      name: 'theme',
      component: () => import('./views/Theme.vue'),
      meta: meta('themes', 'themes', 'glossary', 'dynasties'),
    },
    {
      path: '/theme-gallery/:id',
      name: 'theme-gallery',
      component: () => import('./views/ThemeGallery.vue'),
      meta: meta('themes', 'themes'),
    },
    {
      path: '/item/:id',
      name: 'item',
      component: () => import('./views/ItemSheet.vue'),
      // The composed RecordView takes the record id as a prop, not a route read.
      props: (route) => ({ id: route.params.id }),
      meta: meta('database', 'languages', 'dynasties', 'glossary', 'timelines', 'timeline_events'),
    },
    // The 11 standard pages every DXA exhibition shares byte-for-byte (epic
    // #1731): search, the partner list/profile/objects and their institution
    // variants, the timeline results/gallery and the collection entrance/
    // results. `partnerObjects` carries the five entry names that are not in
    // the shared viewer-i18n dictionary (legacy's own
    // PartnerObjects.vue/InstitutionMonuments.vue text) — their generic
    // wording is already in locales/en.json, keyed by `__SITE_NAMESPACE__`.
    ...standardRoutes('exhibition', {
      partnerObjects: {
        emptyPartner: '__SITE_NAMESPACE__.partnerObjects.emptyPartner',
        emptyInstitution: '__SITE_NAMESPACE__.partnerObjects.emptyInstitution',
        institutionSummary: '__SITE_NAMESPACE__.partner.monumentsInExhibition',
        partnerProfileLabel: '__SITE_NAMESPACE__.partnerObjects.partnerProfile',
        institutionProfileLabel: '__SITE_NAMESPACE__.partnerObjects.institutionProfile',
      },
    }),
    { path: '/related', name: 'related', component: () => import('./views/RelatedContent.vue'), meta: meta('related', 'related_content') },
    { path: '/timeline', name: 'timeline', component: () => import('./views/Timeline.vue'), meta: meta('timeline', 'timelines', 'timeline_events') },
    // No local Credits.vue: legacy's Credits page is a heading (the shell's
    // own `sectionTitles`), a body and a back link, exactly `TextPageView`'s
    // shape (`creditsSpec`, composables/textPageSpecs.js).
    { path: '/credits', name: 'credits', component: TextPageView, props: { spec: creditsSpec }, meta: meta('credits') },
  ],

  // The legacy URL shapes, redirect-only, so a legacy address pasted after
  // the `#` still lands on the right page: the item sheet's dbUid path
  // (`/database-item/mwnf3/objects/EPM/uk/Mus21/41/en`) resolves through
  // `backward_compatibility`, the partner's and the institution's country and
  // legacy id through the partner record; the language segment is dropped and
  // the page number moves to the query.
  legacyRoutes: [
    {
      path: '/database-item/:uid(.*)/:language',
      async resolve({ uid }) {
        await loadEntities(['items'])
        const item = itemFromUidPath(items.value, uid)
        return item ? { name: 'item', params: { id: item.id } } : null
      },
    },
    {
      path: '/partner/:country/:id/:language',
      async resolve({ country, id }) {
        await loadEntities(['exhibition', 'partners', 'countries'])
        const partner = partnerFromKey(visiblePartners.value, countries.value, country, id)
        return partner ? { name: 'partner', params: { id: partner.id } } : null
      },
    },
    {
      path: '/partner-objects/:country/:id/:page',
      async resolve({ country, id, page }) {
        await loadEntities(['exhibition', 'partners', 'countries'])
        const partner = partnerFromKey(visiblePartners.value, countries.value, country, id)
        if (!partner) return null
        return { name: 'partner-objects', params: { id: partner.id }, query: Number(page) > 1 ? { page } : {} }
      },
    },
    {
      path: '/institution/:country/:id/:language',
      async resolve({ country, id }) {
        await loadEntities(['exhibition', 'partners', 'countries'])
        const partner = partnerFromKey(visiblePartners.value, countries.value, country, id)
        return partner ? { name: 'institution', params: { id: partner.id } } : null
      },
    },
    {
      path: '/institution-monuments/:country/:id/:page',
      async resolve({ country, id, page }) {
        await loadEntities(['exhibition', 'partners', 'countries'])
        const partner = partnerFromKey(visiblePartners.value, countries.value, country, id)
        if (!partner) return null
        return { name: 'institution-monuments', params: { id: partner.id }, query: Number(page) > 1 ? { page } : {} }
      },
    },
    {
      // `begin`/`end`, not the path's own `start`/`end`: viewer-layout's
      // `TimelineResultsView` renders its date controls under those keys, and
      // the gallery spec reads the same ones for the query to stay one shape.
      path: '/timeline-gallery/:country/:start/:end/:page',
      resolve({ country, start, end, page }) {
        const query = { country }
        if (start !== 'any') query.begin = start
        if (end !== 'any') query.end = end
        if (Number(page) > 1) query.page = page
        return { name: 'timeline-gallery', query }
      },
    },
    { path: '/error', resolve: () => null },
  ],
}
