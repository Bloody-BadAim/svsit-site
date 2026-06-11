import type { Locale } from "./config";

/**
 * Centrale message-barrel. Elke namespace is een los JSON-bestand per taal
 * onder src/messages/{nl,en}/<namespace>.json. Gegenereerd uit de map-inhoud.
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
import nlCardEditor from "@/messages/nl/cardEditor.json";
import enCardEditor from "@/messages/en/cardEditor.json";
import nlCommon from "@/messages/nl/common.json";
import enCommon from "@/messages/en/common.json";
import nlCommunityLog from "@/messages/nl/communityLog.json";
import enCommunityLog from "@/messages/en/communityLog.json";
import nlDashBadgesTab from "@/messages/nl/dashBadgesTab.json";
import enDashBadgesTab from "@/messages/en/dashBadgesTab.json";
import nlDashMyCardTab from "@/messages/nl/dashMyCardTab.json";
import enDashMyCardTab from "@/messages/en/dashMyCardTab.json";
import nlDashOverviewTab from "@/messages/nl/dashOverviewTab.json";
import enDashOverviewTab from "@/messages/en/dashOverviewTab.json";
import nlDashQuestsTab from "@/messages/nl/dashQuestsTab.json";
import enDashQuestsTab from "@/messages/en/dashQuestsTab.json";
import nlDashboardClient from "@/messages/nl/dashboardClient.json";
import enDashboardClient from "@/messages/en/dashboardClient.json";
import nlDashboardError from "@/messages/nl/dashboardError.json";
import enDashboardError from "@/messages/en/dashboardError.json";
import nlDashboardNav from "@/messages/nl/dashboardNav.json";
import enDashboardNav from "@/messages/en/dashboardNav.json";
import nlDocumentenContent from "@/messages/nl/documentenContent.json";
import enDocumentenContent from "@/messages/en/documentenContent.json";
import nlEventCalendar from "@/messages/nl/eventCalendar.json";
import enEventCalendar from "@/messages/en/eventCalendar.json";
import nlEventCheckIn from "@/messages/nl/eventCheckIn.json";
import enEventCheckIn from "@/messages/en/eventCheckIn.json";
import nlEventFeaturedCard from "@/messages/nl/eventFeaturedCard.json";
import enEventFeaturedCard from "@/messages/en/eventFeaturedCard.json";
import nlEventHelpers from "@/messages/nl/eventHelpers.json";
import enEventHelpers from "@/messages/en/eventHelpers.json";
import nlEventRecap from "@/messages/nl/eventRecap.json";
import enEventRecap from "@/messages/en/eventRecap.json";
import nlEventTicketForm from "@/messages/nl/eventTicketForm.json";
import enEventTicketForm from "@/messages/en/eventTicketForm.json";
import nlFaqContent from "@/messages/nl/faqContent.json";
import enFaqContent from "@/messages/en/faqContent.json";
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
import nlIntroweekClient from "@/messages/nl/introweekClient.json";
import enIntroweekClient from "@/messages/en/introweekClient.json";
import nlJoinCta from "@/messages/nl/joinCta.json";
import enJoinCta from "@/messages/en/joinCta.json";
import nlLeaderboardContent from "@/messages/nl/leaderboardContent.json";
import enLeaderboardContent from "@/messages/en/leaderboardContent.json";
import nlMemberCard from "@/messages/nl/memberCard.json";
import enMemberCard from "@/messages/en/memberCard.json";
import nlMoederbord from "@/messages/nl/moederbord.json";
import enMoederbord from "@/messages/en/moederbord.json";
import nlNavbar from "@/messages/nl/navbar.json";
import enNavbar from "@/messages/en/navbar.json";
import nlPageCardEditor from "@/messages/nl/pageCardEditor.json";
import enPageCardEditor from "@/messages/en/pageCardEditor.json";
import nlPageDashboard from "@/messages/nl/pageDashboard.json";
import enPageDashboard from "@/messages/en/pageDashboard.json";
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
import nlPageMember from "@/messages/nl/pageMember.json";
import enPageMember from "@/messages/en/pageMember.json";
import nlPageOverOns from "@/messages/nl/pageOverOns.json";
import enPageOverOns from "@/messages/en/pageOverOns.json";
import nlPagePartners from "@/messages/nl/pagePartners.json";
import enPagePartners from "@/messages/en/pagePartners.json";
import nlPagePrivacy from "@/messages/nl/pagePrivacy.json";
import enPagePrivacy from "@/messages/en/pagePrivacy.json";
import nlPageProfiel from "@/messages/nl/pageProfiel.json";
import enPageProfiel from "@/messages/en/pageProfiel.json";
import nlPageProjecten from "@/messages/nl/pageProjecten.json";
import enPageProjecten from "@/messages/en/pageProjecten.json";
import nlPageResetPassword from "@/messages/nl/pageResetPassword.json";
import enPageResetPassword from "@/messages/en/pageResetPassword.json";
import nlPageShop from "@/messages/nl/pageShop.json";
import enPageShop from "@/messages/en/pageShop.json";
import nlPageTickets from "@/messages/nl/pageTickets.json";
import enPageTickets from "@/messages/en/pageTickets.json";
import nlPageVacatures from "@/messages/nl/pageVacatures.json";
import enPageVacatures from "@/messages/en/pageVacatures.json";
import nlPartnersNetwork from "@/messages/nl/partnersNetwork.json";
import enPartnersNetwork from "@/messages/en/partnersNetwork.json";
import nlPrivacyContent from "@/messages/nl/privacyContent.json";
import enPrivacyContent from "@/messages/en/privacyContent.json";
import nlShopBuyButton from "@/messages/nl/shopBuyButton.json";
import enShopBuyButton from "@/messages/en/shopBuyButton.json";
import nlShopGrid from "@/messages/nl/shopGrid.json";
import enShopGrid from "@/messages/en/shopGrid.json";
import nlShopItemCard from "@/messages/nl/shopItemCard.json";
import enShopItemCard from "@/messages/en/shopItemCard.json";
import nlSponsorShowcase from "@/messages/nl/sponsorShowcase.json";
import enSponsorShowcase from "@/messages/en/sponsorShowcase.json";
import nlTestimonials from "@/messages/nl/testimonials.json";
import enTestimonials from "@/messages/en/testimonials.json";
import nlTicketCard from "@/messages/nl/ticketCard.json";
import enTicketCard from "@/messages/en/ticketCard.json";
import nlWhyJoin from "@/messages/nl/whyJoin.json";
import enWhyJoin from "@/messages/en/whyJoin.json";

const nl = {
  about: nlAbout,
  authClassSelector: nlAuthClassSelector,
  authForgotPassword: nlAuthForgotPassword,
  authLogin: nlAuthLogin,
  authRegister: nlAuthRegister,
  authResetPassword: nlAuthResetPassword,
  cardEditor: nlCardEditor,
  common: nlCommon,
  communityLog: nlCommunityLog,
  dashBadgesTab: nlDashBadgesTab,
  dashMyCardTab: nlDashMyCardTab,
  dashOverviewTab: nlDashOverviewTab,
  dashQuestsTab: nlDashQuestsTab,
  dashboardClient: nlDashboardClient,
  dashboardError: nlDashboardError,
  dashboardNav: nlDashboardNav,
  documentenContent: nlDocumentenContent,
  eventCalendar: nlEventCalendar,
  eventCheckIn: nlEventCheckIn,
  eventFeaturedCard: nlEventFeaturedCard,
  eventHelpers: nlEventHelpers,
  eventRecap: nlEventRecap,
  eventTicketForm: nlEventTicketForm,
  faqContent: nlFaqContent,
  femItSection: nlFemItSection,
  footer: nlFooter,
  hboIctSection: nlHboIctSection,
  hboIctVormtaal: nlHboIctVormtaal,
  hero: nlHero,
  homeEvents: nlHomeEvents,
  homeMeta: nlHomeMeta,
  introweekClient: nlIntroweekClient,
  joinCta: nlJoinCta,
  leaderboardContent: nlLeaderboardContent,
  memberCard: nlMemberCard,
  moederbord: nlMoederbord,
  navbar: nlNavbar,
  pageCardEditor: nlPageCardEditor,
  pageDashboard: nlPageDashboard,
  pageDocumenten: nlPageDocumenten,
  pageEventDetail: nlPageEventDetail,
  pageEvents: nlPageEvents,
  pageFaq: nlPageFaq,
  pageForgotPassword: nlPageForgotPassword,
  pageIntroweek: nlPageIntroweek,
  pageLeaderboard: nlPageLeaderboard,
  pageLidWorden: nlPageLidWorden,
  pageLogin: nlPageLogin,
  pageMember: nlPageMember,
  pageOverOns: nlPageOverOns,
  pagePartners: nlPagePartners,
  pagePrivacy: nlPagePrivacy,
  pageProfiel: nlPageProfiel,
  pageProjecten: nlPageProjecten,
  pageResetPassword: nlPageResetPassword,
  pageShop: nlPageShop,
  pageTickets: nlPageTickets,
  pageVacatures: nlPageVacatures,
  partnersNetwork: nlPartnersNetwork,
  privacyContent: nlPrivacyContent,
  shopBuyButton: nlShopBuyButton,
  shopGrid: nlShopGrid,
  shopItemCard: nlShopItemCard,
  sponsorShowcase: nlSponsorShowcase,
  testimonials: nlTestimonials,
  ticketCard: nlTicketCard,
  whyJoin: nlWhyJoin,
} as const;

const en = {
  about: enAbout,
  authClassSelector: enAuthClassSelector,
  authForgotPassword: enAuthForgotPassword,
  authLogin: enAuthLogin,
  authRegister: enAuthRegister,
  authResetPassword: enAuthResetPassword,
  cardEditor: enCardEditor,
  common: enCommon,
  communityLog: enCommunityLog,
  dashBadgesTab: enDashBadgesTab,
  dashMyCardTab: enDashMyCardTab,
  dashOverviewTab: enDashOverviewTab,
  dashQuestsTab: enDashQuestsTab,
  dashboardClient: enDashboardClient,
  dashboardError: enDashboardError,
  dashboardNav: enDashboardNav,
  documentenContent: enDocumentenContent,
  eventCalendar: enEventCalendar,
  eventCheckIn: enEventCheckIn,
  eventFeaturedCard: enEventFeaturedCard,
  eventHelpers: enEventHelpers,
  eventRecap: enEventRecap,
  eventTicketForm: enEventTicketForm,
  faqContent: enFaqContent,
  femItSection: enFemItSection,
  footer: enFooter,
  hboIctSection: enHboIctSection,
  hboIctVormtaal: enHboIctVormtaal,
  hero: enHero,
  homeEvents: enHomeEvents,
  homeMeta: enHomeMeta,
  introweekClient: enIntroweekClient,
  joinCta: enJoinCta,
  leaderboardContent: enLeaderboardContent,
  memberCard: enMemberCard,
  moederbord: enMoederbord,
  navbar: enNavbar,
  pageCardEditor: enPageCardEditor,
  pageDashboard: enPageDashboard,
  pageDocumenten: enPageDocumenten,
  pageEventDetail: enPageEventDetail,
  pageEvents: enPageEvents,
  pageFaq: enPageFaq,
  pageForgotPassword: enPageForgotPassword,
  pageIntroweek: enPageIntroweek,
  pageLeaderboard: enPageLeaderboard,
  pageLidWorden: enPageLidWorden,
  pageLogin: enPageLogin,
  pageMember: enPageMember,
  pageOverOns: enPageOverOns,
  pagePartners: enPagePartners,
  pagePrivacy: enPagePrivacy,
  pageProfiel: enPageProfiel,
  pageProjecten: enPageProjecten,
  pageResetPassword: enPageResetPassword,
  pageShop: enPageShop,
  pageTickets: enPageTickets,
  pageVacatures: enPageVacatures,
  partnersNetwork: enPartnersNetwork,
  privacyContent: enPrivacyContent,
  shopBuyButton: enShopBuyButton,
  shopGrid: enShopGrid,
  shopItemCard: enShopItemCard,
  sponsorShowcase: enSponsorShowcase,
  testimonials: enTestimonials,
  ticketCard: enTicketCard,
  whyJoin: enWhyJoin,
} as const;

const all = { nl, en } as const;

export type Messages = typeof nl;

export function getAppMessages(locale: Locale): Messages {
  return all[locale] as Messages;
}
