import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "@/store/store";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Shield, Users, Settings as SettingsIcon, AlertTriangle, CheckCircle, Info } from "lucide-react";

const Settings = () => {
  const navigate = useNavigate();
  const { userInfo, fetchSettings, settings, updateSettings, loadingSettings } = useStore();
  const [localSettings, setLocalSettings] = useState(null);
  const [saving, setSaving] = useState(false);
  const [testingMaintenance, setTestingMaintenance] = useState(false);

  useEffect(() => {
    if (!userInfo || userInfo.role !== "admin") {
      toast.error("Access denied. Admin privileges required.");
      navigate("/chat");
    } else if (!settings && !loadingSettings) {
      fetchSettings();
    }
  }, [userInfo, settings, loadingSettings, fetchSettings, navigate]);

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const handleToggle = (key) => {
    setLocalSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    if (!localSettings) return;
    setSaving(true);
    
    try {
      const { success } = await updateSettings(localSettings);
      setSaving(false);
      
      if (success) {
        toast.success("Settings updated successfully");
        
        // Special message for maintenance mode changes
        if (localSettings.maintenanceMode !== settings.maintenanceMode) {
          const modeText = localSettings.maintenanceMode ? "enabled" : "disabled";
          toast.info(`Maintenance mode has been ${modeText}`, {
            description: localSettings.maintenanceMode 
              ? "Only admin users can access the application now."
              : "All users can now access the application normally.",
          });
        }
      } else {
        toast.error("Failed to update settings");
      }
    } catch (error) {
      setSaving(false);
      toast.error("Error saving settings");
      console.error("Settings save error:", error);
    }
  };

  const testMaintenanceMode = async () => {
    if (!localSettings) return;
    
    setTestingMaintenance(true);
    try {
      // Test endpoint to verify maintenance mode is working
      const response = await fetch('/api/test/public', {
        credentials: 'include'
      });
      
      if (response.status === 503) {
        toast.success("✅ Maintenance mode is working correctly");
        toast.info("Non-admin users will see maintenance screen");
      } else if (response.ok) {
        toast.warning("⚠️ Maintenance mode may not be active");
      } else {
        toast.error("❌ Error testing maintenance mode");
      }
    } catch (error) {
      toast.error("Network error while testing maintenance mode");
    } finally {
      setTestingMaintenance(false);
    }
  };

  if (loadingSettings || !localSettings) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="text-center">
          <Loader2 className="animate-spin w-8 h-8 text-cyan-400 mx-auto mb-4" />
          <p className="text-slate-400">Loading system settings...</p>
        </div>
      </div>
    );
  }

  const hasUnsavedChanges = settings && JSON.stringify(localSettings) !== JSON.stringify(settings);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-cyan-500/20 rounded-xl">
              <SettingsIcon className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">System Settings</h1>
              <p className="text-slate-400 mt-1">Manage application-wide configuration</p>
            </div>
          </div>

          {/* Unsaved Changes Alert */}
          {hasUnsavedChanges && (
            <Alert className="border-yellow-500/50 bg-yellow-500/10">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <AlertDescription className="text-yellow-200">
                You have unsaved changes. Remember to save your settings.
              </AlertDescription>
            </Alert>
          )}

          {/* Current Status */}
          <Card className="bg-slate-900 text-slate-400 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Info className="w-5 h-5 text-slate-400" />
                Current System Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-1 gap-4">
                <div className="flex items-center gap-3">
                  {localSettings.maintenanceMode ? (
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  <div>
                    <p className="font-medium">
                      {localSettings.maintenanceMode ? "Maintenance Mode" : "Normal Operation"}
                    </p>
                    <p className="text-sm text-slate-400">
                      {localSettings.maintenanceMode ? "Admin only access" : "All users can access"}
                    </p>
                  </div>
                </div>
                

                

              </div>
            </CardContent>
          </Card>

          {/* Maintenance Mode */}
          <Card className="bg-slate-900 text-slate-400 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Maintenance Mode
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="max-w-md">
                  <p className="font-medium mb-1">Enable Maintenance Mode</p>
                  <p className="text-slate-400 text-sm">
                    When enabled, only admin users can access the application. 
                    Regular users will see a maintenance screen.
                  </p>
                </div>
                <Switch
                  checked={localSettings.maintenanceMode}
                  onCheckedChange={() => handleToggle("maintenanceMode")}
                />
              </div>
              
              {localSettings.maintenanceMode && (
                <Alert className="border-orange-500/50 bg-orange-500/10">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <AlertDescription className="text-orange-200">
                    <strong>Warning:</strong> Maintenance mode is enabled. Only admin users can access the application.
                    <Button
                      variant="link"
                      size="sm"
                      className="text-orange-300 hover:text-orange-200 p-0 ml-2 h-auto"
                      onClick={testMaintenanceMode}
                      disabled={testingMaintenance}
                    >
                      {testingMaintenance ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin mr-1" />
                          Testing...
                        </>
                      ) : (
                        "Test maintenance mode"
                      )}
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>


          {/* Additional settings cards can be added here */}

          {/* Save Button */}
          <div className="flex justify-between items-center pt-4">
            <div className="text-sm text-slate-400">
              {hasUnsavedChanges ? (
                "You have unsaved changes"
              ) : (
                "All changes are saved"
              )}
            </div>
            
            <Button
              disabled={saving || !hasUnsavedChanges}
              onClick={handleSave}
              className="bg-cyan-600 hover:bg-cyan-700 px-8"
              size="lg"
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin w-4 h-4 mr-2" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;