import Dashboard from '@/app/Dashboard';
import Profile from '@/app/admin/Profile';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import AnimatedTabBar from './AnimatedTabBar';
import UserList from '@/app/admin/UserList';
import JobList from '@/app/job/JobList';
import ChatUserList from '@/app/chat/ChatUserList';

export type BottomTabParamList = {
  Dashboard: undefined;
  Profile: undefined;
  UserList: undefined;
  JobList: undefined;
  ChatUserList: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
      }}
      tabBar={(props) => <AnimatedTabBar {...props} />}
    >
      <Tab.Screen name="Dashboard" component={Dashboard} options={{ title: 'Home' }} />
      <Tab.Screen name="UserList" component={UserList} options={{ title: 'Users' }} />
      <Tab.Screen name="JobList" component={JobList} options={{ title: 'Jobs' }} />
      <Tab.Screen name="ChatUserList" component={ChatUserList} options={{ title: 'Chat' }} />
      <Tab.Screen name="Profile" component={Profile} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}
