export interface IIssue {
    title: string
    description : string
    type: string
    status: string
    reporter_id: string | number
}

export interface IReporter {
    id: number
    name: string
    role: string
}

export interface IIssueResponse {
    id: number
    title: string
    description: string
    type: string
    status: string
    reporter: IReporter
    created_at: string
    updated_at: string
}