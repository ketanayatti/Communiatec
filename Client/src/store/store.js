import { create } from "zustand";
import { createAuthSlice } from "./slices/authSlice";
import {createChatSlice} from "./slices/chatSlice";
import { createSettingSlice } from "./slices/settingSlice";

export const useStore = create()((...a) => ({
    ...createAuthSlice(...a),
    ...createChatSlice(...a),
    ...createSettingSlice(...a)
}))