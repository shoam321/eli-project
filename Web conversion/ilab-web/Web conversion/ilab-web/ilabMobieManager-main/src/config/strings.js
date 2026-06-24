const strings = {
  loginForms: {
    email: 'Email',
    password: 'Password',
  },

  clients: 'Clients', // Main title, menu
  clientSearch: 'Name / Phone', // Placeholder
  clientDevices: 'Devices', // Title
  clientEdit: 'Edit Client', // Title
  clientAdd: 'Add Client', // Title
  clientForms: {
    name: 'Name',
    lastName: 'Last Name',
    email: 'Email',
    phoneNumber: 'Phone Number',
  },

  projects: 'Projects', // Title
  projectSearch: 'Client / Device / Email', // Placeholder
  projectEdit: 'Edit Project', // Title
  projectAdd: 'Add Project', // Title
  projectFilter: {
    title: 'Project Filter',
    dateFrom: 'Date From',
    dateTo: 'Date To',
  },
  projectForms: {
    client: 'Client',
    device: 'Device',
    problem: 'Problem',
    cost: 'Cost',
    price: 'Price',
    dueDate: 'Due Date',
    tempDevice: 'Temporary Device',
    photos: 'Photos',
    status: 'Status',
    summary: 'Summary',
  },

  suppliers: 'Suppliers', // Title
  supplierSearch: 'Name / Phone', // Placeholder
  supplierParts: 'Parts', // Title
  supplierEdit: 'Edit Supplier', // Title
  supplierAdd: 'Add Supplier', // Title
  supplierForms: {
    name: 'Name',
    email: 'Email',
    phoneNumber: 'Phone Number',
  },

  parts: 'Parts', // Title
  partSearch: 'Supplier / Part / Model', // Placeholder
  partEdit: 'Edit Part', // Title
  partAdd: 'Add Part', // Title
  partForms: {
    supplier: 'Supplier',
    name: 'Name',
    brand: 'Brand',
    model: 'Model',
    serial: 'Serial',
    stock: 'In Stock',
    price: 'Price',
  },

  orders: 'Orders', // Title
  orderSearch: 'Supplier / Order ID', // Placeholder
  orderPartSearch: 'Part / Brand', // Placeholder
  orderPartAdd: 'Add Order Parts', // Title
  orderPartList: 'Part List', // Title
  orderPartFilter: 'Order Filter', // Title
  orderPartForms: {
    supplier: 'Supplier',
    brand: 'Brand',
    model: 'Model',
    part: 'Part',
    amount: 'Amount',
  },

  devices: 'My Devices', // Title
  deviceSearch: 'Brand / Model', // Placeholder
  deviceAccounts: 'Accounts\n(gmail/icloud/etc)', // Title
  deviceEdit: 'Edit Device', // Title
  deviceAdd: 'Add Device', // Title
  deviceForms: {
    name: 'Device Name',
    brand: 'Brand',
    devPassword: 'Device Password',
    scrPassword: 'Screen Password',
    imei: 'IMEI',
    price: 'Price',
    photos: 'Photos',
  },
  deviceAccountForms: {
    email: 'Email',
    password: 'Password',
  },

  settings: 'Settings', // Title
  settingForms: {
    name: 'Name',
    lastName: 'Last Name',
    phone: 'Phone',
    notifications: 'Notifications',
  },
  brands: 'Brands', // Title
  models: 'Models', // Title

  // Buttons
  logIn: 'Log In',
  save: 'Save', // Add or Edit client, project, etc
  createProject: 'Create Project', // Clients -> One Client, Devices
  createOrder: 'Create Order', // Suppliers -> One Supplier AND Parts -> One Part
  filterReset: 'Reset',
  filterSubmit: 'Submit',
  share: 'Share',
  buyDevice: 'Buy',
  yes: 'Yes', // Buy device
  no: 'No', // Buy device
  devicePhotos: '%1 photos',

  // Alerts
  buyDeviceAlert: 'Are you sure you want to buy this device?',
  alertErrorTitle: 'Error', // Validation and other errors
  undefinedServerError: 'Check form data',
  fieldRequired: 'field is required', // Validation
  fieldLengthInvalid: 'must be %1 characters or more', // Length validation
  fieldEmailInvalid: 'is invalid', // Email validation
  fieldPhoneInvalid: 'must range from %1 to %2 digits', // Phone validation

  // Other Labels
  loading: 'Loading', // Preloader
  count: '%1 items', // Settings scene, Models / Brands
};

export default strings;
