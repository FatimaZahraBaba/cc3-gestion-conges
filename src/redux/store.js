import { configureStore, createSlice } from "@reduxjs/toolkit";

const initialState = {
    managers: [
        {
            id: 1,
            username: "Aya",
            password: "123456",
            employees: [
                { id: 1, name: "Omar Kamali" },
                { id: 2, name: "Youssef Ennaciri" },
                { id: 4, name: "Ziyad Gout" },
            ],
        },
        {
            id: 2,
            username: "Fatima Zahra",
            password: "123456",
            employees: [
                { id: 3, name: "Fatima Alaoui" },
                { id: 5, name: "Farah BABA" },
            ],
        },
    ],
    currentManager: null,
    leaveRequests: [
        { id: 1, employee_id: 1, status: "En attente", manager_id: 1, start: '2025-02-25', end: '2025-02-28' },
        { id: 2, employee_id: 2, status: "Approuvé", manager_id: 1, start: '2025-03-02', end: '2025-03-10' },
        { id: 3, employee_id: 3, status: "Refusé", manager_id: 2, start: '2025-03-12', end: '2025-03-20' },
        { id: 4, employee_id: 4, status: "En attente", manager_id: 1, start: '2025-04-05', end: '2025-04-20' },
        { id: 5, employee_id: 5, status: "En attente", manager_id: 2, start: '2025-04-10', end: '2025-04-25' },
    ],
};

const leaveSlice = createSlice({
    name: "leaveManagement",
    initialState,
    reducers: {
        setManager: (state, action) => {
            const manager = state.managers.find((mgr) => mgr.id === action.payload.id);
            if (manager) {
                state.currentManager = manager;
            }
        },
        addLeaveRequest: (state, action) => {
            state.leaveRequests.push(action.payload);
        },
        updateLeaveRequest: (state, action) => {
            state.leaveRequests = state.leaveRequests.map((req) => {
                if (req.id === action.payload.id) {
                    return { ...req, ...action.payload };
                }
                return req;
            });
        },
    },
});

export const { setManager, addLeaveRequest, updateLeaveRequest } = leaveSlice.actions;

const store = configureStore({
    reducer: {
        leave: leaveSlice.reducer,
    },
});

export default store;
