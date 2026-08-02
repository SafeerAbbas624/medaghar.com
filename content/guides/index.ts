import type { Guide, GuideCategory } from './types'

import marlaKanalExplained from './marla-kanal-explained'
import howToVerifyPropertyDocuments from './how-to-verify-property-documents'
import propertyTransferProcedurePakistan from './property-transfer-procedure-pakistan'
import propertyTaxesPakistan from './property-taxes-pakistan'
import realEstateScamsPakistan from './real-estate-scams-pakistan'
import overseasPakistaniPropertyGuide from './overseas-pakistani-property-guide'
import bestAreasToInvestLahore from './best-areas-to-invest-lahore'
import bestAreasToInvestKarachi from './best-areas-to-invest-karachi'
import bestSectorsToInvestIslamabad from './best-sectors-to-invest-islamabad'
import bahriaTownVsDha from './bahria-town-vs-dha'
import plotFileVsPossession from './plot-file-vs-possession'
import homeLoanPakistanGuide from './home-loan-pakistan-guide'
import constructionCostPerMarla from './construction-cost-per-marla'
import tenantRightsRentAgreementPakistan from './tenant-rights-rent-agreement-pakistan'
import howToSellPropertyFastPakistan from './how-to-sell-property-fast-pakistan'
import firstTimeHomeBuyerGuidePakistan from './first-time-home-buyer-guide-pakistan'

export const GUIDES: Guide[] = [
  firstTimeHomeBuyerGuidePakistan,
  howToVerifyPropertyDocuments,
  marlaKanalExplained,
  propertyTransferProcedurePakistan,
  propertyTaxesPakistan,
  homeLoanPakistanGuide,
  constructionCostPerMarla,
  bestAreasToInvestLahore,
  bestAreasToInvestKarachi,
  bestSectorsToInvestIslamabad,
  bahriaTownVsDha,
  plotFileVsPossession,
  realEstateScamsPakistan,
  overseasPakistaniPropertyGuide,
  tenantRightsRentAgreementPakistan,
  howToSellPropertyFastPakistan,
]

export const GUIDE_CATEGORIES: GuideCategory[] = [
  'Buying',
  'Selling',
  'Renting',
  'Investment',
  'Legal & Taxes',
  'Construction',
  'Home Financing',
]

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug)
}

export function getRelatedGuides(guide: Guide): Guide[] {
  return guide.related
    .map((slug) => getGuide(slug))
    .filter((g): g is Guide => Boolean(g))
}
