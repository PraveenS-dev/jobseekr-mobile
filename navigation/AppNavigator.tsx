// navigation/AppNavigator.tsx
import Login from '@/app/Login';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import BottomTabs from './BottomTabs';
import UserProfile from '@/app/admin/UserProfile';
import JobView from '@/app/job/JobView';
import ApplyJob from '@/app/job/ApplyJob';
import ApplicationView from '@/app/job/ApplicationView';
import Bookmarks from '@/app/job/Bookmarks';
import ApplicationList from '@/app/job/ApplicationList';
import AddJob from '@/app/job/AddJob';
import Notification from '@/app/admin/Notification';
import AllNotification from '@/app/admin/AllNotification';
import JobList from '@/app/job/JobList';
import ChatUserList from '@/app/chat/ChatUserList';
import ChatWindow from '@/app/chat/ChatWindow';

export type RootStackParamList = {
    Login: undefined;
    Main: undefined;
    UserProfile: { id: string };
    JobList: undefined;
    JobView: { id: string };
    ApplyJob: { id: string };
    ApplicationView: { id: string };
    Bookmarks: undefined;
    ApplicationList: undefined;
    AddJob: undefined;
    Notification: undefined;
    AllNotification: undefined;
    ChatUserList: undefined;
    ChatWindow: { user: any };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator({ initialRoute }: { initialRoute: 'Login' | 'Main' }) {
    return (
        <Stack.Navigator
            initialRouteName={initialRoute}
            screenOptions={{ headerShown: false }}
        >
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Main" component={BottomTabs} />
            <Stack.Screen name="UserProfile" component={UserProfile} />
            <Stack.Screen name="JobView" component={JobView} />
            <Stack.Screen name="ApplyJob" component={ApplyJob} />
            <Stack.Screen name="ApplicationView" component={ApplicationView} />
            <Stack.Screen name="Bookmarks" component={Bookmarks} />
            <Stack.Screen name="ApplicationList" component={ApplicationList} />
            <Stack.Screen name="AddJob" component={AddJob} />
            <Stack.Screen name="AllNotification" component={AllNotification} />
            <Stack.Screen name="JobList" component={JobList} />
            <Stack.Screen name="ChatUserList" component={ChatUserList} />
            <Stack.Screen name="ChatWindow" component={ChatWindow} />
        </Stack.Navigator>
    );
}
