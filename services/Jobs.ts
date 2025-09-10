import { NODE_API } from "./Node_BaseURL";
import { LARAVEL_API } from "./Laravel_BaseURL";

export const FetchJobs = async (search = "", role: string, user_id: string) => {
    const res = await NODE_API.get("/jobs/list", { params: { search, role, user_id } });
    return res.data?.data || [];
}

export const FetchOneJob = async (id: string) => {
    const res = await NODE_API.get(`jobs/view/${id}`);
    return res.data?.data || [];
}

export const ApprovalHandle = async (id: string, selectedAction: number) => {
    try {
        const res = await NODE_API.post(`/jobs/approve-job/${id}`, {
            action: selectedAction,
        });
    } catch (err) {
        console.error("Failed to approve job:", err);
    }
};

export const CheckAppliedStatus = async (id: string) => {
    try {
        const res = await LARAVEL_API.post('/application/checkJobApplication', { params: { job_id: id } });
        if (res.data.data.existValue === true) {
            return true
        } else {
            return false
        }
    } catch (err) {
        console.error(err);
    }
}

export const CloseAndOpenJob = async (id: string, isClosed: boolean) => {
    try {
        const res = await NODE_API.post(`/jobs/CloseOpenJob`, { job_id: id });

        if (isClosed) {
            return false
        } else {
            return true
        }

    } catch (err) {
        console.error(err);

    }
}

export const GetApplicationList = async (id: string) => {
    try {
        const res = await LARAVEL_API.post('/application/getApplicationBasedonJobs', { job_id: id });
        return res.data?.data;
    } catch (err) {
        console.error(err);
    }
}

export const GetApplicationData = async (appId: string) => {
    try {
        const res = await LARAVEL_API.get("/application/view", { params: { id: appId } });
        return res.data?.data;
    } catch (error) {
        console.error("Failed to load application:", error);
    }
};

export const ResumeView = async (appId: string, job_name: string) => {
    try {
        const res = await LARAVEL_API.post("/application/resumeViewed", { id: appId, job_name });
        return res;
    } catch (error) {
        console.log("Something went wrong!", error);
    }
};

export const ApplicationApprovalHandle = async (appId: string, action: number, job_name: string) => {
    try {
        const res = await LARAVEL_API.post("/application/approval", { id: appId, action, job_name });
        return res.data.success;
    } catch (error) {
        console.log("Something went wrong!", error);
    }
};

export const markAsViewed = async (id: string, job_name: string) => {
    try {
        const res = await LARAVEL_API.post("/application/applicationViewed", { id, job_name });
        return res.data.success;
    } catch (error) {
        console.log("Something went wrong!", error);
    }
};

export const FetchBookMarks = async (query = '') => {
    try {
        const res = await LARAVEL_API.get('/bookmarks/list', {
            params: { search: query }
        });
        return res.data.data.book_mark_details?.list || []

    } catch (err) {
        console.error("Failed to fetch bookmarks:", err);
    }

}

export const removeBookmark = async (id: string) => {
    try {
        const res = await LARAVEL_API.post('/bookmark/remove', { job_id: id });
        return res;
    } catch (err) {
        console.error("Failed to bookmark job:", err);
    }
};

export const fetchApplications = async () => {
    try {
        const res = await LARAVEL_API.get("/application/list");
        return res.data.data.applicationDetails?.list || [];
    } catch (err) {
        console.error("Error fetching applications", err);
    }
};
export const StoreJobs = async (formData: any) => {
    try {
        await NODE_API.post(`/jobs/store`, formData);
        return true;
    } catch (err) {
        console.error("Error creating job post", err);

    }
};