import { Tabs } from 'expo-router';

import { ClayTabBar } from '../../components/navigation/ClayTabBar';



/** Exactly 5 tabs. Hub screens live under /hub (opened from Home). */

export default function TabsLayout() {

  return (

    <Tabs

      tabBar={(props) => <ClayTabBar {...props} />}

      screenOptions={{

        headerShown: false,

        tabBarShowLabel: false,

      }}

    >

      <Tabs.Screen name="home" />

      <Tabs.Screen name="notes" />

      <Tabs.Screen name="tasks" />

      <Tabs.Screen name="ai" />

      <Tabs.Screen name="profile" />

    </Tabs>

  );

}

