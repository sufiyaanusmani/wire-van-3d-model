import { Html, useProgress } from '@react-three/drei';

export interface LoadingIndicatorProps {
  /**
   * The message to display below the loading percentage
   */
  message?: string;
}

/**
 * A loading indicator component for use in React Three Fiber scenes
 * Shows a spinner with loading progress percentage
 */
export function LoadingIndicator({ message = "Preparing your 3D scene..." }: LoadingIndicatorProps) {
  const { progress } = useProgress();
  
  return (
    <Html center>
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4 animate-spin"></div>
        <div className="text-lg font-medium">Loading {progress.toFixed(0)}%</div>
        <div className="mt-2 text-sm text-muted-foreground">{message}</div>
      </div>
    </Html>
  );
}