import { registerRootComponent } from 'expo';

import WiFiOnlyApp from './WiFiOnlyApp';
import FullDeviceManagerApp from './FullDeviceManagerApp';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(WiFiOnlyApp);
