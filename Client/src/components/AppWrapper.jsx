import React, { useState, useEffect } from "react";
import { useStore } from "@/store/store";
import {
  onMaintenanceModeChange,
  checkMaintenanceStatus,
} from "@/lib/apiClient";
import MaintenanceScreen from "@/components/MaintenanceScreen";
import PinSetup from "@/components/ui/PinSetup";
import PinVerify from "@/components/ui/PinVerify";
/**
 * AppWrapper
 * Wrap your <App /> with this component in main.jsx to automatically handle
 * displaying a maintenance page for non-admin users while allowing admins
 * (and the login/auth endpoints) to continue using the app.
 */
const AppWrapper = ({ children }) => {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [isCheckingMaintenance, setIsCheckingMaintenance] = useState(true);
  const { userInfo } = useStore();
  const [pinMode, setPinMode] = useState("none");
  useEffect(() => {
    // Subscribe to server-sent maintenance mode updates (e.g. via websockets)
    const unsubscribe = onMaintenanceModeChange((maintenanceEnabled) => {
      console.log("🔧 Maintenance mode changed:", maintenanceEnabled);
      setIsMaintenanceMode(maintenanceEnabled);
      setIsCheckingMaintenance(false);
    }); // Perform an immediate status check on mount
    const checkInitialStatus = async () => {
      try {
        const status = await checkMaintenanceStatus();
        if (status) {
          setIsMaintenanceMode(status.maintenanceMode);
        }
      } catch (error) {
        console.error("Error checking initial maintenance status:", error);
      } finally {
        setIsCheckingMaintenance(false);
      }
    };
    checkInitialStatus(); // Cleanup subscription when unmounting
    return unsubscribe;
  }, []); // Re-check maintenance mode whenever authentication state changes
  useEffect(() => {
    if (userInfo && userInfo.role !== "admin") {
      (async () => {
        const status = await checkMaintenanceStatus();
        if (status) {
          setIsMaintenanceMode(status.maintenanceMode);
        }
      })();
    }

    // PIN flow: determine whether to force PIN setup or verify for this user
    try {
      if (userInfo) {
        const userId = userInfo._id || userInfo.id;
        const pinKey = `communiatec_pin_${userId}`;
        const stored = localStorage.getItem(pinKey);
        const verifiedKey = `communiatec_pin_verified_${userId}`;
        const sessionVerified = sessionStorage.getItem(verifiedKey) === "true";

        if (!stored) {
          setPinMode("setup");
        } else if (!sessionVerified) {
          setPinMode("verify");
        } else {
          setPinMode("none");
        }
      } else {
        setPinMode("none");
      }
    } catch (err) {
      console.error("PIN flow init error:", err);
      setPinMode("none");
    }
  }, [userInfo]); // Loading state while first determining maintenance status
  if (isCheckingMaintenance) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
               {" "}
        <div className="text-center">
                   {" "}
          <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-slate-400">Loading...</p>       {" "}
        </div>
             {" "}
      </div>
    );
  }
  // If maintenance mode is ON and the current user is NOT an admin, show banner
  const isAdmin = userInfo?.role === "admin";

  if (isMaintenanceMode && userInfo && !isAdmin) {
    return <MaintenanceScreen />;
  }

  // PIN gating: while user must setup or verify PIN, show the relevant UI
  if (pinMode === "setup") {
    return <PinSetup onFinish={() => setPinMode("none")} userInfo={userInfo} />;
  }
  if (pinMode === "verify") {
    return (
      <PinVerify onFinish={() => setPinMode("none")} userInfo={userInfo} />
    );
  }

  // Otherwise render normal application
  return <>{children}</>;
};
export default AppWrapper;
