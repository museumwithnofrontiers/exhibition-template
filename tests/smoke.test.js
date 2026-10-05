import { describeExhibitionSmoke } from '@museumwnf/viewer-layout/dxa/testing'
import { catalogues as sharedTexts } from '@museumwnf/viewer-i18n/exhibition'
import manifest from '@museumwnf/__DATASET__-data'
import partnerNames from '@museumwnf/__DATASET__-data/translations/partners.en.json'
import dynastyNames from '@museumwnf/__DATASET__-data/translations/dynasties.en.json'
import ownTexts from '../locales/en.json'
import config, { noticeProjects, projectColors } from '../src/dataset.config.js'

// The exhibition family's smoke test, run against this exhibition's own
// package (@museumwnf/viewer-layout/dxa/testing). It finds the records it
// needs in the package itself. Its documentation names the options a site
// may add — exact collection counts, a curated theme's titles — and tests of
// this exhibition's own go after the call.
describeExhibitionSmoke({
  config,
  noticeProjects,
  projectColors,
  sharedTexts,
  ownTexts,
  manifest,
  partnerNames,
  dynastyNames,
  namespace: '__SITE_NAMESPACE__',
})
