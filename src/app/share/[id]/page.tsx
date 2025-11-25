import { Download, AlertCircle } from 'lucide-react';

interface SharePageProps {
  searchParams: {
    file: string;
    type: string;
    appName?: string;
    appVersion?: string;
  };
}

export default function SharePage({ searchParams }: SharePageProps) {
  const { file, type, appName, appVersion } = searchParams;

  if (!file || !type) {
    return (
      <div className="max-w-md mx-auto p-6 bg-base-100 rounded-lg shadow-xl">
        <div className="alert alert-error flex items-center">
          <AlertCircle className="mr-2 text-error" size={20} />
          <span className="text-error-content text-sm">Invalid share link</span>
        </div>
      </div>
    );
  }

  const decodedFileUrl = decodeURIComponent(file);
  const decodedAppName = appName ? decodeURIComponent(appName) : 'Unknown App';
  const decodedAppVersion = appVersion ? decodeURIComponent(appVersion) : 'Unknown Version';

  return (
    <div className="max-w-md mx-auto p-6 bg-base-100 rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold mb-4 flex items-center">
        <Download className="mr-2" size={24} />
        Install {decodedAppName}
      </h2>
      <div className="mb-6">
        <p className="text-base-content/70">
          <strong>App Name:</strong> {decodedAppName}
        </p>
        <p className="text-base-content/70">
          <strong>Version:</strong> {decodedAppVersion}
        </p>
        <p className="text-base-content/70">
          <strong>Platform:</strong> {type === 'android' ? 'Android (APK)' : 'iOS (IPA)'}
        </p>
      </div>

      <div className="alert alert-info flex flex-col items-start p-4">
        {type === 'android' ? (
          <>
            <h3 className="font-bold text-info mb-2">Install on Android</h3>
            <p className="text-sm text-info-content mb-4">
              1. Download the APK file.
              <br />
              2. Enable "Install from Unknown Sources" in your device settings (Settings {'>'} Security).
              <br />
              3. Open the downloaded file to install.
            </p>
            <a
              href={decodedFileUrl}
              download
              className="btn btn-primary w-full flex items-center justify-center"
            >
              <Download size={16} className="mr-2" />
              Download APK
            </a>
          </>
        ) : (
          <>
            <h3 className="font-bold text-info mb-2">Install on iOS</h3>
            <p className="text-sm text-info-content mb-4">
              1. Download the IPA file.
              <br />
              2. Install via a tool like AltStore, Sideloadly, or an MDM solution.
              <br />
              3. Trust the developer in Settings {'>'} General {'>'} VPN & Device Management.
            </p>
            <a
              href={decodedFileUrl}
              download
              className="btn btn-primary w-full flex items-center justify-center"
            >
              <Download size={16} className="mr-2" />
              Download IPA
            </a>
          </>
        )}
      </div>
    </div>
  );
}