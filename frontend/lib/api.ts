import axios from "axios"

const API = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
    headers: {
        "Content-Type": "application/json",
    },
})

// Upload Document
export const uploadDocument = async (file: File) => {
    const formData = new FormData()
    formData.append("file", file)

    const res = await API.post("/ingest", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    })

    return res.data
}

// Ask Question
export const askQuestion = async (query: string) => {
    const res = await API.post("/chat", { query })
    return res.data
}

// Dashboard Data
export const getDashboard = async () => {
    const res = await API.get("/dashboard")
    return res.data
}

// Vendors List
export const getVendors = async () => {
    const res = await API.get("/vendors")
    return res.data
}

// Generate RFQ
export const generateRFQ = async (requirement: string) => {
    const res = await API.post("/rfq", { requirement })
    return res.data
}