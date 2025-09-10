import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Linking,
} from "react-native";
import React, { useEffect, useState } from "react";
import TopBar from "../components/TopBar";
import { getUser } from "@/services/Auth";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/AppNavigator";
import {
  FetchOneJob,
  ApprovalHandle,
  CheckAppliedStatus,
  CloseAndOpenJob,
  GetApplicationList,
} from "@/services/Jobs";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/services/Theme";
import { fixLocalhostUrl, formatDate } from "@/services/helpers";
import { FlatList } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";

type JobViewProps = NativeStackScreenProps<RootStackParamList, "JobView">;

const JobView: React.FC<JobViewProps> = ({ route, navigation }) => {
  const [user, setUser] = useState<any>(null);
  const [jobs, setJobs] = useState<any>(null);
  const { id } = route.params;
  const [appliedStatus, setAppliedStatus] = useState(false);
  const [jobStatus, setJobStatus] = useState(true);
  const [applicationDetails, setApplicationDetails] = useState<any>([]);

  const { colors } = useTheme();
  const userRole = user?.role;

  const openResume = (url: string) => {
    Linking.openURL(fixLocalhostUrl(url));
  };

  useEffect(() => {
    getUser().then(setUser).catch(console.error);
  }, []);

  const FetchJobDetails = async (id: string) => {
    try {
      const res = await FetchOneJob(id);
      setJobs(res);
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
    }
  };

  const JobApprovalHandle = async (id: string, selectedAction: number) => {
    try {
      await ApprovalHandle(id, selectedAction);
      FetchJobDetails(id);
    } catch (err) {
      console.error("Failed to approve job:", err);
    }
  };

  const CheckJobAppliedStatus = async (id: string) => {
    try {
      const res = await CheckAppliedStatus(id);
      setAppliedStatus(!!res);
    } catch (err) {
      console.error(err);
    }
  };

  const OpenCloseJob = async (id: string) => {
    try {
      const res = await CloseAndOpenJob(id, jobStatus);
      setJobStatus(res?.is_closed === 0 ? false : true);
      FetchJobDetails(id);
    } catch (err) {
      console.error(err);
    }
  };

  const FetchApplicationList = async (id: string) => {
    try {
      const res = await GetApplicationList(id);
      setApplicationDetails(res || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    FetchJobDetails(id);
    CheckJobAppliedStatus(id);
    FetchApplicationList(id);
  }, [id]);

  useEffect(() => {
    if (jobs) {
      setJobStatus(jobs.is_closed !== 0);
    }
  }, [jobs]);

  const approvalStatus: Record<number, string> = {
    1: "Pending",
    2: "Approved",
    3: "Rejected",
  };

  const approvalColors: Record<number, string> = {
    2: "green",
    3: "red",
  };

  const applyJob = (id: string) => {
    navigation.navigate("ApplyJob", { id });
  };


  if (!jobs) {
    return (
      <View style={[styles.loader, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={{ color: colors.textPrimary, marginTop: 12 }}>
          Loading job details...
        </Text>
      </View>
    );
  }

  const renderHeader = () => (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>
        {jobs.title}
      </Text>

      {userRole !== 1 && (
        <Text
          style={[
            styles.approvalText,
            {
              color: approvalColors[jobs.is_approved] ?? colors.textSecondary,
              fontWeight: "700",
            },
          ]}
        >
          {approvalStatus[jobs.is_approved] ?? "Pending"}
        </Text>
      )}

      {/* Job Info */}
      {[
        ["Category", jobs.category_id],
        ["Location", jobs.location],
        ["Salary", jobs.salary],
        ["Type", jobs.job_type],
      ].map(([label, value]) => (
        <View style={styles.detailBox} key={label}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            {label}:
          </Text>
          <Text style={[styles.value, { color: colors.textPrimary }]}>{value}</Text>
        </View>
      ))}

      <Text style={[styles.desc, { color: colors.textPrimary }]}>{jobs.description}</Text>
      <Text style={[styles.meta, { color: colors.textSecondary }]}>
        Posted By: {jobs.created_by_name}
      </Text>
      <Text style={[styles.meta, { color: colors.textSecondary }]}>
        Posted At: {formatDate(jobs.created_at)}
      </Text>

      {/* Approval Buttons */}
      {userRole === 2 && jobs.is_approved === 1 && (
        <View style={styles.row}>
          <LinearGradient colors={["#EF4444", "#DC2626"]} style={styles.actionBtn}>
            <TouchableOpacity onPress={() => JobApprovalHandle(jobs._id, 3)}>
              <Text style={styles.actionText}>Reject</Text>
            </TouchableOpacity>
          </LinearGradient>
          <LinearGradient colors={["#22C55E", "#16A34A"]} style={styles.actionBtn}>
            <TouchableOpacity onPress={() => JobApprovalHandle(jobs._id, 2)}>
              <Text style={styles.actionText}>Approve</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      )}

      {/* Apply Job */}
      {userRole === 1 && !appliedStatus && (
        <LinearGradient colors={["#3B82F6", "#2563EB"]} style={styles.applyBtn}>
          <TouchableOpacity onPress={() => applyJob(jobs._id)}>
            <Text style={styles.actionText}>Easy Apply</Text>
          </TouchableOpacity>
        </LinearGradient>
      )}

      {userRole === 1 && appliedStatus && (
        <View style={styles.appliedBox}>
          <Text style={{ color: colors.textSecondary }}>You already applied!</Text>
        </View>
      )}

      {/* Open/Close Job Button */}
      {userRole !== 1 && (
        <LinearGradient
          colors={jobStatus ? ["#22C55E", "#16A34A"] : ["#EF4444", "#DC2626"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.vitalBtn, { alignSelf: "flex-start", marginTop: 16 }]}
        >
          <TouchableOpacity onPress={() => OpenCloseJob(jobs._id)}>
            <Text style={styles.vitalBtnText}>{jobStatus ? "Open Job" : "Close Job"}</Text>
          </TouchableOpacity>
        </LinearGradient>
      )}
    </View>
  );

  const ListEmpty = () => (
    <View style={styles.emptyContainer}>
      {userRole !== 1 && (
        <View>
          <Ionicons name="document-text-outline" size={60} color={colors.inputPlaceholder} />
          <Text style={{ color: colors.inputPlaceholder, fontSize: 16, marginTop: 8, textAlign: "center" }}>
            No application found.
          </Text>
        </View>
      )}
    </View>
  );

  const handleView = (id: string) => {
    navigation.navigate('ApplicationView', { id });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar />
      <FlatList
        data={userRole !== 1 ? applicationDetails : []}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={ListEmpty}
        ListHeaderComponent={renderHeader}
        renderItem={({ item }) => (
          <View
            style={{
              backgroundColor: colors.surface,
              marginHorizontal: 16,
              marginVertical: 8,
              padding: 16,
              borderRadius: 12,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.1,
              shadowRadius: 5,
              elevation: 5,
            }}
          >
            <Text style={{ fontWeight: "700", color: colors.textPrimary, fontSize: 16 }}>
              {item.created_by}
            </Text>
            <Text style={{ color: colors.textSecondary, marginTop: 4, fontSize: 14 }}>
              Applied At: {new Date(item.created_at).toLocaleString()}
            </Text>
            <TouchableOpacity onPress={() => openResume(item.resume_path)} style={{ marginTop: 10 }}>
              <Text style={{ color: colors.accent, fontWeight: "600", fontSize: 14 }}>View Resume</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleView(item.id)} style={{ marginTop: 10 }}>
              <Text style={{ color: colors.accent, fontWeight: "600", fontSize: 14 }}>View Application</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

export default JobView;

const styles = StyleSheet.create({
  container: { flex: 1 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  vitalBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    elevation: 5,
  },
  vitalBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  card: { padding: 16, margin: 16, borderRadius: 16, elevation: 3 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 8 },
  approvalText: { marginBottom: 10, fontSize: 14 },
  detailBox: { flexDirection: "row", marginBottom: 6 },
  label: { fontWeight: "600", marginRight: 6 },
  value: { flexShrink: 1 },
  desc: { marginVertical: 10, fontSize: 15, lineHeight: 20 },
  meta: { fontSize: 12, marginTop: 4 },
  row: { flexDirection: "row", justifyContent: "space-around", marginTop: 16 },
  actionBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, marginHorizontal: 6, alignItems: "center" },
  actionText: { color: "#fff", fontWeight: "600" },
  applyBtn: { paddingVertical: 14, borderRadius: 12, marginTop: 16, alignItems: "center" },
  appliedBox: { alignItems: "center", marginTop: 14 },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 40 },
});
