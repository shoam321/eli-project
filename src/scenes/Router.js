import React from 'react';
import {
  Router, Scene, Stack, ActionConst,
} from 'react-native-router-flux';

import Loader from './auth/Loader';
import Login from './auth/Login';
import Settings from './settings/Settings';
import Brands from './settings/Brands';
import BrandForms from './settings/BrandForms';
import Models from './settings/Models';
import Projects from './projects/Projects';
import DraftProjects from './drafts/DraftProjects';
import Project from './projects/Project';
import ProjectForms from './projects/ProjectForms';
import Clients from './clients/Clients';
import Client from './clients/Client';
import ClientForms from './clients/ClientForms';
import Suppliers from './suppliers/Suppliers';
import Supplier from './suppliers/Supplier';
import SupplierForms from './suppliers/SupplierForms';
import Parts from './parts/Parts';
import Part from './parts/Part';
import PartForms from './parts/PartForms';
import Orders from './orders/Orders';
import OrderForms from './orders/OrderForms';
import OrderParts from './orders/OrderParts';
import Cart from './carts/Cart';
import CartForms from './carts/CartForms';
import OrderInfo from './orders/OrderInfo';
import Cashiers from './cashiers/Cashiers';
import SellHistories from './sellHistories/SellHistories';
import CashierForms from './cashiers/CashierForms';
import Devices from './devices/Devices';
import Device from './devices/Device';
import DeviceForms from './devices/DeviceForms';
import ImagesPicker from './components/ImagesPicker';
import Menu from './general/Menu';
import TermsAndConditionsSignature from './general/TermsAndConditionsSignature';

const RouterComponent = () => (
  <Router>
    <Stack key="root" hideNavBar>
      <Scene
        type={ActionConst.RESET}
        key="loadingScene"
        component={Loader}
      />

      <Scene
        type={ActionConst.RESET}
        key="loginScene"
        component={Login}
      />

      <Scene
        type={ActionConst.RESET}
        key="menuScene"
        component={Menu}
      />
      <Scene
        key="termsAndConditionsSignatureScene"
        component={TermsAndConditionsSignature}
      />

      <Scene
        key="settingsScene"
        component={Settings}
      />
      <Scene
        key="brandsScene"
        component={Brands}
      />
      <Scene
        key="brandFormsScene"
        component={BrandForms}
      />
      <Scene
        key="modelsScene"
        component={Models}
      />

      <Scene
        key="draftProjectsScene"
        component={DraftProjects}
      />

      <Scene
        key="projectsScene"
        component={Projects}
      />
      <Scene
        key="projectScene"
        component={Project}
      />
      <Scene
        key="projectFormsScene"
        component={ProjectForms}
      />

      <Scene
        key="clientsScene"
        component={Clients}
      />
      <Scene
        key="clientScene"
        component={Client}
      />
      <Scene
        key="clientFormsScene"
        component={ClientForms}
      />

      <Scene
        key="suppliersScene"
        component={Suppliers}
      />
      <Scene
        key="supplierScene"
        component={Supplier}
      />
      <Scene
        key="supplierFormsScene"
        component={SupplierForms}
      />

      <Scene
        key="partsScene"
        component={Parts}
      />
      <Scene
        key="partScene"
        component={Part}
      />
      <Scene
        key="partFormsScene"
        component={PartForms}
      />

      <Scene
        key="ordersScene"
        component={Orders}
      />
      <Scene
        key="orderPartsScene"
        component={OrderParts}
      />
      <Scene
        key="orderFormsScene"
        component={OrderForms}
      />
      <Scene
        key="orderInfoScene"
        component={OrderInfo}
      />

      <Scene
        key="cartScene"
        component={Cart}
      />
      <Scene
        key="cartFormsScene"
        component={CartForms}
      />

      <Scene
        key="cashiersScene"
        component={Cashiers}
      />
      <Scene
        key="cashierFormsScene"
        component={CashierForms}
      />

      <Scene
        key="sellHistoriesScene"
        component={SellHistories}
      />

      <Scene
        key="devicesScene"
        component={Devices}
      />
      <Scene
        key="deviceScene"
        component={Device}
      />
      <Scene
        key="deviceFormsScene"
        component={DeviceForms}
      />

      <Scene
        key="imagesPickerScene"
        component={ImagesPicker}
      />
    </Stack>
  </Router>
);

export default RouterComponent;
