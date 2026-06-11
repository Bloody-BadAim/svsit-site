import type { Locale } from "./config";

/**
 * Centrale message-barrel. Elke namespace is een los JSON-bestand per taal
 * onder src/messages/{nl,en}/<namespace>.json. Zo kan er parallel aan losse
 * paginas vertaald worden zonder dat 2 mensen hetzelfde bestand raken.
 *
 * Dit bestand wordt gegenereerd uit de inhoud van src/messages/. Nieuwe
 * namespace toevoegen: maak nl/<ns>.json + en/<ns>.json en voeg hem hier toe.
 */

import nlAbout from "@/messages/nl/about.json";
import enAbout from "@/messages/en/about.json";
import nlAuthClassSelector from "@/messages/nl/authClassSelector.json";
import enAuthClassSelector from "@/messages/en/authClassSelector.json";
import nlAuthForgotPassword from "@/messages/nl/authForgotPassword.json";
import enAuthForgotPassword from "@/messages/en/authForgotPassword.json";
import nlAuthLogin from "@/messages/nl/authLogin.json";
import enAuthLogin from "@/messages/en/authLogin.json";
import nlAuthRegister from "@/messages/nl/authRegister.json";
import enAuthRegister from "@/messages/en/authRegister.json";
import nlAuthResetPassword from "@/messages/nl/authResetPassword.json";
import enAuthResetPassword from "@/messages/en/authResetPassword.json";
import nlCommon from "@/messages/nl/common.json";
import enCommon from "@/messages/en/common.json";
import nlCommunityLog from "@/messages/nl/communityLog.json";
import enCommunityLog from "@/messages/en/communityLog.json";
import nlEventCalendar from "@/messages/nl/eventCalendar.json";
import enEventCalendar from "@/messages/en/eventCalendar.json";
import nlEventFeaturedCard from "@/messages/nl/eventFeaturedCard.json";
import enEventFeaturedCard from "@/messages/en/eventFeaturedCard.json";
import nlEventRecap from "@/messages/nl/eventRecap.json";
import enEventRecap from "@/messages/en/eventRecap.json";
import nlFemItSection from "@/messages/nl/femItSection.json";
import enFemItSection from "@/messages/en/femItSection.json";
import nlFooter from "@/messages/nl/footer.json";
import enFooter from "@/messages/en/footer.json";
import nlHboIctSection from "@/messages/nl/hboIctSection.json";
import enHboIctSection from "@/messages/en/hboIctSection.json";
import nlHboIctVormtaal from "@/messages/nl/hboIctVormtaal.json";
import enHboIctVormtaal from "@/messages/en/hboIctVormtaal.json";
import nlHero from "@/messages/nl/hero.json";
import enHero from "@/messages/en/hero.json";
import nlHomeEvents from "@/messages/nl/homeEvents.json";
import enHomeEvents from "@/messages/en/homeEvents.json";
import nlHomeMeta from "@/messages/nl/homeMeta.json";
import enHomeMeta from "@/messages/en/homeMeta.json";
import nlJoinCta from "@/messages/nl/joinCta.json";
import enJoinCta from "@/messages/en/joinCta.json";
import nlMemberCard from "@/messages/nl/memberCard.json";
import enMemberCard from "@/messages/en/memberCard.json";
import nlMoederbord from "@/messages/nl/moederbord.json";
import enMoederbord from "@/messages/en/moederbord.json";
import nlNavbar from "@/messages/nl/navbar.json";
import enNavbar from "@/messages/en/navbar.json";
import nlPageDocumenten from "@/messages/nl/pageDocumenten.json";
import enPageDocumenten from "@/messages/en/pageDocumenten.json";
import nlPageEventDetail from "@/messages/nl/pageEventDetail.json";
import enPageEventDetail from "@/messages/en/pageEventDetail.json";
import nlPageEvents from "@/messages/nl/pageEvents.json";
import enPageEvents from "@/messages/en/pageEvents.json";
import nlPageFaq from "@/messages/nl/pageFaq.json";
import enPageFaq from "@/messages/en/pageFaq.json";
import nlPageForgotPassword from "@/messages/nl/pageForgotPassword.json";
import enPageForgotPassword from "@/messages/en/pageForgotPassword.json";
import nlPageIntroweek from "@/messages/nl/pageIntroweek.json";
import enPageIntroweek from "@/messages/en/pageIntroweek.json";
import nlPageLeaderboard from "@/messages/nl/pageLeaderboard.json";
import enPageLeaderboard from "@/messages/en/pageLeaderboard.json";
import nlPageLidWorden from "@/messages/nl/pageLidWorden.json";
import enPageLidWorden from "@/messages/en/pageLidWorden.json";
import nlPageLogin from "@/messages/nl/pageLogin.json";
import enPageLogin from "@/messages/en/pageLogin.json";
import nlPageOverOns from "@/messages/nl/pageOverOns.json";
import enPageOverOns from "@/messages/en/pageOverOns.json";
import nlPagePartners from "@/messages/nl/pagePartners.json";
import enPagePartners from "@/messages/en/pagePartners.json";
import nlPagePrivacy from "@/messages/nl/pagePrivacy.json";
import enPagePrivacy from "@/messages/en/pagePrivacy.json";
import nlPageProjecten from "@/messages/nl/pageProjecten.json";
import enPageProjecten from "@/messages/en/pageProjecten.json";
import nlPageResetPassword from "@/messages/nl/pageResetPassword.json";
import enPageResetPassword from "@/messages/en/pageResetPassword.json";
import nlPageVacatures from "@/messages/nl/pageVacatures.json";
import enPageVacatures from "@/messages/en/pageVacatures.json";
import nlPartnersNetwork from "@/messages/nl/partnersNetwork.json";
import enPartnersNetwork from "@/messages/en/partnersNetwork.json";
import nlSponsorShowcase from "@/messages/nl/sponsorShowcase.json";
import enSponsorShowcase from "@/messages/en/sponsorShowcase.json";
import nlTestimonials from "@/messages/nl/testimonials.json";
import enTestimonials from "@/messages/en/testimonials.json";
import nlWhyJoin from "@/messages/nl/whyJoin.json";
import enWhyJoin from "@/messages/en/whyJoin.json";

const nl = {
  about: nlAbout,
  authClassSelector: nlAuthClassSelector,
  authForgotPassword: nlAuthForgotPassword,
  authLogin: nlAuthLogin,
  authRegister: nlAuthRegister,
  authResetPassword: nlAuthResetPassword,
  common: nlCommon,
  communityLog: nlCommunityLog,
  eventCalendar: nlEventCalendar,
  eventFeaturedCard: nlEventFeaturedCard,
  eventRecap: nlEventRecap,
  femItSection: nlFemItSection,
  footer: nlFooter,
  hboIctSection: nlHboIctSection,
  hboIctVormtaal: nlHboIctVormtaal,
  hero: nlHero,
  homeEvents: nlHomeEvents,
  homeMeta: nlHomeMeta,
  joinCta: nlJoinCta,
  memberCard: nlMemberCard,
  moederbord: nlMoederbord,
  navbar: nlNavbar,
  pageDocumenten: nlPageDocumenten,
  pageEventDetail: nlPageEventDetail,
  pageEvents: nlPageEvents,
  pageFaq: nlPageFaq,
  pageForgotPassword: nlPageForgotPassword,
  pageIntroweek: nlPageIntroweek,
  pageLeaderboard: nlPageLeaderboard,
  pageLidWorden: nlPageLidWorden,
  pageLogin: nlPageLogin,
  pageOverOns: nlPageOverOns,
  pagePartners: nlPagePartners,
  pagePrivacy: nlPagePrivacy,
  pageProjecten: nlPageProjecten,
  pageResetPassword: nlPageResetPassword,
  pageVacatures: nlPageVacatures,
  partnersNetwork: nlPartnersNetwork,
  sponsorShowcase: nlSponsorShowcase,
  testimonials: nlTestimonials,
  whyJoin: nlWhyJoin,
} as const;

const en = {
  about: enAbout,
  authClassSelector: enAuthClassSelector,
  authForgotPassword: enAuthForgotPassword,
  authLogin: enAuthLogin,
  authRegister: enAuthRegister,
  authResetPassword: enAuthResetPassword,
  common: enCommon,
  communityLog: enCommunityLog,
  eventCalendar: enEventCalendar,
  eventFeaturedCard: enEventFeaturedCard,
  eventRecap: enEventRecap,
  femItSection: enFemItSection,
  footer: enFooter,
  hboIctSection: enHboIctSection,
  hboIctVormtaal: enHboIctVormtaal,
  hero: enHero,
  homeEvents: enHomeEvents,
  homeMeta: enHomeMeta,
  joinCta: enJoinCta,
  memberCard: enMemberCard,
  moederbord: enMoederbord,
  navbar: enNavbar,
  pageDocumenten: enPageDocumenten,
  pageEventDetail: enPageEventDetail,
  pageEvents: enPageEvents,
  pageFaq: enPageFaq,
  pageForgotPassword: enPageForgotPassword,
  pageIntroweek: enPageIntroweek,
  pageLeaderboard: enPageLeaderboard,
  pageLidWorden: enPageLidWorden,
  pageLogin: enPageLogin,
  pageOverOns: enPageOverOns,
  pagePartners: enPagePartners,
  pagePrivacy: enPagePrivacy,
  pageProjecten: enPageProjecten,
  pageResetPassword: enPageResetPassword,
  pageVacatures: enPageVacatures,
  partnersNetwork: enPartnersNetwork,
  sponsorShowcase: enSponsorShowcase,
  testimonials: enTestimonials,
  whyJoin: enWhyJoin,
} as const;

const all = { nl, en } as const;

export type Messages = typeof nl;

export function getAppMessages(locale: Locale): Messages {
  return all[locale] as Messages;
}
