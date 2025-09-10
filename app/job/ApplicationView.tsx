import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Linking,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/AppNavigator";
import TopBar from "../components/TopBar";
import {
  ApplicationApprovalHandle,
  FetchOneJob,
  GetApplicationData,
  markAsViewed,
  ResumeView,
} from "@/services/Jobs";
import { getUser } from "@/services/Auth";
import { getUserDetails } from "@/services/UserList";
import { useTheme } from "@/services/Theme";
import dayjs from "dayjs";
import { Ionicons } from "@expo/vector-icons";
import { fixLocalhostUrl } from "@/services/helpers";

type ApplicationViewProps = NativeStackScreenProps<
  RootStackParamList,
  "ApplicationView"
>;

const ApplicationView: React.FC<ApplicationViewProps> = ({ route, navigation }) => {
  const [user, setUser] = useState<any>(null);
  const { id } = route.params;
  const [ApplicationDetails, setApplicationDetails] = useState<any>(null);
  const [JobDetails, setJobs] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);

  const { colors } = useTheme();

  useEffect(() => {
    getUser().then(setUser).catch(console.error);
  }, []);

  const approvalStatus: Record<number, string> = {
    1: "Pending",
    2: "Viewed",
    3: "Resume Viewed",
    4: "Approved",
    5: "Rejected",
  };

  const approvalColors: Record<number, string> = {
    1: colors.yellow || "yellow",
    2: colors.orange || "orange",
    3: colors.blue || "blue",
    4: colors.green || "green",
    5: colors.red || "red",
  };

  const GetApplicationDetails = async (appId: string) => {
    try {
      const res = await GetApplicationData(appId);
      setApplicationDetails(res);
    } catch (err) {
      console.error(err);
    }
  };

  const GetUserData = async (uid: string) => {
    try {
      const res = await getUserDetails(uid);
      setUserData(res);
    } catch (err) {
      console.error("Failed to fetch user", err);
    }
  };

  const Viewprofile = (uid: string) => {
    navigation.navigate("UserProfile", { id: uid });
  };

  const FetchJobDetails = async (jobId: string) => {
    try {
      const res = await FetchOneJob(jobId);
      setJobs(res);
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
    }
  };

  const ApplicationResumeView = async (appId: string, job_name: string) => {
    try {
      await ResumeView(appId, job_name);
      GetApplicationDetails(appId);
    } catch (err) {
      console.log("Something went wrong!", err);
    }
  };

  const ApprovalHandle = async (appId: string, action: number, job_name: string) => {
    try {
      await ApplicationApprovalHandle(appId, action, job_name);
      GetApplicationDetails(appId);
    } catch (err) {
      console.log("Something went wrong!", err);
    }
  };

  useEffect(() => {
    if (id) GetApplicationDetails(id);
  }, [id]);


  useEffect(() => {
    if (ApplicationDetails?.created_by_id) {
      GetUserData(ApplicationDetails.created_by_id);
    }
  }, [ApplicationDetails?.created_by_id]);

  useEffect(() => {
    if (ApplicationDetails?.job_id) FetchJobDetails(ApplicationDetails.job_id);
  }, [ApplicationDetails?.job_id]);

  useEffect(() => {
    if (
      ApplicationDetails?.application_status === 1 && user?.role !== 1 && id
    ) {
      markAsViewed(id, JobDetails?.title);
    }
  }, [ApplicationDetails?.application_status, id]);

  const openResume = (url: string) => {
    Linking.openURL(fixLocalhostUrl(url));
  };

  if (!ApplicationDetails || !JobDetails) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={{ color: colors.textPrimary, marginTop: 10 }}>
          Loading Application...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar />
      <ScrollView contentContainerStyle={styles.scrollContainer}>

        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.jobTitle, { color: colors.textPrimary }]}>
            {JobDetails.title}
          </Text>

          <View style={[styles.statusBox, { backgroundColor: colors.surface }]}>
            <Text style={{ fontWeight: "bold", marginRight: 8 }}>Status:</Text>
            <Text style={{ color: approvalColors[ApplicationDetails.application_status] }}>
              {approvalStatus[ApplicationDetails.application_status]}
            </Text>
          </View>

          <View style={styles.jobInfo}>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              <Text style={{ fontWeight: "bold" }}>Category: </Text>
              {JobDetails.category_id || "—"}
            </Text>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              <Text style={{ fontWeight: "bold" }}>Location: </Text>
              {JobDetails.location || "—"}
            </Text>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              <Text style={{ fontWeight: "bold" }}>Salary: </Text>
              ₹{JobDetails.salary || "—"}
            </Text>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              <Text style={{ fontWeight: "bold" }}>Job Type: </Text>
              {JobDetails.job_type || "—"}
            </Text>
          </View>

          <Text style={[styles.description, { color: colors.textPrimary }]}>
            {JobDetails.description || "—"}
          </Text>

          {user.role !== 1 && (
            <View style={[styles.appliedByBox, { backgroundColor: colors.surface }]}>
              <Text style={{ color: colors.textSecondary }}>
                <Text style={{ fontWeight: "bold" }}>Applied By: </Text>
                {ApplicationDetails.created_by || "—"}
              </Text>
              <TouchableOpacity
                onPress={() => Viewprofile(userData?.enc_id)}
                style={[styles.viewBtn, { backgroundColor: colors.primary }]}
              >
                <Ionicons name="eye" size={16} color="#fff" />
                <Text style={styles.viewBtnText}>View</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={[styles.appliedAt, { color: colors.textSecondary }]}>
            <Text style={{ fontWeight: "bold" }}>Applied At: </Text>
            {dayjs(ApplicationDetails.created_at).format("DD-MMMM-YYYY hh:mm A")}
          </Text>

          {ApplicationDetails.resume_path && (
            <TouchableOpacity
              onPress={() => {ApplicationResumeView(id, JobDetails.title) , openResume(ApplicationDetails.resume_path)}}
              style={[styles.resumeBtn, { backgroundColor: colors.success }]}
            >
              <Ionicons name="document-text" size={16} color="#fff" />
              <Text style={styles.resumeBtnText}>View Resume</Text>
            </TouchableOpacity>
          )}

          {user?.role !== 1 &&
            ApplicationDetails.application_status !== 4 &&
            ApplicationDetails.application_status !== 5 && (
              <View style={styles.approvalBox}>
                <TouchableOpacity
                  onPress={() => ApprovalHandle(id, 2, JobDetails.title)}
                  style={[styles.rejectBtn, { backgroundColor: colors.danger }]}
                >
                  <Ionicons name="close-circle" size={16} color="#fff" />
                  <Text style={styles.approvalBtnText}>Reject</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => ApprovalHandle(id, 1, JobDetails.title)}
                  style={[styles.approveBtn, { backgroundColor: colors.success }]}
                >
                  <Ionicons name="checkmark-circle" size={16} color="#fff" />
                  <Text style={styles.approvalBtnText}>Approve</Text>
                </TouchableOpacity>
              </View>
            )}
        </View>
      </ScrollView>
    </View>
  );
};

export default ApplicationView;

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { padding: 16 },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#fff" },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  backBtnText: { color: "#fff", fontWeight: "600" },
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  jobTitle: { fontSize: 22, fontWeight: "700", marginBottom: 8 },
  statusBox: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  jobInfo: { marginBottom: 12 },
  infoText: { fontSize: 14, marginBottom: 4 },
  description: { fontSize: 15, lineHeight: 20, marginBottom: 12 },
  appliedByBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
  },
  viewBtn: { flexDirection: "row", alignItems: "center", gap: 4, padding: 6, borderRadius: 6 },
  viewBtnText: { color: "#fff", fontWeight: "600" },
  appliedAt: { fontSize: 13, marginBottom: 8 },
  resumeBtn: { flexDirection: "row", alignItems: "center", gap: 4, padding: 10, borderRadius: 8, marginBottom: 8 },
  resumeBtnText: { color: "#fff", fontWeight: "600" },
  approvalBox: { flexDirection: "row", justifyContent: "space-between", marginTop: 12 },
  rejectBtn: { flexDirection: "row", alignItems: "center", gap: 6, padding: 10, borderRadius: 8, flex: 1, marginRight: 8 },
  approveBtn: { flexDirection: "row", alignItems: "center", gap: 6, padding: 10, borderRadius: 8, flex: 1 },
  approvalBtnText: { color: "#fff", fontWeight: "600" },
});
