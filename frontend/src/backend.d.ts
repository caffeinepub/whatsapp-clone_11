import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface ProfileData {
    username: string;
    registrationTime: Time;
    profile?: UserProfile;
}
export interface UserProfile {
    username: string;
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    authenticateUser(username: string, password: string): Promise<boolean>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getPublicUserProfile(user: Principal): Promise<ProfileData | null>;
    getUserProfile(user: Principal): Promise<ProfileData | null>;
    isCallerAdmin(): Promise<boolean>;
    registerUser(username: string, password: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchUsersByPrefix(prefix: string): Promise<Array<string>>;
}
