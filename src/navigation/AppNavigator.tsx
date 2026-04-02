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
          tabBarActiveTintColor: '#0EA5E9',
          tabBarInactiveTintColor: '#94A3B8',
          headerShown: false,
          tabBarPressOpacity: 1,
          tabBarPressColor: 'transparent',
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopColor: '#E2E8F0',
            borderTopWidth: 1,
            paddingBottom: 8,
            paddingTop: 8,
            height: 68,
            shadowColor: '#94A3B8',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 8,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
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
