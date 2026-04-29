import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import type { Assessment, CreateAssessmentBody, CreatePatientBody, DashboardStats, HealthStatus, Patient, PatientProgress, RiskSummary, UpdateAssessmentBody } from "./api.schemas";
import { customFetch } from "../custom-fetch";
import type { ErrorType, BodyType } from "../custom-fetch";
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
/**
 * @summary Health check
 */
export declare const getHealthCheckUrl: () => string;
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary List all patients
 */
export declare const getListPatientsUrl: () => string;
export declare const listPatients: (options?: RequestInit) => Promise<Patient[]>;
export declare const getListPatientsQueryKey: () => readonly ["/api/patients"];
export declare const getListPatientsQueryOptions: <TData = Awaited<ReturnType<typeof listPatients>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listPatients>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listPatients>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListPatientsQueryResult = NonNullable<Awaited<ReturnType<typeof listPatients>>>;
export type ListPatientsQueryError = ErrorType<unknown>;
/**
 * @summary List all patients
 */
export declare function useListPatients<TData = Awaited<ReturnType<typeof listPatients>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listPatients>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Create a new patient
 */
export declare const getCreatePatientUrl: () => string;
export declare const createPatient: (createPatientBody: CreatePatientBody, options?: RequestInit) => Promise<Patient>;
export declare const getCreatePatientMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createPatient>>, TError, {
        data: BodyType<CreatePatientBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createPatient>>, TError, {
    data: BodyType<CreatePatientBody>;
}, TContext>;
export type CreatePatientMutationResult = NonNullable<Awaited<ReturnType<typeof createPatient>>>;
export type CreatePatientMutationBody = BodyType<CreatePatientBody>;
export type CreatePatientMutationError = ErrorType<unknown>;
/**
 * @summary Create a new patient
 */
export declare const useCreatePatient: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createPatient>>, TError, {
        data: BodyType<CreatePatientBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createPatient>>, TError, {
    data: BodyType<CreatePatientBody>;
}, TContext>;
/**
 * @summary Get patient by ID
 */
export declare const getGetPatientUrl: (id: number) => string;
export declare const getPatient: (id: number, options?: RequestInit) => Promise<Patient>;
export declare const getGetPatientQueryKey: (id: number) => readonly [`/api/patients/${number}`];
export declare const getGetPatientQueryOptions: <TData = Awaited<ReturnType<typeof getPatient>>, TError = ErrorType<void>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPatient>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getPatient>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetPatientQueryResult = NonNullable<Awaited<ReturnType<typeof getPatient>>>;
export type GetPatientQueryError = ErrorType<void>;
/**
 * @summary Get patient by ID
 */
export declare function useGetPatient<TData = Awaited<ReturnType<typeof getPatient>>, TError = ErrorType<void>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPatient>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update patient
 */
export declare const getUpdatePatientUrl: (id: number) => string;
export declare const updatePatient: (id: number, createPatientBody: CreatePatientBody, options?: RequestInit) => Promise<Patient>;
export declare const getUpdatePatientMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updatePatient>>, TError, {
        id: number;
        data: BodyType<CreatePatientBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updatePatient>>, TError, {
    id: number;
    data: BodyType<CreatePatientBody>;
}, TContext>;
export type UpdatePatientMutationResult = NonNullable<Awaited<ReturnType<typeof updatePatient>>>;
export type UpdatePatientMutationBody = BodyType<CreatePatientBody>;
export type UpdatePatientMutationError = ErrorType<unknown>;
/**
 * @summary Update patient
 */
export declare const useUpdatePatient: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updatePatient>>, TError, {
        id: number;
        data: BodyType<CreatePatientBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updatePatient>>, TError, {
    id: number;
    data: BodyType<CreatePatientBody>;
}, TContext>;
/**
 * @summary Delete patient
 */
export declare const getDeletePatientUrl: (id: number) => string;
export declare const deletePatient: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeletePatientMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deletePatient>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deletePatient>>, TError, {
    id: number;
}, TContext>;
export type DeletePatientMutationResult = NonNullable<Awaited<ReturnType<typeof deletePatient>>>;
export type DeletePatientMutationError = ErrorType<unknown>;
/**
 * @summary Delete patient
 */
export declare const useDeletePatient: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deletePatient>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deletePatient>>, TError, {
    id: number;
}, TContext>;
/**
 * @summary List assessments for a patient
 */
export declare const getListPatientAssessmentsUrl: (id: number) => string;
export declare const listPatientAssessments: (id: number, options?: RequestInit) => Promise<Assessment[]>;
export declare const getListPatientAssessmentsQueryKey: (id: number) => readonly [`/api/patients/${number}/assessments`];
export declare const getListPatientAssessmentsQueryOptions: <TData = Awaited<ReturnType<typeof listPatientAssessments>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listPatientAssessments>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listPatientAssessments>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListPatientAssessmentsQueryResult = NonNullable<Awaited<ReturnType<typeof listPatientAssessments>>>;
export type ListPatientAssessmentsQueryError = ErrorType<unknown>;
/**
 * @summary List assessments for a patient
 */
export declare function useListPatientAssessments<TData = Awaited<ReturnType<typeof listPatientAssessments>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listPatientAssessments>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Create a new clinical assessment
 */
export declare const getCreateAssessmentUrl: () => string;
export declare const createAssessment: (createAssessmentBody: CreateAssessmentBody, options?: RequestInit) => Promise<Assessment>;
export declare const getCreateAssessmentMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createAssessment>>, TError, {
        data: BodyType<CreateAssessmentBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createAssessment>>, TError, {
    data: BodyType<CreateAssessmentBody>;
}, TContext>;
export type CreateAssessmentMutationResult = NonNullable<Awaited<ReturnType<typeof createAssessment>>>;
export type CreateAssessmentMutationBody = BodyType<CreateAssessmentBody>;
export type CreateAssessmentMutationError = ErrorType<unknown>;
/**
 * @summary Create a new clinical assessment
 */
export declare const useCreateAssessment: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createAssessment>>, TError, {
        data: BodyType<CreateAssessmentBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createAssessment>>, TError, {
    data: BodyType<CreateAssessmentBody>;
}, TContext>;
/**
 * @summary Get assessment by ID
 */
export declare const getGetAssessmentUrl: (id: number) => string;
export declare const getAssessment: (id: number, options?: RequestInit) => Promise<Assessment>;
export declare const getGetAssessmentQueryKey: (id: number) => readonly [`/api/assessments/${number}`];
export declare const getGetAssessmentQueryOptions: <TData = Awaited<ReturnType<typeof getAssessment>>, TError = ErrorType<void>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAssessment>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getAssessment>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetAssessmentQueryResult = NonNullable<Awaited<ReturnType<typeof getAssessment>>>;
export type GetAssessmentQueryError = ErrorType<void>;
/**
 * @summary Get assessment by ID
 */
export declare function useGetAssessment<TData = Awaited<ReturnType<typeof getAssessment>>, TError = ErrorType<void>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAssessment>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update assessment data
 */
export declare const getUpdateAssessmentUrl: (id: number) => string;
export declare const updateAssessment: (id: number, updateAssessmentBody: UpdateAssessmentBody, options?: RequestInit) => Promise<Assessment>;
export declare const getUpdateAssessmentMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateAssessment>>, TError, {
        id: number;
        data: BodyType<UpdateAssessmentBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateAssessment>>, TError, {
    id: number;
    data: BodyType<UpdateAssessmentBody>;
}, TContext>;
export type UpdateAssessmentMutationResult = NonNullable<Awaited<ReturnType<typeof updateAssessment>>>;
export type UpdateAssessmentMutationBody = BodyType<UpdateAssessmentBody>;
export type UpdateAssessmentMutationError = ErrorType<unknown>;
/**
 * @summary Update assessment data
 */
export declare const useUpdateAssessment: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateAssessment>>, TError, {
        id: number;
        data: BodyType<UpdateAssessmentBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateAssessment>>, TError, {
    id: number;
    data: BodyType<UpdateAssessmentBody>;
}, TContext>;
/**
 * @summary Complete an assessment and generate scores and recommendations
 */
export declare const getCompleteAssessmentUrl: (id: number) => string;
export declare const completeAssessment: (id: number, options?: RequestInit) => Promise<Assessment>;
export declare const getCompleteAssessmentMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof completeAssessment>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof completeAssessment>>, TError, {
    id: number;
}, TContext>;
export type CompleteAssessmentMutationResult = NonNullable<Awaited<ReturnType<typeof completeAssessment>>>;
export type CompleteAssessmentMutationError = ErrorType<unknown>;
/**
 * @summary Complete an assessment and generate scores and recommendations
 */
export declare const useCompleteAssessment: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof completeAssessment>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof completeAssessment>>, TError, {
    id: number;
}, TContext>;
/**
 * @summary Get global dashboard statistics
 */
export declare const getGetDashboardStatsUrl: () => string;
export declare const getDashboardStats: (options?: RequestInit) => Promise<DashboardStats>;
export declare const getGetDashboardStatsQueryKey: () => readonly ["/api/dashboard/stats"];
export declare const getGetDashboardStatsQueryOptions: <TData = Awaited<ReturnType<typeof getDashboardStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDashboardStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getDashboardStats>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetDashboardStatsQueryResult = NonNullable<Awaited<ReturnType<typeof getDashboardStats>>>;
export type GetDashboardStatsQueryError = ErrorType<unknown>;
/**
 * @summary Get global dashboard statistics
 */
export declare function useGetDashboardStats<TData = Awaited<ReturnType<typeof getDashboardStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDashboardStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get longitudinal progress data for a patient
 */
export declare const getGetPatientProgressUrl: (id: number) => string;
export declare const getPatientProgress: (id: number, options?: RequestInit) => Promise<PatientProgress>;
export declare const getGetPatientProgressQueryKey: (id: number) => readonly [`/api/patients/${number}/progress`];
export declare const getGetPatientProgressQueryOptions: <TData = Awaited<ReturnType<typeof getPatientProgress>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPatientProgress>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getPatientProgress>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetPatientProgressQueryResult = NonNullable<Awaited<ReturnType<typeof getPatientProgress>>>;
export type GetPatientProgressQueryError = ErrorType<unknown>;
/**
 * @summary Get longitudinal progress data for a patient
 */
export declare function useGetPatientProgress<TData = Awaited<ReturnType<typeof getPatientProgress>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPatientProgress>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get the most recent completed assessment for a patient
 */
export declare const getGetLatestAssessmentUrl: (id: number) => string;
export declare const getLatestAssessment: (id: number, options?: RequestInit) => Promise<Assessment>;
export declare const getGetLatestAssessmentQueryKey: (id: number) => readonly [`/api/patients/${number}/latest-assessment`];
export declare const getGetLatestAssessmentQueryOptions: <TData = Awaited<ReturnType<typeof getLatestAssessment>>, TError = ErrorType<void>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getLatestAssessment>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getLatestAssessment>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetLatestAssessmentQueryResult = NonNullable<Awaited<ReturnType<typeof getLatestAssessment>>>;
export type GetLatestAssessmentQueryError = ErrorType<void>;
/**
 * @summary Get the most recent completed assessment for a patient
 */
export declare function useGetLatestAssessment<TData = Awaited<ReturnType<typeof getLatestAssessment>>, TError = ErrorType<void>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getLatestAssessment>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get summary of patients by risk level
 */
export declare const getGetRiskSummaryUrl: () => string;
export declare const getRiskSummary: (options?: RequestInit) => Promise<RiskSummary>;
export declare const getGetRiskSummaryQueryKey: () => readonly ["/api/risk-summary"];
export declare const getGetRiskSummaryQueryOptions: <TData = Awaited<ReturnType<typeof getRiskSummary>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getRiskSummary>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getRiskSummary>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetRiskSummaryQueryResult = NonNullable<Awaited<ReturnType<typeof getRiskSummary>>>;
export type GetRiskSummaryQueryError = ErrorType<unknown>;
/**
 * @summary Get summary of patients by risk level
 */
export declare function useGetRiskSummary<TData = Awaited<ReturnType<typeof getRiskSummary>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getRiskSummary>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export {};
//# sourceMappingURL=api.d.ts.map