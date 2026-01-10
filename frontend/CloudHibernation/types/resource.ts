export type PolicyStatus =
    | 'healthy'
    | 'warning'
    | 'approval-required'
    | 'auto-stopped'
    | 'stopped'
    | 'never-stop';

export type Resource = {
    id: string;
    type: string;
    cpu: number;
    idle_minutes: number;
    state: 'running' | 'stopped';
    policy_status: PolicyStatus;
};
