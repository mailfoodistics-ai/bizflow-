import { useState, useEffect } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { updateService, type AppVersion } from "@/lib/update-service";
import { Download, AlertCircle } from "lucide-react";

interface UpdateNotificationProps {
  onUpdateComplete?: () => void;
}

export function UpdateNotification({ onUpdateComplete }: UpdateNotificationProps) {
  const [open, setOpen] = useState(false);
  const [latestVersion, setLatestVersion] = useState<AppVersion | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(false);

  // Start checking for updates on mount
  useEffect(() => {
    const stopCheck = updateService.startPeriodicCheck((version) => {
      setLatestVersion(version);
      setForceUpdate(version.forceUpdate);
      setOpen(true);
    });

    return stopCheck;
  }, []);

  const handleUpdate = async () => {
    try {
      setIsUpdating(true);
      await updateService.performUpdate();
      onUpdateComplete?.();
    } catch (error) {
      console.error("Update failed:", error);
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    if (!forceUpdate) {
      setOpen(false);
    }
    // If forceUpdate is true, user cannot dismiss the dialog
  };

  if (!latestVersion) return null;

  return (
    <AlertDialog open={open} onOpenChange={(newOpen) => !forceUpdate && setOpen(newOpen)}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <AlertDialogTitle className="text-lg font-semibold">App Update Available</AlertDialogTitle>
          </div>
        </AlertDialogHeader>

        <AlertDialogDescription className="space-y-3">
          <div>
            <p className="font-medium text-foreground">
              Version {latestVersion.version}
              {forceUpdate && <span className="ml-2 inline-block px-2 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-xs rounded font-semibold">Required</span>}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Released: {new Date(latestVersion.releaseDate).toLocaleDateString()}</p>
          </div>

          {latestVersion.releaseNotes && (
            <div>
              <p className="text-sm font-medium text-foreground mb-2">What's New:</p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-4">{latestVersion.releaseNotes}</p>
            </div>
          )}

          {forceUpdate && (
            <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-yellow-700 dark:text-yellow-600">This is a required update. You cannot continue using the app without updating.</p>
            </div>
          )}
        </AlertDialogDescription>

        <AlertDialogFooter>
          {!forceUpdate && (
            <AlertDialogCancel disabled={isUpdating} className="sm:w-auto">
              {isUpdating ? "Updating..." : "Update Later"}
            </AlertDialogCancel>
          )}
          <AlertDialogAction onClick={handleUpdate} disabled={isUpdating} className="bg-blue-600 hover:bg-blue-700 text-white sm:w-auto">
            {isUpdating ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Updating...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Update Now
              </div>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
