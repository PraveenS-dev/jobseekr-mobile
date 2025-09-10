import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootStackParamList } from '@/navigation/AppNavigator'
import TopBar from '../components/TopBar'

type ApplyJobProps = NativeStackScreenProps<RootStackParamList, "ApplyJob">

const ApplyJob: React.FC<ApplyJobProps> = ({ route, navigation }) => {

    const { id } = route.params;
    return (
        <View>
            <TopBar />
            <Text>ApplyJob</Text>
            <Text>{id}</Text>
        </View>
    )
}

export default ApplyJob

const styles = StyleSheet.create({})