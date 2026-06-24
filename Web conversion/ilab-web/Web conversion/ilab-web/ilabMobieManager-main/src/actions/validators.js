import I18n from '../lang/i18n';

class Validator {
  constructor(validator, name) {
    this.name = name;
    this.validator = validator;
  }

  validate(value) {
    return this.validator.func(value);
  }

  getErrorMessage() {
    return `${I18n.t(this.name)} ${I18n.t(
      this.validator.error.key,
      this.validator.error.data
    )}`;
  }

  static getFormErrors(formData, formValidator) {
    return Object.keys(formValidator).reduce((errors, key) => {
      if (!formValidator[key].validate(formData[key]))
        return [...errors, formValidator[key].getErrorMessage()];
      return errors;
    }, []);
  }

  static integer = {
    required: {
      func: (value) => Number.isInteger(Number.parseInt(value)),
      error: {
        key: 'translation.fieldRequired',
      },
    },
    length: (length) => ({
      func: (value) => new RegExp(`^\\d{${length}}$`).test(value),
      error: {
        key: 'translation.numberLength',
        data: {
          length,
        },
      },
    }),
  };

  static integerPositive = {
    required: {
      func: (value) =>
        Number.isInteger(Number.parseInt(value)) && Number.parseInt(value) >= 0,
      error: {
        key: 'translation.fieldRequiredLessZero',
      },
    },
  };

  static string = {
    required: {
      func: (value = '') => value.trim().length > 0,
      error: {
        key: 'translation.fieldRequired',
      },
    },
    length: (length) => ({
      func: (value) => value?.length >= length,
      error: {
        key: 'translation.textLength',
        data: {
          length,
        },
      },
    }),
  };

  static image = {
    required: {
      func: (value) => value,
      error: {
        key: 'translation.fieldRequired',
      },
    },
  };

  static regex = {
    email: /^([A-Za-z0-9_\-.])+@([A-Za-z0-9_\-.])+\.([A-Za-z]{2,4})$/,
    phone: /^0\d{9}$/,
    imei: /^[0-9]{15}$/,
  };

  static email = {
    optional: {
      func: (value) =>
        !(value || '').length ||
        Validator.regex.email.test((value || '').toLowerCase()),
      error: {
        key: 'translation.isInvalid',
      },
    },
    required: {
      func: (value) =>
        (value || '').length > 0 &&
        Validator.regex.email.test((value || '').toLowerCase()),
      error: {
        key: 'translation.isInvalid',
      },
    },
  };

  static phone = {
    optional: {
      func: (value) => {
        value = value || '';

        return !value.length || Validator.regex.phone.test(value.toLowerCase());
      },
      error: {
        key: 'translation.phoneValidator',
      },
    },
    required: {
      func: (value) =>
        value.length && Validator.regex.phone.test(value.toLowerCase()),
      error: {
        key: 'translation.phoneValidatorRequired',
      },
    },
  };

  static imei = {
    required: {
      func: (value = '') =>
        !value.length || Validator.regex.imei.test(value.toString()),
      error: {
        key: 'translation.imeiValidator',
      },
    },
  };
}

export default Validator;

export const formsValidation = {
  LOGIN: {
    email: new Validator(Validator.string.required, 'translation.email'),
    pass: new Validator(Validator.string.length(6), 'translation.password'),
  },
  PROJECT: {
    cl_id: new Validator(Validator.integer.required, 'translation.client'),
    device_id: new Validator(
      Validator.integer.required,
      'translation.clientDevice'
    ),
    status: new Validator(Validator.integer.required, 'translation.status'),
    problem: new Validator(Validator.string.required, 'translation.problem'),
    cost: new Validator(Validator.integer.required, 'translation.cost'),
    price: new Validator(Validator.integer.required, 'translation.price'),
    due_date: new Validator(Validator.string.required, 'translation.date'),
    signature_image: new Validator(
      Validator.image.required,
      'translation.clientSignature'
    ),
  },
  CLIENT: {
    name: new Validator(Validator.string.required, 'translation.name'),
    last_name: new Validator(Validator.string.required, 'translation.lastName'),
    email: new Validator(Validator.email.optional, 'translation.email'),
    phone: new Validator(Validator.phone.required, 'translation.phone'),
    secondary_phone: new Validator(
      Validator.phone.optional,
      'translation.secondaryPhone'
    ),
  },
  CLIENT_MIN: {
    name: new Validator(Validator.string.required, 'translation.name'),
    last_name: new Validator(Validator.string.required, 'translation.lastName'),
    email: new Validator(Validator.email.optional, 'translation.email'),
    phone: new Validator(Validator.phone.optional, 'translation.phone'),
    secondary_phone: new Validator(
      Validator.phone.optional,
      'translation.secondaryPhone'
    ),
  },
  SUPPLIER: {
    sup_agent_name: new Validator(
      Validator.string.required,
      'translation.agentName'
    ),
    sup_name: new Validator(
      Validator.string.required,
      'translation.companyName'
    ),
    sup_phone: new Validator(
      Validator.phone.required,
      'translation.officeNumber'
    ),
    sup_email: new Validator(Validator.email.optional, 'translation.email'),
    sup_secondary_phone: new Validator(
      Validator.phone.optional,
      'translation.phoneNumber'
    ),
  },
  PART: {
    pr_name: new Validator(Validator.string.required, 'translation.name'),
    md_id: new Validator(Validator.integer.required, 'translation.model'),
    serial: new Validator(Validator.integer.length(6), 'translation.serial'),
    pr_brand_id: new Validator(Validator.integer.required, 'translation.brand'),
    sup_id: new Validator(Validator.integer.required, 'translation.supplier'),
    in_stock: new Validator(
      Validator.integerPositive.required,
      'translation.stock'
    ),
    price: new Validator(
      Validator.integerPositive.required,
      'translation.price'
    ),
    sell_price: new Validator(
      Validator.integerPositive.required,
      'translation.sell_price'
    ),
  },
  ORDER_PART: {
    sup_id: new Validator(Validator.integer.required, 'translation.supplier'),
    brand_id: new Validator(Validator.integer.required, 'translation.brand'),
    pr_id: new Validator(Validator.integer.required, 'translation.part'),
    amount: new Validator(Validator.integer.required, 'translation.amount'),
  },
  CART_PART: {
    supplier_id: new Validator(
      Validator.integer.required,
      'translation.supplier'
    ),
    part_id: new Validator(Validator.integer.required, 'translation.part'),
    amount: new Validator(Validator.integer.required, 'translation.amount'),
  },
  SELL_DEVICE: {
    user_id: new Validator(Validator.integer.required, 'translation.client'),
    warranty_expiration_date: new Validator(
      Validator.string.required,
      'translation.warrantyExpirationDate'
    ),
    actual_sell_price: new Validator(
      Validator.integerPositive.required,
      'translation.actualSellPrice'
    ),
    life_status: new Validator(
      Validator.integer.required,
      'translation.status'
    ),
  },
  SELL_PART: {
    user_id: new Validator(Validator.integer.required, 'translation.client'),
    warranty_expiration_date: new Validator(
      Validator.string.required,
      'translation.warrantyExpirationDate'
    ),
    actual_sell_price: new Validator(
      Validator.integerPositive.required,
      'translation.actualSellPrice'
    ),
    amount: new Validator(Validator.integer.required, 'translation.amount'),
    life_status: new Validator(
      Validator.integer.required,
      'translation.status'
    ),
  },
  DEVICE: {
    brand_id: new Validator(Validator.integer.required, 'translation.brand'),
    model_id: new Validator(Validator.integer.required, 'translation.model'),
    // dev_pass: new Validator(Validator.string.required, 'Device Password'),
    // scr_pass: new Validator(Validator.string.required, 'Screen Password'),
    dev_imei: new Validator(Validator.imei.required, 'translation.imei'),
    // price: new Validator(Validator.integer.required, 'Price'),
    status: new Validator(Validator.integer.required, 'translation.status'),
  },
  ACCOUNT: {
    ac_email: new Validator(Validator.email.required, 'translation.email'),
    ac_pass: new Validator(Validator.string.length(4), 'translation.password'),
  },
  BRAND: {
    name: new Validator(Validator.string.required, 'translation.name'),
  },
};
