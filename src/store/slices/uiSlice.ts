import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ViewerLayout = '1x2' | '2x2';

interface UIState {
    viewerLayout: ViewerLayout;
}

const initialState: UIState = {
    viewerLayout: '1x2',
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        setViewerLayout: (state, action: PayloadAction<ViewerLayout>) => {
            state.viewerLayout = action.payload;
        },
    },
});

export const { setViewerLayout } = uiSlice.actions;
export default uiSlice.reducer;
