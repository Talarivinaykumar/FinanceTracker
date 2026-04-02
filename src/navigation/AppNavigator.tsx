import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Home, List, PieChart, Target } from 'lucide-react-native';

import { HomeScreen } from '../screens/HomeScreen';
import { TransactionsScreen } from '../screens/TransactionsScreen';
import { InsightsScreen } from '../screens/InsightsScreen';
import { GoalsScreen } from '../screens/GoalsScreen';

export type RootTabParamList = {
  Home: undefined;
  Transactions: undefined;
  Insights: undefined;
  Goals: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            if (route.name === 'Home') return <Home color={color} size={size} />;
            if (route.name === 'Transactions') return <List color={color} size={size} />;
            if (route.name === 'Insights') return <PieChart color={color} size={size} />;
            if (route.name === 'Goals') return <Target color={color} size={size} />;
          },
          tabBarActiveTintColor: '#2E7D32', // A nice finance green
          tabBarInactiveTintColor: '#8E8E93',
          headerShown: false,
          tabBarStyle: {
            paddingBottom: 5,
            height: 60,
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Transactions" component={TransactionsScreen} />
        <Tab.Screen name="Insights" component={InsightsScreen} />
        <Tab.Screen name="Goals" component={GoalsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};
