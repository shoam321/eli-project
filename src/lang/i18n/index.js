export default {
  locale: 'en',
  translations: {},
  setLocale(locale) {
    this.locale = locale;
  },
  setTranslations(translations) {
    this.translations = translations;
  },
  t(key, payload = {}) {
    return this.replaceValue(this.getObjectValueByPath(this.translations[this.locale], key), payload) || key;
  },
  getObjectValueByPath(object, path) {
    path = path.split('.');

    let index = 0;
    const { length } = path;

    while (object != null && index < length) {
      object = object[path[index]];
      index += 1;
    }

    return (index && index === length) ? object : undefined;
  },
  replaceValue(value, data) {
    Object.keys(data).forEach((key) => {
      if (value !== null && value !== undefined) {
        value = value.replace(new RegExp(`%{${key}}`, 'g'), data[key]);
      }
    });

    return value;
  },
};
