import { supportedLocales } from "./config";
import { References } from "../constants/References";

const Localization = {
  locale: "en-US"
};

const locale = {
  currentDateLocale: "en-US",
  init() {
    this.currentDateLocale = Localization.locale;
  },

  t(trl, params = {}): string {
    let localizedString: string = "";
    // @ts-ignore
    if (
      supportedLocales[Localization.locale] &&
      supportedLocales[Localization.locale].loadTranslations[trl]
    ) {
      // @ts-ignore
      localizedString =
        supportedLocales[Localization.locale].loadTranslations[trl];
    }

    // Interpolation of values
    Object.keys(params).forEach(key => {
      const value = params[key];
      localizedString = localizedString.replace(`{${key}}`, value);
    });

    return localizedString;
  },

  setCurrentLanguage(input) {
    if (supportedLocales.hasOwnProperty(input.replace("_", "-"))) {
      Localization.locale = input.replace("_", "-");
      this.currentDateLocale = input.replace("_", "-");
    } else {
      console.error(locale.t("NoSuportedLanguage", {input: input}));
    }
  },
  formatDate(date, formatStr) {
    return date;
  },

  parseISODate(date) {
    return date;
  },

  // TODO this should grab format from server
  getServerDateFormat(ref) {
    switch (ref) {
      case References.Time:
      case References.AbsoluteTime:
        return "HH:mm:ss";
      case References.DateTime:
        return "yyyy-MM-dd'T'HH:mm:ssxxx";
      case References.Date:
        return "yyyy-MM-dd";
      default:
        return "yyyy-MM-dd'T'HH:mm:ssxxx";
    }
  },

  getUIDateFormat(ref) {
    switch (ref) {
      case References.Time:
      case References.AbsoluteTime:
        return "HH:mm";
      case References.DateTime:
        return "yyyy-MM-dd HH:mm:ss";
      case References.Date:
        return "yyyy-MM-dd";
      default:
        return "yyyy-MM-dd HH:mm:ss";
    }
  },

  getDeviceLocale() {
    return "en-US";
  },

  getDeviceLocaleForDate() {
    return this.currentDateLocale;
  }
};

export default locale;
