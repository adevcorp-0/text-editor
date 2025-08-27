import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    selectedStyle: null,
    defaultText: "Hello World",
};

const editorSlice = createSlice({
    name: "editor",
    initialState,
    reducers: {
        setStyle: (state, action) => {
            state.selectedStyle = action.payload;
        },
        clearStyle: (state) => {
            state.selectedStyle = null;
        },
        setDefaultText: (state, action) => {
            state.defaultText = action.payload;
        },
        clearDefaultText: (state) => {
            state.defaultText = "Hello World";
        },
    },
});

export const { setStyle, clearStyle, setDefaultText, clearDefaultText } = editorSlice.actions;
export default editorSlice.reducer;
